import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { ApiService } from './api.service';
import { of, throwError } from 'rxjs';
import { MOCK_PRODUCTS } from '../../shared/data/products.data';
import { ApiReview, ApiStock } from '../../shared/types/api-types';
import { StockAvailabilityStatus } from '../../shared/enums';

describe('ProductService', () => {
  let service: ProductService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    // Create spy object for ApiService
    const spy = jasmine.createSpyObj('ApiService', ['get']);
    
    // Set a default response for get calls to prevent errors
    spy.get.and.returnValue(of([]));
    
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: ApiService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(ProductService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    
    // Reset spy counts after initialization
    apiServiceSpy.get.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should return products from API', (done) => {
      const mockApiProducts = [
        { id: '1', name: 'Test Product 1', price: 100 },
        { id: '2', name: 'Test Product 2', price: 200 }
      ];
      
      apiServiceSpy.get.and.returnValue(of(mockApiProducts));
      
      service.getProducts().subscribe(products => {
        expect(products.length).toBe(2);
        expect(products[0].name).toBe('Test Product 1');
        expect(products[0].slug).toBeTruthy(); // Should generate a slug
        done();
      });
      
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/products', jasmine.any(Array));
    });
    
    it('should respect limit parameter', (done) => {
      apiServiceSpy.get.and.returnValue(of(MOCK_PRODUCTS.slice(0, 2)));
      
      service.getProducts(2).subscribe(products => {
        expect(products.length).toBe(2);
        done();
      });
      
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/products?limit=2', jasmine.any(Array));
    });
  });
  
  describe('getProductById', () => {
    it('should return a product by id', (done) => {
      const mockProduct = { id: '123', name: 'Test Product', price: 100 };
      apiServiceSpy.get.and.returnValue(of(mockProduct));
      
      service.getProductById('123').subscribe(product => {
        expect(product.id).toBe('123');
        expect(product.name).toBe('Test Product');
        done();
      });
      
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/products/123', jasmine.any(Object));
    });
  });
  
  describe('getProductsByCategory', () => {
    it('should return products by category', (done) => {
      const mockCategoryProducts = [
        { id: '1', name: 'Category Product 1', price: 100, category: 'electronics' },
        { id: '2', name: 'Category Product 2', price: 200, category: 'electronics' }
      ];
      
      apiServiceSpy.get.and.returnValue(of(mockCategoryProducts));
      
      service.getProductsByCategory('electronics').subscribe(products => {
        expect(products.length).toBe(2);
        expect(products[0].category).toBeTruthy(); // Simply check that category exists
        done();
      });
      
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/products/category/electronics', jasmine.any(Array));
    });
    
    it('should filter out current product when currentProductId is provided', (done) => {
      const mockCategoryProducts = [
        { id: '1', name: 'Category Product 1', price: 100, category: 'electronics' },
        { id: '2', name: 'Category Product 2', price: 200, category: 'electronics' }
      ];
      
      apiServiceSpy.get.and.returnValue(of(mockCategoryProducts));
      
      service.getProductsByCategory('electronics', undefined, '1').subscribe(products => {
        // Verify filtering works by checking product with ID '1' is not in the result
        const hasCurrentProduct = products.some(p => p.id === '1');
        expect(hasCurrentProduct).toBeFalse();
        // Only product 2 should be left
        expect(products.length).toBe(1);
        expect(products[0].id).toBe('2');
        done();
      });
    });

    it('should fall back to local filtering when API call fails', (done) => {
      // Force API call to fail
      apiServiceSpy.get.and.returnValue(throwError(() => new Error('API Error')));
      
      // Set a shorter timeout for this test
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      
      // Make sure we finish the test
      service.getProductsByCategory('electronics').subscribe({
        next: (products) => {
          // Should fall back to filtering MOCK_PRODUCTS
          expect(products).toBeDefined();
          expect(Array.isArray(products)).toBeTrue();
          done();
        },
        error: (error) => {
          // This should not happen as we should fall back to local data
          fail('Should not get error: ' + error);
          done();
        }
      });
    });
  });
  
  describe('normalizeStocks', () => {
    it('should normalize stock data', () => {
      const apiStocks: ApiStock[] = [
        {
          id: '1', 
          quantity: 10, 
          price: 100,
          isAvailable: true,
          characteristics: { color: 'Red' },
          availabilityStatus: StockAvailabilityStatus.IN_STOCK
        }
      ];
      
      const privateNormalizeStocks = (service as any).normalizeStocks;
      const result = privateNormalizeStocks.call(service, apiStocks);
      
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
      expect(result[0].quantity).toBe(10);
      expect(result[0].characteristics.color).toBe('Red');
    });
    
    it('should return empty array for undefined stocks', () => {
      const privateNormalizeStocks = (service as any).normalizeStocks;
      const result = privateNormalizeStocks.call(service, undefined);
      
      expect(result).toEqual([]);
    });
  });
  
  describe('normalizeReviews', () => {
    it('should normalize review data', () => {
      const apiReviews: ApiReview[] = [
        {
          id: '1',
          username: 'user1',
          rating: 4,
          comment: 'Great product',
          createdAt: new Date()
        }
      ];
      
      const privateNormalizeReviews = (service as any).normalizeReviews;
      const result = privateNormalizeReviews.call(service, apiReviews);
      
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
      expect(result[0].username).toBe('user1');
      expect(result[0].rating).toBe(4);
      expect(result[0].comment).toBe('Great product');
    });
    
    it('should return empty array for undefined reviews', () => {
      const privateNormalizeReviews = (service as any).normalizeReviews;
      const result = privateNormalizeReviews.call(service, undefined);
      
      expect(result).toEqual([]);
    });
  });
  
  describe('calculateAverageRating', () => {
    it('should calculate average rating from reviews', () => {
      const apiReviews: ApiReview[] = [
        { id: '1', rating: 4 },
        { id: '2', rating: 2 },
        { id: '3', rating: 5 }
      ];
      
      const privateCalculateAverageRating = (service as any).calculateAverageRating;
      const result = privateCalculateAverageRating.call(service, apiReviews);
      
      expect(result).toBe(3.7); // (4 + 2 + 5) / 3 = 3.666... rounded to 3.7
    });
    
    it('should return 0 for undefined reviews', () => {
      const privateCalculateAverageRating = (service as any).calculateAverageRating;
      const result = privateCalculateAverageRating.call(service, undefined);
      
      expect(result).toBe(0);
    });
  });
});
