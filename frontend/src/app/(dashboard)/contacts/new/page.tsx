'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateContact } from '@/hooks/useContacts';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import type { CreateContactRequest } from '@/types';

export default function NewContactPage() {
  const router = useRouter();
  const createMutation = useCreateContact();
  const { data: customersData } = useCustomers({ pageSize: 100 });

  const [formData, setFormData] = useState<CreateContactRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    jobTitle: '',
    department: '',
    customerId: '',
    isPrimary: false,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    linkedInUrl: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove empty optional fields
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== '')
    ) as CreateContactRequest;

    await createMutation.mutateAsync(cleanData);
    router.push('/contacts');
  };

  const handleChange = (field: keyof CreateContactRequest, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/contacts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Contact</h1>
          <p className="text-muted-foreground">Create a new contact</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mobile</label>
              <Input
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Company & Position</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Customer</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.customerId}
                onChange={(e) => handleChange('customerId', e.target.value)}
              >
                <option value="">Select customer...</option>
                {customersData?.items?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) => handleChange('isPrimary', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isPrimary" className="text-sm font-medium">
                Primary Contact
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Address</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Address Line 1</label>
              <Input
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address Line 2</label>
              <Input
                value={formData.addressLine2}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State/Province</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Postal Code</label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Input
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
              <Input
                type="url"
                value={formData.linkedInUrl}
                onChange={(e) => handleChange('linkedInUrl', e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[100px]"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes about this contact..."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/contacts">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending ? 'Creating...' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
}
