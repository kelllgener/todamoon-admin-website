import * as crypto from 'crypto';
import * as os from 'os';

const TRANSFORMATION = 'aes-128-ecb'; // Update this based on your transformation

function encrypt(data: string, key: string): string {
  // Start time tracking for encryption
  const startTime = process.hrtime();

  // Track CPU and memory usage before encryption
  const startCpuUsage = process.cpuUsage();
  const startMemoryUsage = process.memoryUsage();

  // Create a buffer from the key and the data
  const keyBuffer = Buffer.from(key, 'utf-8');
  const dataBuffer = Buffer.from(data, 'utf-8');

  // Create a cipher using the algorithm and transformation
  const cipher = crypto.createCipheriv(TRANSFORMATION, keyBuffer, null);

  // Encrypt the data
  let encrypted = cipher.update(dataBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Encode the result in base64
  const encryptedString = encrypted.toString('base64');

  // End time tracking for encryption
  const endTime = process.hrtime(startTime);
  const encryptionTimeMs = (endTime[0] * 1000) + (endTime[1] / 1_000_000); // Convert to milliseconds

  // Track CPU and memory usage after encryption
  const endCpuUsage = process.cpuUsage(startCpuUsage);
  const endMemoryUsage = process.memoryUsage();

  // CPU usage during encryption in seconds (user + system CPU time)
  const cpuUsageSeconds = (endCpuUsage.user + endCpuUsage.system) / 1_000_000;

  // Convert memory usage to MB
  const memoryUsageBeforeMB = startMemoryUsage.heapUsed / 1024 / 1024;
  const memoryUsageAfterMB = endMemoryUsage.heapUsed / 1024 / 1024;

  // Log the resource usage
  console.log(`Encryption took ${encryptionTimeMs.toFixed(2)} ms`);
  console.log(`CPU usage during encryption: ${cpuUsageSeconds.toFixed(4)} seconds`);
  console.log(`Memory usage before encryption: ${memoryUsageBeforeMB.toFixed(1)} MB`);
  console.log(`Memory usage after encryption: ${memoryUsageAfterMB.toFixed(1)} MB`);

  return encryptedString;
}


export default encrypt;
