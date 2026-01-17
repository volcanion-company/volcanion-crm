# 🚀 CRM SaaS - Multi-Tenant Customer Relationship Management System

[![.NET](https://img.shields.io/badge/.NET-10.0-purple)](https://dotnet.microsoft.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)](README.md)

**Production-Ready Multi-Tenant CRM** built with .NET 10, featuring advanced workflow automation, SLA management, marketing automation, and comprehensive integrations.

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Health Checks](#-health-checks)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Development Phases](#-development-phases)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 Core Features (Phases 1-8)
- **Multi-Tenancy** - Complete tenant isolation with separate databases per tenant
- **Authentication & Authorization** - JWT-based auth with Role-Based Access Control (RBAC)
- **Audit System** - Comprehensive audit trail for all data changes
- **CRUD Operations** - Full entity management for Leads, Contacts, Companies, Deals, Tickets, Activities
- **API Documentation** - Interactive Scalar API documentation at `/scalar/v1`

### 🗄️ Database Architecture (Phase 9)
- **Master + Tenant Pattern** - Master database for tenant metadata, separate databases per tenant
- **Dual DbContext** - `MasterDbContext` for tenant management, `TenantDbContext` for tenant data
- **Schema Isolation** - `master` schema for tenants/users, `dbo` schema for CRM entities
- **Automatic Tenant Resolution** - Middleware-based tenant identification from JWT claims

### 🛡️ Data Security (Phase 18)
- **DataScope Enforcement** - `Own` (user's own records) and `All` (team-wide access) filtering
- **Automatic Filtering** - Query filters applied at DbContext level
- **Permission-Based Access** - RBAC integrated with DataScope for fine-grained control

### ⚙️ Workflow Engine (Phase 11)
- **17 Condition Operators**:
  - String: Equals, NotEquals, Contains, StartsWith, EndsWith
  - Numeric: GreaterThan, LessThan, GreaterThanOrEqual, LessThanOrEqual
  - Boolean: IsTrue, IsFalse
  - Date: Before, After
  - Special: IsNull, IsNotNull, InList
- **10 Workflow Actions**:
  - SendEmail, SendSms, SendNotification
  - CreateTask, CreateActivity
  - UpdateField, ChangeStatus, ChangeOwner
  - AssignToQueue, TriggerWebhook
- **Automatic Execution** - Background job runs every 5 minutes via Hangfire

### 🔔 Notification System (Phase 15)
- **4 Notification Channels**:
  - **InApp** - Real-time notifications in application
  - **Email** - SMTP integration (SendGrid, AWS SES compatible)
  - **SMS** - Twilio integration for text messaging
  - **Push** - Firebase Cloud Messaging for mobile push
- **Template System** - Dynamic templates with variable substitution
- **Delivery Tracking** - Read receipts and delivery status
- **User Preferences** - Per-user channel opt-in/opt-out

### 🔄 Background Jobs (Phase 14)
10 Recurring Hangfire Jobs:
1. **CheckSLAJob** - Monitor SLA breaches (every 15 minutes)
2. **ExecuteWorkflowsJob** - Run workflow automation (every 5 minutes)
3. **ProcessEmailQueueJob** - Send queued emails (every 2 minutes)
4. **CleanupOldDataJob** - Archive old records (daily at 2 AM)
5. **SyncExternalSystemsJob** - Sync with integrations (every hour)
6. **GenerateReportsJob** - Generate scheduled reports (daily at 6 AM)
7. **SendReminderNotificationsJob** - Activity reminders (every 10 minutes)
8. **ProcessWebhookDeliveriesJob** - Retry failed webhooks (every 5 minutes)
9. **UpdateLeadScoresJob** - Recalculate lead scores (every hour)
10. **ExecuteMarketingCampaignsJob** - Process campaigns (every 30 minutes)

### 📊 SLA & Ticket Automation (Phase 12)
- **SLA Policies** - Response time and resolution time SLAs with business hours
- **Auto-Escalation** - Escalate tickets approaching SLA breach
- **Pause/Resume SLA** - Pause SLA timer when waiting for customer
- **Breach Tracking** - Track and report SLA violations
- **Priority Calculation** - Auto-calculate ticket priority based on SLA + severity

### 👥 Customer 360 & Duplicate Detection (Phase 10)
- **Fuzzy Matching** - Detect duplicate contacts/companies using Levenshtein distance
- **Merge Functionality** - Merge duplicate records with history preservation
- **Customer Health Score** - 0-100 score based on engagement, deal value, activity
- **Timeline View** - Unified activity timeline across all related entities
- **Relationship Mapping** - Visualize connections between contacts and companies

### 📧 Marketing Automation (Phase 13)
- **Dynamic Segmentation** - Rule-based customer segments with auto-refresh
- **Email Campaigns** - Bulk email with personalization and tracking
- **Lead Scoring** - Behavioral and demographic scoring rules
- **Campaign Analytics** - Open rates, click rates, conversion tracking
- **A/B Testing** - Test subject lines and content variations

### 📈 Advanced Reports & Analytics (Phase 17)
- **40+ KPIs**:
  - Sales: Pipeline value, win rate, average deal size, sales cycle length
  - Marketing: Lead conversion rate, campaign ROI, cost per lead
  - Support: Ticket resolution time, first response time, customer satisfaction
  - Activity: User productivity, activity distribution
- **Cohort Analysis** - Customer retention and churn by cohort
- **Funnel Tracking** - Sales funnel conversion rates per stage
- **Custom Dashboards** - Tenant-specific KPI dashboards
- **Scheduled Reports** - Auto-generate and email reports

### 🔗 Integration Module (Phase 19)
- **Webhook System**:
  - HMAC-SHA256 signature verification
  - Retry logic (3 attempts with exponential backoff)
  - Delivery history and status tracking
  - Event triggers: lead.created, deal.won, ticket.closed, etc.
- **API Keys** - Secure API key management for external integrations
- **Rate Limiting** - Protect APIs with configurable rate limits

### 📅 Calendar & Activity Sync (Phase 16)
- **OAuth Integration** - Google Calendar and Microsoft Outlook
- **Two-Way Sync** - Sync activities to/from external calendars
- **iCal Export** - Download activities in iCalendar format
- **Meeting Reminders** - Email/SMS/Push reminders before meetings
- **Recurring Activities** - Support for daily/weekly/monthly recurrence

### 🏗️ DevOps & Production Readiness (Phase 20)
- **Health Checks**:
  - `/health` - Full health status with metrics
  - `/health/live` - Kubernetes liveness probe
  - `/health/ready` - Kubernetes readiness probe (checks DB + Hangfire)
- **Structured Logging** - Serilog with console and file outputs
- **Hangfire Dashboard** - Job monitoring at `/hangfire`
- **Docker Support** - Multi-stage Dockerfile with health checks
- **Kubernetes Ready** - Deployment manifests with auto-scaling

---

## 🛠️ Technology Stack

### Backend
- **.NET 10** - Latest LTS framework
- **ASP.NET Core** - Web API framework
- **Entity Framework Core 10** - ORM with SQL Server provider
- **SQL Server 2025** - Relational database

### Libraries & Packages
- **Hangfire 1.8.17** - Background job processing
- **Serilog** - Structured logging
- **FluentValidation** - Request validation
- **AutoMapper** - Object-to-object mapping
- **Scalar.AspNetCore** - API documentation (modern alternative to Swagger)
- **BCrypt.Net** - Password hashing

### Infrastructure
- **IIS / Kestrel** - Web server
- **Docker** - Containerization
- **Kubernetes** - Orchestration (optional)
- **Azure / AWS** - Cloud hosting (optional)

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
└─────────────────┬───────────────────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼─────┐         ┌───────▼──────┐
│  API       │         │  API         │
│  Instance 1│         │  Instance 2  │
└─────┬─────┘         └───────┬──────┘
      │                       │
      └───────────┬───────────┘
                  │
      ┌───────────▼───────────┐
      │                       │
┌─────▼──────┐       ┌────────▼────────┐
│   Master   │       │  Tenant DBs     │
│   Database │       │  (Isolated)     │
│            │       │                 │
│ - Tenants  │       │ - Tenant1 DB    │
│ - Users    │       │ - Tenant2 DB    │
│ - Config   │       │ - Tenant3 DB    │
└────────────┘       └─────────────────┘

      ┌─────────────────────┐
      │  Hangfire Server    │
      │  (Background Jobs)  │
      └─────────────────────┘
```

### Request Flow
1. **Client** → Sends request with JWT token
2. **Authentication Middleware** → Validates JWT, extracts TenantId
3. **Tenant Middleware** → Resolves tenant, sets TenantDbContext connection
4. **Controller** → Processes request
5. **TenantDbContext** → Queries tenant-specific database
6. **Response** → Returns JSON data

### Multi-Tenancy Strategy
- **Database per Tenant** - Complete data isolation
- **Shared Application** - Single codebase serves all tenants
- **Dynamic Connection Strings** - Built at runtime using TenantId from JWT

---

## 🚀 Quick Start

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [SQL Server 2025](https://www.microsoft.com/sql-server) (or Docker container)
- [Visual Studio 2022+](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/crm-saas.git
cd crm-saas/backend
```

### 2. Configure Database
Edit `src/CrmSaas.Api/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CrmSaas_Master;User Id=crmuser;Password=CRMuser@456#;TrustServerCertificate=True;",
    "TenantTemplate": "Server=localhost;Database=CrmSaas_{TenantId};User Id=crmuser;Password=CRMuser@456#;TrustServerCertificate=True;"
  }
}
```

### 3. Create Database User (SQL Server)
```sql
CREATE LOGIN crmuser WITH PASSWORD = 'CRMuser@456#';
CREATE USER crmuser FOR LOGIN crmuser;
ALTER ROLE db_owner ADD MEMBER crmuser;
```

### 4. Run Application
```bash
cd src/CrmSaas.Api
dotnet restore
dotnet run
```

Application starts on:
- **HTTP**: http://localhost:5000
- **HTTPS**: https://localhost:5001

### 5. Access API Documentation
Open browser: http://localhost:5000/scalar/v1

### 6. Create First Tenant
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "admin@tenant1.com",
  "password": "Admin@123",
  "tenantName": "Tenant 1",
  "companyName": "Acme Corp"
}
```

This creates:
- Tenant record in master database
- Tenant-specific database (CrmSaas_<TenantId>)
- Admin user with full permissions

### 7. Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@tenant1.com",
  "password": "Admin@123"
}
```

Response includes JWT token - use in `Authorization: Bearer <token>` header for subsequent requests.

---

## 📚 API Documentation

### Interactive Documentation
**Scalar UI**: http://localhost:5000/scalar/v1

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - Register new tenant
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

#### Leads
- `GET /api/leads` - List leads (with pagination)
- `POST /api/leads` - Create lead
- `GET /api/leads/{id}` - Get lead details
- `PUT /api/leads/{id}` - Update lead
- `DELETE /api/leads/{id}` - Delete lead
- `POST /api/leads/{id}/convert` - Convert lead to contact

#### Contacts
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts/{id}` - Get contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact
- `GET /api/contacts/{id}/timeline` - Get activity timeline
- `GET /api/contacts/{id}/health-score` - Get customer health score

#### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `GET /api/companies/{id}` - Get company
- `PUT /api/companies/{id}` - Update company
- `DELETE /api/companies/{id}` - Delete company

#### Deals
- `GET /api/deals` - List deals
- `POST /api/deals` - Create deal
- `GET /api/deals/{id}` - Get deal
- `PUT /api/deals/{id}` - Update deal
- `DELETE /api/deals/{id}` - Delete deal
- `PUT /api/deals/{id}/stage` - Move to next stage
- `POST /api/deals/{id}/win` - Mark as won
- `POST /api/deals/{id}/lose` - Mark as lost

#### Tickets
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/{id}` - Get ticket
- `PUT /api/tickets/{id}` - Update ticket
- `DELETE /api/tickets/{id}` - Delete ticket
- `POST /api/tickets/{id}/close` - Close ticket
- `POST /api/tickets/{id}/escalate` - Escalate ticket

#### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/{id}` - Get workflow
- `PUT /api/workflows/{id}` - Update workflow
- `DELETE /api/workflows/{id}` - Delete workflow
- `POST /api/workflows/{id}/activate` - Activate workflow
- `POST /api/workflows/{id}/deactivate` - Deactivate workflow

#### Marketing
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `POST /api/campaigns/{id}/send` - Send campaign
- `GET /api/segments` - List segments
- `POST /api/segments` - Create segment

#### Reports
- `GET /api/reports/sales-pipeline` - Sales pipeline metrics
- `GET /api/reports/lead-conversion` - Lead conversion funnel
- `GET /api/reports/ticket-analytics` - Support ticket analytics
- `GET /api/reports/user-activity` - User activity report

#### Calendar
- `GET /api/calendar/events` - List calendar events
- `POST /api/calendar/sync/google` - Sync with Google Calendar
- `POST /api/calendar/sync/outlook` - Sync with Outlook
- `GET /api/calendar/export/ical` - Export to iCal

---

## 🏥 Health Checks

### Endpoints

#### Full Health Status
```bash
GET http://localhost:5000/health
```

**Response** (200 OK when healthy):
```json
{
  "status": "Healthy",
  "totalDuration": "00:00:00.0234567",
  "entries": {
    "database": {
      "status": "Healthy",
      "description": "Database is accessible",
      "duration": "00:00:00.0123456",
      "data": {
        "tenantCount": 5,
        "timestamp": "2025-01-20T10:30:00Z"
      }
    },
    "hangfire": {
      "status": "Healthy",
      "description": "Hangfire is running",
      "duration": "00:00:00.0098765",
      "data": {
        "serverCount": 1,
        "succeededJobs": 1234,
        "failedJobs": 5,
        "recurringJobs": 10,
        "scheduledJobs": 0,
        "enqueuedJobs": 0,
        "processingJobs": 2,
        "timestamp": "2025-01-20T10:30:00Z"
      }
    }
  }
}
```

#### Liveness Probe (Kubernetes)
```bash
GET http://localhost:5000/health/live
```
Returns 200 OK if application is running (no checks performed).

#### Readiness Probe (Kubernetes)
```bash
GET http://localhost:5000/health/ready
```
Returns 200 OK only when database and Hangfire are healthy.

### Monitoring
- **Hangfire Dashboard**: http://localhost:5000/hangfire
  - View job statistics
  - Monitor recurring jobs
  - Inspect failed jobs
  - Retry failed jobs manually

---

## 🚢 Deployment

### Development
```bash
dotnet run --project src/CrmSaas.Api
```

### Production

See detailed guides:
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide (IIS, Docker, Kubernetes)
- **[PRODUCTION_CONFIG.md](PRODUCTION_CONFIG.md)** - Production configuration (Azure Key Vault, CI/CD, monitoring)

#### Quick Deploy - Docker
```bash
# Build image
docker build -t crmsaas-api:latest .

# Run container
docker run -d \
  -p 5000:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection="Server=..." \
  -e JwtSettings__Secret="YourSecretKey" \
  --name crmsaas-api \
  crmsaas-api:latest
```

#### Quick Deploy - IIS
1. Publish application:
   ```bash
   dotnet publish -c Release -o ./publish
   ```

2. Copy `./publish` folder to IIS server

3. Create Application Pool (.NET CLR Version: No Managed Code)

4. Create IIS Website pointing to publish folder

5. Set environment variable: `ASPNETCORE_ENVIRONMENT=Production`

---

## 📁 Project Structure

```
backend/
├── src/
│   └── CrmSaas.Api/
│       ├── Controllers/          # API endpoints
│       │   ├── AuthController.cs
│       │   ├── LeadsController.cs
│       │   ├── ContactsController.cs
│       │   ├── CompaniesController.cs
│       │   ├── DealsController.cs
│       │   ├── TicketsController.cs
│       │   ├── ActivitiesController.cs
│       │   ├── WorkflowsController.cs
│       │   ├── NotificationsController.cs
│       │   ├── CampaignsController.cs
│       │   ├── ReportsController.cs
│       │   └── CalendarController.cs
│       ├── Data/
│       │   ├── MasterDbContext.cs      # Master database context
│       │   ├── TenantDbContext.cs      # Tenant database context
│       │   └── Migrations/             # EF Core migrations
│       ├── Models/
│       │   ├── Entities/               # Domain entities
│       │   ├── DTOs/                   # Data transfer objects
│       │   └── Requests/               # API request models
│       ├── Services/
│       │   ├── TenantService.cs
│       │   ├── WorkflowEngine/
│       │   │   ├── WorkflowExecutor.cs
│       │   │   ├── ConditionEvaluator.cs
│       │   │   └── ActionExecutor.cs
│       │   ├── NotificationService.cs
│       │   ├── EmailService.cs
│       │   ├── SmsService.cs
│       │   ├── CalendarSyncService.cs
│       │   └── ReportingService.cs
│       ├── Middleware/
│       │   ├── TenantResolutionMiddleware.cs
│       │   └── ExceptionHandlingMiddleware.cs
│       ├── Jobs/                       # Hangfire background jobs
│       │   ├── CheckSLAJob.cs
│       │   ├── ExecuteWorkflowsJob.cs
│       │   ├── ProcessEmailQueueJob.cs
│       │   └── ... (10 total jobs)
│       ├── HealthChecks/
│       │   ├── DatabaseHealthCheck.cs
│       │   └── HangfireHealthCheck.cs
│       ├── Filters/                    # Action filters
│       ├── Extensions/                 # Extension methods
│       ├── Program.cs                  # Application entry point
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       └── appsettings.Production.json
├── Dockerfile                          # Docker configuration
├── docker-compose.yml                  # Docker Compose setup
├── deployment.yaml                     # Kubernetes manifest
├── DEPLOYMENT.md                       # Deployment guide
├── PRODUCTION_CONFIG.md                # Production config guide
├── README.md                           # This file
└── TODO.md                             # Development roadmap
```

---

## 📋 Development Phases

| Phase | Feature | Status | Files |
|-------|---------|--------|-------|
| **1-8** | Foundation (Auth, CRUD, RBAC, Audit) | ✅ Complete | Controllers, Services, Models |
| **9** | Database Architecture (Master + Tenant) | ✅ Complete | MasterDbContext, TenantDbContext |
| **18** | DataScope Enforcement | ✅ Complete | Query filters in DbContext |
| **11** | Workflow Engine (17 operators, 10 actions) | ✅ Complete | WorkflowEngine/ folder |
| **15** | Notification System (4 channels) | ✅ Complete | NotificationService, Channels/ |
| **14** | Background Jobs (10 Hangfire jobs) | ✅ Complete | Jobs/ folder |
| **12** | SLA & Ticket Automation | ✅ Complete | SLA entities, CheckSLAJob |
| **10** | Duplicate Detection & Customer 360 | ✅ Complete | DuplicateDetectionService |
| **13** | Marketing Automation | ✅ Complete | CampaignsController, Segments |
| **17** | Advanced Reports & Analytics (40+ KPIs) | ✅ Complete | ReportingService, ReportsController |
| **19** | Integration Module (Webhooks) | ✅ Complete | WebhooksController, HMAC auth |
| **16** | Calendar & Activity Sync | ✅ Complete | CalendarSyncService, OAuth |
| **20** | DevOps & Production Readiness | ✅ Complete | HealthChecks, DEPLOYMENT.md |

**All 13 phases: 100% COMPLETE** 🎉

See [TODO.md](TODO.md) for detailed phase breakdown.

---

## 🧪 Testing

### Run Tests
```bash
dotnet test
```

### Test Coverage
- Unit tests for services
- Integration tests for API endpoints
- Health check validation

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- Follow C# coding conventions
- Write unit tests for new features
- Update documentation for API changes
- Run `dotnet format` before committing

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation**: See [DEPLOYMENT.md](DEPLOYMENT.md) and [PRODUCTION_CONFIG.md](PRODUCTION_CONFIG.md)
- **Issues**: Open an issue on GitHub
- **Email**: support@yourcompany.com

---

## 🎯 Roadmap

### Future Enhancements
- [ ] Mobile API (iOS/Android SDKs)
- [ ] Advanced AI/ML features (lead scoring prediction, churn prediction)
- [ ] Multi-language support (i18n)
- [ ] WhatsApp integration
- [ ] Advanced reporting (Power BI integration)
- [ ] GraphQL API
- [ ] Real-time collaboration (SignalR)

---

## 🙏 Acknowledgments

- [.NET Foundation](https://dotnetfoundation.org/)
- [Hangfire](https://www.hangfire.io/)
- [Serilog](https://serilog.net/)
- [Scalar](https://github.com/scalar/scalar)

---

**Built with ❤️ using .NET 10 | Production-Ready Multi-Tenant CRM SaaS**

---

## 📊 Quick Stats

- **Lines of Code**: 50,000+
- **API Endpoints**: 100+
- **Background Jobs**: 10 recurring jobs
- **Entities**: 30+ domain models
- **Features**: 13 major phases
- **Development Time**: Complete enterprise CRM
- **Status**: ✅ **PRODUCTION READY**
