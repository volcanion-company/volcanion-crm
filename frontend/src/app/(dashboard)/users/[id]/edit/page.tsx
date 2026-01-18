'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import type { UpdateUserRequest, UserStatus } from '@/types';
import { useTranslations } from 'next-intl';

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors: Record<UserStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  0: 'success', // Active
  1: 'warning', // Inactive
  2: 'danger',  // Deleted
};

const statusLabels: Record<UserStatus, string> = {
  0: 'Đang hoạt động',
  1: 'Không hoạt động',
  2: 'Đã xóa',
};

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: user, isLoading: userLoading } = useUser(id);
  const updateMutation = useUpdateUser();
  const t = useTranslations('users');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    timeZone: '',
    culture: 'vi-VN',
    roleIds: [],
  });

  const [roleIdsInput, setRoleIdsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialFormData, setInitialFormData] = useState<UpdateUserRequest | null>(null);

  // Pre-populate form data when user is loaded
  useEffect(() => {
    if (user) {
      const userData: UpdateUserRequest = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        timeZone: user.timeZone || '',
        culture: user.culture || 'vi-VN',
        roleIds: user.roles || [],
      };
      
      setFormData(userData);
      setInitialFormData(userData);
      setRoleIdsInput((user.roles || []).join(', '));
    }
  }, [user]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!initialFormData) return false;

    // Parse current roleIds from input
    const currentRoleIds = roleIdsInput
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '');

    return (
      formData.firstName !== initialFormData.firstName ||
      formData.lastName !== initialFormData.lastName ||
      formData.phone !== initialFormData.phone ||
      formData.timeZone !== initialFormData.timeZone ||
      formData.culture !== initialFormData.culture ||
      JSON.stringify(currentRoleIds.sort()) !== JSON.stringify((initialFormData.roleIds || []).sort())
    );
  }, [formData, roleIdsInput, initialFormData]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName) {
      newErrors.firstName = 'Họ là bắt buộc';
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Tên là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Parse roleIds from comma-separated string
    const roleIds = roleIdsInput
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '');

    // Prepare data
    const submitData: UpdateUserRequest = {
      ...formData,
      roleIds: roleIds.length > 0 ? roleIds : undefined,
    };

    try {
      await updateMutation.mutateAsync({ id, data: submitData });
      router.push(`/users/${id}`);
    } catch (error) {
      // Error handled by mutation
      console.error('Update user error:', error);
    }
  };

  const handleChange = (field: keyof UpdateUserRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isFormValid = useMemo(() => {
    return formData.firstName && formData.lastName;
  }, [formData]);

  // Loading state
  if (userLoading) {
    return <Loading />;
  }

  // User not found
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-gray-500 text-lg">Không tìm thấy người dùng</div>
        <Button onClick={() => router.push('/users')} variant="outline">
          {tCommon('back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/users/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon('back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa người dùng</h1>
          <p className="text-muted-foreground">Cập nhật thông tin người dùng</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Trạng thái hiện tại</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
            <Badge variant={statusColors[user.status || 0]}>
              {statusLabels[user.status || 0]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Email: <span className="font-medium">{user.email}</span>
          </p>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Họ <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Nguyễn"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tên <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Văn A"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+84 xxx xxx xxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Múi giờ
              </label>
              <Input
                value={formData.timeZone || ''}
                onChange={(e) => handleChange('timeZone', e.target.value)}
                placeholder="Asia/Ho_Chi_Minh"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Ngôn ngữ
              </label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.culture}
                onChange={(e) => handleChange('culture', e.target.value)}
              >
                <option value="vi-VN">Tiếng Việt (vi-VN)</option>
                <option value="en-US">English (en-US)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Role Assignment */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Phân quyền</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Role IDs
            </label>
            <Input
              value={roleIdsInput}
              onChange={(e) => setRoleIdsInput(e.target.value)}
              placeholder="role-guid-1, role-guid-2..."
            />
            <p className="text-sm text-muted-foreground mt-2">
              Nhập Role IDs, cách nhau bởi dấu phẩy. VD: guid1,guid2
            </p>
            {user.roles && user.roles.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Role hiện tại:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.roles.map((roleId: string, index: number) => (
                    <Badge key={index} variant="default">
                      {roleId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={!isFormValid || !hasChanges || updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? 'Đang cập nhật...' : tCommon('save')}
          </Button>
          <Link href={`/users/${id}`}>
            <Button type="button" variant="outline">
              {tCommon('cancel')}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
