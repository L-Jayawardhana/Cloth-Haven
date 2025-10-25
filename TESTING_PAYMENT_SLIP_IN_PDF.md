# Testing Payment Slip in PDF - Quick Guide

## What Was Implemented

Your backend now stores payment slip images in **two places**:

1. **Database** (as BLOB) - Primary storage
2. **File System** - Backup storage

When generating PDFs, it will:

1. Try to load from database first
2. Fall back to file system if needed
3. Embed the image directly in the PDF

## Testing Steps

### Step 1: Start Backend

```powershell
cd "c:\Users\KAVEEN SASMINA\Desktop\CH\Cloth-Haven\backend"
.\mvnw.cmd spring-boot:run
```

**What to look for:**

- Hibernate will automatically create the 3 new columns:
  - `payment_slip_data` (LONGBLOB)
  - `payment_slip_content_type` (VARCHAR)
  - `payment_slip_filename` (VARCHAR)
- Check console for: "Successfully applied migration" or similar message

### Step 2: Start Frontend

```powershell
cd "c:\Users\KAVEEN SASMINA\Desktop\CH\Cloth-Haven\frontend"
npm run dev
```

### Step 3: Upload a Payment Slip

1. Go to an existing order (or create a new one)
2. Upload a payment slip image (PNG or JPG recommended)
3. Check backend console - you should see the upload success message

### Step 4: Download PDF from Admin

1. Go to Admin → Orders
2. Find the order with the payment slip
3. Click the **Download PDF** button
4. Open the downloaded PDF

**Expected Result:**
✅ The payment slip image should be embedded in the PDF
✅ Image should be properly scaled to fit the page
✅ Image quality should be good

### Step 5: Check Console Logs

When you download the PDF, check the backend console for these messages:

```
=== PDF Generation Debug ===
Order ID: [order_id]
Payment Method: [method]
Payment Slip URL: [url]
===========================
Payment slip data found in database, size: [bytes] bytes
Successfully loaded payment slip from database
Creating PDImageXObject from BufferedImage
Image dimensions: [width]x[height]
Drawing payment slip on current page
Payment slip drawn successfully at position: [x], [y]
```

## Troubleshooting

### Issue 1: Payment slip not showing in PDF

**Check:**

- Backend console logs - does it say "Successfully loaded payment slip from database"?
- If it says "No payment slip found", the order might not have a slip uploaded

**Solution:**

- Re-upload the payment slip for that order
- Check database: `SELECT payment_slip_data IS NOT NULL FROM orders WHERE order_id = ?`

### Issue 2: Error when downloading PDF

**Check:**

- Backend console for error messages
- Common error: "Packet too large" → Increase MySQL `max_allowed_packet`

**Solution:**

```sql
SET GLOBAL max_allowed_packet=67108864; -- 64MB
```

### Issue 3: Image quality is poor

**Current Behavior:**

- Images are stored as-is without compression
- PDF uses lossless encoding

**Optional Enhancement:**

- Can add image compression before storing (see DATABASE_STORAGE_IMPLEMENTATION.md)

## Database Verification

To manually check if payment slip data is stored:

```sql
-- Check if data exists
SELECT
    order_id,
    payment_slip_filename,
    payment_slip_content_type,
    LENGTH(payment_slip_data) as image_size_bytes,
    payment_slip_url
FROM orders
WHERE payment_slip_data IS NOT NULL;
```

## What's Different from Before

### Before:

- ❌ Payment slips only stored in file system
- ❌ Risk of file loss if directory is deleted
- ❌ PDF showed URL text instead of embedding image

### After:

- ✅ Payment slips stored in database (primary) + file system (backup)
- ✅ Database backups include all payment slips
- ✅ PDF embeds the actual image with proper scaling
- ✅ Automatic fallback if one storage method fails
- ✅ Debug logging for troubleshooting

## Quick Test Checklist

- [ ] Backend starts without errors
- [ ] New database columns created automatically
- [ ] Can upload a new payment slip (PNG/JPG)
- [ ] Database has binary data in `payment_slip_data` column
- [ ] Download PDF shows "Successfully loaded payment slip from database" in console
- [ ] Downloaded PDF contains the embedded payment slip image
- [ ] Image is properly scaled and readable
- [ ] Works for both new uploads and existing orders (after re-upload)

## Success Indicators

When everything works correctly, you should see:

1. **On Upload:**

   - Backend console: File saved messages
   - Database: Row updated with image data

2. **On PDF Download:**

   - Backend console: "Successfully loaded payment slip from database"
   - Backend console: Image dimensions and drawing position
   - PDF file: Contains embedded image on the appropriate page

3. **In Admin:**
   - Order shows payment slip was uploaded
   - PDF download button available
   - Downloaded PDF opens successfully with image

## Next Steps

If everything works:

- ✅ Mark the implementation as complete
- ✅ Test with different image sizes and formats
- ✅ Test with orders that have no payment slip (should work fine)
- ✅ Consider removing file system storage if database-only is preferred

If issues occur:

- Check the troubleshooting section above
- Review backend console logs carefully
- Verify database columns exist: `DESCRIBE orders;`
- Check file permissions on uploads directory
