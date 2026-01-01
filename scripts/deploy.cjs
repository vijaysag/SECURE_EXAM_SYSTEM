const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const ExamPaperRegistry = await hre.ethers.getContractFactory("ExamPaperRegistry");
  const registry = await ExamPaperRegistry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("ExamPaperRegistry deployed to:", address);

  // Setup Test Roles
  const signers = await hre.ethers.getSigners();
  // Role Enum: None=0, Setter=1, Moderator=2, Printer=3, Admin=4

  // Account #1 -> Setter
  await registry.setUserRole(signers[1].address, 1);
  console.log(`Assigned SETTER role to: ${signers[1].address} (Account #1)`);

  // Account #2 -> Moderator (Cannot upload)
  await registry.setUserRole(signers[2].address, 2);
  console.log(`Assigned MODERATOR role to: ${signers[2].address} (Account #2)`);

  // Account #3 -> Printer (Cannot upload)
  await registry.setUserRole(signers[3].address, 3);
  console.log(`Assigned PRINTER role to: ${signers[3].address} (Account #3)`);

  // Save ABI and Address to Frontend
  // We need to read artifact to get ABI
  const artifact = await hre.artifacts.readArtifact("ExamPaperRegistry");

  const contractData = {
    address: address,
    abi: artifact.abi
  };

  const frontendDir = path.join(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendDir, "ExamPaperRegistry.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract data saved to frontend/src/contracts/ExamPaperRegistry.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
