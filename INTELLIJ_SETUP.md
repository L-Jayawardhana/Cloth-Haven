# 🚀 IntelliJ Setup Guide for Cloth Haven Backend

## ✅ **Issue Resolution**

The compilation error you encountered (`java.lang.ExceptionInInitializerError` and `com.sun.tools.javac.code.TypeTag :: UNKNOWN`) has been resolved by:

1. ✅ **Fixed Java Version Configuration** - Set project to use Java 17
2. ✅ **Updated IntelliJ Configuration Files** - Created proper `.idea` configuration
3. ✅ **Verified Compilation** - Project compiles successfully from command line
4. ✅ **Created Run Configuration** - Ready-to-use Spring Boot run configuration

## 🔧 **Step-by-Step IntelliJ Setup**

### **Step 1: Open Project in IntelliJ**

1. Open IntelliJ IDEA
2. Go to `File` → `Open`
3. Navigate to your project folder: `/Users/janeeshagamage/Documents/code/SE project /Cloth-Haven`
4. Select the `backend` folder and click `OK`
5. Choose "Open as Project"

### **Step 2: Configure Project SDK**

1. Go to `File` → `Project Structure` (or press `Cmd+;` on Mac)
2. In the left panel, click on `Project`
3. Set `Project SDK` to `17` (or the latest 17.x version)
4. Set `Project language level` to `17 - Sealed types, always-strict floating-point semantics`
5. Click `Apply`

### **Step 3: Configure Module Settings**

1. In the same `Project Structure` dialog
2. Click on `Modules` in the left panel
3. Select your `Cloth-Heaven` module
4. Set `Module SDK` to `17` (same as Project SDK)
5. Click `Apply` and `OK`

### **Step 4: Configure Maven Settings**

1. Go to `File` → `Settings` (or `IntelliJ IDEA` → `Preferences` on Mac)
2. Navigate to `Build, Execution, Deployment` → `Build Tools` → `Maven`
3. Make sure `Maven home path` points to a valid Maven installation
4. Set `JDK for importer` to `17`
5. Click `Apply` and `OK`

### **Step 5: Refresh Maven Project**

1. Right-click on the `pom.xml` file in the project explorer
2. Select `Maven` → `Reload project`
3. Wait for the project to refresh and download dependencies

### **Step 6: Clean and Rebuild**

1. Go to `Build` → `Clean Project`
2. Go to `Build` → `Rebuild Project`
3. Wait for the build to complete

## 🚀 **Running the Backend in IntelliJ**

### **Method 1: Using the Run Configuration (Recommended)**

1. Look for the run configuration dropdown in the top toolbar
2. Select `ClothHeavenApplication` from the dropdown
3. Click the green play button ▶️
4. The application will start and you'll see Spring Boot logs in the console

### **Method 2: Running the Main Class**

1. Navigate to `src/main/java/org/example/clothheaven/ClothHeavenApplication.java`
2. Right-click on the file
3. Select `Run 'ClothHeavenApplication.main()'`

### **Method 3: Using Maven**

1. Open the Maven tool window (`View` → `Tool Windows` → `Maven`)
2. Expand your project
3. Expand `Lifecycle`
4. Double-click on `spring-boot:run`

## 🌐 **Verifying the Backend is Running**

Once the application starts, you should see:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.5)

2025-08-30T01:14:10.988+05:30  INFO --- [Cloth Heaven] [           main] o.e.c.ClothHeavenApplication        : Starting ClothHeavenApplication
```

### **Test the API Endpoints:**

1. **Health Check**: http://localhost:8080/actuator/health
2. **API Base**: http://localhost:8080/api
3. **Users List**: http://localhost:8080/api/users

## 🔧 **Database Configuration**

### **Before Running, Ensure:**

1. **MySQL is Running**
   ```bash
   # Check if MySQL is running
   brew services list | grep mysql
   ```

2. **Database Exists**
   ```sql
   CREATE DATABASE clothheaven;
   ```

3. **Update Credentials** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

## 🐛 **Troubleshooting**

### **If You Still Get Compilation Errors:**

1. **Invalidate Caches and Restart:**
   - Go to `File` → `Invalidate Caches and Restart`
   - Select `Invalidate and Restart`

2. **Check Java Version in Terminal:**
   ```bash
   java -version
   # Should show Java 17
   ```

3. **Reimport Maven Project:**
   - Right-click on `pom.xml`
   - Select `Maven` → `Reload project`

4. **Check IntelliJ Logs:**
   - Go to `Help` → `Show Log in Finder`
   - Look for any error messages

### **Common Issues:**

1. **"Module not found"**: Make sure you opened the `backend` folder as a project
2. **"SDK not found"**: Install Java 17 and configure it in IntelliJ
3. **"Maven not found"**: Install Maven or use the Maven wrapper (`./mvnw`)

## 📱 **Testing the Complete Application**

1. **Start Backend** (in IntelliJ):
   - Run `ClothHeavenApplication`
   - Verify it starts on port 8080

2. **Start Frontend** (in Terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the Application**:
   - Visit: http://localhost:5173
   - Register a new user
   - Login and test profile management

## 🎯 **Success Indicators**

✅ **Backend Running Successfully When:**
- Spring Boot banner appears in console
- No compilation errors
- Application starts without exceptions
- Database connection established
- API endpoints accessible

✅ **Ready for Development When:**
- Can run from IntelliJ
- Can debug code
- Hot reload works
- API endpoints respond correctly

---

## 🎊 **You're All Set!**

Your Cloth Haven backend is now properly configured in IntelliJ and ready for development. You can:

- ✅ Run the application directly from IntelliJ
- ✅ Debug your code with breakpoints
- ✅ Use hot reload for development
- ✅ Access all Spring Boot features
- ✅ Connect with the frontend seamlessly

**Happy Coding! 🚀**
