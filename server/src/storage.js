import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Neon Object Storage (S3-compatible) adapter.
 *
 * Reads configuration from the standard AWS SDK env vars (already set on Vercel):
 *   AWS_ENDPOINT_URL_S3    — Neon S3 endpoint (e.g. https://<project>.storage.c-4.us-east-2.aws.neon.tech)
 *   AWS_REGION             — region (e.g. us-east-2)
 *   AWS_ACCESS_KEY_ID      — access key id
 *   AWS_SECRET_ACCESS_KEY  — secret access key
 *   S3_BUCKET              — bucket name (default "uploads")
 *   S3_URL_EXPIRES         — presigned URL TTL in seconds (default 3600)
 *
 * The bucket is PRIVATE by design (artist sovereignty), so playback/download always goes
 * through short-lived presigned GET URLs generated server-side — never a public bucket URL.
 *
 * Notes (from Neon docs):
 *   - forcePathStyle MUST be true (Neon uses path-style addressing).
 *   - requestChecksumCalculation: 'WHEN_REQUIRED' avoids the SDK adding checksum headers that
 *     non-AWS S3-compatible endpoints reject.
 *
 * When S3 is NOT configured, the server falls back to local-disk storage so dev/local testing
 * still works (see index.js). Object keys are stored WITHOUT a leading slash
 * (e.g. "uploads/<uuid>.mp3"); local-disk paths keep the legacy "/uploads/<file>" form.
 */

const S3_ENDPOINT = process.env.AWS_ENDPOINT_URL_S3 || process.env.S3_ENDPOINT || process.env.OBJECT_STORAGE_ENDPOINT || '';
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || '';
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || process.env.OBJECT_STORAGE_BUCKET || 'uploads';
const S3_REGION = process.env.AWS_REGION || process.env.S3_REGION || 'us-east-2';
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
      forcePathStyle: true, // required for Neon/R2/MinIO-style endpoints
      requestChecksumCalculation: 'WHEN_REQUIRED', // avoid checksum headers non-AWS endpoints reject
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
 * Return a short-lived presigned GET URL for playback/download of a private object.
 * Returns null when S3 is not configured (caller should fall back to local path).
 */
export async function getTrackUrl(key) {
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
