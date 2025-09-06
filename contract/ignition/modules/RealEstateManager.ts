import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RealEstateManagerModule", (m) => {
  const realEstate = m.contract("RealEstateManager");
  return { realEstate };
});