// utils/crypto.ts
export async function encrypt(data: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(key);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-ECB', length: 256 },
    false,
    ['encrypt']
  );

  const encodedData = enc.encode(data);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-ECB' },
    cryptoKey,
    encodedData
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);
  const encryptedString = String.fromCharCode(...Array.from(encryptedArray));
  return btoa(encryptedString);
}
