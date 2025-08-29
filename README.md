# Cloth Haven - E-commerce Platform

A modern e-commerce platform built with Spring Boot backend and React frontend.

## 🚀 Features

### ✅ Implemented
- **User Authentication**: Register, Login, Logout
- **User Profile Management**: View and edit profile information
- **Modern UI**: Responsive design with Tailwind CSS
- **RESTful API**: Complete backend API with proper error handling
- **Database Integration**: MySQL with JPA/Hibernate

### 🔄 In Progress
- Shopping Cart functionality
- Product management
- Order processing
- Payment integration

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.2.5** - Main framework
- **Java 17** - Programming language
- **Spring Data JPA** - Database ORM
- **MySQL** - Database
- **Spring Validation** - Input validation
- **Lombok** - Code generation

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router v7** - Routing
- **Tailwind CSS** - Styling
- **Modern APIs** - Fetch API with proper error handling

## 📋 Prerequisites

- **Java 17** or higher
- **Node.js 18** or higher
- **MySQL 8.0** or higher
- **Maven** (for backend)
- **npm** (for frontend)

## 🚀 Quick Start

### 1. Database Setup

1. Install and start MySQL
2. Create a database (or it will be created automatically):
   ```sql
   CREATE DATABASE clothheaven;
   ```
3. Update database credentials in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### 2. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
Cloth-Haven/
├── backend/                    # Spring Boot application
│   ├── src/main/java/org/example/clothheaven/
│   │   ├── Controller/         # REST API endpoints
│   │   ├── Model/             # Database entities
│   │   ├── Repository/        # Data access layer
│   │   ├── Service/           # Business logic
│   │   ├── DTO/               # Data transfer objects
│   │   └── Config/            # Configuration classes
│   └── src/main/resources/
│       └── application.properties
└── frontend/                   # React application
    ├── app/
    │   ├── routes/            # Page components
    │   ├── lib/               # Utilities and services
    │   └── root.tsx           # Main layout
    └── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user profile
- `DELETE /api/users/{id}` - Delete user

## 👤 User Management Features

### Registration
- Username, email, phone number
- Password (plain text - should be hashed in production)
- Role assignment (default: CUSTOMER)

### Login
- Email and password authentication
- JWT token response (to be implemented)
- Session management via localStorage

### Profile Management
- View current profile information
- Edit username, email, phone number, role
- Real-time form validation
- Success/error feedback

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Styling**: Clean, professional design with Tailwind CSS
- **Form Validation**: Client-side validation with error messages
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Navigation**: Clean navigation with user state management

## 🔧 Development

### Backend Development
```bash
cd backend
mvn spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Changes
The application uses Hibernate's `ddl-auto=update`, so schema changes will be applied automatically.

## 🚨 Important Notes

1. **Password Security**: Passwords are currently stored in plain text. In production, implement proper password hashing (BCrypt).
2. **CORS**: Configured for development. Update CORS settings for production.
3. **Database**: Uses MySQL. Update connection settings for your environment.
4. **Environment Variables**: Consider using environment variables for sensitive configuration.

## 🐛 Troubleshooting

### Backend Issues
1. **Database Connection**: Ensure MySQL is running and credentials are correct
2. **Port Conflicts**: Change `server.port` in `application.properties` if 8080 is in use
3. **Java Version**: Ensure Java 17+ is installed and `JAVA_HOME` is set

### Frontend Issues
1. **Node Modules**: Run `npm install` if dependencies are missing
2. **Port Conflicts**: Change port in `vite.config.ts` if 5173 is in use
3. **API Connection**: Ensure backend is running on `http://localhost:8080`

## 📝 TODO

- [ ] Implement password hashing
- [ ] Add JWT authentication
- [ ] Create product management system
- [ ] Implement shopping cart
- [ ] Add order processing
- [ ] Integrate payment gateway
- [ ] Add admin dashboard
- [ ] Implement search and filtering
- [ ] Add image upload functionality
- [ ] Create email notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Coding! 🚀**
