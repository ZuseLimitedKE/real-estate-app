// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./system-contracts/hedera-token-service/IHederaTokenService.sol";

contract MarketPlace is EIP712, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    IHederaTokenService public constant HTS =
        IHederaTokenService(
            address(0x0000000000000000000000000000000000000167)
        );

    address public usdcToken; // HTS address for USDC
    address public feeCollector;
    uint256 public feeBps;
    // Order typehashes
    bytes32 public constant BUY_ORDER_TYPEHASH =
        keccak256(
            "BuyOrder(address maker,address propertyToken,uint64 remainingAmount,uint64 pricePerShare,uint64 expiry,uint64 nonce)"
        );
    bytes32 public constant SELL_ORDER_TYPEHASH =
        keccak256(
            "SellOrder(address maker,address propertyToken,uint64 remainingAmount,uint64 pricePerShare,uint64 expiry,uint64 nonce)"
        );
    // Track remaining quantity per order (maker => nonce => remaining)
    mapping(address => mapping(uint64 => uint64)) public remaining;
    mapping(address => mapping(uint64 => bool)) public cancelled;
    // Escrow balances held by contract (token => account => amount)
    mapping(address => mapping(address => uint256)) public escrowBalances; // fungible token balances

    event Deposited(
        address indexed account,
        address indexed token,
        uint256 amount
    );
    event Withdrawn(
        address indexed account,
        address indexed token,
        uint256 amount
    );
    event TradeExecuted(
        address indexed buyer,
        address indexed seller,
        address indexed propertyToken,
        uint64 filled,
        uint64 pricePerShare,
        uint256 totalNotional,
        uint256 fee
    );
    event OrderCancelled(address indexed maker, uint64 nonce);

    constructor(
        address _initialOwner,
        address _usdcToken,
        address _feeCollector,
        uint256 _feeBps
    ) EIP712("AtriaMarketPlace", "1.0.0") Ownable(_initialOwner) {
        require(_initialOwner != address(0), "Invalid initial owner");
        require(_usdcToken != address(0), "Invalid USDC token");
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_feeBps <= 10000, "Fee basis points too high"); // Max 100%
        usdcToken = _usdcToken;
        feeCollector = _feeCollector;
        feeBps = _feeBps;
    }
    /*Order helpers */
    struct BuyOrder {
        address maker;
        address propertyToken;
        uint64 remainingAmount;
        uint64 pricePerShare;
        uint64 expiry;
        uint64 nonce;
    }
    struct SellOrder {
        address maker;
        address propertyToken;
        uint64 remainingAmount;
        uint64 pricePerShare;
        uint64 expiry;
        uint64 nonce;
    }
    function _hashBuyOrder(BuyOrder memory o) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        BUY_ORDER_TYPEHASH,
                        o.maker,
                        o.propertyToken,
                        o.remainingAmount,
                        o.pricePerShare,
                        o.expiry,
                        o.nonce
                    )
                )
            );
    }
    function _hashSellOrder(
        SellOrder memory o
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        SELL_ORDER_TYPEHASH,
                        o.maker,
                        o.propertyToken,
                        o.remainingAmount,
                        o.pricePerShare,
                        o.expiry,
                        o.nonce
                    )
                )
            );
    }
    function _recover(
        bytes32 digest,
        bytes memory sig
    ) internal pure returns (address) {
        return ECDSA.recover(digest, sig);
    }
    /**Escrow functions */
    /**
     * Deposit tokens into the escrow
     * @param token The address of the token to deposit
     * @param amount The amount of tokens to deposit
     */
    function depositToken(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        int256 rc = HTS.transferToken(
            token,
            msg.sender,
            address(this),
            int64(int256(amount))
        );
        require(rc == 22 || rc == 0, "HTS transfer failed");
        escrowBalances[token][msg.sender] += amount;
        emit Deposited(msg.sender, token, amount);
    }
    /**
     * Withdraw tokens from the escrow
     * @param token The address of the token to withdraw
     * @param amount The amount of tokens to withdraw
     */
    function withdrawToken(
        address token,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "zero amount");
        require(
            escrowBalances[token][msg.sender] >= amount,
            "insufficient escrow balance"
        );
        escrowBalances[token][msg.sender] -= amount;
        int256 rc = HTS.transferToken(
            token,
            address(this),
            msg.sender,
            int64(int256(amount))
        );
        require(rc == 22 || rc == 0, "HTS transfer failed");
        emit Withdrawn(msg.sender, token, amount);
    }
    /**
     * Initialize a buy order
     * @param nonce Unique identifier for the order
     * @param amount The amount of property tokens to buy
     * @notice This function initializes a buy order by setting the remaining amount.
     * It does not transfer any tokens or create an order on the blockchain.
     * It is intended to be called before creating a buy order to ensure the user has
     * sufficient balance to fulfill the order.
     */
    function initBuyOrder(
        uint64 nonce,
        address /* _propertyToken */,
        uint64 amount
    ) external {
        require(amount > 0, "zero amount");
        require(remaining[msg.sender][nonce] == 0, "already initialized");
        remaining[msg.sender][nonce] = amount;
    }

    /**
     * Initialize a sell order
     * @param nonce Unique identifier for the order
     * @param propertyToken The address of the property token being sold
     * @param amount The amount of property tokens to sell
     * @notice This function initializes a sell order by setting the remaining amount.
     * It does not transfer any tokens or create an order on the blockchain.
     * It is intended to be called before creating a sell order to ensure the user has
     * deposited the property tokens into escrow.
     */
    function initSellOrder(
        uint64 nonce,
        address propertyToken,
        uint64 amount
    ) external {
        require(amount > 0, "zero amount");
        require(remaining[msg.sender][nonce] == 0, "already initialized");
        // Maker must deposit the property token into escrow first
        require(
            escrowBalances[propertyToken][msg.sender] >= amount,
            "insufficient deposited property tokens"
        );
        remaining[msg.sender][nonce] = amount;
    }
    /**
     * Initialize a cancel order
     * @param nonce Unique identifier for the order
     */
    function cancelOrder(uint64 nonce) external {
        cancelled[msg.sender][nonce] = true;
        emit OrderCancelled(msg.sender, nonce);
    }
    /**
     * Settle a trade between a buyer and a seller
     * @param buy BuyOrder struct containing the details of the buy order
     * @param buySig Signature of the buy order
     * @param sell SellOrder struct containing the details of the sell order
     * @param sellSig Signature of the sell order
     */
    function settle(
        BuyOrder calldata buy,
        bytes calldata buySig,
        SellOrder calldata sell,
        bytes calldata sellSig
    ) external nonReentrant {
        require(buy.propertyToken == sell.propertyToken, "property mismatch");
        require(buy.pricePerShare >= sell.pricePerShare, "price mismatch");
        require(
            block.timestamp <= buy.expiry && block.timestamp <= sell.expiry,
            "order expired"
        );
        require(
            !cancelled[buy.maker][buy.nonce] &&
                !cancelled[sell.maker][sell.nonce],
            "order cancelled"
        );

        // Verify signatures
        bytes32 buyDigest = _hashBuyOrder(buy);
        bytes32 sellDigest = _hashSellOrder(sell);
        require(_recover(buyDigest, buySig) == buy.maker, "invalid buy sig");
        require(
            _recover(sellDigest, sellSig) == sell.maker,
            "invalid sell sig"
        );

        // Ensure orders were initialized on-chain
        uint64 buyRemain = remaining[buy.maker][buy.nonce];
        uint64 sellRemain = remaining[sell.maker][sell.nonce];
        require(
            buyRemain > 0 && sellRemain > 0,
            "order not initialized or already filled"
        );

        // Determine fill amount
        uint64 fill = buyRemain < sellRemain ? buyRemain : sellRemain;
        require(fill > 0, "nothing to fill");

        // Verify both parties are verified and KYC'd
        (, bool buyerKyc) = HTS.isKyc(buy.propertyToken, buy.maker);
        require(buyerKyc, "buyer not kyc");
        
        (, bool sellerKyc) = HTS.isKyc(sell.propertyToken, sell.maker);
        require(sellerKyc, "seller not kyc");

        // Compute totals
        uint256 executionPrice = sell.pricePerShare;
        uint256 totalNotional = uint256(fill) * executionPrice;
        uint256 fee = (totalNotional * feeBps) / 10000;
        uint256 sellerProceeds = totalNotional - fee;

        // Check escrow sufficiency
        require(
            escrowBalances[usdcToken][buy.maker] >=
                totalNotional,
            "buyer insufficient USDC escrow"
        );
        require(
            escrowBalances[buy.propertyToken][sell.maker] >= fill,
            "seller insufficient property escrow"
        );

        // Update remaning balances and escrow before external calls
        remaining[buy.maker][buy.nonce] = buyRemain - fill;
        remaining[sell.maker][sell.nonce] = sellRemain - fill;

        escrowBalances[buy.propertyToken][sell.maker] -= fill;
        escrowBalances[buy.propertyToken][buy.maker] += fill; // credit property to buyer in escrow

        escrowBalances[usdcToken][buy.maker] -= totalNotional;
        escrowBalances[usdcToken][sell.maker] += sellerProceeds;
        if (fee > 0) {
            escrowBalances[usdcToken][feeCollector] += fee;
        }

        // Optionally, immediately release to participants (transfer out of escrow to their accounts)
        // Here we transfer property shares (contract -> buyer) and USDC (contract -> seller) using HTS transfer
        int256 rc1 = HTS.transferToken(
            buy.propertyToken,
            address(this),
            buy.maker,
            int64(uint64(fill))
        );
        require(rc1 == 22 || rc1 == 0, "property transfer failed");

        int256 rc2 = HTS.transferToken(
            usdcToken,
            address(this),
            sell.maker,
            int64(uint64(sellerProceeds))
        );
        require(rc2 == 22 || rc2 == 0, "USDC transfer to seller failed");

        if (fee > 0) {
            int256 rc3 = HTS.transferToken(
                usdcToken,
                address(this),
                feeCollector,
                int64(uint64(fee))
            );
            require(rc3 == 22 || rc3 == 0, "fee transfer failed");
        }
        emit TradeExecuted(
            buy.maker,
            sell.maker,
            buy.propertyToken,
            fill,
            uint64(executionPrice),
            totalNotional,
            fee
        );
    }

    function setFeeCollector(address fc) external onlyOwner {
        feeCollector = fc;
    }
    function setFeeBps(uint256 bps) external onlyOwner {
        feeBps = bps;
    }
    function setUSDC(address token) external onlyOwner {
        usdcToken = token;
    }
}
