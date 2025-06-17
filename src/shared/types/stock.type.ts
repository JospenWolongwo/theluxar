import type { StockAvailabilityStatus } from '../enums';
import type { Discount } from './discount.type';
import type { Review } from './review.type';
import type { TimeLapse } from './time-lapse.type';

export type Stock = {
  id: string;
  quantity: number;
  price: number;
  characteristics?: Record<string, string>;
  isAvailable?: boolean;
  discount?: number;
  availabilityStatus?: StockAvailabilityStatus;
  keepingUnit?: string;
  guarantee?: TimeLapse;
  pictures?: string[];
  description?: {
    shortDescription: string | null;
    longDescription: string[] | null;
  } | null;
  manualPdf?: string | null;
  deliveryDuration?: TimeLapse | null;
  reviews?: Review[];
  discounts?: Discount[];
};
