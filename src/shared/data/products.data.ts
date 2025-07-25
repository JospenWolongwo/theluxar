/* eslint-disable max-lines */
import type { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Diamond Infinity Pendant',
    brand: 'TheLuxar',
    specs: '18K Rose Gold, 0.5ct Diamond',
    price: 1250.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/diamond-pendant.jpg',
    description: 'Exquisite infinity pendant featuring brilliant-cut diamonds set in 18K rose gold',
    usageInstructions: 'Store in jewelry box when not in use. Clean with soft cloth.',
    images: [
      {
        id: '1-1',
        url: 'assets/images/products/diamond-pendant.jpg',
        thumbnail: 'assets/images/products/diamond-pendant-thumb.jpg',
      },
      { id: '1-2', url: 'assets/images/products/diamond-pendant-2.jpg' },
    ],
    label: 'LUXURY',
    labelColor: '#e8b4a6',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 1250.0,
    maxPrice: 1250.0,
    createdAt: '2023-01-15',
    updatedAt: '2023-06-20',
    tag: 'jewelry',
    rating: { count: 48, average: 4.8 },
    category: { id: 'cat1', name: 'Jewelry' },
    categoryName: 'Jewelry',
    reviews: [
      {
        id: 'rev1',
        username: 'LuxuryEnthusiast',
        comment: 'The craftsmanship is impeccable. Elegant and timeless.',
        rating: 5,
        title: 'Stunning craftsmanship',
        date: '2023-05-10',
        verified: true,
      },
    ],
    liked: true,
    store: { id: 'store1', name: 'TheLuxar Flagship' },
    stocks: [
      {
        id: 'stock1',
        quantity: 12,
        price: 1250.0,
        characteristics: { material: '18K Rose Gold', stone: '0.5ct Diamond' },
        isAvailable: true,
      },
    ],
    features: ['Conflict-free diamonds', 'Handcrafted in Italy', 'Certificate of authenticity included'],
    galleryImages: [
      'assets/images/products/diamond-pendant-gallery1.jpg',
      'assets/images/products/diamond-pendant-gallery2.jpg',
    ],
  },
  {
    id: '2',
    name: 'Swiss Chronograph Watch',
    brand: 'TheLuxar',
    specs: 'Automatic Movement, Sapphire Crystal',
    price: 3500.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/luxury-watch.jpg',
    description: 'Precision Swiss-made automatic chronograph with sapphire crystal and exhibition caseback',
    images: [{ id: '2-1', url: 'assets/images/products/luxury-watch.jpg' }],
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 3500.0,
    maxPrice: 3500.0,
    createdAt: '2023-02-10',
    rating: 4.9,
    category: { id: 'cat2', name: 'Watches' },
    stocks: [
      {
        id: 'stock2',
        quantity: 8,
        price: 3500.0,
        isAvailable: true,
      },
    ],
    features: ['Swiss-made movement', '100m water resistance', '5-year warranty'],
  },
  {
    id: '3',
    name: 'Sapphire and Diamond Tennis Bracelet',
    brand: 'TheLuxar',
    specs: '14K White Gold, Blue Sapphires and Diamonds',
    price: 4200.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/tennis-bracelet.jpg',
    label: 'NEW',
    labelColor: '#e8b4a6',
    description: 'Elegant tennis bracelet featuring alternating blue sapphires and white diamonds in 14K white gold',
    images: [{ id: '3-1', url: 'assets/images/products/tennis-bracelet.jpg' }],
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 4200.0,
    maxPrice: 4200.0,
    createdAt: '2023-03-05',
    rating: { count: 32, average: 4.9 },
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock3',
        quantity: 5,
        price: 4200.0,
        isAvailable: true,
      },
    ],
    features: ['Natural sapphires and diamonds', 'Secure clasp', 'Adjustable length'],
  },
  {
    id: '4',
    name: 'Emerald Cut Engagement Ring',
    brand: 'TheLuxar',
    specs: 'Platinum, 1.5ct Emerald Cut Diamond',
    price: 8500.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/engagement-ring.jpg',
    label: 'LUXURY',
    labelColor: '#e8b4a6',
    description: 'Stunning emerald cut diamond solitaire set in platinum with pavé diamond band',
    images: [{ id: '4-1', url: 'assets/images/products/engagement-ring.jpg' }],
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 8500.0,
    maxPrice: 8500.0,
    createdAt: '2023-04-15',
    rating: 5.0,
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock4',
        quantity: 3,
        price: 8500.0,
        characteristics: { material: 'Platinum', certification: 'GIA' },
        isAvailable: true,
      },
    ],
    features: ['GIA certified diamond', 'Custom sizing available', 'Lifetime warranty'],
  },
  {
    id: '5',
    name: 'Luxury Dive Watch',
    brand: 'TheLuxar',
    specs: 'Stainless Steel, Ceramic Bezel, 300m Water Resistant',
    price: 4800.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/dive-watch.jpg',
    description: 'Professional dive watch featuring ceramic bezel and Super-LumiNova markers',
    images: [{ id: '5-1', url: 'assets/images/products/dive-watch.jpg' }],
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 4800.0,
    maxPrice: 4800.0,
    createdAt: '2023-01-25',
    rating: 4.7,
    category: { id: 'cat2', name: 'Watches' },
    stocks: [
      {
        id: 'stock5',
        quantity: 12,
        price: 4800.0,
        isAvailable: true,
      },
    ],
    features: ['300m water resistance', 'Ceramic bezel', 'Automatic movement'],
  },
  {
    id: '6',
    name: 'Exclusive Iris Parfum',
    brand: 'TheLuxar',
    specs: 'Eau de Parfum, 100ml',
    price: 380.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/luxury-perfume.jpg',
    label: 'LUXURY',
    labelColor: '#e8b4a6',
    description: 'Exquisite iris-based fragrance with notes of amber, vanilla, and cashmere wood',
    images: [{ id: '6-1', url: 'assets/images/products/luxury-perfume.jpg' }],
    shortDescription: 'Sophisticated fragrance for the modern woman',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 380.0,
    maxPrice: 380.0,
    createdAt: '2023-02-20',
    rating: { count: 42, average: 4.9 },
    category: { id: 'cat3', name: 'Perfumes' },
    stocks: [
      {
        id: 'stock6',
        quantity: 15,
        price: 380.0,
        isAvailable: true,
      },
    ],
    features: ['Long-lasting fragrance', 'Luxury crystal bottle', 'Signature scent'],
  },
  {
    id: '7',
    name: "Gentleman's Classic Timepiece",
    brand: 'TheLuxar',
    specs: 'Mechanical Movement, Rose Gold Case, Brown Leather Strap',
    price: 2650.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/mens-watch.jpg',
    description: "Sophisticated men's watch featuring mechanical movement, rose gold case, and genuine brown leather strap",
    images: [{ id: '7-1', url: 'assets/images/products/mens-watch.jpg' }],
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 2650.0,
    maxPrice: 2650.0,
    createdAt: '2023-03-18',
    rating: 4.8,
    category: { id: 'cat2', name: 'Watches' },
    stocks: [
      {
        id: 'stock7',
        quantity: 8,
        price: 2650.0,
        isAvailable: true,
      },
    ],
    features: ['In-house movement', 'Exhibition caseback', 'Scratch-resistant sapphire crystal'],
  },
  {
    id: '8',
    name: "Children's Angel Wing Pendant",
    brand: 'TheLuxar Kids',
    specs: '14K Yellow Gold, Small Diamonds',
    price: 350.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/kids-pendant.jpg',
    label: 'NEW',
    labelColor: '#e8b4a6',
    description: 'Delicate angel wing pendant crafted for children with small diamonds and 14K yellow gold',
    images: [{ id: '8-1', url: 'assets/images/products/kids-pendant.jpg' }],
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 350.0,
    maxPrice: 350.0,
    createdAt: '2023-05-05',
    rating: { count: 42, average: 4.9 },
    category: { id: 'cat4', name: 'Kids' },
    stocks: [
      {
        id: 'stock8',
        quantity: 15,
        price: 350.0,
        isAvailable: true,
      },
    ],
    features: ['Child-safe clasp', 'Adjustable chain length', 'Gift box included'],
  },
  {
    id: '9',
    name: 'Obsidian Oud for Men',
    brand: 'TheLuxar',
    specs: "Men's Fragrance, 100ml",
    price: 420.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/mens-fragrance.jpg',
    label: 'LUXURY',
    labelColor: '#e8b4a6',
    description: 'Bold and sophisticated fragrance for men featuring rare oud, leather, and spice notes',
    images: [{ id: '9-1', url: 'assets/images/products/mens-fragrance.jpg' }],
    shortDescription: 'Premium masculine fragrance with exotic woods and amber',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 420.0,
    maxPrice: 420.0,
    createdAt: '2023-07-10',
    rating: { count: 36, average: 4.9 },
    category: { id: 'cat3', name: 'Perfumes' },
    stocks: [
      {
        id: 'stock9',
        quantity: 20,
        price: 120.0,
        isAvailable: true,
      },
    ],
    features: ['Long-lasting', 'Iconic scent', 'Luxury packaging'],
  },
  {
    id: '10',
    name: 'Golden Charm Bracelet',
    brand: 'TheLuxar',
    specs: '18K Gold, Italian Craftsmanship',
    price: 3200.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/gold-bracelet.jpg',
    label: 'LUXURY',
    labelColor: '#e8b4a6',
    description: 'Exquisite 18K gold charm bracelet featuring hand-finished links and designer clasp',
    images: [{ id: '10-1', url: 'assets/images/products/gold-bracelet.jpg' }],
    shortDescription: 'Timeless golden elegance for special occasions',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 3200.0,
    maxPrice: 3200.0,
    createdAt: '2023-08-01',
    rating: { count: 28, average: 4.9 },
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock10',
        quantity: 15,
        price: 299.0,
        isAvailable: true,
      },
    ],
    features: ['Siri integration', 'Room-filling sound', 'Smart home hub'],
  },
  {
    id: '11',
    name: 'Limited Edition Chronograph',
    brand: 'TheLuxar',
    specs: 'Swiss Movement, Titanium Case, Sapphire Crystal',
    price: 5800.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/luxury-chronograph.jpg',
    label: 'LIMITED',
    labelColor: '#e8b4a6',
    description: 'Limited edition luxury chronograph with Swiss movement, titanium case, and exhibition caseback',
    images: [{ id: '11-1', url: 'assets/images/products/luxury-chronograph.jpg' }],
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 5800.0,
    maxPrice: 5800.0,
    createdAt: '2023-05-20',
    rating: { count: 18, average: 5.0 },
    category: { id: 'cat2', name: 'Watches' },
    stocks: [
      {
        id: 'stock11',
        quantity: 5,
        price: 5800.0,
        discount: 0,
        isAvailable: true,
      },
    ],
    features: ['Limited production run', '100m water resistance', 'Handcrafted in Switzerland'],
  },
  {
    id: '12',
    name: 'Diamond Teardrop Pendant',
    brand: 'TheLuxar',
    specs: '18K White Gold, 1.25ct Diamond, VS Clarity',
    price: 4750.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/diamond-pendant.jpg',
    description: 'Elegant teardrop pendant featuring a brilliant 1.25 carat diamond in a white gold setting',
    images: [{ id: '12-1', url: 'assets/images/products/diamond-pendant.jpg' }],
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 4750.0,
    maxPrice: 4750.0,
    createdAt: '2023-04-15',
    rating: { count: 24, average: 4.9 },
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock12',
        quantity: 7,
        price: 4750.0,
        isAvailable: true,
      },
    ],
    features: ['Conflict-free diamond', 'Adjustable 18-inch chain', 'Signature gift box'],
  },
  {
    id: '13',
    name: 'Diamond Encrusted Ladies Watch',
    brand: 'TheLuxar',
    specs: 'Diamond-Set Bezel, Mother of Pearl Dial, Rose Gold Case',
    price: 7200.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/ladies-diamond-watch.jpg',
    label: 'EXCLUSIVE',
    labelColor: '#e8b4a6',
    description: 'Exquisite women\'s timepiece featuring a diamond-set bezel, mother of pearl dial, and rose gold case',
    images: [{ id: '13-1', url: 'assets/images/products/ladies-diamond-watch.jpg' }],
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 7200.0,
    maxPrice: 7200.0,
    createdAt: '2023-06-10',
    rating: { count: 14, average: 5.0 },
    category: { id: 'cat2', name: 'Watches' },
    stocks: [
      {
        id: 'stock13',
        quantity: 4,
        price: 7200.0,
        discount: 0,
        isAvailable: true,
      },
    ],
    features: ['Swiss quartz movement', 'Sapphire crystal', 'Water resistant to 30m'],
  },
  {
    id: '14',
    name: 'Sapphire Drop Earrings',
    brand: 'TheLuxar',
    specs: '18K White Gold, Blue Sapphires and Diamonds',
    price: 3850.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/sapphire-earrings.jpg',
    label: 'NEW',
    labelColor: '#e8b4a6',
    description: 'Elegant drop earrings featuring brilliant blue sapphires surrounded by pave-set diamonds',
    images: [{ id: '14-1', url: 'assets/images/products/sapphire-earrings.jpg' }],
    shortDescription: 'Stunning sapphire and diamond earrings for special occasions',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 3850.0,
    maxPrice: 3850.0,
    createdAt: '2023-07-25',
    rating: { count: 16, average: 4.9 },
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock14',
        quantity: 8,
        price: 3850.0,
        isAvailable: true,
      },
    ],
    features: ['Secure lever backs', 'Total sapphire weight: 2ct', 'Total diamond weight: 0.5ct'],
  },
  {
    id: '15',
    name: 'Celestial Unisex Perfume',
    brand: 'TheLuxar',
    specs: 'Eau de Parfum, 75ml, Unisex Fragrance',
    price: 450.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/unisex-perfume.jpg',
    label: 'SIGNATURE',
    labelColor: '#e8b4a6',
    description: 'Sophisticated unisex fragrance with notes of sandalwood, amber, and bergamot',
    images: [{ id: '15-1', url: 'assets/images/products/unisex-perfume.jpg' }],
    shortDescription: 'Timeless unisex fragrance for day and evening wear',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 450.0,
    maxPrice: 450.0,
    createdAt: '2023-08-05',
    rating: { count: 31, average: 4.8 },
    category: { id: 'cat3', name: 'Perfumes' },
    stocks: [
      {
        id: 'stock15',
        quantity: 20,
        price: 450.0,
        isAvailable: true,
      },
    ],
    features: ['Long-lasting scent', 'Artisan crystal bottle', 'Sustainable packaging'],
  },
  {
    id: '16',
    name: "Men's Steel & Leather Bracelet",
    brand: "TheLuxar",
    specs: 'Stainless Steel & Italian Leather, Magnetic Clasp',
    price: 580.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/mens-bracelet.jpg',
    label: 'BESTSELLER',
    labelColor: '#e8b4a6',
    description: 'Premium steel and leather bracelet for men with magnetic clasp and minimalist design',
    images: [{ id: '16-1', url: 'assets/images/products/mens-bracelet.jpg' }],
    shortDescription: 'Modern masculine accessory combining strength and elegance',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 580.0,
    maxPrice: 580.0,
    createdAt: '2023-01-10',
    rating: { count: 86, average: 4.8 },
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock16',
        quantity: 25,
        price: 580.0,
        isAvailable: true,
      },
    ],
    features: ['Premium Italian leather', 'Hypoallergenic stainless steel', 'Adjustable size'],
  },
  {
    id: '17',
    name: "Child's Gold ID Bracelet",
    brand: 'TheLuxar Kids',
    specs: '14K Yellow Gold, Engravable',
    price: 290.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/kids-bracelet.jpg',
    description: 'Delicate gold ID bracelet for children, perfect for personalization',
    images: [{ id: '17-1', url: 'assets/images/products/kids-bracelet.jpg' }],
    shortDescription: 'Beautiful engravable bracelet for special occasions',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 290.0,
    maxPrice: 290.0,
    createdAt: '2023-02-28',
    rating: { count: 48, average: 4.9 },
    category: { id: 'cat4', name: 'Kids' },
    stocks: [
      {
        id: 'stock17',
        quantity: 22,
        price: 290.0,
        characteristics: { style: 'Heart Charm' },
        isAvailable: true,
      },
    ],
    features: ['Safety clasp', 'Free engraving', 'Adjustable size'],
  },
  {
    id: '18',
    name: 'Onyx & Gold Cufflinks',
    brand: 'TheLuxar',
    specs: '18K Gold with Onyx Inlay',
    price: 780.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/luxury-cufflinks.jpg',
    label: 'EXCLUSIVE',
    labelColor: '#e8b4a6',
    description: 'Elegant onyx and gold cufflinks featuring sleek modern design',
    images: [{ id: '18-1', url: 'assets/images/products/luxury-cufflinks.jpg' }],
    shortDescription: 'Sophisticated accessory for the modern gentleman',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 780.0,
    maxPrice: 780.0,
    createdAt: '2023-03-15',
    rating: { count: 32, average: 4.8 },
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock18',
        quantity: 12,
        price: 780.0,
        characteristics: { style: 'Classic' },
        isAvailable: true,
      },
    ],
    features: ['Artisan crafted', 'Premium gift box', 'Easy toggle closure'],
  },
  {
    id: '19',
    name: 'Akoya Pearl Strand Necklace',
    brand: 'TheLuxar',
    specs: 'AAA Grade Pearls, 18K White Gold Clasp',
    price: 2400.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/pearl-necklace.jpg',
    label: 'LUXURY',
    labelColor: '#e8b4a6',
    description: 'Elegant strand of perfectly matched Akoya pearls with 18K white gold clasp',
    images: [{ id: '19-1', url: 'assets/images/products/pearl-necklace.jpg' }],
    shortDescription: 'Timeless pearl necklace for elegant occasions',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 2400.0,
    maxPrice: 2400.0,
    createdAt: '2023-04-05',
    rating: { count: 22, average: 5.0 },
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock19',
        quantity: 6,
        price: 2400.0,
        characteristics: { length: '18 inches' },
        isAvailable: true,
      },
    ],
    features: ['Hand-knotted', 'Premium luster', 'Secure safety clasp'],
  },
  {
    id: '20',
    name: 'Platinum Tourbillon Timepiece',
    brand: 'TheLuxar',
    specs: 'Platinum Case, Sapphire Crystal, Alligator Strap',
    price: 12500.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/platinum-watch.jpg',
    label: 'PREMIUM',
    labelColor: '#e8b4a6',
    description: 'Exquisite hand-crafted platinum watch with tourbillon movement',
    images: [{ id: '20-1', url: 'assets/images/products/platinum-watch.jpg' }],
    shortDescription: 'Masterpiece of horological craftsmanship',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 12500.0,
    maxPrice: 12500.0,
    createdAt: '2023-05-12',
    rating: { count: 8, average: 5.0 },
    category: { id: 'cat2', name: 'Watches' },
    stocks: [
      {
        id: 'stock20',
        quantity: 3,
        price: 12500.0,
        isAvailable: true,
      },
    ],
    features: ['Tourbillon movement', 'Platinum case', 'Limited edition'],
  },
  {
    id: '21',
    name: "Children's Silver Star Watch",
    brand: 'TheLuxar Kids',
    specs: 'Silver Case with Star Design, Leather Strap',
    price: 350.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/kids-watch.jpg',
    label: 'NEW',
    labelColor: '#e8b4a6',
    description: 'Elegant and playful silver watch designed especially for children',
    images: [{ id: '21-1', url: 'assets/images/products/kids-watch.jpg' }],
    shortDescription: 'Luxury timepiece teaching children to value time',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 350.0,
    maxPrice: 350.0,
    createdAt: '2023-06-18',
    rating: { count: 37, average: 4.9 },
    category: { id: 'cat4', name: 'Kids' },
    stocks: [
      {
        id: 'stock21',
        quantity: 15,
        price: 350.0,
        isAvailable: true,
      },
    ],
    features: ['Child-friendly clasp', 'Learning time display', 'Water resistant'],
  },
  {
    id: '22',
    name: 'Midnight Rose Essence',
    brand: 'TheLuxar',
    specs: 'Eau de Parfum, 75ml',
    price: 850.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/womens-perfume.jpg',
    label: 'BESTSELLER',
    labelColor: '#e8b4a6',
    description: 'Opulent floral fragrance with notes of Bulgarian rose, jasmine and amber',
    images: [{ id: '22-1', url: 'assets/images/products/womens-perfume.jpg' }],
    shortDescription: 'Exquisite fragrance for the sophisticated woman',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 850.0,
    maxPrice: 850.0,
    createdAt: '2023-02-15',
    rating: { count: 58, average: 4.9 },
    category: { id: 'cat3', name: 'Perfumes' },
    stocks: [
      {
        id: 'stock22',
        quantity: 18,
        price: 850.0,
        isAvailable: true,
      },
    ],
    features: ['Long-lasting scent', 'Handcrafted crystal bottle', 'Signature TheLuxar scent'],
  },
  {
    id: '23',
    name: 'Diamond Tennis Bracelet',
    brand: 'TheLuxar',
    specs: '3.5 carat Diamonds, 18K White Gold',
    price: 4850.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/diamond-bracelet.jpg',
    description: 'Exquisite diamond tennis bracelet with brilliant-cut stones set in 18K white gold',
    images: [{ id: '23-1', url: 'assets/images/products/diamond-bracelet.jpg' }],
    shortDescription: 'Timeless luxury piece with 3.5 carats of VS clarity diamonds',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 4850.0,
    maxPrice: 4850.0,
    createdAt: '2023-03-25',
    rating: { count: 29, average: 5.0 },
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock23',
        quantity: 7,
        price: 4850.0,
        isAvailable: true,
      },
    ],
    features: ['VS clarity diamonds', 'Secure box clasp', 'Complimentary appraisal'],
  },
  {
    id: '24',
    name: 'Rose Gold Petal Watch',
    brand: 'TheLuxar',
    specs: '18K Rose Gold, Mother of Pearl Dial',
    price: 3850.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/womens-rose-watch.jpg',
    label: 'SIGNATURE',
    labelColor: '#e8b4a6',
    description: 'Exquisite women\'s watch with flower petal design and mother of pearl dial',
    images: [{ id: '24-1', url: 'assets/images/products/womens-rose-watch.jpg' }],
    shortDescription: 'Delicate timepiece blending beauty and precision',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 3850.0,
    maxPrice: 3850.0,
    createdAt: '2023-04-20',
    rating: { count: 34, average: 4.9 },
    category: { id: 'cat2', name: 'Watches' },
    stocks: [
      {
        id: 'stock24',
        quantity: 11,
        price: 3850.0,
        isAvailable: true,
      },
    ],
    features: ['Swiss movement', 'Sapphire crystal', 'Water resistant to 30m'],
  },
  {
    id: '25',
    name: "Child's Butterfly Pendant",
    brand: 'TheLuxar Kids',
    specs: '14K Yellow Gold with Diamond Accents',
    price: 420.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/kids-butterfly-pendant.jpg',
    label: 'NEW',
    labelColor: '#e8b4a6',
    description: 'Delicate butterfly pendant with small diamond accents, perfect for children',
    images: [{ id: '25-1', url: 'assets/images/products/kids-butterfly-pendant.jpg' }],
    shortDescription: 'Enchanting butterfly necklace for special occasions',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 420.0,
    maxPrice: 420.0,
    createdAt: '2023-05-30',
    rating: { count: 32, average: 4.9 },
    category: { id: 'cat4', name: 'Kids' },
    stocks: [
      {
        id: 'stock25',
        quantity: 14,
        price: 420.0,
        isAvailable: true,
      },
    ],
    features: ['Adjustable chain', 'Safety clasp', 'Gift box included'],
  },
  {
    id: '26',
    name: 'Diamond Solitaire Engagement Ring',
    brand: 'TheLuxar',
    specs: '2 Carat Diamond, Platinum Setting',
    price: 7500.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/diamond-ring.jpg',
    label: 'LUXURY',
    labelColor: '#e8b4a6',
    description: 'Exquisite 2-carat diamond solitaire ring with platinum band',
    images: [{ id: '26-1', url: 'assets/images/products/diamond-ring.jpg' }],
    shortDescription: 'Timeless symbol of love with brilliant-cut VS clarity diamond',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 7500.0,
    maxPrice: 7500.0,
    createdAt: '2023-07-05',
    rating: { count: 18, average: 5.0 },
    category: { id: 'cat1', name: 'Jewelry' },
    stocks: [
      {
        id: 'stock26',
        quantity: 5,
        price: 7500.0,
        isAvailable: true,
      },
    ],
    features: ['VS clarity diamond', 'Platinum setting', 'Lifetime warranty'],
  },
  {
    id: '27',
    name: 'Amber & Sandalwood Cologne',
    brand: 'TheLuxar',
    specs: 'Eau de Parfum for Men, 100ml',
    price: 650.0,
    currency: 'XAF',
    imageUrl: 'assets/images/products/mens-cologne.jpg',
    label: 'SIGNATURE',
    labelColor: '#e8b4a6',
    description: 'Sophisticated cologne with notes of amber, sandalwood and leather',
    images: [{ id: '27-1', url: 'assets/images/products/mens-cologne.jpg' }],
    shortDescription: 'A bold masculine scent for the distinguished gentleman',
    inWishlist: false,
    inStock: true,
    active: true,
    minPrice: 650.0,
    maxPrice: 650.0,
    createdAt: '2023-03-10',
    rating: { count: 42, average: 4.9 },
    category: { id: 'cat3', name: 'Perfumes' },
    stocks: [
      {
        id: 'stock27',
        quantity: 24,
        price: 650.0,
        characteristics: { size: '100ml' },
        isAvailable: true,
      },
    ],
    features: ['Long-lasting formula', 'Handcrafted wooden cap', 'Engraved crystal bottle'],
  },
];
