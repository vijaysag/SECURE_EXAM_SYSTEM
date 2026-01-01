const ethers = require('ethers');
const ExamPaperRegistry = require('../frontend/src/contracts/ExamPaperRegistry.json');

async function checkCode() {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const address = ExamPaperRegistry.address;
    console.log("Checking address:", address);

    try {
        const code = await provider.getCode(address);
        console.log("Code length:", code.length);
        if (code === '0x') {
            console.log("ERROR: No code at address! Node might have restarted.");
        } else {
            console.log("SUCCESS: Contract code found.");
        }
    } catch (e) {
        console.error("Connection failed:", e.message);
    }
}

checkCode();
