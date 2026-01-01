const { embedData, extractData } = require('../backend/utils/steganography');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

async function testStego() {
    console.log("Generating test assets...");

    // 1. Create a simple valid PNG cover image (100x100)
    const width = 100;
    const height = 100;
    const png = new PNG({ width, height });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            png.data[idx] = 255;   // R
            png.data[idx + 1] = 0;   // G
            png.data[idx + 2] = 0;   // B
            png.data[idx + 3] = 255; // A
        }
    }
    const coverBuffer = PNG.sync.write(png);
    console.log("Cover image created. Size:", coverBuffer.length);

    // 2. Create a payload (simulated encrypted JSON)
    const payloadObj = { iv: "abcdef123456", data: "SuperSecretData" };
    const payloadStr = JSON.stringify(payloadObj);
    const payloadBuffer = Buffer.from(payloadStr);
    console.log("Payload created:", payloadStr);

    // 3. Embed
    console.log("Embedding...");
    let stegoBuffer;
    try {
        stegoBuffer = await embedData(coverBuffer, payloadBuffer);
        console.log("Stego image created. Size:", stegoBuffer.length);
    } catch (e) {
        console.error("Embedding failed:", e);
        return;
    }

    // 4. Extract
    console.log("Extracting...");
    try {
        const extractedBuffer = await extractData(stegoBuffer);
        const extractedStr = extractedBuffer.toString();
        console.log("Extracted Data:", extractedStr);

        if (extractedStr === payloadStr) {
            console.log("SUCCESS: Data matches exactly.");
        } else {
            console.error("FAILURE: Data mismatch.");
            console.error("Expected:", payloadStr);
            console.error("Got:", extractedStr);
        }
    } catch (e) {
        console.error("Extraction failed:", e);
    }
}

testStego();
