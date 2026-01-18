'use client';

import { useState } from 'react';
import { useContacts, useDeleteContact } from '@/hooks/useContacts';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, Mail, Phone, Briefcase, Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ContactStatus } from '@/types';
import Link from 'next/link';

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

export default function ContactsPage() {
  const t = useTranslations('contacts');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useContacts({ page, pageSize: 20, search });
  const deleteMutation = useDeleteContact();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your customer contacts and relationships</p>
        </div>
        <Link href="/contacts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contact
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                      {contact.firstName} {contact.lastName}
                    </Link>
                    {contact.isPrimary && (
                      <div title="Primary Contact">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {contact.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${contact.email}`} className="hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {contact.customerName ? (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-muted-foreground" />
                      {contact.customerName}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {contact.jobTitle ? (
                    <div>
                      <div className="font-medium">{contact.jobTitle}</div>
                      {contact.department && (
                        <div className="text-sm text-muted-foreground">{contact.department}</div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[contact.status]}>
                    {statusLabels[contact.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(contact.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/contacts/${contact.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data && data.totalCount > 0 && (
          <div className="p-4">
            <Pagination
              page={page}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              totalPages={data.totalPages}
              hasNextPage={data.hasNextPage}
              hasPreviousPage={data.hasPreviousPage}
              onPageChange={setPage}
            />
          </div>
        )}
        {data && data.totalCount === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <p>No contacts found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
