require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

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

module.exports = { uploadFile };