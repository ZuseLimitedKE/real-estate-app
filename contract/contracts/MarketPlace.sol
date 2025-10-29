// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./system-contracts/hedera-token-service/IHederaTokenService.sol";
import "./system-contracts/hedera-token-service/HederaTokenService.sol";

contract MarketPlace is EIP712, Ownable, ReentrancyGuard, HederaTokenService {
    using ECDSA for bytes32;

    IHederaTokenService public constant HTS =
        IHederaTokenService(address(0x167));

    address public usdcToken; // HTS address for USDC
    address public feeCollector;
    uint256 public feeBps;
    // Order typehashes
    bytes32 public constant BUY_ORDER_TYPEHASH =
        keccak256(
            "BuyOrder(address maker,address propertyToken,uint256 remainingAmount,uint256 pricePerShare,uint256 expiry,uint256 nonce)"
        );
    bytes32 public constant SELL_ORDER_TYPEHASH =
        keccak256(
            "SellOrder(address maker,address propertyToken,uint256 remainingAmount,uint256 pricePerShare,uint256 expiry,uint256 nonce)"
        );
    // Track remaining quantity per order (maker => nonce => remaining)
    mapping(address => mapping(uint256 => uint256)) public remaining;
    mapping(address => mapping(uint256 => bool)) public cancelled;
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
        uint256 filled,
        uint256 pricePerShare,
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
        uint256 remainingAmount;
        uint256 pricePerShare;
        uint256 expiry;
        uint256 nonce;
    }
    struct SellOrder {
        address maker;
        address propertyToken;
        uint256 remainingAmount;
        uint256 pricePerShare;
        uint256 expiry;
        uint256 nonce;
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

    function tokenAssociate(address tokenId) external {
        int response = HederaTokenService.associateToken(
            address(this),
            tokenId
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Associate Failed");
        }
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
        int rc = HederaTokenService.transferToken(
            token,
            msg.sender,
            address(this),
            int64(int256(amount))
        );
        if (rc != HederaResponseCodes.SUCCESS) {
            revert("HTS transfer failed");
        }
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
        int256 rc = HederaTokenService.transferToken(
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

    function settle(
        BuyOrder calldata buy,
        SellOrder calldata sell
    ) external nonReentrant {
        _validateOrders(buy, sell);
        // _verifySignatures(buy, buySig, sell, sellSig);

        (
            uint256 fill,
            uint256 executionPrice,
            uint256 totalNotional,
            uint256 fee,
            uint256 sellerProceeds
        ) = _determineTrade(buy, sell);

        _checkEscrow(buy, sell, fill, totalNotional);

        _updateBalances(buy, sell, fill, totalNotional, fee, sellerProceeds);

        _performTransfers(
            buy,
            sell,
            fill,
            executionPrice,
            totalNotional,
            fee,
            sellerProceeds
        );
    }

    function _validateOrders(
        BuyOrder calldata buy,
        SellOrder calldata sell
    ) internal view {
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
    }

    function _verifySignatures(
        BuyOrder calldata buy,
        bytes calldata buySig,
        SellOrder calldata sell,
        bytes calldata sellSig
    ) internal view {
        bytes32 buyDigest = _hashBuyOrder(buy);
        bytes32 sellDigest = _hashSellOrder(sell);
        if (_recover(sellDigest, sellSig) != sell.maker) {
            revert("invalid sell sig");
        }
        if (_recover(buyDigest, buySig) != buy.maker) {
            revert("invalid buy sig");
        }
    }

    function _determineTrade(
        BuyOrder calldata buy,
        SellOrder calldata sell
    )
        internal
        view
        returns (
            uint256 fill,
            uint256 executionPrice,
            uint256 totalNotional,
            uint256 fee,
            uint256 sellerProceeds
        )
    {
        uint256 buyRemain = remaining[buy.maker][buy.nonce];
        uint256 sellRemain = remaining[sell.maker][sell.nonce];
        require(
            buyRemain > 0 && sellRemain > 0,
            "order not initialized or already filled"
        );

        fill = buyRemain < sellRemain ? buyRemain : sellRemain;
        require(fill > 0, "nothing to fill");

        // (, bool buyerKyc) = HTS.isKyc(buy.propertyToken, buy.maker);
        // require(buyerKyc, "buyer not kyc");

        // (, bool sellerKyc) = HTS.isKyc(sell.propertyToken, sell.maker);
        // require(sellerKyc, "seller not kyc");

        executionPrice = sell.pricePerShare;
        totalNotional = uint256(fill) * executionPrice;
        fee = (totalNotional * feeBps) / 10000;
        sellerProceeds = totalNotional - fee;
    }

    function _checkEscrow(
        BuyOrder calldata buy,
        SellOrder calldata sell,
        uint256 fill,
        uint256 totalNotional
    ) internal view {
        require(
            escrowBalances[usdcToken][buy.maker] >= totalNotional,
            "buyer insufficient USDC escrow"
        );
        require(
            escrowBalances[buy.propertyToken][sell.maker] >= fill,
            "seller insufficient property escrow"
        );
    }

    function _updateBalances(
        BuyOrder calldata buy,
        SellOrder calldata sell,
        uint256 fill,
        uint256 totalNotional,
        uint256 fee,
        uint256 sellerProceeds
    ) internal {
        remaining[buy.maker][buy.nonce] -= fill;
        remaining[sell.maker][sell.nonce] -= fill;

        escrowBalances[buy.propertyToken][sell.maker] -= fill;
        escrowBalances[buy.propertyToken][buy.maker] += fill;

        escrowBalances[usdcToken][buy.maker] -= totalNotional;
        escrowBalances[usdcToken][sell.maker] += sellerProceeds;

        if (fee > 0) {
            escrowBalances[usdcToken][feeCollector] += fee;
        }
    }

    function _performTransfers(
        BuyOrder calldata buy,
        SellOrder calldata sell,
        uint256 fill,
        uint256 executionPrice,
        uint256 totalNotional,
        uint256 fee,
        uint256 sellerProceeds
    ) internal {
        int256 rc1 = HederaTokenService.transferToken(
            buy.propertyToken,
            address(this),
            buy.maker,
            int64(uint64(fill))
        );
        require(rc1 == 22 || rc1 == 0, "property transfer failed");

        int256 rc2 = HederaTokenService.transferToken(
            usdcToken,
            address(this),
            sell.maker,
            int64(uint64(sellerProceeds))
        );
        require(rc2 == 22 || rc2 == 0, "USDC transfer to seller failed");

        if (fee > 0) {
            int256 rc3 = HederaTokenService.transferToken(
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

    /* Helper getters for tests / off-chain callers */
    function getRemaining(
        address maker,
        uint64 nonce
    ) external view returns (uint256) {
        return remaining[maker][nonce];
    }

    function getEscrowBalance(
        address token,
        address account
    ) external view returns (uint256) {
        return escrowBalances[token][account];
    }

    function isCancelled(
        address maker,
        uint64 nonce
    ) external view returns (bool) {
        return cancelled[maker][nonce];
    }

    function getFeeBps() external view returns (uint256) {
        return feeBps;
    }

    function getFeeCollector() external view returns (address) {
        return feeCollector;
    }

    function getUSDC() external view returns (address) {
        return usdcToken;
    }

    receive() external payable {}
}
