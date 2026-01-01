const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { encryptFile, decryptFile } = require('./utils/crypto');
const { embedData, extractData } = require('./utils/steganography');

const app = express();
app.use(cors());
app.use(express.json());

// Setup Storage
const upload = multer({ dest: 'uploads/' });

// In-memory 'database' for demo
let PAPERS = [];
// Struct: { id, title, ipfsHash (simulated), uploader, status, encryptedFilePath, stegoImagePath, key, iv }

app.get('/', (req, res) => {
    res.send('Secure Exam System API');
});

// 1. Upload Paper (Setter)
// Inputs: PDF file, Cover Image
// Process: Encrypt PDF -> Embed in Image -> Return StegoImage & Hash
app.post('/api/upload', upload.fields([{ name: 'paper' }, { name: 'cover' }]), async (req, res) => {
    try {
        const paperFile = req.files['paper'][0];
        const coverFile = req.files['cover'][0];

        // 1. Encrypt Paper
        const paperBuffer = fs.readFileSync(paperFile.path);
        const { encryptedData, key, iv } = encryptFile(paperBuffer);

        // 2. Prepare Payload for Stego (Key + IV + EncryptedData? Or just EncryptedData?)
        // PROPER SECURITY: The Stego Image should contain the Encrypted Data.
        // The KEY and IV should be distributed separately (e.g., via secure channel or Public Key crypto).
        // FOR THIS DEMO: We will embed { iv, encryptedData }. We return the KEY to the user to keep safe.
        // Or better: We embed EVERYTHING and protect access to the file.
        // Let's go with: Embed (IV + EncryptedData). Key is returned to Uploader.

        const payload = Buffer.from(JSON.stringify({ iv, data: encryptedData.toString('base64') }));

        // 3. Embed in Cover Image
        // Fix: Use Jimp to load the image first to handle different formats/metadata that might confuse pngjs
        // or just read basic raw data.
        // Actually, pngjs is strict about CRC. simpler fix: parse options to ignore CRC?
        // Or re-save with Jimp. Let's try ignoring CRC if possible, or better:
        // Use a more robust approach.
        // Let's rely on standard read but handle error.
        // "Crc error" means the input PNG is corrupted or has extra data pngjs doesn't like.
        // The Sample Images created by the previous script might be slightly malformed (raw base64 dump).
        // Let's try to make the previous script create VALID PNGs first using a library.
        // But to fix THIS code: catch the error.

        const coverBuffer = fs.readFileSync(coverFile.path);

        // Try to process
        let stegoBuffer;
        try {
            stegoBuffer = await embedData(coverBuffer, payload);
        } catch (e) {
            console.error("Stego Embed Error (likely CRC):", e);
            // Fallback: If it's a CRC error, it might be the input file.
            // We can try to repair it or just fail gracefully.
            throw new Error(e.message || "Invalid Cover Image Format.");
        }

        const stegoName = `stego-${Date.now()}.png`;
        const stegoPath = path.join(__dirname, 'uploads', stegoName);
        fs.writeFileSync(stegoPath, stegoBuffer);

        // 4. Calculate Hash of the Stego Image (for Blockchain)
        // This hash is what gets stored on-chain to prove integrity.
        // If someone modifies the image, this hash won't match.
        const crypto = require('crypto');
        const stegoHash = crypto.createHash('sha256').update(stegoBuffer).digest('hex');

        // Cleanup temp files (Safe Delete)
        try {
            if (fs.existsSync(paperFile.path)) fs.unlinkSync(paperFile.path);
            if (fs.existsSync(coverFile.path)) fs.unlinkSync(coverFile.path);
        } catch (cleanupErr) {
            console.warn("Warning: Could not delete temp files (EBUSY/Locked). Scheduled for OS cleanup.");
        }

        res.json({
            success: true,
            message: "Paper processed successfully",
            stegoUrl: `/uploads/${stegoName}`, // static serve this later
            paperHash: stegoHash,
            secretKey: key, // User must save this!
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Register Hash on Blockchain (Auto-signed by backend)
app.post('/api/register-hash', async (req, res) => {
    try {
        const { paperHash } = req.body;
        if (!paperHash) {
            return res.status(400).json({ error: "Missing paper hash" });
        }

        // Load contract info
        const contractInfo = require('../frontend/src/contracts/ExamPaperRegistry.json');

        // Connect to local Hardhat node with a pre-funded account
        const provider = new ethers.JsonRpcProvider('http://localhost:8545');
        const signerKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat Account #0
        const signer = new ethers.Wallet(signerKey, provider);

        // Create contract instance
        const contract = new ethers.Contract(
            contractInfo.address,
            contractInfo.abi,
            signer
        );

        // Register the hash
        const tx = await contract.uploadPaper(paperHash);
        const receipt = await tx.wait();

        console.log(`[BLOCKCHAIN] Hash registered: ${paperHash}`);
        console.log(`[BLOCKCHAIN] Tx: ${tx.hash}`);

        res.json({
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber
        });

    } catch (error) {
        console.error("Blockchain registration error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Verify Hash on Blockchain (No wallet required)
app.post('/api/verify-hash', async (req, res) => {
    try {
        const { paperHash } = req.body;
        if (!paperHash) {
            return res.status(400).json({ error: "Missing paper hash" });
        }

        // Load contract info - use dynamic require to get fresh data
        delete require.cache[require.resolve('../frontend/src/contracts/ExamPaperRegistry.json')];
        const contractInfo = require('../frontend/src/contracts/ExamPaperRegistry.json');

        // Connect to local Hardhat node
        const provider = new ethers.JsonRpcProvider('http://localhost:8545');

        // Create contract instance (read-only, no signer needed)
        const contract = new ethers.Contract(
            contractInfo.address,
            contractInfo.abi,
            provider
        );

        // Check if hash exists
        const id = await contract.hashToId(paperHash);
        const exists = Number(id) > 0;

        console.log(`[VERIFY] Hash: ${paperHash.slice(0, 16)}... Exists: ${exists}`);

        res.json({
            success: true,
            exists: exists,
            paperId: Number(id)
        });

    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: error.message, exists: false });
    }
});
const USERS = {}; // userId -> { password, role, questions: [{q, a}] }
const PENDING_LOGINS = {}; // userId -> { step: 'mfa', questionIndex }
const AUDIT_LOGS = [];

// --- User Management & MFA ---

// 1. Register with MFA Questions
app.post('/api/register', (req, res) => {
    const { userId, password, role, questions } = req.body;
    if (!userId || !password || !questions || questions.length < 3) {
        return res.status(400).json({ error: "Invalid data. Need UserID, Password, and at least 3 Security Questions." });
    }
    if (USERS[userId]) {
        return res.status(400).json({ error: "User already exists." });
    }
    USERS[userId] = { userId, password, role, questions };
    console.log(`[AUTH] User registered: ${userId} (${role})`);
    res.json({ success: true, message: "Registration successful. User secure." });
});

// 2. Login Step 1: Validate Password & Issue Challenge
app.post('/api/login/init', (req, res) => {
    const { userId, password } = req.body;
    const user = USERS[userId];

    // Simple alert for failed login attempts (Brute Force Detection)
    if (!user || user.password !== password) {
        console.warn(`[SECURITY ALERT] Failed login attempt for user: ${userId}`);
        return res.status(401).json({ error: "Invalid credentials." });
    }

    // Select Random Question
    const qIndex = Math.floor(Math.random() * user.questions.length);
    const questionObj = user.questions[qIndex];

    PENDING_LOGINS[userId] = {
        questionIndex: qIndex,
        timestamp: Date.now()
    };

    res.json({
        success: true,
        step: 'mfa_required',
        question: questionObj.q
    });
});

// 3. Login Step 2: Verify MFA Answer
app.post('/api/login/verify', (req, res) => {
    const { userId, answer } = req.body;
    const pending = PENDING_LOGINS[userId];

    if (!pending) return res.status(400).json({ error: "No login session found." });

    const user = USERS[userId];
    const expectedAnswer = user.questions[pending.questionIndex].a;

    if (answer.toLowerCase().trim() !== expectedAnswer.toLowerCase().trim()) {
        console.warn(`[SECURITY ALERT] MFA Failed for user: ${userId}`);
        // Log to Audit
        AUDIT_LOGS.push({
            type: 'MFA_FAILURE',
            user: userId,
            time: new Date().toISOString(),
            severity: 'HIGH'
        });
        return res.status(401).json({ error: "Incorrect security answer." });
    }

    // Success
    delete PENDING_LOGINS[userId];
    console.log(`[AUTH] ${userId} logged in successfully.`);
    res.json({
        success: true,
        role: user.role,
        token: "demo-session-token-" + Date.now()
    });
});

// --- Security Auditing ---

// Alert Endpoint for Intrusion Detection
app.post('/api/audit/alert', (req, res) => {
    const { type, userId, details, severity } = req.body;

    const alert = {
        id: Date.now(),
        type,
        userId: userId || 'ANONYMOUS',
        details,
        severity: severity || 'MEDIUM',
        timestamp: new Date().toISOString()
    };

    AUDIT_LOGS.push(alert);

    // Simulated Admin Notification
    console.log("\n!!! SECURITY ALERT TRIGGERED !!!");
    console.log(`TYPE: ${alert.type}`);
    console.log(`USER: ${alert.userId}`);
    console.log(`DETAILS: ${JSON.stringify(alert.details, null, 2)}`);
    console.log("--------------------------------\n");

    res.json({ success: true, message: "Alert logged." });
});

// 2. Extract Paper (Printer/Receiver)
// Inputs: Stego Image, Secret Key
app.post('/api/extract', upload.single('stego'), async (req, res) => {
    try {
        const stegoFile = req.file;
        const secretKeyHex = req.body.key;

        if (!stegoFile || !secretKeyHex) return res.status(400).json({ error: "Missing file or key" });

        const stegoBuffer = fs.readFileSync(stegoFile.path);

        // 1. Extract Payload
        const payloadBuffer = await extractData(stegoBuffer);
        const payloadJson = JSON.parse(payloadBuffer.toString());

        const ivHex = payloadJson.iv;
        const encryptedDataInfo = payloadJson.data; // Base64 string
        const encryptedBuffer = Buffer.from(encryptedDataInfo, 'base64');

        // 2. Decrypt
        // Verify Integrity? If decrypt fails, it might be padding error -> tampering or wrong key.
        const decryptedPaper = decryptFile(encryptedBuffer, secretKeyHex, ivHex);

        const outName = `decrypted-${Date.now()}.pdf`;
        const outPath = path.join(__dirname, 'uploads', outName);
        fs.writeFileSync(outPath, decryptedPaper);

        try {
            if (fs.existsSync(stegoFile.path)) fs.unlinkSync(stegoFile.path);
        } catch (cleanupErr) {
            console.warn("Warning: Could not delete temp stego file.");
        }

        res.download(outPath); // Send file back

    } catch (error) {
        console.error("Extraction/Decryption Error:", error.message);

        // AUTO-AUDIT: If extraction fails, it's likely a wrong key or tampered image
        AUDIT_LOGS.push({
            type: 'DECRYPTION_FAILED',
            details: error.message,
            time: new Date().toISOString()
        });

        res.status(500).json({ error: "Extraction Failed: Key incorrect or Image corrupted." });
    }
});

app.use('/uploads', express.static('uploads'));

// --- Faucet: Fund any wallet with test ETH ---
const { ethers } = require('ethers');

app.post('/api/faucet', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address || !ethers.isAddress(address)) {
            return res.status(400).json({ error: "Invalid Ethereum address" });
        }

        // Connect to local Hardhat node
        const provider = new ethers.JsonRpcProvider('http://localhost:8545');

        // Use Hardhat's first account (has 10000 ETH)
        const funderKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const funder = new ethers.Wallet(funderKey, provider);

        // Check current balance
        const balance = await provider.getBalance(address);
        if (balance >= ethers.parseEther("1.0")) {
            return res.json({
                success: true,
                message: "Account already has sufficient ETH",
                balance: ethers.formatEther(balance)
            });
        }

        // Send 5 ETH
        const tx = await funder.sendTransaction({
            to: address,
            value: ethers.parseEther("5.0")
        });
        await tx.wait();

        const newBalance = await provider.getBalance(address);
        console.log(`[FAUCET] Sent 5 ETH to ${address}`);

        res.json({
            success: true,
            message: "Funded with 5 ETH!",
            txHash: tx.hash,
            balance: ethers.formatEther(newBalance)
        });

    } catch (error) {
        console.error("Faucet error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
