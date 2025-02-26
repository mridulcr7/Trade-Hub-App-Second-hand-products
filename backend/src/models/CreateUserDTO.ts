// models/CreateUserDTO.ts
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  contact: string;
  image: string | null;

}

export interface LoginUserDTO {
  email: string;
  password: string;
}
