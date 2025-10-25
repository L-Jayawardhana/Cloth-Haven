# Payment Slip Database Storage Implementation

## Overview

The payment slip storage has been enhanced to store images directly in the database as BLOB data, while maintaining file system storage as a backup.

## Changes Made

### 1. Database Schema Changes (Orders Entity)

**File**: `backend/src/main/java/org/example/clothheaven/Model/Orders.java`

Added three new fields to store payment slip data:

```java
@Lob
@Column(name = "payment_slip_data", columnDefinition = "LONGBLOB")
private byte[] paymentSlipData;

@Column(name = "payment_slip_content_type", length = 100)
private String paymentSlipContentType;

@Column(name = "payment_slip_filename", length = 255)
private String paymentSlipFilename;
```

**Required Database Migration**:

```sql
ALTER TABLE orders ADD COLUMN payment_slip_data LONGBLOB;
ALTER TABLE orders ADD COLUMN payment_slip_content_type VARCHAR(100);
ALTER TABLE orders ADD COLUMN payment_slip_filename VARCHAR(255);
```

### 2. Upload Service Changes

**File**: `backend/src/main/java/org/example/clothheaven/Service/OrderService.java`

Modified `uploadPaymentSlip()` method to:

- Store the file bytes directly in the database (`paymentSlipData`)
- Store the content type (e.g., "image/png", "image/jpeg")
- Store the original filename
- Continue storing in file system as backup (optional)

```java
byte[] fileData = file.getBytes();
order.setPaymentSlipData(fileData);
order.setPaymentSlipContentType(file.getContentType());
order.setPaymentSlipFilename(original);
```

### 3. PDF Generation Changes

**File**: `backend/src/main/java/org/example/clothheaven/Service/OrderService.java`

Modified `generateOrderPdf()` method to:

- **Primary**: Load image from database BLOB data
- **Fallback**: Load from file system if database data is not available
- Added comprehensive error handling and logging

**Loading Priority**:

1. First tries to load from `paymentSlipData` (database BLOB)
2. If database data is null or loading fails, tries to load from file system using `paymentSlipUrl`
3. If both fail, shows a text message with the filename

```java
// Try loading from database first
if (order.getPaymentSlipData() != null) {
    try (ByteArrayInputStream bais = new ByteArrayInputStream(order.getPaymentSlipData())) {
        slipImage = ImageIO.read(bais);
        if (slipImage != null) {
            System.out.println("Successfully loaded payment slip from database");
        }
    } catch (Exception e) {
        System.err.println("Failed to load from database, trying file system");
    }
}

// Fallback to file system if database load failed
if (slipImage == null && order.getPaymentSlipUrl() != null) {
    // Load from file system...
}
```

## Benefits

### 1. **Data Integrity**

- Payment slips are stored in the database, ensuring they're backed up with database backups
- No risk of file system corruption or missing files

### 2. **Portability**

- Database can be moved/migrated without worrying about copying file system directories
- All order data (including payment slips) travels together

### 3. **Reliability**

- Dual storage strategy provides redundancy
- If file system fails, database has the data
- If database query fails, file system has the backup

### 4. **Performance**

- Loading from database can be faster than file system I/O in some cases
- Reduces dependency on file system performance

## Testing Checklist

### Before Testing

- [ ] Run database migration to add the three new columns
- [ ] Restart the Spring Boot backend

### Upload Test

- [ ] Upload a new payment slip (PNG/JPG/JPEG)
- [ ] Check database to verify `payment_slip_data` is populated (should not be NULL)
- [ ] Verify `payment_slip_content_type` contains the correct MIME type
- [ ] Verify `payment_slip_filename` contains the original filename

### PDF Generation Test

- [ ] Generate PDF for an order with a payment slip
- [ ] Check console logs - should see "Successfully loaded payment slip from database"
- [ ] Verify the image appears in the downloaded PDF
- [ ] Check image quality and scaling

### Fallback Test

- [ ] Manually set `payment_slip_data` to NULL in database for a test order
- [ ] Generate PDF - should fall back to loading from file system
- [ ] Check console logs - should see "Failed to load from database, trying file system"
- [ ] Verify the image still appears in PDF

### Error Handling Test

- [ ] Delete the file from file system but keep database data
- [ ] Generate PDF - should still work using database data
- [ ] Delete both database data and file
- [ ] Generate PDF - should show text message instead of failing

## Database Configuration

### MySQL Configuration

Make sure your MySQL server is configured to handle large BLOBs:

```ini
# my.cnf or my.ini
max_allowed_packet=64M
```

### JPA Configuration

No changes needed - `@Lob` and `columnDefinition = "LONGBLOB"` handle this automatically.

## Future Enhancements

### Optional Improvements

1. **Compression**: Compress images before storing in database to save space
2. **Lazy Loading**: Use `@Lob(fetch = FetchType.LAZY)` if loading orders becomes slow
3. **Cleanup**: Remove file system storage completely if database-only is preferred
4. **Migration Script**: Create a script to migrate existing file system images to database

### Recommended Approach

```java
// Compress before storing (optional)
BufferedImage img = ImageIO.read(file.getInputStream());
ByteArrayOutputStream compressed = new ByteArrayOutputStream();
ImageIO.write(img, "jpg", compressed);
order.setPaymentSlipData(compressed.toByteArray());
```

## Troubleshooting

### Issue: "Packet too large" error

**Solution**: Increase `max_allowed_packet` in MySQL configuration

### Issue: OutOfMemoryError when loading large images

**Solution**: Add lazy loading or implement image compression

### Issue: Slow order queries

**Solution**: Use lazy loading for BLOB field:

```java
@Lob
@Basic(fetch = FetchType.LAZY)
@Column(name = "payment_slip_data", columnDefinition = "LONGBLOB")
private byte[] paymentSlipData;
```

### Issue: Database backup size increased significantly

**Solution**: This is expected - images add to database size. Ensure adequate backup storage.

## Notes

- Original file system storage is retained as backup mechanism
- Both storage methods work independently
- PDF generation prioritizes database but gracefully falls back to file system
- No breaking changes to existing functionality
