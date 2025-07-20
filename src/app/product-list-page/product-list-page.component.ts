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
import { FormsModule } from '@angular/forms';

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
    FormsModule,
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
  sortOption: string = 'most-popular';

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

    // Get category from route data (for /watches, /jewelry, etc.)
    this.route.data.subscribe((data) => {
      const routeCategory = (data['category'] || '').toLowerCase();
      const categoryMap: Record<string, string> = {
        'soins-peau': 'Soins de la Peau',
        maquillage: 'Maquillage',
        'soins-cheveux': 'Soins des Cheveux',
        parfums: 'Parfums',
        'soins-corps': 'Soins du Corps',
      };
      this.activeCategory = categoryMap[routeCategory] || routeCategory;
      if (this.activeCategory) {
        this.loadProductsByCategory();
      }
    });

    // Get category from query param (for /products?category=...)
    this.route.queryParams.subscribe((params) => {
      const queryCategory = params['category'];
      if (queryCategory) {
        this.activeCategory = queryCategory;
        this.loadProductsByCategory();
      }
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
    console.log('Filters changed:', filters);
    this.activeFilters = filters;
    
    let newFilteredProducts: Product[] = [];
    
    if (Object.keys(filters).length === 0) {
      // No filters applied, show all products
      newFilteredProducts = [...this.products];
    } else {
      // Apply filters - each filter category is combined with AND logic
      // Within each category, options are combined with OR logic
      newFilteredProducts = this.products.filter((product) => {
        // Check each filter category
        for (const [category, values] of Object.entries(filters)) {
          if (values.length === 0) continue; // Skip empty filter groups
          
          // Check if product matches any value in this category (OR logic within category)
          const categoryMatches = this.matchProductToFilterCategory(product, category.toLowerCase(), values);
          
          // If product doesn't match any value in this category, exclude it (AND logic between categories)
          if (!categoryMatches) return false;
        }
        
        // Product matched all filter categories
        return true;
      });
    }
    
    console.log('Original products count:', this.products.length);
    console.log('Filtered products count:', newFilteredProducts.length);
    console.log('First few filtered products:', newFilteredProducts.slice(0, 3));
    
    // Explicitly assign a new array to ensure change detection
    this.filteredProducts = [...newFilteredProducts];
    this.applySorting();
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

  onSortChange(): void {
    this.applySorting();
  }

  private applySorting(): void {
    if (this.sortOption === 'price-asc') {
      this.filteredProducts = [...this.filteredProducts].sort((a, b) => a.price - b.price);
    } else if (this.sortOption === 'price-desc') {
      this.filteredProducts = [...this.filteredProducts].sort((a, b) => b.price - a.price);
    } else {
      // Most Popular: keep original order or implement your own logic
      // For now, do nothing (assume API or initial order is by popularity)
    }
  }

  /**
   * Check if a product matches a specific filter category
   * @param product The product to check
   * @param category The filter category (lowercase)
   * @param values The selected filter values for this category
   * @returns true if the product matches at least one value in this category
   */
  private matchProductToFilterCategory(product: Product, category: string, values: string[]): boolean {
    // Skip if no values are selected
    if (values.length === 0) return true;
    
    // Handle each filter category differently based on the product's properties
    switch (category) {
      case 'categories':
        // Check if product belongs to any of the selected categories
        const productCategory = (product.category?.name || product.categoryName || '').toLowerCase();
        return values.some(value => value.toLowerCase() === productCategory);
      
      case 'brands':
        // Check if product brand matches any selected brand
        const brand = product.brand?.toLowerCase() || '';
        return values.some(value => brand.includes(value.toLowerCase()));
      
      case 'price':
        // Handle price range filters
        if (values.includes('all')) return true;
        
        const price = product.price || 0;
        return values.some(priceRange => {
          if (priceRange === '0-500') return price >= 0 && price <= 500;
          if (priceRange === '500-1000') return price > 500 && price <= 1000;
          if (priceRange === '1000-5000') return price > 1000 && price <= 5000;
          if (priceRange === '5000-plus' || priceRange === 'over-5000') return price > 5000;
          if (priceRange === 'under-500') return price < 500;
          return false;
        });
      
      case 'product range':
        // Match against product name, description, category, or tag
        return values.some(value => {
          const productText = [
            product.name || '',
            product.shortDescription || '',
            product.category?.name || '',
            product.categoryName || '',
            product.tag || ''
          ].join(' ').toLowerCase();
          
          return this.matchFilterTextToProduct(value, productText);
        });
      
      case 'material':
        // Match against product description and specs
        return values.some(material => {
          const productSpecs = (product.specs || '').toLowerCase();
          const productDesc = (product.shortDescription || '').toLowerCase();
          const materialLower = material.toLowerCase();
          
          return productSpecs.includes(materialLower) || 
                 productDesc.includes(materialLower) || 
                 (product.name || '').toLowerCase().includes(materialLower);
        });
      
      case 'features':
      case 'occasions':
      case 'certifications':
      case 'ethical standards':
      case 'collections': {
        // Robust collections filter: check collections, label, tag, features, category, etc., normalizing both sides
        return values.some(value => {
          const filterVal = value.toLowerCase().replace(/[-\s]/g, '');
          const collections = (product as any)?.collections;
          if (collections) {
            if (Array.isArray(collections)) {
              if (collections.some((c: string) => typeof c === 'string' && c.toLowerCase().replace(/[-\s]/g, '').includes(filterVal))) return true;
            } else if (typeof collections === 'string') {
              if (collections.toLowerCase().replace(/[-\s]/g, '').includes(filterVal)) return true;
            }
          }
          if (typeof product.label === 'string' && product.label.toLowerCase().replace(/[-\s]/g, '').includes(filterVal)) return true;
          if ((product.tag || '').toLowerCase().replace(/[-\s]/g, '').includes(filterVal)) return true;
          if (product.features && Array.isArray(product.features)) {
            if (product.features.some((feature: string) => feature.toLowerCase().replace(/[-\s]/g, '').includes(filterVal))) return true;
          }
          const productDesc = (product.shortDescription || '').toLowerCase().replace(/[-\s]/g, '');
          if (productDesc.includes(filterVal)) return true;
          const productCat = (product.category?.name || product.categoryName || '').toLowerCase().replace(/[-\s]/g, '');
          if (productCat === filterVal) {
            console.log('[COLLECTIONS FILTER MATCH]', { filterVal, productCat, product });
            return true;
          } else {
            console.log('[COLLECTIONS FILTER NO MATCH]', { filterVal, productCat, product });
          }
          return false;
        });
      }

      // For any other filter category that we haven't explicitly handled
      default:
        // Try to find matches in product name, description, or specs
        return values.some(value => {
          const searchText = [
            product.name || '',
            product.shortDescription || '',
            product.specs || '',
            product.categoryName || '',
            product.tag || ''
          ].join(' ').toLowerCase();
          
          return searchText.includes(value.toLowerCase());
        });
    }
  }
  
  /**
   * Helper to match filter values to product text content
   * Handles special cases for product ranges like 'women's jewelry'
   */
  private matchFilterTextToProduct(filterValue: string, productText: string): boolean {
    const value = filterValue.toLowerCase();
    
    // Special handling for filter values
    switch (value) {
      case 'womens-jewelry':
        return productText.includes('women') && 
               (productText.includes('jewelry') || productText.includes('jewel'));
      
      case 'mens-jewelry':
        return productText.includes('men') && 
               (productText.includes('jewelry') || productText.includes('jewel'));
      
      case 'luxury-watches':
        return productText.includes('watch') && 
               (productText.includes('luxury') || 
                productText.includes('premium') || 
                productText.includes('gold') || 
                productText.includes('diamond'));
      
      case 'diamond-collections':
        return productText.includes('diamond');
      
      case 'exclusive-fragrances':
        return (productText.includes('fragrance') || 
                productText.includes('perfume') || 
                productText.includes('cologne')) && 
               (productText.includes('exclusive') || 
                productText.includes('premium') || 
                productText.includes('luxury'));
      
      default:
        // Default behavior - direct text matching
        return productText.includes(value);
    }
  }
}
