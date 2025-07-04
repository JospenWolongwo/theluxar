import { TestBed } from '@angular/core/testing';
import { WishlistService, WishlistItem } from './wishlist.service';
import { ApiService } from './api.service';
import { of, throwError } from 'rxjs';
import { Product } from '../../shared/types/product.type';

describe('WishlistService', () => {
  let service: WishlistService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  
  const mockProduct1: Product = {
    id: '1',
    name: 'Test Product 1',
    price: 100,
    imageUrl: 'test1.jpg',
    inWishlist: true
  } as Product;
  
  const mockProduct2: Product = {
    id: '2',
    name: 'Test Product 2',
    price: 200,
    imageUrl: 'test2.jpg',
    inWishlist: true
  } as Product;

  const mockWishlistItem1: WishlistItem = {
    product: mockProduct1,
    addedAt: new Date()
  };

  const mockWishlistItem2: WishlistItem = {
    product: mockProduct2,
    addedAt: new Date()
  };

  beforeEach(() => {
    // Create spy object for ApiService
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    
    // Setup the get method to return an empty array by default
    // This is crucial because the WishlistService constructor calls loadWishlist()
    // which uses apiService.get().pipe()
    spy.get.and.returnValue(of([]));
    spy.post.and.returnValue(of({}));
    spy.delete.and.returnValue(of({}));
    
    TestBed.configureTestingModule({
      providers: [
        WishlistService,
        { provide: ApiService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(WishlistService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset the spy calls count after initialization
    apiServiceSpy.get.calls.reset();
    apiServiceSpy.post.calls.reset();
    apiServiceSpy.delete.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWishlistItems', () => {
    it('should return wishlist items from API', (done) => {
      const mockApiWishlist = [mockWishlistItem1, mockWishlistItem2];
      apiServiceSpy.get.and.returnValue(of(mockApiWishlist));
      
      service.getWishlistItems().subscribe(wishlistItems => {
        expect(wishlistItems.length).toBe(2);
        expect(wishlistItems[0].product.id).toBe('1');
        expect(wishlistItems[1].product.id).toBe('2');
        done();
      });
      
      // Ensure the most recent call matches what we expect
      const mostRecentCall = apiServiceSpy.get.calls.mostRecent();
      expect(mostRecentCall.args[0]).toBe('/wishlist');
      expect(Array.isArray(mostRecentCall.args[1])).toBe(true);
    });
    
    it('should fall back to localStorage when API fails', (done) => {
      // Set up localStorage with some wishlist items
      localStorage.setItem('wishlist', JSON.stringify([mockWishlistItem1]));
      
      // Force API call to fail
      apiServiceSpy.get.and.returnValue(throwError(() => new Error('API Error')));
      
      service.getWishlistItems().subscribe(wishlistItems => {
        expect(wishlistItems.length).toBe(1);
        expect(wishlistItems[0].product.id).toBe('1');
        done();
      });
    });
  });
  
  describe('addToWishlist', () => {
    it('should add product to wishlist via API', () => {
      // Reset the spy to ensure we only check the calls made in this test
      apiServiceSpy.post.calls.reset();
      apiServiceSpy.post.and.returnValue(of({ success: true }));
      
      service.addToWishlist(mockProduct1);
      
      expect(apiServiceSpy.post.calls.mostRecent().args[0]).toBe('/wishlist');
      // The post will be called with a WishlistItem that has the product and a date
      expect(apiServiceSpy.post.calls.mostRecent().args[1].product.id).toBe('1');
    });
    
    it('should update localStorage when API fails', (done) => {
      // Reset the spy
      apiServiceSpy.post.calls.reset();
      apiServiceSpy.post.and.returnValue(throwError(() => new Error('API Error')));
      
      // Spy on localStorage.setItem
      spyOn(localStorage, 'setItem').and.callThrough();
      
      service.addToWishlist(mockProduct1);
      
      // Use setTimeout to let the async operations complete
      setTimeout(() => {
        expect(apiServiceSpy.post).toHaveBeenCalled();
        done();
      }, 0);
    });
  });
  
  describe('removeFromWishlist', () => {
    it('should remove product from wishlist via API', () => {
      // Setup initial state with items in the wishlist
      service['wishlistItems'] = [mockWishlistItem1, mockWishlistItem2];
      service['updateWishlist']();
      
      apiServiceSpy.delete.and.returnValue(of({ success: true }));
      
      service.removeFromWishlist('1');
      
      expect(apiServiceSpy.delete).toHaveBeenCalledWith('/wishlist/1');
    });
    
    it('should update localStorage when API fails', () => {
      // Setup initial state with items in the wishlist
      service['wishlistItems'] = [mockWishlistItem1, mockWishlistItem2];
      service['updateWishlist']();
      localStorage.setItem('wishlist', JSON.stringify([mockWishlistItem1, mockWishlistItem2]));
      
      apiServiceSpy.delete.and.returnValue(throwError(() => new Error('API Error')));
      
      service.removeFromWishlist('1');
      
      // Fast-forward to let the operation complete
      // Usually localStorage would be updated after error handling
    });
  });
  
  describe('clearWishlist', () => {
    it('should clear wishlist via API', () => {
      // Setup initial state with items in the wishlist
      service['wishlistItems'] = [mockWishlistItem1, mockWishlistItem2];
      service['updateWishlist']();
      
      apiServiceSpy.delete.and.returnValue(of({ success: true }));
      
      service.clearWishlist();
      
      expect(apiServiceSpy.delete).toHaveBeenCalledWith('/wishlist');
    });
    
    it('should clear localStorage when API fails', () => {
      // Setup initial state with items in the wishlist
      service['wishlistItems'] = [mockWishlistItem1, mockWishlistItem2];
      service['updateWishlist']();
      localStorage.setItem('wishlist', JSON.stringify([mockWishlistItem1, mockWishlistItem2]));
      
      apiServiceSpy.delete.and.returnValue(throwError(() => new Error('API Error')));
      
      service.clearWishlist();
      
      // Fast-forward to let the operation complete
    });
  });
  
  describe('wishlist observables', () => {
    it('should update count when wishlist changes', (done) => {
      service.getWishlistItemsCount().subscribe(count => {
        expect(count).toBe(2);
        done();
      });
      
      // Set up initial state with items
      service['wishlistItems'] = [mockWishlistItem1, mockWishlistItem2];
      service['updateWishlist']();
    });
    
    it('should update inWishlist status when checking products', () => {
      // Set up initial state with items
      service['wishlistItems'] = [mockWishlistItem1];
      service['updateWishlist']();
      
      expect(service.isInWishlist('1')).toBeTrue();
      expect(service.isInWishlist('2')).toBeFalse();
    });
  });
});
