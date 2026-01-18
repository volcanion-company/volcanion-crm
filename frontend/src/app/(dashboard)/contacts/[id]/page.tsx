'use client';

import { useContact } from '@/hooks/useContacts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ArrowLeft, Mail, Phone, Briefcase, MapPin, Linkedin, Edit, Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ContactStatus } from '@/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const statusColors: Record<ContactStatus, 'default' | 'success' | 'warning'> = {
  [ContactStatus.Active]: 'success',
  [ContactStatus.Inactive]: 'default',
  [ContactStatus.Unsubscribed]: 'warning',
};

const statusLabels: Record<ContactStatus, string> = {
  [ContactStatus.Active]: 'Active',
  [ContactStatus.Inactive]: 'Inactive',
  [ContactStatus.Unsubscribed]: 'Unsubscribed',
};

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: contact, isLoading } = useContact(id);

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  if (!contact) {
    return (
      <div className="space-y-6">
        <Link href="/contacts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </Link>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Contact not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/contacts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">
              {contact.firstName} {contact.lastName}
            </h1>
            {contact.isPrimary && (
              <div title="Primary Contact">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusColors[contact.status]}>
              {statusLabels[contact.status]}
            </Badge>
            {contact.jobTitle && (
              <span className="text-muted-foreground">{contact.jobTitle}</span>
            )}
          </div>
        </div>
        <Link href={`/contacts/${params.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Contact
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            {contact.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${contact.email}`} className="font-medium hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${contact.phone}`} className="font-medium">
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}
            {contact.mobile && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <a href={`tel:${contact.mobile}`} className="font-medium">
                    {contact.mobile}
                  </a>
                </div>
              </div>
            )}
            {contact.linkedInUrl && (
              <div className="flex items-start gap-3">
                <Linkedin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">LinkedIn</p>
                  <a
                    href={contact.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Company & Position */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Company & Position</h2>
          <div className="space-y-4">
            {contact.customerName && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{contact.customerName}</p>
                </div>
              </div>
            )}
            {contact.jobTitle && (
              <div>
                <p className="text-sm text-muted-foreground">Job Title</p>
                <p className="font-medium">{contact.jobTitle}</p>
              </div>
            )}
            {contact.department && (
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{contact.department}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Address */}
        {(contact.addressLine1 || contact.city || contact.country) && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Address</h2>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                {contact.addressLine1 && <p>{contact.addressLine1}</p>}
                {contact.addressLine2 && <p>{contact.addressLine2}</p>}
                {(contact.city || contact.state) && (
                  <p>
                    {contact.city}
                    {contact.state && `, ${contact.state}`}
                    {contact.postalCode && ` ${contact.postalCode}`}
                  </p>
                )}
                {contact.country && <p>{contact.country}</p>}
              </div>
            </div>
          </Card>
        )}

        {/* Notes */}
        {contact.notes && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
          </Card>
        )}
      </div>

      {/* Metadata */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Metadata</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-medium">{formatDate(contact.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="font-medium">{formatDate(contact.updatedAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contact ID</p>
            <p className="font-mono text-sm">{contact.id}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
