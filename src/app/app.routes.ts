import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'laptops',
    loadComponent: () =>
      import('./product-list-page/product-list-page.component').then((m) => m.ProductListPageComponent),
    data: { category: 'Laptops' },
  },
  {
    path: 'telephones',
    loadComponent: () =>
      import('./product-list-page/product-list-page.component').then((m) => m.ProductListPageComponent),
    data: { category: 'Telephones' },
  },
  {
    path: 'tablets',
    loadComponent: () =>
      import('./product-list-page/product-list-page.component').then((m) => m.ProductListPageComponent),
    data: { category: 'Tablets' },
  },
  {
    path: 'ecran-plat',
    loadComponent: () =>
      import('./product-list-page/product-list-page.component').then((m) => m.ProductListPageComponent),
    data: { category: 'Ecran Plat' },
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'home',
    loadComponent: () => import('./home-page/home-page.component').then((module) => module.HomePageComponent),
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./product-detail-page/product-detail-page.component').then((module) => module.ProductDetailPageComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart-page/cart-page.component').then((module) => module.CartPageComponent),
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./wishlist-page/wishlist-page.component').then((module) => module.WishlistPageComponent),
  },

  // Content pages
  {
    path: 'services',
    loadComponent: () => import('./service-page/service-page.component').then((module) => module.ServicePageComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./about-page/about-page.component').then((module) => module.AboutPageComponent),
  },
  {
    path: 'support',
    loadComponent: () => import('./support-page/support-page.component').then((module) => module.SupportPageComponent),
  },

  // Category routes are now handled by the first set of routes

  {
    path: 'not-found',
    loadComponent: () =>
      import('./not-found-page/not-found-page.component').then((module) => module.NotFoundPageComponent),
  },

  {
    path: '**', // Wildcard route for 404 page
    loadComponent: () =>
      import('./not-found-page/not-found-page.component').then((module) => module.NotFoundPageComponent),
  },
];
