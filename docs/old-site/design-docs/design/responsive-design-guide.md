# GWTH.ai Responsive Design Guide

## Overview
This guide ensures consistent, accessible, and performant experiences across all devices while maintaining our glassmorphic design aesthetic.

## Breakpoint System

### Tailwind CSS Breakpoints
```css
/* Mobile First Approach */
/* Default: 0px - 639px (Mobile) */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Laptops */
2xl: 1536px /* Large screens */
```

### Custom Breakpoints for Components
```css
/* Component-specific breakpoints */
navigation: 768px   /* Hamburger menu threshold */
sidebar: 1024px     /* Sidebar collapse point */
grid: 640px         /* Grid layout changes */
```

## Device-Specific Design Patterns

### Mobile (< 640px)

#### Layout Patterns
```
┌─────────────────────────────┐
│         Header              │ <- Fixed, 56px height
├─────────────────────────────┤
│                             │
│                             │
│       Main Content          │ <- Full width, padding 16px
│                             │
│                             │
├─────────────────────────────┤
│    Bottom Navigation        │ <- Fixed, 60px height
└─────────────────────────────┘
```

#### Navigation
- **Header**: Logo + hamburger menu
- **Sidebar**: Full-screen overlay when open
- **Bottom Nav**: Sticky tab bar for main sections

#### Content Layout
- **Single column** for all content
- **Stack cards** vertically
- **Full-width** buttons and forms
- **16px** horizontal padding

#### Typography Scale (Mobile)
```css
h1: 32px (2rem)
h2: 28px (1.75rem)
h3: 24px (1.5rem)
h4: 20px (1.25rem)
body: 16px (1rem)
small: 14px (0.875rem)
```

### Tablet (640px - 1024px)

#### Layout Patterns
```
┌─────────────────────────────────────────────┐
│                 Header                      │ <- Fixed, 64px
├─────────────────────────────────────────────┤
│                                             │
│            Main Content                     │ <- 2-column grid
│  ┌─────────────────┐ ┌─────────────────┐   │
│  │                 │ │                 │   │
│  │   Primary       │ │   Secondary     │   │
│  │   Content       │ │   Content       │   │
│  │                 │ │                 │   │
│  └─────────────────┘ └─────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

#### Navigation
- **Horizontal menu** with collapsed secondary items
- **Sidebar**: Overlay on smaller tablets, persistent on larger
- **Breadcrumbs**: Visible for deep navigation

#### Content Layout
- **2-column grid** for cards
- **Sidebar content** in panels or modals
- **24px** horizontal padding

### Desktop (> 1024px)

#### Layout Patterns
```
┌─────────────────────────────────────────────────────────────┐
│                          Header                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐ ┌─────────────────────────────┐ ┌─────────┐   │
│  │         │ │                             │ │         │   │
│  │ Sidebar │ │        Main Content         │ │ Aside   │   │
│  │         │ │                             │ │         │   │
│  │         │ │  ┌─────────┐ ┌─────────┐   │ │         │   │
│  │         │ │  │ Card 1  │ │ Card 2  │   │ │         │   │
│  │         │ │  └─────────┘ └─────────┘   │ │         │   │
│  │         │ │                             │ │         │   │
│  │         │ │  ┌─────────┐ ┌─────────┐   │ │         │   │
│  │         │ │  │ Card 3  │ │ Card 4  │   │ │         │   │
│  │         │ │  └─────────┘ └─────────┘   │ │         │   │
│  └─────────┘ └─────────────────────────────┘ └─────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Navigation
- **Full horizontal menu** with all items visible
- **Persistent sidebar** for secondary navigation
- **Hover effects** and tooltips enabled

#### Content Layout
- **3-4 column grid** for cards
- **Sidebar + main + aside** layout
- **Max-width container** (1280px) with centered content

## Component Responsive Behavior

### Navigation Component

#### Mobile Behavior
```tsx
// Mobile navigation with hamburger
<nav className="fixed top-0 w-full bg-dark-900/80 backdrop-blur-xl z-50">
  <div className="flex items-center justify-between h-14 px-4">
    <Logo />
    <HamburgerButton onClick={toggleMobileMenu} />
  </div>
  
  {/* Full-screen overlay menu */}
  <MobileMenu isOpen={isMobileMenuOpen} />
</nav>
```

#### Desktop Behavior
```tsx
// Desktop navigation with full menu
<nav className="fixed top-0 w-full bg-dark-900/80 backdrop-blur-xl z-50">
  <div className="container mx-auto px-6">
    <div className="flex items-center justify-between h-16">
      <Logo />
      <HorizontalMenu />
      <AuthButtons />
    </div>
  </div>
</nav>
```

### Course Grid

#### Responsive Grid Classes
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {courses.map(course => (
    <CourseCard key={course.id} course={course} />
  ))}
</div>
```

### Dashboard Layout

#### Mobile Stack
```tsx
<div className="space-y-6 p-4">
  <WelcomeSection />
  <StreakCard />
  <ProgressCard />
  <QuickStats />
  <MyCourses />
</div>
```

#### Desktop Grid
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
  <div className="lg:col-span-2 space-y-6">
    <WelcomeSection />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StreakCard />
      <QuickStats />
    </div>
    <MyCourses />
  </div>
  <div className="space-y-6">
    <ProgressCard />
    <RecentActivity />
  </div>
</div>
```

## Touch and Interaction Guidelines

### Touch Targets
- **Minimum size**: 44px × 44px (iOS guideline)
- **Preferred size**: 48px × 48px (Material Design)
- **Spacing**: 8px minimum between touch targets

### Gesture Support
```tsx
// Course card with touch gestures
<motion.div
  whileTap={{ scale: 0.98 }}
  className="cursor-pointer touch-manipulation"
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
  <CourseCard />
</motion.div>
```

### Hover vs Touch States
```css
/* Desktop hover effects */
@media (hover: hover) {
  .course-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--neon-cyan-glow);
  }
}

/* Touch device active states */
@media (hover: none) {
  .course-card:active {
    transform: scale(0.98);
  }
}
```

## Performance Optimizations

### Image Responsive Loading
```tsx
<Image
  src={course.thumbnail}
  alt={course.title}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  width={400}
  height={225}
  loading="lazy"
  placeholder="blur"
/>
```

### Code Splitting by Breakpoint
```tsx
// Lazy load desktop-only components
const DesktopSidebar = dynamic(() => import('./DesktopSidebar'), {
  ssr: false,
})

const MobileSidebar = dynamic(() => import('./MobileSidebar'), {
  ssr: false,
})

// Conditional rendering based on breakpoint
{isDesktop ? <DesktopSidebar /> : <MobileSidebar />}
```

### Progressive Enhancement
```tsx
// Start with mobile-first base styles
const baseClasses = "p-4 bg-dark-700/60"

// Add desktop enhancements
const enhancedClasses = "lg:p-8 lg:backdrop-blur-xl lg:hover:shadow-neon-cyan"

<div className={cn(baseClasses, enhancedClasses)}>
  {content}
</div>
```

## Typography Responsive Scaling

### Fluid Typography
```css
/* Fluid type scale using clamp() */
h1 {
  font-size: clamp(2rem, 4vw, 4.5rem);
  line-height: 1.1;
}

h2 {
  font-size: clamp(1.75rem, 3vw, 3rem);
  line-height: 1.2;
}

body {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.6;
}
```

### Reading Width Control
```css
/* Optimal reading line length */
.prose {
  max-width: 65ch; /* ~65 characters per line */
  margin: 0 auto;
}

.prose-sm {
  max-width: 55ch; /* Shorter for smaller screens */
}
```

## Video and Media Responsive Behavior

### Video Player Responsive
```tsx
// Responsive video container
<div className="relative aspect-video w-full rounded-lg overflow-hidden">
  <video
    className="absolute inset-0 w-full h-full object-cover"
    controls
    preload="metadata"
  >
    <source src={videoSrc} type="video/mp4" />
  </video>
</div>
```

### Image Gallery Grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {images.map((image, index) => (
    <div key={index} className="aspect-square overflow-hidden rounded-lg">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover hover:scale-110 transition-transform"
      />
    </div>
  ))}
</div>
```

## Form Responsive Design

### Mobile-First Forms
```tsx
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      placeholder="First Name"
      className="w-full h-12" // Larger touch targets
    />
    <Input
      placeholder="Last Name"
      className="w-full h-12"
    />
  </div>
  
  <Input
    type="email"
    placeholder="Email"
    className="w-full h-12"
  />
  
  <Button className="w-full h-12 md:w-auto md:h-10">
    Submit
  </Button>
</form>
```

## Dark Mode Responsive Considerations

### Media Query Support
```css
/* Respect system preference */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0A0A0B;
    --text-primary: #E5E5F0;
  }
}

/* Override for forced light mode */
[data-theme="light"] {
  --bg-primary: #FFFFFF;
  --text-primary: #212529;
}
```

## Accessibility Responsive Features

### Focus Management
```css
/* Larger focus indicators on mobile */
@media (max-width: 640px) {
  .focus-visible:focus {
    outline: 3px solid #00BCD4;
    outline-offset: 3px;
  }
}

@media (min-width: 641px) {
  .focus-visible:focus {
    outline: 2px solid #00BCD4;
    outline-offset: 2px;
  }
}
```

### Text Scaling Support
```css
/* Support for user text scaling preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Strategy

### Breakpoint Testing
- Test all major breakpoints in browser dev tools
- Use device simulation for touch interactions
- Verify glassmorphic effects work across devices
- Check performance on lower-end devices

### Real Device Testing
- Test on actual iOS and Android devices
- Verify touch targets and gesture interactions
- Check text readability and contrast
- Validate form submission and navigation flows