import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPageComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  error: string | null = null;
  placingOrder = false;
  orderSuccess = false;
  whatsappUrl = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiBaseUrl}/orders/my-orders`).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load orders.';
        this.loading = false;
      },
    });
  }

  placeOrder(): void {
    this.placingOrder = true;
    // For demo, just create a dummy order and show WhatsApp
    this.http.post(`${environment.apiBaseUrl}/orders`, { paymentMethod: 'cash_on_delivery' }).subscribe({
      next: (order: any) => {
        this.orderSuccess = true;
        this.whatsappUrl = `https://wa.me/237698805890?text=I%20just%20placed%20an%20order%20on%20TheLuxar!%20Order%20ID:%20${order.id}`;
        this.placingOrder = false;
        this.fetchOrders();
      },
      error: () => {
        this.error = 'Failed to place order.';
        this.placingOrder = false;
      },
    });
  }
} 