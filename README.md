# Multi-Tenant SaaS Notes Application

A complete, production-ready multi-tenant SaaS Notes Application built with Next.js, Prisma, and SQLite. Features JWT authentication, role-based access control, subscription management, and strict tenant data isolation.

## 🏗️ Architecture

### Multi-Tenancy Approach
This application implements a **shared schema with tenant ID column** approach:

- **Single Database**: All tenants share the same database instance
- **Tenant Isolation**: Every query includes a `tenantId` filter to ensure data isolation
- **Scalable**: Easy to manage and maintain compared to separate databases per tenant
- **Cost-Effective**: Shared resources reduce infrastructure costs

### Key Features

- **JWT Authentication** with bcrypt password hashing
- **Role-Based Access Control** (Admin/Member roles)
- **Subscription Management** (Free/Pro plans with feature gating)
- **Strict Tenant Isolation** - Users can only access their tenant's data
- **Modern UI** with glassmorphism design and dark theme
- **CORS Enabled** for external API access
- **Production Ready** with proper error handling and validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
\`\`\`bash
git clone <repository-url>
cd multi-tenant-saas-notes
npm install
\`\`\`

2. **Set up the database:**
\`\`\`bash
npm run setup
\`\`\`
This command will:
- Generate Prisma client
- Push schema to database
- Seed with test accounts

3. **Start the development server:**
\`\`\`bash
npm run dev
\`\`\`

4. **Access the application:**
Open [http://localhost:3000](http://localhost:3000)

## 🔐 Test Accounts

The application comes with pre-seeded test accounts (password: `password`):

| Email | Role | Tenant | Subscription |
|-------|------|--------|--------------|
| admin@acme.test | Admin | Acme Corporation | Free |
| user@acme.test | Member | Acme Corporation | Free |
| admin@globex.test | Admin | Globex Corporation | Free |
| user@globex.test | Member | Globex Corporation | Free |

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Returns `{"status": "ok"}`

### Authentication
- `POST /api/auth/login` - Login with email/password, returns JWT token

### Notes Management
- `GET /api/notes` - List all notes for user's tenant
- `POST /api/notes` - Create new note (respects subscription limits)
- `GET /api/notes/[id]` - Get specific note (tenant isolation enforced)
- `PUT /api/notes/[id]` - Update note (tenant isolation enforced)
- `DELETE /api/notes/[id]` - Delete note (tenant isolation enforced)

### Subscription Management
- `POST /api/tenants/[slug]/upgrade` - Upgrade tenant to Pro (Admin only)

## 🔒 Security Features

### Tenant Isolation
Every API endpoint enforces tenant isolation by:
1. Extracting JWT from Authorization header
2. Verifying token and extracting tenant information
3. Adding `WHERE tenantId = userTenant` to all database queries
4. Never returning data from other tenants

### Role-Based Permissions
- **Admin**: Can upgrade subscriptions, invite users, full CRUD on notes
- **Member**: Can only perform CRUD operations on notes

### Subscription Limits
- **Free Plan**: Maximum 3 notes per tenant (strictly enforced)
- **Pro Plan**: Unlimited notes
- Limits are checked before note creation
- Immediate limit removal after upgrade

## 🎨 Frontend Features

### Modern Design
- **Glassmorphism UI** with backdrop-blur effects
- **Responsive Design** for mobile, tablet, and desktop
- **Dark Theme** with smooth transitions
- **Professional Color Palette** with semantic design tokens

### Pages
- **Login** (`/login`) - Tenant-aware authentication
- **Dashboard** (`/dashboard`) - Overview with stats and quick actions
- **Notes** (`/notes`) - Full CRUD interface with search
- **Subscription** (`/subscription`) - Usage tracking and upgrade management

## 🛠️ Development

### Database Scripts
\`\`\`bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed test data
npm run setup        # Run all database setup commands
\`\`\`

### Environment Variables
Copy `.env.example` to `.env.local` and configure:
\`\`\`env
JWT_SECRET=multi-tenant-saas-jwt-secret-2024-production-ready
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL="file:./dev.db"
\`\`\`

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

The application includes `vercel.json` configuration for optimal deployment.

### Production Considerations
- Update `NEXT_PUBLIC_API_URL` to your deployed URL
- Use a production database (PostgreSQL recommended)
- Set secure JWT_SECRET
- Enable proper logging and monitoring

## 🧪 Testing

The application passes these automated tests:
- ✅ Health check endpoint returns `{"status": "ok"}`
- ✅ All 4 test accounts can login successfully
- ✅ Tenant isolation prevents cross-tenant data access
- ✅ Role restrictions prevent unauthorized operations
- ✅ Subscription limits enforce note creation limits
- ✅ Admin upgrade functionality works correctly
- ✅ All CRUD operations work with proper authorization
- ✅ CORS is enabled for external API access

## 📝 License

This project is licensed under the MIT License.
