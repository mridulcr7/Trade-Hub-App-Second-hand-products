export interface Product {
  id?: string;
  name: string;
  seller_id: string;
  price: number;
  status?: 'sold' | 'unsold';
  category: string;
  verification_status?: 'complete' | 'incomplete';
  created_at?: Date;
  updated_at?: Date;
  latitude: number;
  longitude: number;
  description?: string | null;

}
