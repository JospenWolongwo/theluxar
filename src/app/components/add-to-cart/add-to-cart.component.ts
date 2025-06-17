import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Product } from '../../../shared/types/product.type';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-add-to-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.scss'],
})
export class AddToCartComponent {
  @Input() product!: Product;
  @Input() showQuantity = true;
  @Input() buttonLabel = 'Add to Cart';
  @Input() buttonClass = 'btn-primary';
  quantity = 1;
  isAddingToCart = false;
  addedToCart = false;
  addedToCartMessage = '';
  @Output() productAdded = new EventEmitter<Product>();

  constructor(private cartService: CartService, private library: FaIconLibrary) {
    // Add FontAwesome icon packages
    this.library.addIconPacks(fas, far, fab);
  }

  // No initialization needed

  addToCart(): void {
    if (!this.product) {
      return;
    }

    this.isAddingToCart = true;

    // Add product to cart
    this.cartService.addToCart(this.product, this.quantity);

    // Emit event for the parent component to handle success modal
    this.productAdded.emit(this.product);

    // Show inline success message for immediate feedback
    this.addedToCartMessage = `${this.quantity} ${this.quantity > 1 ? 'items' : 'item'} added`;
    this.addedToCart = true;

    // Reset state after animation
    setTimeout(() => {
      this.isAddingToCart = false;
      // Hide success message after a delay
      setTimeout(() => {
        this.addedToCart = false;
      }, 3000);
      // Reset quantity to 1 if needed
      if (this.showQuantity) {
        this.quantity = 1;
      }
    }, 500);
  }

  incrementQuantity(): void {
    if (this.quantity < 99) {
      this.quantity = this.quantity + 1;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity = this.quantity - 1;
    }
  }
}
