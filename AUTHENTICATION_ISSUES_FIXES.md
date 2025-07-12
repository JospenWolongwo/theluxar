# Authentication Issues and Fixes

## Issues Identified

### 1. Auth Verification Endpoint Failing
**Problem**: The `/api/auth/verify` endpoint was returning HTML instead of JSON, causing parsing errors in the frontend.

**Symptoms**:
- Console errors: "Http failure during parsing for http://localhost:4200/api/auth/verify"
- Auth state not updating after successful login
- Navbar not reflecting logged-in state

**Root Cause**: Backend `/auth/verify` endpoint is not properly implemented or is returning HTML error pages instead of JSON responses.

### 2. Wishlist 403 Forbidden Errors
**Problem**: Wishlist requests were returning 403 Forbidden with "User has no roles assigned" error.

**Symptoms**:
- Console errors: "Backend returned code 403, body was: { message: "User has no roles assigned", error: "Forbidden", statusCode: 403 }"
- Wishlist functionality not working for authenticated users

**Root Cause**: Backend user role assignment is missing or incomplete.

### 3. Cart Items with Undefined Products
**Problem**: Cart items from the backend were missing complete product information, causing frontend errors.

**Symptoms**:
- Console errors: "TypeError: can't access property 'imageUrl', item_r2.product is undefined"
- Cart page displaying errors instead of products
- Price calculations failing

**Root Cause**: Backend cart endpoints returning incomplete product data.

## Frontend Fixes Implemented

### 1. Enhanced Auth Service Error Handling

**File**: `src/app/auth/services/auth.service.ts`

**Changes**:
- Added `responseType: 'json'` to verify endpoint requests
- Added specific error handling for HTML responses
- Improved error logging for debugging
- Added fallback behavior when verify endpoint fails

**Code Changes**:
```typescript
// Added responseType and better error handling
this.http.get<VerifyResponse>(`${this.authApiUrl}/verify`, { 
  withCredentials: true,
  responseType: 'json'
}).subscribe({
  // ... success handling
  error: (error) => {
    // Check if it's a parsing error (HTML response instead of JSON)
    if (error.error && typeof error.error === 'string' && error.error.includes('<html')) {
      console.warn('Verify endpoint returned HTML instead of JSON - backend issue detected');
      this.clearAuthData();
    } else {
      this.clearAuthData();
    }
  },
});
```

### 2. Cart Service Data Validation

**File**: `src/app/services/cart.service.ts`

**Changes**:
- Added validation to filter out cart items with missing or incomplete product information
- Enhanced error handling in price calculation methods
- Added warning logs for debugging invalid cart data

**Code Changes**:
```typescript
// Validate cart items to ensure they have valid product information
this.cartItems = items.filter(item => {
  if (!item || !item.product) {
    console.warn('Cart item missing product information:', item);
    return false;
  }
  if (!item.product.id || !item.product.name || item.product.price === undefined) {
    console.warn('Cart item has incomplete product information:', item);
    return false;
  }
  return true;
});
```

### 3. Wishlist Service Error Handling

**File**: `src/app/services/wishlist.service.ts`

**Changes**:
- Added specific handling for 403 Forbidden errors
- Added validation for wishlist items with incomplete product data
- Enhanced error logging for debugging
- Improved fallback to local storage when API fails

**Code Changes**:
```typescript
catchError((error) => {
  // Log specific error for debugging
  if (error?.status === 403) {
    console.warn('Wishlist access forbidden - user may not have proper roles assigned');
  } else {
    console.warn('Failed to load wishlist from API, using local data:', error);
  }
  // If API call fails, return local wishlist
  return of(this.wishlistItems);
})
```

## Backend Fixes Required

### 1. Fix Auth Verify Endpoint

The backend `/auth/verify` endpoint should return JSON in this format:
```json
{
  "userId": "user-id-here",
  "valid": true
}
```

**Current Issue**: Endpoint is returning HTML instead of JSON, likely due to:
- Missing route handler
- Server error causing HTML error page
- Incorrect content-type headers

### 2. Fix User Role Assignment

The backend needs to properly assign roles to authenticated users.

**Current Issue**: Users are authenticated but have no roles assigned, causing 403 errors.

**Required Fix**: Ensure users get appropriate roles (e.g., "user", "customer") after successful authentication.

### 3. Fix Cart Data Structure

The backend cart endpoints should return complete product information.

**Current Issue**: Cart items missing essential product fields like `id`, `name`, `price`, `imageUrl`.

**Required Fix**: Ensure cart endpoints return full product objects, not just product IDs.

## Testing the Fixes

### 1. Test Auth Flow
1. Clear browser cookies and localStorage
2. Navigate to login page
3. Complete login process
4. Check console for improved error messages
5. Verify navbar updates correctly

### 2. Test Cart Functionality
1. Add items to cart
2. Navigate to cart page
3. Check console for validation warnings
4. Verify cart displays correctly without errors

### 3. Test Wishlist Functionality
1. Try to access wishlist
2. Check console for 403 error handling
3. Verify fallback to local storage works

## Expected Behavior After Backend Fixes

Once the backend issues are resolved:

1. **Auth Verification**: Should work seamlessly, updating navbar and auth state
2. **Wishlist**: Should work without 403 errors
3. **Cart**: Should display complete product information
4. **Error Handling**: Frontend will gracefully handle any remaining issues

## Next Steps

1. **Backend Team**: Fix the three backend issues identified above
2. **Testing**: Test the complete authentication flow after backend fixes
3. **Monitoring**: Monitor console logs for any remaining issues
4. **Documentation**: Update API documentation to reflect correct response formats

## Notes

- The frontend fixes are backward-compatible and will work with both the current broken backend and the fixed backend
- All error handling includes appropriate logging for debugging
- Fallback mechanisms ensure the app remains functional even when backend endpoints fail
- The fixes prioritize user experience by preventing crashes and providing meaningful error messages 