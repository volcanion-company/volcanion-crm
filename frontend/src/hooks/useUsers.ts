import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { toast } from '@/lib/toast';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  PaginationParams,
  UserStatus,
} from '@/types';

const USERS_QUERY_KEY = 'users';

// Get all users with filters
export function useUsers(
  params?: PaginationParams & {
    pageNumber?: number;
    status?: UserStatus;
    search?: string;
  }
) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => userService.getUsers(params),
  });
}

// Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success('Tạo người dùng thành công', 'Người dùng đã được tạo và thông tin đăng nhập đã được gửi.');
    },
    onError: (error: Error) => {
      toast.error('Không thể tạo người dùng', error.message || 'Đã xảy ra lỗi khi tạo người dùng.');
    },
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, variables.id] });
      toast.success('Cập nhật người dùng thành công', 'Các thay đổi đã được lưu.');
    },
    onError: (error: Error) => {
      toast.error('Không thể cập nhật người dùng', error.message || 'Đã xảy ra lỗi khi cập nhật người dùng.');
    },
  });
}

// Activate user
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success('Kích hoạt người dùng thành công', 'Người dùng đã có thể đăng nhập.');
    },
    onError: (error: Error) => {
      toast.error('Không thể kích hoạt người dùng', error.message || 'Đã xảy ra lỗi khi kích hoạt người dùng.');
    },
  });
}

// Deactivate user
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success('Vô hiệu hóa người dùng thành công', 'Người dùng không thể đăng nhập.');
    },
    onError: (error: Error) => {
      toast.error('Không thể vô hiệu hóa người dùng', error.message || 'Đã xảy ra lỗi khi vô hiệu hóa người dùng.');
    },
  });
}

// Reset password (Admin)
export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.resetPassword(id),
    onSuccess: (newPassword) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success('Reset mật khẩu thành công', `Mật khẩu tạm thời: ${newPassword}`);
    },
    onError: (error: Error) => {
      toast.error('Không thể reset mật khẩu', error.message || 'Đã xảy ra lỗi khi reset mật khẩu.');
    },
  });
}

// Change password (Self)
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userService.changePassword(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công', 'Mật khẩu của bạn đã được cập nhật.');
    },
    onError: (error: Error) => {
      toast.error('Không thể đổi mật khẩu', error.message || 'Đã xảy ra lỗi khi đổi mật khẩu.');
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success('Xóa người dùng thành công', 'Người dùng đã được xóa vĩnh viễn.');
    },
    onError: (error: Error) => {
      toast.error('Không thể xóa người dùng', error.message || 'Đã xảy ra lỗi khi xóa người dùng.');
    },
  });
}
