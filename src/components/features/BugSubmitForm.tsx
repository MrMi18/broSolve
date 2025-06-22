//Bugs sumit form bugs/submit

'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import axios from 'axios'
import { auth } from '@/lib/firebase'

const formSchema = z.object({
  title: z.string().min(8, 'Title must be at least 8 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  tags : z.string()

  
})


type FormValues = z.infer<typeof formSchema>

export default function SubmitBugForm() {
  const router = useRouter()
  const { user ,loading} = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
    
    }
  })
  

  const onSubmit = async (data: FormValues) => {
    try {
      const userToken = await auth.currentUser?.getIdToken()
      setIsLoading(true)
      const body = {
        title:data.title,
        description: data.description ,
        tags: data.tags
      }
        const config = {
           headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}` 
           }
        }
      const response = await axios.post('/api/bugs/new',body ,config)
      toast.success('Bug submitted!')
      form.reset()
      router.push('/bugs')
    } catch (error :any) {
      console.error(error)
      toast.error(error?.response?.data?.error||'Submission failed')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user && !loading) router.push('/login')
      else console.log(user)
  }, [user,loading, router])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Bug title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="ui , auth , crash" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Submitting...' : 'Submit Bug'}
        </Button>
      </form>
    </Form>
  )
}
