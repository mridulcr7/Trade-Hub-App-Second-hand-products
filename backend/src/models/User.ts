export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  lat: number;
  long: number;
  created_at?: Date;
  updated_at?: Date;
}
