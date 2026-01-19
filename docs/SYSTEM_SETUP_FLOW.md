# 🚀 Hướng dẫn Setup Hệ thống CRM - Từ đầu đến cuối

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Luồng Setup Ban đầu](#luồng-setup-ban-đầu)
3. [Luồng Onboarding Tenant mới](#luồng-onboarding-tenant-mới)
4. [Luồng Quản lý Users](#luồng-quản-lý-users)
5. [Luồng Nghiệp vụ CRM](#luồng-nghiệp-vụ-crm)

---

## 🎯 Tổng quan

Hệ thống CRM SaaS sử dụng kiến trúc **Multi-tenant với SharedDatabase**. Mỗi tenant có data riêng nhưng share chung database.

**Các cấp độ dữ liệu:**
```
🌐 Global Level (Shared)
   ├── Permissions (84 permissions)
   └── System Configuration

🏢 Tenant Level (Isolated)
   ├── Tenant Info
   ├── Roles (custom per tenant)
   ├── Users
   ├── Customers, Leads, Opportunities
   └── All business data
```

---

## 🔧 Luồng Setup Ban đầu

### **Phase 1: Database & Application Setup** ⚙️

#### **Bước 1.1: Chuẩn bị Database**

```powershell
# Tạo database trên SQL Server
CREATE DATABASE CrmSaas_Master_Dev;
GO
```

#### **Bước 1.2: Deploy Application lần đầu**

```powershell
# Publish application
cd D:\Draft\volcanion-crm-backend\src\CrmSaas.Api
dotnet publish -c Release -o D:\Deploy\CrmSaas.Api
```

#### **Bước 1.3: Run Migrations & Seeding**

Khi application chạy lần đầu tiên, `Program.cs` sẽ tự động:

```csharp
// 1. Run migrations → Tạo tables
await masterContext.Database.MigrateAsync();
await tenantContext.Database.MigrateAsync();

// 2. Run seeding → Tạo data mặc định
await DatabaseSeeder.SeedAsync(masterContext, tenantContext);
```

**Kết quả sau seeding:**
- ✅ **84 Permissions** được tạo
- ✅ **1 Default Tenant** (`default`)
- ✅ **4 Default Roles** (Administrator, Sales Manager, Sales Rep, Support Agent)
- ✅ **1 Admin User** (`admin@volcanion.vn` / `Admin@123`)
- ✅ **1 Default Pipeline** (6 stages)
- ✅ **1 Default SLA**

---

### **Phase 2: Xác minh Setup thành công** ✅

#### **Bước 2.1: Test API có chạy không**

```http
GET https://localhost:5001/health
```

**Response:**
```json
{
  "status": "Healthy",
  "checks": [
    { "name": "database", "status": "Healthy" },
    { "name": "hangfire", "status": "Healthy" }
  ]
}
```

#### **Bước 2.2: Login với Admin account**

```http
POST https://localhost:5001/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@volcanion.vn",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 3600,
    "user": {
      "id": "...",
      "email": "admin@volcanion.vn",
      "firstName": "System",
      "lastName": "Administrator",
      "tenantId": "00000000-0000-0000-0000-000000000001"
    }
  }
}
```

#### **Bước 2.3: Verify Permissions**

```http
GET https://localhost:5001/api/v1/roles/permissions
Authorization: Bearer <token>
X-Tenant-Id: default
```

**Response:** 84 permissions nhóm theo module

#### **Bước 2.4: Verify Roles**

```http
GET https://localhost:5001/api/v1/roles
Authorization: Bearer <token>
X-Tenant-Id: default
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000010",
      "name": "Administrator",
      "description": "Full system access",
      "isSystemRole": true,
      "dataScope": "All",
      "permissionCount": 84
    },
    {
      "id": "00000000-0000-0000-0000-000000000011",
      "name": "Sales Manager",
      "dataScope": "Team",
      "permissionCount": 48
    },
    // ...
  ]
}
```

---

## 🏢 Luồng Onboarding Tenant mới

### **Kịch bản:** Công ty mới đăng ký sử dụng CRM

#### **Bước 1: Tạo Tenant** 🏢

```http
POST https://localhost:5001/api/v1/tenants
Authorization: Bearer <admin-token>
X-Tenant-Id: default
Content-Type: application/json

{
  "name": "Công ty ABC",
  "identifier": "abc-corp",
  "subdomain": "abc",
  "plan": "Professional",
  "maxUsers": 50,
  "maxStorageBytes": 5368709120,
  "contactEmail": "admin@abc.com",
  "contactPhone": "+84901234567",
  "timeZone": "Asia/Ho_Chi_Minh",
  "culture": "vi-VN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "guid-abc-tenant",
    "name": "Công ty ABC",
    "identifier": "abc-corp",
    "subdomain": "abc",
    "status": "Active",
    "plan": "Professional"
  }
}
```

**❗ Lưu ý:** 
- `identifier` và `subdomain` phải unique
- Tenant mới **KHÔNG tự động có Roles/Users**

---

#### **Bước 2: Tạo Custom Roles cho Tenant** 👥

**Option 1: Sử dụng System Roles có sẵn**
- ✅ Không cần tạo gì thêm
- Administrator, Sales Manager, Sales Rep, Support Agent đã có sẵn

**Option 2: Tạo Custom Role**

```http
POST https://localhost:5001/api/v1/roles
Authorization: Bearer <admin-token>
X-Tenant-Id: abc-corp
Content-Type: application/json

{
  "name": "Marketing Manager",
  "description": "Quản lý chiến dịch marketing",
  "dataScope": "Team",
  "permissionIds": [
    "guid-campaign-view",
    "guid-campaign-create",
    "guid-campaign-update",
    "guid-campaign-delete",
    "guid-customer-view",
    "guid-lead-view",
    "guid-report-view"
  ]
}
```

**Làm sao biết `permissionIds`?**
```http
GET https://localhost:5001/api/v1/roles/permissions
X-Tenant-Id: abc-corp
```

Chọn permissions phù hợp từ 84 permissions có sẵn.

---

#### **Bước 3: Tạo Admin User cho Tenant** 👤

```http
POST https://localhost:5001/api/v1/users
Authorization: Bearer <admin-token>
X-Tenant-Id: abc-corp
Content-Type: application/json

{
  "email": "admin@abc.com",
  "password": "Abc@123456",
  "firstName": "Nguyễn",
  "lastName": "Admin ABC",
  "phone": "+84901234567",
  "timeZone": "Asia/Ho_Chi_Minh",
  "culture": "vi-VN",
  "roleIds": [
    "00000000-0000-0000-0000-000000000010"  // Administrator role
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "guid-abc-admin",
    "email": "admin@abc.com",
    "fullName": "Nguyễn Admin ABC",
    "status": "Active",
    "roles": ["Administrator"]
  }
}
```

**✅ Tenant đã sẵn sàng sử dụng!**

---

#### **Bước 4: Cấu hình Tenant (Optional)** ⚙️

**4.1. Tạo Pipeline riêng (nếu không dùng default)**

```http
POST https://localhost:5001/api/v1/pipelines
X-Tenant-Id: abc-corp

{
  "name": "Enterprise Sales Pipeline",
  "description": "Quy trình bán hàng doanh nghiệp",
  "stages": [
    { "name": "Discovery", "probability": 10 },
    { "name": "Demo", "probability": 30 },
    { "name": "Proposal", "probability": 50 },
    { "name": "Contract Review", "probability": 75 },
    { "name": "Won", "probability": 100, "isWon": true },
    { "name": "Lost", "probability": 0, "isLost": true }
  ]
}
```

**4.2. Tạo SLA riêng**

```http
POST https://localhost:5001/api/v1/slas
X-Tenant-Id: abc-corp

{
  "name": "Premium SLA",
  "description": "SLA cho khách hàng VIP",
  "priority": "High",
  "responseTime": 60,
  "resolutionTime": 480
}
```

---

## 👥 Luồng Quản lý Users

### **Kịch bản 1: Thêm Sales Rep vào team**

```http
POST https://localhost:5001/api/v1/users
X-Tenant-Id: abc-corp

{
  "email": "sales1@abc.com",
  "password": "Sales@123",
  "firstName": "Trần",
  "lastName": "Văn Sales",
  "roleIds": [
    "00000000-0000-0000-0000-000000000012"  // Sales Representative
  ]
}
```

### **Kịch bản 2: Nâng cấp User lên Manager**

```http
PUT https://localhost:5001/api/v1/users/{userId}
X-Tenant-Id: abc-corp

{
  "roleIds": [
    "00000000-0000-0000-0000-000000000011"  // Sales Manager
  ]
}
```

### **Kịch bản 3: User có nhiều Roles**

```http
PUT https://localhost:5001/api/v1/users/{userId}
X-Tenant-Id: abc-corp

{
  "roleIds": [
    "00000000-0000-0000-0000-000000000011",  // Sales Manager
    "guid-marketing-manager"                  // Marketing Manager (custom role)
  ]
}
```

---

## 📊 Luồng Nghiệp vụ CRM

### **Luồng 1: Quản lý Leads → Customers** 🎯

#### **Bước 1: Import hoặc tạo Leads**

```http
POST https://localhost:5001/api/v1/leads
X-Tenant-Id: abc-corp

{
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "email": "nguyenvana@example.com",
  "phone": "+84912345678",
  "company": "Công ty XYZ",
  "source": "Website",
  "status": "New"
}
```

#### **Bước 2: Qualify & Assign Lead**

```http
PUT https://localhost:5001/api/v1/leads/{leadId}/assign
X-Tenant-Id: abc-corp

{
  "assignedToId": "guid-sales-rep"
}
```

#### **Bước 3: Convert Lead → Customer**

```http
POST https://localhost:5001/api/v1/leads/{leadId}/convert
X-Tenant-Id: abc-corp

{
  "createOpportunity": true,
  "opportunityName": "Cơ hội từ Công ty XYZ",
  "estimatedValue": 100000000
}
```

**Kết quả:**
- ✅ Lead status = Converted
- ✅ Customer mới được tạo
- ✅ Opportunity mới được tạo (nếu `createOpportunity: true`)

---

### **Luồng 2: Quản lý Sales Pipeline** 💼

#### **Bước 1: Tạo Opportunity**

```http
POST https://localhost:5001/api/v1/opportunities
X-Tenant-Id: abc-corp

{
  "name": "Bán phần mềm CRM cho XYZ",
  "customerId": "guid-customer-xyz",
  "pipelineId": "guid-pipeline",
  "stageId": "guid-stage-qualification",
  "estimatedValue": 100000000,
  "probability": 10,
  "expectedCloseDate": "2026-03-31"
}
```

#### **Bước 2: Di chuyển qua các Stage**

```http
PUT https://localhost:5001/api/v1/opportunities/{oppId}/move-stage
X-Tenant-Id: abc-corp

{
  "stageId": "guid-stage-proposal",
  "notes": "Đã gửi đề xuất giá"
}
```

#### **Bước 3: Tạo Quotation**

```http
POST https://localhost:5001/api/v1/quotations
X-Tenant-Id: abc-corp

{
  "opportunityId": "guid-opportunity",
  "customerId": "guid-customer",
  "validUntil": "2026-02-28",
  "items": [
    {
      "productId": "guid-product",
      "quantity": 10,
      "unitPrice": 5000000,
      "discount": 500000
    }
  ]
}
```

#### **Bước 4: Close Won → Create Order**

```http
POST https://localhost:5001/api/v1/opportunities/{oppId}/close-won
X-Tenant-Id: abc-corp

{
  "createOrder": true,
  "notes": "Khách hàng đã ký hợp đồng"
}
```

---

### **Luồng 3: Quản lý Support Tickets** 🎫

#### **Bước 1: Customer tạo Ticket**

```http
POST https://localhost:5001/api/v1/tickets
X-Tenant-Id: abc-corp

{
  "title": "Lỗi đăng nhập hệ thống",
  "description": "Không thể đăng nhập sau khi đổi mật khẩu",
  "customerId": "guid-customer",
  "priority": "High",
  "category": "Technical"
}
```

#### **Bước 2: Assign Ticket cho Support Agent**

```http
PUT https://localhost:5001/api/v1/tickets/{ticketId}/assign
X-Tenant-Id: abc-corp

{
  "assignedToId": "guid-support-agent"
}
```

#### **Bước 3: Agent xử lý & Comment**

```http
POST https://localhost:5001/api/v1/tickets/{ticketId}/comments
X-Tenant-Id: abc-corp

{
  "content": "Đã reset mật khẩu. Vui lòng check email.",
  "isInternal": false
}
```

#### **Bước 4: Resolve Ticket**

```http
PUT https://localhost:5001/api/v1/tickets/{ticketId}/resolve
X-Tenant-Id: abc-corp

{
  "resolutionNotes": "Đã giải quyết bằng cách reset password"
}
```

---

### **Luồng 4: Marketing Campaigns** 📢

#### **Bước 1: Tạo Campaign**

```http
POST https://localhost:5001/api/v1/campaigns
X-Tenant-Id: abc-corp

{
  "name": "Khuyến mãi cuối năm 2026",
  "type": "Email",
  "startDate": "2026-12-01",
  "endDate": "2026-12-31",
  "budget": 50000000,
  "targetAudience": "Existing Customers"
}
```

#### **Bước 2: Add Members (Leads/Customers)**

```http
POST https://localhost:5001/api/v1/campaigns/{campaignId}/members
X-Tenant-Id: abc-corp

{
  "memberType": "Customer",
  "memberIds": [
    "guid-customer-1",
    "guid-customer-2",
    "guid-customer-3"
  ]
}
```

#### **Bước 3: Send Campaign**

```http
POST https://localhost:5001/api/v1/campaigns/{campaignId}/send
X-Tenant-Id: abc-corp

{
  "templateId": "guid-email-template",
  "scheduledTime": "2026-12-01T09:00:00Z"
}
```

#### **Bước 4: Track Results**

```http
GET https://localhost:5001/api/v1/campaigns/{campaignId}/analytics
X-Tenant-Id: abc-corp
```

**Response:**
```json
{
  "sent": 1000,
  "delivered": 980,
  "opened": 450,
  "clicked": 120,
  "responded": 25,
  "roi": 3.5
}
```

---

## 📈 Luồng Reports & Analytics

### **Bước 1: Sales Report**

```http
GET https://localhost:5001/api/v1/reports/sales
X-Tenant-Id: abc-corp
?startDate=2026-01-01&endDate=2026-01-31
```

### **Bước 2: Pipeline Analytics**

```http
GET https://localhost:5001/api/v1/analytics/pipeline
X-Tenant-Id: abc-corp
?pipelineId=guid-pipeline
```

### **Bước 3: Team Performance**

```http
GET https://localhost:5001/api/v1/analytics/team-performance
X-Tenant-Id: abc-corp
?teamId=guid-team&period=monthly
```

---

## 🔐 Matrix Phân quyền

### **Administrator** (Full Access)
- ✅ Tất cả 84 permissions
- ✅ View/Edit tất cả data (DataScope: All)
- ✅ Quản lý Users, Roles, Settings

### **Sales Manager** (Team Lead)
- ✅ View/Edit/Delete: Customers, Contacts, Leads, Opportunities, Orders, Contracts
- ✅ View Reports & Activities
- ✅ DataScope: Team (chỉ thấy data của team mình)
- ❌ Không quản lý Users/Roles/Tenants

### **Sales Representative** (Individual)
- ✅ View/Create/Update: Customers, Leads, Opportunities
- ✅ View Reports
- ✅ DataScope: Own (chỉ thấy data được assign cho mình)
- ❌ Không Delete, không Export/Import
- ❌ Không thấy data của người khác

### **Support Agent**
- ✅ View/Edit: Customers, Contacts, Tickets, Activities
- ✅ DataScope: All (thấy tất cả tickets)
- ❌ Không truy cập Sales data (Opportunities, Orders, Contracts)

---

## 🔄 Decision Flow Charts

### **Khi nào tạo Tenant mới?**
```
Công ty mới đăng ký? 
    ├─ Yes → Tạo Tenant mới
    └─ No → Dùng Tenant hiện tại
```

### **Khi nào tạo Role mới?**
```
4 System Roles đủ dùng?
    ├─ Yes → Sử dụng System Roles
    └─ No → Tạo Custom Role mới
              └─ Chọn Permissions phù hợp
```

### **Lead Qualification Flow**
```
Lead mới
  ├─ Qualified? 
  │    ├─ Yes → Convert to Customer
  │    │         └─ Create Opportunity?
  │    │              ├─ Yes → Tạo Opportunity
  │    │              └─ No → Chỉ tạo Customer
  │    └─ No → Continue nurturing
  │              └─ Schedule follow-up
  └─ Unqualified? → Mark as Lost
```

### **Opportunity Stage Flow**
```
New Opportunity
  → Qualification (10%)
  → Needs Analysis (25%)
  → Proposal (50%)
  → Negotiation (75%)
  → Closed Won (100%) ✅
     └─ Create Order
         └─ Create Contract
  
  OR → Closed Lost (0%) ❌
```

---

## ⚠️ Common Mistakes & Solutions

### ❌ **Mistake 1: Tạo User trước khi có Tenant**
**Error:** `Tenant context is not set`

**Solution:** Luôn tạo Tenant TRƯỚC, sau đó mới tạo Users

### ❌ **Mistake 2: Quên gửi X-Tenant-Id header**
**Error:** `401 Unauthorized` hoặc empty data

**Solution:** Mọi request đều phải có `X-Tenant-Id: <tenant-identifier>`

### ❌ **Mistake 3: Assign Role không tồn tại**
**Error:** `Role not found`

**Solution:** 
1. Check Roles có sẵn: `GET /api/v1/roles`
2. Tạo Role mới nếu cần
3. Dùng đúng `roleId` (GUID format)

### ❌ **Mistake 4: User không có Permission**
**Error:** `403 Forbidden - Insufficient permissions`

**Solution:**
1. Check Permissions của Role: `GET /api/v1/roles/{roleId}`
2. Update Role Permissions: `PUT /api/v1/roles/{roleId}/permissions`
3. Hoặc assign Role khác có đủ permissions

### ❌ **Mistake 5: Cross-Tenant Data Leak**
**Behavior:** Không thấy data của tenant khác (đây là **đúng**)

**Solution:** Không có solution - đây là tính năng bảo mật của multi-tenant!

---

## 📚 Quick Reference

### **Thứ tự setup Tenant mới**
1. ✅ Tạo Tenant
2. ✅ (Optional) Tạo Custom Roles
3. ✅ Tạo Admin User cho Tenant
4. ✅ (Optional) Cấu hình Pipeline/SLA
5. ✅ Thêm Users khác
6. ✅ Bắt đầu sử dụng CRM

### **Thứ tự Sales Process**
1. ✅ Leads → Import hoặc tạo mới
2. ✅ Qualify Leads → Assign cho Sales
3. ✅ Convert → Customer + Opportunity
4. ✅ Move stages → Quotation → Order
5. ✅ Close Won → Contract
6. ✅ Post-sales → Support Tickets

### **API Headers chuẩn**
```http
Authorization: Bearer <jwt-token>
X-Tenant-Id: <tenant-identifier>
Content-Type: application/json
Accept: application/json
```

---

## 🎓 Best Practices

### ✅ DO
1. **Luôn có backup** trước khi modify Roles/Permissions
2. **Test với data giả** trước khi production
3. **Document custom roles** và lý do tạo
4. **Monitor tenant usage** (users, storage)
5. **Regular audit logs review**

### ❌ DON'T
1. **Không delete System Roles**
2. **Không hardcode TenantId** trong code
3. **Không share credentials** giữa tenants
4. **Không bypass permissions** cho convenience
5. **Không skip onboarding steps**

---

## 📞 Support & Resources

- **API Documentation:** [Postman Collection](./CRM_SaaS_API_v2.postman_collection.json)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Technical Flow:** [USER_CREATION_FLOW.md](./USER_CREATION_FLOW.md)
- **Business Requirements:** [Requirements.md](./common/Requirements.md)

---

**Version:** 1.0  
**Last Updated:** 2026-01-19  
**Maintained by:** CRM Development Team
