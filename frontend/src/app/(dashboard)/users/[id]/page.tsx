'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDeleteUser, useActivateUser, useDeactivateUser, useResetPassword } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { User as UserIcon, Mail, Phone, Calendar, Globe, Edit, Trash2, UserCheck, UserX, KeyRound, Copy, Check } from 'lucide-react';
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

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { id } = use(params);

  const { data: user, isLoading, error } = useUser(id);
  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const resetPassword = useResetPassword();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleDelete = () => {
    deleteUser.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        router.push('/users');
      },
    });
  };

  const handleActivate = () => {
    activateUser.mutate(id);
  };

  const handleDeactivate = () => {
    deactivateUser.mutate(id);
  };

  const handleResetPassword = () => {
    resetPassword.mutate(id, {
      onSuccess: (password) => {
        setNewPassword(password);
      },
    });
  };

  const handleCopyPassword = async () => {
    if (newPassword) {
      await navigator.clipboard.writeText(newPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  const handleCloseResetDialog = () => {
    setResetPasswordDialogOpen(false);
    setNewPassword('');
    setPasswordCopied(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 text-lg">{tCommon('error')}: {error.message}</div>
        <Button onClick={() => router.push('/users')} variant="outline">
          {tCommon('back')}
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-gray-500 text-lg">{t('notFound')}</div>
        <Button onClick={() => router.push('/users')} variant="outline">
          {tCommon('back')}
        </Button>
      </div>
    );
  }

  const isActive = user.status === UserStatus.Active;
  const isDeleted = user.status === UserStatus.Deleted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.fullName || `${user.firstName} ${user.lastName}`}</h1>
          <p className="text-gray-500 mt-1">{t('userDetails')}</p>
        </div>
        <Button onClick={() => router.push('/users')} variant="outline">
          {tCommon('back')}
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {t('sections.basicInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{t('fields.fullName')}</label>
              <p className="text-base mt-1">{user.fullName || `${user.firstName} ${user.lastName}`}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500">{t('fields.email')}</label>
                <p className="text-base mt-1">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">{t('fields.phone')}</label>
                  <p className="text-base mt-1">{user.phone}</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">{t('fields.status')}</label>
              <div className="mt-1">
                <Badge variant={statusColors[user.status ?? UserStatus.Active]}>
                  {t(`status.${statusKeys[user.status ?? UserStatus.Active] || 'active'}`)}
                </Badge>
              </div>
            </div>

            {user.roles && user.roles.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">{t('fields.roles')}</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.roles.map((role: string) => (
                    <Badge key={role} variant="default">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Login Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('sections.loginInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.lastLoginAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">{t('fields.lastLogin')}</label>
                <p className="text-base mt-1">{formatDate(user.lastLoginAt)}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">{t('fields.createdAt')}</label>
              <p className="text-base mt-1">{formatDate(user.createdAt)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">{t('fields.updatedAt')}</label>
              <p className="text-base mt-1">{formatDate(user.updatedAt)}</p>
            </div>

            {user.tenantName && (
              <div>
                <label className="text-sm font-medium text-gray-500">{t('fields.tenantName')}</label>
                <p className="text-base mt-1">{user.tenantName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('sections.settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{t('fields.timeZone')}</label>
              <p className="text-base mt-1">{user.timeZone || tCommon('notSet')}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">{t('fields.culture')}</label>
              <p className="text-base mt-1">{user.culture || tCommon('notSet')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('actions.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/users/${id}/edit`} className="block">
              <Button className="w-full" variant="default">
                <Edit className="h-4 w-4 mr-2" />
                {tCommon('edit')}
              </Button>
            </Link>

            {!isDeleted && (
              <>
                {isActive ? (
                  <Button
                    className="w-full"
                    variant="warning"
                    onClick={handleDeactivate}
                    disabled={deactivateUser.isPending}
                  >
                    {deactivateUser.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {tCommon('processing')}
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        {t('actions.deactivate')}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant="success"
                    onClick={handleActivate}
                    disabled={activateUser.isPending}
                  >
                    {activateUser.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {tCommon('processing')}
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        {t('actions.activate')}
                      </>
                    )}
                  </Button>
                )}

                <Button
                  className="w-full"
                  variant="info"
                  onClick={() => setResetPasswordDialogOpen(true)}
                  disabled={resetPassword.isPending}
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  {t('actions.resetPassword')}
                </Button>
              </>
            )}

            <Button
              className="w-full"
              variant="danger"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteUser.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {tCommon('delete')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('deleteDialog.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{t('deleteDialog.message')}</p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteUser.isPending}
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleteUser.isPending}
                >
                  {deleteUser.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {tCommon('deleting')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {tCommon('delete')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset Password Dialog */}
      {resetPasswordDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('resetPasswordDialog.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {newPassword ? (
                <div className="space-y-4">
                  <p className="text-green-600">{t('resetPasswordDialog.success')}</p>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      {t('resetPasswordDialog.newPassword')}
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono flex-1 break-all">{newPassword}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyPassword}
                      >
                        {passwordCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-amber-600">{t('resetPasswordDialog.warning')}</p>
                  <div className="flex justify-end">
                    <Button onClick={handleCloseResetDialog}>
                      {tCommon('close')}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">{t('resetPasswordDialog.message')}</p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={handleCloseResetDialog}
                      disabled={resetPassword.isPending}
                    >
                      {tCommon('cancel')}
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleResetPassword}
                      disabled={resetPassword.isPending}
                    >
                      {resetPassword.isPending ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {tCommon('processing')}
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4 mr-2" />
                          {t('actions.resetPassword')}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
