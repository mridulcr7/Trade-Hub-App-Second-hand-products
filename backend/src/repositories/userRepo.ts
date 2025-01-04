import pool from '../config/dbConfig';
import { User } from '../models/User';

export const createUserRepo = {
  findByEmail: async (email: string) => {
    const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
    return result.rows[0];
  },
  create: async ({ name, email, password, lat, long }: User) => {
    const result = await pool.query(
      'INSERT INTO public.users (name, email, password, location) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)) RETURNING *',
      [name, email, password, long, lat]
    );
    return result.rows[0];
  }
};
