import { httpClient } from '@/lib/http-client';
import type { 
  Role, 
  Permission, 
  PermissionModule,
  CreateRoleRequest, 
  UpdateRoleRequest,
  UpdateRolePermissionsRequest,
  ApiResponse,
} from '@/types';

const BASE_URL = '/roles';

/**
 * Get all roles
 */
export async function getRoles(): Promise<Role[]> {
  const response = await httpClient.get<ApiResponse<Role[]>>(BASE_URL);
  return response.data;
}

/**
 * Get role by ID with full permissions
 */
export async function getRole(id: string): Promise<Role> {
  const response = await httpClient.get<ApiResponse<Role>>(`${BASE_URL}/${id}`);
  return response.data;
}

/**
 * Get all available permissions (grouped by module)
 */
export async function getPermissions(): Promise<PermissionModule[]> {
  const response = await httpClient.get<ApiResponse<PermissionModule[]>>(`${BASE_URL}/permissions`);
  return response.data;
}

/**
 * Create new role
 */
export async function createRole(data: CreateRoleRequest): Promise<Role> {
  // Remove empty fields
  const cleanData = {
    ...data,
    description: data.description || undefined,
    permissionIds: data.permissionIds && data.permissionIds.length > 0 ? data.permissionIds : undefined,
  };

  const response = await httpClient.post<ApiResponse<Role>>(BASE_URL, cleanData);
  return response.data;
}

/**
 * Update role (name, description, dataScope)
 */
export async function updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
  // Remove empty fields
  const cleanData: UpdateRoleRequest = {};
  if (data.name) cleanData.name = data.name;
  if (data.description) cleanData.description = data.description;
  if (data.dataScope !== undefined) cleanData.dataScope = data.dataScope;

  const response = await httpClient.put<ApiResponse<Role>>(`${BASE_URL}/${id}`, cleanData);
  return response.data;
}

/**
 * Update role permissions (replaces all permissions)
 */
export async function updateRolePermissions(
  id: string, 
  data: UpdateRolePermissionsRequest
): Promise<void> {
  await httpClient.put<ApiResponse<void>>(
    `${BASE_URL}/${id}/permissions`, 
    data
  );
}

/**
 * Delete role (soft delete)
 */
export async function deleteRole(id: string): Promise<void> {
  await httpClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
}
