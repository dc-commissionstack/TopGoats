import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Neon Object Storage (S3-compatible) adapter.
 *
 * Reads configuration from env vars so the build does NOT block on credentials:
 *   S3_ENDPOINT            — e.g. https://<account>.r2.cloudflarestorage.com or Neon's S3 endpoint
 *   S3_ACCESS_KEY          — access key id (also accepts AWS_ACCESS_KEY_ID)
 *   S3_SECRET_KEY          — secret access key (also accepts AWS_SECRET_ACCESS_KEY)
 *   S3_BUCKET              — bucket name (default "uploads")
 *   S3_REGION              — region (default "auto"; S3-compatible services often use "auto")
 *   S3_PUBLIC_URL          — optional public base URL for the bucket (fast, cacheable playback)
 *   S3_URL_EXPIRES         — presigned URL TTL in seconds (default 3600)
 *
 * When S3 is NOT configured, the server falls back to local-disk storage so dev/local
 * testing still works (see index.js). Object keys are stored WITHOUT a leading slash
 * (e.g. "uploads/<uuid>.mp3"); local-disk paths keep the legacy "/uploads/<file>" form.
 */

const S3_ENDPOINT = process.env.S3_ENDPOINT || process.env.OBJECT_STORAGE_ENDPOINT || '';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || process.env.OBJECT_STORAGE_BUCKET || 'uploads';
const S3_REGION = process.env.S3_REGION || 'auto';
const S3_PUBLIC_URL = (process.env.S3_PUBLIC_URL || '').replace(/\/+$/, '');
const S3_URL_EXPIRES = Math.max(parseInt(process.env.S3_URL_EXPIRES || '3600', 10) || 3600, 60);

let client = null;

function getClient() {
  if (!client && isS3Configured()) {
    client = new S3Client({
      endpoint: S3_ENDPOINT,
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
      forcePathStyle: true, // required for most S3-compatible endpoints (R2/Neon/MinIO)
    });
  }
  return client;
}

/** True when the required S3 env vars are present. */
export function isS3Configured() {
  return !!(S3_ENDPOINT && S3_ACCESS_KEY && S3_SECRET_KEY);
}

/** Local-disk paths start with "/"; S3 object keys do not. */
export function isS3Key(filePath) {
  return !!filePath && !filePath.startsWith('/');
}

/** Upload a buffer to the bucket under the given key. Returns the key. */
export async function uploadTrack(buffer, key, contentType) {
  const c = getClient();
  if (!c) throw new Error('Object storage not configured');
  await c.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return key;
}

/**
 * Return a playback/download URL for an S3 object key.
 * Prefers the public bucket URL (fast + cacheable); otherwise generates a presigned URL.
 */
export async function getTrackUrl(key) {
  if (S3_PUBLIC_URL) {
    return `${S3_PUBLIC_URL}/${key}`;
  }
  const c = getClient();
  if (!c) return null;
  const url = await getSignedUrl(
    c,
    new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
    { expiresIn: S3_URL_EXPIRES }
  );
  return url;
}

/** Delete an object from the bucket (best-effort). */
export async function deleteTrack(key) {
  const c = getClient();
  if (!c) return;
  try {
    await c.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  } catch (err) {
    console.error('S3 delete failed for', key, err.message);
  }
}

export { S3_BUCKET, S3_ENDPOINT, S3_REGION };
