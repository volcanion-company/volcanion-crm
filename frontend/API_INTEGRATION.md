# 🔌 CRM SaaS API Integration Guide

Complete guide for integrating with the CRM SaaS API.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Request/Response Format](#requestresponse-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Multi-Tenancy](#multi-tenancy)
- [SDK Examples](#sdk-examples)
- [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Base URLs

- **Development**: `http://localhost:5000`
- **Production**: `https://api.yourdomain.com`

### Prerequisites

1. Register a tenant account
2. Obtain API credentials (JWT token)
3. Configure your HTTP client with authentication

### Quick Start Example

```bash
# 1. Register tenant
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin@123",
    "tenantName": "My Company",
    "companyName": "Acme Corp"
  }'

# 2. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin@123"
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 3600,
  "tenantId": "abc123",
  "userId": "user456"
}

# 3. Use token for API calls
curl -X GET http://localhost:5000/api/leads \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔐 Authentication

### JWT Bearer Token Authentication

All API endpoints (except authentication endpoints) require a JWT Bearer token in the `Authorization` header.

#### Request Format

```
GET /api/leads HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Obtaining Access Token

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "admin@company.com",
  "password": "Admin@123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJ1c2VyNDU2IiwidGVuYW50aWQiOiJhYmMxMjMiLCJyb2xlIjoiQWRtaW4iLCJuYmYiOjE3MDYzNTIwMDAsImV4cCI6MTcwNjM1NTYwMCwiaWF0IjoxNzA2MzUyMDAwfQ.signature",
  "refreshToken": "refresh_token_value",
  "expiresIn": 3600,
  "tenantId": "abc123",
  "userId": "user456"
}
```

**Token Claims**:
- `nameid`: User ID
- `tenantid`: Tenant ID
- `role`: User role (Admin, Manager, User)
- `exp`: Expiration timestamp (default: 60 minutes)

### Refreshing Access Token

**Endpoint**: `POST /api/auth/refresh`

**Request**:
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response**:
```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 3600
}
```

**Notes**:
- Access tokens expire in 60 minutes (configurable)
- Refresh tokens expire in 7 days (configurable)
- Store tokens securely (never in local storage for web apps)

---

## 📡 API Endpoints

### Core Resources

| Resource | Endpoint | Methods |
|----------|----------|---------|
| **Leads** | `/api/leads` | GET, POST, PUT, DELETE |
| **Contacts** | `/api/contacts` | GET, POST, PUT, DELETE |
| **Companies** | `/api/companies` | GET, POST, PUT, DELETE |
| **Deals** | `/api/deals` | GET, POST, PUT, DELETE |
| **Tickets** | `/api/tickets` | GET, POST, PUT, DELETE |
| **Activities** | `/api/activities` | GET, POST, PUT, DELETE |
| **Workflows** | `/api/workflows` | GET, POST, PUT, DELETE |
| **Campaigns** | `/api/campaigns` | GET, POST |
| **Webhooks** | `/api/webhooks` | GET, POST, PUT, DELETE |
| **Reports** | `/api/reports/*` | GET |

### Complete Endpoint Reference

See [Postman Collection](CRM_SaaS_API.postman_collection.json) for all 100+ endpoints.

---

## 📦 Request/Response Format

### Standard Request

```http
POST /api/leads HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "company": "Example Corp",
  "source": "Website",
  "status": "New"
}
```

### Standard Success Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "lead_123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "company": "Example Corp",
  "source": "Website",
  "status": "New",
  "createdAt": "2026-01-17T10:30:00Z",
  "createdBy": "user_456",
  "tenantId": "tenant_789"
}
```

### List Response (Paginated)

```json
{
  "items": [
    {
      "id": "lead_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "status": "New"
    },
    {
      "id": "lead_124",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "status": "Qualified"
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address"
      }
    ]
  },
  "timestamp": "2026-01-17T10:30:00Z",
  "path": "/api/leads",
  "traceId": "trace_abc123"
}
```

### HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| **200** | OK | Successful request |
| **201** | Created | Resource successfully created |
| **204** | No Content | Successful delete operation |
| **400** | Bad Request | Invalid request body/parameters |
| **401** | Unauthorized | Missing or invalid token |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Duplicate resource |
| **422** | Unprocessable Entity | Validation error |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error |

### Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `AUTH_FAILED` | Authentication failed | Check credentials |
| `INVALID_TOKEN` | JWT token invalid/expired | Refresh token |
| `VALIDATION_ERROR` | Request validation failed | Check request body |
| `NOT_FOUND` | Resource not found | Check resource ID |
| `DUPLICATE` | Duplicate resource | Use different identifier |
| `PERMISSION_DENIED` | Insufficient permissions | Check user role |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |

### Example Error Handling (JavaScript)

```javascript
async function createLead(leadData) {
  try {
    const response = await fetch('https://api.yourdomain.com/api/leads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadData)
    });

    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 401:
          // Token expired - refresh and retry
          await refreshToken();
          return createLead(leadData);
        
        case 400:
        case 422:
          // Validation error - show to user
          console.error('Validation errors:', error.error.details);
          throw new Error(error.error.message);
        
        case 429:
          // Rate limit - wait and retry
          await sleep(5000);
          return createLead(leadData);
        
        default:
          throw new Error(`API error: ${error.error.message}`);
      }
    }

    return await response.json();
  } catch (err) {
    console.error('Failed to create lead:', err);
    throw err;
  }
}
```

---

## 🚦 Rate Limiting

### Limits

- **Default**: 100 requests per minute per tenant
- **Authenticated**: Higher limits based on subscription tier
- **Burst**: Queue up to 10 requests when limit reached

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706352660
```

### Handling Rate Limits

```javascript
async function apiCall(endpoint, options) {
  const response = await fetch(endpoint, options);
  
  if (response.status === 429) {
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'));
    const waitTime = (resetTime * 1000) - Date.now();
    
    console.log(`Rate limited. Waiting ${waitTime}ms`);
    await sleep(waitTime);
    
    return apiCall(endpoint, options); // Retry
  }
  
  return response;
}
```

---

## 📄 Pagination

### Query Parameters

- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)
- `sortBy`: Field to sort by (default: varies by endpoint)
- `sortOrder`: `asc` or `desc` (default: `asc`)

### Example Request

```bash
GET /api/leads?page=2&pageSize=50&sortBy=createdAt&sortOrder=desc
```

### Response

```json
{
  "items": [...],
  "page": 2,
  "pageSize": 50,
  "totalCount": 245,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": true
}
```

### Pagination Helper (JavaScript)

```javascript
async function getAllLeads() {
  let allLeads = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetch(
      `https://api.yourdomain.com/api/leads?page=${page}&pageSize=100`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const data = await response.json();
    allLeads = allLeads.concat(data.items);
    hasNextPage = data.hasNextPage;
    page++;
  }

  return allLeads;
}
```

---

## 🏢 Multi-Tenancy

### How It Works

- Each tenant has isolated data in separate database
- Tenant ID is extracted from JWT token
- All API requests automatically filtered by tenant
- No cross-tenant data access possible

### Tenant Identification

```
JWT Token → Middleware → Extract TenantId → Set DbContext Connection → Query Tenant DB
```

**JWT Claims**:
```json
{
  "nameid": "user_456",
  "tenantid": "tenant_789",  // ← Used for tenant isolation
  "role": "Admin"
}
```

**No Action Required**: Tenant filtering is automatic - you don't need to include tenant ID in requests.

---

## 💻 SDK Examples

### JavaScript / TypeScript

```typescript
// api-client.ts
class CrmApiClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    this.accessToken = data.token;
    return data;
  }

  async createLead(lead: CreateLeadRequest) {
    const response = await fetch(`${this.baseUrl}/api/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lead)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return await response.json();
  }

  async getLeads(page = 1, pageSize = 20) {
    const response = await fetch(
      `${this.baseUrl}/api/leads?page=${page}&pageSize=${pageSize}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Failed to fetch leads');
    return await response.json();
  }
}

// Usage
const client = new CrmApiClient('https://api.yourdomain.com');
await client.login('admin@company.com', 'Admin@123');

const lead = await client.createLead({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  source: 'Website'
});

console.log('Lead created:', lead.id);
```

### Python

```python
# crm_api_client.py
import requests
from typing import Optional, Dict, List

class CrmApiClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.access_token: Optional[str] = None
    
    def login(self, email: str, password: str) -> Dict:
        response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        
        data = response.json()
        self.access_token = data['token']
        return data
    
    def _headers(self) -> Dict[str, str]:
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
    
    def create_lead(self, lead_data: Dict) -> Dict:
        response = requests.post(
            f"{self.base_url}/api/leads",
            json=lead_data,
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()
    
    def get_leads(self, page: int = 1, page_size: int = 20) -> Dict:
        response = requests.get(
            f"{self.base_url}/api/leads",
            params={'page': page, 'pageSize': page_size},
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()

# Usage
client = CrmApiClient('https://api.yourdomain.com')
client.login('admin@company.com', 'Admin@123')

lead = client.create_lead({
    'firstName': 'John',
    'lastName': 'Doe',
    'email': 'john@example.com',
    'source': 'Website'
})

print(f"Lead created: {lead['id']}")
```

### C# / .NET

```csharp
// CrmApiClient.cs
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public class CrmApiClient
{
    private readonly HttpClient _httpClient;
    private string? _accessToken;

    public CrmApiClient(string baseUrl)
    {
        _httpClient = new HttpClient { BaseAddress = new Uri(baseUrl) };
    }

    public async Task<LoginResponse> LoginAsync(string email, string password)
    {
        var request = new { email, password };
        var content = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _httpClient.PostAsync("/api/auth/login", content);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        _accessToken = result.Token;
        
        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", _accessToken);

        return result;
    }

    public async Task<Lead> CreateLeadAsync(CreateLeadRequest request)
    {
        var content = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _httpClient.PostAsync("/api/leads", content);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<Lead>();
    }

    public async Task<PagedResponse<Lead>> GetLeadsAsync(int page = 1, int pageSize = 20)
    {
        var response = await _httpClient.GetAsync($"/api/leads?page={page}&pageSize={pageSize}");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<PagedResponse<Lead>>();
    }
}

// Usage
var client = new CrmApiClient("https://api.yourdomain.com");
await client.LoginAsync("admin@company.com", "Admin@123");

var lead = await client.CreateLeadAsync(new CreateLeadRequest
{
    FirstName = "John",
    LastName = "Doe",
    Email = "john@example.com",
    Source = "Website"
});

Console.WriteLine($"Lead created: {lead.Id}");
```

### PHP

```php
<?php
// CrmApiClient.php
class CrmApiClient {
    private $baseUrl;
    private $accessToken;

    public function __construct($baseUrl) {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    public function login($email, $password) {
        $response = $this->request('POST', '/api/auth/login', [
            'email' => $email,
            'password' => $password
        ]);

        $this->accessToken = $response['token'];
        return $response;
    }

    public function createLead($leadData) {
        return $this->request('POST', '/api/leads', $leadData);
    }

    public function getLeads($page = 1, $pageSize = 20) {
        return $this->request('GET', "/api/leads?page=$page&pageSize=$pageSize");
    }

    private function request($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        $headers = ['Content-Type: application/json'];

        if ($this->accessToken) {
            $headers[] = 'Authorization: Bearer ' . $this->accessToken;
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($data && in_array($method, ['POST', 'PUT'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            throw new Exception("API error: HTTP $httpCode - $response");
        }

        return json_decode($response, true);
    }
}

// Usage
$client = new CrmApiClient('https://api.yourdomain.com');
$client->login('admin@company.com', 'Admin@123');

$lead = $client->createLead([
    'firstName' => 'John',
    'lastName' => 'Doe',
    'email' => 'john@example.com',
    'source' => 'Website'
]);

echo "Lead created: {$lead['id']}\n";
```

---

## ✅ Best Practices

### 1. Token Management

```javascript
// ✅ Good: Refresh token before expiry
class TokenManager {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }

  async getValidToken() {
    // Refresh 5 minutes before expiry
    const bufferTime = 5 * 60 * 1000;
    
    if (!this.token || Date.now() > (this.expiresAt - bufferTime)) {
      await this.refresh();
    }
    
    return this.token;
  }

  async refresh() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });
    
    const data = await response.json();
    this.token = data.token;
    this.refreshToken = data.refreshToken;
    this.expiresAt = Date.now() + (data.expiresIn * 1000);
  }
}
```

### 2. Error Retry Logic

```javascript
// ✅ Good: Exponential backoff
async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) return await response.json();
      
      if (response.status === 429 || response.status >= 500) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, i) * 1000;
        await sleep(delay);
        continue;
      }
      
      // Don't retry client errors (4xx except 429)
      throw new Error(`API error: ${response.status}`);
      
    } catch (err) {
      if (i === maxRetries - 1) throw err;
    }
  }
}
```

### 3. Batch Operations

```javascript
// ✅ Good: Batch create instead of individual calls
async function createMultipleLeads(leads) {
  // If API supports bulk create
  return await fetch('/api/leads/bulk', {
    method: 'POST',
    body: JSON.stringify({ leads }),
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

// If not, use Promise.all with concurrency limit
async function createLeadsConcurrently(leads, concurrency = 5) {
  const results = [];
  
  for (let i = 0; i < leads.length; i += concurrency) {
    const batch = leads.slice(i, i + concurrency);
    const promises = batch.map(lead => createLead(lead));
    results.push(...await Promise.all(promises));
  }
  
  return results;
}
```

### 4. Caching

```javascript
// ✅ Good: Cache static/rarely-changing data
class CachedApiClient {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  async getUsers() {
    const cacheKey = 'users';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    
    const data = await fetch('/api/users').then(r => r.json());
    
    this.cache.set(cacheKey, {
      data,
      expiresAt: Date.now() + this.cacheDuration
    });
    
    return data;
  }
}
```

### 5. Webhook Security (Receiving Webhooks)

```javascript
// ✅ Good: Verify HMAC signature
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Express.js middleware
app.post('/webhooks/crm', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = JSON.parse(req.body.toString());
  handleWebhookEvent(event);
  
  res.status(200).json({ received: true });
});
```

### 6. Logging

```javascript
// ✅ Good: Log requests for debugging
async function apiCall(url, options) {
  const requestId = generateRequestId();
  
  console.log(`[${requestId}] Request: ${options.method} ${url}`);
  
  try {
    const response = await fetch(url, options);
    
    console.log(`[${requestId}] Response: ${response.status}`);
    
    return await response.json();
  } catch (err) {
    console.error(`[${requestId}] Error:`, err);
    throw err;
  }
}
```

### 7. Idempotency

```javascript
// ✅ Good: Use idempotency keys for create operations
async function createLead(leadData) {
  const idempotencyKey = generateIdempotencyKey(leadData);
  
  return await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey // Prevents duplicate creates
    },
    body: JSON.stringify(leadData)
  });
}

function generateIdempotencyKey(data) {
  // Hash of request data
  return crypto.createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');
}
```

---

## 📞 Support

- **Documentation**: [README.md](README.md)
- **Webhook Guide**: [WEBHOOK_INTEGRATION.md](WEBHOOK_INTEGRATION.md)
- **Postman Collection**: [CRM_SaaS_API.postman_collection.json](CRM_SaaS_API.postman_collection.json)
- **API Status**: https://status.yourdomain.com
- **Support Email**: support@yourdomain.com

---

**Happy Integrating! 🚀**
