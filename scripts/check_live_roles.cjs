const hre = require("hardhat");

async function main() {
    const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // The fixed address for first deployment on localhost
    const ExamPaperRegistry = await hre.ethers.getContractFactory("ExamPaperRegistry");
    const registry = ExamPaperRegistry.attach(address);

    const signers = await hre.ethers.getSigners();
    // Check known accounts
    const checks = [
        { name: "Admin (Account #0)", address: signers[0].address },
        { name: "Setter (Account #1)", address: signers[1].address },
        { name: "Moderator (Account #2)", address: signers[2].address },
        { name: "Printer (Account #3)", address: signers[3].address },
        { name: "Ramdom (Account #9)", address: signers[9].address },
    ];

    console.log(`Checking roles on contract at ${address}...`);

    for (const check of checks) {
        const roleIndex = await registry.userRoles(check.address);
        const roles = ['None', 'Setter', 'Moderator', 'Printer', 'Admin'];
        console.log(`${check.name} [${check.address}] -> Role: ${roles[Number(roleIndex)]} (${roleIndex})`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
