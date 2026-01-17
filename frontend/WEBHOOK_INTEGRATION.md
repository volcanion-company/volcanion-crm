# 🔗 CRM SaaS Webhook Integration Guide

Complete guide for integrating webhooks with the CRM SaaS platform.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Webhook Events](#webhook-events)
- [Security & Verification](#security--verification)
- [Payload Structure](#payload-structure)
- [Retry Logic](#retry-logic)
- [Testing Webhooks](#testing-webhooks)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

Webhooks allow your application to receive real-time notifications when events occur in the CRM system. Instead of polling the API for changes, webhooks push data to your endpoint immediately.

### How It Works

```
CRM Event → Webhook Dispatcher → HMAC Signature → HTTP POST → Your Endpoint
                ↓
         Retry Logic (3 attempts)
                ↓
         Delivery History
```

### Benefits

- **Real-time**: Instant notifications
- **Efficient**: No polling required
- **Secure**: HMAC-SHA256 signature verification
- **Reliable**: Automatic retry with exponential backoff
- **Transparent**: Full delivery history and status tracking

---

## 🚀 Quick Start

### 1. Create Webhook Endpoint

Create an endpoint in your application to receive webhook events:

```javascript
// Express.js example
app.post('/webhooks/crm', express.json(), (req, res) => {
  const event = req.body;
  
  console.log(`Received ${event.eventType} event`);
  
  // Process event asynchronously
  processWebhookEvent(event);
  
  // Respond quickly (within 5 seconds)
  res.status(200).json({ received: true });
});
```

**Important**: Respond with 200 OK within 5 seconds to acknowledge receipt.

### 2. Register Webhook

**Endpoint**: `POST /api/webhooks`

```bash
curl -X POST https://api.yourdomain.com/api/webhooks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/crm",
    "events": ["lead.created", "deal.won", "ticket.closed"],
    "isActive": true,
    "secret": "your-webhook-secret-key-min-32-chars"
  }'
```

**Response**:
```json
{
  "id": "webhook_123",
  "url": "https://your-app.com/webhooks/crm",
  "events": ["lead.created", "deal.won", "ticket.closed"],
  "isActive": true,
  "secret": "your-webhook-secret-key-min-32-chars",
  "createdAt": "2026-01-17T10:30:00Z"
}
```

### 3. Verify Webhook Signature

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

app.post('/webhooks/crm', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = JSON.parse(req.body.toString());
  processWebhookEvent(event);
  
  res.status(200).json({ received: true });
});
```

---

## 📡 Webhook Events

### Available Events

#### Lead Events
- `lead.created` - New lead created
- `lead.updated` - Lead information updated
- `lead.deleted` - Lead deleted
- `lead.converted` - Lead converted to contact
- `lead.status_changed` - Lead status changed

#### Contact Events
- `contact.created` - New contact created
- `contact.updated` - Contact information updated
- `contact.deleted` - Contact deleted

#### Company Events
- `company.created` - New company created
- `company.updated` - Company information updated
- `company.deleted` - Company deleted

#### Deal Events
- `deal.created` - New deal created
- `deal.updated` - Deal information updated
- `deal.deleted` - Deal deleted
- `deal.won` - Deal marked as won
- `deal.lost` - Deal marked as lost
- `deal.stage_changed` - Deal moved to new stage

#### Ticket Events
- `ticket.created` - New ticket created
- `ticket.updated` - Ticket information updated
- `ticket.deleted` - Ticket deleted
- `ticket.closed` - Ticket closed
- `ticket.reopened` - Ticket reopened
- `ticket.escalated` - Ticket escalated
- `ticket.assigned` - Ticket assigned to user

#### Activity Events
- `activity.created` - New activity created
- `activity.updated` - Activity information updated
- `activity.deleted` - Activity deleted
- `activity.completed` - Activity marked as completed

#### Workflow Events
- `workflow.executed` - Workflow executed
- `workflow.action_completed` - Workflow action completed
- `workflow.action_failed` - Workflow action failed

### Event Filtering

Subscribe only to events you need:

```json
{
  "url": "https://your-app.com/webhooks/crm",
  "events": ["lead.created", "lead.converted", "deal.won"],
  "isActive": true
}
```

**Wildcard Subscriptions** (all events of a type):
```json
{
  "events": ["lead.*", "deal.*"]
}
```

---

## 🔒 Security & Verification

### HMAC-SHA256 Signature

Every webhook request includes a signature in the `X-Webhook-Signature` header:

```
X-Webhook-Signature: sha256=5f7d8e9a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c
```

### Signature Generation

```
signature = "sha256=" + HMAC_SHA256(payload, secret)
```

### Verification Examples

#### Node.js
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

#### Python
```python
import hmac
import hashlib

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    digest = 'sha256=' + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, digest)
```

#### C#
```csharp
using System.Security.Cryptography;
using System.Text;

public bool VerifySignature(string payload, string signature, string secret)
{
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
    var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
    var digest = "sha256=" + BitConverter.ToString(hash).Replace("-", "").ToLower();
    
    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(signature),
        Encoding.UTF8.GetBytes(digest)
    );
}
```

#### PHP
```php
function verifySignature($payload, $signature, $secret) {
    $digest = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    return hash_equals($signature, $digest);
}
```

### Additional Security

1. **Use HTTPS**: Always use HTTPS endpoints
2. **Validate Origin**: Check the `User-Agent` header
3. **IP Whitelist**: Whitelist webhook server IPs (optional)
4. **Secret Rotation**: Rotate webhook secrets periodically

---

## 📦 Payload Structure

### Standard Payload

```json
{
  "eventId": "evt_123456",
  "eventType": "lead.created",
  "timestamp": "2026-01-17T10:30:00Z",
  "tenantId": "tenant_789",
  "data": {
    "id": "lead_abc123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "company": "Example Corp",
    "source": "Website",
    "status": "New",
    "createdAt": "2026-01-17T10:30:00Z",
    "createdBy": "user_456"
  },
  "metadata": {
    "version": "1.0",
    "environment": "production"
  }
}
```

### Payload Fields

| Field | Type | Description |
|-------|------|-------------|
| `eventId` | string | Unique event identifier (for deduplication) |
| `eventType` | string | Event type (e.g., `lead.created`) |
| `timestamp` | ISO8601 | When the event occurred |
| `tenantId` | string | Tenant that triggered the event |
| `data` | object | Event-specific data (entity details) |
| `metadata` | object | Additional context |

### Event-Specific Examples

#### lead.created
```json
{
  "eventType": "lead.created",
  "data": {
    "id": "lead_123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "source": "Website",
    "status": "New"
  }
}
```

#### deal.won
```json
{
  "eventType": "deal.won",
  "data": {
    "id": "deal_456",
    "name": "Enterprise Plan - Acme Corp",
    "amount": 50000,
    "stage": "Closed Won",
    "wonDate": "2026-01-17T10:30:00Z",
    "contactId": "contact_789",
    "companyId": "company_012"
  }
}
```

#### ticket.closed
```json
{
  "eventType": "ticket.closed",
  "data": {
    "id": "ticket_789",
    "subject": "Login issue",
    "priority": "High",
    "status": "Closed",
    "resolution": "Password reset sent",
    "closedAt": "2026-01-17T10:30:00Z",
    "closedBy": "user_456",
    "resolutionTime": 3600
  }
}
```

---

## 🔄 Retry Logic

### Automatic Retries

If your endpoint fails to respond with 200 OK, the system automatically retries:

- **Attempt 1**: Immediate
- **Attempt 2**: After 1 minute
- **Attempt 3**: After 5 minutes

**Total attempts**: 3

### Failure Conditions

Webhooks are retried when:
- HTTP status ≥ 500 (server errors)
- HTTP status = 408, 429 (timeout, rate limit)
- Connection timeout (> 5 seconds)
- Network errors

Webhooks are **NOT** retried when:
- HTTP status 200-299 (success)
- HTTP status 400-499 except 408, 429 (client errors)

### Delivery Status

Check delivery history:

```bash
GET /api/webhooks/{webhookId}/deliveries
```

**Response**:
```json
{
  "items": [
    {
      "id": "delivery_123",
      "eventId": "evt_456",
      "eventType": "lead.created",
      "status": "success",
      "statusCode": 200,
      "attempts": 1,
      "lastAttemptAt": "2026-01-17T10:30:00Z",
      "nextRetryAt": null
    },
    {
      "id": "delivery_124",
      "eventId": "evt_457",
      "eventType": "deal.won",
      "status": "failed",
      "statusCode": 500,
      "attempts": 3,
      "lastAttemptAt": "2026-01-17T10:35:00Z",
      "nextRetryAt": null,
      "error": "Internal Server Error"
    }
  ]
}
```

---

## 🧪 Testing Webhooks

### 1. Local Testing with ngrok

Expose local server to internet:

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
node server.js  # Running on localhost:3000

# Expose to internet
ngrok http 3000
```

**ngrok output**:
```
Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

Use `https://abc123.ngrok.io/webhooks/crm` as your webhook URL.

### 2. Mock Webhook Server

```javascript
// test-webhook-server.js
const express = require('express');
const crypto = require('crypto');

const app = express();
const SECRET = 'your-webhook-secret';

app.post('/webhooks/crm', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body.toString();
  
  // Verify signature
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  if (signature !== digest) {
    console.error('❌ Invalid signature');
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  console.log('✅ Webhook received:');
  console.log(`  Event: ${event.eventType}`);
  console.log(`  ID: ${event.eventId}`);
  console.log(`  Data:`, JSON.stringify(event.data, null, 2));
  
  res.status(200).json({ received: true });
});

app.listen(3000, () => {
  console.log('Test webhook server running on http://localhost:3000');
});
```

### 3. Test Event Trigger

Trigger events manually to test webhooks:

```bash
# Create a lead (triggers lead.created)
curl -X POST https://api.yourdomain.com/api/leads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "source": "Website"
  }'
```

### 4. Webhook Testing Tools

**RequestBin**: https://requestbin.com
- Create temporary endpoint
- Inspect webhook payloads
- No code required

**Webhook.site**: https://webhook.site
- Instant webhook URL
- View requests in browser
- Test signature verification

---

## 💻 Implementation Examples

### Node.js / Express

```javascript
// Full webhook handler with signature verification and error handling
const express = require('express');
const crypto = require('crypto');

const app = express();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Middleware to verify webhook signature
function verifyWebhook(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }
  
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(req.body).digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}

// Webhook endpoint
app.post('/webhooks/crm',
  express.raw({ type: 'application/json' }),
  verifyWebhook,
  async (req, res) => {
    try {
      const event = JSON.parse(req.body.toString());
      
      // Process event asynchronously
      processEventAsync(event);
      
      // Respond quickly
      res.status(200).json({ received: true });
      
    } catch (err) {
      console.error('Webhook processing error:', err);
      res.status(500).json({ error: 'Processing failed' });
    }
  }
);

async function processEventAsync(event) {
  console.log(`Processing ${event.eventType}`);
  
  switch (event.eventType) {
    case 'lead.created':
      await handleLeadCreated(event.data);
      break;
    
    case 'deal.won':
      await handleDealWon(event.data);
      break;
    
    case 'ticket.closed':
      await handleTicketClosed(event.data);
      break;
    
    default:
      console.log(`Unhandled event: ${event.eventType}`);
  }
}

async function handleLeadCreated(lead) {
  // Send to your CRM/marketing automation
  console.log(`New lead: ${lead.firstName} ${lead.lastName}`);
  
  // Example: Add to email list
  await addToEmailList(lead.email, {
    firstName: lead.firstName,
    lastName: lead.lastName,
    source: lead.source
  });
}

async function handleDealWon(deal) {
  // Trigger fulfillment process
  console.log(`Deal won: ${deal.name} - $${deal.amount}`);
  
  // Example: Create invoice
  await createInvoice(deal);
}

async function handleTicketClosed(ticket) {
  // Send satisfaction survey
  console.log(`Ticket closed: ${ticket.subject}`);
  
  // Example: Send CSAT survey
  await sendSatisfactionSurvey(ticket.contactId, ticket.id);
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Python / Flask

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import os

app = Flask(__name__)
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET')

def verify_signature(payload: bytes, signature: str) -> bool:
    digest = 'sha256=' + hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, digest)

@app.route('/webhooks/crm', methods=['POST'])
def webhook_handler():
    signature = request.headers.get('X-Webhook-Signature')
    
    if not signature:
        return jsonify({'error': 'Missing signature'}), 401
    
    payload = request.get_data()
    
    if not verify_signature(payload, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    event = json.loads(payload)
    
    # Process event asynchronously (e.g., using Celery)
    process_event_async.delay(event)
    
    return jsonify({'received': True}), 200

def process_event(event):
    event_type = event['eventType']
    data = event['data']
    
    handlers = {
        'lead.created': handle_lead_created,
        'deal.won': handle_deal_won,
        'ticket.closed': handle_ticket_closed
    }
    
    handler = handlers.get(event_type)
    if handler:
        handler(data)
    else:
        print(f"Unhandled event: {event_type}")

def handle_lead_created(lead):
    print(f"New lead: {lead['firstName']} {lead['lastName']}")
    # Add to your CRM/email list

def handle_deal_won(deal):
    print(f"Deal won: {deal['name']} - ${deal['amount']}")
    # Trigger fulfillment

def handle_ticket_closed(ticket):
    print(f"Ticket closed: {ticket['subject']}")
    # Send survey

if __name__ == '__main__':
    app.run(port=3000)
```

### C# / ASP.NET Core

```csharp
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

[ApiController]
[Route("webhooks")]
public class WebhookController : ControllerBase
{
    private readonly string _webhookSecret;
    private readonly ILogger<WebhookController> _logger;

    public WebhookController(
        IConfiguration configuration,
        ILogger<WebhookController> logger)
    {
        _webhookSecret = configuration["WebhookSecret"];
        _logger = logger;
    }

    [HttpPost("crm")]
    public async Task<IActionResult> HandleWebhook()
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync();
        
        var signature = Request.Headers["X-Webhook-Signature"].FirstOrDefault();
        
        if (string.IsNullOrEmpty(signature))
        {
            return Unauthorized(new { error = "Missing signature" });
        }
        
        if (!VerifySignature(payload, signature))
        {
            return Unauthorized(new { error = "Invalid signature" });
        }
        
        var webhookEvent = JsonSerializer.Deserialize<WebhookEvent>(payload);
        
        // Process asynchronously
        _ = ProcessEventAsync(webhookEvent);
        
        return Ok(new { received = true });
    }

    private bool VerifySignature(string payload, string signature)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_webhookSecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var digest = "sha256=" + BitConverter.ToString(hash).Replace("-", "").ToLower();
        
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(signature),
            Encoding.UTF8.GetBytes(digest)
        );
    }

    private async Task ProcessEventAsync(WebhookEvent webhookEvent)
    {
        _logger.LogInformation($"Processing {webhookEvent.EventType}");
        
        switch (webhookEvent.EventType)
        {
            case "lead.created":
                await HandleLeadCreated(webhookEvent.Data);
                break;
            
            case "deal.won":
                await HandleDealWon(webhookEvent.Data);
                break;
            
            case "ticket.closed":
                await HandleTicketClosed(webhookEvent.Data);
                break;
            
            default:
                _logger.LogWarning($"Unhandled event: {webhookEvent.EventType}");
                break;
        }
    }

    private async Task HandleLeadCreated(JsonElement data)
    {
        var lead = JsonSerializer.Deserialize<Lead>(data.GetRawText());
        _logger.LogInformation($"New lead: {lead.FirstName} {lead.LastName}");
        // Add to CRM/email list
    }

    private async Task HandleDealWon(JsonElement data)
    {
        var deal = JsonSerializer.Deserialize<Deal>(data.GetRawText());
        _logger.LogInformation($"Deal won: {deal.Name} - ${deal.Amount}");
        // Trigger fulfillment
    }

    private async Task HandleTicketClosed(JsonElement data)
    {
        var ticket = JsonSerializer.Deserialize<Ticket>(data.GetRawText());
        _logger.LogInformation($"Ticket closed: {ticket.Subject}");
        // Send survey
    }
}

public class WebhookEvent
{
    public string EventId { get; set; }
    public string EventType { get; set; }
    public DateTime Timestamp { get; set; }
    public string TenantId { get; set; }
    public JsonElement Data { get; set; }
}
```

### PHP / Laravel

```php
<?php
// routes/api.php
Route::post('/webhooks/crm', [WebhookController::class, 'handle']);

// app/Http/Controllers/WebhookController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handle(Request $request)
    {
        $signature = $request->header('X-Webhook-Signature');
        
        if (empty($signature)) {
            return response()->json(['error' => 'Missing signature'], 401);
        }
        
        $payload = $request->getContent();
        
        if (!$this->verifySignature($payload, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }
        
        $event = json_decode($payload, true);
        
        // Process asynchronously using queue
        dispatch(new ProcessWebhookEvent($event));
        
        return response()->json(['received' => true]);
    }
    
    private function verifySignature($payload, $signature)
    {
        $secret = config('services.webhook.secret');
        $digest = 'sha256=' . hash_hmac('sha256', $payload, $secret);
        
        return hash_equals($signature, $digest);
    }
}

// app/Jobs/ProcessWebhookEvent.php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessWebhookEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    protected $event;
    
    public function __construct($event)
    {
        $this->event = $event;
    }
    
    public function handle()
    {
        Log::info("Processing {$this->event['eventType']}");
        
        switch ($this->event['eventType']) {
            case 'lead.created':
                $this->handleLeadCreated($this->event['data']);
                break;
            
            case 'deal.won':
                $this->handleDealWon($this->event['data']);
                break;
            
            case 'ticket.closed':
                $this->handleTicketClosed($this->event['data']);
                break;
            
            default:
                Log::warning("Unhandled event: {$this->event['eventType']}");
        }
    }
    
    private function handleLeadCreated($lead)
    {
        Log::info("New lead: {$lead['firstName']} {$lead['lastName']}");
        // Add to CRM/email list
    }
    
    private function handleDealWon($deal)
    {
        Log::info("Deal won: {$deal['name']} - \${$deal['amount']}");
        // Trigger fulfillment
    }
    
    private function handleTicketClosed($ticket)
    {
        Log::info("Ticket closed: {$ticket['subject']}");
        // Send survey
    }
}
```

---

## ✅ Best Practices

### 1. Respond Quickly

```javascript
// ✅ Good: Respond immediately, process asynchronously
app.post('/webhooks/crm', async (req, res) => {
  const event = req.body;
  
  // Acknowledge receipt immediately
  res.status(200).json({ received: true });
  
  // Process asynchronously
  processEventAsync(event).catch(err => {
    console.error('Event processing failed:', err);
  });
});

// ❌ Bad: Long processing blocks response
app.post('/webhooks/crm', async (req, res) => {
  const event = req.body;
  
  // Takes 10 seconds - webhook will timeout and retry
  await longProcessingTask(event);
  
  res.status(200).json({ received: true });
});
```

### 2. Idempotency

```javascript
// ✅ Good: Track processed events to prevent duplicates
const processedEvents = new Set();

async function processEvent(event) {
  if (processedEvents.has(event.eventId)) {
    console.log(`Event ${event.eventId} already processed`);
    return;
  }
  
  // Process event
  await handleEvent(event);
  
  // Mark as processed
  processedEvents.add(event.eventId);
  
  // Clean up old events (keep last 10000)
  if (processedEvents.size > 10000) {
    const oldestEvent = processedEvents.values().next().value;
    processedEvents.delete(oldestEvent);
  }
}
```

### 3. Error Handling

```javascript
// ✅ Good: Catch and log errors, don't crash server
app.post('/webhooks/crm', async (req, res) => {
  try {
    const event = req.body;
    
    // Validate event structure
    if (!event.eventType || !event.data) {
      return res.status(400).json({ error: 'Invalid event structure' });
    }
    
    processEventAsync(event);
    res.status(200).json({ received: true });
    
  } catch (err) {
    console.error('Webhook handler error:', err);
    // Still return 200 to prevent retries
    res.status(200).json({ received: true, error: err.message });
  }
});
```

### 4. Logging

```javascript
// ✅ Good: Log all webhook activity
async function processEvent(event) {
  console.log({
    message: 'Webhook received',
    eventId: event.eventId,
    eventType: event.eventType,
    tenantId: event.tenantId,
    timestamp: event.timestamp
  });
  
  try {
    await handleEvent(event);
    
    console.log({
      message: 'Webhook processed successfully',
      eventId: event.eventId
    });
    
  } catch (err) {
    console.error({
      message: 'Webhook processing failed',
      eventId: event.eventId,
      error: err.message,
      stack: err.stack
    });
  }
}
```

### 5. Testing in Production

```javascript
// ✅ Good: Gracefully handle test events
async function processEvent(event) {
  // Skip test events in production
  if (event.metadata?.environment === 'test') {
    console.log('Skipping test event');
    return;
  }
  
  await handleEvent(event);
}
```

---

## 🔧 Troubleshooting

### Webhook Not Received

**1. Check webhook is active**:
```bash
GET /api/webhooks/{id}
```

Ensure `isActive: true`

**2. Check delivery history**:
```bash
GET /api/webhooks/{id}/deliveries
```

Look for failed deliveries and error messages.

**3. Verify endpoint is accessible**:
```bash
curl -X POST https://your-app.com/webhooks/crm \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**4. Check firewall/security**:
- Ensure port 443 (HTTPS) is open
- No IP whitelist blocking CRM servers
- SSL certificate is valid

### Invalid Signature Errors

**1. Use raw body** (not parsed JSON):
```javascript
// ✅ Correct
app.post('/webhooks/crm', express.raw({ type: 'application/json' }), ...)

// ❌ Wrong
app.post('/webhooks/crm', express.json(), ...)
```

**2. Check secret matches**:
```javascript
const SECRET_IN_DB = 'secret_from_webhook_creation';
const SECRET_IN_CODE = process.env.WEBHOOK_SECRET;

console.log('Secrets match:', SECRET_IN_DB === SECRET_IN_CODE);
```

**3. Debug signature generation**:
```javascript
const payload = req.body.toString(); // Raw body
const secret = process.env.WEBHOOK_SECRET;

const hmac = crypto.createHmac('sha256', secret);
const digest = 'sha256=' + hmac.update(payload).digest('hex');

console.log('Received signature:', req.headers['x-webhook-signature']);
console.log('Computed signature:', digest);
```

### High Failure Rate

**1. Optimize response time**:
```javascript
// Process asynchronously
app.post('/webhooks/crm', (req, res) => {
  res.status(200).json({ received: true }); // Respond first
  processEventAsync(req.body); // Then process
});
```

**2. Handle timeouts**:
```javascript
// Set appropriate timeout
app.post('/webhooks/crm', (req, res) => {
  req.setTimeout(5000); // 5 seconds max
  
  res.status(200).json({ received: true });
  processEventAsync(req.body);
});
```

**3. Check server load**:
- Monitor CPU/memory usage
- Scale horizontally if needed
- Use queue for event processing

---

## 📞 Support

- **API Guide**: [API_INTEGRATION.md](API_INTEGRATION.md)
- **Postman Collection**: [CRM_SaaS_API.postman_collection.json](CRM_SaaS_API.postman_collection.json)
- **Support Email**: support@yourdomain.com
- **Status Page**: https://status.yourdomain.com

---

**Happy Webhook Integration! 🚀**
