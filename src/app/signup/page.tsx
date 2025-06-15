import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 border rounded-lg">
        <h1 className="text-2xl font-bold text-center">Create Account</h1>
        <SignupForm />
      </div>
    </div>
  )
}