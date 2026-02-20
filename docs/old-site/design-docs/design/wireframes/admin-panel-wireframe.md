# Admin Panel Design (Ant Design)

## Overview
The admin panel provides comprehensive management capabilities for courses, users, analytics, and system settings using Ant Design components in dark theme.

## Admin Layout Structure

### Main Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                        Header (Ant Layout.Header)               │
│  [☰] GWTH.ai Admin    [🔔] [👤 Admin User] [Settings] [Logout] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  │                                                             │
│  │  Sidebar                   Main Content Area                │
│  │  ────────                  ─────────────────               │
│  │                                                             │
│  │  📊 Dashboard              ┌─────────────────────────────┐ │
│  │  📚 Courses               │                             │ │
│  │  👥 Users                 │      Page Content           │ │
│  │  📈 Analytics             │                             │ │
│  │  💳 Payments              │                             │ │
│  │  🎓 Certificates          │                             │ │
│  │  📧 Email Templates       │                             │ │
│  │  ⚙️ Settings              │                             │ │
│  │  🔧 System                │                             │ │
│  │                           │                             │ │
│  │                           └─────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                                              Today   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ Total Users │ │ Active      │ │ Revenue     │ │ Courses   │ │
│  │             │ │ Courses     │ │ This Month  │ │ Published │ │
│  │   2,847     │ │     24      │ │   $12,450   │ │    18     │ │
│  │ ↑ 12% ↑     │ │ ↑ 3 new ↑   │ │ ↑ 18% ↑     │ │ ↑ 2 new ↑ │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 User Growth Chart                       │   │
│  │                                                         │   │
│  │  Users  ┌─────────────────────────────────────────┐   │   │
│  │  3000   │                                         │   │   │
│  │  2500   │                                    ╭─── │   │   │
│  │  2000   │                               ╭───╯     │   │   │
│  │  1500   │                          ╭───╯          │   │   │
│  │  1000   │                     ╭───╯               │   │   │
│  │   500   │                ╭───╯                    │   │   │
│  │     0   └─────────────────────────────────────────┘   │   │
│  │         Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Recent Activity                        [View All →]   │   │
│  │  ─────────────────                                     │   │
│  │                                                         │   │
│  │  🆕 New user registered: john.doe@email.com - 2 min   │   │
│  │  📚 Course published: "Advanced RAG" - 1 hour ago     │   │
│  │  💳 Payment processed: $29.99 - 3 hours ago           │   │
│  │  🎓 Certificate issued: Sarah Chen - 5 hours ago      │   │
│  │  ⚠️ System alert: High API usage - 8 hours ago        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Course Management

### Course List View
```
┌─────────────────────────────────────────────────────────────────┐
│  Courses                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [+ Add Course] [Import] [Export]        🔍 Search...   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ┌─┬─────────────────────┬─────────┬─────────┬─────────┐ │   │
│  │ │#│ Course Title        │ Status  │ Students│ Actions │ │   │
│  │ ├─┼─────────────────────┼─────────┼─────────┼─────────┤ │   │
│  │ │1│ Introduction to     │ 🟢 Live │   456   │ [Edit]  │ │   │
│  │ │ │ Claude AI           │         │         │ [Stats] │ │   │
│  │ │ │                     │         │         │ [⋮]     │ │   │
│  │ ├─┼─────────────────────┼─────────┼─────────┼─────────┤ │   │
│  │ │2│ Advanced Prompt     │ 🟡 Draft│    23   │ [Edit]  │ │   │
│  │ │ │ Engineering         │         │         │ [Publish]│ │   │
│  │ │ │                     │         │         │ [⋮]     │ │   │
│  │ ├─┼─────────────────────┼─────────┼─────────┼─────────┤ │   │
│  │ │3│ Building RAG        │ 🔴 Hidden│   234   │ [Edit]  │ │   │
│  │ │ │ Applications        │         │         │ [Show]  │ │   │
│  │ │ │                     │         │         │ [⋮]     │ │   │
│  │ └─┴─────────────────────┴─────────┴─────────┴─────────┘ │   │
│  │                                                         │   │
│  │ [1] [2] [3] ... [Next]                      10 per page│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Course Edit Form
```
┌─────────────────────────────────────────────────────────────────┐
│  Edit Course: Introduction to Claude AI                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Basic Info] [Content] [Pricing] [Settings] [Preview]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Course Title *                                        │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Introduction to Claude AI                       │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  Description *                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Master the fundamentals of working with...      │   │   │
│  │  │                                                 │   │   │
│  │  │ [Rich Text Editor with formatting options]      │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  Thumbnail                                             │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ [📷 Upload Image] [Choose from Library]         │   │   │
│  │  │                                                 │   │   │
│  │  │ Current: course-thumbnail.jpg                   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐   │   │
│  │  │ Category    │ │ Difficulty  │ │ Duration      │   │   │
│  │  │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌───────────┐ │   │   │
│  │  │ │ LLMs ▼  │ │ │ │Beginner▼│ │ │ │ 2.5 hrs  │ │   │   │
│  │  │ └─────────┘ │ │ └─────────┘ │ │ └───────────┘ │   │   │
│  │  └─────────────┘ └─────────────┘ └───────────────┘   │   │
│  │                                                         │   │
│  │  [Cancel] [Save Draft] [Save & Publish]               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## User Management

### User List View
```
┌─────────────────────────────────────────────────────────────────┐
│  Users                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [+ Add User] [Export] [Bulk Actions]    🔍 Search...   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Filters: [All Users▼] [Active▼] [Subscription▼] [Role▼]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ┌─┬─────────────────┬─────────┬─────────┬─────────────┐ │   │
│  │ │☐│ User            │ Status  │ Role    │ Last Active │ │   │
│  │ ├─┼─────────────────┼─────────┼─────────┼─────────────┤ │   │
│  │ │☐│ 👤 Sarah Chen   │ 🟢 Active│ Student│ 2 mins ago │ │   │
│  │ │ │ sarah@email.com │         │         │             │ │   │
│  │ │ │ ID: usr_123     │         │         │ [Actions▼] │ │   │
│  │ ├─┼─────────────────┼─────────┼─────────┼─────────────┤ │   │
│  │ │☐│ 👤 John Doe     │ 🟡 Pending│ Student│ 1 day ago  │ │   │
│  │ │ │ john@email.com  │         │         │             │ │   │
│  │ │ │ ID: usr_124     │         │         │ [Actions▼] │ │   │
│  │ ├─┼─────────────────┼─────────┼─────────┼─────────────┤ │   │
│  │ │☐│ 👤 Admin User   │ 🟢 Active│ Admin   │ 5 mins ago │ │   │
│  │ │ │ admin@gwth.ai   │         │         │             │ │   │
│  │ │ │ ID: usr_001     │         │         │ [Actions▼] │ │   │
│  │ └─┴─────────────────┴─────────┴─────────┴─────────────┘ │   │
│  │                                                         │   │
│  │ [1] [2] [3] ... [Next]                      25 per page│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### User Detail Modal
```
┌─────────────────────────────────────────────────────────────────┐
│  User Details: Sarah Chen                                  [✕] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Profile] [Activity] [Courses] [Billing] [Actions]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  👤 Profile Information                                 │   │
│  │  ─────────────────────                                 │   │
│  │                                                         │   │
│  │  Name: Sarah Chen                                       │   │
│  │  Email: sarah@email.com                                 │   │
│  │  Role: Student                                          │   │
│  │  Status: Active                                         │   │
│  │  Joined: March 15, 2024                                │   │
│  │  Last Login: 2 minutes ago                              │   │
│  │                                                         │   │
│  │  📊 Learning Stats                                      │   │
│  │  ──────────────────                                    │   │
│  │                                                         │   │
│  │  Courses Enrolled: 3                                   │   │
│  │  Courses Completed: 1                                  │   │
│  │  Total Watch Time: 12.5 hours                          │   │
│  │  Certificates Earned: 1                                │   │
│  │  Current Streak: 7 days                                │   │
│  │                                                         │   │
│  │  [Edit Profile] [Reset Password] [Send Email]          │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Analytics                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Date Range: [Last 30 Days ▼] [Apply]     [Export PDF]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Revenue Analytics                         │   │
│  │                                                         │   │
│  │  Revenue │                                             │   │
│  │  $15,000 │     ╭─────╮                                │   │
│  │  $12,500 │   ╭─╯     ╰─╮                              │   │
│  │  $10,000 │ ╭─╯         ╰─╮                            │   │
│  │   $7,500 │╭╯             ╰──╮                         │   │
│  │   $5,000 │                  ╰─╮                       │   │
│  │   $2,500 │                    ╰──╮                    │   │
│  │       $0 └─────────────────────────╰─────────────────┘   │
│  │          Week1 Week2 Week3 Week4 Week5 Week6          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Course Performance                       │   │
│  │                                                         │   │
│  │  Course Name              │ Enrollments │ Completion  │   │
│  │  ─────────────────────────┼─────────────┼─────────────┤   │
│  │  Introduction to Claude   │     456     │    89%      │   │
│  │  Advanced Prompt Eng.     │     234     │    76%      │   │
│  │  Building RAG Apps        │     189     │    65%      │   │
│  │  AI Ethics & Safety       │     123     │    94%      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## System Settings

```
┌─────────────────────────────────────────────────────────────────┐
│  Settings                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [General] [Email] [Payments] [Security] [API] [Backups]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📧 Email Settings                                      │   │
│  │  ─────────────────                                     │   │
│  │                                                         │   │
│  │  SMTP Configuration                                     │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Host: smtp.mailerlite.com                       │   │   │
│  │  │ Port: 587                                       │   │   │
│  │  │ Username: [••••••••••••••••••••••••••••••••]    │   │   │
│  │  │ Password: [••••••••••••••••••••••••••••••••]    │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  Email Templates                                        │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ □ Welcome Email                                 │   │   │
│  │  │ □ Course Enrollment Confirmation                │   │   │
│  │  │ □ Certificate Notification                      │   │   │
│  │  │ □ Password Reset                                │   │   │
│  │  │ □ Marketing Newsletter                          │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  [Test Email] [Save Changes]                           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Dark Theme Configuration

### Ant Design Theme Token Overrides
```javascript
// Admin theme configuration
const adminTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary colors matching GWTH.ai brand
    colorPrimary: '#00BCD4',
    colorInfo: '#00BCD4',
    colorSuccess: '#00E676',
    colorWarning: '#FFD600',
    colorError: '#FF5252',
    
    // Background colors
    colorBgContainer: '#1E1E23',
    colorBgLayout: '#141417',
    colorBgBase: '#0A0A0B',
    
    // Text colors
    colorText: '#E5E5F0',
    colorTextSecondary: '#9B9BAB',
    colorTextDisabled: '#6B6B7B',
    
    // Border colors
    colorBorder: '#2A2A31',
    colorBorderSecondary: '#6B6B7B',
    
    // Typography
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    
    // Spacing
    borderRadius: 8,
    
    // Shadows
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
  components: {
    Layout: {
      headerBg: '#141417',
      siderBg: '#0A0A0B',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(0, 188, 212, 0.1)',
      itemSelectedColor: '#00BCD4',
    },
    Table: {
      headerBg: '#2A2A31',
      rowHoverBg: 'rgba(0, 188, 212, 0.05)',
    },
    Card: {
      headerBg: '#1E1E23',
    },
  },
}
```

## Responsive Considerations

### Mobile Admin Panel
- Collapsible sidebar becomes drawer
- Horizontal scrolling for tables
- Stack dashboard cards vertically
- Touch-friendly button sizing

### Tablet View
- Compact sidebar
- Adjusted table columns
- Responsive form layouts
- Optimized for touch interaction