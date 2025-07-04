# TheLuxar Order Flow Implementation Guide

This document outlines the detailed flow for implementing the ordering and payment process in the frontend, tailored specifically for Cameroon with support for MTN Mobile Money, Orange Money, and Cash on Delivery.

## Complete Order Flow (From Button Click to Confirmation)

### 1. Initial Order Button Click
When the user clicks the "Place Order" button:

```javascript
// Step 1: Check authentication first
function handleOrderSubmit() {
  if (!isAuthenticated()) {
    // Save cart state to localStorage
    saveCartToStorage();
    // Redirect to login with return URL
    window.location.href = `${API_BASE_URL}/auth/login?redirect=luxar-frontend:/checkout`;
    return;
  }
  
  // Continue with checkout process
  proceedToAddressSelection();
}
```

### 2. Address Selection/Input
```javascript
function proceedToAddressSelection() {
  // Get user's existing addresses or show form to add a new one
  fetchUserAddresses()
    .then(addresses => {
      if (addresses.length > 0) {
        displayAddressSelector(addresses);
      } else {
        displayAddressForm();
      }
    });
}
```

### 3. Delivery Method Selection
```javascript
function proceedToDeliverySelection(selectedAddressId) {
  // Save selected address
  saveCheckoutData({ addressId: selectedAddressId });
  
  // Display delivery options (express, standard, etc.)
  displayDeliveryOptions([
    { id: 'standard', name: 'Standard Delivery', price: 2000, days: '3-5' },
    { id: 'express', name: 'Express Delivery', price: 5000, days: '1-2' },
  ]);
}
```

### 4. Payment Method Selection
```javascript
function proceedToPaymentSelection(selectedDeliveryMethod) {
  // Save selected delivery method
  saveCheckoutData({ deliveryMethod: selectedDeliveryMethod });
  
  // Display payment options with visual indicators for each
  displayPaymentOptions([
    { 
      id: 'mtn', 
      name: 'MTN Mobile Money', 
      icon: 'mtn-icon.svg',
      description: 'Pay directly with your MTN Mobile Money account'
    },
    { 
      id: 'orange', 
      name: 'Orange Money', 
      icon: 'orange-icon.svg',
      description: 'Pay using your Orange Money account'
    },
    { 
      id: 'cod', 
      name: 'Cash on Delivery', 
      icon: 'cash-icon.svg',
      description: 'Pay with cash when your order arrives'
    }
  ]);
}
```

### 5. Order Review & Confirmation
```javascript
function displayOrderReview(paymentMethod) {
  // Save payment method
  saveCheckoutData({ paymentMethod });
  
  // Calculate final amounts
  const checkoutData = getCheckoutData();
  const cartItems = getCartItems();
  
  // Show order summary with all details for final confirmation
  displayOrderSummary({
    items: cartItems,
    address: checkoutData.address,
    delivery: checkoutData.deliveryMethod,
    payment: checkoutData.paymentMethod,
    subtotal: calculateSubtotal(cartItems),
    deliveryFee: getDeliveryFee(checkoutData.deliveryMethod),
    total: calculateTotal(cartItems, checkoutData.deliveryMethod)
  });
}
```

### 6. Order Creation & Payment Processing

```javascript
async function submitOrder() {
  const checkoutData = getCheckoutData();
  const cartItems = getCartItems();
  
  try {
    // Step 1: Create order in the backend
    const order = await createOrderInBackend({
      addressId: checkoutData.addressId,
      deliveryMethod: checkoutData.deliveryMethod,
      paymentMethod: checkoutData.paymentMethod,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    });
    
    // Step 2: Process payment based on selected method
    switch(checkoutData.paymentMethod) {
      case 'mtn':
        processMtnPayment(order);
        break;
      case 'orange':
        processOrangePayment(order);
        break;
      case 'cod':
        // For COD, we just confirm the order directly
        displayOrderSuccess(order);
        clearCart();
        break;
    }
  } catch (error) {
    displayErrorMessage('Failed to create order. Please try again.');
    console.error('Order creation failed:', error);
  }
}
```

### 7. Payment Method Specific Flows

#### MTN Mobile Money Flow

```javascript
function processMtnPayment(order) {
  // Display MTN payment instructions
  displayPaymentInstructions({
    title: 'MTN Mobile Money Payment',
    steps: [
      '1. Dial *126# on your mobile phone',
      '2. Select option 4 (Pay Bill)',
      '3. Enter merchant code: 12345',
      '4. Enter reference number: ' + order.orderNumber,
      '5. Enter amount: ' + order.totalAmount + ' FCFA',
      '6. Confirm payment with your PIN'
    ],
    note: 'After completing payment, click the button below to verify payment status.'
  });
  
  // Provide a way to check payment status
  setupPaymentVerification(order.id, 'mtn');
}
```

#### Orange Money Flow

```javascript
function processOrangePayment(order) {
  // Display Orange payment instructions
  displayPaymentInstructions({
    title: 'Orange Money Payment',
    steps: [
      '1. Dial #150*1# on your mobile phone',
      '2. Select option 3 (Payments)',
      '3. Enter merchant code: 67890',
      '4. Enter reference number: ' + order.orderNumber,
      '5. Enter amount: ' + order.totalAmount + ' FCFA',
      '6. Confirm payment with your PIN'
    ],
    note: 'After completing payment, click the button below to verify payment status.'
  });
  
  // Provide a way to check payment status
  setupPaymentVerification(order.id, 'orange');
}
```

### 8. Payment Verification

```javascript
function setupPaymentVerification(orderId, paymentMethod) {
  // Set up a button for the customer to verify payment
  const verifyPaymentButton = document.getElementById('verify-payment');
  
  verifyPaymentButton.addEventListener('click', async () => {
    try {
      // Show loading indicator
      displayLoadingIndicator();
      
      // Check payment status from your backend
      const paymentStatus = await checkPaymentStatus(orderId);
      
      if (paymentStatus.verified) {
        // Payment successful
        displayOrderSuccess(paymentStatus.order);
        clearCart();
      } else {
        // Payment not yet confirmed
        displayPaymentPending({
          message: 'Your payment has not been confirmed yet. This could take a few minutes.',
          orderId: orderId
        });
      }
    } catch (error) {
      displayErrorMessage('Failed to verify payment. Please try again or contact support.');
    } finally {
      hideLoadingIndicator();
    }
  });
  
  // Also set up automatic polling to check payment status
  startPaymentStatusPolling(orderId, paymentMethod);
}
```

### 9. Order Confirmation & Finalization

```javascript
function displayOrderSuccess(order) {
  // Show order success screen with details and next steps
  displaySuccessScreen({
    title: 'Order Placed Successfully!',
    orderNumber: order.orderNumber,
    estimatedDelivery: calculateEstimatedDelivery(order.deliveryMethod),
    contactInfo: 'If you have any questions, please contact us at support@theluxar.com',
    trackingInfo: `Track your order status at any time by visiting "My Orders" in your account.`
  });
  
  // Send confirmation via WhatsApp if user has opted in
  if (userHasOptedForWhatsApp()) {
    sendWhatsAppConfirmation(order);
  }
  
  // Clear cart and checkout data
  clearCart();
  clearCheckoutData();
}
```

## Post-Order Communication Flow

### 1. Order Status Updates via SMS & WhatsApp

```javascript
// This would be triggered by backend events, but frontend should prepare user:
function informUserAboutOrderUpdates() {
  displayMessage({
    title: 'Stay Updated',
    message: 'You will receive SMS notifications when your order status changes. If you provided a WhatsApp number, we will also send updates via WhatsApp.',
    icon: 'notifications-icon.svg'
  });
}
```

### 2. First-Time Buyer Special Handling

For first-time buyers, include an additional message encouraging Cash on Delivery:

```javascript
function checkAndDisplayFirstTimeBuyerMessage() {
  if (isFirstTimeBuyer()) {
    displaySpecialMessage({
      title: 'Welcome to TheLuxar!',
      message: 'As a first-time buyer, we recommend using Cash on Delivery for your peace of mind. This way, you can inspect your purchase before paying.',
      icon: 'first-time-icon.svg'
    });
    
    // Preselect COD option
    preselectPaymentOption('cod');
  }
}
```

## Technical Implementation Notes

### Integration with Mobile Money APIs

For a seamless experience, you could integrate with MTN and Orange APIs if they are available:

```javascript
async function initiateDirectMobilePayment(order, provider) {
  try {
    // Request payment initiation from backend
    const paymentRequest = await apiRequest(`/payments/${provider}/initiate`, {
      method: 'POST',
      body: JSON.stringify({
        orderId: order.id,
        amount: order.totalAmount,
        phoneNumber: order.customerPhone,
        description: `Payment for order #${order.orderNumber}`
      })
    });
    
    if (paymentRequest.redirectUrl) {
      // Some providers offer a redirect URL for web payment
      window.location.href = paymentRequest.redirectUrl;
    } else {
      // Display instructions for USSD payment
      displayPaymentInstructions(paymentRequest.instructions);
    }
  } catch (error) {
    console.error('Failed to initiate payment:', error);
    displayErrorMessage('Unable to initiate payment. Please try again or choose another payment method.');
  }
}
```

### WhatsApp Business Integration

```javascript
// Function to be called after successful order
function sendWhatsAppConfirmation(order) {
  // This could send a request to your backend to trigger a WhatsApp message
  apiRequest('/notifications/whatsapp/order-confirmation', {
    method: 'POST',
    body: JSON.stringify({ 
      orderId: order.id,
      messageTemplate: 'order_confirmation'
    })
  });
}
```

## Special Considerations for Cameroon

1. **Network Reliability**: Implement offline capabilities for order creation
2. **Payment Verification**: Double verification system for mobile money (both automated and manual)
3. **Cash on Delivery**: Prominent option especially for new customers
4. **Trust Building**: Clear visual steps showing the order and delivery process
5. **Local Context**: Use familiar language (English/French) and local examples in instructions

## UI Implementation Recommendations

### Multi-Step Checkout Process

1. Design a step indicator at the top of the checkout process:
   - Address Selection
   - Delivery Options
   - Payment Method
   - Review & Confirm

2. Ensure each step is clearly marked with:
   - Current step highlighted
   - Completed steps checkmarked
   - Future steps greyed out

3. Allow users to go back to previous steps to make changes

### Mobile-First Design

1. Optimize for small screens and touch interfaces
2. Use large, tappable buttons for important actions
3. Minimize form fields and use appropriate input types
4. Provide clear visual feedback for all actions

### Payment Method Selection

1. Large, visual payment method cards with recognizable logos
2. Brief explanation of each payment method
3. Clear indication of any fees associated with each method
4. Highlighted recommendation for first-time buyers (Cash on Delivery)

### Order Confirmation

1. Large success indicator (checkmark, confetti animation)
2. Order number prominently displayed
3. Clear next steps and expectations
4. Option to view order details or continue shopping
5. Estimated delivery date/window

### Error Handling

1. Clear error messages with specific instructions
2. Retry options for failed payments
3. Alternative contact methods if technical issues persist
4. Offline capability for areas with unstable connections

### Payment Instructions

1. Step-by-step instructions with visual aids
2. Countdown timer for payment completion
3. FAQ section for common payment issues
4. Support contact information prominently displayed

## Backend API Integration

The frontend will need to integrate with these API endpoints:

1. `POST /orders` - Create a new order
2. `GET /orders/my-orders` - Get user's orders
3. `GET /orders/:id` - Get order details
4. `GET /addresses/user/:userId` - Get user's addresses
5. `POST /addresses` - Create a new address
6. `POST /payments/verify/:orderId` - Verify payment status

## User Testing Recommendations

Before fully deploying the order flow:

1. Test with users unfamiliar with e-commerce
2. Test with slow internet connections
3. Test all payment methods with real transactions
4. Test the COD flow with simulated deliveries
5. Collect feedback on clarity of instructions and ease of use

This implementation plan provides a complete roadmap for building a user-friendly, reliable checkout experience optimized for the Cameroon market.
