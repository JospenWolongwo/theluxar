export type ProductLabel = 'SALE' | 'NOUVEAU' | 'SOLDE' | 'PROMO' | '-25% OFF' | 'BESTSELLER' | 'LUXURY' | 'NEW' | 'SIGNATURE' | 'LIMITED' | 'EXCLUSIVE' | 'PREMIUM' | null;

import type { StockAvailabilityStatus } from '../enums';

export type ProductRating =
  | number
  | {
      count: number;
      average: number;
    };

export interface Stock {
  id: string;
  quantity: number;
  price: number;
  characteristics?: Record<string, string>;
  discount?: number;
  isAvailable?: boolean;
  availabilityStatus?: StockAvailabilityStatus;
}

export interface Review {
  id?: string;
  username: string;
  comment: string;
  rating: number;
  title?: string;
  date?: Date | string;
  verified?: boolean;
  helpful?: number;
  notHelpful?: number;
  content?: string;
  imageUrl?: string;
}

export type Product = {
  id: string;
  name: string;
  brand?: string;
  sku?: string;
  specs: string;
  imageUrl: string;
  description?: string;
  ingredients?: string;
  usageInstructions?: string;
  images: Array<{
    id: string;
    url: string;
    thumbnail?: string;
  }>;
  variants?: Array<{
    id: string;
    name: string;
    price?: number;
  }>;
  shortDescription?: string;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  price: number;
  currency: string;
  slug?: string;
  label?: ProductLabel;
  labelColor?: string;
  inStock: boolean;
  extraAttributes?: Record<string, unknown>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  tag?: string;
  volume?: string;
  rating?: ProductRating;
  inWishlist?: boolean;
  category?: {
    id: string;
    name: string;
  };
  categoryName?: string;
  reviews?: Review[];
  liked?: boolean;
  store?: {
    id: string;
    name: string;
  } | null;
  stocks?: Stock[];
  features?: string[];
  gallery?: string;
  galleryImages?: string[];
};
