import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("RealEstateManager Contract", function () {
    it ("register function should only be called by admin", async () => {
        const [owner, otherAddress] = await ethers.getSigners();
        const realEstate = await ethers.deployContract("RealEstateManager");
        await expect(realEstate.connect(otherAddress).registerProperty(
            "test",
            "TST",
            "test",
            100n,
            owner,
            100n,
            "Test road",
            10n
        )).to.be.revertedWithCustomError(realEstate, "Unauthorized");
    });

    it("should revert if invalid inputs are given", async () => {
        const [owner] = await ethers.getSigners();
        const realEstate = await ethers.deployContract("RealEstateManager");
         await expect(realEstate.registerProperty(
            "test",
            "",
            "test",
            100n,
            owner,
            100n,
            "Test road",
            10n
        )).to.be.revertedWithCustomError(realEstate, "InvalidInput");
    })

    it("should revert if property already exists", async () => {
        const [owner] = await ethers.getSigners();
        const realEstate = await ethers.deployContract("RealEstateManager");
        const samePropertyID = "test";

        await realEstate.registerProperty(
            samePropertyID,
            "TST",
            "test",
            100n,
            owner,
            100n,
            "Test road",
            10n
        );

        await expect(realEstate.registerProperty(
            samePropertyID,
            "TST",
            "test",
            100n,
            owner,
            100n,
            "Test road",
            10n
        )).to.be.revertedWithCustomError(realEstate, "PropertyAlreadyExists");
    })
})