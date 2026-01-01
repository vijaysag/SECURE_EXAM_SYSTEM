const fs = require('fs');
const { PNG } = require('pngjs');
const Jimp = require('jimp');

const MAGIC_SIG = Buffer.from('SECURE_V1'); // 9 bytes

// ... helper functions getBit, setBit ...
function getBit(byte, position) {
    return (byte >> position) & 1;
}

function setBit(byte, position, value) {
    if (value) {
        return byte | (1 << position);
    } else {
        return byte & ~(1 << position);
    }
}

const embedData = (coverImageBuffer, secretBuffer) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Normalize image with Jimp
            const image = await Jimp.read(coverImageBuffer);
            const normalizedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

            const png = new PNG({ strict: false, filterType: 4 });

            png.parse(normalizedBuffer, (err, data) => {
                if (err) return reject(err);

                const width = data.width;
                const height = data.height;

                // Calculate capacity
                const availableBits = width * height * 3;
                // Payload = Magic (9) + Length (4) + Data (N)
                const requiredBits = (MAGIC_SIG.length + 4 + secretBuffer.length) * 8;

                if (requiredBits > availableBits) {
                    return reject(new Error(`Image too small. Need ${requiredBits} bits, have ${availableBits}.`));
                }

                // Prepare bit stream: Magic + Length + Data
                const lenBuffer = Buffer.alloc(4);
                lenBuffer.writeUInt32BE(secretBuffer.length, 0);

                const totalData = Buffer.concat([MAGIC_SIG, lenBuffer, secretBuffer]);

                let dataIdx = 0;
                let bitIdx = 0; // 0 to 7

                // Iterate over pixels
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const idx = (width * y + x) << 2;

                        for (let c = 0; c < 3; c++) {
                            if (dataIdx >= totalData.length) break;

                            const byte = totalData[dataIdx];
                            const bit = getBit(byte, 7 - bitIdx);

                            data.data[idx + c] = setBit(data.data[idx + c], 0, bit);

                            bitIdx++;
                            if (bitIdx > 7) {
                                bitIdx = 0;
                                dataIdx++;
                            }
                        }
                        if (dataIdx >= totalData.length) break;
                    }
                    if (dataIdx >= totalData.length) break;
                }

                const outputBuffer = PNG.sync.write(data);
                resolve(outputBuffer);
            });
        } catch (error) {
            reject(new Error("Failed to process cover image: " + error.message));
        }
    });
};

const extractData = (stegoImageBuffer) => {
    return new Promise((resolve, reject) => {
        const png = new PNG({ strict: false });
        png.parse(stegoImageBuffer, (err, data) => {
            if (err) return reject(err);

            const width = data.width;
            const height = data.height;

            let byteVal = 0;
            let bitPos = 7;

            // State Machine
            let state = 'MAGIC'; // MAGIC -> LENGTH -> DATA
            let bufferIdx = 0;

            let magicBuffer = Buffer.alloc(MAGIC_SIG.length);
            let lenBuffer = Buffer.alloc(4);
            let messageBuffer = null;
            let len = 0;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (width * y + x) << 2;
                    for (let c = 0; c < 3; c++) { // R, G, B
                        const bit = data.data[idx + c] & 1;

                        if (bit) {
                            byteVal = byteVal | (1 << bitPos);
                        }
                        bitPos--;

                        if (bitPos < 0) {
                            // Byte complete
                            if (state === 'MAGIC') {
                                magicBuffer[bufferIdx] = byteVal;
                                bufferIdx++;
                                if (bufferIdx === MAGIC_SIG.length) {
                                    // Verify Signature
                                    if (!magicBuffer.equals(MAGIC_SIG)) {
                                        return reject(new Error("Invalid Image: No secure data signature found. Are you sure this is a Stego-Image?"));
                                    }
                                    state = 'LENGTH';
                                    bufferIdx = 0;
                                }
                            } else if (state === 'LENGTH') {
                                lenBuffer[bufferIdx] = byteVal;
                                bufferIdx++;
                                if (bufferIdx === 4) {
                                    len = lenBuffer.readUInt32BE(0);
                                    if (len > 100000000 || len < 0) return reject(new Error("Invalid hidden data length detected"));
                                    messageBuffer = Buffer.alloc(len);
                                    state = 'DATA';
                                    bufferIdx = 0;
                                }
                            } else if (state === 'DATA') {
                                if (bufferIdx < len) {
                                    messageBuffer[bufferIdx] = byteVal;
                                    bufferIdx++;
                                    if (bufferIdx === len) {
                                        return resolve(messageBuffer);
                                    }
                                }
                            }
                            // Reset for next byte
                            byteVal = 0;
                            bitPos = 7;
                        }
                    }
                }
            }
            reject(new Error("End of image reached before data extracted."));
        });
    });
};

module.exports = { embedData, extractData };
