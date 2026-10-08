import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const active = req.query.active === 'true';
      let rows;
      if (req.query.active !== undefined) {
        rows = await sql<Service[]>`
          SELECT * FROM services WHERE active = ${active} ORDER BY created_at ASC
        `;
      } else {
        rows = await sql<Service[]>`
          SELECT * FROM services ORDER BY created_at ASC
        `;
      }
      return res.status(200).json(rows);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to fetch services' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, duration, price, category, features, active } = req.body || {};
      const rows = await sql<Service[]>`
        INSERT INTO services (name, description, duration, price, category, features, active)
        VALUES (${name}, ${description}, ${duration}, ${price}, ${category}, ${features || []}, ${active ?? true})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to create service' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const setClauses: string[] = [];
      const values: any[] = [];
      let i = 1;
      for (const [k, v] of Object.entries(updates)) {
        setClauses.push(`${k} = $${i++}`);
        values.push(v);
      }
      values.push(id);
      const result = await sql.unsafe(
        `UPDATE services SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      return res.status(200).json(result[0]);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to update service' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM services WHERE id = ${id}`;
      return res.status(204).end();
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to delete service' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  features: string[];
  active: boolean;
  created_at: string;
}
