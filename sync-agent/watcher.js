const chokidar = require('chokidar');
const path = require('path');
const { uploadFile } = require('./s3Uploader');

// jis folder ko watch karna hai - abhi test ke liye current folder use kar raha hu
const WATCH_FOLDER = '/app';

// chokidar ko is folder ko watch karne ke liye bol raha hu
const watcher = chokidar.watch(WATCH_FOLDER, {
  ignoreInitial: true, // shuru me jo files already hain unke liye event fire mat karo, sirf naye changes pe karo
  ignored: [/node_modules/, /package-lock\.json/, /\.git/], // in files/folders ko sync karne ki zaroorat nahi
  awaitWriteFinish: {
    stabilityThreshold: 500, // file ko likhna band hue 500ms ho jaye, tabhi "change" maanunga
    pollInterval: 100,
  },
});

// jab bhi koi file add ya change ho, ye function chalega
watcher.on('add', handleFileChange).on('change', handleFileChange);

async function handleFileChange(filePath) {
  console.log(`Detected change: ${filePath}`);

  // relative path nikal raha hu taaki S3 me sahi folder structure bane
  const relativePath = path.relative(WATCH_FOLDER, filePath);
  const s3Key = `sandboxes/${process.env.SANDBOX_ID}/${relativePath}`;

  try {
    await uploadFile(filePath, s3Key);
  } catch (err) {
    console.error(`Failed to upload ${filePath}:`, err.message);
  }
}

console.log(`Watching folder: ${WATCH_FOLDER}`);