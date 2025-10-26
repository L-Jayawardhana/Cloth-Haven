# Cart & Checkout Functionality Guide

## Overview

The cart now supports two types of checkout:

1. **Individual Item Checkout** - Checkout a specific product variant with all its quantity
2. **Full Cart Checkout** - Checkout all items in the cart

---

## 1. Individual Item Checkout

### How It Works:

- Each cart item has a "Checkout This Item" button
- Clicking this button will checkout **ALL quantities** of that specific variant
- Example: If you have "Red T-Shirt Medium (Qty: 3)", clicking checkout will process all 3 items

### What Happens:

1. Item details (including full quantity) are stored in sessionStorage
2. User is redirected to checkout page
3. Checkout page shows **only this item** with its full quantity
4. Order is created for this single item
5. **Other items remain in the cart** for future purchase
6. After order completion, only the ordered item is removed from cart

### Visual Indicators:

- Checkout page header shows: **"Checkout (Single Item)"**
- Order summary shows the selected item with full quantity
- Subtotal calculation: `Price × Quantity`
- Note at bottom: "Checking out selected item only. Other items remain in your cart."

---

## 2. Full Cart Checkout

### How It Works:

- The **"Proceed to Checkout"** button on the right sidebar
- This button checkouts **ALL items** in the cart
- All quantities of all variants are included

### What Happens:

1. User clicks "Proceed to Checkout" button
2. SessionStorage is cleared (ensures full cart mode)
3. User is redirected to checkout page
4. Checkout page loads **entire cart** from backend
5. Order is created with all cart items
6. **Entire cart is cleared** after successful order

### Visual Indicators:

- Checkout page header shows: **"Checkout"** (no "Single Item" label)
- Order summary shows all cart items with their quantities
- Each item displays:
  - Product name
  - Quantity
  - Color and Size (if applicable)
  - Unit price: "Rs. X.XX each"
  - **Line total: "Rs. Y.YY"** (bold, prominent)
- **Grand Subtotal** displayed at bottom in indigo color
- Note: "Final total including shipping will be calculated on the server based on current prices."

---

## Cart Display Examples

### Example 1: Multiple Variants of Same Product

```
Cart Items:
┌─────────────────────────────────────────────┐
│ T-Shirt (Red, Medium)                      │
│ Rs. 1,500.00                               │
│ Color: Red  Size: M                        │
│ Qty: [1] [2] [3]  Remove                   │
│ [Checkout This Item]                       │
└─────────────────────────────────────────────┘
│ T-Shirt (Blue, Large)                      │
│ Rs. 1,500.00                               │
│ Color: Blue  Size: L                       │
│ Qty: [1] [2] [3]  Remove                   │
│ [Checkout This Item]                       │
└─────────────────────────────────────────────┘
│ T-Shirt (Red, Large)                       │
│ Rs. 1,500.00                               │
│ Color: Red  Size: L                        │
│ Qty: [1] [2] [3]  Remove                   │
│ [Checkout This Item]                       │
└─────────────────────────────────────────────┘

Order Summary
─────────────────
Subtotal: Rs. 4,500.00
Shipping: FREE
─────────────────
Total: Rs. 4,500.00

[Proceed to Checkout] ← Checkouts ALL items
```

---

## Checkout Page Display

### Single Item Checkout:

```
Checkout (Single Item)
Complete your order for the selected item.

Order Summary:
┌─────────────────────────────────────────────┐
│ [IMG] T-Shirt (Red, Medium)                │
│       Qty: 3                               │
│       Red • M                              │
│                          Rs. 4,500.00      │
│                          Rs. 1,500.00 each │
└─────────────────────────────────────────────┘

Subtotal: Rs. 4,500.00

Note: Checking out selected item only.
Other items remain in your cart.
```

### Full Cart Checkout:

```
Checkout
Complete your order by providing shipping and payment details.

Order Summary:
┌─────────────────────────────────────────────┐
│ [IMG] T-Shirt (Red, Medium)                │
│       Qty: 3                               │
│       Red • M                              │
│                          Rs. 4,500.00      │
│                          Rs. 1,500.00 each │
├─────────────────────────────────────────────┤
│ [IMG] Jeans (Blue, 32)                     │
│       Qty: 2                               │
│       Blue • 32                            │
│                          Rs. 5,000.00      │
│                          Rs. 2,500.00 each │
└─────────────────────────────────────────────┘

Subtotal: Rs. 9,500.00

Note: Final total including shipping will be
calculated on the server based on current prices.
```

---

## Technical Implementation

### Cart Page Changes:

1. **`handleCheckoutSingle(item)`**

   - Takes full item with quantity
   - Stores in sessionStorage as single item
   - Sets `checkoutType: 'single'`
   - Redirects to `/checkout`

2. **`handleCheckoutFull()`**
   - Clears sessionStorage
   - Redirects to `/checkout`
   - Backend loads full cart

### Checkout Page Changes:

1. **Load Logic**

   - Checks `sessionStorage.getItem('checkoutType')`
   - If `'single'`: Uses stored item data
   - If not set: Loads full cart from backend

2. **Order Creation**

   - Single item: Temporarily replaces cart with single item
   - Full cart: Uses existing cart
   - After order: Restores remaining items (single) or clears all (full)

3. **Display Enhancements**
   - Shows product names (not just IDs)
   - Shows line totals (price × quantity)
   - Shows unit price ("each")
   - Shows grand subtotal
   - Context-aware messages

---

## User Flow

### Scenario 1: Buy One Variant, Keep Others

```
1. User has 3 T-shirt variants in cart
2. User clicks "Checkout This Item" on Red Medium
3. Checkout shows only Red Medium (Qty: 2)
4. User completes payment
5. Order created for Red Medium only
6. Cart still has Blue Large and Red Large
```

### Scenario 2: Buy Everything

```
1. User has 3 T-shirt variants in cart
2. User clicks "Proceed to Checkout"
3. Checkout shows all 3 variants with totals
4. User completes payment
5. Order created for all items
6. Cart is now empty
```

---

## Key Features

✅ **Separate Variants**: Same product with different colors/sizes appear as separate cart items
✅ **Individual Checkout**: Buy one variant, keep others in cart
✅ **Full Cart Checkout**: Buy everything at once
✅ **Quantity Preservation**: Individual checkout includes all quantities of that variant
✅ **Visual Clarity**: Clear labels, totals, and line items
✅ **Optimistic Updates**: Instant UI feedback
✅ **Error Recovery**: Rollback on failure

---

## Testing Checklist

- [ ] Add same product with different colors to cart → Appears as separate items
- [ ] Add same product with different sizes to cart → Appears as separate items
- [ ] Click "Checkout This Item" with Qty 3 → Checkout shows Qty 3
- [ ] Complete single item checkout → Other items remain in cart
- [ ] Click "Proceed to Checkout" → All items appear on checkout
- [ ] Complete full cart checkout → Cart becomes empty
- [ ] Verify subtotals calculate correctly (price × quantity)
- [ ] Verify line totals show in checkout summary

---

## Summary

The cart system now provides flexible checkout options:

- **Selective Checkout**: Buy specific items while keeping others
- **Full Checkout**: Buy everything in one transaction
- **Clear Pricing**: See unit prices and line totals
- **Variant Support**: Different colors/sizes are separate items

All calculations show the **total amount** for each item (price × quantity), making it clear what you're paying for!
