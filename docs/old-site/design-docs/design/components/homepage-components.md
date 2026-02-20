# Homepage Component Specifications

## Hero Section Component

### Component Name: `HeroSection`

#### Visual Design
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         Master AI with GWTH.ai                         │ <- Gradient text
│                                                         │
│    Structured, practical, and always current           │ <- Muted text
│              AI education                              │
│                                                         │
│     [Start Learning]    [View Courses]                 │ <- Neon buttons
│                                                         │
│  ◦ ◦ ◦  (animated particles)  ◦ ◦ ◦                  │ <- Background
└─────────────────────────────────────────────────────────┘
```

#### Properties
- **Headline**: Customizable main text with gradient effect
- **Subheadline**: Supporting text with muted color
- **CTAs**: Primary and secondary action buttons
- **Background**: Animated gradient mesh with particles

#### Styling Specifications
```css
/* Typography */
Headline: 
  - Font: Inter Bold
  - Size: 72px desktop / 48px mobile
  - Line height: 1.1
  - Gradient: linear-gradient(to right, #00BCD4, #7C4DFF)

Subheadline:
  - Font: Inter Regular  
  - Size: 24px desktop / 18px mobile
  - Color: #9B9BAB (dark-400)
  - Line height: 1.5

/* Spacing */
Padding: 120px vertical / 24px horizontal
Gap between elements: 32px
Button gap: 16px

/* Animation */
Particles: Float animation, 10s duration, ease-in-out
Text: Fade in on load, 0.6s duration
```

## Course Card Component

### Component Name: `CourseCard`

#### Visual Design
```
┌─────────────────────────────────────┐
│ ┌───────────────────────────────┐   │
│ │                               │   │ <- Thumbnail
│ │     [Course Thumbnail]        │   │
│ │                               │   │
│ └───────────────────────────────┘   │
│                                     │
│ Introduction to Claude AI           │ <- Title
│                                     │
│ Learn the fundamentals of...        │ <- Description
│                                     │
│ 2.5 hours  •  Beginner            │ <- Meta info
└─────────────────────────────────────┘
```

#### Properties
- **thumbnail**: Image URL (16:9 aspect ratio)
- **title**: Course name (max 2 lines)
- **description**: Brief overview (max 3 lines)
- **duration**: Time to complete
- **difficulty**: Beginner/Intermediate/Advanced
- **progress**: Optional progress bar for enrolled users

#### Styling Specifications
```css
/* Container */
Background: rgba(30, 30, 35, 0.6)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border radius: 16px
Backdrop filter: blur(12px)

/* Thumbnail */
Aspect ratio: 16:9
Border radius: 12px 12px 0 0
Overflow: hidden
Hover: scale(1.05) transition

/* Typography */
Title:
  - Font: Inter Semibold
  - Size: 20px
  - Color: #E5E5F0 (dark-200)
  
Description:
  - Font: Inter Regular
  - Size: 14px
  - Color: #9B9BAB (dark-400)
  - Line clamp: 3

Meta:
  - Font: Inter Regular
  - Size: 12px
  - Color: #6B6B7B (dark-500)

/* Spacing */
Padding: 0 (image) / 24px (content)
Content gap: 12px

/* Hover State */
Box shadow: 0 0 30px rgba(0, 188, 212, 0.3)
Transform: translateY(-4px)
```

## Feature Card Component

### Component Name: `FeatureCard`

#### Visual Design
```
┌─────────────────────────────┐
│                             │
│         [Icon]              │ <- Neon glow
│                             │
│    Structured Learning      │ <- Title
│                             │
│  Progress through carefully │ <- Description
│  designed curriculum paths  │
│                             │
└─────────────────────────────┘
```

#### Properties
- **icon**: Icon component with neon effect
- **title**: Feature name
- **description**: Feature explanation
- **glowColor**: cyan/purple/pink

#### Styling Specifications
```css
/* Container */
Background: rgba(30, 30, 35, 0.4)
Border: 1px solid rgba(255, 255, 255, 0.05)
Border radius: 12px
Padding: 32px
Text align: center

/* Icon */
Size: 48px
Color: #00BCD4 (primary)
Glow: 0 0 20px rgba(0, 188, 212, 0.5)

/* Typography */
Title:
  - Font: Inter Semibold
  - Size: 18px
  - Color: #E5E5F0 (dark-200)
  - Margin top: 16px

Description:
  - Font: Inter Regular
  - Size: 14px
  - Color: #9B9BAB (dark-400)
  - Margin top: 8px
  - Line height: 1.6
```

## Navigation Component

### Component Name: `Navigation`

#### Visual Design
```
┌─────────────────────────────────────────────────────────────┐
│ GWTH.ai   Courses  Pricing  About      [Sign In] [Start]   │
└─────────────────────────────────────────────────────────────┘
```

#### States
- **Default**: Transparent with blur
- **Scrolled**: Dark background appears
- **Mobile**: Hamburger menu

#### Styling Specifications
```css
/* Container */
Position: fixed top
Height: 64px
Background: rgba(10, 10, 11, 0.8)
Backdrop filter: blur(12px)
Border bottom: 1px solid rgba(255, 255, 255, 0.1)
Z-index: 50

/* Logo */
Font: Inter Bold
Size: 24px
Color: #00BCD4 (primary)
Hover: text-shadow 0 0 20px rgba(0, 188, 212, 0.5)

/* Menu Items */
Font: Inter Medium
Size: 14px
Color: #CBCBDB (dark-300)
Hover: color #00BCD4
Transition: color 0.2s

/* Buttons */
Sign In:
  - Variant: ghost
  - Color: #CBCBDB (dark-300)
  
Start:
  - Variant: primary
  - Background: #00BCD4
  - Color: #0A0A0B (dark-900)
  - Hover: box-shadow 0 0 20px rgba(0, 188, 212, 0.5)
```

## Pricing Card Component

### Component Name: `PricingCard`

#### Visual Design
```
┌─────────────────────────────┐
│        Pro Plan             │ <- Badge (optional)
│                             │
│       $29/month             │ <- Price
│                             │
│  ✓ All courses access      │ <- Features
│  ✓ Priority support        │
│  ✓ Certificates            │
│  ✓ Offline downloads       │
│                             │
│      [Choose Plan]          │ <- CTA
└─────────────────────────────┘
```

#### Properties
- **tier**: basic/pro/team
- **price**: Monthly cost
- **features**: Array of features
- **recommended**: Boolean for highlight
- **ctaText**: Button text

#### Styling Specifications
```css
/* Container */
Background: rgba(30, 30, 35, 0.6)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border radius: 16px
Padding: 32px
Position: relative

/* Recommended State */
Border: 2px solid #00BCD4
Box shadow: 0 0 30px rgba(0, 188, 212, 0.3)

/* Badge */
Position: absolute top -12px
Background: #00BCD4
Color: #0A0A0B
Padding: 4px 16px
Border radius: 12px
Font size: 12px

/* Price */
Font: Inter Bold
Size: 36px
Color: #E5E5F0 (dark-200)
Margin: 24px 0

/* Features */
Font: Inter Regular
Size: 14px
Color: #CBCBDB (dark-300)
Line height: 2
Check icon: #00E676 (success)

/* CTA Button */
Width: 100%
Margin top: 24px
```

## Testimonial Card Component

### Component Name: `TestimonialCard`

#### Visual Design
```
┌─────────────────────────────────────────┐
│                                         │
│  "GWTH.ai transformed how I approach    │ <- Quote
│   AI development. The structured        │
│   learning path is exactly what I       │
│   needed."                              │
│                                         │
│  ┌───┐  Sarah Chen                     │ <- Avatar + Name
│  │IMG│  AI Engineer at TechCorp        │ <- Role
│  └───┘                                  │
│                                         │
│  ★★★★★                                  │ <- Rating
└─────────────────────────────────────────┘
```

#### Properties
- **quote**: Testimonial text
- **author**: Name of reviewer
- **role**: Job title/company
- **avatar**: Profile image URL
- **rating**: 1-5 stars

#### Styling Specifications
```css
/* Container */
Background: rgba(30, 30, 35, 0.4)
Border: 1px solid rgba(255, 255, 255, 0.05)
Border radius: 16px
Padding: 32px

/* Quote */
Font: Inter Regular
Size: 16px
Color: #CBCBDB (dark-300)
Line height: 1.6
Margin bottom: 24px

/* Author Section */
Display: flex
Align items: center
Gap: 16px

/* Avatar */
Size: 48px
Border radius: 50%
Border: 2px solid rgba(255, 255, 255, 0.1)

/* Name */
Font: Inter Semibold
Size: 16px
Color: #E5E5F0 (dark-200)

/* Role */
Font: Inter Regular
Size: 14px
Color: #9B9BAB (dark-400)

/* Rating */
Color: #FFD600 (warning)
Size: 16px
Margin top: 16px
```

## Footer Component

### Component Name: `Footer`

#### Visual Design
```
┌─────────────────────────────────────────────────────────┐
│  GWTH.ai    Courses      Company       Support          │
│             Browse        About         Help Center     │
│             Learning      Careers       Documentation   │
│             Paths         Blog          Contact         │
│                                                         │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  © 2024 GWTH.ai  |  Privacy  |  Terms  |  Cookies     │
└─────────────────────────────────────────────────────────┘
```

#### Sections
- **Brand**: Logo and tagline
- **Courses**: Course-related links
- **Company**: About, careers, blog
- **Support**: Help resources

#### Styling Specifications
```css
/* Container */
Background: #0A0A0B (dark-900)
Border top: 1px solid rgba(255, 255, 255, 0.05)
Padding: 64px 24px 32px

/* Grid Layout */
Display: grid
Grid template columns: 2fr 1fr 1fr 1fr (desktop)
Gap: 48px

/* Links */
Font: Inter Regular
Size: 14px
Color: #9B9BAB (dark-400)
Hover: color #00BCD4
Line height: 2

/* Section Titles */
Font: Inter Semibold
Size: 16px
Color: #E5E5F0 (dark-200)
Margin bottom: 16px

/* Copyright */
Font: Inter Regular
Size: 12px
Color: #6B6B7B (dark-500)
Text align: center
Margin top: 48px
```

## Animation Specifications

### Entrance Animations
- **Fade In Up**: 0.6s ease-out, 20px translate
- **Scale In**: 0.4s ease-out, scale from 0.95
- **Glow Pulse**: 2s ease-in-out infinite

### Hover Animations
- **Card Lift**: translateY(-4px), 0.2s ease
- **Glow Intensify**: Increase shadow spread by 50%
- **Scale**: scale(1.05), 0.2s ease

### Background Animations
- **Gradient Shift**: 10s ease-in-out infinite
- **Particle Float**: Random paths, 10-20s duration