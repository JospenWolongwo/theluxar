import { Injectable } from '@angular/core';
import type { Product } from '../../../shared/types/product.type';
import { MockRelatedProductsService } from './mock-related-products.service';

/**
 * Mock product service for development purposes
 * Will be replaced with a real API service in production
 */
@Injectable()
export class MockProductService {
  getProductById(id: string) {
    return {
      subscribe: (callbacks: { next: (product: Product) => void }) => {
        // Mock product data with stocks and features
        const product: Product = {
          id: id,
          name: 'Dell Latitude Laptop',
          price: 1299.99,
          currency: 'USD',
          brand: 'Dell',
          specs: 'Intel Core i7, 16GB RAM, 512GB SSD, 15.6" FHD Display',
          imageUrl: 'assets/images/products/dell-latitude.png',
          galleryImages: [
            'assets/images/products/dell-latitude.png',
            'assets/images/products/dell-monitor.png',
            'assets/images/products/lenovo-thinkpad.png',
            'assets/images/products/dell-latitude.png',
            'assets/images/products/dell-monitor.png',
            'assets/images/products/lenovo-thinkpad.png',
          ],
          description:
            'The Dell Latitude series offers business-class performance with enterprise-level security features. Perfect for professionals who need reliability and performance on the go.The Dell Latitude series offers business-class performance with enterprise-level security features. Perfect for professionals who need reliability and performance on the go.',
          shortDescription: 'Professional business laptop with enhanced security features',
          inStock: true,
          rating: 4.7,
          category: {
            id: 'laptops',
            name: 'Laptops & Computers',
          },
          features: [
            'Enterprise-grade security',
            'Long battery life (up to 10 hours)',
            'Spill-resistant keyboard',
            'Extensive connectivity options',
            'Optional 4G/5G connectivity',
          ],
          stocks: [
            {
              id: 'stock1',
              isAvailable: true,
              quantity: 10,
              price: 1299.99,
              characteristics: {
                color: 'Black',
                size: '15.6"',
                material: 'Aluminum',
              },
            },
            {
              id: 'stock2',
              isAvailable: true,
              quantity: 5,
              price: 1299.99,
              characteristics: {
                color: 'Silver',
                size: '15.6"',
                material: 'Aluminum',
              },
            },
            {
              id: 'stock3',
              isAvailable: true,
              quantity: 15,
              price: 1349.99,
              characteristics: {
                color: 'Space Gray',
                size: '14"',
                material: 'Aluminum',
              },
            },
            {
              id: 'stock4',
              isAvailable: true,
              quantity: 3,
              price: 1399.99,
              characteristics: {
                color: 'Black',
                size: '13.3"',
                material: 'Carbon Fiber',
              },
            },
            {
              id: 'stock5',
              isAvailable: true,
              quantity: 7,
              price: 1249.99,
              characteristics: {
                color: 'Silver',
                size: '13.3"',
                material: 'Aluminum',
              },
            },
          ],
          reviews: [
            {
              id: '1',
              username: 'JohnDoe',
              comment:
                'Great laptop for business use. The battery life is exceptional and performance is top-notch for my development work.',
              rating: 5,
              title: 'Excellent Business Laptop',
              date: new Date('2025-03-15'),
              verified: true,
              helpful: 12,
              notHelpful: 2,
            },
            {
              id: '2',
              username: 'AliceSmith',
              comment: 'Good laptop but a bit expensive compared to similar models. The display is excellent though.',
              rating: 4,
              title: 'Good quality but pricey',
              date: new Date('2025-02-28'),
              verified: true,
              helpful: 5,
              notHelpful: 1,
            },
          ],
        };
        callbacks.next(product);

        return {
          unsubscribe: () => {
            // Unsubscribe logic would go here in a real service
          },
        };
      },
    };
  }

  // This parameter is intentionally unused in this mock implementation
  // but will be used when connected to real API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getProductsByCategory(_categoryId: string) {
    const relatedProductsService = new MockRelatedProductsService();

    return relatedProductsService.getRelatedProducts();
  }
}
