'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation' 
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'


const formSchema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export function LoginForm() {
  const router = useRouter();
  const { user, loading } = useAuth(); 
  const [isLoading , setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast.success("Login successful");
      router.push("/bugs");
      form.reset();
    } catch (error: any) {
      console.error('Login failed:', error);

      let errorMessage = 'Login failed. Please try again.';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Account temporarily locked due to many failed attempts';
          break;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    if (!loading && user) {
      router.push('/profile');
    }
  }, [user, loading, router]);
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
                <Input placeholder="your@email.com" {...field} />
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

        <Button type="submit"  className="w-full"  disabled={isLoading} >
          Login
        </Button>
       <div className='text-center'>
        <small className='text-sm loading-none font-medium '>Don't have an account? <Link className='text-amber-100' href={"/signup"}>Create Account</Link></small>
       </div>
      </form>
   
      
    </Form>
  )
}

// try {
//         const body = { email: values.email, password:values.password}
//         const config = {
//            headers: {
//               'Content-Type': 'application/json'
//            }
//         }
        
//       const userData  = await axios.post("/api/auth/login", body ,config );  
//       console.log(userData)
      
//       setIsLoading(false);
//       toast.success("Account created successfully");
//       router.push("/feed")
//       reset();
      
      
      
//     } catch (error:any) {
//       setErrorMessage(error.response.data.error)
//       setIsLoading(false);
//       console.error('Login failed:', error)
//     }
//   }
//   if(errorMessage) {
//     toast.error(errorMessage);
//     setErrorMessage(null);
//   }