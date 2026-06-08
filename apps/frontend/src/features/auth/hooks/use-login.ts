import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'

import { useAuthControllerLogin } from '@/api/generated/auth/auth'
import { setToken } from '@/lib/auth'
import { emailSchema } from '@/lib/validation'

import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type LoginForm = z.infer<typeof loginSchema>

export function useLogin() {
  const navigate = useNavigate()
  const login = useAuthControllerLogin()

  const form = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const submit = form.handleSubmit((data) => {
    login.mutate(
      { data },
      {
        onSuccess: (res) => {
          setToken(res.data.token)
          navigate({ to: '/' })
        },
      },
    )
  })

  return {
    register: form.register,
    errors: form.formState.errors,
    submit,
    isPending: login.isPending,
    isError: login.isError,
  }
}
