import { Pool } from 'pg';
import { Product } from '../models/Product';
import { CreateProductDTO } from '../models/CreateProductDTO';

//const pool = new Pool(); // Add your PostgreSQL connection config here

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // Ensure this is a string
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
});


export const addProduct = async (product: Product): Promise<Product> => {
  const query = `
    INSERT INTO public.products (name, seller_id, price, status, category, verification_status, location, description)
    VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326), $9)
    RETURNING *;
  `;

  const values = [
    product.name,
    product.seller_id,
    product.price,
    product.status || 'unsold',
    product.category,
    product.verification_status || 'incomplete',
    product.latitude,
    product.longitude,
    product.description || null, // Ensure null for undefined values
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error('Failed to add product');
  }
};

//   const query = `
//   UPDATE public.products
//   SET name = COALESCE($2, name),
//       seller_id = COALESCE($3, seller_id),
//       price = COALESCE($4, price),
//       status = COALESCE($5, status),
//       category = COALESCE($6, category),
//       verification_status = COALESCE($7, verification_status),
//       location = CASE 
//                    WHEN $8::float8 IS NOT NULL AND $9::float8 IS NOT NULL 
//                    THEN ST_SetSRID(ST_MakePoint($8::float8, $9::float8), 4326)
//                    ELSE location
//                  END,
//       updated_at = now()
//   WHERE id = $1
//   RETURNING *;
// `;


//   const values = [

//     product.name,
//     product.seller_id,
//     product.price,
//     product.status || 'unsold',
//     product.category,
//     product.verification_status || 'incomplete',
//     product.latitude,
//     product.longitude
//   ];

//   try {
//     const result = await pool.query(query, values);
//     console.log("Query result:", result.rows);
//     return result.rows.length > 0 ? result.rows[0] : null;  // Ensure a valid return value
//   } catch (error) {
//     console.error("Error executing query:", error);
//     throw error;
//   }




export const getAllProductsWithSellerLocation = async (): Promise<(CreateProductDTO & { lat: number; long: number })[]> => {
  const query = `
    SELECT 
      p.id, p.name, p.seller_id, p.price, p.status, 
      p.category, p.verification_status, p.created_at, p.updated_at,
      u.lat, u.long
    FROM products p
    JOIN users u ON p.seller_id = u.id
  `;
  try {
    const result = await pool.query(query);

    return result.rows;
  } catch (error) {
    console.error('Error executing query', error);
    throw new Error('Database query failed');
  }
};

// export const getAllProductsWithDistance = async (
//   userId: string
// ): Promise<(Product & { distance: number })[]> => {
//   const query = `
//     SELECT 
//       p.*, 
//       ST_Distance(u.location, user_location.location) AS distance
//     FROM products p
//     JOIN users u ON p.seller_id = u.id
//     CROSS JOIN (SELECT location FROM users WHERE id = $1) AS user_location
//     ORDER BY distance ASC;
//   `;

//   try {
//     const result = await pool.query(query, [userId]);
//     return result.rows;
//   } catch (error) {
//     console.error('Error fetching products with distance:', error);
//     throw new Error('Failed to fetch products with distance');
//   }
// };


export const getAllProductWithDistance = async (
  lat: number,
  long: number,
  category: string,
  user_id: string,
  page: number = 1,   // Default page = 1
  limit: number = 3    // Default limit = 3
): Promise<(Product & { lat: number; lon: number; distance: number; image_urls: string[] })[]> => {
  const offset = (page - 1) * limit; // Calculate offset for pagination

  const query = `
    SELECT 
      p.*, 
      ST_X(p.location::geometry) AS lat, 
      ST_Y(p.location::geometry) AS lon, 
      ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
        p.location::geography
      )/1000 AS distance,
      COALESCE(
        (
          SELECT json_agg(i.url) 
          FROM images i 
          WHERE i.product_id = p.id
        ), '[]'::json
      ) AS image_urls
    FROM products p
    WHERE LOWER(p.category) = LOWER($3)
      AND p.seller_id != $4  -- Exclude products where the seller_id matches the user_id
    ORDER BY distance ASC
    LIMIT $5 OFFSET $6;  -- Pagination applied here
  `;

  try {
    const result = await pool.query(query, [lat, long, category, user_id, limit, offset]);
    console.log(result.rows);
    return result.rows;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching products with distance:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error("Failed to fetch products with distance");
  }
};


export const getProductByIdRepo = async (id: string): Promise<Product & { image_urls: string[]; lat: number; lon: number }> => {
  const query = `
    SELECT 
      p.*, 
      ST_X(p.location::geometry) AS lat, 
      ST_Y(p.location::geometry) AS lon, 
      COALESCE(
        (
          SELECT json_agg(i.url) 
          FROM images i 
          WHERE i.product_id = p.id
        ), '[]'::json
      ) AS image_urls
    FROM products p
    WHERE p.id = $1;
  `;

  try {
    const result = await pool.query(query, [id]);

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw new Error("Failed to fetch product");
  }
};


// export const getUserProductsRepo = async (userId: string) => {
//   const query = `SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC`;
//   const values = [userId];

//   const result = await pool.query(query, values);
//   return result.rows;
// };


export const getUserProductsRepo = async (userId: string) => {
  const query = `
    SELECT 
      p.*, 
      ST_X(p.location::geometry) AS lat, 
      ST_Y(p.location::geometry) AS lon, 
      COALESCE(
        (
          SELECT json_agg(i.url) 
          FROM images i 
          WHERE i.product_id = p.id
        ), '[]'::json
      ) AS image_urls
    FROM 
      products p
    WHERE 
      p.seller_id = $1 
    ORDER BY 
      p.created_at DESC
  `;
  const values = [userId];

  try {
    const result = await pool.query(query, values);
    // console.log("Query result:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error fetching user products:", error);
    throw new Error("Failed to fetch user products");
  }
};




export const updateProduct = async (productId: string, updateData: any): Promise<any> => {
  try {
    const { price, status, category, latitude, longitude, image_url, verification_status, description } = updateData;
    const setClauses: string[] = [];
    const values: any[] = [productId];

    // Dynamically add the fields to the update query


    if (price) {
      setClauses.push(`price = $${values.length + 1}`);
      values.push(price);
    }

    if (status) {
      setClauses.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (category) {
      setClauses.push(`category = $${values.length + 1}`);
      values.push(category);
    }

    if (latitude && longitude) {
      setClauses.push(`location = ST_SetSRID(ST_MakePoint($${values.length + 1}, $${values.length + 2}), 4326)`);
      values.push(latitude);
      values.push(longitude);
    }

    if (image_url) {
      setClauses.push(`image_url = $${values.length + 1}`);
      values.push(image_url);
    }

    if (verification_status) {
      setClauses.push(`verification_status = $${values.length + 1}`);
      values.push(verification_status);
    }

    if (description) {
      setClauses.push(`description = $${values.length + 1}`);
      values.push(description);
    }
    // If no fields are provided for updating, throw an error
    if (setClauses.length === 0) {
      console.log("jii")
      throw new Error("No fields provided for update");
    }

    // Construct the update query
    const query = `
      UPDATE products
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING *;
    `;

    // Execute the query and handle the result
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Product not found");
    }

    return result.rows[0]; // Return the updated product data

  } catch (error) {
    // console.error("Error updating product:", error);
    throw error; // Re-throw the error to be handled by the service layer
  }
};


export const getRandomProducts = async (
  page: number = 1,
  limit: number = 3,
  userId: string
): Promise<(Product & { lat: number; lon: number; distance: number; image_urls: string[] })[]> => {
  const offset = (page - 1) * limit; // Calculate offset for pagination

  const query = `
    SELECT 
      p.*, 
      ST_X(p.location::geometry) AS lat, 
      ST_Y(p.location::geometry) AS lon, 
      ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
        p.location::geography
      )/1000 AS distance,
      COALESCE(
        (
          SELECT json_agg(i.url) 
          FROM images i 
          WHERE i.product_id = p.id
        ), '[]'::json
      ) AS image_urls
    FROM products p
    WHERE p.status = 'unsold'  -- Only fetch unsold products
      AND p.seller_id != $3  -- Exclude products where the seller_id matches the user_id
    LIMIT $4 OFFSET $5;  -- Pagination applied here
  `;

  try {
    const result = await pool.query(query, [0, 0, userId, limit, offset]); // Pass userId as the parameter
    console.log("Query result:", result.rows);
    return result.rows;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching random unsold products:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error("Failed to fetch random unsold products");
  }
};
