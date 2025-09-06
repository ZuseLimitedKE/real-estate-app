// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

error Unauthorized(address caller);
error InvalidInput(string reason);
error PropertyAlreadyExists(string propertyId);

contract RealEstateManager is ERC1155 {
    address immutable _admin;
    uint256 private currentTokenID;

    constructor () ERC1155("") {
        _admin = msg.sender;
        currentTokenID = 0;
    }

    struct Property {
        string id;
        string name;
        uint256 numTokens;
        address agentAddress;
        uint256 timeCreated;
        string propertyAddress;
        uint256 tokenID;
        uint8 serviceFee;
        string tokenSymbol;
    }

    mapping(string => Property) public properties;

    // A function for registering a property only callable by admin
    function registerProperty(
        string calldata id,
        string memory tokenSymbol,
        string calldata name,
        uint256 numTokens,
        address agentAddress,
        uint256 timeCreated,
        string calldata propertyAddress,
        uint8 serviceFee
    ) onlyAdmin external returns(uint256){
        // It should also mint tokens for property (one token for each shilling of value)
        if (bytes(id).length == 0 || bytes(tokenSymbol).length == 0 || bytes(name).length == 0 || bytes(propertyAddress).length == 0) {
            revert InvalidInput("Property id, token symbol, name and property address cannot be empty");
        }

        // If property already exists throw error
        if (bytes(properties[id].id).length != 0) {
            revert PropertyAlreadyExists(id);
        }

        _mint(_admin, currentTokenID, numTokens, "");

        Property memory property = Property({
            id: id,
            name: name,
            numTokens: numTokens,
            agentAddress: agentAddress,
            timeCreated: timeCreated,
            propertyAddress: propertyAddress,
            tokenID: currentTokenID,
            tokenSymbol: tokenSymbol,
            serviceFee: serviceFee
        });

        properties[id] = property;
        currentTokenID++;
        return currentTokenID - 1;
    }

    modifier onlyAdmin() {
        if (msg.sender != _admin) {
            revert Unauthorized(msg.sender);
        }

        _;
    }
}