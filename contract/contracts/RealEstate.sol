// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

error Unauthorized(address caller);

contract RealEstateManager {
    address immutable _admin;

    constructor () {
        _admin = msg.sender;
    }

    struct Property {
        string id;
        string name;
        uint256 propertyValue;
        address agentAddress;
        uint256 timeCreated;
        string propertyAddress;
        address tokenAddress;
        uint256 propertySize;
        uint8 serviceFee;
    }

    mapping(string => Property) public properties;

    // A function for registering a property only callable by admin
    function registerProperty(
        string calldata id,
        string calldata name,
        uint256 propertyValue,
        address agentAddress,
        uint256 timeCreated,
        string calldata propertyAddress,
        uint256 propertySize,
        uint8 serviceFee
    ) onlyAdmin external {
        // It should also mint tokens for property (one token for each shilling of value)
        Property memory property = Property({
            id: id,
            name: name,
            propertyValue: propertyValue,
            agentAddress: agentAddress,
            timeCreated: timeCreated,
            propertySize: propertySize,
            propertyAddress: propertyAddress,
            tokenAddress: msg.sender,
            serviceFee: serviceFee
        });

        properties[id] = property;
    }

    modifier onlyAdmin() {
        if (msg.sender != _admin) {
            revert Unauthorized(msg.sender);
        }

        _;
    }
    

    

    
}