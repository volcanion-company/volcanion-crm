'use client';

import { useState, useEffect } from 'react';
import { useUsers, useDeleteUser, useActivateUser, useDeactivateUser, useResetPassword } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, UserCheck, UserX, KeyRound, Loader2, Mail, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { UserStatus } from '@/types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const statusColors: Record<UserStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [UserStatus.Active]: 'success',
  [UserStatus.Inactive]: 'warning',
  [UserStatus.Deleted]: 'danger',
};

const statusKeys: Record<UserStatus, string> = {
  [UserStatus.Active]: 'active',
  [UserStatus.Inactive]: 'inactive',
  [UserStatus.Deleted]: 'deleted',
};

export default function UsersPage() {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');

  // Debounce search with 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error } = useUsers({
    pageNumber: currentPage,
    pageSize: 10,
    search: debouncedSearch || undefined,
    status: statusFilter === '' ? undefined : statusFilter,
  });

  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const resetPassword = useResetPassword();

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleResetPasswordClick = (id: string) => {
    setUserToResetPassword(id);
    setResetPasswordDialogOpen(true);
  };

  const handleResetPasswordConfirm = () => {
    if (userToResetPassword) {
      resetPassword.mutate(userToResetPassword, {
        onSuccess: (password) => {
          setNewPassword(password);
        },
      });
    }
  };

  const handleActivate = (id: string) => {
    activateUser.mutate(id);
  };

  const handleDeactivate = (id: string) => {
    deactivateUser.mutate(id);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">{tCommon('error')}: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link href="/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.create')}
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === '' ? '' : Number(e.target.value) as UserStatus)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('filters.allStatus')}</option>
              <option value={UserStatus.Active}>{t('status.active')}</option>
              <option value={UserStatus.Inactive}>{t('status.inactive')}</option>
              <option value={UserStatus.Deleted}>{t('status.deleted')}</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fields.fullName')}</TableHead>
                  <TableHead>{t('fields.email')}</TableHead>
                  <TableHead>{t('fields.phone')}</TableHead>
                  <TableHead>{t('fields.roles')}</TableHead>
                  <TableHead>{t('fields.status')}</TableHead>
                  <TableHead>{t('fields.lastLogin')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t('noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.items?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <Link href={`/users/${user.id}`} className="hover:underline">
                          {user.fullName || `${user.firstName} ${user.lastName}` || user.email}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {user.phone}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles?.map((role, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[user.status ?? UserStatus.Active]}>
                          {t(`status.${statusKeys[user.status ?? UserStatus.Active] || 'active'}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLoginAt ? formatDate(user.lastLoginAt) : t('neverLogin')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                              {tCommon('view')}
                            </Button>
                          </Link>
                          {user.status === UserStatus.Active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(user.id)}
                              title={t('actions.deactivate')}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : user.status === UserStatus.Inactive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(user.id)}
                              title={t('actions.activate')}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPasswordClick(user.id)}
                            title={t('actions.resetPassword')}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.totalPages > 1 && (
            <Pagination
              page={currentPage}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              totalPages={data.totalPages}
              hasNextPage={data.hasNextPage}
              hasPreviousPage={data.hasPreviousPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('deleteDialog.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('deleteDialog.message')}</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setUserToDelete(null);
                }}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteUser.isPending}
              >
                {deleteUser.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon('deleting')}
                  </>
                ) : (
                  tCommon('delete')
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reset Password Dialog */}
      {resetPasswordDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('resetPasswordDialog.title')}</h2>
            {newPassword ? (
              <>
                <p className="text-muted-foreground mb-4">{t('resetPasswordDialog.successMessage')}</p>
                <div className="bg-gray-100 p-4 rounded-md mb-6">
                  <p className="text-sm text-muted-foreground mb-2">{t('resetPasswordDialog.newPassword')}:</p>
                  <p className="text-lg font-mono font-bold">{newPassword}</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setResetPasswordDialogOpen(false);
                      setUserToResetPassword(null);
                      setNewPassword('');
                    }}
                  >
                    {tCommon('close')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-6">{t('resetPasswordDialog.message')}</p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResetPasswordDialogOpen(false);
                      setUserToResetPassword(null);
                    }}
                  >
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    onClick={handleResetPasswordConfirm}
                    disabled={resetPassword.isPending}
                  >
                    {resetPassword.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('resetPasswordDialog.resetting')}
                      </>
                    ) : (
                      t('actions.resetPassword')
                    )}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
