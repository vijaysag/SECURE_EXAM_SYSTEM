const crypto = require('crypto');
const fs = require('fs');

// Algorithm: AES-256-CBC
const ALGORITHM = 'aes-256-cbc';

// Generate a random key and iv for demonstration. 
// In prod, manage these via KMS or Key Exchange.
const encryptFile = (buffer) => {
    // Generate a secure key (32 bytes) and IV (16 bytes)
    // Note: In the real system, the Key is what we distribute securely via Steganography or PGP.
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return {
        encryptedData: encrypted,
        key: key.toString('hex'),
        iv: iv.toString('hex')
    };
};

const decryptFile = (encryptedBuffer, keyHex, ivHex) => {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decrypted;
};

module.exports = { encryptFile, decryptFile };
