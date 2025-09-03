import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("RealEstateManager Contract", function () {
    it ("register function should only be called by admin", async () => {
        const [owner, otherAddress] = await ethers.getSigners();
        const realEstate = await ethers.deployContract("RealEstateManager");
        await expect(realEstate.connect(otherAddress).registerProperty(
            "test",
            "test",
            100n,
            owner,
            100n,
            "Test road",
            100n,
            10n
        )).to.be.revertedWithCustomError(realEstate, "Unauthorized");
    })
})