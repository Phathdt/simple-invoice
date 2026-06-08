import { BrandLogo } from '@/components/app-header'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/features/auth/hooks/use-login'

export function LoginPage() {
  const { register, errors, submit, isPending, isError } = useLogin()

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted px-4'>
      <div className='w-full max-w-sm'>
        <div className='mb-8 flex flex-col items-center gap-2 text-center'>
          <BrandLogo centered />
          <p className='text-sm text-muted-foreground'>Sign in to your account</p>
        </div>

        <Card>
          <CardContent className='p-8'>
            <form onSubmit={submit} className='space-y-5' noValidate>
              <div className='space-y-1.5'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  autoComplete='email'
                  placeholder='you@example.com'
                  data-testid='login-email'
                  {...register('email')}
                />
                {errors.email && (
                  <p className='flex items-center gap-1 text-xs text-destructive'>
                    <svg className='h-3.5 w-3.5 shrink-0' viewBox='0 0 20 20' fill='currentColor'>
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z'
                        clipRule='evenodd'
                      />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  autoComplete='current-password'
                  placeholder='••••••••'
                  data-testid='login-password'
                  {...register('password')}
                />
                {errors.password && (
                  <p className='flex items-center gap-1 text-xs text-destructive'>
                    <svg className='h-3.5 w-3.5 shrink-0' viewBox='0 0 20 20' fill='currentColor'>
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z'
                        clipRule='evenodd'
                      />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {isError && (
                <div
                  data-testid='login-error'
                  className='flex items-center gap-2 rounded-md bg-red-50 px-3.5 py-3 text-sm text-red-700'
                >
                  <svg className='h-4 w-4 shrink-0' viewBox='0 0 20 20' fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Email or password is incorrect
                </div>
              )}

              <Button type='submit' disabled={isPending} data-testid='login-submit' className='w-full'>
                {isPending ? (
                  <>
                    <Spinner />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
