# User Dashboard & Learning Interface Wireframes

## User Dashboard

### Overview
The dashboard is the personalized hub where users track progress, access courses, and manage their learning journey.

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                          Navigation Bar                          │
│  [GWTH.ai Logo]  Dashboard  Courses  Progress   [👤] [Settings]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Welcome back, Sarah! 👋                                       │
│  Continue your AI learning journey                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Learning Streak 🔥                       │   │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐           │   │
│  │  │ M │ │ T │ │ W │ │ T │ │ F │ │ S │ │ S │  15 days  │   │
│  │  │ ✓ │ │ ✓ │ │ ✓ │ │ ✓ │ │ ● │ │   │ │   │  streak!  │   │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │   Continue Learning   │  │    Quick Stats       │           │
│  │                      │  │                      │           │
│  │  Claude API Mastery  │  │  3 Courses Active    │           │
│  │  ████████░░ 75%      │  │  12 Hours Learned    │           │
│  │                      │  │  2 Certificates      │           │
│  │  [Resume Course →]   │  │  85% Avg Score       │           │
│  └──────────────────────┘  └──────────────────────┘           │
│                                                                 │
│  My Courses                                    [View All →]     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │ │Course 1 │ │Course 2 │ │Course 3 │ │Course 4 │       │   │
│  │ │ ███░░░  │ │ ██████  │ │ ████░░  │ │ ░░░░░░  │       │   │
│  │ │  45%    │ │  100%   │ │  80%    │ │   0%    │       │   │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Recent Activity                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✓ Completed: "Understanding Transformers" - 2 hours ago  │   │
│  │ 📝 Submitted: Lab Exercise 3.2 - Yesterday              │   │
│  │ 🏆 Earned: "API Expert" Badge - 2 days ago             │   │
│  │ 💬 Commented on: "Best Practices Discussion" - 3 days   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Recommended Next Steps                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Based on your progress, we recommend:                    │   │
│  │                                                          │   │
│  │ • Advanced Prompt Engineering (2.5 hrs)                 │   │
│  │ • Building RAG Applications (4 hrs)                     │   │
│  │ • Claude for Data Analysis (3 hrs)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Learning Interface (Course Player)

### Video Lesson View
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Course    Module 2: Core Concepts    [Help] [Notes] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────┬─────────────────────────┐   │
│  │                               │                         │   │
│  │                               │  Course Content         │   │
│  │                               │  ═════════════         │   │
│  │       Video Player            │                         │   │
│  │                               │  ▼ Module 1 ✓          │   │
│  │    ┌─────────────────┐       │                         │   │
│  │    │                 │       │  ▼ Module 2 (Current)  │   │
│  │    │  ▶  Play Video  │       │    • 2.1 Intro ✓       │   │
│  │    │                 │       │    • 2.2 Concepts ▶    │   │
│  │    └─────────────────┘       │    • 2.3 Lab Exercise  │   │
│  │                               │    • 2.4 Quiz          │   │
│  │    [|>] ━━━━━━━━━━━━ 12:34   │                         │   │
│  │    🔊 CC 1x ⚙️ □              │  ▷ Module 3            │   │
│  │                               │  ▷ Module 4            │   │
│  ├───────────────────────────────┤  ▷ Module 5            │   │
│  │ [Overview][Transcript][Notes] │                         │   │
│  │                               │  Progress: 45%         │   │
│  │ Key Concepts:                 │  ████████░░░░░░        │   │
│  │ • Transformer architecture    │                         │   │
│  │ • Attention mechanisms        │  [Next Lesson →]       │   │
│  │ • Token processing           │                         │   │
│  │                               │                         │   │
│  │ Resources:                    │  Community             │   │
│  │ 📄 Slides.pdf                │  ═══════════           │   │
│  │ 💻 Code Examples             │                         │   │
│  │ 📚 Further Reading           │  💬 23 Comments        │   │
│  │                               │  ❓ Ask Question       │   │
│  └───────────────────────────────┴─────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Interactive Lab View
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Course    Lab 2.3: Your First API Call    [Reset]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────┬─────────────────────────┐   │
│  │                               │                         │   │
│  │  Instructions                 │  Your Progress          │   │
│  │  ═════════════               │  ══════════════         │   │
│  │                               │                         │   │
│  │  In this lab, you'll:         │  ✓ Set up environment  │   │
│  │  1. Set up Claude API key     │  ✓ Import libraries    │   │
│  │  2. Make your first call      │  ○ Create API client   │   │
│  │  3. Handle the response       │  ○ Send request        │   │
│  │                               │  ○ Process response    │   │
│  ├───────────────────────────────┤                         │   │
│  │                               │  Hints Available: 3    │   │
│  │  Code Editor                  │  [Get Hint]            │   │
│  │  ═══════════                 │                         │   │
│  │                               │  Test Results          │   │
│  │  import anthropic            │  ══════════════        │   │
│  │                               │                         │   │
│  │  # Your code here            │  ⚠️ 2 tests pending    │   │
│  │  client = anthropic.Client(   │                         │   │
│  │      api_key="..."           │  [Run Tests]           │   │
│  │  )                           │                         │   │
│  │                               │  Output Console        │   │
│  │  [Run Code] [Submit]         │  ═══════════════       │   │
│  │                               │  >                     │   │
│  └───────────────────────────────┴─────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Quiz/Assessment View
```
┌─────────────────────────────────────────────────────────────────┐
│  Module 2 Quiz: Core Concepts                     Time: 08:45   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Question 3 of 10                                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  What is the primary purpose of attention mechanisms   │   │
│  │  in transformer models?                                │   │
│  │                                                         │   │
│  │  ○ To reduce model size                               │   │
│  │  ○ To speed up training                               │   │
│  │  ● To weight the relevance of different inputs        │   │
│  │  ○ To generate random outputs                         │   │
│  │                                                         │   │
│  │  [Previous] [Skip]                    [Next Question] │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Progress: ●●●○○○○○○○                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Progress Tracking View

```
┌─────────────────────────────────────────────────────────────────┐
│                       Your Learning Progress                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Overall Progress                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Total Courses: 5                                      │   │
│  │  ████████████████████████████████░░░░░░░░  78%        │   │
│  │                                                         │   │
│  │  Time Invested: 24.5 hours                            │   │
│  │  Certificates Earned: 2                                │   │
│  │  Current Streak: 15 days 🔥                           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Skills Development                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Prompt Engineering     ████████████████░░░░  85%     │   │
│  │  API Integration       ███████████░░░░░░░░░  60%     │   │
│  │  Model Fine-tuning     ████░░░░░░░░░░░░░░░░  25%     │   │
│  │  Safety & Ethics       ████████████████████  100%     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Achievements & Badges                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🏆 Quick Learner  🎯 First Project  🚀 API Master     │   │
│  │  🔥 Week Streak    📚 Bookworm      💡 Problem Solver  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile Responsive Considerations

### Dashboard Mobile
- Stack cards vertically
- Collapsible sections
- Swipeable course carousel
- Bottom navigation bar

### Learning Interface Mobile
- Full-screen video player
- Slide-out course navigation
- Tab bar for content sections
- Touch-optimized controls

## Interactive Elements

### Dashboard Interactions
- Course cards: Click to resume
- Progress bars: Hover for details
- Activity items: Expandable
- Streak calendar: Daily check-in

### Learning Interface Interactions
- Video: Standard controls + shortcuts
- Code editor: Syntax highlighting
- Quiz: Instant feedback
- Navigation: Keyboard shortcuts

## Accessibility Features
- Keyboard navigation throughout
- Screen reader descriptions
- Closed captions for videos
- High contrast mode option
- Focus indicators
- Skip navigation links