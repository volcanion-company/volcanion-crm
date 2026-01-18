'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole, usePermissions, useUpdateRole, useUpdateRolePermissions } from '@/hooks/useRoles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ArrowLeft, Save, Shield, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DataScope, type Permission, type UpdateRoleRequest, type UpdateRolePermissionsRequest, type PermissionModule } from '@/types';

interface EditRolePageProps {
  params: Promise<{
    id: string;
  }>;
}

const dataScopeOptions = [
  { value: DataScope.AllInOrganization, label: 'All in Organization' },
  { value: DataScope.Department, label: 'Department' },
  { value: DataScope.TeamOnly, label: 'Team Only' },
  { value: DataScope.OnlyOwn, label: 'Only Own' },
];

export default function EditRolePage({ params }: EditRolePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');

  const { data: role, isLoading: isLoadingRole } = useRole(id);
  const { data: permissionsData, isLoading: isLoadingPermissions } = usePermissions();
  const updateRoleMutation = useUpdateRole();
  const updatePermissionsMutation = useUpdateRolePermissions();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataScope: DataScope.AllInOrganization,
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);
  const [initialPermissions, setInitialPermissions] = useState<string[]>([]);

  // Pre-populate form data when role is loaded
  useEffect(() => {
    if (role) {
      const roleData = {
        name: role.name || '',
        description: role.description || '',
        dataScope: role.dataScope ?? DataScope.AllInOrganization,
      };
      
      setFormData(roleData);
      setInitialFormData(roleData);

      // Set initial permissions
      const rolePermissionIds = role.permissions?.map((p: Permission) => p.id) || [];
      setSelectedPermissions(rolePermissionIds);
      setInitialPermissions(rolePermissionIds);
    }
  }, [role]);

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    if (!permissionsData) return [];
    return permissionsData as PermissionModule[];
  }, [permissionsData]);

  // Check if form has changes
  const hasBasicInfoChanges = useMemo(() => {
    if (!initialFormData) return false;
    return (
      formData.name !== initialFormData.name ||
      formData.description !== initialFormData.description ||
      formData.dataScope !== initialFormData.dataScope
    );
  }, [formData, initialFormData]);

  const hasPermissionChanges = useMemo(() => {
    if (selectedPermissions.length !== initialPermissions.length) return true;
    const sorted1 = [...selectedPermissions].sort();
    const sorted2 = [...initialPermissions].sort();
    return JSON.stringify(sorted1) !== JSON.stringify(sorted2);
  }, [selectedPermissions, initialPermissions]);

  // Toggle module expansion
  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  // Toggle permission selection
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Toggle all permissions in a module
  const toggleModulePermissions = (module: PermissionModule) => {
    const modulePermissionIds = module.permissions.map((p) => p.id);
    const allSelected = modulePermissionIds.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !modulePermissionIds.includes(id))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev.filter((id) => !modulePermissionIds.includes(id)),
        ...modulePermissionIds,
      ]);
    }
  };

  // Check if all permissions in a module are selected
  const isModuleFullySelected = (module: PermissionModule) => {
    return module.permissions.every((p) => selectedPermissions.includes(p.id));
  };

  // Check if some (but not all) permissions in a module are selected
  const isModulePartiallySelected = (module: PermissionModule) => {
    const selectedCount = module.permissions.filter((p) =>
      selectedPermissions.includes(p.id)
    ).length;
    return selectedCount > 0 && selectedCount < module.permissions.length;
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired') || 'Name is required';
    }

    if (formData.dataScope === undefined || formData.dataScope === null) {
      newErrors.dataScope = t('validation.dataScopeRequired') || 'Data scope is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Update basic info if changed
      if (hasBasicInfoChanges) {
        const basicInfoData: UpdateRoleRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          dataScope: formData.dataScope,
        };
        await updateRoleMutation.mutateAsync({ id, data: basicInfoData });
      }

      // Update permissions if changed
      if (hasPermissionChanges) {
        const permissionsData: UpdateRolePermissionsRequest = {
          permissionIds: selectedPermissions,
        };
        await updatePermissionsMutation.mutateAsync({ id, data: permissionsData });
      }

      // Update initial states to reflect saved changes
      if (hasBasicInfoChanges) {
        setInitialFormData(formData);
      }
      if (hasPermissionChanges) {
        setInitialPermissions(selectedPermissions);
      }
    } catch (error) {
      console.error('Update role error:', error);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() !== '' &&
      formData.dataScope !== undefined &&
      formData.dataScope !== null
    );
  }, [formData]);

  // Loading state
  if (isLoadingRole || isLoadingPermissions) {
    return <Loading />;
  }

  // Role not found
  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-gray-500 text-lg">
          {t('notFound') || 'Role not found'}
        </div>
        <Button onClick={() => router.push('/roles')} variant="outline">
          {tCommon('back') || 'Back'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/roles/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToDetail') || 'Back to detail'}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            {t('edit.title') || 'Edit Role'}
          </h1>
          <p className="text-muted-foreground">
            {t('edit.subtitle') || 'Update role information and permissions'}
          </p>
        </div>
      </div>

      {/* System Role Warning */}
      {role.isSystemRole && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <Badge variant="warning" className="mb-1">
                {t('systemRole') || 'System Role'}
              </Badge>
              <p className="text-sm text-yellow-800 font-medium">
                Đây là vai trò hệ thống. Chỉnh sửa cẩn thận!
              </p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('sections.basicInfo') || 'Basic Information'}
          </h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                {t('fields.name') || 'Name'} <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('placeholders.name') || 'Enter role name'}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                {t('fields.description') || 'Description'}
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('placeholders.description') || 'Enter role description (optional)'}
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            {/* Data Scope */}
            <div>
              <label htmlFor="dataScope" className="block text-sm font-medium mb-2">
                {t('fields.dataScope') || 'Data Scope'} <span className="text-red-500">*</span>
              </label>
              <select
                id="dataScope"
                value={formData.dataScope}
                onChange={(e) => handleChange('dataScope', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.dataScope ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {dataScopeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(`dataScope.${option.value}`) || option.label}
                  </option>
                ))}
              </select>
              {errors.dataScope && (
                <p className="text-red-500 text-sm mt-1">{errors.dataScope}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Permissions */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              {t('sections.permissions') || 'Permissions'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('sections.permissionsDescription') || 'Select permissions for this role'}
            </p>
            {selectedPermissions.length > 0 && (
              <p className="text-sm text-primary mt-2">
                {selectedPermissions.length} {t('permissionsSelected') || 'permissions selected'}
              </p>
            )}
          </div>

          {permissionsByModule.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t('noPermissionsAvailable') || 'No permissions available'}
            </p>
          ) : (
            <div className="space-y-3">
              {permissionsByModule.map((module) => {
                const isExpanded = expandedModules[module.module] ?? false;
                const isFullySelected = isModuleFullySelected(module);
                const isPartiallySelected = isModulePartiallySelected(module);

                return (
                  <div
                    key={module.module}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Module Header */}
                    <div className="bg-gray-50 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleModule(module.module)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => toggleModule(module.module)}
                        >
                          <h3 className="font-semibold text-base">
                            {t(`modules.${module.module}`) || module.module}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {module.permissions.length} {t('permissions') || 'permissions'}
                          </p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isFullySelected}
                            ref={(input) => {
                              if (input) {
                                input.indeterminate = isPartiallySelected;
                              }
                            }}
                            onChange={() => toggleModulePermissions(module)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium">
                            {t('selectAll') || 'Select All'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Module Permissions */}
                    {isExpanded && (
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {module.permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-start gap-2 p-3 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">
                                  {t(`permissions.${permission.code}`) || permission.name}
                                </div>
                                {permission.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {permission.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href={`/roles/${id}`}>
            <Button type="button" variant="outline">
              {tCommon('cancel') || 'Cancel'}
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={
              !isFormValid ||
              (!hasBasicInfoChanges && !hasPermissionChanges) ||
              updateRoleMutation.isPending ||
              updatePermissionsMutation.isPending
            }
          >
            <Save className="mr-2 h-4 w-4" />
            {updateRoleMutation.isPending || updatePermissionsMutation.isPending
              ? (tCommon('saving') || 'Saving...')
              : (t('edit.submit') || 'Save Changes')}
          </Button>
        </div>
      </form>
    </div>
  );
}
