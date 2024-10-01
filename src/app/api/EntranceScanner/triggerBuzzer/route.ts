import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const ESP32_IP = '192.168.18.14'; // Replace with your ESP32 IP address

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await axios.get(`http://${ESP32_IP}/activate_buzzer`);
      res.status(200).json({ message: 'Buzzer triggered' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to trigger buzzer', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
