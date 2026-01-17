// ============================================
// Core Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
  User = 'User',
}

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
  token: string;
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
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Lost = 'Lost',
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source?: string;
  status: LeadStatus;
  description?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source?: string;
  status?: LeadStatus;
  description?: string;
}

export interface UpdateLeadRequest extends CreateLeadRequest {}

export interface ConvertLeadRequest {
  createDeal?: boolean;
  dealAmount?: number;
  dealName?: string;
}

export interface ConvertLeadResponse {
  contactId: string;
  dealId?: string;
  message: string;
}

// ============================================
// Contact Types
// ============================================

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId?: string;
  company?: Company;
  jobTitle?: string;
  department?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId?: string;
  jobTitle?: string;
  department?: string;
}

export interface UpdateContactRequest extends CreateContactRequest {}

export interface ContactTimeline {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ContactHealthScore {
  contactId: string;
  score: number;
  factors: {
    engagement: number;
    dealValue: number;
    activity: number;
  };
  trend: 'up' | 'down' | 'stable';
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
  Open = 'Open',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export enum TicketPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  contactId?: string;
  contact?: Contact;
  category?: string;
  resolution?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  assignedTo?: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  contactId?: string;
  category?: string;
}

export interface UpdateTicketRequest extends CreateTicketRequest {}

export interface CloseTicketRequest {
  resolution: string;
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
}

export interface Activity {
  id: string;
  type: ActivityType;
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
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  subject?: string;
  content: string;
  segmentId?: string;
  scheduledDate?: string;
  sentDate?: string;
  status: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  type: CampaignType;
  subject?: string;
  content: string;
  segmentId?: string;
  scheduledDate?: string;
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
