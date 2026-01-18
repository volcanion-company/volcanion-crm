// ============================================
// Core Types
// ============================================

// Backend API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// User Status for User Management module
export enum UserStatus {
  Active = 0,
  Inactive = 1,
  Deleted = 2,
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  role: UserRole; // Keep for auth compatibility
  roles?: string[]; // User Management module supports multiple roles
  status?: UserStatus; // User Management module
  tenantId: string;
  tenantName?: string;
  isActive: boolean; // For auth compatibility
  timeZone?: string;
  culture?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
  User = 'User',
}

// User Management Request Types
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  timeZone?: string;
  culture?: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timeZone?: string;
  culture?: string;
  roleIds?: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================
// Roles & Permissions Types
// ============================================

export enum DataScope {
  AllInOrganization = 0,
  Department = 1,
  TeamOnly = 2,
  OnlyOwn = 3,
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  description?: string;
}

export interface PermissionModule {
  module: string;
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  dataScope: DataScope;
  permissionCount?: number;
  permissions?: Permission[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  dataScope: DataScope;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  dataScope?: DataScope;
}

export interface UpdateRolePermissionsRequest {
  permissionIds: string[];
}

// ============================================
// Tenant Types
// ============================================

export interface Tenant {
  id: string;
  name: string;
  companyName: string;
  domain?: string;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// Authentication Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  tenantName: string;
  companyName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tenantId: string;
  userId: string;
  user?: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================
// Lead Types
// ============================================

export enum LeadStatus {
  New = 0,
  Contacted = 1,
  Qualified = 2,
  Unqualified = 3,
  Converted = 4,
  Lost = 5,
}

export enum LeadSource {
  Website = 0,
  Referral = 1,
  SocialMedia = 2,
  Email = 3,
  Phone = 4,
  TradeShow = 5,
  Partner = 6,
  Advertisement = 7,
  ColdCall = 8,
  Other = 9,
}

export enum LeadRating {
  Cold = 0,
  Warm = 1,
  Hot = 2,
}

export interface Lead {
  id: string;
  title: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  employeeCount?: number;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  status: LeadStatus;
  source?: LeadSource;
  sourceDetail?: string;
  rating: LeadRating;
  score: number;
  estimatedValue?: number;
  description?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedAt?: string;
  convertedToCustomerId?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  title: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  employeeCount?: number;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  source?: LeadSource;
  sourceDetail?: string;
  estimatedValue?: number;
  description?: string;
  assignedToUserId?: string;
}

export interface UpdateLeadRequest {
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  status?: LeadStatus;
  rating?: LeadRating;
  score?: number;
  estimatedValue?: number;
  description?: string;
}

export interface AssignLeadRequest {
  userId: string;
}

export interface ConvertLeadRequest {
  customerName?: string;
  createOpportunity?: boolean;
  opportunityName?: string;
}

export interface ConvertLeadResponse {
  customerId: string;
  opportunityId?: string;
}

// ============================================
// Customer Types
// ============================================

export enum CustomerType {
  Individual = 0,
  Business = 1,
}

export enum CustomerStatus {
  Prospect = 0,
  Active = 1,
  Inactive = 2,
  Churned = 3,
}

export enum CustomerSource {
  Direct = 0,
  Referral = 1,
  Website = 2,
  SocialMedia = 3,
  Advertisement = 4,
  TradeShow = 5,
  Partner = 6,
  Other = 7,
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  dateOfBirth?: string;
  companyName?: string;
  taxId?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status: CustomerStatus;
  source?: CustomerSource;
  sourceDetail?: string;
  customerCode?: string;
  lifetimeValue?: number;
  notes?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  contacts?: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  type?: CustomerType;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  dateOfBirth?: string;
  companyName?: string;
  taxId?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status?: CustomerStatus;
  source?: CustomerSource;
  sourceDetail?: string;
  customerCode?: string;
  assignedToUserId?: string;
  notes?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

// ============================================
// Opportunity Types
// ============================================

export enum OpportunityStage {
  Prospecting = 0,
  Qualification = 1,
  Proposal = 2,
  Negotiation = 3,
  ClosedWon = 4,
  ClosedLost = 5,
}

export enum OpportunityType {
  NewBusiness = 0,
  ExistingBusiness = 1,
  Renewal = 2,
}

export interface Opportunity {
  id: string;
  name: string;
  customerId: string;
  customerName?: string;
  contactId?: string;
  contactName?: string;
  amount: number;
  probability: number;
  weightedAmount: number;
  stage: OpportunityStage;
  type: OpportunityType;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  description?: string;
  competitors?: string;
  nextSteps?: string;
  lossReason?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityRequest {
  name: string;
  customerId: string;
  contactId?: string;
  amount: number;
  probability?: number;
  stage?: OpportunityStage;
  type?: OpportunityType;
  expectedCloseDate?: string;
  description?: string;
  competitors?: string;
  nextSteps?: string;
  assignedToUserId?: string;
}

export interface UpdateOpportunityRequest extends Partial<CreateOpportunityRequest> {
  stage?: OpportunityStage;
  actualCloseDate?: string;
  lossReason?: string;
}

// ============================================
// Order Types
// ============================================

export enum OrderStatus {
  Draft = 0,
  Confirmed = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Completed = 5,
  Cancelled = 6,
  Refunded = 7,
}

export enum PaymentStatus {
  Unpaid = 0,
  PartiallyPaid = 1,
  Paid = 2,
  Refunded = 3,
}

export interface OrderItem {
  id: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: string;
  tax: number;
  taxRate: number;
  subtotal: number;
  total: number;
  description?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  contactId?: string;
  contactName?: string;
  opportunityId?: string;
  opportunityName?: string;
  quotationId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  subtotal: number;
  discount: number;
  discountType?: string;
  tax: number;
  taxRate: number;
  shippingFee: number;
  total: number;
  paidAmount: number;
  balanceAmount: number;
  items: OrderItem[];
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  paymentTerms?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerId: string;
  contactId?: string;
  opportunityId?: string;
  quotationId?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  items: {
    productName: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    discountType?: string;
    taxRate?: number;
    description?: string;
  }[];
  discount?: number;
  discountType?: string;
  taxRate?: number;
  shippingFee?: number;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  paymentTerms?: string;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  status?: OrderStatus;
  actualDeliveryDate?: string;
}

export interface RecordPaymentRequest {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

// ============================================
// Contract Types
// ============================================

export enum ContractType {
  Service = 0,
  Subscription = 1,
  Support = 2,
  License = 3,
  Maintenance = 4,
  Other = 5,
}

export enum ContractStatus {
  Draft = 0,
  PendingApproval = 1,
  Approved = 2,
  Active = 3,
  Expired = 4,
  Cancelled = 5,
  Renewed = 6,
}

export enum BillingFrequency {
  OneTime = 0,
  Monthly = 1,
  Quarterly = 2,
  SemiAnnually = 3,
  Annually = 4,
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  customerId: string;
  customerName?: string;
  orderId?: string;
  orderNumber?: string;
  type: ContractType;
  status: ContractStatus;
  value: number;
  billingFrequency: BillingFrequency;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  renewalPeriodMonths: number;
  noticePeriodDays: number;
  renewalDate?: string;
  renewedContractId?: string;
  previousContractId?: string;
  terms?: string;
  notes?: string;
  documentUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
  cancelledReason?: string;
  cancelledAt?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractRequest {
  title: string;
  customerId: string;
  orderId?: string;
  type: ContractType;
  value: number;
  billingFrequency: BillingFrequency;
  startDate: string;
  endDate: string;
  autoRenew?: boolean;
  renewalPeriodMonths?: number;
  noticePeriodDays?: number;
  terms?: string;
  notes?: string;
  documentUrl?: string;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  status?: ContractStatus;
}

// ============================================
// Quotation Types
// ============================================

export enum QuotationStatus {
  Draft = 0,
  Sent = 1,
  Accepted = 2,
  Rejected = 3,
  Expired = 4,
  Converted = 5,
}

export interface QuotationItem {
  id: string;
  productId?: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName?: string;
  contactId?: string;
  contactName?: string;
  opportunityId?: string;
  opportunityName?: string;
  status: QuotationStatus;
  quotationDate: string;
  expiryDate: string;
  currency: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  items: QuotationItem[];
  terms?: string;
  notes?: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  convertedOrderId?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuotationRequest {
  customerId: string;
  contactId?: string;
  opportunityId?: string;
  quotationDate?: string;
  expiryDate: string;
  currency?: string;
  items: {
    productId?: string;
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent?: number;
  }[];
  discountPercent?: number;
  terms?: string;
  notes?: string;
}

export interface UpdateQuotationRequest extends Partial<CreateQuotationRequest> {}

// ============================================
// Contact Types
// ============================================

export enum ContactStatus {
  Active = 0,
  Inactive = 1,
  Unsubscribed = 2,
}

export interface Contact {
  id: string;
  customerId?: string;
  customerName?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  isPrimary: boolean;
  status: ContactStatus;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  linkedInUrl?: string;
  notes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  customerId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  isPrimary?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  linkedInUrl?: string;
  notes?: string;
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  customerId?: string;
  isPrimary?: boolean;
  status?: ContactStatus;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  linkedInUrl?: string;
  notes?: string;
}

// ============================================
// Company Types
// ============================================

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  employeeCount?: number;
  annualRevenue?: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyRequest {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  employeeCount?: number;
  annualRevenue?: number;
}

export interface UpdateCompanyRequest extends CreateCompanyRequest {}

// ============================================
// Deal Types
// ============================================

export enum DealStage {
  Qualification = 'Qualification',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  Closing = 'Closing',
  Won = 'Won',
  Lost = 'Lost',
}

export interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: string;
  contactId?: string;
  contact?: Contact;
  companyId?: string;
  company?: Company;
  description?: string;
  lostReason?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface CreateDealRequest {
  name: string;
  amount: number;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: string;
  contactId?: string;
  companyId?: string;
  description?: string;
}

export interface UpdateDealRequest extends CreateDealRequest {}

export interface LoseDealRequest {
  lostReason: string;
}

// ============================================
// Ticket Types
// ============================================

export enum TicketStatus {
  New = 0,
  Open = 1,
  InProgress = 2,
  Pending = 3,
  OnHold = 4,
  Resolved = 5,
  Closed = 6,
  Reopened = 7,
}

export enum TicketPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

export enum TicketType {
  Question = 0,
  Problem = 1,
  Incident = 2,
  FeatureRequest = 3,
  Task = 4,
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string;
  customerId?: string;
  customerName?: string;
  contactId?: string;
  contactName?: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  channel?: string;
  category?: string;
  subCategory?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  slaId?: string;
  slaName?: string;
  dueDate?: string;
  firstResponseDate?: string;
  resolvedDate?: string;
  closedDate?: string;
  satisfactionRating?: number;
  satisfactionComment?: string;
  slaBreached: boolean;
  slaPaused: boolean;
  slaPausedMinutes: number;
  escalationCount: number;
  tags?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  description?: string;
  customerId?: string;
  contactId?: string;
  type?: TicketType;
  priority?: TicketPriority;
  channel?: string;
  slaId?: string;
  assignedToUserId?: string;
  tags?: string;
  dueDate?: string;
}

export interface UpdateTicketRequest {
  subject?: string;
  description?: string;
  priority?: TicketPriority;
  type?: TicketType;
  dueDate?: string;
}

export interface AssignTicketRequest {
  userId: string;
}

export interface PauseSLARequest {
  reason: string;
}

// ============================================
// Activity Types
// ============================================

export enum ActivityType {
  Call = 'Call',
  Email = 'Email',
  Meeting = 'Meeting',
  Task = 'Task',
  Note = 'Note',
  Deadline = 'Deadline',
}

export enum ActivityStatus {
  Planned = 'Planned',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum ActivityPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface Activity {
  id: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  subject: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  dueDate?: string;
  isCompleted: boolean;
  contactId?: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  relatedToType?: string;
  relatedToId?: string;
  relatedToName?: string;
  assignedToName?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateActivityRequest {
  type: ActivityType;
  subject: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  dueDate?: string;
  contactId?: string;
  dealId?: string;
}

export interface UpdateActivityRequest extends CreateActivityRequest {}

// ============================================
// Workflow Types
// ============================================

export enum WorkflowTriggerType {
  OnCreate = 'OnCreate',
  OnUpdate = 'OnUpdate',
  OnDelete = 'OnDelete',
  Scheduled = 'Scheduled',
}

export enum WorkflowActionType {
  SendEmail = 'SendEmail',
  CreateTask = 'CreateTask',
  UpdateField = 'UpdateField',
  CallWebhook = 'CallWebhook',
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: string;
}

export interface WorkflowAction {
  type: WorkflowActionType;
  parameters: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  triggerType: WorkflowTriggerType;
  isActive: boolean;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  entityType: string;
  triggerType: WorkflowTriggerType;
  isActive?: boolean;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
}

export interface UpdateWorkflowRequest extends CreateWorkflowRequest {}

// ============================================
// Campaign Types
// ============================================

export enum CampaignType {
  Email = 'Email',
  SMS = 'SMS',
  Social = 'Social',
  Event = 'Event',
  Webinar = 'Webinar',
  Advertisement = 'Advertisement',
  Other = 'Other',
}

export enum CampaignStatus {
  Draft = 'Draft',
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Paused = 'Paused',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  currency?: string;
  expectedRevenue?: number;
  actualRevenue?: number;
  expectedLeads?: number;
  expectedConversions?: number;
  totalSent?: number;
  totalDelivered?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalBounced?: number;
  totalUnsubscribed?: number;
  totalLeadsGenerated?: number;
  totalConversions?: number;
  ownerId?: string;
  ownerName?: string;
  targetAudience?: string;
  tags?: string;
  subject?: string;
  content?: string;
  segmentId?: string;
  scheduledDate?: string;
  sentDate?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  type: CampaignType;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  expectedRevenue?: number;
  expectedLeads?: number;
  expectedConversions?: number;
  targetAudience?: string;
  tags?: string;
  subject?: string;
  content?: string;
  segmentId?: string;
  scheduledDate?: string;
  ownerId?: string;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  status: CampaignStatus;
  budget?: number;
  actualCost?: number;
  expectedRevenue?: number;
  actualRevenue?: number;
  roi?: number;
  totalSent?: number;
  totalDelivered?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalLeadsGenerated?: number;
  totalConversions?: number;
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
}

export interface UpdateCampaignMetricsRequest {
  actualCost?: number;
  actualRevenue?: number;
  totalSent?: number;
  totalDelivered?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalBounced?: number;
  totalUnsubscribed?: number;
  totalLeadsGenerated?: number;
  totalConversions?: number;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  criteria: WorkflowCondition[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentRequest {
  name: string;
  description?: string;
  criteria: WorkflowCondition[];
}

// ============================================
// Webhook Types
// ============================================

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
  isActive?: boolean;
  secret: string;
}

export interface UpdateWebhookRequest extends CreateWebhookRequest {}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: string;
  statusCode?: number;
  response?: string;
  attemptCount: number;
  timestamp: string;
}

// ============================================
// Report Types
// ============================================

export interface SalesPipelineReport {
  totalValue: number;
  totalDeals: number;
  winRate: number;
  averageDealSize: number;
  dealsByStage: Record<string, number>;
  forecastedRevenue: number;
}

export interface LeadConversionReport {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  leadsByStatus: Record<string, number>;
  conversionFunnel: {
    stage: string;
    count: number;
    conversionRate: number;
  }[];
}

export interface TicketAnalyticsReport {
  totalTickets: number;
  openTickets: number;
  averageResolutionTime: number;
  averageFirstResponseTime: number;
  slaCompliance: number;
  ticketsByPriority: Record<string, number>;
  ticketsByStatus: Record<string, number>;
}

export interface UserActivityReport {
  userId: string;
  userName: string;
  activitiesCreated: number;
  tasksCompleted: number;
  dealsClosed: number;
  totalRevenue: number;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: {
      field: string;
      message: string;
    }[];
  };
  timestamp: string;
  path: string;
  traceId?: string;
}
