import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe.skip("RealEstateManager Contract", function () {
    const propertyID = "id";
    const propertyName = "The Big Kahuna";
    const numTokens = 1000n;
    const timeCreated = 10000n;
    const propertyAddress = "Pine Wood Street";
    const tokenID = 1n;
    const serviceFee = 10n;
    const tokenSymbol = "PWS";

    it("register function should only be called by admin", async () => {
        const [owner, otherAddress] = await ethers.getSigners();
        const realEstate = await ethers.deployContract("RealEstateManager");
        await expect(realEstate.connect(otherAddress).registerProperty(
            propertyID,
            tokenSymbol,
            propertyName,
            numTokens,
            owner,
            timeCreated,
            propertyAddress,
            serviceFee
        )).to.be.revertedWithCustomError(realEstate, "Unauthorized");
    });

    it("should revert if invalid inputs are given", async () => {
        const [owner] = await ethers.getSigners();
        const realEstate = await ethers.deployContract("RealEstateManager");
        await expect(realEstate.registerProperty(
            propertyID,
            "",
            propertyName,
            numTokens,
            owner,
            timeCreated,
            propertyAddress,
            serviceFee
        )).to.be.revertedWithCustomError(realEstate, "InvalidInput");
    });

    it("should revert if property already exists", async () => {
        const [owner] = await ethers.getSigners();
        const realEstate = await ethers.deployContract("RealEstateManager");
        const samePropertyID = "test";

        await realEstate.registerProperty(
            samePropertyID,
            tokenSymbol,
            propertyName,
            numTokens,
            owner,
            timeCreated,
            propertyAddress,
            serviceFee
        );

        await expect(realEstate.registerProperty(
            samePropertyID,
            tokenSymbol,
            propertyName,
            numTokens,
            owner,
            timeCreated,
            propertyAddress,
            serviceFee
        )).to.be.revertedWithCustomError(realEstate, "PropertyAlreadyExists");
    });

    it("should store property details", async () => {
        const [owner] = await ethers.getSigners();
        const realEstate = await ethers.deployContract("RealEstateManager");

        await realEstate.registerProperty(
            propertyID,
            tokenSymbol,
            propertyName,
            numTokens,
            owner,
            timeCreated,
            propertyAddress,
            serviceFee
        )

        const property = await realEstate.properties(propertyID);
        expect(property.id).to.equal(propertyID);
        expect(property.name).to.equal(propertyName);
        expect(property.numTokens).to.equal(numTokens);
        expect(property.agentAddress).to.equal(owner);
        expect(property.timeCreated).to.equal(timeCreated);
        expect(property.propertyAddress).to.equal(propertyAddress);
        expect(property.tokenID).to.equal(0);
        expect(property.serviceFee).to.equal(serviceFee);
        expect(property.tokenSymbol).to.equal(tokenSymbol);
    });

    it("should mint the tokens and send them to the admin address", async () => {
        const [owner] = await ethers.getSigners();
        const realEstate = await ethers.deployContract("RealEstateManager");
        const createdTokenID = 0;

        const adminTokenBalanceBefore = await realEstate.balanceOf(owner.address, createdTokenID);
        await realEstate.registerProperty(
            propertyID,
            tokenSymbol,
            propertyName,
            numTokens,
            owner,
            timeCreated,
            propertyAddress,
            serviceFee
        )

        const adminTokenBalanceAfter = await realEstate.balanceOf(owner.address, createdTokenID);
        expect(adminTokenBalanceBefore).to.equal(0n);
        expect(adminTokenBalanceAfter).to.equal(numTokens);
    })
})