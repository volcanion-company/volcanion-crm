export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  TOKEN_REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

export const AUTH_CONFIG = {
  TOKEN_KEY: 'crm_access_token',
  REFRESH_TOKEN_KEY: 'crm_refresh_token',
  USER_KEY: 'crm_user',
  TENANT_KEY: 'crm_tenant',
  EXPIRES_AT_KEY: 'crm_token_expires_at',
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  DASHBOARD: '/dashboard',
  LEADS: '/leads',
  CONTACTS: '/contacts',
  COMPANIES: '/companies',
  DEALS: '/deals',
  TICKETS: '/tickets',
  ACTIVITIES: '/activities',
  WORKFLOWS: '/workflows',
  CAMPAIGNS: '/campaigns',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const;

export const PERMISSIONS = {
  LEAD: {
    VIEW: 'lead:view',
    CREATE: 'lead:create',
    UPDATE: 'lead:update',
    DELETE: 'lead:delete',
    CONVERT: 'lead:convert',
  },
  CONTACT: {
    VIEW: 'contact:view',
    CREATE: 'contact:create',
    UPDATE: 'contact:update',
    DELETE: 'contact:delete',
  },
  COMPANY: {
    VIEW: 'company:view',
    CREATE: 'company:create',
    UPDATE: 'company:update',
    DELETE: 'company:delete',
  },
  DEAL: {
    VIEW: 'deal:view',
    CREATE: 'deal:create',
    UPDATE: 'deal:update',
    DELETE: 'deal:delete',
    WIN: 'deal:win',
    LOSE: 'deal:lose',
  },
  TICKET: {
    VIEW: 'ticket:view',
    CREATE: 'ticket:create',
    UPDATE: 'ticket:update',
    DELETE: 'ticket:delete',
    CLOSE: 'ticket:close',
    ESCALATE: 'ticket:escalate',
  },
  ACTIVITY: {
    VIEW: 'activity:view',
    CREATE: 'activity:create',
    UPDATE: 'activity:update',
    DELETE: 'activity:delete',
  },
  WORKFLOW: {
    VIEW: 'workflow:view',
    CREATE: 'workflow:create',
    UPDATE: 'workflow:update',
    DELETE: 'workflow:delete',
    ACTIVATE: 'workflow:activate',
  },
  CAMPAIGN: {
    VIEW: 'campaign:view',
    CREATE: 'campaign:create',
    SEND: 'campaign:send',
  },
  REPORT: {
    VIEW: 'report:view',
  },
  ADMIN: {
    MANAGE_USERS: 'admin:manage_users',
    MANAGE_SETTINGS: 'admin:manage_settings',
  },
} as const;
