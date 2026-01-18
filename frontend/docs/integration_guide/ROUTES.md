# Project Routes Documentation

## Public Routes (Không cần authentication)

### Authentication Pages
- **GET** `/` - Redirect to `/dashboard`
- **GET** `/auth/login` - Trang đăng nhập
- **GET** `/auth/register` - Trang đăng ký tenant mới

## Protected Routes (Cần authentication)

### Dashboard & Analytics
- **GET** `/dashboard` - Trang tổng quan dashboard chính

### Lead Management (Quản lý Khách hàng tiềm năng)
- **GET** `/leads` - Danh sách leads với phân trang, filter, search
- **GET** `/leads/new` - Form tạo lead mới
- **GET** `/leads/[id]` - Chi tiết lead & form chỉnh sửa (dynamic route)

### Contact Management (Quản lý Liên hệ)
- **GET** `/contacts` - Danh sách contacts
- **GET** `/contacts/new` - Form tạo contact mới (sẽ implement)
- **GET** `/contacts/[id]` - Chi tiết contact (sẽ implement)

### Company Management (Quản lý Công ty)
- **GET** `/companies` - Danh sách companies
- **GET** `/companies/new` - Form tạo company (sẽ implement)
- **GET** `/companies/[id]` - Chi tiết company (sẽ implement)

### Deal Pipeline (Quản lý Cơ hội bán hàng)
- **GET** `/deals` - Danh sách deals & pipeline view
- **GET** `/deals/new` - Form tạo deal (sẽ implement)
- **GET** `/deals/[id]` - Chi tiết deal (sẽ implement)

### Ticket System (Hệ thống Ticket hỗ trợ)
- **GET** `/tickets` - Danh sách tickets
- **GET** `/tickets/new` - Form tạo ticket (sẽ implement)
- **GET** `/tickets/[id]` - Chi tiết ticket (sẽ implement)

### Activities (Hoạt động)
- **GET** `/activities` - Danh sách activities (tasks, calls, meetings, emails)
- **GET** `/activities/new` - Form tạo activity (sẽ implement)
- **GET** `/activities/[id]` - Chi tiết activity (sẽ implement)

### Workflow Automation (Quy trình Tự động)
- **GET** `/workflows` - Danh sách workflows
- **GET** `/workflows/new` - Form tạo workflow (sẽ implement)
- **GET** `/workflows/[id]` - Chi tiết workflow (sẽ implement)

### Marketing Campaigns (Chiến dịch Marketing)
- **GET** `/campaigns` - Danh sách campaigns
- **GET** `/campaigns/new` - Form tạo campaign (sẽ implement)
- **GET** `/campaigns/[id]` - Chi tiết campaign (sẽ implement)

### Reports & Analytics (Báo cáo & Phân tích)
- **GET** `/reports` - Trang báo cáo tổng hợp

### Settings (Cài đặt)
- **GET** `/settings` - Trang cài đặt (Profile, Theme, Language, Security, Notifications, Integrations)

## API Routes (Backend Integration)

### Authentication API
- **POST** `/api/v1/auth/login` - Đăng nhập
- **POST** `/api/v1/auth/refresh` - Refresh token
- **POST** `/api/v1/tenants/register` - Đăng ký tenant mới

### Leads API
- **GET** `/api/v1/leads` - List leads (với pagination: pageNumber, pageSize)
- **GET** `/api/v1/leads/{id}` - Get lead by ID
- **POST** `/api/v1/leads` - Create lead
- **PUT** `/api/v1/leads/{id}` - Update lead
- **DELETE** `/api/v1/leads/{id}` - Delete lead (soft delete)
- **POST** `/api/v1/leads/{id}/assign` - Assign lead to user
- **POST** `/api/v1/leads/{id}/convert` - Convert lead to customer

### Contacts API
- **GET** `/api/v1/contacts` - List contacts
- **GET** `/api/v1/contacts/{id}` - Get contact
- **POST** `/api/v1/contacts` - Create contact
- **PUT** `/api/v1/contacts/{id}` - Update contact
- **DELETE** `/api/v1/contacts/{id}` - Delete contact

### Companies API
- **GET** `/api/v1/companies` - List companies
- **GET** `/api/v1/companies/{id}` - Get company
- **POST** `/api/v1/companies` - Create company
- **PUT** `/api/v1/companies/{id}` - Update company
- **DELETE** `/api/v1/companies/{id}` - Delete company

### Deals API
- **GET** `/api/v1/deals` - List deals
- **GET** `/api/v1/deals/{id}` - Get deal
- **POST** `/api/v1/deals` - Create deal
- **PUT** `/api/v1/deals/{id}` - Update deal
- **DELETE** `/api/v1/deals/{id}` - Delete deal

### Tickets API
- **GET** `/api/v1/tickets` - List tickets
- **GET** `/api/v1/tickets/{id}` - Get ticket
- **POST** `/api/v1/tickets` - Create ticket
- **PUT** `/api/v1/tickets/{id}` - Update ticket
- **DELETE** `/api/v1/tickets/{id}` - Delete ticket

### Reports API
- **GET** `/api/v1/reports/dashboard` - Dashboard stats
- **GET** `/api/v1/reports/sales-performance` - Sales performance metrics
- **GET** `/api/v1/reports/lead-conversion` - Lead conversion funnel
- **GET** `/api/v1/reports/ticket-summary` - Ticket summary stats
- **GET** `/api/v1/reports/user-activity` - User activity stats

## Notes

### Routing Structure
- Tất cả protected routes nằm trong folder `(dashboard)` - sử dụng AuthGuard
- Public routes (auth) nằm ngoài
- Dynamic routes sử dụng `[id]` folder convention

### Missing Implementations
Các trang cần implement:
- Create/Edit forms cho: Contacts, Companies, Deals, Tickets, Activities, Campaigns, Workflows
- Detail pages cho các modules còn lại

### Pagination
- Frontend sử dụng: `page`, `pageSize`
- Backend expects: `pageNumber`, `pageSize`
- Service layer tự động convert giữa 2 format này

### Authentication Flow
1. User access protected route
2. AuthGuard checks localStorage for tokens
3. If no tokens → redirect to `/auth/login`
4. After login → redirect to `/dashboard`
5. Token auto-refresh khi gần hết hạn (5 phút trước expiry)
