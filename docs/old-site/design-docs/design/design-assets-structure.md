# Design Assets Organization Guide

## Directory Structure

```
design/
├── mockups/
│   ├── desktop/
│   │   ├── homepage/
│   │   │   ├── homepage-v1.fig
│   │   │   ├── homepage-v2.fig
│   │   │   └── homepage-final.png
│   │   ├── user-dashboard/
│   │   │   ├── dashboard-overview.fig
│   │   │   └── dashboard-settings.fig
│   │   └── [other-pages]/
│   ├── mobile/
│   │   ├── homepage/
│   │   ├── user-dashboard/
│   │   └── [other-pages]/
│   └── tablet/
│       └── [pages]/
├── screenshots/
│   ├── competitive-analysis/
│   │   ├── competitor-1/
│   │   │   ├── homepage-2024-01-15.png
│   │   │   └── features-2024-01-15.png
│   │   └── competitor-2/
│   ├── user-research/
│   │   ├── session-001/
│   │   └── session-002/
│   └── current-state/
│       ├── issues/
│       └── reference/
├── wireframes/
│   ├── low-fidelity/
│   │   ├── user-flows/
│   │   └── page-layouts/
│   └── high-fidelity/
│       ├── desktop/
│       └── mobile/
├── prototypes/
│   ├── interactive/
│   │   └── prototype-v1.fig
│   └── videos/
│       └── user-flow-demo.mp4
├── design-system/
│   ├── components/
│   │   ├── buttons/
│   │   ├── forms/
│   │   └── navigation/
│   ├── patterns/
│   ├── icons/
│   └── style-guide/
│       ├── colors.md
│       ├── typography.md
│       └── spacing.md
└── exports/
    ├── final-designs/
    ├── developer-handoff/
    └── presentations/
```

## Naming Conventions

### File Naming Pattern
```
[type]-[description]-[version]-[date].[extension]

Examples:
- mockup-homepage-v1-2024-01-15.png
- wireframe-user-flow-checkout-draft.pdf
- screenshot-competitor-pricing-page-2024-01.png
```

### Version Control
- **v1, v2, v3:** Major versions
- **v1.1, v1.2:** Minor revisions
- **-draft:** Work in progress
- **-final:** Approved version
- **-archived:** Old versions kept for reference

## File Organization Best Practices

### 1. Mockups
- Organize by device type first, then by page/feature
- Keep source files (.fig, .sketch, .xd) and exports (.png, .jpg) together
- Use consistent artboard sizes:
  - Desktop: 1440x900
  - Tablet: 768x1024
  - Mobile: 375x812

### 2. Screenshots
- Always include date in filename
- Organize by purpose (competitive analysis, user research, etc.)
- Include a README.md in each folder explaining context

### 3. Wireframes
- Separate low-fidelity from high-fidelity
- Group by user flow or feature set
- Include annotations directly in files or in accompanying notes

### 4. Design System
- Keep components modular and reusable
- Document each component with:
  - Visual examples
  - Usage guidelines
  - Code snippets (if applicable)

## README Template for Design Folders

Create a README.md in each major folder:

```markdown
# [Folder Name] Design Assets

## Overview
[Brief description of what's contained in this folder]

## Contents
- **Subfolder 1:** [Description]
- **Subfolder 2:** [Description]

## Key Files
1. **[Filename]:** [Description and purpose]
2. **[Filename]:** [Description and purpose]

## Status
- Last Updated: [Date]
- Current Version: [Version number]
- Designer: [Name]

## Notes
[Any additional context, decisions made, or things to consider]
```

## Asset Tracking Spreadsheet

Maintain a master spreadsheet (design-assets-tracker.csv) with:

| File Name | Type | Description | Version | Status | Designer | Date Created | Last Modified | Notes |
|-----------|------|-------------|---------|---------|----------|--------------|---------------|-------|
| homepage-mockup-v2.fig | Mockup | Homepage redesign | v2 | In Review | Jane Doe | 2024-01-10 | 2024-01-15 | Awaiting feedback |

## Tools and Formats

### Recommended File Formats
- **Design Files:** .fig (Figma), .sketch, .xd
- **Images:** .png for screenshots, .svg for icons
- **Documentation:** .md for notes, .pdf for presentations
- **Videos:** .mp4 for prototypes and demos

### Recommended Tools
- **Design:** Figma, Sketch, Adobe XD
- **Prototyping:** Figma, Principle, ProtoPie
- **Screenshots:** Native OS tools, CloudApp, Snagit
- **Version Control:** Git LFS for large files
- **Image Optimization:** ImageOptim, TinyPNG

## Collaboration Guidelines

1. **Check Out/In System**
   - Communicate when working on files
   - Use cloud-based tools with collaboration features
   - Avoid overwriting others' work

2. **Review Process**
   - Create "-review" versions for feedback
   - Use commenting tools in design software
   - Document decisions in README files

3. **Handoff to Development**
   - Export assets at required sizes
   - Provide spacing and sizing specifications
   - Include interactive prototypes when possible

## Maintenance Schedule

- **Weekly:** Archive old versions, update tracker
- **Monthly:** Clean up duplicate files, optimize storage
- **Quarterly:** Review and update organization structure

## Quick Reference

### Essential Folders to Create First
1. `/design/mockups/desktop/`
2. `/design/wireframes/low-fidelity/`
3. `/design/design-system/components/`
4. `/design/exports/developer-handoff/`

### File Size Limits
- Keep individual files under 100MB
- Use cloud storage links for larger files
- Optimize images before committing

### Backup Strategy
- Use version control (Git LFS)
- Maintain cloud backups
- Export final versions to multiple formats