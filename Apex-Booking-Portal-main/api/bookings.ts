import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { date } = req.query;
      if (date && typeof date === 'string') {
        const rows = await sql<{ time_slot: string }[]>`
          SELECT time_slot FROM bookings
          WHERE booking_date = ${date} AND status <> 'cancelled'
        `;
        return res.status(200).json(rows.map((r) => r.time_slot));
      }
      const rows = await sql<any[]>`
        SELECT * FROM bookings ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  if (req.method === 'POST') {
    try {
      const params = req.body || {};
      const rows = await sql<any[]>`
        INSERT INTO bookings (
          reference_id, service_id, consultant_id, service_name, consultant,
          duration, price, booking_date, time_slot, timezone,
          client_name, client_email, client_phone, project_requirements,
          file_url, payment_method, status
        ) VALUES (
          ${params.reference_id}, ${params.service_id || null}, ${params.consultant_id || null}, ${params.service_name},
          ${params.consultant}, ${params.duration}, ${params.price}, ${params.booking_date}, ${params.time_slot},
          ${params.timezone}, ${params.client_name}, ${params.client_email}, ${params.client_phone || null},
          ${params.project_requirements || null}, ${params.file_url || null}, ${params.payment_method}, ${params.status || 'confirmed'}
        ) RETURNING *
      `;
      return res.status(201).json(rows[0]);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to create booking' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, status, booking_date, time_slot } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      if (status) {
        await sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`;
      }
      if (booking_date && time_slot) {
        await sql`UPDATE bookings SET booking_date = ${booking_date}, time_slot = ${time_slot} WHERE id = ${id}`;
      }
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to update booking' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM bookings WHERE id = ${id}`;
      return res.status(204).end();
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to delete booking' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
