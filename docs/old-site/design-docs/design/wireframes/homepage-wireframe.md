# GWTH.ai Homepage Wireframe

## Overview
The homepage serves as the primary entry point for new visitors and returning users, showcasing GWTH.ai's value proposition and guiding users toward course enrollment.

## Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                          Navigation Bar                          │
│  [GWTH.ai Logo]  Courses  Pricing  About    [Sign In] [Start]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         Hero Section                            │
│                                                                 │
│              Master AI with GWTH.ai                            │
│     Structured, practical, and always current                   │
│              AI education                                       │
│                                                                 │
│         [Start Learning]  [View Courses]                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      Features Section                           │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│   │ Structured  │  │  Always     │  │ Practical   │          │
│   │ Learning    │  │  Current    │  │ Projects    │          │
│   │             │  │             │  │             │          │
│   │ Icon + Text │  │ Icon + Text │  │ Icon + Text │          │
│   └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    Course Preview Section                       │
│                                                                 │
│   Popular Courses                              [View All →]     │
│                                                                 │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│   │ Course 1  │  │ Course 2  │  │ Course 3  │               │
│   │ Thumbnail │  │ Thumbnail │  │ Thumbnail │               │
│   │ Title     │  │ Title     │  │ Title     │               │
│   │ Duration  │  │ Duration  │  │ Duration  │               │
│   └───────────┘  └───────────┘  └───────────┘               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     Learning Path Section                       │
│                                                                 │
│              Your AI Learning Journey                           │
│                                                                 │
│   [1. Foundations] → [2. Applications] → [3. Advanced]        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    Testimonials Section                         │
│                                                                 │
│   What Our Students Say                                         │
│                                                                 │
│   ┌─────────────────────────────────────────┐                 │
│   │ "Quote from student..."                  │                 │
│   │ - Student Name, Role                     │                 │
│   └─────────────────────────────────────────┘                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      Pricing Preview                            │
│                                                                 │
│   Start Your AI Journey Today                                  │
│                                                                 │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│   │ Basic     │  │ Pro       │  │ Team      │               │
│   │ $X/month  │  │ $X/month  │  │ $X/month  │               │
│   │ Features  │  │ Features  │  │ Features  │               │
│   │ [Choose]  │  │ [Choose]  │  │ [Choose]  │               │
│   └───────────┘  └───────────┘  └───────────┘               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                         CTA Section                             │
│                                                                 │
│          Ready to Master AI?                                    │
│     Join thousands learning AI the right way                   │
│                                                                 │
│              [Get Started Free]                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                          Footer                                 │
│                                                                 │
│  Logo    Courses    Company     Support      Connect           │
│          Browse     About       Help         Twitter           │
│          Learning   Careers     FAQ          LinkedIn          │
│          Paths      Blog        Contact      YouTube           │
│                                                                 │
│  © 2024 GWTH.ai | Privacy | Terms | Cookies                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Navigation Bar
- **Style**: Fixed, glassmorphic background with blur
- **Logo**: GWTH.ai with neon cyan glow on hover
- **Menu Items**: Subtle hover effects with color transition
- **CTA Buttons**: 
  - "Sign In" - Ghost button
  - "Start" - Neon cyan button with glow

### 2. Hero Section
- **Background**: Animated gradient mesh (cyan to purple)
- **Headline**: Large, bold with gradient text effect
- **Subheadline**: Muted color for contrast
- **Buttons**:
  - Primary: Neon cyan "Start Learning"
  - Secondary: Outlined "View Courses"
- **Animation**: Subtle floating particles in background

### 3. Features Section
- **Cards**: Glassmorphic with icon
- **Icons**: Neon glow effect
- **Layout**: 3-column grid on desktop, stack on mobile
- **Content**:
  - Structured Learning: Book icon
  - Always Current: Refresh icon
  - Practical Projects: Code icon

### 4. Course Preview
- **Cards**: Glassmorphic with hover scale effect
- **Images**: 16:9 aspect ratio with gradient overlay
- **Info**: Title, duration, difficulty indicator
- **Interaction**: Entire card clickable

### 5. Learning Path
- **Visual**: Connected timeline with glowing nodes
- **Steps**: Interactive, expand on click
- **Progress**: Visual indicator for enrolled users

### 6. Testimonials
- **Style**: Carousel with glassmorphic cards
- **Content**: Quote, avatar, name, role
- **Navigation**: Dot indicators with neon active state

### 7. Pricing Preview
- **Cards**: Glassmorphic with recommended badge
- **Highlight**: Pro plan with neon border
- **Features**: Checkmark list
- **CTA**: Individual buttons per tier

### 8. Final CTA
- **Background**: Gradient section
- **Button**: Large, centered with strong glow effect

### 9. Footer
- **Style**: Dark with subtle top border
- **Layout**: 4-column on desktop, accordion on mobile
- **Links**: Hover state with color transition

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Hamburger menu
- Stacked cards
- Simplified hero section

### Tablet (640px - 1024px)
- 2-column grid for cards
- Condensed navigation
- Adjusted typography scale

### Desktop (> 1024px)
- Full layout as shown
- All hover effects enabled
- Maximum content width: 1280px

## Interaction States

### Hover Effects
- Buttons: Neon glow intensifies
- Cards: Subtle scale and shadow
- Links: Color transition to primary

### Loading States
- Skeleton screens with shimmer
- Progressive image loading
- Smooth transitions

### Error States
- Inline validation messages
- Toast notifications
- Graceful fallbacks

## Accessibility Notes
- All interactive elements keyboard accessible
- ARIA labels for icons
- Sufficient color contrast (WCAG AA)
- Focus indicators with neon outline
- Screen reader announcements for dynamic content