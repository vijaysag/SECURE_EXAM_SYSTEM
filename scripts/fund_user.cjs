const hre = require("hardhat");

async function main() {
    const addresses = [
        "0x9427274538cD1C57Fcd31933f6D496D6f6b41A37", // Custom
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account #1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906"  // Account #3
    ];
    const signers = await hre.ethers.getSigners();
    const funder = signers[0]; // Has 10000 ETH

    for (const addr of addresses) {
        const balance = await hre.ethers.provider.getBalance(addr);
        if (balance < hre.ethers.parseEther("1.0")) {
            console.log(`Funding ${addr} with 10 ETH...`);
            await (await funder.sendTransaction({
                to: addr,
                value: hre.ethers.parseEther("10.0")
            })).wait();
        } else {
            console.log(`${addr} already has ${hre.ethers.formatEther(balance)} ETH`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
