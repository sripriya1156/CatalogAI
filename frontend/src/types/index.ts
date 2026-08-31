export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  shopId: string;
  createdAt?: string;
  updatedAt?: string;
}
