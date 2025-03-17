import pool from '../config/dbConfig';
import { User } from '../models/User';


export const createUserRepo = {
    findByEmail: async (email: string) => {
        const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
        return result.rows[0];
    },
    create: async ({ name, email, password, contact, image }: User) => {
        const result = await pool.query(
            'INSERT INTO public.users (name, email, password, contact, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, password, contact, image]
        );
        return result.rows[0];
    },
    findByContact: async (contact: string) => {
        const result = await pool.query('SELECT * FROM public.users WHERE contact = $1', [contact]);
        return result.rows[0]; // Return the user if found
    },


    findAllUsers: async () => {
        const result = await pool.query('SELECT * FROM public.users');
        return result.rows
    },
    findById: async (userId: Number) => {
        //console.log(userId)
        const result = await pool.query('SELECT * FROM public.users WHERE id = $1', [userId]);
        // console.log(result)
        return result.rows[0];


    },

    isContactExists: async (contact: string, userId: number) => {
        const result = await pool.query(
            `SELECT id FROM users WHERE contact = $1 AND id != $2`,
            [contact, userId]
        );
        return result.rows.length > 0; // Returns true if contact exists
    },


    update: async (userId: number, updateData: any) => {
        try {
            const { name, contact, image } = updateData;
            const setClauses = [];
            const values = [userId];

            if (name) {
                setClauses.push(`name = $${values.length + 1}`);
                values.push(name);
            }

            if (contact) {
                setClauses.push(`contact = $${values.length + 1}`);
                values.push(contact);
            }

            if (image) {
                setClauses.push(`image_url = $${values.length + 1}`);
                values.push(image);
            }

            if (setClauses.length === 0) {
                throw new Error("No fields provided for update");
            }

            const query = `
            UPDATE users
            SET ${setClauses.join(", ")}
            WHERE id = $1
            RETURNING *;
        `;

            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                throw new Error("User not found");
            }

            return result.rows[0];
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    },


    // ,
    // getUserLocation :async (userId: string)=> {
    //   const query = `
    //     SELECT lat, long
    //     FROM public.users
    //     WHERE id = $1
    //   `;
    //   const values = [userId];

    //   try {
    //     const result = await pool.query(query, values);

    //     if (result.rows.length === 0) {
    //       throw new Error('User not found');
    //     }

    //     return result.rows[0];
    //   } catch (error) {

    //     console.error('Error fetching user location:', error);
    //     throw new Error('Failed to fetch user location');
    //   }
    // }

};



