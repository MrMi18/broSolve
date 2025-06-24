'use client'
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { Bug, Code2, Tag, FileText, Loader2, ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(8, 'Title must be at least 8 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  tags: z.string()
});

type FormValues = z.infer<typeof formSchema>;

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, children, icon: Icon }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </label>
    {children}
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
        {error}
      </p>
    )}
  </div>
);

const Submit: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
    }
  });

  const onSubmit = async (data: FormValues): Promise<void> => {
    try {
      const userToken = await auth.currentUser?.getIdToken();
      setIsLoading(true);
      const body = {
        title: data.title,
        description: data.description,
        tags: data.tags
      };
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      };
      await axios.post('/api/bugs/new', body, config);
      toast.success('Bug submitted!');
      form.reset();
      router.push('/bugs');
    } catch (error: unknown) {
      console.error(error);
      toast.error((error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !loading){
      toast.info("Please login to submit bug");
      router.push('/login');
    } 
    
  }, [user, loading, router]);

  const { register, handleSubmit, formState: { errors }, watch } = form;
  const watchedTitle = watch('title', '');
  const watchedDescription = watch('description', '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Bug className="w-5 h-5 text-white" />  
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Submit Bug </h1>
                <p className="text-sm text-gray-500">Share your bugs and get solutions from developers & AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step 1 of 1</span>
              <span>Required fields *</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-1 rounded-full w-full transition-all duration-500"></div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
            <div className="space-y-6">
              {/* Title Field */}
              <FormField label="Bug Title *" error={errors.title?.message} icon={FileText}>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="Brief, descriptive title for your bug report"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none text-gray-900 placeholder-gray-400"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {watchedTitle.length}/100 characters
                </div>
              </FormField>

              {/* Description Field */}
              <FormField label="Detailed Description *" error={errors.description?.message} icon={Code2}>
                <textarea
                  {...register('description')}
                  placeholder="Provide detailed steps to reproduce, expected behavior, actual behavior, and any error messages..."
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {watchedDescription.length}/2000 characters • Include steps to reproduce, expected vs actual behavior
                </div>
              </FormField>

              {/* Tags Field */}
              <FormField label="Tags" icon={Tag}>
                <input
                  type="text"
                  {...register('tags')}
                  placeholder="ui, authentication, crash, performance"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none text-gray-900 placeholder-gray-400"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Separate tags with commas. Popular tags: ui, auth, crash, performance, mobile, api
                </div>
              </FormField>

              {/* Quick Tips */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Tips for better bug reports
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Include browser/device information</li>
                 {/*  screenshots or  */}
                  <li>• Add code snippets if relevant</li> 
                  <li>• Describe what you expected vs what actually happened</li>
                  <li>• List steps to reproduce the issue</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Bug Report...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Bug className="w-5 h-5" />
                      <span>Submit Bug Report</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Help */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Need help? Check out our{' '}
              {/* <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300">
                bug reporting guidelines
              </button>{' '}
              or browse{' '} */}
              <button onClick={()=>router.push("/bugs")} className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 cursor-pointer">
                similar issues
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;