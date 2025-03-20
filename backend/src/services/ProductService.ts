import { CreateProductDTO } from '../models/CreateProductDTO';
import { Product } from '../models/Product';
import { addProduct, updateProduct } from '../repositories/ProductRepository';
import { createUserRepo } from '../repositories/userRepo';
import { getAllProductsWithSellerLocation } from '../repositories/ProductRepository';
import { getAllProductWithDistance } from '../repositories/ProductRepository';
import { getProductByIdRepo } from '../repositories/ProductRepository';
import { getUserProductsRepo } from '../repositories/ProductRepository';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}


export const createProduct = async (dto: CreateProductDTO, userId: string): Promise<Product> => {
  const product: Product = {
    name: dto.name,
    seller_id: userId,
    price: dto.price,
    category: dto.category,
    description: dto.description ?? null,
    status: 'unsold', // Set default
    verification_status: 'incomplete', // Set default
    created_at: new Date(), // Auto-generated
    updated_at: new Date(),// Auto-generated
    latitude: dto.latitude,
    longitude: dto.longitude,
  };


  return await addProduct(product);
};


// export const getAllProducts = async (userId: string): Promise<(CreateProductDTO& { distance: number })[]> => {
//   try {
//     // Fetch current user's location
//     const userLocation = await createUserRepo.getUserLocation(userId);

//     console.log(userLocation)

//     // Fetch all products with seller location
//     const productsWithSellerLocation = await getAllProductsWithSellerLocation();

//     // Calculate distances for all products
//     const productsWithDistance = productsWithSellerLocation.map(product=> {
//       const distance = calculateDistance(
//         userLocation.lat,
//         userLocation.long,
//         product.lat,
//         product.long
//       );

//       return { ...product, distance };
//     });

//     // Sort products by distance (ascending order)
//     productsWithDistance.sort((a, b) => a.distance - b.distance);

//     return productsWithDistance;
//   } catch (error) {
//     console.error('Error in product service', error);
//     throw new Error('Failed to retrieve products');
//   }
// };




// export const getAllProducts = async (userId: string): Promise<(Product & { distance: number })[]> => {
//   try {
//     return await getAllProductsWithDistance(userId);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw new Error('Failed to fetch products');
//   }
// };


export const getAllProducts = async (
  lat: number,
  long: number,
  category: string,
  userId: string,
  page: number,
  limit: number
): Promise<(Product & { distance: number })[]> => {
  try {
    return await getAllProductWithDistance(lat, long, category, userId, page, limit);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};


export const getProductById = async (id: string) => {
  try {

    const product = await getProductByIdRepo(id); // Fetch product from DB
    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};


export const getUserProductsService = async (userId: string) => {
  return await getUserProductsRepo(userId);
};



export const updateProductService = async (id: string, updatedFields: any): Promise<Product | null> => {
  try {
    const product = await getProductByIdRepo(id);

    if (!product) {
      throw new Error("Product not found");
    }

    // Forward errors from `updateProduct`
    return await updateProduct(id, updatedFields);
  } catch (error: any) {
    console.error("Service Error:", error.message || error);
    throw new Error(error.message || "Error updating product"); // Preserve original error message
  }
};
