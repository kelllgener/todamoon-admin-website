// utils/uploadFile.ts
import { Buffer } from 'buffer';

export const uploadFile = async (file: string, path: string, bucket: any) => {
  const fileRef = bucket.file(path);
  const buffer = Buffer.from(file.split(",")[1], 'base64'); // Extract base64 part of the image file
  await fileRef.save(buffer, { contentType: 'image/png' });
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
};
