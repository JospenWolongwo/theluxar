import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import type { ScreenSize } from '../../shared/types';
import { SCREEN_SIZES } from '../../shared/utils';
import type { CartItem } from '../services/cart.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
  host: {
    class: 'w-100 flex-col align-items-center',
  },
})
export class CartPageComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  subtotal = 0;
  discount = 0;
  tax = 0;
  total = 0;
  subscription: Subscription = new Subscription();

  // Screen size properties for responsive design
  currentScreenSize: ScreenSize = {
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    ltSm: false,
    ltMd: false,
    ltLg: false,
    ltXl: false,
    gtXs: false,
    gtSm: false,
    gtMd: false,
    gtLg: false,
  };

  constructor(
    private cartService: CartService,
    private responsive: BreakpointObserver,
    private library: FaIconLibrary
  ) {
    // Add FontAwesome icon packages
    this.library.addIconPacks(fas, far, fab);
  }

  ngOnInit(): void {
    // Track screen size changes for responsive design
    const screenSizes = ['ltMd'] as const;

    screenSizes.forEach((screenSize) => {
      this.subscription.add(
        this.responsive.observe([SCREEN_SIZES[screenSize]]).subscribe((state) => {
          this.currentScreenSize[screenSize as keyof ScreenSize] = state.matches;
        })
      );
    });

    // Subscribe to cart changes
    this.subscription.add(
      this.cartService.getCartItems().subscribe((items) => {
        this.cartItems = items;
        this.updateTotals();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateTotals(): void {
    this.subtotal = this.cartService.getSubtotal();
    this.discount = this.cartService.getDiscount();
    this.tax = this.cartService.getTax();
    this.total = this.cartService.getTotal();
  }

  onQuantityUpdate(productId: string, quantity: number): void {
    this.cartService.updateItemQuantity(productId, quantity);
  }

  onRemoveItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.product.id, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateItemQuantity(item.product.id, item.quantity - 1);
    }
  }

  get isMobile(): boolean {
    return this.currentScreenSize.ltMd;
  }
}
