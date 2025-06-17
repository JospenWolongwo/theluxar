import { Injectable } from '@angular/core';
import type { Product } from '../../../shared/types/product.type';

@Injectable()
export class MockRelatedProductsService {
  getRelatedProducts() {
    return {
      subscribe: (callbacks: { next: (products: Product[]) => void }) => {
        // Product images available in assets
        const productImages = [
          'apple-homepod.png',
          'bose-earbuds.png',
          '4k-tv.png',
          'hp-elitebook.png',
          'iflux-speaker.png',
          'lenovo-thinkpad.png',
          'samsung-s21.png',
          'sony-camera-1.png',
          'sony-camera-2.png',
          'tozo-earbuds.png',
          'wyze-cam.png',
          'xiaomi-mi11.png',
        ];

        // Product categories for better variety
        const categories = [
          { id: 'laptops', name: 'Laptops & Computers' },
          { id: 'smartphones', name: 'Smartphones & Accessories' },
          { id: 'audio', name: 'Audio Equipment' },
          { id: 'cameras', name: 'Cameras & Photography' },
          { id: 'smart-home', name: 'Smart Home Devices' },
        ];

        // Product names mapped to images
        const productNames: { [key: string]: string } = {
          'apple-homepod.png': 'Apple HomePod',
          'bose-earbuds.png': 'Bose Wireless Earbuds',
          '4k-tv.png': 'Ultra HD 4K Smart TV',
          'hp-elitebook.png': 'HP EliteBook',
          'iflux-speaker.png': 'iFlux Premium Speaker',
          'lenovo-thinkpad.png': 'Lenovo ThinkPad',
          'samsung-s21.png': 'Samsung Galaxy S21',
          'sony-camera-1.png': 'Sony Alpha a7 III',
          'sony-camera-2.png': 'Sony Alpha a6400',
          'tozo-earbuds.png': 'TOZO NC9 Earbuds',
          'wyze-cam.png': 'Wyze Cam v3',
          'xiaomi-mi11.png': 'Xiaomi Mi 11',
        };

        // Mock related products with real images
        const relatedProducts: Product[] = productImages.slice(0, 8).map((image, index) => {
          // Select 2-3 random images for gallery (including the main image)
          const randomImages = [...productImages]
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .map((img) => `assets/images/products/${img}`);

          // Always include the product's own image in the gallery
          const mainImage = `assets/images/products/${image}`;
          const galleryImages = [mainImage, ...randomImages.filter((img) => img !== mainImage)];

          // Select a random category
          const category = categories[Math.floor(Math.random() * categories.length)];

          return {
            id: `related-${index + 1}`,
            name: productNames[image] || `Related Product ${index + 1}`,
            price: 199.99 + index * 50,
            currency: 'USD',
            brand: productNames[image]?.split(' ')[0] || 'TechBrand',
            specs: 'High-performance specifications',
            imageUrl: mainImage,
            galleryImages: galleryImages,
            description:
              "This product offers exceptional performance and value with cutting-edge features designed for today's tech enthusiasts.",
            shortDescription: 'High-performance device with premium features',
            inStock: Math.random() > 0.2, // 80% chance of being in stock
            rating: 3 + Math.random() * 2,
            category: category,
            features: ['Premium build quality', 'Extended warranty', 'Energy efficient design', 'Advanced technology'],
          };
        });

        callbacks.next(relatedProducts);

        return {
          unsubscribe: () => {
            // Unsubscribe logic would go here in a real service
          },
        };
      },
    };
  }
}
