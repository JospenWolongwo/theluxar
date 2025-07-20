import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { Product } from '../../../shared/types';

@Component({
  selector: 'app-add-to-cart-success',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './add-to-cart-success.component.html',
  styleUrls: ['./add-to-cart-success.component.scss'],
})
export class AddToCartSuccessComponent {
  @Input() visible = false;
  @Input() websiteUrl = 'www.helloHardware.com';
  @Output() close = new EventEmitter<void>();
  @Input() product: Product | null = null;
  @Input() quantity = 1;

  constructor(private router: Router) {}

  /**
   * Return to menu/continue shopping
   */
  returnToMenu(): void {
    this.close.emit();
  }

  /**
   * Navigate to cart page and close the modal
   */
  goToCart(): void {
    this.close.emit();
    this.router.navigate(['/cart']);
  }
}
