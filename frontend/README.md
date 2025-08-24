# Cloth Heaven - Frontend Foundation

A modern e-commerce frontend foundation built with React, TypeScript, and Tailwind CSS.

## 🚀 Technology Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and better developer experience
- **React Router v7** - File-based routing and modern navigation
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Three Fiber + Drei** - 3D graphics for immersive product showcase (installed)
- **Zustand** - Lightweight state management (installed)
- **TanStack Query** - Server state management (installed)
- **Radix UI** - Accessible UI components (installed)
- **Framer Motion** - Smooth animations (installed)
- **Lucide React** - Beautiful icons (installed)

## 📁 Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   └── three/          # 3D components for product showcase
├── routes/             # File-based routing
│   ├── auth/           # Authentication pages (login, register)
│   ├── products/       # Product pages
│   ├── cart/           # Shopping cart
│   ├── profile/        # User profile
│   └── checkout/       # Checkout process
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
├── utils/              # Helper utilities
├── api/                # API client and endpoints
├── root.tsx            # Root layout component
├── routes.ts           # Route configuration
└── app.css             # Global styles and Tailwind imports
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd cloth-heaven/frontend
```

2. Install dependencies (already done)
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## 🎯 Development Guidelines for Team

### Branching Strategy
1. Clone the main branch
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Work on your assigned features
4. Commit and push your changes
5. Create Pull Request for review

### Available Routes (Foundation)
- `/` - Home page (basic layout ready)
- `/products` - Products listing page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/cart` - Shopping cart page
- `/profile` - User profile page
- `/checkout` - Checkout page

### Team Member Responsibilities
Each team member should pick different areas:

**Member 1: UI/UX & Components**
- Design system implementation
- Reusable components in `app/components/ui/`
- Responsive layouts
- Tailwind CSS styling

**Member 2: 3D Features & Homepage**
- 3D product showcase using React Three Fiber
- Interactive homepage design
- Product visualization
- Animation and effects

**Member 3: E-commerce Logic**
- Product catalog and filtering
- Shopping cart functionality
- Checkout process
- State management with Zustand

**Member 4: Authentication & User Features**
- User authentication system
- Profile management
- Order history
- Backend integration

## 📱 Foundation Features Included

✅ **Setup Complete:**
- React Router v7 with file-based routing
- TypeScript configuration
- Tailwind CSS with design system
- All necessary dependencies installed
- Basic page structure

✅ **Ready for Development:**
- Folder structure organized
- Route placeholders created
- Package.json with all scripts
- Clean foundation for team collaboration

## 🤝 Team Collaboration Guidelines

### Before Starting Development:
1. Pull latest changes from main
2. Create your feature branch
3. Review the assigned area
4. Start implementing your features

### Code Standards:
- Use TypeScript for all files
- Follow React best practices
- Use Tailwind CSS for styling
- Implement responsive design
- Add proper error handling

### Available npm Scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - TypeScript type checking

## 📚 Resources for Team

- [React Router v7 Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Zustand Docs](https://zustand-demo.pmnd.rs)
- [TanStack Query Docs](https://tanstack.com/query)

---

**Ready for team development! 🚀**

Each team member can now clone this foundation and start working on their assigned features.
