import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { booleanAttribute, ChangeDetectorRef, Component, Input } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import type { Link } from '../../../shared/types';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatToolbarModule,
    FontAwesomeModule,
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
  ],
  providers: [MatIconRegistry],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  @Input({ required: true, transform: booleanAttribute }) isMobile = false;
  @Input({ required: true, transform: booleanAttribute }) isTablet = false;

  showMobileMenu = false;
  activeLink = '/';
  cartItemsCount = 0;
  wishlistItemsCount = 0;
  isLoggedIn = false;
  userName = '';
  private subscription = new Subscription();

  // eslint-disable-next-line max-params
  constructor(
    library: FaIconLibrary,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
    library.addIconPacks(far, fab, fas);
  }

  ngOnInit(): void {
    // Subscribe to cart changes to update the cart count
    this.subscription.add(
      this.cartService.getCartItemsCount().subscribe((count) => {
        this.cartItemsCount = count;
      })
    );

    // Subscribe to wishlist changes to update the wishlist count
    this.subscription.add(
      this.wishlistService.getWishlistItemsCount().subscribe((count) => {
        this.wishlistItemsCount = count;
      })
    );

    // Subscribe to authentication state changes
    this.subscription.add(
      this.authService.currentUser$.subscribe((user) => {
        this.isLoggedIn = !!user;
        this.userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
        // Force change detection since we're using OnPush strategy
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    document.body.style.overflow = this.showMobileMenu ? 'hidden' : '';
  }

  trackLink(_: number, link: Link): string {
    return link.name;
  }

  // Close mobile menu when navigating
  closeMobileMenu(): void {
    if (this.isMobile) {
      this.showMobileMenu = false;
      document.body.style.overflow = '';
    }
  }

  // Log out the current user
  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }

  /**
   * Redirects to the backend authentication login page
   * Formats the redirect parameter according to the backend's expected format
   * Stores current URL in localStorage as fallback for redirect failures
   */
  login(): void {
    try {
      // Define client identifier that matches backend CLIENTS env configuration
      const clientName = 'luxar-frontend';
      
      // Get current path or default to home
      const returnUrl = window.location.pathname || '/home';
      
      // Format redirect parameter as expected by backend: {clientName}:{returnPath}
      const redirectParam = `${clientName}:${returnUrl}`;
      
      // Build complete login URL with properly encoded redirect parameter
      const backendUrl = environment.production ? 
        'https://api.theluxar.com' : 
        'http://localhost:3000';
      
      const loginUrl = `${backendUrl}/auth/login?redirect=${encodeURIComponent(redirectParam)}`;
      
      // Store current location as fallback mechanism
      localStorage.setItem('preLoginUrl', window.location.href);
      
      // Log analytics event if applicable
      this.authService.trackAuthEvent('login_redirect_initiated');
      
      // Navigate to login page
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Login redirect failed:', error);
      this.notificationService.showError('Login redirect failed. Please try again.');
    } finally {
      this.closeMobileMenu();
    }
  }

  links: Link[] = [
    {
      name: 'All Collections',
      url: '/',
    },
    {
      name: 'Watches',
      url: '/watches',
    },
    {
      name: 'Jewelry',
      url: '/jewelry',
    },
    {
      name: 'Men',
      url: '/men',
    },
    {
      name: 'Women',
      url: '/women',
    },
    {
      name: 'Kids',
      url: '/kids',
    },
    {
      name: 'Perfumes',
      url: '/perfumes',
    },
  ];
}
