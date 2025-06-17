/**
 * Raw review data types as received from the API
 * before normalization
 */
export type ApiReview = {
  id?: string;
  username?: string;
  user?: {
    email: string;
  };
  comment?: string;
  feedbackDetails?: string;
  rating?: number;
  title?: string;
  feedbackSummary?: string;
  createdAt?: Date | string;
  verified?: boolean;
  helpful?: number;
  notHelpful?: number;
  content?: string;
  imageUrl?: string;
  position?: string;
};

/**
 * Raw stock data types as received from the API
 * before normalization
 */
export type ApiStock = {
  id?: string;
  quantity?: number | string;
  price?: number | string;
  characteristics?: Record<string, string>;
  isAvailable?: boolean;
  discount?: number;
  discounts?: {
    percentage: number;
    minQuantityToOrder: number;
  }[];
  availabilityStatus?: string;
  keepingUnit?: string;
  guarantee?: {
    duration: number;
    unit: string;
  };
  pictures?: string[];
  description?: {
    shortDescription: string | null;
    longDescription: string[] | null;
  } | null;
  manualPdf?: string | null;
  deliveryDuration?: {
    duration: number;
    unit: string;
  } | null;
  liked?: boolean;
  product?: {
    id: string;
    name: string;
    [key: string]: unknown;
  }; // The serialized product data
};
