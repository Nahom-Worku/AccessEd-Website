import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = { title: 'Create Account' }

export default function RegisterPage() {
  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start mastering your materials with AccessEd</p>
      </div>
      <RegisterForm />
    </div>
  )
}
