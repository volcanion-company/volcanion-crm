import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
  Role, 
  PermissionModule,
  CreateRoleRequest, 
  UpdateRoleRequest,
  UpdateRolePermissionsRequest 
} from '@/types';
import * as roleService from '@/services/role.service';

const ROLES_QUERY_KEY = 'roles';
const PERMISSIONS_QUERY_KEY = 'permissions';

/**
 * Get all roles
 */
export function useRoles() {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: async () => {
      const response = await roleService.getRoles();
      return response.data;
    },
  });
}

/**
 * Get role by ID
 */
export function useRole(id: string) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await roleService.getRole(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Get all permissions
 */
export function usePermissions() {
  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY],
    queryFn: async () => {
      const response = await roleService.getPermissions();
      return response.data;
    },
  });
}

/**
 * Create role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
      toast.success('Tạo vai trò thành công');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Không thể tạo vai trò');
    },
  });
}

/**
 * Update role (name, description, dataScope)
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      roleService.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY, variables.id] });
      toast.success('Cập nhật vai trò thành công');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Không thể cập nhật vai trò');
    },
  });
}

/**
 * Update role permissions
 */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRolePermissionsRequest }) =>
      roleService.updateRolePermissions(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY, variables.id] });
      toast.success('Cập nhật quyền hạn thành công');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Không thể cập nhật quyền hạn');
    },
  });
}

/**
 * Delete role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
      toast.success('Xóa vai trò thành công');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Không thể xóa vai trò');
    },
  });
}
