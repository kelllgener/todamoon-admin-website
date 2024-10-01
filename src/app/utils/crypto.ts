// utils/encryptionUtil.ts
import * as crypto from 'crypto';

const SECRET_KEY = 'Todamoon_drivers'; // 16 bytes key

// Define constants for algorithm and transformation
const ALGORITHM = 'AES-128-ECB'; // Update this based on your algorithm
const TRANSFORMATION = 'aes-128-ecb'; // Update this based on your transformation

function encrypt(data: string, key: string): string {
    // Create a buffer from the key and the data
    const keyBuffer = Buffer.from(key, 'utf-8');
    const dataBuffer = Buffer.from(data, 'utf-8');

    // Create a cipher using the algorithm and transformation
    const cipher = crypto.createCipheriv(TRANSFORMATION, keyBuffer, null);

    // Encrypt the data
    let encrypted = cipher.update(dataBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Encode the result in base64
    return encrypted.toString('base64');
}

function decrypt(encryptedText: string, key: string): string {
  // Create a buffer from the key
  const keyBuffer = Buffer.from(key, 'utf-8');

  // Decode the Base64 encrypted text
  const encryptedBuffer = Buffer.from(encryptedText, 'base64');

  // Create a decipher using the algorithm and transformation
  const decipher = crypto.createDecipheriv(TRANSFORMATION, keyBuffer, null);

  // Decrypt the data
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // Convert decrypted buffer back to a UTF-8 string
  return decrypted.toString('utf-8');
}

export { encrypt, decrypt };
