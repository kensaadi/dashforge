export interface StarterKit {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  iconColor: 'purple' | 'blue' | 'green' | 'orange';
  price: number;
  currency: string;
  version: string;
  lastUpdated: string;
  previewUrl: string;
  purchaseUrl: string;
  overview: string;
  tags: string[];
}

export const starterKits: StarterKit[] = [
  {
    id: 'registration-app',
    name: 'Registration Kit',
    shortDescription:
      'Complete user registration system with email verification and multi-step forms',
    longDescription:
      'A comprehensive registration system built with DashForm, featuring multi-step flows, email verification, password strength validation, and user profile management.',
    icon: 'IconUserPlus',
    iconColor: 'purple',
    price: 99,
    currency: 'USD',
    version: '1.2.0',
    lastUpdated: 'March 15, 2024',
    previewUrl: '#',
    purchaseUrl: '#',
    overview: `# Welcome to Registration Kit

A production-ready user registration system designed for modern web applications. Built with DashForm and Material-UI, this starter kit provides everything you need to implement a secure and user-friendly registration flow.

## What's Included

- **Multi-step Registration Forms** - Split complex registration into manageable steps with progress indicators
- **Email Verification** - Built-in email verification system with customizable templates
- **Password Strength Validation** - Real-time password strength meter and validation rules
- **User Profile Management** - Complete profile editing interface with form validation
- **Social Login Integration** - Ready-to-use social authentication (Google, GitHub, Facebook)
- **Account Recovery** - Password reset and account recovery flows
- **Email Templates** - Professional HTML email templates for verification and notifications

## Tech Stack

- React 18
- TypeScript
- DashForm for form management
- Material-UI components
- React Router for navigation
- Vite for blazing-fast development

## Getting Started

1. Download and extract the starter kit
2. Install dependencies: \`npm install\`
3. Configure environment variables: Copy \`.env.example\` to \`.env\`
4. Start development server: \`npm run dev\`
5. Open your browser at \`http://localhost:5173\`

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Basic knowledge of React and TypeScript
- SMTP server for email functionality (optional for development)

## Project Structure

\`\`\`
registration-kit/
├── src/
│   ├── components/
│   │   ├── RegistrationForm/
│   │   ├── EmailVerification/
│   │   └── ProfileEditor/
│   ├── pages/
│   │   ├── Register.tsx
│   │   ├── Verify.tsx
│   │   └── Profile.tsx
│   ├── hooks/
│   ├── utils/
│   └── main.tsx
├── package.json
└── README.md
\`\`\`

## Key Features

### Multi-step Forms
Navigate through registration steps with automatic validation and progress tracking. Each step validates independently before allowing progression.

### Email Verification
Send verification emails automatically upon registration. Users receive a secure token-based link to verify their email address.

### Password Security
Enforce strong passwords with configurable rules. Real-time feedback helps users create secure passwords.

### Profile Management
Allow users to update their information with the same form validation patterns used in registration.

## Configuration

The kit is highly configurable. Edit \`src/config.ts\` to customize:

- Registration fields and validation rules
- Email templates and SMTP settings
- Password complexity requirements
- Social login providers
- Session management

## Support

For questions and support:
- Email: support@dashforge.com
- Documentation: https://dashforge.dev/docs
- GitHub Issues: https://github.com/dashforge/registration-kit

## License

This starter kit is licensed under a commercial license. One license per project. See LICENSE.md for details.`,
    tags: ['React', 'TypeScript', 'DashForm', 'Authentication', 'MUI'],
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    shortDescription:
      'Modern admin dashboard with analytics, charts, and data management tools',
    longDescription:
      'A feature-rich admin dashboard built with DashForm and Material-UI. Includes analytics widgets, data tables, charts, user management, and a comprehensive settings panel.',
    icon: 'IconDashboard',
    iconColor: 'blue',
    price: 149,
    currency: 'USD',
    version: '2.0.1',
    lastUpdated: 'March 20, 2024',
    previewUrl: '#',
    purchaseUrl: '#',
    overview: `# Welcome to Admin Dashboard

A powerful and flexible admin dashboard solution for managing your application's backend. Built with modern technologies and best practices, this kit provides a solid foundation for any admin interface.

## What's Included

- **Analytics Dashboard** - Beautiful charts and metrics with real-time data visualization
- **Data Tables** - Advanced data grids with sorting, filtering, and pagination
- **User Management** - Complete CRUD interface for managing users and permissions
- **Settings Panel** - Comprehensive settings management with form validation
- **Role-Based Access Control** - Built-in RBAC system with DashForm integration
- **Responsive Layout** - Fully responsive design that works on all devices
- **Dark Mode Support** - Beautiful dark theme included out of the box
- **Export Capabilities** - Export data to CSV, Excel, and PDF formats

## Tech Stack

- React 18
- TypeScript
- DashForm for complex forms
- Material-UI components
- Recharts for data visualization
- React Router with protected routes
- TanStack Query for data fetching
- Vite for development

## Getting Started

1. Download and extract the starter kit
2. Install dependencies: \`npm install\`
3. Configure API endpoints in \`.env\`
4. Start development server: \`npm run dev\`
5. Login with demo credentials (admin@example.com / demo123)

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API (mock API included for development)
- Modern web browser

## Project Structure

\`\`\`
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── DataTable/
│   │   ├── Charts/
│   │   └── Layout/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Settings.tsx
│   │   └── Analytics.tsx
│   ├── services/
│   ├── hooks/
│   └── main.tsx
├── package.json
└── README.md
\`\`\`

## Key Features

### Analytics Dashboard
View key metrics at a glance with interactive charts. Track user activity, revenue, conversions, and custom metrics.

### Advanced Data Tables
Manage large datasets with ease. Features include server-side pagination, multi-column sorting, advanced filtering, and bulk actions.

### User Management
Complete user administration with role assignment, permission management, and activity logs.

### Settings Management
Organize application settings into logical sections with form validation and real-time updates.

### RBAC Integration
Control access to features and data based on user roles and permissions. Fully integrated with DashForm's access control system.

## Customization

The dashboard is highly customizable:

- Modify color scheme in \`src/theme.ts\`
- Add custom widgets to the dashboard
- Configure menu items in \`src/config/menu.ts\`
- Customize data table columns
- Add new pages and routes

## API Integration

Connect to your backend API by configuring endpoints in \`.env\`:

\`\`\`
VITE_API_BASE_URL=https://api.yourapp.com
VITE_API_TIMEOUT=30000
\`\`\`

Mock API included for development and testing.

## Support

Need help?
- Email: support@dashforge.com
- Documentation: https://dashforge.dev/docs/admin-dashboard
- Community: https://discord.gg/dashforge

## License

Commercial license. One license per project. See LICENSE.md for full terms.`,
    tags: ['React', 'TypeScript', 'DashForm', 'Analytics', 'MUI', 'Dashboard'],
  },
  {
    id: 'ecommerce-starter',
    name: 'E-commerce Starter',
    shortDescription:
      'Complete e-commerce solution with product catalog, cart, and checkout flow',
    longDescription:
      'A full-featured e-commerce starter kit with product catalog, shopping cart, checkout process, order management, and payment integration. Perfect for building online stores.',
    icon: 'IconShoppingCart',
    iconColor: 'green',
    price: 199,
    currency: 'USD',
    version: '1.5.2',
    lastUpdated: 'March 18, 2024',
    previewUrl: '#',
    purchaseUrl: '#',
    overview: `# Welcome to E-commerce Starter

Launch your online store quickly with this comprehensive e-commerce solution. Built with DashForm and Material-UI, this kit includes everything needed for a modern shopping experience.

## What's Included

- **Product Catalog** - Beautiful product grid and detail pages with image galleries
- **Shopping Cart** - Persistent cart with quantity controls and price calculations
- **Checkout Flow** - Multi-step checkout with address validation and payment processing
- **Order Management** - Complete order history and tracking for customers
- **Payment Integration** - Ready-to-use Stripe integration with webhook handling
- **Inventory Management** - Track stock levels and handle out-of-stock scenarios
- **Product Search & Filters** - Advanced search with category and price filters
- **Customer Reviews** - Product rating and review system
- **Wishlist** - Save products for later with persistent storage

## Tech Stack

- React 18
- TypeScript
- DashForm for checkout and forms
- Material-UI components
- Stripe for payments
- React Router
- Redux Toolkit for state management
- Vite for development

## Getting Started

1. Download and extract the starter kit
2. Install dependencies: \`npm install\`
3. Configure Stripe keys in \`.env\`
4. Start development server: \`npm run dev\`
5. Browse the demo store at \`http://localhost:5173\`

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Stripe account (for payment processing)
- Basic understanding of e-commerce concepts

## Project Structure

\`\`\`
ecommerce-starter/
├── src/
│   ├── components/
│   │   ├── ProductGrid/
│   │   ├── ProductDetail/
│   │   ├── Cart/
│   │   └── Checkout/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   └── Checkout.tsx
│   ├── store/
│   ├── services/
│   └── main.tsx
├── package.json
└── README.md
\`\`\`

## Key Features

### Product Catalog
Display products in a responsive grid with filtering and sorting options. Each product has a detailed page with image gallery and variants.

### Shopping Cart
Add products to cart with real-time price calculations. Cart persists across sessions and includes quantity controls.

### Checkout Process
Guided multi-step checkout with:
1. Shipping address (with validation)
2. Shipping method selection
3. Payment information
4. Order review and confirmation

### Payment Processing
Integrated with Stripe for secure payment processing. Supports credit cards, digital wallets, and more.

### Order Management
Customers can view order history, track shipments, and download invoices.

### Product Search
Fast client-side search with category filtering, price ranges, and sorting options.

## Configuration

Customize your store in \`src/config/store.ts\`:

- Currency and locale settings
- Shipping methods and rates
- Tax calculation rules
- Product categories
- Payment methods

## Stripe Integration

Configure Stripe in \`.env\`:

\`\`\`
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`

Test mode included for development.

## Backend API

The kit includes a mock API for development. For production:

1. Implement product and order APIs
2. Set up Stripe webhook handlers
3. Configure inventory management
4. Implement user authentication

## Support

Get help with your store:
- Email: support@dashforge.com
- Documentation: https://dashforge.dev/docs/ecommerce
- Community: https://discord.gg/dashforge

## License

Commercial license. One license per project. Contact us for multi-site licensing.`,
    tags: ['React', 'TypeScript', 'DashForm', 'E-commerce', 'Stripe', 'MUI'],
  },
  {
    id: 'multitenant-saas',
    name: 'Multi-tenant SaaS',
    shortDescription:
      'Enterprise-grade SaaS template with tenant isolation and subscription management',
    longDescription:
      'Build Software-as-a-Service applications with complete tenant isolation, subscription management, billing integration, and team collaboration features. Perfect for B2B SaaS products.',
    icon: 'IconBuilding',
    iconColor: 'orange',
    price: 299,
    currency: 'USD',
    version: '1.0.0',
    lastUpdated: 'March 22, 2024',
    previewUrl: '#',
    purchaseUrl: '#',
    overview: `# Welcome to Multi-tenant SaaS

Build enterprise-grade SaaS applications with this comprehensive multi-tenant starter kit. Includes tenant isolation, subscription management, billing, and team collaboration out of the box.

## What's Included

- **Tenant Management** - Complete workspace/organization management with isolation
- **Subscription Plans** - Flexible plan tiers with feature gating
- **Billing Integration** - Stripe Billing integration with invoicing
- **Team Collaboration** - Invite team members with role-based permissions
- **User Management** - Manage users across multiple tenants
- **Settings & Preferences** - Tenant-level and user-level settings
- **Audit Logs** - Track all actions for compliance and security
- **API Integration** - RESTful API with tenant-scoped endpoints
- **White Labeling** - Customize branding per tenant

## Tech Stack

- React 18
- TypeScript
- DashForm for complex forms
- Material-UI components
- Stripe Billing for subscriptions
- React Router with tenant routing
- TanStack Query for data management
- Vite for development

## Getting Started

1. Download and extract the starter kit
2. Install dependencies: \`npm install\`
3. Configure environment variables in \`.env\`
4. Set up Stripe Billing products
5. Start development server: \`npm run dev\`
6. Create your first tenant organization

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Stripe account with Billing enabled
- PostgreSQL or MySQL database (for tenant data)
- Understanding of multi-tenancy concepts

## Project Structure

\`\`\`
multitenant-saas/
├── src/
│   ├── components/
│   │   ├── Tenant/
│   │   ├── Subscription/
│   │   ├── Team/
│   │   └── Settings/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Organization.tsx
│   │   ├── Team.tsx
│   │   └── Billing.tsx
│   ├── services/
│   │   ├── tenant/
│   │   └── subscription/
│   ├── hooks/
│   └── main.tsx
├── package.json
└── README.md
\`\`\`

## Key Features

### Tenant Isolation
Complete data isolation between tenants. Each organization has its own workspace with separate data and settings.

### Subscription Management
Flexible subscription plans with:
- Free, Starter, Pro, and Enterprise tiers
- Feature gating based on plan
- Automatic billing and renewals
- Upgrade/downgrade flows
- Usage-based billing support

### Team Collaboration
Invite team members with granular permissions:
- Owner, Admin, Member, and Guest roles
- Custom role creation
- Permission-based UI rendering
- Team activity tracking

### Billing & Invoicing
Integrated Stripe Billing:
- Automatic invoice generation
- Payment method management
- Billing history and receipts
- Failed payment handling
- Proration for plan changes

### Settings Management
Multi-level settings:
- Tenant-level (organization settings)
- User-level (personal preferences)
- Plan-based feature flags
- Custom domain configuration

### Audit Logging
Track all important actions:
- User authentication
- Data modifications
- Permission changes
- Billing events
- Export for compliance

## Tenant Architecture

This kit uses a **shared database with tenant identifier** approach:

- Single application instance serves all tenants
- Database rows tagged with tenant_id
- Middleware ensures tenant isolation
- Optimized for performance and cost

## Subscription Plans

Configure plans in \`src/config/plans.ts\`:

\`\`\`typescript
const plans = {
  free: {
    price: 0,
    features: ['5 users', 'Basic support'],
  },
  pro: {
    price: 49,
    features: ['Unlimited users', 'Priority support', 'Advanced analytics'],
  },
  // ...
};
\`\`\`

## Stripe Configuration

Set up Stripe in \`.env\`:

\`\`\`
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_STRIPE_PRICE_FREE=price_...
VITE_STRIPE_PRICE_PRO=price_...
VITE_STRIPE_PRICE_ENTERPRISE=price_...
\`\`\`

## Backend Requirements

For production, you'll need:

1. API server with tenant-scoped endpoints
2. Database with tenant isolation
3. Stripe webhook handlers for billing events
4. Email service for notifications
5. Background jobs for subscription management

Mock API included for frontend development.

## White Labeling

Customize appearance per tenant:

- Custom logos and colors
- Custom domain support
- Branded email templates
- Tenant-specific settings

## Support

Enterprise support available:
- Email: enterprise@dashforge.com
- Priority support channel
- Custom feature development
- Deployment assistance
- Documentation: https://dashforge.dev/docs/saas

## License

Commercial license with extended terms for SaaS applications. Contact us for enterprise licensing options.`,
    tags: [
      'React',
      'TypeScript',
      'DashForm',
      'SaaS',
      'Multi-tenant',
      'Stripe',
      'MUI',
    ],
  },
];
