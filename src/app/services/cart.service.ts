import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject, catchError, map, of, tap, forkJoin, mergeMap } from 'rxjs';
import type { Product } from '../../shared/types/product.type';
import { ApiService } from './api.service';
import { BaseService } from './base.service';
import { ProductService } from './product.service';
import { AuthService } from '../auth/services/auth.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService extends BaseService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private cartSuccessSubject = new Subject<Product>();
  loading = false;
  cartId: string | null = null;

  constructor(private apiService: ApiService, private productService: ProductService, private authService: AuthService) {
    super();
    // Robustly load cartId from localStorage
    const storedCartId = localStorage.getItem('cartId');
    if (storedCartId && storedCartId !== 'undefined') {
      this.cartId = storedCartId;
    } else {
      this.cartId = null;
      if (storedCartId === 'undefined') {
        localStorage.removeItem('cartId');
      }
    }
    // Load cart from local storage on initialization
    this.loadCart();
    // Initialize the cart count
    this.cartCountSubject.next(this.getTotalItems());
  }

  getCartItems(): Observable<CartItem[]> {
    // Get cart items from API if possible, fall back to local cart
    return this.apiService.get<any>('/carts', []).pipe(
      map((response) => {
        // Flatten all items arrays from all cart objects
        let items: any[] = [];
        if (Array.isArray(response)) {
          // Array of cart objects, each with an items array
          items = response.flatMap(cart => Array.isArray(cart.items) ? cart.items : []);
        } else if (response && Array.isArray(response.items)) {
          items = response.items;
        } else if (response && response.data && Array.isArray(response.data.items)) {
          items = response.data.items;
        } else {
          items = [];
        }
        console.log('Raw cart items from API:', items);
        return items;
      }),
      // Fetch product details if needed
      // (switchMap is not imported, so use mergeMap and toArray for simplicity)
      // Only fetch if product fields are missing and productId is present
      // Otherwise, just map to { product: item, quantity: item.quantity || 1 }
      // Use forkJoin for parallel requests
      // This is a robust, production-ready approach
      mergeMap((items: any[]) => {
        const needsFetch = items.some(item => item.productId && (!item.name || !item.imageUrl));
        if (!needsFetch) {
          // All items already have product info
          return of(items.map(item => ({ product: item, quantity: item.quantity || 1 })));
        }
        // Fetch product details for items that need it
        const fetches = items.map(item => {
          if (item.productId && (!item.name || !item.imageUrl)) {
            return this.productService.getProductById(item.productId).pipe(
              map(product => ({ product, quantity: item.quantity || 1 }))
            );
          } else {
            return of({ product: item, quantity: item.quantity || 1 });
          }
        });
        return forkJoin(fetches);
      }),
      catchError((error) => {
        console.error('Error fetching cart items:', error);
        // If API call fails, return the local cart
        return of(this.cartItems);
      }),
      tap((items) => {
        // Update local cart with items from API
        this.cartItems = items;
        this.cartSubject.next([...this.cartItems]);
        this.cartCountSubject.next(this.getTotalItems());
        // Update local storage as fallback
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
      })
    );
  }

  getCartItemsCount(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  /**
   * Get notifications when an item is successfully added to cart
   */
  getCartSuccessNotifications(): Observable<Product> {
    return this.cartSuccessSubject.asObservable();
  }

  addToCart(product: Product, quantity = 1): void {
    this.loading = true;
    const addItem = (cartId: string) => {
      if (!cartId || cartId === 'undefined') {
        console.warn('[CartService] Attempting to add to cart with undefined cartId!');
        return;
      }
      const body = { productId: product.id, quantity, price: product.price };
      console.log('[CartService] Adding item to cart:', { cartId, body });
      this.apiService.post<any>(`/carts/${cartId}/items`, body, body)
        .pipe(
          catchError(() => {
            // If API call fails, update local cart
            const existingItem = this.cartItems.find((item) => item.product.id === product.id);
            if (existingItem) {
              existingItem.quantity += quantity;
            } else {
              this.cartItems.push({ product, quantity });
            }
            return of(body);
          })
        )
        .subscribe(() => {
          this.updateCart();
          this.cartSuccessSubject.next(product);
          this.loading = false;
        });
    };
    if (this.cartId) {
      console.log('[CartService] Using existing cartId:', this.cartId);
      addItem(this.cartId);
    } else {
      // Get userId from AuthService
      const user = this.authService.currentUserValue;
      const userId = user?.id;
      const cartBody = userId ? { userId } : {};
      console.log('[CartService] Creating cart with body:', cartBody);
      this.apiService.post<any>('/carts', cartBody, {})
        .pipe(
          tap((cart) => console.log('[CartService] Cart creation response:', cart)),
          map((cart) => cart && (cart._id || cart.id || cart.cartId)),
          catchError((err) => {
            console.error('[CartService] Cart creation failed:', err);
            // Fallback: generate a random cartId for local use
            const localId = 'local-' + Math.random().toString(36).substring(2, 15);
            this.cartId = localId;
            localStorage.setItem('cartId', localId);
            return of(localId);
          })
        )
        .subscribe((cartId: string) => {
          console.log('[CartService] New cartId set:', cartId);
          this.cartId = cartId;
          localStorage.setItem('cartId', cartId);
          addItem(cartId);
        });
    }
  }

  updateItemQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    // Try to update item via API
    this.apiService.put<CartItem>(`/carts/${productId}`, { quantity }, { product: {} as Product, quantity } as CartItem)
      .pipe(
        catchError(() => {
          // If API call fails, update local cart
          const cartItem = this.cartItems.find((item) => item.product.id === productId);
          if (cartItem) {
            cartItem.quantity = quantity;
          }
          return of(null);
        })
      )
      .subscribe(() => {
        this.updateCart();
      });
  }

  removeItem(productId: string): void {
    // Try to remove item via API
    this.apiService.delete<void>(`/carts/${productId}`, undefined)
      .pipe(
        catchError(() => {
          // If API call fails, update local cart
          this.cartItems = this.cartItems.filter((item) => item.product.id !== productId);
          return of(null);
        })
      )
      .subscribe(() => {
        // Update local cart after API call completes
        this.cartItems = this.cartItems.filter((item) => item.product.id !== productId);
        this.updateCart();
      });
  }

  clearCart(): void {
    // Try to clear cart via API
    this.apiService.delete<void>('/carts', undefined)
      .pipe(
        catchError(() => {
          // If API call fails, clear local cart
          this.cartItems = [];
          return of(null);
        })
      )
      .subscribe(() => {
        this.cartItems = [];
        this.updateCart();
      });
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      if (!item || !item.product || item.product.price === undefined) {
        return total;
      }
      return total + item.product.price * item.quantity;
    }, 0);
  }

  getDiscount(): number {
    // Calculate discount if applicable
    return this.cartItems.reduce((total, item) => {
      if (!item || !item.product || item.product.price === undefined) {
        return total;
      }
      
      // Get discount from stocks if available, otherwise default to 0
      const discount = this.getProductDiscount(item.product);

      return total + (item.product.price * discount * item.quantity) / 100;
    }, 0);
  }

  /**
   * Helper method to get product discount
   * Looks for discount in product stocks or label
   */
  private getProductDiscount(product: Product): number {
    // Look for discount in the stocks if available
    if (product.stocks && product.stocks.length > 0) {
      // Find the first stock with a discount or default to 0
      const stockWithDiscount = product.stocks.find((stock) => stock.discount !== undefined);
      if (stockWithDiscount?.discount !== undefined) {
        return stockWithDiscount.discount;
      }
    }

    // Check if product label contains a discount percentage
    if (product.label) {
      const discountMatch = product.label.match(/-(\d+)%/);
      if (discountMatch?.[1]) {
        return parseInt(discountMatch[1], 10);
      }
    }

    return 0;
  }

  getTax(): number {
    // Assume 18% tax
    return this.getSubtotal() * 0.18;
  }

  getTotal(): number {
    return this.getSubtotal() - this.getDiscount() + this.getTax();
  }

  getTotalItems(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  private updateCart(): void {
    // Update the cart subject
    this.cartSubject.next(this.cartItems);
    // Update cart count subject
    this.cartCountSubject.next(this.getTotalItems());

    // Save to local storage
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  private loadCart(): void {
    // Try to load cart from API first
    this.apiService.get<CartItem[]>('/carts', [])
      .pipe(
        catchError(() => {
          // If API call fails, load from localStorage
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              this.cartItems = JSON.parse(savedCart);
            } catch (e) {
              localStorage.removeItem('cart');
              this.cartItems = [];
            }
          } else {
            this.cartItems = [];
          }
          return of(this.cartItems);
        })
      )
      .subscribe((items) => {
        // Validate cart items to ensure they have valid product information
        this.cartItems = items.filter(item => {
          if (!item || !item.product) {
            return false;
          }
          if (!item.product.id || !item.product.name || item.product.price === undefined) {
            return false;
          }
          return true;
        });
        
        this.cartSubject.next([...this.cartItems]);
        this.cartCountSubject.next(this.getTotalItems());
      });
  }
}
