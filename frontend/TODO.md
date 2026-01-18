# 📋 CRM Frontend - TODO & Roadmap

> **Generated:** 2026-01-18
> **Based on:** [BUSINESS_FLOW.md](./docs/BUSINESS_FLOW.md)

---

## 📊 Module Implementation Status

| Module | Service | Hook | List | Create | Edit | Detail | Overall |
|--------|:-------:|:----:|:----:|:------:|:----:|:------:|:-------:|
| Campaign | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 100% |
| Lead | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 95% |
| Customer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 90% |
| Opportunity | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 🟡 40% |
| Deal | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🟢 85% |
| Quotation | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🟢 85% |
| Contract | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🟢 85% |
| Order | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🟢 85% |
| Ticket | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 70% |
| Activity | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🟢 85% |
| Pipeline | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | 🔴 10% |
| Contact | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 90% |
| Company | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🟢 85% |
| Workflow | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔴 15% |

**Legend:** ✅ Done | ⚠️ Partial | ❌ Missing

---

## 🔴 HIGH PRIORITY - Critical Business Flows

### 1. Campaign Module (Marketing → Lead Generation) ✅ COMPLETED
> **Business Flow:** Marketing campaigns drive lead generation

**Completed:**
- [x] Create `src/hooks/useCampaigns.ts` hook file
- [x] Update `src/services/campaign.service.ts` with full CRUD
- [x] Implement `campaigns/page.tsx` - List with filters (type, status), search, pagination
- [x] Implement `campaigns/new/page.tsx` - Campaign creation form (name, type, content, scheduled date)
- [x] Implement `campaigns/[id]/page.tsx` - Campaign detail with performance stats (sent, opened, clicked, converted)
- [x] Implement `campaigns/[id]/edit/page.tsx` - Edit campaign
- [x] Add Send campaign action
- [x] Add Delete campaign action

**API Mapping:**
```
POST /api/v1/campaigns - Create campaign
GET  /api/v1/campaigns - List with pagination
GET  /api/v1/campaigns/{id} - Get campaign details
PUT  /api/v1/campaigns/{id} - Update campaign
DELETE /api/v1/campaigns/{id} - Delete campaign
POST /api/v1/campaigns/{id}/send - Send campaign
GET  /api/v1/campaigns/{id}/stats - Performance metrics
```

---

### 2. Pipeline Configuration Module
> **Business Flow:** Configure sales stages (Qualification → Discovery → Proposal → Negotiation → Closed)

**Missing:**
- [ ] Create `src/types/pipeline.ts` - Pipeline, Stage types
- [ ] Create `src/services/pipeline.service.ts` - CRUD for pipelines & stages
- [ ] Create `src/hooks/usePipelines.ts` - React Query hooks
- [ ] Implement `settings/pipelines/page.tsx` - Pipeline list
- [ ] Implement `settings/pipelines/[id]/page.tsx` - Stage management (drag & drop)
- [ ] Add probability settings per stage
- [ ] Add stage transition rules

**API Mapping:**
```
POST /api/v1/pipelines - Create pipeline
GET  /api/v1/pipelines - List pipelines
PUT  /api/v1/pipelines/{id}/stages - Update stages order
```

---

### 3. Ticket Detail Page
> **Business Flow:** Support agents resolve customer issues

**Missing:**
- [ ] Create `tickets/[id]/page.tsx` - Ticket detail view
- [ ] Show ticket timeline/history
- [ ] Add SLA countdown timer
- [ ] Add resolve/close actions
- [ ] Add escalation UI
- [ ] Add internal notes section
- [ ] Create `tickets/[id]/edit/page.tsx` - Edit ticket

**API Mapping:**
```
GET  /api/v1/tickets/{id} - Get ticket detail
POST /api/v1/tickets/{id}/resolve - Resolve ticket
POST /api/v1/tickets/{id}/escalate - Escalate to manager
```

---

### 4. Workflow Automation Module
> **Business Flow:** Auto-assign leads, SLA alerts, contract renewal reminders

**Missing:**
- [ ] Create `src/hooks/useWorkflows.ts` - React Query hooks
- [ ] Implement `workflows/page.tsx` - Workflow list with enable/disable toggle
- [ ] Implement `workflows/new/page.tsx` - Visual workflow builder
- [ ] Implement `workflows/[id]/page.tsx` - Workflow detail & execution logs
- [ ] Add trigger configuration (entity events)
- [ ] Add condition builder (field comparisons)
- [ ] Add action configuration (assign, notify, create, update)

**Sample Workflows to Pre-configure:**
1. Auto-assign hot leads to senior sales
2. Alert 30 days before contract expiry
3. SLA breach warning (30 min before)
4. Welcome email on customer creation

---

## 🟡 MEDIUM PRIORITY - Enhanced Features

### 5. Lead Conversion Flow
> **Business Flow:** Lead → Customer + Opportunity

**Improvements:**
- [ ] Add conversion wizard/modal in lead detail page
- [ ] Option to create Customer only, or Customer + Opportunity
- [ ] Pre-fill opportunity data from lead (estimated value)
- [ ] Select target pipeline and initial stage
- [ ] Link converted entities back to original lead

**Current Status:** API exists (`POST /api/v1/leads/{id}/convert`), but UI conversion flow needs enhancement

---

### 6. Deal/Opportunity Pipeline Board View
> **Business Flow:** Visual sales pipeline with drag & drop

**Missing:**
- [ ] Create `deals/pipeline/page.tsx` - Kanban board view
- [ ] Drag & drop deals between stages
- [ ] Show weighted pipeline value
- [ ] Quick edit deal from card
- [ ] Filter by owner, date range, value
- [ ] Stage-wise summary (count, total value)

---

### 7. Quotation → Order Conversion
> **Business Flow:** Customer accepts quote → Create order

**Improvements:**
- [ ] Add "Convert to Order" button on quotation detail
- [ ] Pre-fill order items from quotation
- [ ] Apply discounts and terms from quotation
- [ ] Link order back to quotation and opportunity

**Current Status:** API exists (`POST /api/v1/quotations/{id}/convert-to-order`)

---

### 8. Contract Renewal Workflow
> **Business Flow:** 30 days before expiry → Create renewal opportunity

**Missing:**
- [ ] Add "Renew" button on contract detail
- [ ] Create renewal quotation with previous terms
- [ ] Upsell opportunity creation
- [ ] Contract history timeline (original → renewals)
- [ ] Dashboard widget for expiring contracts

---

### 9. Customer 360° View
> **Business Flow:** Complete customer profile with all related entities

**Missing on Customer Detail:**
- [ ] Recent orders list
- [ ] Open tickets list
- [ ] Active contracts summary
- [ ] Opportunities in pipeline
- [ ] Activity timeline
- [ ] Lifetime value chart
- [ ] Contact persons list

---

### 10. Reports & Analytics Dashboard
> **Business Flow:** Sales performance, pipeline health, lead conversion

**Missing:**
- [ ] Pipeline analysis chart (stage-wise value)
- [ ] Lead conversion funnel
- [ ] Sales rep performance comparison
- [ ] Revenue forecast
- [ ] Customer acquisition cost (CAC)
- [ ] Customer lifetime value (CLV) trends
- [ ] Export to PDF/Excel

---

## 🟢 LOW PRIORITY - Nice to Have

### 11. Email Integration
- [ ] Send email from CRM (activities)
- [ ] Email templates
- [ ] Track opens/clicks
- [ ] Auto-create ticket from incoming email

### 12. Calendar Integration
- [ ] Sync activities to Google/Outlook
- [ ] Schedule meetings from CRM
- [ ] Calendar view for activities

### 13. Bulk Operations
- [ ] Bulk import leads from CSV
- [ ] Bulk assign leads/tickets
- [ ] Bulk update status
- [ ] Bulk delete with confirmation

### 14. Search & Filters
- [ ] Global search across all entities
- [ ] Save filter presets
- [ ] Recent items quick access

### 15. Notifications
- [ ] In-app notification center
- [ ] Real-time updates (WebSocket)
- [ ] Email notification preferences
- [ ] Browser push notifications

### 16. Mobile Responsiveness
- [ ] Optimize tables for mobile
- [ ] Touch-friendly forms
- [ ] Swipe actions on list items

---

## 🐛 Bug Fixes Required

### API Response Handling
- [x] Fix `items?.map` optional chaining in customers/page.tsx
- [x] Fix `items?.map` optional chaining in companies/page.tsx  
- [x] Fix `items?.map` optional chaining in contacts/new/page.tsx
- [ ] Audit all list pages for similar issues

### Type Mismatches
- [x] Fix `pageNumber` → `page` in PaginationParams
- [x] Fix Pagination component props mismatch
- [ ] Audit all usages of PaginationParams

### Disabled Features
- [x] Disabled `useCustomerStats` (backend endpoint not ready)
- [ ] Re-enable when backend implements `/api/v1/customers/stats`

---

## 🔧 Technical Debt

### Code Consistency
- [ ] Standardize form patterns across modules
- [ ] Create reusable form field components
- [ ] Create reusable filter bar component
- [ ] Consolidate Opportunity vs Deal types (duplication)

### API Layer
- [ ] Add request/response interceptors for error handling
- [ ] Implement retry logic for failed requests
- [ ] Add request cancellation on component unmount

### Performance
- [ ] Implement infinite scroll for large lists
- [ ] Add skeleton loading states
- [ ] Optimize re-renders with React.memo
- [ ] Add data prefetching on hover

### Testing
- [ ] Add unit tests for services
- [ ] Add unit tests for hooks
- [ ] Add E2E tests for critical flows (lead conversion, deal won)

---

## 📅 Suggested Implementation Order

### Phase 1 (Week 1-2): Critical Gaps
1. Campaign module (hooks + pages)
2. Ticket detail page
3. Pipeline configuration

### Phase 2 (Week 3-4): Sales Flow
4. Lead conversion wizard
5. Deal pipeline board (Kanban)
6. Quotation → Order conversion

### Phase 3 (Week 5-6): Post-Sales
7. Contract renewal workflow
8. Customer 360° view
9. Workflow automation

### Phase 4 (Week 7-8): Analytics & Polish
10. Reports dashboard
11. Bug fixes & technical debt
12. Mobile optimization

---

## 📝 Notes

### Entity Relationships (from Business Flow)
```
Campaign → Lead → Customer + Opportunity → Quotation → Contract → Order
                       ↓
                   Contact
                       ↓
                   Ticket → Activity
```

### Key Business Metrics to Track
- Lead conversion rate (by source, rating)
- Pipeline velocity (average days per stage)
- Win rate (deals won / total closed)
- Average deal size
- Customer lifetime value
- SLA compliance rate

---

*Last updated: 2026-01-18*
