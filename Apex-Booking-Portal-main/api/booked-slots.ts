import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'date required' });
    }
    const rows = await sql<{ time_slot: string }[]>`
      SELECT time_slot FROM bookings
      WHERE booking_date = ${date} AND status <> 'cancelled'
    `;
    return res.status(200).json(rows.map((r) => r.time_slot));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch booked slots' });
  }
}
