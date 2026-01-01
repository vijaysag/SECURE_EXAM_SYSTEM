# Secure Examination System - User Guide

This guide will walk you through using the Secure Paper Management System to safely Upload, Verify, and Extract exam papers.

## 0. Prerequisites
- **Browser**: Chrome, Brave, or Firefox.
- **Wallet**: MetaMask Extension installed.
- **Network**: Local Hardhat Network (The app handles this switching).

## What is MetaMask?
MetaMask is a browser extension (digital wallet) that lets you interact with Blockchain applications. 
- **Why do I need it?** 
  - To **Login** (Your wallet address is your identity).
  - To **Sign Transactions** (Confirming you want to upload a paper hash to the blockchain).
- **Is it safe?** Yes, it is the industry standard. For this demo, you are using a **Local Test Network**, so no real money is involved.

---

## 1. Getting Started
1. Open the App in your browser (e.g., \`http://localhost:5175\`).
2. Click **Connect Wallet** in the sidebar.
3. MetaMask will popup. Approve the connection.
   - If prompted to "Switch Network", click **Switch Network**.
   - If prompted to "Add Network" (Localhost 8545), click **Approve**.

> **Note**: You must be connected to perform any actions.

---

## 2. Uploading a Paper (Setter Role)
**Test Accounts (Localhost):**
- **Admin**: Account #0 (`0xf39F...92266`) - Can Upload & Manage
- **Setter**: Account #1 (`0x7099...79C8`) - Can Upload
- **Moderator**: Account #2 (`0x3C44...93BC`) - View Only (Cannot Upload)
- **Printer**: Account #3 (`0x90F7...b906`) - View/Verify Only (Cannot Upload)
- **Stranger**: Any other account - View/Verify Only

1. Navigate to **Secure Upload** from the sidebar.
2. **Select Files**:
   - **Question Paper**: Choose a PDF file (e.g., \`sample_exam.pdf\`).
   - **Cover Image**: Choose a PNG image (e.g., \`sample_cover.png\`).
3. Click **Secure & Upload**.
   - The system will Encrypt the PDF and Embed it inside the Image.
   - You will see a **Success** screen.
4. **IMPORTANT**:
   - **Copy the Secret Key**: You see a green code box. Copy this key! You need it to open the file later.
   - **Download Image**: Click on the image preview to download the `stego-....png` file.
5. **Register on Blockchain**:
   - Click the **Register Hash on Chain** button.
   - Confirm the transaction in MetaMask.
   - Once confirmed, you'll see a Transaction Hash.

---

## 3. Extracting & Verifying (Printer Role)
1. Navigate to **Paper Extraction**.
2. **Upload Stego-Image**:
   - Drag & Drop or select the `stego-....png` file you just downloaded.
   - **Verification**: The system automatically checks the Blockchain.
     - ✅ **Verified on Chain**: The file is authentic and hasn't been tampered with.
     - ❌ **Not Found / Unverified**: The file is modified or not registered.
3. **Enter Key**:
   - Paste the **Secret Key** you copied earlier.
4. Click **Reveal Exam Paper**.
   - The system extracts the hidden data, decrypts it, and downloads the original PDF.

---

## Troubleshooting
- **"Wallet not connected"**: Refresh the page and click Connect Wallet again.
- **"Verification Failed"**: Ensure you are uploading the exact same PNG file you downloaded. Even a single pixel change will fail verification.
- **"Extraction Failed"**: Double-check your Secret Key.
