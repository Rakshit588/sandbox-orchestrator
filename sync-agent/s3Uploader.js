require('dotenv').config();
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// S3 client creation - ye humare AWS account se authenticate karega .env wali keys use karke
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// diye gaye local file ko S3 bucket me upload karta hai
async function uploadFile(localPath, s3Key) {
  const fileContent = fs.readFileSync(localPath);

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
  });

  await s3Client.send(command);
  console.log(`Uploaded: ${s3Key}`);
}

// diye gaye sandboxId ki saari files S3 se download karke local path pe likhta hai
async function downloadAllFiles(sandboxId, localBasePath) {
  const prefix = `sandboxes/${sandboxId}/`;
  const listCommand = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: prefix,
  });
  const listResult = await s3Client.send(listCommand);

  if (!listResult.Contents) return; // koi purani file hi nahi mili

  for (const obj of listResult.Contents) {
    const relativePath = obj.Key.replace(prefix, '');
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: obj.Key,
    });
    const response = await s3Client.send(getCommand);
    const content = await response.Body.transformToByteArray();

    const localPath = path.join(localBasePath, relativePath);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, content);
    console.log(`Restored: ${relativePath}`);
  }
}

module.exports = { uploadFile, downloadAllFiles };