import type { ServiceCategory } from '../interfaces/service-category.interface';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'jewelry',
    title: 'Premium Jewelry',
    description: 'Exquisite handcrafted jewelry pieces that complement your unique style and elegance.',
    icon: 'assets/icons/jewelry-icon.png',
    features: [
      'Handcrafted designs',
      'Premium materials',
      'Lifetime warranty',
      'Custom sizing available',
    ],
  },
  {
    id: 'watches',
    title: 'Luxury Watches',
    description: 'Timeless elegance on your wrist with our collection of precision timepieces for all occasions.',
    icon: 'assets/icons/watch-icon.png',
    features: ['Swiss movements', 'Water resistance', 'Sapphire crystal', 'Extended warranty'],
  },
  {
    id: 'styling',
    title: 'Personal Styling',
    description: 'Expert styling consultation to help you find the perfect pieces that match your personality.',
    icon: 'assets/icons/styling-icon.png',
    features: ['Personal consultations', 'Event styling', 'Wardrobe recommendations', 'Trend analysis'],
  },
  {
    id: 'vip',
    title: 'VIP Services',
    description: 'Exclusive services for our valued clients including private showings and priority access.',
    icon: 'assets/icons/vip-icon.png',
    features: ['Private showings', 'Priority access', 'Exclusive events', 'Complimentary maintenance'],
  },
  {
    id: 'shipping',
    title: 'Global Shipping',
    description: 'Safe and secure worldwide delivery with tracking and insurance for complete peace of mind.',
    icon: 'assets/icons/shipping-icon.png',
    features: ['Worldwide shipping', 'Package insurance', 'Express delivery', 'Doorstep service'],
  },
];
