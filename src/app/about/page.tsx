'use client';

import React from 'react';
import { 
  Search, 
  MessageSquare, 
  Bot, 
  Zap, 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink,
  Code,
  Database,
  Palette,
  Cpu,
  Globe,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface TechStackItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface RoadmapItem {
  title: string;
  status: 'planned' | 'development' | 'future';
}

const AboutPage: React.FC = () => {
  const features: Feature[] = [
    {
      icon: Search,
      title: "Bug Posting",
      description: "Post bugs with relevant code, screenshots, and detailed context"
    },
    {
      icon: MessageSquare,
      title: "Crowd Answers",
      description: "Get solutions from the community with upvotes and downvotes"
    },
    {
      icon: Bot,
      title: "AI Suggestions",
      description: "Instant AI-powered debugging suggestions for faster resolution"
    },
    {
      icon: Zap,
      title: "Fast UI",
      description: "Clean, responsive interface with instant feedback and smooth interactions"
    }
  ];

  const techStack: TechStackItem[] = [
    { name: "React", icon: Code },
    { name: "Next.js", icon: Globe },
    { name: "Firebase", icon: Database },
    { name: "OpenAI API", icon: Bot },
    { name: "TailwindCSS", icon: Palette },
    { name: "TypeScript", icon: Cpu }
  ];

  const roadmapItems: RoadmapItem[] = [
    { title: "Google Auth", status: "planned" },
    { title: "Forgot Password", status: "planned" },
    { title: "BroSolve 2.0 with better AI", status: "development" },
    { title: "Problem clustering", status: "development" },
    { title: "Debug sessions & issue tracking", status: "future" }
  ];

  const getStatusStyles = (status: RoadmapItem['status']): string => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'development':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'future':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'planned':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'development':
        return <Cpu className="w-5 h-5 text-purple-600" />;
      case 'future':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: RoadmapItem['status']): string => {
    switch (status) {
      case 'planned':
        return 'Planned';
      case 'development':
        return 'In Development';
      case 'future':
        return 'Future';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              About BroSolve
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A real-time AI + crowd-powered debugging platform built for Indian developers
            </p>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why BroSolve Exists</h2>
          <p className="text-lg text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
            As developers, we often hit bugs that are either very specific to Indian contexts (bad internet, platform differences, Jio vs Airtel latency etc.) or ignored on global platforms like StackOverflow. <span className="font-semibold text-blue-600">BroSolve fills that gap.</span>
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What BroSolve Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 p-6"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-4 mx-auto">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Built With</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {techStack.map((tech, index) => {
              const IconComponent = tech.icon;
              return (
                <div 
                  key={index}
                  className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                >
                  <IconComponent className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-semibold text-gray-700">{tech.name}</span>
                </div>
              );
            })}
          </div>
          {/* <p className="text-center text-gray-600">
            Designed with AI collaboration <span className="font-semibold">(Claude, ChatGPT)</span>
          </p> */}
        </div>
      </div>

      {/* Creator Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Who Built It</h2>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Photo Placeholder */}
            <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-16 h-16 text-white" />
              
            </div>
            <div className="text-center md:text-left">      
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Mohammad Imran</h3>
              <p className="text-gray-600 mb-4 max-w-md">
                Passionate about solving real-world problems with code and building tools that make developers&apos; lives easier.
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <a 
                  href="https://www.linkedin.com/in/imran-mohammad-360a2122a/" 
                  className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all duration-300"
                  aria-label="Mohammad Imran's LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700 font-semibold">LinkedIn</span>
                </a>
                <a 
                  href="https://github.com/MrMi18" 
                  className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all duration-300"
                  aria-label="Mohammad Imran's GitHub Profile"
                >
                  <Github className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-700 font-semibold">GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What&apos;s Coming Next</h2>
          <div className="space-y-4">
            {roadmapItems.map((item, index) => (
              <div 
                key={index}
                className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                <span className="text-gray-700 font-medium">{item.title}</span>
                <div className="flex-grow"></div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyles(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 pb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Want to Connect?</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Got suggestions, want to contribute or just want to say hi? We&apos;d love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="mailto:imran.mohd1910@gmail.com" 
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              aria-label="Send email to BroSolve team"
            >
              <Mail className="w-5 h-5" />
              <span>Send Email</span>
            </a>
            <a 
              href="https://github.com/MrMi18/broSolve" 
              className="flex items-center justify-center space-x-2 px-8 py-3 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              aria-label="View BroSolve GitHub Repository"
            >
              <Github className="w-5 h-5" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;