'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import type { CreateUserRequest } from '@/types';
import { useTranslations } from 'next-intl';

// Password strength validation
const calculatePasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; color: string; text: string } => {
  if (!password) return { strength: 'weak', color: 'text-gray-400', text: '' };
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character type checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) {
    return { strength: 'weak', color: 'text-red-500', text: 'Yếu' };
  } else if (score <= 4) {
    return { strength: 'medium', color: 'text-yellow-500', text: 'Trung bình' };
  } else {
    return { strength: 'strong', color: 'text-green-500', text: 'Mạnh' };
  }
};

export default function NewUserPage() {
  const router = useRouter();
  const createMutation = useCreateUser();
  const t = useTranslations('users');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<CreateUserRequest & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    timeZone: '',
    culture: 'vi-VN',
    roleIds: [],
  });

  const [roleIdsInput, setRoleIdsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength
  const passwordStrength = useMemo(() => calculatePasswordStrength(formData.password), [formData.password]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/[a-z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ cái thường';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ cái viết hoa';
    }
    if (!/[0-9]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ số';
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    }
    return null;
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

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

    // Remove confirmPassword and prepare data
    const { confirmPassword, ...submitData } = formData;
    const cleanData: CreateUserRequest = {
      ...submitData,
      roleIds: roleIds.length > 0 ? roleIds : undefined,
    };

    try {
      await createMutation.mutateAsync(cleanData);
      router.push('/users');
    } catch (error) {
      // Error handled by mutation
      console.error('Create user error:', error);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
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
    return (
      formData.email &&
      validateEmail(formData.email) &&
      formData.password &&
      !validatePassword(formData.password) &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      formData.firstName &&
      formData.lastName
    );
  }, [formData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon('back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('create.title')}</h1>
          <p className="text-muted-foreground">{t('create.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                className={errors.password ? 'border-red-500' : ''}
              />
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.strength === 'weak'
                          ? 'bg-red-500 w-1/3'
                          : passwordStrength.strength === 'medium'
                          ? 'bg-yellow-500 w-2/3'
                          : 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
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
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={!isFormValid || createMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending ? 'Đang tạo...' : tCommon('create')}
          </Button>
          <Link href="/users">
            <Button type="button" variant="outline">
              {tCommon('cancel')}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
