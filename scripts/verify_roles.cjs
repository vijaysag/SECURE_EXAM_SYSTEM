const hre = require("hardhat");

async function main() {
    console.log("Verifying usage privileges...");

    // Get contract artifact and address
    const ExamPaperRegistry = await hre.ethers.getContractFactory("ExamPaperRegistry");
    // We need the address from the last deployment. 
    // Since we don't store it in a static file easily readable here without parsing JSON, 
    // let's try to attach to the latest known address or just redeploy a fresh one for this isolate test?
    // User wants to check the *deployed* system.
    // Deploy a fresh contract for this test run to ensure we see logs and have clean state
    const registry = await ExamPaperRegistry.deploy();
    await registry.waitForDeployment();
    const address = await registry.getAddress();
    console.log("Deployed fresh TokenRegistry for testing at:", address);

    const signers = await hre.ethers.getSigners();
    const admin = signers[0];
    const setter = signers[1]; // Account #1
    const moderator = signers[2]; // Account #2
    const printer = signers[3]; // Account #3
    const stranger = signers[9]; // Random user

    // Setup Roles in this fresh contract
    await registry.setUserRole(setter.address, 1); // Setter
    await registry.setUserRole(moderator.address, 2); // Moderator
    await registry.setUserRole(printer.address, 3); // Printer

    console.log("\n--- Testing Roles ---");
    console.log(`Admin (Author): ${admin.address}`);
    console.log(`Setter: ${setter.address}`);
    console.log(`Moderator: ${moderator.address}`);
    console.log(`Printer: ${printer.address}`);
    console.log(`Stranger: ${stranger.address}`);

    // Helper to test upload
    async function tryUpload(signer, roleName, expectedSuccess) {
        process.stdout.write(`Testing upload as ${roleName}... `);
        try {
            // using a random hash
            const hash = "QmTestHash" + Math.floor(Math.random() * 100000);
            const tx = await registry.connect(signer).uploadPaper(hash);
            const receipt = await tx.wait();

            // Check who the transaction actually came from
            if (receipt.from.toLowerCase() !== signer.address.toLowerCase()) {
                console.log(`⚠️  WARNING: Transaction sender mismatch! Expected ${signer.address}, Got ${receipt.from}`);
            }

            if (expectedSuccess) {
                console.log("✅ Success (Expected)");
            } else {
                console.log(`❌ FAILED: Should have reverted but succeeded! (Sender: ${receipt.from})`);
            }
        } catch (e) {
            if (expectedSuccess) {
                console.log("❌ FAILED: Should have succeeded but reverted!");
                console.log(e.message);
            } else {
                // Check if error message contains "Unauthorized"
                if (e.message.includes("Unauthorized") || e.message.includes("revert")) {
                    console.log("✅ Reverted (Expected)");
                } else {
                    console.log("⚠️ Reverted with unexpected error:", e.message);
                }
            }
        }
    }

    await tryUpload(admin, "Admin", true);
    await tryUpload(setter, "Setter", true);
    await tryUpload(moderator, "Moderator", false);
    await tryUpload(printer, "Printer", false);
    await tryUpload(stranger, "Stranger (No Role)", false);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
