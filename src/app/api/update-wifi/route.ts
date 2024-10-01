import type { NextApiRequest, NextApiResponse } from 'next';

interface UpdateWiFiRequestBody {
  ssid: string;
  password: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { ssid, password }: UpdateWiFiRequestBody = req.body;

    try {
      const response = await fetch('http://192.168.18.14/update_wifi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ ssid, password }),
      });

      const result = await response.text();
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send('Error updating Wi-Fi credentials');
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
