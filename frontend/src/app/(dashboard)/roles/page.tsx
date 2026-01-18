'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Plus, Eye, Edit, Trash2, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DataScope } from '@/types';
import type { Role } from '@/types';

const dataScopeColors: Record<DataScope, 'default' | 'success' | 'warning' | 'info'> = {
  [DataScope.AllInOrganization]: 'success',
  [DataScope.Department]: 'info',
  [DataScope.TeamOnly]: 'warning',
  [DataScope.OnlyOwn]: 'default',
};

export default function RolesPage() {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const { data: roles, isLoading } = useRoles();
  const deleteMutation = useDeleteRole();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleDeleteClick = (role: Role) => {
    if (role.isSystemRole) {
      alert(t('cannotDeleteSystemRole'));
      return;
    }
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      await deleteMutation.mutateAsync(roleToDelete.id);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Link href="/roles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('actions.create')}
          </Button>
        </Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('fields.name')}</TableHead>
              <TableHead>{t('fields.description')}</TableHead>
              <TableHead>{t('fields.dataScope')}</TableHead>
              <TableHead className="text-center">{t('fields.permissionCount')}</TableHead>
              <TableHead className="text-center">{t('fields.type')}</TableHead>
              <TableHead className="text-right">{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles && roles.length > 0 ? (
              roles.map((role: Role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={dataScopeColors[role.dataScope as DataScope]}>
                      {t(`dataScope.${DataScope[role.dataScope].toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {role.permissionCount || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {role.isSystemRole && (
                      <Badge variant="info">{t('systemRole')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/roles/${role.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          {tCommon('view')}
                        </Button>
                      </Link>
                      <Link href={`/roles/${role.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          {tCommon('edit')}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(role)}
                        disabled={role.isSystemRole || deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {tCommon('delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t('noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && roleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{t('deleteDialog.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('deleteDialog.message', { name: roleToDelete.name })}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setRoleToDelete(null);
                  }}
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
