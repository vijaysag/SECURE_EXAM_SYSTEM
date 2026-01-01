const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../test_assets');
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR);
}

// Helper to create PDF
function createPDF(name, title, content) {
    const pdfData = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${content.length + 50} >>
stream
BT
/F1 24 Tf
100 700 Td
(${title}) Tj
/F1 12 Tf
100 650 Td
(${content}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000204 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
309
%%EOF`;
    fs.writeFileSync(path.join(ASSETS_DIR, name), pdfData);
    console.log(`Created ${name}`);
}

// 1. Create PDFs
createPDF('Math_Exam_2025.pdf', 'MATHEMATICS FINAL EXAM', 'Q1. Calculate the integration of x^2. Q2. Solve for x: 2x + 5 = 15.');
createPDF('Science_Physics_Paper.pdf', 'PHYSICS MID-TERM', 'Q1. Define Newton\'s Third Law. Q2. Calculate the velocity.');
createPDF('History_World_Wars.pdf', 'HISTORY EXAMINATION', 'Q1. What were the causes of WWI? Q2. Discuss the treaty of Versailles.');

// 2. Create PNGs (Simple colored 1x1 pixels expanded)
// We will use simple base64 for different colors
const redPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="; // Red
const greenPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="; // Green
const bluePng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPjPQA8AAsoBgC+dOpAAAAAASUVORK5CYII="; // Blue

fs.writeFileSync(path.join(ASSETS_DIR, 'cover_red.png'), Buffer.from(redPng, 'base64'));
fs.writeFileSync(path.join(ASSETS_DIR, 'cover_green.png'), Buffer.from(greenPng, 'base64'));
fs.writeFileSync(path.join(ASSETS_DIR, 'cover_blue.png'), Buffer.from(bluePng, 'base64'));

console.log("Created 3 Images (Red, Green, Blue) in test_assets/");
