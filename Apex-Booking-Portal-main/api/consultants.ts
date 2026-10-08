import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const rows = await sql<Consultant[]>`
        SELECT * FROM consultants ORDER BY created_at ASC
      `;
      return res.status(200).json(rows);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to fetch consultants' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, title, avatar_gradient, initials, specialties, available, rating } = req.body || {};
      const rows = await sql<Consultant[]>`
        INSERT INTO consultants (name, title, avatar_gradient, initials, specialties, available, rating)
        VALUES (${name}, ${title}, ${avatar_gradient || 'from-emerald-400 to-teal-600'}, ${initials}, ${specialties || []}, ${available ?? true}, ${rating ?? 5.0})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to create consultant' });
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
        `UPDATE consultants SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      return res.status(200).json(result[0]);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to update consultant' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM consultants WHERE id = ${id}`;
      return res.status(204).end();
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to delete consultant' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

interface Consultant {
  id: string;
  name: string;
  title: string;
  avatar_gradient: string;
  initials: string;
  specialties: string[];
  available: boolean;
  rating: number;
  created_at: string;
}
