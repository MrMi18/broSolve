import { LoginForm } from "@/components/auth/LoginForm";


export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 border rounded-lg">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <LoginForm />
      </div>
    </div>
  )
}