import 'server-only';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Env } from '@/server/env';

let client: S3Client | undefined;

function getClient() {
  if (!client) {
    const env = getR2Env();
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

export async function createPresignedPdfPut(objectKey: string) {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: getR2Env().R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: 'application/pdf',
    }),
    { expiresIn: 5 * 60 },
  );
}

export async function inspectObject(objectKey: string) {
  const env = getR2Env();
  const head = await getClient().send(
    new HeadObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: objectKey }),
  );
  const prefix = await getClient().send(
    new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: objectKey,
      Range: 'bytes=0-4',
    }),
  );
  const bytes = await prefix.Body?.transformToByteArray();
  return {
    contentType: head.ContentType,
    size: head.ContentLength,
    etag: head.ETag?.replaceAll('"', ''),
    prefix: bytes ? new TextDecoder().decode(bytes) : '',
  };
}

export async function deleteObject(objectKey: string) {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: getR2Env().R2_BUCKET_NAME, Key: objectKey }),
  );
}
