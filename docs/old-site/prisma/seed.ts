import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a default course
  const course = await prisma.course.create({
    data: {
      title: "GWTH.ai Foundations",
      description: "Comprehensive AI education program - From fundamentals to advanced applications",
      slug: "gwth-foundations",
      price: 149,
      isPublished: true
    }
  })

  console.log('✅ Created course:', course.title)

  // Create course sections (months)
  const sections = await Promise.all([
    prisma.courseSection.create({
      data: {
        title: "Month 1: Foundations & AI for Individuals/Small Businesses",
        description: "Learn the fundamentals of AI and how to apply it for personal and small business use",
        order: 1,
        courseId: course.id
      }
    }),
    prisma.courseSection.create({
      data: {
        title: "Month 2: AI for Corporate Teams",
        description: "Discover how to leverage AI for team collaboration and enterprise applications",
        order: 2,
        courseId: course.id
      }
    }),
    prisma.courseSection.create({
      data: {
        title: "Month 3: Advanced Applications & Custom Development",
        description: "Build custom AI solutions and advanced applications",
        order: 3,
        courseId: course.id
      }
    })
  ])

  console.log('✅ Created', sections.length, 'course sections')

  // Create lessons
  const lessons = [
    {
      title: "Introduction and Monthly Targets",
      slug: "introduction-monthly-targets",
      description: "Welcome to GWTH.ai! Get an overview of what you'll learn and set your learning goals.",
      order: 1,
      duration: "30 min",
      difficulty: "L",
      category: "Getting Started",
      sectionId: sections[0].id,
      status: "published",
      topics: ["AI Overview", "Course Structure", "Learning Goals"],
      learnContent: {
        sections: [
          {
            title: "Welcome to GWTH.ai",
            content: "This comprehensive program will transform you from an AI beginner to a confident practitioner."
          },
          {
            title: "Course Structure",
            content: "Over 3 months, you'll progress through foundational concepts to advanced applications."
          }
        ]
      }
    },
    {
      title: "Top 10 AI Use Cases for Individuals",
      slug: "top-10-ai-use-cases-individuals",
      description: "Discover the most impactful ways individuals can leverage AI in their daily lives and work.",
      order: 2,
      duration: "45 min",
      difficulty: "L",
      category: "AI Applications",
      sectionId: sections[0].id,
      status: "published",
      topics: ["Personal Productivity", "Content Creation", "Learning Enhancement"],
      learnContent: {
        sections: [
          {
            title: "AI for Personal Productivity",
            content: "Learn how AI can automate repetitive tasks and boost your efficiency."
          }
        ]
      }
    },
    {
      title: "Top 10 AI Use Cases for Companies",
      slug: "top-10-ai-use-cases-companies",
      description: "Explore how businesses are using AI to transform operations and gain competitive advantage.",
      order: 3,
      duration: "45 min",
      difficulty: "M",
      category: "AI Applications",
      sectionId: sections[0].id,
      status: "published",
      topics: ["Business Automation", "Customer Service", "Data Analysis"],
      learnContent: {
        sections: [
          {
            title: "AI in Business Operations",
            content: "Discover how companies are leveraging AI for automation and efficiency."
          }
        ]
      }
    },
    {
      title: "Universal Prompting Techniques",
      slug: "universal-prompting-techniques",
      description: "Master the art of prompt engineering to get the best results from any AI model.",
      order: 4,
      duration: "60 min",
      difficulty: "M",
      category: "Prompt Engineering",
      sectionId: sections[0].id,
      status: "published",
      topics: ["Prompt Structure", "Context Setting", "Best Practices"],
      learnContent: {
        sections: [
          {
            title: "The Science of Prompting",
            content: "Understanding how AI models interpret and respond to prompts."
          }
        ]
      }
    },
    {
      title: "Advanced Prompting Strategies",
      slug: "advanced-prompting-strategies",
      description: "Take your prompting skills to the next level with advanced techniques and strategies.",
      order: 5,
      duration: "60 min",
      difficulty: "H",
      category: "Prompt Engineering",
      sectionId: sections[0].id,
      status: "published",
      topics: ["Chain-of-Thought", "Few-Shot Learning", "Role Playing"],
      learnContent: {
        sections: [
          {
            title: "Advanced Techniques",
            content: "Learn sophisticated prompting methods used by AI professionals."
          }
        ]
      }
    },
    {
      title: "AI-Enhanced Team Workflows",
      slug: "ai-enhanced-team-workflows",
      description: "Learn how to integrate AI into your team's daily workflows for maximum productivity.",
      order: 6,
      duration: "50 min",
      difficulty: "M",
      category: "Team Collaboration",
      sectionId: sections[1].id,
      status: "published",
      topics: ["Collaboration Tools", "Process Automation", "Team Productivity"],
      learnContent: {
        sections: [
          {
            title: "AI in Team Collaboration",
            content: "Transform how your team works together using AI-powered tools."
          }
        ]
      }
    },
    {
      title: "Building AI Knowledge Bases",
      slug: "building-ai-knowledge-bases",
      description: "Create and maintain AI-powered knowledge bases for your organization.",
      order: 7,
      duration: "55 min",
      difficulty: "H",
      category: "Knowledge Management",
      sectionId: sections[1].id,
      status: "published",
      topics: ["Documentation", "Search", "Knowledge Sharing"],
      learnContent: {
        sections: [
          {
            title: "AI-Powered Documentation",
            content: "Build intelligent knowledge bases that grow with your organization."
          }
        ]
      }
    },
    {
      title: "Building Custom AI Agents",
      slug: "building-custom-ai-agents",
      description: "Learn to build custom AI agents tailored to your specific business needs.",
      order: 8,
      duration: "90 min",
      difficulty: "H",
      category: "Advanced Development",
      sectionId: sections[2].id,
      status: "published",
      topics: ["Agent Design", "API Integration", "Custom Solutions"],
      learnContent: {
        sections: [
          {
            title: "Introduction to AI Agents",
            content: "Understand the architecture and capabilities of modern AI agents."
          }
        ]
      }
    }
  ]

  // Create all lessons
  const createdLessons = await Promise.all(
    lessons.map(lesson => 
      prisma.lesson.create({
        data: {
          ...lesson,
          courseId: course.id,
          isPublished: true,
          introVideoUrl: "https://vz-76cc2498-caa.b-cdn.net/sample-video.mp4",
          questions: [
            {
              question: "What is the main benefit of using AI?",
              answers: ["Cost reduction", "Increased efficiency", "Better accuracy", "All of the above"],
              correctAnswer: 3
            }
          ],
          resources: [
            {
              title: "Additional Reading",
              type: "article",
              url: "https://example.com/article"
            }
          ]
        }
      })
    )
  )

  console.log('✅ Created', createdLessons.length, 'lessons')

  // Create labs
  const labs = [
    {
      title: "Build Your First AI Chatbot",
      slug: "build-first-ai-chatbot",
      description: "Master conversational AI fundamentals by creating an intelligent chatbot from scratch. Learn prompt engineering, conversation flow design, and API integration.",
      difficulty: "Beginner",
      duration: "45 min",
      technologies: ["Vercel AI SDK", "React", "OpenAI"],
      category: "Free",
      isPremium: false,
      color: "cyan",
      icon: "MessageSquare",
      projectType: "Content Creation",
      learningOutcomes: [
        "Understanding conversational AI patterns",
        "API integration with OpenAI",
        "Building responsive chat interfaces",
        "Implementing conversation memory"
      ],
      prerequisites: "Basic JavaScript knowledge"
    },
    {
      title: "AI-Powered Image Generator",
      slug: "ai-powered-image-generator",
      description: "Create stunning AI-generated images from text prompts. Explore DALL-E, Midjourney alternatives, and learn prompt optimization techniques for better results.",
      difficulty: "Intermediate",
      duration: "1.5 hours",
      technologies: ["Fal AI", "DALL-E API", "Next.js"],
      category: "Free",
      isPremium: false,
      color: "purple",
      icon: "Image",
      projectType: "Content Creation",
      learningOutcomes: [
        "Generative AI model understanding",
        "Prompt engineering for images",
        "API rate limiting and optimization",
        "Building image gallery interfaces"
      ],
      prerequisites: "React/Next.js basics"
    },
    {
      title: "Automated Content Summarizer",
      slug: "automated-content-summarizer",
      description: "Build an intelligent summarization tool that processes long documents, articles, and PDFs. Learn text processing, chunking strategies, and summary quality optimization.",
      difficulty: "Beginner",
      duration: "30 min",
      technologies: ["OpenAI", "PDF.js", "TailwindCSS"],
      category: "Free",
      isPremium: false,
      color: "orange",
      icon: "FileText",
      projectType: "Research",
      learningOutcomes: [
        "Text processing and chunking",
        "Document parsing techniques",
        "Summary quality metrics",
        "UI/UX for content tools"
      ],
      prerequisites: "Basic web development"
    },
    {
      title: "Research Assistant Bot",
      slug: "research-assistant-bot",
      description: "Create an AI-powered research assistant that can search, analyze, and synthesize information from multiple sources. Perfect for academic and business research.",
      difficulty: "Advanced",
      duration: "2 hours",
      technologies: ["LangChain", "Vector DB", "Python"],
      category: "Free",
      isPremium: false,
      color: "green",
      icon: "Database",
      projectType: "Research",
      learningOutcomes: [
        "Vector database fundamentals",
        "RAG (Retrieval Augmented Generation)",
        "Multi-source data integration",
        "Research workflow automation"
      ],
      prerequisites: "Python programming"
    },
    {
      title: "Code Generation Assistant",
      slug: "code-generation-assistant",
      description: "Build a powerful code generation tool that can write, debug, and optimize code across multiple programming languages using AI.",
      difficulty: "Intermediate",
      duration: "1 hour",
      technologies: ["GitHub Copilot API", "Monaco Editor", "TypeScript"],
      category: "Free",
      isPremium: false,
      color: "blue",
      icon: "Code2",
      projectType: "Coding",
      learningOutcomes: [
        "Code generation patterns",
        "IDE integration basics",
        "Code quality assessment",
        "Multi-language support"
      ],
      prerequisites: "Intermediate programming skills"
    },
    {
      title: "Sales Data Analyzer",
      slug: "sales-data-analyzer",
      description: "Transform raw sales data into actionable insights using AI. Build dashboards, predict trends, and generate automated reports.",
      difficulty: "Intermediate",
      duration: "1.5 hours",
      technologies: ["OpenAI", "Chart.js", "Pandas"],
      category: "Free",
      isPremium: false,
      color: "indigo",
      icon: "BarChart",
      projectType: "Data Analysis",
      learningOutcomes: [
        "Data preprocessing with AI",
        "Predictive analytics basics",
        "Interactive visualizations",
        "Automated report generation"
      ],
      prerequisites: "Basic data concepts"
    },
    {
      title: "Email Automation System",
      slug: "email-automation-system",
      description: "Design and implement an intelligent email automation system that personalizes content, schedules sends, and analyzes engagement.",
      difficulty: "Advanced",
      duration: "2 hours",
      technologies: ["SendGrid", "AI APIs", "Node.js"],
      category: "Free",
      isPremium: false,
      color: "pink",
      icon: "Sparkles",
      projectType: "Automation",
      learningOutcomes: [
        "Email personalization with AI",
        "Workflow automation design",
        "A/B testing strategies",
        "Engagement analytics"
      ],
      prerequisites: "API integration experience"
    },
    {
      title: "SEO Content Optimizer",
      slug: "seo-content-optimizer",
      description: "Create an AI tool that analyzes and optimizes content for search engines while maintaining readability and engagement.",
      difficulty: "Expert",
      duration: "2.5 hours",
      technologies: ["SEO APIs", "NLP Libraries", "React"],
      category: "Free",
      isPremium: false,
      color: "yellow",
      icon: "TrendingUp",
      projectType: "Content Creation",
      learningOutcomes: [
        "SEO fundamentals with AI",
        "Content quality scoring",
        "Keyword optimization",
        "Performance tracking"
      ],
      prerequisites: "SEO and content marketing knowledge"
    }
  ]

  // Create all labs
  const createdLabs = await Promise.all(
    labs.map(lab => 
      prisma.lab.create({
        data: {
          ...lab,
          isPublished: true,
          content: "Lab content goes here...",
          instructions: {
            steps: [
              "Set up your development environment",
              "Install required dependencies",
              "Follow the guided tutorial"
            ]
          },
          resources: [
            {
              title: "Documentation",
              type: "docs",
              url: "https://docs.example.com"
            }
          ]
        }
      })
    )
  )

  console.log('✅ Created', createdLabs.length, 'labs')

  // Update lesson navigation (previous/next)
  for (let i = 0; i < createdLessons.length; i++) {
    const updates: any = {}
    
    if (i > 0) {
      updates.previousLessonId = createdLessons[i - 1].id
    }
    
    if (i < createdLessons.length - 1) {
      updates.nextLessonId = createdLessons[i + 1].id
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.lesson.update({
        where: { id: createdLessons[i].id },
        data: updates
      })
    }
  }

  console.log('✅ Updated lesson navigation links')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })