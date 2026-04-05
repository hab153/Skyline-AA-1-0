// file: setup-model.js

/**
 * SKYLINE AA-1 - WEEK 21 (OFFLINE SETUP)
 * Downloads the Qwen-1.8B Instruct model for offline usage.
 */

const fs = require('fs-extra');
const path = require('path');
const https = require('https');

const MODEL_URL = 'https://huggingface.co/Qwen/Qwen1.5-1.8B-Chat-GGUF/resolve/main/qwen1_5-1_8b-chat-q4_k_m.gguf';
const MODEL_DIR = path.join(__dirname, 'models');
const MODEL_PATH = path.join(MODEL_DIR, 'qwen-1.8b-offline.gguf');

async function downloadModel() {
    if (fs.existsSync(MODEL_PATH)) {
        console.log('✅ Model already exists at:', MODEL_PATH);
        console.log('🚀 You are ready to go! Run "npm start" now.');
        return;
    }

    console.log('📦 Offline Model not found. Starting download...');
    console.log('📍 Source:', MODEL_URL);
    console.log('💾 Destination:', MODEL_PATH);
    console.log('⏳ This may take a few minutes depending on your internet...');

    await fs.ensureDir(MODEL_DIR);

    const file = fs.createWriteStream(MODEL_PATH);
    
    return new Promise((resolve, reject) => {
        https.get(MODEL_URL, (response) => {
            const totalSize = parseInt(response.headers['content-length'], 10);
            let downloadedSize = 0;

            response.pipe(file);

            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
                process.stdout.write(`\r⬇️ Downloading: ${percent}%`);
            });

            file.on('finish', () => {
                file.close();
                console.log('\n✅ Download Complete!');
                console.log(`📂 Model saved to: ${MODEL_PATH}`);
                console.log('🚀 Now run "npm start" to launch Skyline AA-1 Offline!');
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(MODEL_PATH, () => {}); // Delete partial file
            console.error('\n❌ Download failed:', err.message);
            reject(err);
        });
    });
}

downloadModel().catch(console.error);
