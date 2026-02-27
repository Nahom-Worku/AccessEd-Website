import { apiClient } from './client'
import type { TokenResponse, LoginRequest, RegisterRequest, User, UsageLimits } from '@/lib/types/auth'

export async function login(data: LoginRequest): Promise<TokenResponse> {
  return apiClient<TokenResponse>('/auth/login', {
    method: 'POST',
    body: data,
    skipAuth: true,
  })
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  return apiClient<TokenResponse>('/auth/register', {
    method: 'POST',
    body: data,
    skipAuth: true,
  })
}

export async function refreshToken(refresh_token: string): Promise<TokenResponse> {
  return apiClient<TokenResponse>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token },
    skipAuth: true,
  })
}

export async function getMe(): Promise<User> {
  return apiClient<User>('/auth/me')
}

export async function logout(): Promise<void> {
  return apiClient('/auth/logout', { method: 'POST' })
}

export async function logoutAll(): Promise<void> {
  return apiClient('/auth/logout-all', { method: 'POST' })
}

export async function checkEmail(email: string): Promise<{ available: boolean; message: string }> {
  return apiClient('/auth/check-email', {
    method: 'POST',
    body: { email },
    skipAuth: true,
  })
}

export async function checkUsername(username: string): Promise<{ available: boolean; message: string }> {
  return apiClient('/auth/check-username', {
    method: 'POST',
    body: { username },
    skipAuth: true,
  })
}

export async function sendVerification(): Promise<{ success: boolean; message: string }> {
  return apiClient('/auth/send-verification', { method: 'POST' })
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  return apiClient('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    skipAuth: true,
  })
}

export async function completeOnboarding(): Promise<{ success: boolean; message: string }> {
  return apiClient('/auth/complete-onboarding', { method: 'POST' })
}

export async function getUsageLimits(): Promise<UsageLimits> {
  return apiClient<UsageLimits>('/auth/usage-limits')
}
