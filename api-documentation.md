# TheLuxar API Documentation

This document provides detailed information about integrating your frontend application with the TheLuxar API.

## Authentication

For authentication, the frontend should simply redirect users to the backend authentication pages:

- **Login:** `GET /auth/login?redirect=client-name:/path-to-redirect`
- **Sign Up:** `GET /auth/signup?redirect=client-name:/path-to-redirect`

The backend handles all authentication flows, including:
- Token generation and storage
- Password reset
- Email verification
- OAuth flows (Google, GitHub)
- CSRF protection

Example login redirect:
```javascript
window.location.href = `${API_BASE_URL}/auth/login?redirect=luxar-frontend:/dashboard`;
```

Example signup redirect:
```javascript
window.location.href = `${API_BASE_URL}/auth/signup?redirect=luxar-frontend:/welcome`;
```

After successful authentication, the backend will redirect to the specified URL with tokens stored in HTTP-only cookies.

## Products API

### Get All Products
- **Endpoint:** `GET /products`
- **Auth Required:** No
- **Description:** Retrieves all products

### Get Product by ID
- **Endpoint:** `GET /products/:id`
- **Auth Required:** No
- **Description:** Retrieves a specific product by its ID

### Search Products
- **Endpoint:** `GET /products/search?q={query}`
- **Auth Required:** No
- **Description:** Search products by query string

### Get Products by Category
- **Endpoint:** `GET /products/category/:id`
- **Auth Required:** No
- **Description:** Get all products in a specific category

### Create Product (Admin only)
- **Endpoint:** `POST /products`
- **Auth Required:** Yes (admin role)
- **Body:** CreateProductDto
- **Description:** Creates a new product

### Update Product (Admin only)
- **Endpoint:** `PATCH /products/:id`
- **Auth Required:** Yes (admin role)
- **Body:** UpdateProductDto
- **Description:** Updates an existing product

### Delete Product (Admin only)
- **Endpoint:** `DELETE /products/:id`
- **Auth Required:** Yes (admin role)
- **Description:** Deletes a product

## Categories API

### Get All Categories
- **Endpoint:** `GET /categories`
- **Auth Required:** No
- **Description:** Retrieves all categories

### Get Root Categories
- **Endpoint:** `GET /categories/root`
- **Auth Required:** No
- **Description:** Retrieves top-level categories

### Get Child Categories
- **Endpoint:** `GET /categories/parent/:id`
- **Auth Required:** No
- **Description:** Retrieves child categories of a specific parent

### Get Category by ID
- **Endpoint:** `GET /categories/:id`
- **Auth Required:** No
- **Description:** Retrieves a specific category by its ID

### Create Category (Admin only)
- **Endpoint:** `POST /categories`
- **Auth Required:** Yes (admin role)
- **Body:** CreateCategoryDto
- **Description:** Creates a new category

### Update Category (Admin only)
- **Endpoint:** `PATCH /categories/:id`
- **Auth Required:** Yes (admin role)
- **Body:** UpdateCategoryDto
- **Description:** Updates an existing category

### Delete Category (Admin only)
- **Endpoint:** `DELETE /categories/:id`
- **Auth Required:** Yes (admin role)
- **Description:** Deletes a category

## Cart API

### Get User's Cart
- **Endpoint:** `GET /carts/user/:userId`
- **Auth Required:** Yes
- **Description:** Get cart by user ID

### Get Cart by ID
- **Endpoint:** `GET /carts/:id`
- **Auth Required:** Yes
- **Description:** Get cart by cart ID

### Create Cart
- **Endpoint:** `POST /carts`
- **Auth Required:** Yes
- **Body:** CreateCartDto
- **Description:** Create a new cart

### Add Item to Cart
- **Endpoint:** `POST /carts/:id/items`
- **Auth Required:** Yes
- **Body:** CreateCartItemDto
- **Description:** Add item to cart

### Update Cart Item
- **Endpoint:** `PATCH /carts/:id/items/:itemId`
- **Auth Required:** Yes
- **Body:** UpdateCartItemDto
- **Description:** Update cart item (e.g., quantity)

### Remove Item from Cart
- **Endpoint:** `DELETE /carts/:id/items/:itemId`
- **Auth Required:** Yes
- **Description:** Remove item from cart

### Clear Cart
- **Endpoint:** `DELETE /carts/:id/items`
- **Auth Required:** Yes
- **Description:** Clear all items from cart

### Delete Cart
- **Endpoint:** `DELETE /carts/:id`
- **Auth Required:** Yes
- **Description:** Delete entire cart

## Order API

### Create Order
- **Endpoint:** `POST /orders`
- **Auth Required:** Yes
- **Body:** CreateOrderDto
- **Description:** Create a new order

### Get User's Orders
- **Endpoint:** `GET /orders/my-orders`
- **Auth Required:** Yes
- **Description:** Get orders for current user

### Get Order by Order Number
- **Endpoint:** `GET /orders/number/:orderNumber`
- **Auth Required:** Yes
- **Description:** Get order by order number

### Get Order by ID
- **Endpoint:** `GET /orders/:id`
- **Auth Required:** Yes
- **Description:** Get order by ID

### Get All Orders (Admin only)
- **Endpoint:** `GET /orders`
- **Auth Required:** Yes (admin role)
- **Description:** Get all orders

### Update Order (Admin only)
- **Endpoint:** `PATCH /orders/:id`
- **Auth Required:** Yes (admin role)
- **Body:** UpdateOrderDto
- **Description:** Update order details

### Update Order Status (Admin only)
- **Endpoint:** `PATCH /orders/:id/status?status={orderStatus}`
- **Auth Required:** Yes (admin role)
- **Query:** status (enum OrderStatus)
- **Description:** Update order status

### Delete Order (Admin only)
- **Endpoint:** `DELETE /orders/:id`
- **Auth Required:** Yes (admin role)
- **Description:** Delete an order

## Stock API

### Get All Stock
- **Endpoint:** `GET /stock`
- **Auth Required:** No
- **Description:** Get all stock items

### Get Stock by ID
- **Endpoint:** `GET /stock/:id`
- **Auth Required:** No
- **Description:** Get stock item by ID

### Get Stock by Product ID
- **Endpoint:** `GET /stock/product/:id`
- **Auth Required:** No
- **Description:** Get stock for a specific product

### Create Stock (Admin only)
- **Endpoint:** `POST /stock`
- **Auth Required:** Yes (admin role)
- **Body:** CreateStockDto
- **Description:** Create new stock item

### Update Stock (Admin only)
- **Endpoint:** `PATCH /stock/:id`
- **Auth Required:** Yes (admin role)
- **Body:** UpdateStockDto
- **Description:** Update stock item

### Delete Stock (Admin only)
- **Endpoint:** `DELETE /stock/:id`
- **Auth Required:** Yes (admin role)
- **Description:** Delete stock item

## Wishlist API

### Get User's Wishlist
- **Endpoint:** `GET /wishlists/user/:userId`
- **Auth Required:** Yes
- **Description:** Get wishlist by user ID

### Get Wishlist by ID
- **Endpoint:** `GET /wishlists/:id`
- **Auth Required:** Yes
- **Description:** Get wishlist by ID

### Create Wishlist
- **Endpoint:** `POST /wishlists`
- **Auth Required:** Yes
- **Body:** CreateWishlistDto
- **Description:** Create a new wishlist

### Add Item to Wishlist
- **Endpoint:** `POST /wishlists/:id/items`
- **Auth Required:** Yes
- **Body:** CreateWishlistItemDto
- **Description:** Add item to wishlist

### Remove Item from Wishlist
- **Endpoint:** `DELETE /wishlists/:id/items/:itemId`
- **Auth Required:** Yes
- **Description:** Remove item from wishlist

### Delete Wishlist
- **Endpoint:** `DELETE /wishlists/:id`
- **Auth Required:** Yes
- **Description:** Delete entire wishlist

## Address API

### Get User's Addresses
- **Endpoint:** `GET /addresses/user/:userId`
- **Auth Required:** Yes
- **Description:** Get addresses for a user

### Get Address by ID
- **Endpoint:** `GET /addresses/:id`
- **Auth Required:** Yes
- **Description:** Get address by ID

### Create Address
- **Endpoint:** `POST /addresses`
- **Auth Required:** Yes
- **Body:** CreateAddressDto
- **Description:** Create a new address

### Update Address
- **Endpoint:** `PATCH /addresses/:id`
- **Auth Required:** Yes
- **Body:** UpdateAddressDto
- **Description:** Update an address

### Delete Address
- **Endpoint:** `DELETE /addresses/:id`
- **Auth Required:** Yes
- **Description:** Delete an address

## Review API

### Get All Reviews
- **Endpoint:** `GET /reviews`
- **Auth Required:** No
- **Description:** Get all reviews

### Get Reviews by Product
- **Endpoint:** `GET /reviews/product/:productId`
- **Auth Required:** No
- **Description:** Get reviews for a specific product

### Get Review by ID
- **Endpoint:** `GET /reviews/:id`
- **Auth Required:** No
- **Description:** Get review by ID

### Create Review
- **Endpoint:** `POST /reviews`
- **Auth Required:** Yes
- **Body:** CreateReviewDto
- **Description:** Create a new review

### Update Review
- **Endpoint:** `PATCH /reviews/:id`
- **Auth Required:** Yes
- **Body:** UpdateReviewDto
- **Description:** Update a review (only by author or admin)

### Delete Review
- **Endpoint:** `DELETE /reviews/:id`
- **Auth Required:** Yes
- **Description:** Delete a review (only by author or admin)

## Making Authenticated Requests

All authenticated endpoints expect a valid access token. The tokens are automatically handled through HTTP-only cookies when using the authentication flow described above.

For testing or API clients, you can include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Payment Integration

TheLuxar supports the following payment methods:
- MTN Mobile Money
- Orange Money
- Cash On Delivery

Integration for these payment methods will be handled through separate payment service endpoints.
