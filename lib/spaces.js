import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const spacesClient = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
  forcePathStyle: false,
});

/**
 * Upload a file to Digital Ocean Spaces
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - Original file name
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export async function uploadToSpaces(fileBuffer, fileName, mimeType) {
  try {
    // Generate a unique file name to avoid collisions
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}-${uuidv4()}.${fileExt}`;
    const key = `uploads/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: key,
      Body: fileBuffer,
      ACL: 'public-read',
      ContentType: mimeType,
    });

    await spacesClient.send(command);

    // Return the direct Spaces URL (not CDN as CDN needs to be manually enabled)
    // Format: https://bucket-name.region.digitaloceanspaces.com/key
    const bucket = process.env.DO_SPACES_BUCKET;
    const region = process.env.DO_SPACES_REGION;
    const publicUrl = `https://${bucket}.${region}.digitaloceanspaces.com/${key}`;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Spaces:', error);
    throw new Error('Failed to upload file to Spaces');
  }
}
