'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole, useDeleteRole } from '@/hooks/useRoles';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Shield, Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DataScope } from '@/types';
import type { Permission } from '@/types';

interface RoleDetailPageProps {
  params: Promise<{ id: string }>;
}

const dataScopeColors: Record<DataScope, 'default' | 'success' | 'warning' | 'info'> = {
  [DataScope.AllInOrganization]: 'success',
  [DataScope.Department]: 'info',
  [DataScope.TeamOnly]: 'warning',
  [DataScope.OnlyOwn]: 'default',
};

export default function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  
  const { data: role, isLoading } = useRole(id);
  const deleteMutation = useDeleteRole();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    if (role?.isSystemRole) {
      alert(t('cannotDeleteSystemRole'));
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!role) return;

    try {
      await deleteMutation.mutateAsync(role.id);
      setDeleteDialogOpen(false);
      router.push('/roles');
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground mb-4">{t('notFound')}</p>
        <Link href="/roles">
          <Button variant="outline">{tCommon('backToList')}</Button>
        </Link>
      </div>
    );
  }

  // Group permissions by module
  const groupedPermissions = role.permissions?.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
    const module = permission.module || 'Other';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="h-8 w-8 text-gray-400" />
            <h1 className="text-3xl font-bold">{role.name}</h1>
          </div>
          <p className="text-muted-foreground">{t('detailSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/roles/${role.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              {tCommon('edit')}
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleDeleteClick}
            disabled={role.isSystemRole || deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {tCommon('delete')}
          </Button>
        </div>
      </div>

      {/* Role Info Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('roleInformation')}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('fields.name')}
                </label>
                <p className="mt-1 text-base">{role.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('fields.dataScope')}
                </label>
                <div className="mt-1">
                  <Badge variant={dataScopeColors[role.dataScope as DataScope]}>
                    {t(`dataScope.${DataScope[role.dataScope].toLowerCase()}`)}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                {t('fields.description')}
              </label>
              <p className="mt-1 text-base">{role.description || '-'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('fields.type')}
                </label>
                <div className="mt-1">
                  {role.isSystemRole ? (
                    <Badge variant="info">{t('systemRole')}</Badge>
                  ) : (
                    <span className="text-base">{t('customRole')}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('fields.createdAt')}
                </label>
                <p className="mt-1 text-base">
                  {new Date(role.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Permissions Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('fields.permissions')} ({role.permissions?.length || 0})
          </h2>
          
          {role.permissions && role.permissions.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([module, permissions]) => (
                <div key={module} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {module}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{permission.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            {permission.code}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {t('noPermissions')}
            </p>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && role && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{t('deleteDialog.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('deleteDialog.message', { name: role.name })}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
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
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
