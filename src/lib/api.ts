const BASE_URL = '/api/proxy'

export interface UserResponse {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  expiresIn: number
  user: UserResponse
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  return res.json()
}

export async function apiLogin(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  return request<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function apiGetMe(token: string): Promise<ApiResponse<UserResponse>> {
  return request<UserResponse>('/api/v1/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
