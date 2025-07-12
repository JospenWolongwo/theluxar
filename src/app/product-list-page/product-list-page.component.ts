/* eslint-disable max-lines */
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import type { Product, Screen, ScreenSize } from '../../shared/types';
import { SCREEN_SIZES } from '../../shared/utils';
import { FeedbackComponent } from '../components/feedback/feedback.component';
import { NewsletterComponent } from '../components/newsletter/newsletter.component';
import { ProductBannerComponent } from '../components/product-banner/product-banner.component';
import { ProductFilterComponent } from '../components/product-filter/product-filter.component';
import { ProductsSliderComponent } from '../components/products-slider/products-slider.component';
import { ProductService } from '../services/product.service';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'app-product-list-page',
  host: {
    class: 'w-100 flex-col align-items-center',
  },
  standalone: true,
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss',
  imports: [
    CommonModule,
    NewsletterComponent,
    FeedbackComponent,
    ProductsSliderComponent,
    ProductFilterComponent,
    ProductBannerComponent,
  ],
})
export class ProductListPageComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
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

  products: Product[] = [];
  filteredProducts: Product[] = [];
  activeCategory = '';
  activeFilters: Record<string, string[]> = {};
  isFilterPopupOpen = false;
  isLoading = true;

  // eslint-disable-next-line max-params
  constructor(
    private responsive: BreakpointObserver,
    private productService: ProductService,
    private wishlistService: WishlistService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Observe screen sizes
    const screenSizes: Screen[] = ['ltSm', 'ltLg'];
    screenSizes.forEach((screenSize) => {
      this.subscription.add(
        this.responsive.observe([SCREEN_SIZES[screenSize]]).subscribe((state) => {
          this.currentScreenSize[screenSize] = state.matches;
        })
      );
    });

    // Get category from route
    this.route.data.subscribe((data) => {
      const routeCategory = (data['category'] || '').toLowerCase();

      // Map route categories to our internal category format
      const categoryMap: Record<string, string> = {
        'soins-peau': 'Soins de la Peau',
        maquillage: 'Maquillage',
        'soins-cheveux': 'Soins des Cheveux',
        parfums: 'Parfums',
        'soins-corps': 'Soins du Corps',
      };

      // If the route category exists in our map, use the mapped value
      // Otherwise, use the route category as is (for 'all products' case)
      this.activeCategory = categoryMap[routeCategory] || routeCategory;

      // Load products for the category
      this.loadProductsByCategory();
    });

    // Subscribe to wishlist updates
    this.subscription.add(
      this.wishlistService.getWishlistItems().subscribe((wishlistItems) => {
        const wishlistProductIds = wishlistItems.map((item) => item.product.id);

        if (this.products.length > 0) {
          this.products.forEach((product) => {
            product.inWishlist = wishlistProductIds.includes(product.id);
          });
          this.filteredProducts = [...this.products];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadProductsByCategory(): void {
    this.isLoading = true;

    console.log('Loading products for category:', this.activeCategory);

    // First, let's see what categories are actually available in the API
    console.log('Checking available categories in API...');
    this.productService.getProducts(10).subscribe({
      next: (sampleProducts) => {
        console.log('Sample products from API:', sampleProducts.slice(0, 3).map(p => ({
          name: p.name,
          category: p.category,
          categoryName: p.categoryName,
          tag: p.tag
        })));
      }
    });

    // Use the proper API endpoint for category-based filtering
    this.productService.getProductsByCategory(this.activeCategory).subscribe({
      next: (categoryProducts) => {
        console.log(`Found ${categoryProducts.length} products for category '${this.activeCategory}'`);
        
        if (categoryProducts.length > 0) {
          this.products = categoryProducts.map((product) => ({
            ...product,
            imageUrl: product.imageUrl || product.galleryImages?.[0] || '/assets/images/products/placeholder.jpg',
            inStock: product.inStock ?? true,
            inWishlist: false,
            categoryName: this.activeCategory, // Set the display category name
          }));
          this.filteredProducts = [...this.products];
        } else {
          // If no products found for the category, show empty state
          this.products = [];
          this.filteredProducts = [];
          console.log(`No products found for category '${this.activeCategory}'`);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products for category:', this.activeCategory, err);
        this.products = [];
        this.filteredProducts = [];
        this.isLoading = false;
      },
    });
  }

  onFilterChange(filters: Record<string, string[]>): void {
    this.activeFilters = filters;

    if (Object.keys(filters).length === 0) {
      this.filteredProducts = [...this.products];

      return;
    }

    // Apply filters
    this.filteredProducts = this.products.filter(() => {
      // Replace with actual product filtering logic
      return true;
    });
  }

  toggleFilterPopup(): void {
    this.isFilterPopupOpen = !this.isFilterPopupOpen;
  }

  onWishlistToggle(productId: string): void {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      this.wishlistService.toggleWishlistItem(product);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onReserveClick(productId: string): void {
    // Handle reserve functionality
  }
}
