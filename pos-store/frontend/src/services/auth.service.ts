import apiClient from '@/lib/api-client';
import { ChangePasswordRequest, LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest, User } from '@/types/api';

export const authService = {
  login: (data: LoginRequest) => 
    apiClient.post<LoginResponse>('/auth/login', data),
    
  register: (data: RegisterRequest) =>
    apiClient.post<User>('/auth/register', data),
    
  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post('/auth/change-password', data),
    
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post('/auth/reset-password', data),
    
  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', { token })
};
