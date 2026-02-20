# Course Catalog & Course Detail Wireframes

## Course Catalog Page

### Overview
The course catalog is the main browsing experience where users discover and filter available courses.

### Page Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                          Navigation Bar                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                     Course Catalog Header                       │
│                                                                 │
│              Explore Our AI Courses                             │
│         Find the perfect course for your journey               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐ │
│  │                 │  │                                      │ │
│  │  Filters        │  │        Course Grid                   │ │
│  │                 │  │                                      │ │
│  │  Category       │  │  ┌──────────┐  ┌──────────┐        │ │
│  │  □ Fundamentals │  │  │ Course 1 │  │ Course 2 │        │ │
│  │  □ LLMs         │  │  │          │  │          │        │ │
│  │  □ Applications │  │  │ Preview  │  │ Preview  │        │ │
│  │  □ Advanced     │  │  └──────────┘  └──────────┘        │ │
│  │                 │  │                                      │ │
│  │  Difficulty     │  │  ┌──────────┐  ┌──────────┐        │ │
│  │  □ Beginner     │  │  │ Course 3 │  │ Course 4 │        │ │
│  │  □ Intermediate │  │  │          │  │          │        │ │
│  │  □ Advanced     │  │  │ Preview  │  │ Preview  │        │ │
│  │                 │  │  └──────────┘  └──────────┘        │ │
│  │                 │  │                                      │ │
│  │  Duration       │  │  [1] [2] [3] ... [Next]             │ │
│  │  ○ < 2 hours    │  │                                      │ │
│  │  ○ 2-5 hours    │  │                                      │ │
│  │  ○ > 5 hours    │  └──────────────────────────────────────┘ │
│  │                 │                                            │
│  │  [Clear Filters]│                                            │
│  └─────────────────┘                                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                          Footer                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Components

#### Search & Sort Bar
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search courses...                    Sort: [Newest ▼]     │
└─────────────────────────────────────────────────────────────┘
```

#### Filter Sidebar (Desktop) / Modal (Mobile)
- **Categories**: Multi-select checkboxes
- **Difficulty**: Multi-select checkboxes
- **Duration**: Radio buttons
- **Price**: Range slider (if applicable)
- **Clear Filters**: Reset button

#### Course Grid Item
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │     [Course Thumbnail]      │ │
│ │                             │ │
│ │  ▶ Preview Available        │ │ <- On hover
│ └─────────────────────────────┘ │
│                                 │
│ BEGINNER • 2.5 HOURS           │ <- Meta badges
│                                 │
│ Introduction to Claude AI       │ <- Title
│                                 │
│ Master the fundamentals of...   │ <- Description
│                                 │
│ ⭐ 4.8 (234 reviews)           │ <- Rating
│                                 │
│ [View Course →]                 │ <- CTA
└─────────────────────────────────┘
```

## Course Detail Page

### Page Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                          Navigation Bar                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ← Back to Courses                                             │
│                                                                 │
│  ┌────────────────────────────┐  ┌────────────────────────────┐│
│  │                            │  │                            ││
│  │    Course Hero Section     │  │    Course Info Card        ││
│  │                            │  │                            ││
│  │  [Video Preview/Thumbnail] │  │  Introduction to Claude AI ││
│  │                            │  │                            ││
│  │  Introduction to Claude AI │  │  ⭐ 4.8 (234 reviews)      ││
│  │                            │  │                            ││
│  │  Master the fundamentals   │  │  Duration: 2.5 hours       ││
│  │  of working with Claude    │  │  Level: Beginner           ││
│  │  AI for development        │  │  Updated: 2 days ago       ││
│  │                            │  │                            ││
│  │  By: Dr. Sarah Chen        │  │  [Enroll Now - $29]        ││
│  │  AI Researcher             │  │                            ││
│  │                            │  │  ✓ Lifetime access         ││
│  └────────────────────────────┘  │  ✓ Certificate included    ││
│                                  │  ✓ 30-day guarantee        ││
│                                  └────────────────────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Overview] [Curriculum] [Reviews] [FAQ]     <- Tabs           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  What You'll Learn                                     │   │
│  │  ━━━━━━━━━━━━━━━━                                     │   │
│  │                                                         │   │
│  │  ✓ Understanding Claude's capabilities                 │   │
│  │  ✓ Best practices for prompt engineering              │   │
│  │  ✓ Building applications with Claude API              │   │
│  │  ✓ Safety and ethical considerations                  │   │
│  │                                                         │   │
│  │  Course Description                                    │   │
│  │  ━━━━━━━━━━━━━━━━━                                    │   │
│  │                                                         │   │
│  │  This comprehensive course introduces you to...        │   │
│  │                                                         │   │
│  │  Prerequisites                                         │   │
│  │  ━━━━━━━━━━━━━                                        │   │
│  │                                                         │   │
│  │  • Basic programming knowledge                         │   │
│  │  • Familiarity with APIs                              │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     Related Courses                             │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Course 1 │  │ Course 2 │  │ Course 3 │  │ Course 4 │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                          Footer                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Curriculum Tab Content
```
┌─────────────────────────────────────────────────────────────┐
│  Course Curriculum                                          │
│  ━━━━━━━━━━━━━━━                                          │
│                                                             │
│  📁 Module 1: Getting Started (45 min)                     │
│  ├─ 📹 1.1 Course Introduction (5 min)                     │
│  ├─ 📹 1.2 What is Claude AI? (10 min)                    │
│  ├─ 📹 1.3 Setting Up Your Environment (15 min)           │
│  └─ 📝 1.4 Quick Start Exercise (15 min)                  │
│                                                             │
│  📁 Module 2: Core Concepts (60 min)                       │
│  ├─ 📹 2.1 Understanding LLMs (20 min)                     │
│  ├─ 📹 2.2 Claude's Architecture (15 min)                 │
│  ├─ 💻 2.3 Hands-on Lab: First API Call (25 min)         │
│                                                             │
│  📁 Module 3: Practical Applications (45 min)             │
│  └─ ...                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Reviews Tab Content
```
┌─────────────────────────────────────────────────────────────┐
│  Student Reviews                                            │
│  ━━━━━━━━━━━━━                                             │
│                                                             │
│  Overall Rating: ⭐ 4.8 out of 5 (234 reviews)             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⭐⭐⭐⭐⭐                                             │   │
│  │ "Excellent course! Clear explanations..."            │   │
│  │ - John D. • 2 days ago                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⭐⭐⭐⭐                                               │   │
│  │ "Very comprehensive, but could use more..."          │   │
│  │ - Sarah M. • 1 week ago                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Responsive Considerations

### Course Catalog Mobile
- Filter button triggers modal overlay
- Single column course grid
- Sticky search bar
- Infinite scroll instead of pagination

### Course Detail Mobile
- Stacked layout (hero, then info card)
- Accordion-style curriculum
- Sticky enrollment button at bottom
- Swipeable tabs

## Interactive Elements

### Hover States
- Course cards: Slight lift + preview button
- Filter options: Highlight
- CTAs: Neon glow effect

### Loading States
- Skeleton screens for course cards
- Progressive image loading
- Smooth transitions

### Empty States
- No courses found: Helpful message + suggestions
- Clear illustration
- Action to reset filters