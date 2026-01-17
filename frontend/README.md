# CRM SaaS Frontend

Enterprise-grade Multi-Tenant CRM SaaS application built with Next.js 15 and TypeScript.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Multi-Tenant**: Complete tenant isolation with automatic context handling
- **Lead Management**: Full lead lifecycle from capture to conversion
- **Contact & Company Management**: Comprehensive customer relationship tracking
- **Deal Pipeline**: Visual sales pipeline with stage management
- **Ticket System**: Support ticket management with SLA tracking
- **Activities**: Task, call, email, and meeting tracking
- **Workflow Automation**: Automated business process management
- **Marketing Campaigns**: Email and SMS campaign management
- **Reports & Analytics**: Real-time business intelligence dashboards
- **Responsive Design**: Desktop and mobile optimized
- **Real-time Updates**: Webhook integration support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Backend API running (default: http://localhost:5000)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Update .env.local with your API URL
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at http://localhost:3000

### First Steps

1. Register a new tenant at `/auth/register`
2. Login with your credentials at `/auth/login`
3. Start managing your CRM data

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (dashboard)/          # Authenticated routes
│   │   ├── leads/            # Lead management
│   │   ├── contacts/         # Contact management
│   │   ├── companies/        # Company management
│   │   ├── deals/            # Deal pipeline
│   │   ├── tickets/          # Support tickets
│   │   ├── activities/       # Activity tracking
│   │   ├── workflows/        # Automation
│   │   ├── campaigns/        # Marketing
│   │   └── reports/          # Analytics
│   └── auth/                 # Authentication pages
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   ├── layout/               # Layout components
│   └── auth/                 # Auth-related components
├── hooks/                    # React Query hooks
├── services/                 # API service layer
├── stores/                   # Zustand stores
├── lib/                      # Utilities
├── types/                    # TypeScript types
└── config/                   # Configuration files
```

## API Integration

The frontend integrates with the CRM SaaS backend API. All API calls are documented in:

- `API_INTEGRATION.md` - Complete API reference
- `API_EXAMPLES.md` - Code examples
- `WEBHOOK_INTEGRATION.md` - Webhook setup
- `CRM_SaaS_API.postman_collection.json` - Postman collection

### Key Integration Points

- **Authentication**: JWT tokens with automatic refresh
- **Multi-Tenancy**: Automatic tenant context from token
- **Error Handling**: Global error handling with user-friendly messages
- **Rate Limiting**: Automatic retry with exponential backoff
- **Type Safety**: Full TypeScript coverage of API responses

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000    # Backend API URL
```

## Module Overview

### Authentication
- Login / Logout
- Tenant registration
- JWT token management
- Auto token refresh

### Lead Management
- List, create, edit, delete leads
- Lead status workflow
- Lead conversion to contacts
- Search and filtering

### Contact Management
- Full CRUD operations
- Contact timeline view
- Health score calculation
- Company association

### Company Management
- Company profiles
- Revenue and employee tracking
- Industry categorization

### Deal Pipeline
- Visual pipeline stages
- Win/lose tracking
- Probability and forecasting
- Expected close dates

### Ticket System
- Priority and status management
- SLA tracking
- Ticket escalation
- Resolution tracking

### Reports & Analytics
- Sales pipeline metrics
- Lead conversion funnel
- Ticket analytics
- User activity reports

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with Next.js App Router
- Lazy loading components
- React Query caching
- Optimized bundle size
- Image optimization

## Security

- JWT authentication
- HTTPS enforcement (production)
- XSS protection
- CSRF protection
- Secure token storage
- Role-based access control

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Build and run:
```bash
docker build -t crm-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com crm-frontend
```

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.
