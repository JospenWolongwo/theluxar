export { ApiReview, ApiStock } from './api-types';
export { Discount } from './discount.type';
export { Product, ProductRating } from './product.type';
export { Review } from './review.type';
export { ShowcaseItem } from './showcase-item.type';
export { Stock } from './stock.type';
export { TimeLapse } from './time-lapse.type';

export interface Link {
  name: string;
  url: string;
}

export interface ScreenSize {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  ltSm: boolean;
  ltMd: boolean;
  ltLg: boolean;
  ltXl: boolean;
  gtXs: boolean;
  gtSm: boolean;
  gtMd: boolean;
  gtLg: boolean;
}

export type Screen = keyof ScreenSize;
