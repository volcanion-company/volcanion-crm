# Contracts API Documentation

## Tổng quan Module

### Contract là gì?

**Contract (Hợp đồng)** là thỏa thuận pháp lý ràng buộc giữa công ty và khách hàng về việc cung cấp sản phẩm/dịch vụ. Contract được tạo sau khi Order completed hoặc cho các dịch vụ dài hạn (subscription, support, maintenance).

### Vị trí của Contract trong Business Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   CONTRACT IN BUSINESS LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────┐    ┌──────────┐    ┌───────┐    ┌──────────┐              │
│  │OPPORTUNITY │───►│QUOTATION │───►│ ORDER │───►│ CONTRACT │──┐           │
│  └────────────┘    └──────────┘    └───────┘    └──────────┘  │           │
│       Deal             Báo giá       Đơn hàng     Hợp đồng     │           │
│                                                         │       │           │
│                                                         │       │           │
│                                                         ▼       │           │
│                                                  ┌────────────┐ │           │
│                                                  │   ACTIVE   │ │           │
│                                                  │  Contract  │ │           │
│                                                  └─────┬──────┘ │           │
│                                                        │        │           │
│                                         ┌──────────────┼────┐   │           │
│                                         │              │    │   │           │
│                                         ▼              ▼    ▼   │           │
│                                    ┌─────────┐  ┌────────┐  ┌──────┐       │
│                                    │RECURRING│  │EXPIRED │  │CANCEL│       │
│                                    │ BILLING │  │        │  │      │       │
│                                    └─────────┘  └────┬───┘  └──────┘       │
│                                                      │                      │
│                                                      ▼                      │
│                                              ┌──────────────┐               │
│                                              │    RENEW     │───────────┐   │
│                                              │ (New Contract)│           │   │
│                                              └──────────────┘           │   │
│                                                      │                  │   │
│                                                      └──────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Contract vs Order vs Agreement

| Khái niệm | Phạm vi | Legal Binding | Ví dụ |
|-----------|---------|---------------|-------|
| **Order** | Giao dịch 1 lần | ✅ Yes (short-term) | "Mua 50 licenses, delivery 1 lần" |
| **Contract** | Dịch vụ dài hạn | ✅ Yes (long-term) | "Support contract 12 tháng, auto-renew" |
| **SLA** | Cam kết chất lượng | ✅ Yes (part of contract) | "Response time < 4h, uptime 99.9%" |
| **Agreement** | Thỏa thuận chung | ⚠️ Depends | "NDA, partnership agreement" |

---

## Tại sao cần Contract Management?

### Vấn đề thực tế

| Vấn đề | Giải pháp của Contract Module |
|--------|------------------------------|
| Quên renew contract → Service bị ngắt | Auto-renewal với notice period |
| Không track được contract nào sắp hết hạn | Expiring soon alerts (30 days) |
| Billing thủ công, dễ sót tháng | Auto-recurring billing theo frequency |
| Không có audit trail cho compliance | Full contract lifecycle tracking |
| Customer dispute về terms | Stored contract document (PDF) |
| Khó scale với 1000+ contracts | Automated management system |

---

## Contract Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CONTRACT STATUS FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────┐    ┌──────────────────┐    ┌──────────┐    ┌────────┐          │
│  │ DRAFT │───►│ PENDING APPROVAL │───►│ APPROVED │───►│ ACTIVE │          │
│  └───┬───┘    └──────────────────┘    └──────────┘    └───┬────┘          │
│      │                                                      │               │
│      │                                                      │               │
│      │                                         ┌────────────┼────────────┐  │
│      │                                         │            │            │  │
│      │                                         ▼            ▼            ▼  │
│      │                                    ┌─────────┐  ┌─────────┐  ┌──────┐
│      │                                    │CANCELLED│  │ EXPIRED │  │ACTIVE│
│      │                                    └─────────┘  └────┬────┘  └──┬───┘
│      │                                                      │           │   │
│      │                                                      ▼           │   │
│      │                                                 ┌─────────┐      │   │
│      │                                                 │ RENEWED │      │   │
│      │                                                 │         │      │   │
│      │                                                 │(Create  │      │   │
│      │                                                 │ new)    │      │   │
│      │                                                 └─────────┘      │   │
│      │                                                                  │   │
│      ▼                                                                  │   │
│  ┌───────────┐                                                         │   │
│  │ CANCELLED │                                                         │   │
│  │(from Draft)│                                                        │   │
│  └───────────┘                                                         │   │
│                                                                         │   │
│  Auto-Renewal Process:                                                 │   │
│  ────────────────────────────────────────────────────────────────────  │   │
│                                                                         │   │
│  EndDate - NoticePeriod = RenewalDate                                  │   │
│  System sends renewal reminder                                         │   │
│  If AutoRenew = true → Create new contract automatically ──────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Chi tiết từng Status

| Status | Ý nghĩa | Action tiếp theo | Can Edit? |
|--------|---------|------------------|-----------|
| **Draft** | Đang soạn, chưa chính thức | Submit for approval | ✅ Yes |
| **PendingApproval** | Chờ manager/legal duyệt | Approve hoặc Reject | ❌ No |
| **Approved** | Đã duyệt, chờ active | Activate (khi StartDate đến) | ⚠️ Limited |
| **Active** | Đang có hiệu lực | Billing, renew, cancel | ⚠️ Limited |
| **Expired** | Hết hạn, chưa renew | Renew hoặc Archive | ❌ No |
| **Cancelled** | Đã hủy | Archive | ❌ No |
| **Renewed** | Đã renew (có contract mới) | - | ❌ No |

---

## Contract Types

### Phân loại theo tính chất

| Type | Mô tả | Billing | Renewal | Ví dụ |
|------|-------|---------|---------|-------|
| **Service** | Dịch vụ cung cấp | Recurring | Yes | "Consulting service 12 months" |
| **Subscription** | Thuê bao sử dụng | Monthly/Yearly | Auto | "SaaS subscription 50 users" |
| **Support** | Hỗ trợ kỹ thuật | Annual | Yes | "24/7 support contract" |
| **License** | Quyền sử dụng | One-time hoặc Annual | Optional | "Software license renewal" |
| **Maintenance** | Bảo trì | Quarterly/Annual | Yes | "Hardware maintenance" |

---

## Billing Frequency

### Chu kỳ thanh toán

| Frequency | Description | Contract Value | Per Period |
|-----------|-------------|----------------|------------|
| **OneTime** | Trả 1 lần duy nhất | $12,000 | $12,000 (1 lần) |
| **Monthly** | Hàng tháng | $12,000/year | $1,000/month |
| **Quarterly** | Hàng quý (3 tháng) | $12,000/year | $3,000/quarter |
| **SemiAnnually** | Nửa năm (6 tháng) | $12,000/year | $6,000/6 months |
| **Annually** | Hàng năm | $12,000/year | $12,000/year |

### Ví dụ thực tế

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              CONTRACT #CTR-000123 - ABC CORP SUPPORT                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Contract Type: Support                                                     │
│  Total Value: $24,000 for 12 months                                         │
│  Billing Frequency: Quarterly                                               │
│  Start Date: January 1, 2026                                                │
│  End Date: December 31, 2026                                                │
│                                                                             │
│  Billing Schedule:                                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Q1 (Jan-Mar): $6,000   ✓ Paid                                             │
│  Q2 (Apr-Jun): $6,000   ⏳ Due April 1                                      │
│  Q3 (Jul-Sep): $6,000   ⏳ Due July 1                                       │
│  Q4 (Oct-Dec): $6,000   ⏳ Due October 1                                    │
│                                                                             │
│  Auto-Renewal: Enabled                                                      │
│  Renewal Period: 12 months                                                  │
│  Notice Period: 30 days before expiry                                       │
│  Renewal Date: December 1, 2026 (customer must notify if not renew)        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Auto-Renewal Process

### Cơ chế Auto-Renewal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AUTO-RENEWAL TIMELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Contract: CTR-000123                                                       │
│  Start: Jan 1, 2026                                                         │
│  End: Dec 31, 2026                                                          │
│  Auto-Renew: Yes                                                            │
│  Notice Period: 30 days                                                     │
│                                                                             │
│  Timeline:                                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Jan 1, 2026                                                                │
│  │ Contract Active                                                          │
│  │                                                                          │
│  ▼                                                                          │
│  ... (10 months active) ...                                                 │
│  │                                                                          │
│  ▼                                                                          │
│  Nov 1, 2026  (60 days before expiry)                                      │
│  │ 📧 System Alert: "Contract expiring in 60 days"                         │
│  │                                                                          │
│  ▼                                                                          │
│  Dec 1, 2026  (Renewal Date = EndDate - NoticePeriod)                      │
│  │ 📧 System Alert: "Contract auto-renewing in 30 days"                    │
│  │ ⚠️  Customer must notify if they DON'T want to renew                    │
│  │                                                                          │
│  ▼                                                                          │
│  Dec 15, 2026                                                               │
│  │ 📧 Reminder: "Auto-renewal in 15 days"                                  │
│  │                                                                          │
│  ▼                                                                          │
│  Dec 31, 2026  (End Date)                                                   │
│  │ ✅ AUTO-RENEWAL TRIGGERED                                                │
│  │ System creates new contract:                                            │
│  │   - CTR-000456 (new contract)                                           │
│  │   - Start: Jan 1, 2027                                                  │
│  │   - End: Dec 31, 2027                                                   │
│  │   - Status: Draft → Review → Active                                     │
│  │ Old contract status: Active → Renewed                                   │
│  │                                                                          │
│  ▼                                                                          │
│  Jan 1, 2027                                                                │
│  New contract active                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Renewal Options

| Scenario | AutoRenew | Action |
|----------|-----------|--------|
| **Happy customer** | ✅ Enabled | Auto-create new contract, seamless transition |
| **Customer wants out** | ✅ Enabled | Notify before RenewalDate (30 days notice) |
| **Manual renewal** | ❌ Disabled | Follow up 60 days before expiry, manual renew |
| **One-time contract** | ❌ Disabled | Complete and archive when expired |

---

## Ý nghĩa nghiệp vụ từng chức năng

### 1. Tạo Contract (Create Contract)

**Nghiệp vụ thực tế:**
- Order completed → Tạo contract cho ongoing service
- Customer mua subscription → Tạo contract
- Renew support/maintenance → Tạo contract mới

**Ví dụ thực tế:**
> Order #ORD-000123 (CRM Software + Support) completed:
> - Sales tạo Contract:
>   * Title: "ABC Corp - CRM Support & Maintenance"
>   * Type: Support
>   * Value: $24,000/year
>   * Billing: Quarterly ($6,000/quarter)
>   * Period: 12 months (Jan 1, 2026 - Dec 31, 2026)
>   * Auto-Renew: Yes
>   * Notice Period: 30 days
>   * Status: Draft
> - Submit for approval
> - Legal team review terms
> - Manager approve
> - Activate contract on StartDate

---

### 2. Xem danh sách Contracts (Get All Contracts)

**Nghiệp vụ thực tế:**
- Account Manager review tất cả contracts active
- Finance check recurring billing schedule
- Legal audit contracts compliance

**Ví dụ thực tế:**
> Account Manager mỗi tháng:
> - Filter Status = Active → 45 contracts đang chạy
> - Filter BillingFrequency = Monthly → 28 contracts bill hàng tháng
> - Sort by Value desc → Focus vào top contracts ($100K+)

---

### 3. Contracts Expiring Soon (Get Expiring Soon)

**Nghiệp vụ thực tế:**
- Proactive renewal - liên hệ customer trước khi hết hạn
- Prevent service interruption
- Upsell opportunities

**Ví dụ thực tế:**
> Renewal Manager mỗi tuần:
> - Check contracts expiring in 30 days → 8 contracts
> - Check contracts expiring in 60 days → 15 contracts
> - Prioritize by value:
>   * Contract A: $100K, expires in 25 days → Call customer ngay
>   * Contract B: $5K, expires in 45 days → Email follow-up
> - Track renewal probability, plan upsell

---

### 4. Xem chi tiết Contract (Get Contract by ID)

**Nghiệp vụ thực tế:**
- Customer service trả lời câu hỏi về contract terms
- Billing team verify billing schedule
- Legal review contract details

**Ví dụ thực tế:**
> Customer call: "Contract CTR-000123 của tôi, khi nào renew?"
> - Support xem chi tiết:
>   * End Date: Dec 31, 2026
>   * Auto-Renew: Yes
>   * Notice Period: 30 days
>   * Renewal Date: Dec 1, 2026 (must notify before this date if not renew)
> → Reply: "Contract auto-renew vào 31/12. Nếu không muốn renew, vui lòng thông báo trước 1/12"

---

### 5. Cập nhật Contract (Update Contract)

**Nghiệp vụ thực tế:**
- Negotiate terms: discount, value adjustment
- Update auto-renew settings
- Attach contract document (signed PDF)

**Lưu ý:** Contract active có thể update một số fields (value, auto-renew), nhưng không thể thay đổi start/end date.

**Ví dụ thực tế:**
> Customer: "Chúng tôi scale down to 30 users, adjust contract value được không?"
> - Account Manager review: Contract active, mid-term
> - Update Value: $24,000 → $18,000
> - Update billing: $6,000/quarter → $4,500/quarter
> - Add note: "Reduced to 30 users per customer request"
> - Create amendment document
> → Contract updated

---

### 6. Approve Contract (Approve Contract)

**Nghiệp vụ thực tế:**
- Manager/Legal review và approve contract draft
- Move contract từ PendingApproval → Approved
- Ready to activate

**Ví dụ thực tế:**
> Legal team review Contract Draft $100K:
> - Check terms & conditions: OK
> - Check compliance: OK
> - Check pricing: Competitive
> - Click "Approve"
> - Status: PendingApproval → Approved
> - Notify Account Manager: "Contract approved, ready to activate"

---

### 7. Activate Contract (Activate Contract)

**Nghiệp vụ thực tế:**
- Contract được activate vào StartDate
- Bắt đầu billing cycle
- Customer có thể sử dụng service

**Ví dụ thực tế:**
> Contract CTR-000123, StartDate = Jan 1, 2026:
> - Account Manager click "Activate" on Jan 1
> - Status: Approved → Active
> - System auto:
>   * Setup recurring billing (quarterly)
>   * Send welcome email to customer
>   * Provision services (activate licenses)
>   * Set renewal reminder (60 days before expiry)

---

### 8. Renew Contract (Renew Contract)

**Nghiệp vụ thực tế:**
- Contract hết hạn → Create contract mới
- Copy terms từ contract cũ
- Adjust pricing nếu cần

**Ví dụ thực tế:**
> Contract CTR-000123 expires Dec 31, 2026:
> - Customer: "We want to renew for another 12 months"
> - Account Manager click "Renew Contract"
> - System auto-create:
>   * New contract: CTR-000456
>   * Title: "ABC Corp - CRM Support & Maintenance - Renewal"
>   * Start: Jan 1, 2027
>   * End: Dec 31, 2027
>   * Value: $24,000 (same) hoặc adjust (e.g., $26,000 with inflation)
>   * Status: Draft (need approval again)
> - Old contract status: Active → Renewed
> - Manager approve new contract
> - Auto-activate on Jan 1, 2027

---

### 9. Cancel Contract (Cancel Contract)

**Nghiệp vụ thực tế:**
- Customer yêu cầu hủy contract mid-term
- Early termination
- Calculate refund nếu có

**Ví dụ thực tế:**
> Customer: "We want to cancel contract, company downsizing"
> - Account Manager:
>   * Review contract terms: 30 days notice required
>   * Check billing: Paid until end of quarter (March 31)
>   * Calculate refund/penalty if early termination
>   * Click "Cancel Contract"
>   * Status: Active → Cancelled
>   * Effective Date: March 31, 2026 (end of paid period)
> - Finance process refund if applicable
> - Deactivate services on effective date

---

### 10. Xóa Contract (Delete Contract)

**Nghiệp vụ thực tế:**
- Xóa contract draft nhầm, duplicate
- Soft delete để giữ audit trail

---

## Tích hợp với các module khác

```
                        ┌─────────────┐
                        │  CONTRACT   │
                        │  (Hợp đồng) │
                        └──────┬──────┘
                               │
      ┌────────────────────────┼────────────────────────┐
      │                │                 │              │
      ▼                ▼                 ▼              ▼
┌──────────┐    ┌──────────┐     ┌──────────┐   ┌──────────┐
│ CUSTOMER │    │  ORDER   │     │ BILLING  │   │  TICKET  │
│          │    │          │     │          │   │          │
│ Owner    │    │ Source   │     │ Recurring│   │ Support  │
└──────────┘    └──────────┘     └──────────┘   └──────────┘
      │                                │
      ▼                                ▼
┌──────────┐                    ┌──────────┐
│OPPORTUNITY│                    │ INVOICE  │
│           │                    │          │
│ Origin    │                    │ Payment  │
└──────────┘                    └──────────┘
```

| Module | Quan hệ | Mô tả |
|--------|---------|-------|
| **Customer** | Contract của Customer | Xem tất cả contracts của khách hàng |
| **Order** | Order → Contract | Order completed tạo contract |
| **Billing** | Contract → Recurring Billing | Auto-bill theo frequency |
| **Invoice** | Contract → Invoice | Generate invoice theo schedule |
| **Ticket** | Contract có Support Tickets | Support requests under contract |
| **Opportunity** | Opportunity → Contract | Renewal opportunities |
| **Interaction** | Contract là Interaction | Ghi nhận vào lịch sử |

---

## Best Practices

### 1. Luôn set Auto-Renewal cho subscription

- Prevent service interruption
- Reduce churn
- Smooth revenue stream
- Customer convenience

### 2. Notice Period rõ ràng

- Standard: 30-60 days
- Enterprise: 90 days
- Document in contract terms
- Auto-remind customer

### 3. Track Contract Value

- Annual Contract Value (ACV)
- Total Contract Value (TCV)
- Monthly Recurring Revenue (MRR)
- → Business metrics

### 4. Compliance & Audit

- Store signed contract document
- Track all changes (audit log)
- Legal review for large contracts
- GDPR compliance (data retention)

### 5. Proactive Renewal Management

- 90 days: First touch
- 60 days: Proposal sent
- 30 days: Follow-up
- 15 days: Urgent
- 7 days: Executive escalation

---

## Technical Overview

**Base URL:** `/api/v1/contracts`

**Authentication:** Bearer Token (JWT)

---

## Endpoints

### 1. Get All Contracts

Lấy danh sách contracts với phân trang và filter.

```
GET /api/v1/contracts
```

**Permission Required:** `contract.view`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pageNumber` | int | No | 1 | Số trang |
| `pageSize` | int | No | 10 | Số items mỗi trang (max: 100) |
| `sortBy` | string | No | "CreatedAt" | Field để sắp xếp |
| `sortDescending` | bool | No | false | Sắp xếp giảm dần |
| `search` | string | No | - | Tìm kiếm theo contractNumber, title |
| `status` | ContractStatus | No | - | Filter theo status |
| `customerId` | Guid | No | - | Filter theo customer |

#### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "contractNumber": "CTR-000123",
        "title": "ABC Corp - CRM Support & Maintenance",
        "customerName": "ABC Corporation",
        "status": "Active",
        "type": "Support",
        "value": 24000.00,
        "currency": "USD",
        "billingFrequency": "Quarterly",
        "startDate": "2026-01-01T00:00:00Z",
        "endDate": "2026-12-31T00:00:00Z",
        "renewalDate": "2026-12-01T00:00:00Z",
        "autoRenew": true,
        "createdAt": "2025-12-15T10:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 3,
    "totalCount": 28,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

---

### 2. Get Expiring Soon Contracts

Lấy danh sách contracts sắp hết hạn.

```
GET /api/v1/contracts/expiring-soon?days=30
```

**Permission Required:** `contract.view`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `days` | int | No | 30 | Số ngày sắp hết hạn |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "contract-guid",
      "contractNumber": "CTR-000456",
      "title": "XYZ Corp - Software License",
      "customerName": "XYZ Corporation",
      "status": "Active",
      "type": "License",
      "value": 50000.00,
      "endDate": "2026-02-10T00:00:00Z",
      "renewalDate": "2026-01-10T00:00:00Z",
      "autoRenew": false
    }
  ]
}
```

---

### 3. Get Contract by ID

Lấy chi tiết một contract.

```
GET /api/v1/contracts/{id}
```

**Permission Required:** `contract.view`

#### Response

```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "contractNumber": "CTR-000123",
    "title": "ABC Corp - CRM Support & Maintenance",
    "customerName": "ABC Corporation",
    "contactName": "Nguyen Van A",
    "orderNumber": "ORD-000456",
    "status": "Active",
    "type": "Support",
    "value": 24000.00,
    "currency": "USD",
    "billingFrequency": "Quarterly",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T00:00:00Z",
    "signedDate": "2025-12-20T00:00:00Z",
    "renewalDate": "2026-12-01T00:00:00Z",
    "autoRenew": true,
    "renewalPeriodMonths": 12,
    "noticePeriodDays": 30,
    "description": "24/7 support with 4-hour response time",
    "terms": "Auto-renewal unless 30 days written notice. Payment quarterly in advance.",
    "documentUrl": "https://storage.example.com/contracts/CTR-000123.pdf",
    "createdAt": "2025-12-15T10:00:00Z"
  }
}
```

---

### 4. Create Contract

Tạo contract mới.

```
POST /api/v1/contracts
```

**Permission Required:** `contract.create`

#### Request Body

```json
{
  "title": "ABC Corp - CRM Support & Maintenance",
  "customerId": "customer-guid",
  "contactId": "contact-guid",
  "orderId": "order-guid",
  "type": 2,
  "value": 24000.00,
  "currency": "USD",
  "billingFrequency": 2,
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-12-31T00:00:00Z",
  "signedDate": "2025-12-20T00:00:00Z",
  "autoRenew": true,
  "renewalPeriodMonths": 12,
  "noticePeriodDays": 30,
  "description": "24/7 support with 4-hour response time",
  "terms": "Auto-renewal unless 30 days written notice. Payment quarterly in advance.",
  "documentUrl": "https://storage.example.com/contracts/CTR-000123.pdf"
}
```

#### Request Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | **Yes** | Tiêu đề contract |
| `customerId` | Guid | No | ID customer |
| `contactId` | Guid | No | ID contact ký contract |
| `orderId` | Guid | No | ID order (nếu từ order) |
| `type` | ContractType | **Yes** | Loại contract |
| `value` | decimal | **Yes** | Giá trị contract |
| `currency` | string | No | Mã tiền tệ (default: USD) |
| `billingFrequency` | BillingFrequency | **Yes** | Tần suất billing |
| `startDate` | DateTime | **Yes** | Ngày bắt đầu |
| `endDate` | DateTime | **Yes** | Ngày kết thúc |
| `signedDate` | DateTime | No | Ngày ký |
| `autoRenew` | bool | No | Tự động renew (default: false) |
| `renewalPeriodMonths` | int | No | Chu kỳ renew (tháng) |
| `noticePeriodDays` | int | No | Notice period (ngày) |
| `description` | string | No | Mô tả |
| `terms` | string | No | Điều khoản |
| `documentUrl` | string | No | Link file PDF contract |

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "new-contract-guid",
    "contractNumber": "CTR-000124",
    "title": "ABC Corp - CRM Support & Maintenance",
    "status": "Draft",
    "type": "Support",
    "value": 24000.00,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T00:00:00Z",
    "createdAt": "2026-01-18T12:00:00Z"
  }
}
```

---

### 5. Update Contract

Cập nhật thông tin contract.

```
PUT /api/v1/contracts/{id}
```

**Permission Required:** `contract.update`

#### Request Body (All fields optional)

```json
{
  "title": "ABC Corp - Premium Support & Maintenance",
  "description": "Upgraded to premium support",
  "value": 30000.00,
  "autoRenew": true,
  "renewalPeriodMonths": 12,
  "noticePeriodDays": 60,
  "terms": "Updated terms...",
  "documentUrl": "https://storage.example.com/contracts/CTR-000123-v2.pdf"
}
```

---

### 6. Approve Contract

Duyệt contract (PendingApproval → Approved).

```
POST /api/v1/contracts/{id}/approve
```

**Permission Required:** `contract.update`

---

### 7. Activate Contract

Kích hoạt contract (Approved → Active).

```
POST /api/v1/contracts/{id}/activate
```

**Permission Required:** `contract.update`

---

### 8. Renew Contract

Renew contract (tạo contract mới).

```
POST /api/v1/contracts/{id}/renew
```

**Permission Required:** `contract.update`

#### Response

```json
{
  "success": true,
  "data": {
    "id": "new-contract-guid",
    "contractNumber": "CTR-000456",
    "title": "ABC Corp - CRM Support & Maintenance - Renewal",
    "status": "Draft",
    "startDate": "2027-01-01T00:00:00Z",
    "endDate": "2027-12-31T00:00:00Z",
    "createdAt": "2026-12-01T10:00:00Z"
  }
}
```

**Lưu ý:**
- Old contract status → Renewed
- New contract status = Draft (need approval)
- Copy tất cả terms từ old contract

---

### 9. Cancel Contract

Hủy contract.

```
POST /api/v1/contracts/{id}/cancel
```

**Permission Required:** `contract.update`

---

### 10. Delete Contract

Xóa mềm contract.

```
DELETE /api/v1/contracts/{id}
```

**Permission Required:** `contract.delete`

---

## Enums

### ContractType

| Value | Name | Description |
|-------|------|-------------|
| 0 | Service | Dịch vụ |
| 1 | Subscription | Thuê bao |
| 2 | Support | Hỗ trợ |
| 3 | License | Giấy phép |
| 4 | Maintenance | Bảo trì |
| 5 | Other | Khác |

### ContractStatus

| Value | Name | Description |
|-------|------|-------------|
| 0 | Draft | Nháp |
| 1 | PendingApproval | Chờ duyệt |
| 2 | Approved | Đã duyệt |
| 3 | Active | Đang có hiệu lực |
| 4 | Expired | Hết hạn |
| 5 | Cancelled | Đã hủy |
| 6 | Renewed | Đã renew |

### BillingFrequency

| Value | Name | Description |
|-------|------|-------------|
| 0 | OneTime | Một lần |
| 1 | Monthly | Hàng tháng |
| 2 | Quarterly | Hàng quý |
| 3 | SemiAnnually | Nửa năm |
| 4 | Annually | Hàng năm |

---

## Permissions

| Permission Code | Description |
|-----------------|-------------|
| `contract.view` | Xem danh sách và chi tiết contract |
| `contract.create` | Tạo contract mới |
| `contract.update` | Cập nhật, approve, activate, renew, cancel |
| `contract.delete` | Xóa contract |

---

## Example: Complete Contract Lifecycle

### Scenario: Create and manage annual support contract

#### 1. Create Contract

```bash
curl -X POST "http://localhost:5000/api/v1/contracts" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ABC Corp - CRM Support",
    "customerId": "customer-guid",
    "orderId": "order-guid",
    "type": 2,
    "value": 24000,
    "billingFrequency": 2,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T00:00:00Z",
    "autoRenew": true,
    "renewalPeriodMonths": 12,
    "noticePeriodDays": 30
  }'
```

#### 2. Approve Contract

```bash
curl -X POST "http://localhost:5000/api/v1/contracts/{contract-id}/approve" \
  -H "Authorization: Bearer {token}"
```

#### 3. Activate Contract

```bash
curl -X POST "http://localhost:5000/api/v1/contracts/{contract-id}/activate" \
  -H "Authorization: Bearer {token}"
```

#### 4. Monitor Expiring Contracts

```bash
curl -X GET "http://localhost:5000/api/v1/contracts/expiring-soon?days=60" \
  -H "Authorization: Bearer {token}"
```

#### 5. Renew Contract

```bash
curl -X POST "http://localhost:5000/api/v1/contracts/{contract-id}/renew" \
  -H "Authorization: Bearer {token}"
```

---

## Integration Examples

### Auto-create Contract from Order

```csharp
// When Order is completed and is for recurring service
if (order.Status == OrderStatus.Completed && order.IsRecurring)
{
    var contract = new Contract
    {
        Title = $"{customer.Name} - {service.Name}",
        OrderId = order.Id,
        CustomerId = order.CustomerId,
        Type = ContractType.Subscription,
        Value = order.TotalAmount,
        BillingFrequency = BillingFrequency.Monthly,
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddMonths(12),
        AutoRenew = true,
        RenewalPeriodMonths = 12,
        NoticePeriodDays = 30
    };
    
    await _db.Contracts.AddAsync(contract);
    await _db.SaveChangesAsync();
}
```

### Auto-renewal Background Job

```csharp
// Scheduled job runs daily
public async Task ProcessAutoRenewals()
{
    var today = DateTime.UtcNow.Date;
    
    var contractsToRenew = await _db.Contracts
        .Where(c => c.Status == ContractStatus.Active)
        .Where(c => c.AutoRenew)
        .Where(c => c.EndDate.Date == today)
        .ToListAsync();
    
    foreach (var contract in contractsToRenew)
    {
        // Create new contract
        var newContract = CreateRenewalContract(contract);
        _db.Contracts.Add(newContract);
        
        // Update old contract
        contract.Status = ContractStatus.Renewed;
        
        // Send notification
        await SendRenewalNotification(customer, newContract);
    }
    
    await _db.SaveChangesAsync();
}
```

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | 2026-01-18 | Initial release |
