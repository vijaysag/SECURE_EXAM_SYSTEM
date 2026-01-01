const Jimp = require('jimp');
console.log('Jimp type:', typeof Jimp);
console.log('Jimp keys:', Object.keys(Jimp));
console.log('Jimp.read type:', typeof Jimp.read);

if (typeof Jimp.read !== 'function') {
    console.error('FAIL: Jimp.read is missing!');
    process.exit(1);
} else {
    console.log('SUCCESS: Jimp.read is present.');
}
