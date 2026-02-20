# GWTH.ai Sitemap

## Visual Site Structure

```
GWTH.ai (/)
│
├── 🏠 Home
│   ├── Hero Section
│   ├── Value Proposition
│   ├── Course Overview
│   ├── Testimonials
│   └── CTA: Start Free
│
├── 📚 Learn
│   ├── Dashboard
│   │   ├── My Progress
│   │   ├── Recent Lessons
│   │   ├── Achievements
│   │   └── Learning Streak
│   │
│   ├── Courses
│   │   ├── Month 1: Foundations
│   │   │   ├── Week 1: AI Landscape
│   │   │   ├── Week 2: Individual Use Cases
│   │   │   ├── Week 3: Small Business Applications
│   │   │   └── Week 4: The 6 AI Primitives
│   │   │
│   │   ├── Month 2: Advanced
│   │   │   ├── Week 5: Scaling AI
│   │   │   ├── Week 6: Enterprise Tools
│   │   │   ├── Week 7: Change Management
│   │   │   └── Week 8: Advanced Automation
│   │   │
│   │   └── Month 3: Mastery
│   │       ├── Week 9: Enterprise Transformation
│   │       ├── Week 10: AI Governance
│   │       ├── Week 11: Complex Implementations
│   │       └── Week 12: Future Technologies
│   │
│   └── Resources
│       ├── Cheat Sheets
│       ├── Templates
│       ├── Case Studies
│       └── Tool Directory
│
├── 🧪 Labs
│   ├── All Labs
│   │   ├── Beginner Labs
│   │   ├── Intermediate Labs
│   │   └── Advanced Labs
│   │
│   ├── Featured Labs
│   │   ├── Build Your First AI Chatbot
│   │   ├── AI-Powered Image Generator
│   │   ├── Automated Content Summarizer
│   │   └── Real-Time Sentiment Analysis
│   │
│   └── My Projects
│       ├── In Progress
│       ├── Completed
│       └── Saved Templates
│
├── 👥 Community
│   ├── Forums
│   │   ├── General Discussion
│   │   ├── Technical Help
│   │   ├── Use Case Sharing
│   │   └── Feature Requests
│   │
│   ├── Events
│   │   ├── Live Sessions
│   │   ├── Office Hours
│   │   └── Workshops
│   │
│   └── Showcase
│       ├── Student Projects
│       ├── Success Stories
│       └── Implementation Examples
│
├── 💰 Pricing
│   ├── Pricing Tiers
│   │   ├── Free Labs Access
│   │   └── All-Access Pass
│   │
│   ├── Enterprise Solutions
│   └── FAQ
│
├── 🏢 Enterprise
│   ├── Overview
│   ├── Team Training
│   ├── Custom Solutions
│   ├── Case Studies
│   └── Contact Sales
│
├── 📖 About
│   ├── Our Story
│   ├── Mission & Vision
│   ├── Team
│   ├── Blog
│   └── Press Kit
│
├── 👤 Account
│   ├── Profile
│   │   ├── Personal Info
│   │   ├── Preferences
│   │   ├── Theme Settings
│   │   └── Notifications
│   │
│   ├── Subscription
│   │   ├── Current Plan
│   │   ├── Billing History
│   │   └── Upgrade/Downgrade
│   │
│   ├── Achievements
│   │   ├── Badges
│   │   ├── Certificates
│   │   └── Skill Progress
│   │
│   └── Settings
│       ├── Security
│       ├── Privacy
│       └── API Keys
│
├── 🔧 Admin (Protected)
│   ├── Dashboard
│   │   ├── Analytics Overview
│   │   ├── User Metrics
│   │   ├── Revenue Reports
│   │   └── Content Performance
│   │
│   ├── Content Management
│   │   ├── Lessons
│   │   ├── Labs
│   │   ├── Resources
│   │   └── Announcements
│   │
│   ├── User Management
│   │   ├── All Users
│   │   ├── Enterprise Accounts
│   │   ├── Support Tickets
│   │   └── Access Control
│   │
│   └── System
│       ├── Settings
│       ├── Integrations
│       ├── Backups
│       └── Logs
│
└── 📋 Footer Links
    ├── Legal
    │   ├── Terms of Service
    │   ├── Privacy Policy
    │   └── Cookie Policy
    │
    ├── Support
    │   ├── Help Center
    │   ├── Contact Us
    │   └── System Status
    │
    └── Connect
        ├── LinkedIn
        ├── Twitter/X
        ├── YouTube
        └── Newsletter
```

## URL Structure

### Public Pages
- `/` - Homepage
- `/learn` - Learning dashboard
- `/learn/courses/{course-id}/{lesson-id}` - Individual lessons
- `/labs` - All labs listing
- `/labs/{lab-id}` - Individual lab
- `/community` - Community hub
- `/community/forums/{topic}` - Forum topics
- `/pricing` - Pricing page
- `/enterprise` - Enterprise solutions
- `/about` - About us
- `/blog` - Blog listing
- `/blog/{post-slug}` - Individual blog posts

### Authenticated Pages
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/profile/settings` - Account settings
- `/profile/subscription` - Subscription management
- `/my-labs` - User's lab projects
- `/achievements` - Badges and certificates

### Admin Pages
- `/admin` - Admin dashboard
- `/admin/content` - Content management
- `/admin/users` - User management
- `/admin/analytics` - Analytics and reports
- `/admin/settings` - System settings

### API Endpoints (RESTful)
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/courses/*` - Course content
- `/api/labs/*` - Lab management
- `/api/progress/*` - Progress tracking
- `/api/community/*` - Community features
- `/api/admin/*` - Admin operations

## Navigation Structure

### Primary Navigation (Header)
1. Learn
2. Labs
3. Community
4. Pricing
5. Enterprise

### User Menu (Authenticated)
- Dashboard
- My Progress
- Profile
- Settings
- Logout

### Mobile Navigation
- Hamburger menu with all primary links
- Bottom tab bar for key actions:
  - Home
  - Learn
  - Labs
  - Profile

## SEO Metadata Structure

### Homepage
- Title: "GWTH.ai - Master AI in 12 Weeks | Practical AI Education Platform"
- Description: "Transform your career with practical AI skills. Learn from real-world projects at 1/200th the cost of consultants. Start free today."

### Course Pages
- Title: "{Lesson Title} | GWTH.ai AI Mastery Course"
- Description: "Learn {topic} with hands-on exercises and real-world applications. Part of the comprehensive GWTH.ai AI mastery program."

### Lab Pages
- Title: "{Lab Name} - Interactive AI Project | GWTH.ai Labs"
- Description: "Build {project description} in this hands-on AI lab. Learn by doing with step-by-step guidance."

## Technical Implementation Notes

### Routing Strategy
- Client-side routing for authenticated sections
- Server-side rendering for public pages (SEO)
- Progressive enhancement for labs
- Lazy loading for video content

### State Management
- Global state for user authentication
- Local state for lesson progress
- Persistent storage for user preferences
- Real-time sync for collaborative features

### Performance Optimization
- Code splitting by route
- Image optimization and lazy loading
- CDN for static assets
- Service worker for offline capability