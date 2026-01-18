'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCreateTicket } from '@/hooks/useTickets';
import { useCustomers } from '@/hooks/useCustomers';
import { useContacts } from '@/hooks/useContacts';
import { TicketType, TicketPriority, CreateTicketRequest } from '@/types';

export default function NewTicketPage() {
  const router = useRouter();
  const createTicket = useCreateTicket();
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const { data: contactsData } = useContacts({ 
    pageSize: 100,
    ...(selectedCustomerId && { companyId: selectedCustomerId })
  });

  const [formData, setFormData] = useState<CreateTicketRequest>({
    subject: '',
    description: '',
    customerId: '',
    contactId: '',
    type: TicketType.Question,
    priority: TicketPriority.Medium,
    channel: 'Web',
    assignedToUserId: '',
    tags: '',
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: CreateTicketRequest = {
      subject: formData.subject,
      ...(formData.description && { description: formData.description }),
      ...(formData.customerId && { customerId: formData.customerId }),
      ...(formData.contactId && { contactId: formData.contactId }),
      type: formData.type,
      priority: formData.priority,
      ...(formData.channel && { channel: formData.channel }),
      ...(formData.assignedToUserId && { assignedToUserId: formData.assignedToUserId }),
      ...(formData.tags && { tags: formData.tags }),
      ...(formData.dueDate && { dueDate: new Date(formData.dueDate).toISOString() }),
    };

    createTicket.mutate(submitData, {
      onSuccess: () => {
        router.push('/tickets');
      },
    });
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setFormData(prev => ({ ...prev, customerId, contactId: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tickets">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Support Ticket</h1>
          <p className="text-muted-foreground">Create a new support request</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Subject - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the issue..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer */}
              <div>
                <label className="block text-sm font-medium mb-2">Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select customer...</option>
                  {customersData?.items?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium mb-2">Contact</label>
                <select
                  value={formData.contactId}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!selectedCustomerId}
                >
                  <option value="">Select contact...</option>
                  {contactsData?.items?.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} {contact.email && `(${contact.email})`}
                    </option>
                  ))}
                </select>
                {!selectedCustomerId && (
                  <p className="text-xs text-muted-foreground mt-1">Select a customer first</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: Number(e.target.value) as TicketType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={TicketType.Question}>Question</option>
                  <option value={TicketType.Problem}>Problem</option>
                  <option value={TicketType.Incident}>Incident</option>
                  <option value={TicketType.FeatureRequest}>Feature Request</option>
                  <option value={TicketType.Task}>Task</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) as TicketPriority }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={TicketPriority.Low}>Low</option>
                  <option value={TicketPriority.Medium}>Medium</option>
                  <option value={TicketPriority.High}>High</option>
                  <option value={TicketPriority.Critical}>Critical</option>
                </select>
              </div>

              {/* Channel */}
              <div>
                <label className="block text-sm font-medium mb-2">Channel</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Web">Web</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Chat">Chat</option>
                  <option value="Social Media">Social Media</option>
                  <option value="API">API</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <Input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Tags</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder='e.g., ["urgent", "login-issue"]'
                />
                <p className="text-xs text-muted-foreground mt-1">Enter as JSON array format</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createTicket.isPending || !formData.subject}
              >
                {createTicket.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ticket
              </Button>
              <Link href="/tickets">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
