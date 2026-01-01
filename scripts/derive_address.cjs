const { ethers } = require("ethers");

async function main() {
    const pk = "9ae38f9673a8ae81dd6614b376cc2d9e204da043b40e0a4eff738ba8fdf92610";
    const wallet = new ethers.Wallet(pk);
    console.log("Address:", wallet.address);
}

main();
