import { useMutation, useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.data.token)
    }  })
}

export function useRegister() {
  return useMutation({
    mutationFn: authService.register
  })
}
