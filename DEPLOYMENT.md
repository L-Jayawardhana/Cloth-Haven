# Deployment Guide - Vercel (Frontend) + Railway (Backend + MySQL)

## 🚀 Quick Overview
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway MySQL

---

## 📦 Backend Deployment (Railway)

### Step 1: Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Create new project → Deploy from GitHub repo
3. Select your `Cloth-Haven` repository
4. Railway will auto-detect Spring Boot

### Step 2: Add MySQL Database
1. In your Railway project, click **"+ New"** → **Database** → **MySQL**
2. Railway will automatically create the database and provide connection details

### Step 3: Set Environment Variables

Go to your backend service → **Variables** tab and add:

```bash
# Database (Railway provides these automatically when you add MySQL)
DATABASE_URL=jdbc:mysql://[RAILWAY_MYSQL_HOST]:[PORT]/railway?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=[from Railway MySQL variables]
DB_PASSWORD=[from Railway MySQL variables]

# Note: Railway's MySQL service exposes these variables:
# MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD
# You can reference them like: jdbc:mysql://${{MYSQLHOST}}:${{MYSQLPORT}}/${{MYSQLDATABASE}}

# Server (Railway auto-assigns PORT)
PORT=8080

# JWT Configuration (IMPORTANT: Change these in production!)
JWT_SECRET=your-super-secret-jwt-key-min-256-bits-base64-encoded
JWT_EXPIRATION=86400000

# Email Configuration (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=reset.clothhaven@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

### Step 4: Connect Database Variables (Easier Method)

Railway makes this simple by allowing variable references:

```bash
DATABASE_URL=jdbc:mysql://${{MYSQL.MYSQLHOST}}:${{MYSQL.MYSQLPORT}}/${{MYSQL.MYSQLDATABASE}}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=${{MYSQL.MYSQLUSER}}
DB_PASSWORD=${{MYSQL.MYSQLPASSWORD}}
```

Replace `MYSQL` with your actual MySQL service name in Railway.

### Step 5: Generate Settings
1. Railway will automatically deploy on push
2. Note your backend URL: `https://your-app-name.up.railway.app`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Vercel Project
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select `frontend` as the root directory

### Step 2: Configure Build Settings

In Vercel project settings:

```bash
# Framework Preset: Vite
# Root Directory: frontend
# Build Command: npm run build
# Output Directory: build/client
```

### Step 3: Set Environment Variables

In Vercel → Settings → Environment Variables:

```bash
VITE_API_URL=https://your-backend-url.up.railway.app/api/v1
```

**Important**: Replace `your-backend-url` with your actual Railway backend URL.

### Step 4: Deploy
1. Vercel will auto-deploy on push to main branch
2. Your site will be live at: `https://cloth-haven.vercel.app`

---

## 🔧 CORS Configuration

Already configured in `backend/src/main/java/org/example/clothheaven/Config/CorsConfig.java`:

```java
.allowedOrigins("https://cloth-haven.vercel.app", "http://localhost:5173")
```

**Action Required**: Update `CorsConfig.java` if your Vercel URL is different!

---

## 🔐 Security Checklist

### Before Going Live:

1. ✅ **Change JWT Secret**
   - Generate a strong random secret (256+ bits)
   - Base64 encode it
   - Set as `JWT_SECRET` in Railway

2. ✅ **Email App Password**
   - Use Gmail App Password (not your actual password)
   - Enable 2FA on Gmail account
   - Generate app password: [Google Account Security](https://myaccount.google.com/security)

3. ✅ **Database Credentials**
   - Never commit to Git
   - Use Railway's environment variables

4. ✅ **Update CORS Origins**
   - Verify Vercel URL matches in `CorsConfig.java`
   - Remove localhost in production if needed

---

## 📝 Local Development

Keep these in your local `.env` or use defaults:

### Backend (local)
```properties
DATABASE_URL=jdbc:mysql://localhost:3306/cloth_heaven?createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=your-local-password
```

### Frontend (local)
```bash
VITE_API_URL=http://localhost:8080/api/v1
```

---

## 🐛 Troubleshooting

### CORS Errors
- Check `CorsConfig.java` has correct Vercel URL
- Verify Railway backend is running
- Check browser console for exact error

### Database Connection Failed
- Verify `DATABASE_URL` format: `jdbc:mysql://...` (NOT `mysql://...`)
- Check Railway MySQL service is running
- Ensure environment variables are set correctly

### 401 Unauthorized
- Check JWT secret matches between deployments
- Verify frontend sends `Authorization: Bearer <token>` header
- Check token expiration time

### Email Not Sending
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" or use App Password
- Verify SMTP settings (port 587, TLS enabled)

---

## 📊 Post-Deployment Verification

1. **Test Frontend**: Visit `https://cloth-haven.vercel.app`
2. **Test Backend**: Visit `https://your-backend.up.railway.app/api/v1/products`
3. **Test Database**: Create a product, verify it persists
4. **Test Auth**: Register, login, check JWT token
5. **Test Email**: Try password reset flow

---

## 🔄 CI/CD

Both platforms auto-deploy on Git push:
- **Vercel**: Monitors `main` branch
- **Railway**: Monitors `main` branch

To deploy:
```bash
git add .
git commit -m "Update: your changes"
git push origin main
```

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Spring Boot CORS: https://spring.io/guides/gs/rest-service-cors

---

**✨ Your app is production-ready!**
