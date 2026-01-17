# 📚 CRM SaaS API Code Examples

Practical code examples for common integration scenarios.

---

## 📋 Table of Contents

- [Complete Integration Examples](#complete-integration-examples)
- [CRUD Operations](#crud-operations)
- [Workflow Automation](#workflow-automation)
- [Reporting & Analytics](#reporting--analytics)
- [Marketing Automation](#marketing-automation)
- [Real-time Integrations](#real-time-integrations)
- [Advanced Scenarios](#advanced-scenarios)

---

## 🚀 Complete Integration Examples

### Full CRM Integration (Node.js)

```javascript
// crm-integration.js
const axios = require('axios');

class CrmIntegration {
  constructor(baseUrl, email, password) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.password = password;
    this.token = null;
  }

  // Initialize and authenticate
  async init() {
    const response = await axios.post(`${this.baseUrl}/api/auth/login`, {
      email: this.email,
      password: this.password
    });

    this.token = response.data.token;
    this.tenantId = response.data.tenantId;
    
    console.log(`✅ Authenticated as ${this.email}`);
    return this;
  }

  // Helper for authenticated requests
  async request(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;

    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired - re-authenticate
        await this.init();
        return this.request(method, endpoint, data);
      }
      throw error;
    }
  }

  // Lead management
  async createLead(leadData) {
    return this.request('POST', '/api/leads', leadData);
  }

  async getLead(id) {
    return this.request('GET', `/api/leads/${id}`);
  }

  async updateLead(id, leadData) {
    return this.request('PUT', `/api/leads/${id}`, leadData);
  }

  async convertLead(id, createDeal = true) {
    return this.request('POST', `/api/leads/${id}/convert`, {
      createDeal,
      dealAmount: 0
    });
  }

  // Deal management
  async createDeal(dealData) {
    return this.request('POST', '/api/deals', dealData);
  }

  async moveDealToNextStage(id) {
    return this.request('PUT', `/api/deals/${id}/stage`);
  }

  async winDeal(id) {
    return this.request('POST', `/api/deals/${id}/win`);
  }

  // Contact management
  async createContact(contactData) {
    return this.request('POST', '/api/contacts', contactData);
  }

  async getContactTimeline(id) {
    return this.request('GET', `/api/contacts/${id}/timeline`);
  }

  async getContactHealthScore(id) {
    return this.request('GET', `/api/contacts/${id}/health-score`);
  }

  // Ticket management
  async createTicket(ticketData) {
    return this.request('POST', '/api/tickets', ticketData);
  }

  async closeTicket(id, resolution) {
    return this.request('POST', `/api/tickets/${id}/close`, { resolution });
  }

  // Workflows
  async createWorkflow(workflowData) {
    return this.request('POST', '/api/workflows', workflowData);
  }

  async activateWorkflow(id) {
    return this.request('POST', `/api/workflows/${id}/activate`);
  }

  // Reports
  async getSalesPipeline(startDate, endDate) {
    return this.request('GET', 
      `/api/reports/sales-pipeline?startDate=${startDate}&endDate=${endDate}`
    );
  }

  async getLeadConversion(startDate, endDate) {
    return this.request('GET', 
      `/api/reports/lead-conversion?startDate=${startDate}&endDate=${endDate}`
    );
  }
}

// Usage Example
async function main() {
  const crm = new CrmIntegration(
    'https://api.yourdomain.com',
    'admin@company.com',
    'Admin@123'
  );

  await crm.init();

  // Create a lead
  const lead = await crm.createLead({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Example Corp',
    source: 'Website',
    status: 'New'
  });
  console.log('✅ Lead created:', lead.id);

  // Convert to contact
  const conversion = await crm.convertLead(lead.id, true);
  console.log('✅ Lead converted to contact:', conversion.contactId);
  console.log('✅ Deal created:', conversion.dealId);

  // Move deal through pipeline
  await crm.moveDealToNextStage(conversion.dealId);
  console.log('✅ Deal moved to next stage');

  // Win deal
  await crm.winDeal(conversion.dealId);
  console.log('✅ Deal marked as won');

  // Get sales report
  const report = await crm.getSalesPipeline('2026-01-01', '2026-12-31');
  console.log('📊 Pipeline value:', report.totalValue);
  console.log('📊 Win rate:', report.winRate + '%');
}

main().catch(console.error);
```

### Full CRM Integration (Python)

```python
# crm_integration.py
import requests
from typing import Dict, Optional, List
from datetime import datetime, timedelta

class CrmIntegration:
    def __init__(self, base_url: str, email: str, password: str):
        self.base_url = base_url.rstrip('/')
        self.email = email
        self.password = password
        self.token: Optional[str] = None
        self.tenant_id: Optional[str] = None
    
    def init(self):
        """Initialize and authenticate"""
        response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={"email": self.email, "password": self.password}
        )
        response.raise_for_status()
        
        data = response.json()
        self.token = data['token']
        self.tenant_id = data['tenantId']
        
        print(f"✅ Authenticated as {self.email}")
        return self
    
    def _headers(self) -> Dict[str, str]:
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
    
    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = requests.request(
                method,
                url,
                json=data,
                headers=self._headers()
            )
            response.raise_for_status()
            return response.json()
            
        except requests.HTTPError as e:
            if e.response.status_code == 401:
                # Token expired - re-authenticate
                self.init()
                return self._request(method, endpoint, data)
            raise
    
    # Lead operations
    def create_lead(self, lead_data: Dict) -> Dict:
        return self._request('POST', '/api/leads', lead_data)
    
    def get_lead(self, lead_id: str) -> Dict:
        return self._request('GET', f'/api/leads/{lead_id}')
    
    def update_lead(self, lead_id: str, lead_data: Dict) -> Dict:
        return self._request('PUT', f'/api/leads/{lead_id}', lead_data)
    
    def convert_lead(self, lead_id: str, create_deal: bool = True) -> Dict:
        return self._request('POST', f'/api/leads/{lead_id}/convert', {
            'createDeal': create_deal,
            'dealAmount': 0
        })
    
    # Deal operations
    def create_deal(self, deal_data: Dict) -> Dict:
        return self._request('POST', '/api/deals', deal_data)
    
    def move_deal_to_next_stage(self, deal_id: str) -> Dict:
        return self._request('PUT', f'/api/deals/{deal_id}/stage')
    
    def win_deal(self, deal_id: str) -> Dict:
        return self._request('POST', f'/api/deals/{deal_id}/win')
    
    def lose_deal(self, deal_id: str, reason: str) -> Dict:
        return self._request('POST', f'/api/deals/{deal_id}/lose', {
            'lostReason': reason
        })
    
    # Contact operations
    def create_contact(self, contact_data: Dict) -> Dict:
        return self._request('POST', '/api/contacts', contact_data)
    
    def get_contact_timeline(self, contact_id: str) -> List[Dict]:
        return self._request('GET', f'/api/contacts/{contact_id}/timeline')
    
    def get_contact_health_score(self, contact_id: str) -> Dict:
        return self._request('GET', f'/api/contacts/{contact_id}/health-score')
    
    # Ticket operations
    def create_ticket(self, ticket_data: Dict) -> Dict:
        return self._request('POST', '/api/tickets', ticket_data)
    
    def close_ticket(self, ticket_id: str, resolution: str) -> Dict:
        return self._request('POST', f'/api/tickets/{ticket_id}/close', {
            'resolution': resolution
        })
    
    # Workflow operations
    def create_workflow(self, workflow_data: Dict) -> Dict:
        return self._request('POST', '/api/workflows', workflow_data)
    
    def activate_workflow(self, workflow_id: str) -> Dict:
        return self._request('POST', f'/api/workflows/{workflow_id}/activate')
    
    # Reports
    def get_sales_pipeline(self, start_date: str, end_date: str) -> Dict:
        return self._request('GET', 
            f'/api/reports/sales-pipeline?startDate={start_date}&endDate={end_date}'
        )
    
    def get_lead_conversion(self, start_date: str, end_date: str) -> Dict:
        return self._request('GET', 
            f'/api/reports/lead-conversion?startDate={start_date}&endDate={end_date}'
        )

# Usage Example
def main():
    crm = CrmIntegration(
        'https://api.yourdomain.com',
        'admin@company.com',
        'Admin@123'
    )
    
    crm.init()
    
    # Create lead
    lead = crm.create_lead({
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john.doe@example.com',
        'phone': '+1234567890',
        'company': 'Example Corp',
        'source': 'Website',
        'status': 'New'
    })
    print(f"✅ Lead created: {lead['id']}")
    
    # Convert to contact
    conversion = crm.convert_lead(lead['id'], True)
    print(f"✅ Lead converted to contact: {conversion['contactId']}")
    print(f"✅ Deal created: {conversion['dealId']}")
    
    # Move deal through pipeline
    crm.move_deal_to_next_stage(conversion['dealId'])
    print("✅ Deal moved to next stage")
    
    # Win deal
    crm.win_deal(conversion['dealId'])
    print("✅ Deal marked as won")
    
    # Get sales report
    today = datetime.now()
    start_date = (today - timedelta(days=365)).strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    
    report = crm.get_sales_pipeline(start_date, end_date)
    print(f"📊 Pipeline value: ${report['totalValue']}")
    print(f"📊 Win rate: {report['winRate']}%")

if __name__ == '__main__':
    main()
```

---

## 📝 CRUD Operations

### Lead Management

```javascript
// Create lead from web form
async function handleFormSubmission(formData) {
  const lead = await crm.createLead({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    company: formData.company,
    source: 'Website Form',
    status: 'New',
    description: formData.message
  });
  
  console.log(`Lead ${lead.id} created`);
  
  // Create follow-up activity
  await crm.createActivity({
    type: 'Task',
    subject: `Follow up with ${formData.firstName}`,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    relatedToType: 'Lead',
    relatedToId: lead.id
  });
}

// Bulk import leads from CSV
async function importLeadsFromCsv(csvData) {
  const leads = parseCsv(csvData);
  const batchSize = 10;
  
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize);
    
    const promises = batch.map(lead => 
      crm.createLead(lead).catch(err => {
        console.error(`Failed to import ${lead.email}:`, err.message);
        return null;
      })
    );
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r !== null).length;
    
    console.log(`Imported ${successful}/${batch.length} leads (batch ${i/batchSize + 1})`);
    
    // Respect rate limits
    await sleep(1000);
  }
}
```

### Deal Pipeline Management

```python
# Move all qualified leads through pipeline
async def process_qualified_leads():
    # Get qualified leads
    leads = await crm.get_leads(status='Qualified')
    
    for lead in leads['items']:
        # Convert to contact
        conversion = await crm.convert_lead(lead['id'], create_deal=True)
        
        contact_id = conversion['contactId']
        deal_id = conversion['dealId']
        
        # Update deal amount based on company size
        company = await crm.get_company(lead['companyId'])
        deal_amount = calculate_deal_value(company)
        
        await crm.update_deal(deal_id, {
            'amount': deal_amount,
            'expectedCloseDate': calculate_close_date(company)
        })
        
        print(f"✅ Lead {lead['id']} → Deal {deal_id} (${deal_amount})")

def calculate_deal_value(company):
    # Calculate based on employee count
    employees = company.get('employeeCount', 10)
    
    if employees < 50:
        return 10000
    elif employees < 200:
        return 25000
    elif employees < 1000:
        return 50000
    else:
        return 100000

def calculate_close_date(company):
    # Larger companies take longer to close
    employees = company.get('employeeCount', 10)
    days = 30 if employees < 50 else 60 if employees < 200 else 90
    
    return (datetime.now() + timedelta(days=days)).isoformat()
```

---

## ⚙️ Workflow Automation

### Email Workflow

```javascript
// Create workflow to send welcome email to new leads
async function createWelcomeEmailWorkflow() {
  const workflow = await crm.createWorkflow({
    name: 'Welcome Email for Website Leads',
    description: 'Send automated welcome email when lead comes from website',
    entityType: 'Lead',
    triggerType: 'OnCreate',
    isActive: true,
    conditions: [
      {
        field: 'Source',
        operator: 'Equals',
        value: 'Website'
      }
    ],
    actions: [
      {
        type: 'SendEmail',
        parameters: {
          to: '{{Email}}',
          subject: 'Thank you for your interest!',
          body: `
            <h1>Welcome {{FirstName}}!</h1>
            <p>Thank you for reaching out to us. A member of our team will contact you within 24 hours.</p>
            <p>In the meantime, feel free to check out our <a href="https://example.com/resources">resources</a>.</p>
          `
        }
      },
      {
        type: 'CreateTask',
        parameters: {
          title: 'Follow up with {{FirstName}} {{LastName}}',
          description: 'Initial contact for website lead',
          dueDate: '+1day',
          priority: 'High'
        }
      },
      {
        type: 'SendNotification',
        parameters: {
          userId: 'sales-team',
          message: 'New website lead: {{FirstName}} {{LastName}} from {{Company}}'
        }
      }
    ]
  });
  
  await crm.activateWorkflow(workflow.id);
  console.log('✅ Welcome workflow created and activated');
}
```

### Deal Automation

```python
# Auto-escalate stale deals
async def create_stale_deal_workflow():
    workflow = await crm.create_workflow({
        'name': 'Escalate Stale Deals',
        'description': 'Alert manager if deal hasn\'t moved in 14 days',
        'entityType': 'Deal',
        'triggerType': 'Scheduled',
        'schedule': '0 9 * * *',  # Daily at 9 AM
        'isActive': True,
        'conditions': [
            {
                'field': 'LastModifiedDate',
                'operator': 'Before',
                'value': '-14days'
            },
            {
                'field': 'Stage',
                'operator': 'NotEquals',
                'value': 'Closed Won'
            },
            {
                'field': 'Stage',
                'operator': 'NotEquals',
                'value': 'Closed Lost'
            }
        ],
        'actions': [
            {
                'type': 'SendEmail',
                'parameters': {
                    'to': 'manager@company.com',
                    'subject': 'Stale deal alert: {{Name}}',
                    'body': 'Deal {{Name}} (${{Amount}}) hasn\'t been updated in 14 days. Please review.'
                }
            },
            {
                'type': 'UpdateField',
                'parameters': {
                    'field': 'Priority',
                    'value': 'High'
                }
            }
        ]
    })
    
    await crm.activate_workflow(workflow['id'])
    print('✅ Stale deal workflow created')
```

---

## 📊 Reporting & Analytics

### Sales Dashboard

```javascript
// Generate comprehensive sales dashboard
async function generateSalesDashboard(startDate, endDate) {
  // Fetch all reports in parallel
  const [pipeline, conversion, ticketAnalytics, userActivity] = await Promise.all([
    crm.getSalesPipeline(startDate, endDate),
    crm.getLeadConversion(startDate, endDate),
    crm.getTicketAnalytics(startDate, endDate),
    crm.getUserActivity(startDate, endDate)
  ]);
  
  const dashboard = {
    period: { startDate, endDate },
    sales: {
      pipelineValue: pipeline.totalValue,
      dealsWon: pipeline.wonDeals,
      dealsLost: pipeline.lostDeals,
      winRate: pipeline.winRate,
      averageDealSize: pipeline.averageDealSize,
      salesCycleLength: pipeline.averageSalesCycle
    },
    leads: {
      totalLeads: conversion.totalLeads,
      convertedLeads: conversion.convertedLeads,
      conversionRate: conversion.conversionRate,
      leadsBySource: conversion.bySource
    },
    support: {
      totalTickets: ticketAnalytics.totalTickets,
      avgResolutionTime: ticketAnalytics.averageResolutionTime,
      avgFirstResponseTime: ticketAnalytics.averageFirstResponseTime,
      slaCompliance: ticketAnalytics.slaComplianceRate
    },
    team: {
      mostActiveUser: userActivity.users[0],
      totalActivities: userActivity.totalActivities,
      activitiesByUser: userActivity.users
    }
  };
  
  return dashboard;
}

// Export to CSV
function exportDashboardToCsv(dashboard) {
  const csv = [];
  
  csv.push(['Metric', 'Value']);
  csv.push(['Period', `${dashboard.period.startDate} to ${dashboard.period.endDate}`]);
  csv.push(['']);
  
  csv.push(['SALES']);
  csv.push(['Pipeline Value', `$${dashboard.sales.pipelineValue}`]);
  csv.push(['Deals Won', dashboard.sales.dealsWon]);
  csv.push(['Win Rate', `${dashboard.sales.winRate}%`]);
  csv.push(['Avg Deal Size', `$${dashboard.sales.averageDealSize}`]);
  csv.push(['']);
  
  csv.push(['LEADS']);
  csv.push(['Total Leads', dashboard.leads.totalLeads]);
  csv.push(['Conversion Rate', `${dashboard.leads.conversionRate}%`]);
  csv.push(['']);
  
  csv.push(['SUPPORT']);
  csv.push(['Total Tickets', dashboard.support.totalTickets]);
  csv.push(['Avg Resolution Time', `${dashboard.support.avgResolutionTime} hours`]);
  csv.push(['SLA Compliance', `${dashboard.support.slaCompliance}%`]);
  
  return csv.map(row => row.join(',')).join('\n');
}
```

### Custom Reports

```python
# Generate custom cohort analysis
async def cohort_analysis(start_month: str, num_months: int = 6):
    """
    Analyze customer retention by cohort
    
    Args:
        start_month: Start month in YYYY-MM format
        num_months: Number of months to analyze
    """
    cohorts = {}
    
    for i in range(num_months):
        # Calculate month
        month_date = datetime.strptime(start_month, '%Y-%m') + timedelta(days=30*i)
        month_str = month_date.strftime('%Y-%m')
        
        # Get leads created in this month
        month_start = month_date.replace(day=1).isoformat()
        month_end = (month_date.replace(day=28) + timedelta(days=4)).replace(day=1).isoformat()
        
        leads = await crm.get_leads(
            createdFrom=month_start,
            createdTo=month_end
        )
        
        # Track conversion over time
        cohorts[month_str] = {
            'totalLeads': len(leads['items']),
            'converted': {
                'month0': 0,
                'month1': 0,
                'month2': 0,
                'month3': 0
            }
        }
        
        # Check conversion status at different time points
        for lead in leads['items']:
            if lead['status'] == 'Converted':
                conversion_date = datetime.fromisoformat(lead['convertedAt'])
                months_to_convert = (conversion_date.year - month_date.year) * 12 + \
                                   conversion_date.month - month_date.month
                
                if months_to_convert <= 3:
                    cohorts[month_str]['converted'][f'month{months_to_convert}'] += 1
    
    # Calculate retention rates
    for month, data in cohorts.items():
        for period, count in data['converted'].items():
            rate = (count / data['totalLeads'] * 100) if data['totalLeads'] > 0 else 0
            data['converted'][f'{period}_rate'] = round(rate, 2)
    
    return cohorts

# Usage
cohorts = await cohort_analysis('2026-01', 6)
for month, data in cohorts.items():
    print(f"{month}: {data['totalLeads']} leads, " +
          f"{data['converted']['month0_rate']}% converted in same month")
```

---

## 📧 Marketing Automation

### Email Campaign

```javascript
// Create and send email campaign
async function runEmailCampaign() {
  // Create segment for high-value contacts
  const segment = await crm.createSegment({
    name: 'High Value Contacts',
    description: 'Contacts from companies with >$1M revenue',
    criteria: [
      {
        field: 'Company.AnnualRevenue',
        operator: 'GreaterThan',
        value: '1000000'
      },
      {
        field: 'EmailOptIn',
        operator: 'Equals',
        value: 'true'
      }
    ]
  });
  
  // Create campaign
  const campaign = await crm.createCampaign({
    name: 'Q1 2026 Product Launch',
    type: 'Email',
    subject: 'Introducing Our Enterprise Plan',
    content: `
      <html>
        <body>
          <h1>{{FirstName}}, Check Out Our New Enterprise Plan</h1>
          <p>We're excited to announce our new Enterprise Plan, designed for companies like {{Company}}.</p>
          <ul>
            <li>Unlimited users</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
            <li>Custom integrations</li>
          </ul>
          <a href="https://example.com/enterprise?contact={{Id}}">Learn More</a>
        </body>
      </html>
    `,
    segmentId: segment.id,
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  
  console.log(`✅ Campaign ${campaign.id} scheduled for ${campaign.scheduledDate}`);
  
  // Send immediately (or wait for scheduled time)
  await crm.sendCampaign(campaign.id);
  console.log(`✅ Campaign sent to ${segment.contactCount} contacts`);
}
```

### Lead Scoring

```python
# Implement custom lead scoring
async def score_lead(lead_id: str) -> int:
    lead = await crm.get_lead(lead_id)
    score = 0
    
    # Demographic scoring
    if lead.get('jobTitle') and any(title in lead['jobTitle'].lower() 
        for title in ['ceo', 'cto', 'vp', 'director']):
        score += 20
    
    if lead.get('company'):
        company = await crm.get_company(lead['companyId'])
        
        # Company size
        employees = company.get('employeeCount', 0)
        if employees > 1000:
            score += 30
        elif employees > 100:
            score += 20
        elif employees > 10:
            score += 10
        
        # Revenue
        revenue = company.get('annualRevenue', 0)
        if revenue > 10000000:
            score += 30
        elif revenue > 1000000:
            score += 20
        elif revenue > 100000:
            score += 10
    
    # Behavioral scoring
    activities = await crm.get_activities(relatedToId=lead_id)
    
    # Email opens
    email_opens = len([a for a in activities if a['type'] == 'EmailOpen'])
    score += min(email_opens * 2, 20)
    
    # Website visits
    website_visits = len([a for a in activities if a['type'] == 'WebsiteVisit'])
    score += min(website_visits * 3, 30)
    
    # Demo requests
    demo_requests = len([a for a in activities if a['type'] == 'DemoRequest'])
    score += demo_requests * 40
    
    # Cap at 100
    score = min(score, 100)
    
    # Update lead score
    await crm.update_lead(lead_id, {'score': score})
    
    return score
```

---

## 🔄 Real-time Integrations

### Webhook Handler with Queue

```javascript
// Webhook handler with Redis queue
const express = require('express');
const Bull = require('bull');
const crypto = require('crypto');

const app = express();
const webhookQueue = new Bull('webhooks', {
  redis: { host: 'localhost', port: 6379 }
});

// Webhook endpoint
app.post('/webhooks/crm', 
  express.raw({ type: 'application/json' }),
  verifyWebhook,
  (req, res) => {
    const event = JSON.parse(req.body.toString());
    
    // Add to queue for processing
    webhookQueue.add(event, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
    
    // Respond immediately
    res.status(200).json({ received: true });
  }
);

// Process queue
webhookQueue.process(async (job) => {
  const event = job.data;
  
  console.log(`Processing ${event.eventType} (attempt ${job.attemptsMade + 1})`);
  
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
});

// Event handlers
async function handleLeadCreated(lead) {
  // Add to external CRM
  await externalCrm.createLead(lead);
  
  // Add to email marketing platform
  await mailchimp.addSubscriber({
    email: lead.email,
    firstName: lead.firstName,
    lastName: lead.lastName,
    tags: ['crm-lead', lead.source]
  });
  
  // Notify Slack
  await slack.postMessage({
    channel: '#sales',
    text: `🎯 New lead: ${lead.firstName} ${lead.lastName} from ${lead.company}`
  });
}

async function handleDealWon(deal) {
  // Create invoice in billing system
  await stripe.createInvoice({
    customer: deal.contactId,
    amount: deal.amount,
    description: deal.name
  });
  
  // Update data warehouse
  await dataWarehouse.recordSale({
    dealId: deal.id,
    amount: deal.amount,
    closedDate: deal.wonDate
  });
  
  // Send celebration message
  await slack.postMessage({
    channel: '#sales',
    text: `🎉 Deal won: ${deal.name} - $${deal.amount}!`
  });
}
```

### Bi-directional Sync

```python
# Sync CRM data with external system
import asyncio
from datetime import datetime, timedelta

class CrmSyncService:
    def __init__(self, crm, external_system):
        self.crm = crm
        self.external_system = external_system
        self.last_sync = None
    
    async def sync_continuously(self, interval_seconds=300):
        """Sync every 5 minutes"""
        while True:
            try:
                await self.sync_once()
                await asyncio.sleep(interval_seconds)
            except Exception as e:
                print(f"Sync error: {e}")
                await asyncio.sleep(60)  # Retry after 1 minute
    
    async def sync_once(self):
        """Perform bidirectional sync"""
        now = datetime.now()
        
        # Sync from CRM to external system
        await self.sync_to_external()
        
        # Sync from external system to CRM
        await self.sync_from_external()
        
        self.last_sync = now
        print(f"✅ Sync completed at {now}")
    
    async def sync_to_external(self):
        """Sync CRM → External System"""
        if not self.last_sync:
            # Initial sync - get last 7 days
            start_date = (datetime.now() - timedelta(days=7)).isoformat()
        else:
            start_date = self.last_sync.isoformat()
        
        # Get modified leads
        leads = await self.crm.get_leads(modifiedSince=start_date)
        
        for lead in leads['items']:
            # Check if exists in external system
            external_lead = await self.external_system.get_lead_by_email(lead['email'])
            
            if external_lead:
                # Update
                await self.external_system.update_lead(external_lead['id'], lead)
                print(f"Updated lead {lead['email']} in external system")
            else:
                # Create
                await self.external_system.create_lead(lead)
                print(f"Created lead {lead['email']} in external system")
    
    async def sync_from_external(self):
        """Sync External System → CRM"""
        if not self.last_sync:
            start_date = (datetime.now() - timedelta(days=7)).isoformat()
        else:
            start_date = self.last_sync.isoformat()
        
        # Get modified leads from external system
        external_leads = await self.external_system.get_modified_leads(start_date)
        
        for external_lead in external_leads:
            # Check if exists in CRM
            crm_leads = await self.crm.get_leads(email=external_lead['email'])
            
            if crm_leads['totalCount'] > 0:
                # Update
                crm_lead = crm_leads['items'][0]
                await self.crm.update_lead(crm_lead['id'], external_lead)
                print(f"Updated lead {external_lead['email']} in CRM")
            else:
                # Create
                await self.crm.create_lead(external_lead)
                print(f"Created lead {external_lead['email']} in CRM")

# Usage
async def main():
    crm = CrmIntegration('https://api.yourdomain.com', 'admin@company.com', 'Admin@123')
    crm.init()
    
    external_system = ExternalCrmSystem('https://external-crm.com', 'api_key')
    
    sync_service = CrmSyncService(crm, external_system)
    await sync_service.sync_continuously(interval_seconds=300)

if __name__ == '__main__':
    asyncio.run(main())
```

---

## 🎯 Advanced Scenarios

### Duplicate Detection & Merging

```javascript
// Find and merge duplicate contacts
async function deduplicateContacts() {
  const allContacts = await getAllContacts();
  const duplicates = findDuplicates(allContacts);
  
  for (const group of duplicates) {
    console.log(`Found ${group.length} duplicates for ${group[0].email}`);
    
    // Keep the oldest contact as master
    const master = group.sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    )[0];
    
    // Merge others into master
    for (const duplicate of group.slice(1)) {
      await crm.mergeContacts(master.id, duplicate.id);
      console.log(`Merged ${duplicate.id} into ${master.id}`);
    }
  }
}

function findDuplicates(contacts) {
  const emailMap = new Map();
  
  for (const contact of contacts) {
    const key = contact.email.toLowerCase();
    
    if (!emailMap.has(key)) {
      emailMap.set(key, []);
    }
    
    emailMap.get(key).push(contact);
  }
  
  // Return groups with > 1 contact
  return Array.from(emailMap.values()).filter(group => group.length > 1);
}
```

### Customer 360 View

```python
# Build comprehensive customer 360 view
async def get_customer_360(contact_id: str) -> Dict:
    """
    Get complete customer profile with all related data
    """
    # Fetch all data in parallel
    contact, timeline, health_score, company, deals, tickets, activities = await asyncio.gather(
        crm.get_contact(contact_id),
        crm.get_contact_timeline(contact_id),
        crm.get_contact_health_score(contact_id),
        crm.get_company(contact_id),  # Assumes contact has companyId
        crm.get_deals(contactId=contact_id),
        crm.get_tickets(contactId=contact_id),
        crm.get_activities(relatedToId=contact_id)
    )
    
    # Calculate engagement metrics
    email_opens = len([a for a in activities if a['type'] == 'EmailOpen'])
    website_visits = len([a for a in activities if a['type'] == 'WebsiteVisit'])
    last_activity_date = max([a['createdAt'] for a in activities]) if activities else None
    
    # Calculate lifetime value
    total_deal_value = sum([d['amount'] for d in deals['items'] if d['stage'] == 'Closed Won'])
    
    # Build 360 view
    customer_360 = {
        'profile': {
            'id': contact['id'],
            'name': f"{contact['firstName']} {contact['lastName']}",
            'email': contact['email'],
            'phone': contact['phone'],
            'jobTitle': contact['jobTitle'],
            'company': company['name'] if company else None,
            'createdAt': contact['createdAt']
        },
        'company': {
            'name': company['name'],
            'industry': company['industry'],
            'employeeCount': company['employeeCount'],
            'annualRevenue': company['annualRevenue']
        } if company else None,
        'engagement': {
            'healthScore': health_score['score'],
            'emailOpens': email_opens,
            'websiteVisits': website_visits,
            'lastActivityDate': last_activity_date,
            'daysSinceLastActivity': calculate_days_since(last_activity_date)
        },
        'deals': {
            'total': deals['totalCount'],
            'won': len([d for d in deals['items'] if d['stage'] == 'Closed Won']),
            'lost': len([d for d in deals['items'] if d['stage'] == 'Closed Lost']),
            'inProgress': len([d for d in deals['items'] if d['stage'] not in ['Closed Won', 'Closed Lost']]),
            'totalValue': total_deal_value,
            'recentDeals': deals['items'][:5]
        },
        'support': {
            'totalTickets': tickets['totalCount'],
            'openTickets': len([t for t in tickets['items'] if t['status'] != 'Closed']),
            'avgResolutionTime': calculate_avg_resolution_time(tickets['items']),
            'recentTickets': tickets['items'][:5]
        },
        'timeline': timeline[:20]  # Last 20 activities
    }
    
    return customer_360

def calculate_days_since(date_str):
    if not date_str:
        return None
    date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    return (datetime.now(timezone.utc) - date).days
```

---

## 📞 Support

- **Main Documentation**: [README.md](README.md)
- **API Integration Guide**: [API_INTEGRATION.md](API_INTEGRATION.md)
- **Webhook Guide**: [WEBHOOK_INTEGRATION.md](WEBHOOK_INTEGRATION.md)
- **Postman Collection**: [CRM_SaaS_API.postman_collection.json](CRM_SaaS_API.postman_collection.json)

---

**Happy Coding! 🚀**
