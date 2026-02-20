# GWTH.ai Design Implementation Guide

## Overview
This guide bridges our design system with practical implementation using TypeScript, React, shadcn/ui, Tailwind CSS, and Chakra UI.

## Technology Integration

### Core UI Stack
- **shadcn/ui**: Primary component library (buttons, forms, dialogs, etc.)
- **Tailwind CSS**: Utility-first styling system
- **Chakra UI**: Supplementary components for specific frontend needs
- **Ant Design**: Admin panel and backend interfaces only

## Tailwind Configuration

### Custom Theme Setup
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#00BCD4',
          light: '#4DD0E1',
          dark: '#0097A7',
        },
        secondary: {
          purple: '#7C4DFF',
          pink: '#FF4081',
          green: '#00E676',
        },
        // Dark Mode Neutrals
        dark: {
          900: '#0A0A0B',
          800: '#141417',
          700: '#1E1E23',
          600: '#2A2A31',
          500: '#6B6B7B',
          400: '#9B9BAB',
          300: '#CBCBDB',
          200: '#E5E5F0',
          100: '#F5F5FA',
        },
        // Semantic Colors
        success: '#00E676',
        warning: '#FFD600',
        error: '#FF5252',
        info: '#00BCD4',
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 188, 212, 0.5), 0 0 40px rgba(0, 188, 212, 0.3)',
        'neon-purple': '0 0 20px rgba(124, 77, 255, 0.5), 0 0 40px rgba(124, 77, 255, 0.3)',
        'neon-pink': '0 0 20px rgba(255, 64, 129, 0.5), 0 0 40px rgba(255, 64, 129, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

## Component Patterns

### Glassmorphism Card Component
```tsx
// components/ui/glass-card.tsx
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  neonGlow?: 'cyan' | 'purple' | 'pink'
}

export function GlassCard({ children, className, neonGlow }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-dark-700/60 backdrop-blur-xl backdrop-saturate-150",
        "border border-white/10",
        "transition-all duration-300",
        neonGlow && {
          'cyan': 'hover:shadow-neon-cyan',
          'purple': 'hover:shadow-neon-purple',
          'pink': 'hover:shadow-neon-pink',
        }[neonGlow],
        className
      )}
    >
      {children}
    </div>
  )
}
```

### Primary Button with Neon Effect
```tsx
// components/ui/neon-button.tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'purple' | 'pink'
  children: React.ReactNode
}

export function NeonButton({ variant = 'cyan', className, children, ...props }: NeonButtonProps) {
  return (
    <Button
      className={cn(
        "relative px-6 py-3 font-semibold transition-all duration-300",
        {
          'cyan': 'bg-primary text-dark-900 hover:shadow-neon-cyan',
          'purple': 'bg-secondary-purple text-white hover:shadow-neon-purple',
          'pink': 'bg-secondary-pink text-white hover:shadow-neon-pink',
        }[variant],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
```

## Page Layouts

### Homepage Hero Section
```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-dark-900 to-secondary-purple/20" />
      
      {/* Content */}
      <div className="relative z-10">
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-dark-100 mb-6">
              Master AI with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary-purple">
                {" "}GWTH.ai
              </span>
            </h1>
            <p className="text-xl text-dark-300 mb-8">
              Structured, practical, and always current AI education
            </p>
            <div className="flex gap-4 justify-center">
              <NeonButton variant="cyan">Start Learning</NeonButton>
              <Button variant="outline" className="border-dark-600 text-dark-200">
                View Courses
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
```

### Course Card Component
```tsx
// components/course-card.tsx
export function CourseCard({ course }: { course: Course }) {
  return (
    <GlassCard className="group cursor-pointer">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-dark-100 mb-2">
          {course.title}
        </h3>
        <p className="text-dark-400 mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary">{course.duration}</span>
          <span className="text-sm text-dark-500">{course.difficulty}</span>
        </div>
      </div>
    </GlassCard>
  )
}
```

## Responsive Design Patterns

### Mobile-First Grid System
```tsx
// Responsive course grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {courses.map(course => (
    <CourseCard key={course.id} course={course} />
  ))}
</div>
```

### Responsive Navigation
```tsx
// components/navigation.tsx
export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">GWTH.ai</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/courses" className="text-dark-300 hover:text-primary transition-colors">
              Courses
            </a>
            <a href="/pricing" className="text-dark-300 hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="/about" className="text-dark-300 hover:text-primary transition-colors">
              About
            </a>
          </div>
          
          {/* CTA */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-dark-300">
              Sign In
            </Button>
            <NeonButton variant="cyan" className="hidden sm:inline-flex">
              Get Started
            </NeonButton>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

## Admin Panel (Ant Design)

### Admin Dashboard Layout
```tsx
// app/admin/layout.tsx
import { Layout, Menu } from 'antd'
import { ConfigProvider, theme } from 'antd'

const { Header, Sider, Content } = Layout

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00BCD4',
          colorBgContainer: '#1E1E23',
          colorBgLayout: '#141417',
        },
      }}
    >
      <Layout className="min-h-screen">
        <Sider>
          <Menu
            theme="dark"
            mode="inline"
            items={[
              { key: '1', label: 'Dashboard' },
              { key: '2', label: 'Courses' },
              { key: '3', label: 'Users' },
              { key: '4', label: 'Analytics' },
            ]}
          />
        </Sider>
        <Layout>
          <Header className="bg-dark-800 px-6">
            <h1 className="text-xl text-white">Admin Dashboard</h1>
          </Header>
          <Content className="p-6">
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}
```

## Animation Guidelines

### Micro-interactions
```css
/* globals.css */
@layer utilities {
  .animate-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  @keyframes glow {
    from {
      box-shadow: 0 0 10px rgba(0, 188, 212, 0.5);
    }
    to {
      box-shadow: 0 0 20px rgba(0, 188, 212, 0.8);
    }
  }
}
```

### Page Transitions
```tsx
// Using Framer Motion for smooth transitions
import { motion } from 'framer-motion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

## Accessibility Considerations

### Focus States
```css
/* Custom focus styles */
.focus-visible:focus {
  outline: 2px solid #00BCD4;
  outline-offset: 2px;
}
```

### ARIA Labels
```tsx
<NeonButton variant="cyan" aria-label="Start your AI learning journey">
  Get Started
</NeonButton>
```

## Performance Optimizations

### Image Loading
```tsx
import Image from 'next/image'

<Image
  src={course.thumbnail}
  alt={course.title}
  width={400}
  height={225}
  loading="lazy"
  placeholder="blur"
  blurDataURL={course.thumbnailBlur}
/>
```

### Code Splitting
```tsx
// Lazy load heavy components
const CoursePlayer = dynamic(() => import('@/components/course-player'), {
  loading: () => <PlayerSkeleton />,
})
```

## File Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── features/        # Feature-specific components
│   └── admin/           # Admin panel components (Ant Design)
├── styles/
│   ├── globals.css      # Global styles and Tailwind imports
│   └── themes/          # Theme variations
├── lib/
│   └── utils.ts         # Utility functions
└── app/
    ├── (marketing)/     # Public pages
    ├── (app)/           # Authenticated app
    └── admin/           # Admin panel
```

## Next Steps

1. Set up the Tailwind configuration with our custom theme
2. Install and configure shadcn/ui components
3. Create the base layout components
4. Implement the homepage with hero section
5. Build out the course catalog
6. Design the learning interface
7. Set up the admin panel with Ant Design