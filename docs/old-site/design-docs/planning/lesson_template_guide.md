# AI Course Lesson Template Guide

## Course Structure Overview

This 12-week AI course is divided into 3 modules of 4 weeks each:

- **Month 1**: Foundations & AI for Individuals/Small Businesses
- **Month 2**: Advanced Concepts & AI for Larger Businesses  
- **Month 3**: AI Strategy & Enterprise Solutions

## Lesson Format Structure

Each lesson follows a 5-part format designed to provide comprehensive learning through video, text, assessment, and hands-on practice.

### 1. Video Introduction
- **Duration**: 1-2 minutes
- **Format**: Avatar-based video created using Heygen
- **Content Requirements**:
  - Script that takes 1-2 minutes to speak aloud
  - Include 1-4 relevant links to professional papers, websites, or resources
  - Video should display professional papers or websites while script is narrated

### 2. Learn Section
- **Purpose**: Detailed topic instruction
- **Length**: Minimum 3 pages, maximum 20 pages
- **Content**: Text, images, and relevant links for comprehensive understanding

### 3. Check Section
- **Purpose**: Knowledge assessment of Learn section content
- **Format**: Multiple choice questions
- **Requirements**:
  - Each question has exactly 4 answer choices
  - Use simple, clear wording to avoid confusion
  - Should be completable in approximately 90 seconds
  - Focus on testing comprehension rather than complex reasoning

### 4. Build Section
- **Purpose**: Hands-on application of learned concepts
- **Format**: Step-by-step instructions
- **Scope**: Can range from creating AI opportunity lists to setting up development environments (e.g., Taskmaster in Cursor for coding)
- **Content**: Clear, detailed instructions for building something relevant to the lesson topic

### 5. Video of Build
- **Format**: Screencast with voice-over narration
- **Purpose**: Visual demonstration of the Build section
- **Content Focus**: Include helpful tips and common pitfalls that might confuse students

## Required Content Elements for Each Lesson

When creating lessons, ensure each markdown file includes all of the following elements:

### File Naming Convention
- **Format**: `GWTH_Month_Lesson_Title` (no spaces)
- **Example**: `GWTH_Month1_Lesson3_IntroToPromptEngineering`

### Content Structure

#### Basic Information
- **Title**: Clear lesson title
- **Difficulty Level**: Use H (High), M (Medium), or L (Low)

#### Video Introduction Components
- **Intro Video Text**: Complete script for the 1-2 minute narration
- **Intro Video Links**: 1-4 links to websites, papers, posts, or other relevant resources
- **Intro Video File**: Filename for the video file (follow same naming convention as MD file)

#### Learning Content
- **Learn Section**: Comprehensive text, images, and links covering the lesson topic

#### Assessment Questions
- **Check Q1**: Question with 4 multiple choice answers
- **Check Q2**: Question with 4 multiple choice answers  
- **Check Q3**: Question with 4 multiple choice answers

#### Practical Application
- **Build Section**: 
  - **What we are building**: Brief introduction explaining the goal and purpose
  - **Step-by-step instructions**: Detailed, clear instructions for completing the build
- **Build Video**: Notes on useful tips and common gotchas that may confuse students

## Implementation Notes for LLM Generation

When generating lesson content:

1. **Consistency**: Maintain consistent formatting and structure across all lessons
2. **Clarity**: Use clear, simple language appropriate for the target audience
3. **Relevance**: Ensure all content directly relates to the lesson objectives
4. **Practicality**: Make build sections actionable with real-world applications
5. **Assessment Alignment**: Ensure Check questions directly test Learn section content
6. **Progressive Difficulty**: Align content complexity with the specified difficulty level