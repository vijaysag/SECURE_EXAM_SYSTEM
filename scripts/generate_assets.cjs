const fs = require('fs');
const path = require('path');

// 1. Create Sample PDF
const pdfContent = `%PDF-1.4
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
<< /Length 55 >>
stream
BT
/F1 24 Tf
100 700 Td
(SECURE EXAMINATION SYSTEM - SAMPLE PAPER) Tj
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

fs.writeFileSync(path.join(__dirname, '../sample_exam.pdf'), pdfContent);
console.log("Created sample_exam.pdf");

// 2. Create Sample Cover Image (1x1 Pixel Red Dot PNG)
// Base64 of a 1x1 red pixel
const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const buffer = Buffer.from(base64Png, 'base64');

fs.writeFileSync(path.join(__dirname, '../sample_cover.png'), buffer);
console.log("Created sample_cover.png");
