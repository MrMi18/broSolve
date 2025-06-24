'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const formSchema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export function SignupForm() {
  const [isLoading , setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  })
  async function onSubmit(values: z.infer<typeof formSchema>) {   
    setIsLoading(true);
  try {
      await createUserWithEmailAndPassword(auth, values.email, values.password)
      toast.success("Account created successfully")
      router.push("/onboarding")
      form.reset()
    } catch (error: unknown) {
      console.error('Signup failed:', error)
      let errorMessage = 'Signup failed. Please try again.'
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const errorObj = error as { code: string };
        if (errorObj.code === 'auth/email-already-in-use') {
          errorMessage = 'Email already in use'
        } else if (errorObj.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters'
        }
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field}  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          Sign Up
        </Button>
         <div className='text-center'>
        <small className='text-sm loading-none font-medium '>Already have an account? <Link className='text-amber-100' href={"/login"}>Login</Link></small>
       </div>
      </form>
    </Form>
  )
}



  //   try {
  //     const config = {
  //          headers: {
  //             'Content-Type': 'application/json'
  //          }
  //       }
  //       const body = {email:values.email, password:values.password}
  //     const userData = await axios.post("/api/auth/signup",
  //       body,
  //       config
  //     )
  //     console.log(userData)
  //     setIsLoading(false);
  //     toast.success("Account created successfully");
  //     router.push("/feed")
  //     reset();
  //   } catch (error:any) {
  //     console.error('Signup failed:', error);
  //     setErrorMessage(error?.response?.data?.error)
  //     setIsLoading(false);
  //   }
  // }
  //  if(errorMessage) {
  //   toast.error(errorMessage);
  //   setErrorMessage(null);
  // }