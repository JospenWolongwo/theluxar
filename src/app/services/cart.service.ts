import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import type { Product } from '../../shared/types/product.type';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private cartSuccessSubject = new Subject<Product>();

  constructor() {
    // Load cart from local storage on initialization
    this.loadCart();
    // Initialize the cart count
    this.cartCountSubject.next(this.getTotalItems());
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
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
    const existingItem = this.cartItems.find((item) => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({
        product,
        quantity,
      });
    }

    this.updateCart();

    // Emit notification that product was added successfully
    this.cartSuccessSubject.next(product);
  }

  updateItemQuantity(productId: string, quantity: number): void {
    const cartItem = this.cartItems.find((item) => item.product.id === productId);

    if (cartItem) {
      if (quantity > 0) {
        cartItem.quantity = quantity;
      } else {
        this.removeItem(productId);

        return;
      }
    }

    this.updateCart();
  }

  removeItem(productId: string): void {
    this.cartItems = this.cartItems.filter((item) => item.product.id !== productId);
    this.updateCart();
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  getDiscount(): number {
    // Calculate discount if applicable
    return this.cartItems.reduce((total, item) => {
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
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next([...this.cartItems]);
      } catch (e) {
        localStorage.removeItem('cart');
      }
    }
  }
}
