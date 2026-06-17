import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  fullName: string
  username: string
  email: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
  status: 'active' | 'inactive' | 'pending'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      // Persist to localStorage for session persistence
      localStorage.setItem('auth_token', action.payload.token)
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user))
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('auth_user')
      if (token && userStr) {
        try {
          state.token = token
          state.user = JSON.parse(userStr)
          state.isAuthenticated = true
        } catch (e) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      }
    }
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, initializeAuth } = authSlice.actions
export default authSlice.reducer
