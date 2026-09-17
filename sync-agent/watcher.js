const chokidar = require('chokidar');
const path = require('path');
const { uploadFile, downloadAllFiles } = require('./s3Uploader');

// jis folder ko watch karna hai
const WATCH_FOLDER = '/app';

async function start() {
  // agar RESTORE_FROM set hai, matlab ye sandbox kisi purane backup se restore ho raha hai
  if (process.env.RESTORE_FROM) {
    console.log(`Restoring files from sandbox: ${process.env.RESTORE_FROM}`);
    try {
      await downloadAllFiles(process.env.RESTORE_FROM, WATCH_FOLDER);
      console.log('Restore complete');
    } catch (err) {
      console.error('Restore failed:', err.message);
    }
  }

  // chokidar ko is folder ko watch karne ke liye bol raha hu
  const watcher = chokidar.watch(WATCH_FOLDER, {
    ignoreInitial: true,
    ignored: [/node_modules/, /package-lock\.json/, /\.git/],
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
  });

  watcher.on('add', handleFileChange).on('change', handleFileChange);

  console.log(`Watching folder: ${WATCH_FOLDER}`);
}

async function handleFileChange(filePath) {
  console.log(`Detected change: ${filePath}`);

  const relativePath = path.relative(WATCH_FOLDER, filePath);
  const s3Key = `sandboxes/${process.env.SANDBOX_ID}/${relativePath}`;

  try {
    await uploadFile(filePath, s3Key);
  } catch (err) {
    console.error(`Failed to upload ${filePath}:`, err.message);
  }
}

start();