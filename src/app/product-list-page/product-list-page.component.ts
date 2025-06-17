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

    this.productService.getProducts().subscribe({
      next: (allProducts) => {
        // Normalize the active category for comparison
        const normalizedActiveCategory = this.activeCategory.toLowerCase().trim();

        // Map route categories to product categories with flexible matching
        const categoryMap: Record<string, string[]> = {
          'soins-peau': ['soins de la peau', 'soin visage', 'soin corps', 'skincare'],
          maquillage: ['maquillage', 'makeup', 'cosmétiques', 'beauté'],
          'soins-cheveux': ['soins cheveux', 'soin capillaire', 'cheveux', 'haircare'],
          parfums: ['parfum', 'parfums', 'fragrance', 'parfumerie'],
          'soins-corps': ['soins du corps', 'corps', 'bodycare', 'soin corps'],
        };

        // Get the list of matching categories for the active route
        const matchingCategories = categoryMap[normalizedActiveCategory] || [normalizedActiveCategory];

        // Filter products based on category matches
        const categoryMatches = allProducts.filter((product) => {
          if (!product.categoryName) {
            return false;
          }

          const productCategory = product.categoryName.toLowerCase().trim();

          // Check if product category matches any of the allowed categories
          return matchingCategories.some((cat) => productCategory.includes(cat) || cat.includes(productCategory));
        });

        if (categoryMatches.length > 0) {
          this.products = categoryMatches.map((product) => ({
            ...product,
            imageUrl: product.galleryImages?.[0] || product.imageUrl || 'assets/images/products/placeholder.png',
            inStock: product.inStock ?? true,
            inWishlist: false,
            categoryName: this.activeCategory, // Set the display category name
          }));
          this.filteredProducts = [...this.products];
        } else {
          // If no products found for the category, show all products with a message
          this.products = allProducts.map((product) => ({
            ...product,
            inWishlist: false,
          }));
          this.filteredProducts = [...this.products];
        }
        this.isLoading = false;
      },
      error: () => {
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
