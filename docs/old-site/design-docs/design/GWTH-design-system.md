# GWTH.ai Design System

## Design Philosophy

GWTH.ai embraces a modern, futuristic aesthetic that combines glassmorphism with neon accents to create an engaging, cutting-edge learning environment. The design system prioritizes clarity, accessibility, and visual delight while maintaining professional credibility.

### Core Principles
1. **Clarity First**: Information hierarchy guides users effortlessly
2. **Delightful Interactions**: Smooth animations enhance engagement
3. **Accessible by Default**: WCAG AA compliance minimum
4. **Consistent Experience**: Unified design language across all touchpoints
5. **Performance Conscious**: Beautiful without sacrificing speed

## Color System

### Brand Colors

```css
/* Primary Palette */
--primary-cyan: #00BCD4;
--primary-cyan-light: #4DD0E1;
--primary-cyan-dark: #0097A7;

/* Secondary Palette */
--secondary-purple: #7C4DFF;
--secondary-pink: #FF4081;
--secondary-green: #00E676;

/* Neutral Palette - Dark Mode (Default) */
--neutral-900: #0A0A0B;  /* Background */
--neutral-800: #141417;  /* Surface */
--neutral-700: #1E1E23;  /* Card background */
--neutral-600: #2A2A31;  /* Borders */
--neutral-500: #6B6B7B;  /* Muted text */
--neutral-400: #9B9BAB;  /* Secondary text */
--neutral-300: #CBCBDB;  /* Primary text */
--neutral-200: #E5E5F0;  /* High emphasis text */
--neutral-100: #F5F5FA;  /* Maximum contrast */

/* Neutral Palette - Light Mode */
--light-neutral-100: #FFFFFF;   /* Background */
--light-neutral-200: #F8F9FA;   /* Surface */
--light-neutral-300: #E9ECEF;   /* Card background */
--light-neutral-400: #DEE2E6;   /* Borders */
--light-neutral-500: #ADB5BD;   /* Muted text */
--light-neutral-600: #6C757D;   /* Secondary text */
--light-neutral-700: #495057;   /* Primary text */
--light-neutral-800: #343A40;   /* High emphasis text */
--light-neutral-900: #212529;   /* Maximum contrast */

/* Semantic Colors */
--success: #00E676;
--warning: #FFD600;
--error: #FF5252;
--info: #00BCD4;

/* Glassmorphism Effects */
--glass-bg-dark: rgba(30, 30, 35, 0.6);
--glass-bg-light: rgba(255, 255, 255, 0.6);
--glass-border: rgba(255, 255, 255, 0.1);
```

### Neon Glow Effects

```css
/* Neon Shadows */
--neon-cyan-glow: 0 0 20px rgba(0, 188, 212, 0.5), 
                  0 0 40px rgba(0, 188, 212, 0.3),
                  0 0 60px rgba(0, 188, 212, 0.1);

--neon-purple-glow: 0 0 20px rgba(124, 77, 255, 0.5),
                    0 0 40px rgba(124, 77, 255, 0.3),
                    0 0 60px rgba(124, 77, 255, 0.1);

--neon-pink-glow: 0 0 20px rgba(255, 64, 129, 0.5),
                  0 0 40px rgba(255, 64, 129, 0.3),
                  0 0 60px rgba(255, 64, 129, 0.1);
```

## Typography

### Font Stack

```css
/* Primary Font - Headings */
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Body Font */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace - Code */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
```

### Type Scale

```css
/* Desktop Scale */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Spacing System

```css
/* 8px Grid System */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## Component Library

### Glassmorphic Cards

```css
.glass-card {
  background: var(--glass-bg-dark);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: var(--space-6);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 188, 212, 0.2);
  border-color: rgba(0, 188, 212, 0.3);
}

/* Light mode variant */
.light .glass-card {
  background: var(--glass-bg-light);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
}
```

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-cyan), var(--primary-cyan-dark));
  color: white;
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: 8px;
  font-weight: var(--font-semibold);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  box-shadow: var(--neon-cyan-glow);
  transform: translateY(-1px);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--primary-cyan);
  border: 1px solid var(--primary-cyan);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-ghost:hover {
  background: rgba(0, 188, 212, 0.1);
  box-shadow: var(--neon-cyan-glow);
}
```

### Form Elements

```css
/* Input Field */
.input-field {
  background: var(--glass-bg-dark);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: var(--space-3) var(--space-4);
  color: var(--neutral-200);
  transition: all 0.3s ease;
  width: 100%;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-cyan);
  box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
}

/* Floating Label */
.input-group {
  position: relative;
  margin-top: var(--space-6);
}

.input-label {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  color: var(--neutral-500);
  pointer-events: none;
}

.input-field:focus ~ .input-label,
.input-field:not(:placeholder-shown) ~ .input-label {
  top: -10px;
  left: var(--space-3);
  font-size: var(--text-xs);
  background: var(--neutral-800);
  padding: 0 var(--space-2);
  color: var(--primary-cyan);
}
```

### Navigation

```css
/* Sidebar Navigation */
.nav-sidebar {
  background: var(--glass-bg-dark);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--glass-border);
  width: 280px;
  height: 100vh;
  padding: var(--space-6);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-2);
  border-radius: 8px;
  transition: all 0.3s ease;
  color: var(--neutral-400);
}

.nav-item:hover {
  background: rgba(0, 188, 212, 0.1);
  color: var(--primary-cyan);
}

.nav-item.active {
  background: rgba(0, 188, 212, 0.2);
  color: var(--primary-cyan);
  box-shadow: inset 0 0 0 1px var(--primary-cyan);
}
```

### Progress Indicators

```css
/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--neutral-700);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-cyan), var(--secondary-purple));
  border-radius: 4px;
  position: relative;
  transition: width 0.5s ease;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100px); }
  100% { transform: translateX(100px); }
}

/* Circular Progress */
.progress-circle {
  width: 120px;
  height: 120px;
  position: relative;
}

.progress-circle svg {
  transform: rotate(-90deg);
}

.progress-circle-bg {
  fill: none;
  stroke: var(--neutral-700);
  stroke-width: 8;
}

.progress-circle-fill {
  fill: none;
  stroke: url(#gradient);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 339.292;
  stroke-dashoffset: 339.292;
  transition: stroke-dashoffset 1s ease;
}
```

## Animation System

### Transitions

```css
/* Standard Transitions */
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
--transition-slow: 500ms ease;

/* Easing Functions */
--ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Micro-interactions

```css
/* Hover Lift */
.hover-lift {
  transition: transform var(--transition-base);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* Pulse Animation */
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Glow Pulse */
@keyframes glow-pulse {
  0% { box-shadow: 0 0 5px var(--primary-cyan); }
  50% { box-shadow: 0 0 20px var(--primary-cyan), 0 0 30px var(--primary-cyan); }
  100% { box-shadow: 0 0 5px var(--primary-cyan); }
}

.glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### Page Transitions

```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s var(--ease-out-expo) forwards;
}

/* Stagger Children */
.stagger-children > * {
  opacity: 0;
  animation: fadeInUp 0.5s var(--ease-out-expo) forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }
```

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--screen-sm: 640px;   /* Small tablets */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Small laptops */
--screen-xl: 1280px;  /* Desktops */
--screen-2xl: 1536px; /* Large screens */

/* Media Query Examples */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1140px;
  }
}
```

### Mobile Adaptations

```css
/* Touch-friendly tap targets */
@media (max-width: 768px) {
  .btn-primary,
  .btn-ghost {
    min-height: 48px;
    min-width: 48px;
  }
  
  .nav-sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-base);
  }
  
  .nav-sidebar.open {
    transform: translateX(0);
  }
  
  /* Reduce motion for performance */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Dark/Light Theme Implementation

### Theme Toggle

```javascript
// Theme Context
const ThemeContext = {
  dark: {
    bg: 'var(--neutral-900)',
    surface: 'var(--neutral-800)',
    card: 'var(--neutral-700)',
    text: 'var(--neutral-200)',
    textMuted: 'var(--neutral-500)',
  },
  light: {
    bg: 'var(--light-neutral-100)',
    surface: 'var(--light-neutral-200)',
    card: 'var(--light-neutral-300)',
    text: 'var(--light-neutral-700)',
    textMuted: 'var(--light-neutral-500)',
  }
};
```

### CSS Custom Properties Switch

```css
/* Default to Dark Theme */
:root {
  --theme-bg: var(--neutral-900);
  --theme-surface: var(--neutral-800);
  --theme-card: var(--neutral-700);
  --theme-text: var(--neutral-200);
  --theme-text-muted: var(--neutral-500);
}

/* Light Theme Override */
[data-theme="light"] {
  --theme-bg: var(--light-neutral-100);
  --theme-surface: var(--light-neutral-200);
  --theme-card: var(--light-neutral-300);
  --theme-text: var(--light-neutral-700);
  --theme-text-muted: var(--light-neutral-500);
}
```

## Accessibility Guidelines

### Focus States

```css
/* Custom Focus Styles */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid var(--primary-cyan);
  outline-offset: 2px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.skip-link:focus {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 10px;
  width: auto;
  height: auto;
  padding: var(--space-3) var(--space-4);
  background: var(--primary-cyan);
  color: white;
  border-radius: 8px;
  z-index: 10000;
}
```

### Color Contrast

All text colors meet WCAG AA standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Interactive elements: 3:1 minimum contrast ratio

### Screen Reader Support

```html
<!-- Proper ARIA Labels -->
<button aria-label="Close dialog" class="btn-icon">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Live Regions -->
<div aria-live="polite" aria-atomic="true">
  <div class="notification">Course progress saved</div>
</div>

<!-- Semantic HTML -->
<nav aria-label="Main navigation">...</nav>
<main role="main">...</main>
<aside aria-label="Course sidebar">...</aside>
```

## Performance Optimization

### CSS Architecture

```css
/* Critical CSS - Inline in <head> */
.critical {
  /* Layout */
  /* Above-the-fold styles */
  /* Theme variables */
}

/* Non-critical CSS - Load async */
.non-critical {
  /* Animations */
  /* Below-the-fold components */
  /* Enhancement styles */
}
```

### Animation Performance

```css
/* Use transform and opacity for animations */
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* Enable hardware acceleration */
}

/* Reduce motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Component Examples

### Hero Section
- Glassmorphic background with animated gradient
- Neon text effects for headlines
- Smooth scroll indicators
- Video background with overlay

### Course Cards
- Hover effects with glow
- Progress indicators integrated
- Quick action buttons
- Responsive grid layout

### Video Player
- Custom controls with glassmorphic design
- Chapter markers with preview
- Speed controls with visual feedback
- Full-screen mode with smooth transitions

### Dashboard Widgets
- Real-time data visualization
- Animated progress rings
- Interactive charts with tooltips
- Glassmorphic card containers

## Implementation Guidelines

1. **Start with System Defaults**: Use CSS custom properties for all values
2. **Mobile-First Development**: Build for mobile, enhance for desktop
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Performance Budget**: Keep CSS under 50KB gzipped
5. **Accessibility Testing**: Test with screen readers and keyboard navigation
6. **Cross-Browser Support**: Test in Chrome, Firefox, Safari, and Edge
7. **Documentation**: Comment complex animations and interactions

This design system provides a foundation for creating a cohesive, modern, and accessible learning platform that stands out while maintaining usability and performance.