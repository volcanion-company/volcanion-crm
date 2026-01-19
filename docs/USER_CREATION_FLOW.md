# 📘 Luồng thêm mới User trong hệ thống CRM Multi-tenant

## 🎯 Tổng quan

Tài liệu này mô tả chi tiết luồng thêm mới User từ đầu đến cuối trong hệ thống CRM SaaS với kiến trúc multi-tenant (SharedDatabase strategy).

---

## 🔄 Luồng xử lý chính

### **1️⃣ Client gửi Request**

```http
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer <jwt-token>
X-Tenant-Id: default

{
  "email": "newuser@example.com",
  "password": "Password@123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+84901234567",
  "timeZone": "Asia/Ho_Chi_Minh",
  "culture": "vi-VN",
  "roleIds": [
    "guid-role-id-1",
    "guid-role-id-2"
  ]
}
```

**Headers quan trọng:**
- `Authorization`: JWT token để xác thực user hiện tại
- `X-Tenant-Id`: Tenant identifier (hoặc subdomain nếu dùng subdomain resolution)

---

### **2️⃣ Middleware Pipeline Processing**

#### **a) ExceptionHandlingMiddleware**
- Bắt và xử lý tất cả exceptions trong pipeline

#### **b) Authentication Middleware**
- Validate JWT token
- Populate `HttpContext.User` với claims từ token
- Claims bao gồm: `UserId`, `Email`, `TenantId`, v.v.

#### **c) Authorization Middleware**  
- Kiểm tra user đã authenticated chưa (`[Authorize]`)

#### **d) TenantMiddleware** ⭐ **QUAN TRỌNG**
```csharp
// TenantMiddleware.cs
public async Task InvokeAsync(HttpContext context)
{
    // 1. Resolve TenantId từ header hoặc subdomain
    var tenantIdentifier = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();
    
    // 2. Lookup Tenant từ database
    var tenant = await masterDb.Tenants
        .FirstOrDefaultAsync(t => t.Identifier == tenantIdentifier);
    
    // 3. Set TenantId vào ITenantContext (scoped service)
    tenantContext.SetTenantId(tenant.Id);
    
    await _next(context);
}
```

**Kết quả:** `ITenantContext.TenantId` được set cho request hiện tại

---

### **3️⃣ Controller Processing**

#### **UsersController.Create()**

```csharp
[HttpPost]
[RequirePermission(Permissions.UserCreate)]
public async Task<ActionResult<ApiResponse<UserResponse>>> Create(
    [FromBody] CreateUserRequest request)
{
    // 1️⃣ VALIDATION: Kiểm tra email đã tồn tại chưa
    if (await db.Users.AnyAsync(u => u.Email == request.Email))
    {
        return BadRequestResponse<UserResponse>("Email already exists");
    }
    
    // 2️⃣ TẠO USER ENTITY (CHƯA CÓ TenantId!)
    var user = new User
    {
        Email = request.Email,
        PasswordHash = authService.HashPassword(request.Password),
        FirstName = request.FirstName,
        LastName = request.LastName,
        Phone = request.Phone,
        TimeZone = request.TimeZone ?? "UTC",
        Culture = request.Culture ?? "en-US",
        Status = UserStatus.Active,
        CreatedBy = currentUser.UserId
        // ❌ TenantId KHÔNG được set ở đây!
    };
    
    // 3️⃣ THÊM VÀO DbContext (State = Added)
    db.Users.Add(user);
    
    // 4️⃣ SAVE CHANGES - Đây là bước TenantId được tự động set!
    await db.SaveChangesAsync(); // ⭐ MÃ PHÉP THUẬT Ở ĐÂY!
    
    // 5️⃣ ASSIGN ROLES
    if (request.RoleIds != null && request.RoleIds.Any())
    {
        foreach (var roleId in request.RoleIds)
        {
            db.Set<UserRole>().Add(new UserRole
            {
                UserId = user.Id,
                RoleId = roleId
            });
        }
        await db.SaveChangesAsync();
    }
    
    // 6️⃣ AUDIT LOG
    await auditService.LogAsync(
        AuditActions.Create, 
        nameof(User), 
        user.Id, 
        user.Email
    );
    
    // 7️⃣ RETURN RESPONSE
    return CreatedResponse(new UserResponse { ... });
}
```

---

### **4️⃣ TenantDbContext.SaveChangesAsync() - Magic Happens Here! ✨**

```csharp
public override async Task<int> SaveChangesAsync(
    CancellationToken cancellationToken = default)
{
    // 1️⃣ TỰ ĐỘNG SET TenantId CHO CÁC ENTITY MỚI
    SetTenantId(); // ⭐⭐⭐ ĐIỂM QUAN TRỌNG NHẤT!
    
    // 2️⃣ TỰ ĐỘNG SET CreatedAt, UpdatedAt
    SetAuditFields();
    
    // 3️⃣ TRACK CHANGES FOR WORKFLOW
    var trackedChanges = await TrackWorkflowChangesAsync(cancellationToken);
    
    // 4️⃣ LƯU VÀO DATABASE
    var result = await base.SaveChangesAsync(cancellationToken);
    
    // 5️⃣ XỬ LÝ WORKFLOWS (nếu có)
    var workflowEngine = serviceProvider?.GetService<IWorkflowEngine>();
    if (workflowEngine != null && trackedChanges.Any())
    {
        await ProcessWorkflowsAsync(trackedChanges, workflowEngine, cancellationToken);
    }
    
    return result;
}
```

#### **SetTenantId() - Chi tiết cách TenantId được set**

```csharp
private void SetTenantId()
{
    // 1️⃣ KIỂM TRA TenantContext có TenantId không
    if (tenantContext?.TenantId == null) 
    {
        return; // ⚠️ Nếu không có TenantId, bỏ qua!
    }
    
    // 2️⃣ TÌM TẤT CẢ ENTITIES MỚI (State = Added)
    var entries = ChangeTracker.Entries<ITenantEntity>()
        .Where(e => e.State == EntityState.Added);
    
    // 3️⃣ SET TenantId CHO TỪNG ENTITY
    foreach (var entry in entries)
    {
        // Chỉ set nếu TenantId chưa có (= Guid.Empty)
        if (entry.Entity.TenantId == Guid.Empty)
        {
            entry.Entity.TenantId = tenantContext.TenantId.Value;
            // ✅ User.TenantId được set tại đây!
        }
    }
}
```

---

### **5️⃣ Database Persistence**

Sau khi `SaveChangesAsync()` hoàn tất:

```sql
-- User được insert vào database với TenantId
INSERT INTO [dbo].[Users] (
    Id, 
    TenantId,           -- ✅ Được set tự động từ ITenantContext
    Email, 
    PasswordHash,
    FirstName,
    LastName,
    Phone,
    Status,
    CreatedAt,          -- ✅ Được set tự động = DateTime.UtcNow
    CreatedBy,
    TimeZone,
    Culture,
    EmailConfirmed,
    IsDeleted
) VALUES (
    @Id,
    '00000000-0000-0000-0000-000000000001', -- TenantId từ context
    'newuser@example.com',
    '<hashed-password>',
    'John',
    'Doe',
    '+84901234567',
    0,  -- Active
    '2026-01-19 10:30:00',
    @CurrentUserId,
    'Asia/Ho_Chi_Minh',
    'vi-VN',
    0,  -- false
    0   -- false
);
```

---

### **6️⃣ Query Filtering - Tại sao chỉ thấy 1 user?**

Khi query Users:

```csharp
var users = await db.Users.ToListAsync();
```

EF Core tự động apply **Global Query Filter**:

```csharp
// TenantDbContext.cs - OnModelCreating
modelBuilder.Entity<User>(entity =>
{
    // ⚠️ Query Filter 1: Soft Delete
    entity.HasQueryFilter(e => !e.IsDeleted);
    
    // ⚠️ Query Filter 2: Tenant Isolation (implicit qua ITenantEntity)
    // EF tự động filter: WHERE TenantId = @CurrentTenantId
});
```

**SQL thực tế được generate:**

```sql
SELECT * 
FROM [dbo].[Users]
WHERE IsDeleted = 0 
  AND TenantId = '00000000-0000-0000-0000-000000000001'
  -- ⬆️ TenantId lấy từ ITenantContext
```

**Vì vậy:**
- Database có 3 users (thuộc 3 tenants khác nhau)
- Nhưng API chỉ trả về 1 user (thuộc tenant hiện tại)
- ✅ **Đây là hành vi đúng của multi-tenant system!**

---

## 🔍 Chi tiết các Component

### **ITenantContext Interface**

```csharp
public interface ITenantContext
{
    Guid? TenantId { get; }
    void SetTenantId(Guid tenantId);
}

public class TenantContext : ITenantContext
{
    private Guid? _tenantId;
    
    public Guid? TenantId => _tenantId;
    
    public void SetTenantId(Guid tenantId)
    {
        _tenantId = tenantId;
    }
}
```

**Lifecycle:** Scoped (mỗi HTTP request có 1 instance riêng)

---

### **ITenantEntity Interface**

```csharp
public interface ITenantEntity
{
    Guid TenantId { get; set; }
}

public class User : TenantAuditableEntity, ITenantEntity
{
    public Guid TenantId { get; set; }  // ✅ Implement từ ITenantEntity
    public string Email { get; set; }
    // ... other properties
}
```

---

### **Tenant Resolution Strategies**

#### **1. Header-based (mặc định)**
```http
X-Tenant-Id: default
```

#### **2. Subdomain-based**
```
https://acme.crm.com/api/v1/users
         ^^^^
      subdomain = tenant identifier
```

#### **3. JWT Token-based**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "tenant_id": "guid-tenant-id"
}
```

---

## ⚠️ Vấn đề thường gặp

### **Vấn đề 1: User không có TenantId**

**Nguyên nhân:**
- `ITenantContext.TenantId` bị `null` khi `SaveChangesAsync()`
- TenantMiddleware không chạy (missing header)
- Tenant không tồn tại trong database

**Giải pháp:**
```csharp
// Trong controller, check trước khi tạo user
if (currentUser.TenantId == null)
{
    return BadRequestResponse("Tenant context is not set");
}
```

### **Vấn đề 2: Query không trả về đúng số lượng user**

**Nguyên nhân:**
- Query filter đang hoạt động (chỉ trả về users của tenant hiện tại)
- Đây là **hành vi đúng** của multi-tenant system

**Nếu cần query ALL users (admin purpose):**
```csharp
var allUsers = await db.Users
    .IgnoreQueryFilters()  // ⚠️ Bypass tenant filter
    .ToListAsync();
```

### **Vấn đề 3: Email đã tồn tại ở tenant khác**

**Hiện tại:** Email unique trên **cùng tenant**
```sql
CREATE UNIQUE INDEX IX_Users_TenantId_Email 
ON Users (TenantId, Email);
```

**Nếu cần email unique global:**
```sql
CREATE UNIQUE INDEX IX_Users_Email_Global 
ON Users (Email);
```

---

## 🧪 Testing

### **Test 1: Tạo user với tenant đúng**

```http
POST /api/v1/users
X-Tenant-Id: tenant-a

{
  "email": "user1@tenant-a.com",
  "password": "Pass@123",
  "firstName": "User",
  "lastName": "One"
}
```

**Expected:**
- ✅ User được tạo với `TenantId = tenant-a`
- ✅ Query từ tenant-a sẽ thấy user này
- ✅ Query từ tenant-b KHÔNG thấy user này

### **Test 2: Query users từ các tenant khác nhau**

```http
GET /api/v1/users
X-Tenant-Id: tenant-a
→ Trả về users của tenant-a

GET /api/v1/users  
X-Tenant-Id: tenant-b
→ Trả về users của tenant-b (khác với tenant-a)
```

### **Test 3: Admin query all users**

```csharp
// Controller mới cho admin
[HttpGet("all")]
[RequirePermission("admin.viewAllUsers")]
public async Task<ActionResult<ApiResponse<List<UserResponse>>>> GetAllUsersAcrossTenants()
{
    var users = await db.Users
        .IgnoreQueryFilters()  // Bypass tenant filter
        .ToListAsync();
    
    return OkResponse(users);
}
```

---

## 📊 Sequence Diagram

```
Client          Controller        TenantContext    DbContext         Database
  |                 |                   |              |                 |
  |-- POST /users ->|                   |              |                 |
  |                 |                   |              |                 |
  |                 |-- Get TenantId -->|              |                 |
  |                 |<-- TenantId ------┘              |                 |
  |                 |                                  |                 |
  |                 |-- Create User Entity             |                 |
  |                 |                                  |                 |
  |                 |-- db.Users.Add(user) ----------->|                 |
  |                 |                                  |                 |
  |                 |-- db.SaveChangesAsync() -------->|                 |
  |                 |                                  |                 |
  |                 |                   <-- SetTenantId()                |
  |                 |                   (user.TenantId = context.TenantId)
  |                 |                                  |                 |
  |                 |                                  |-- INSERT ------>|
  |                 |                                  |<-- Success -----┘
  |                 |<--------------------------------┘                 |
  |                 |                                                    |
  |<-- Response ----┘                                                    |
```

---

## 🎓 Best Practices

### ✅ DO

1. **Luôn gửi X-Tenant-Id header** trong mọi request
2. **Validate TenantId** trước khi tạo entities quan trọng
3. **Sử dụng IgnoreQueryFilters()** một cách cẩn thận (chỉ cho admin features)
4. **Test cross-tenant isolation** kỹ lưỡng
5. **Log TenantId** trong audit logs để trace

### ❌ DON'T

1. **Không hardcode TenantId** trong controller
2. **Không bypass tenant filter** cho normal users
3. **Không quên check TenantId** khi làm việc với relationships
4. **Không share JWT tokens** giữa các tenants
5. **Không expose TenantId** trong public APIs

---

## 📚 Related Documentation

- [Multi-Tenancy Architecture](./ARCHITECTURE.md#multi-tenancy)
- [API Authentication](./api/Auth_API.md)
- [Users API](./api/Users_API.md)
- [Database Schema](./common/Phase9_DBArchitecture_Report.md)

---

## 🔄 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-19 | Initial documentation |

---

**Tác giả:** CRM Development Team  
**Cập nhật lần cuối:** 2026-01-19
