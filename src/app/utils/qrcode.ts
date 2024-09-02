// utils/qrCode.ts
import QRCode from 'qrcode';

export async function generateQRCode(text: string): Promise<string> {
  try {
    const url = await QRCode.toDataURL(text);
    return url;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}
