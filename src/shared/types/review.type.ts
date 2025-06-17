export type Review = {
  // Core properties
  id: string | number;
  rating: number;
  imageUrl?: string;
  date?: Date | string;

  // API specific properties
  username?: string;
  comment?: string;
  title?: string;
  verified?: boolean;
  helpful?: number;
  notHelpful?: number;
  content?: string;

  // UI/Component specific properties
  name?: string;
  position?: string;
  reviewText?: string;
};
