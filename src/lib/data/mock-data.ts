/**
 * Mock/seed data for development. Provides realistic content for
 * 3 courses, 15+ lessons, 5 labs, study streaks, bookmarks, and notifications.
 * This file is the single source of truth for all mock data.
 */

import type {
  Course,
  Lab,
  LessonProgress,
  LabProgress,
  CourseProgress,
  StudyStreak,
  Bookmark,
  Note,
  Certificate,
  Notification,
  Lesson,
} from "@/lib/types"

// ─── Courses ──────────────────────────────────────────────────────────────────

export const mockCourses: Course[] = [
  {
    id: "course_001",
    slug: "ai-fundamentals",
    title: "AI Fundamentals",
    description:
      "Master the core concepts of artificial intelligence, from neural networks to transformers. Build a solid foundation for your AI journey.",
    thumbnail: "/images/courses/ai-fundamentals.jpg",
    blurDataUrl: null,
    price: 0,
    category: "AI Fundamentals",
    difficulty: "beginner",
    estimatedDuration: 480,
    sections: [
      {
        id: "section_001",
        title: "Introduction to AI",
        order: 1,
        lessons: [
          { id: "lesson_001", slug: "what-is-ai", title: "What is Artificial Intelligence?", order: 1, duration: 25, status: "completed" },
          { id: "lesson_002", slug: "history-of-ai", title: "A Brief History of AI", order: 2, duration: 20, status: "completed" },
          { id: "lesson_003", slug: "types-of-ai", title: "Types of AI: Narrow vs General", order: 3, duration: 30, status: "completed" },
        ],
      },
      {
        id: "section_002",
        title: "Machine Learning Basics",
        order: 2,
        lessons: [
          { id: "lesson_004", slug: "ml-overview", title: "What is Machine Learning?", order: 1, duration: 35, status: "completed" },
          { id: "lesson_005", slug: "supervised-learning", title: "Supervised Learning", order: 2, duration: 40, status: "in-progress" },
          { id: "lesson_006", slug: "unsupervised-learning", title: "Unsupervised Learning", order: 3, duration: 35, status: "available" },
        ],
      },
      {
        id: "section_003",
        title: "Neural Networks",
        order: 3,
        lessons: [
          { id: "lesson_007", slug: "intro-to-neural-nets", title: "Introduction to Neural Networks", order: 1, duration: 45, status: "locked" },
          { id: "lesson_008", slug: "activation-functions", title: "Activation Functions & Backpropagation", order: 2, duration: 40, status: "locked" },
          { id: "lesson_009", slug: "training-neural-nets", title: "Training Your First Neural Network", order: 3, duration: 50, status: "locked" },
        ],
      },
    ],
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2026-01-15"),
  },
  {
    id: "course_002",
    slug: "prompt-engineering",
    title: "Prompt Engineering Mastery",
    description:
      "Learn to craft effective prompts for LLMs. From basic techniques to advanced chain-of-thought reasoning and system prompts.",
    thumbnail: "/images/courses/prompt-engineering.jpg",
    blurDataUrl: null,
    price: 4900,
    category: "Prompt Engineering",
    difficulty: "intermediate",
    estimatedDuration: 360,
    sections: [
      {
        id: "section_004",
        title: "Prompt Fundamentals",
        order: 1,
        lessons: [
          { id: "lesson_010", slug: "anatomy-of-a-prompt", title: "Anatomy of a Good Prompt", order: 1, duration: 30, status: "completed" },
          { id: "lesson_011", slug: "zero-shot-few-shot", title: "Zero-Shot vs Few-Shot Prompting", order: 2, duration: 35, status: "completed" },
        ],
      },
      {
        id: "section_005",
        title: "Advanced Techniques",
        order: 2,
        lessons: [
          { id: "lesson_012", slug: "chain-of-thought", title: "Chain-of-Thought Reasoning", order: 1, duration: 40, status: "in-progress" },
          { id: "lesson_013", slug: "system-prompts", title: "System Prompts & Personas", order: 2, duration: 35, status: "available" },
          { id: "lesson_014", slug: "prompt-chaining", title: "Prompt Chaining & Orchestration", order: 3, duration: 45, status: "locked" },
        ],
      },
    ],
    createdAt: new Date("2025-08-15"),
    updatedAt: new Date("2026-02-01"),
  },
  {
    id: "course_003",
    slug: "building-ai-apps",
    title: "Building AI-Powered Applications",
    description:
      "Go from concept to deployment. Build real-world applications using LLM APIs, RAG pipelines, vector databases, and modern AI tooling.",
    thumbnail: "/images/courses/building-ai-apps.jpg",
    blurDataUrl: null,
    price: 9900,
    category: "AI Development",
    difficulty: "advanced",
    estimatedDuration: 720,
    sections: [
      {
        id: "section_006",
        title: "LLM APIs & SDKs",
        order: 1,
        lessons: [
          { id: "lesson_015", slug: "openai-api-basics", title: "Working with the OpenAI API", order: 1, duration: 45, status: "available" },
          { id: "lesson_016", slug: "anthropic-api", title: "Building with Anthropic's Claude API", order: 2, duration: 45, status: "available" },
        ],
      },
      {
        id: "section_007",
        title: "RAG & Vector Databases",
        order: 2,
        lessons: [
          { id: "lesson_017", slug: "intro-to-rag", title: "Introduction to RAG", order: 1, duration: 50, status: "locked" },
          { id: "lesson_018", slug: "vector-databases", title: "Vector Databases: Qdrant & Pinecone", order: 2, duration: 45, status: "locked" },
        ],
      },
    ],
    createdAt: new Date("2025-11-01"),
    updatedAt: new Date("2026-02-10"),
  },
]

// ─── Full Lessons (for lesson viewer) ─────────────────────────────────────────

export const mockLessons: Lesson[] = [
  {
    id: "lesson_001",
    slug: "what-is-ai",
    title: "What is Artificial Intelligence?",
    description: "Explore the definition, scope, and real-world applications of artificial intelligence.",
    order: 1,
    duration: 25,
    difficulty: "beginner",
    category: "AI Fundamentals",
    sectionId: "section_001",
    courseId: "course_001",
    courseSlug: "ai-fundamentals",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    learnContent: `# What is Artificial Intelligence?

Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans.

## Key Concepts

- **Machine Learning**: Systems that learn from data
- **Deep Learning**: Neural networks with multiple layers
- **Natural Language Processing**: Understanding human language
- **Computer Vision**: Interpreting visual information

## Real-World Applications

AI is everywhere in our daily lives:

1. **Virtual Assistants** — Siri, Alexa, Google Assistant
2. **Recommendation Systems** — Netflix, Spotify, YouTube
3. **Autonomous Vehicles** — Self-driving cars and drones
4. **Healthcare** — Disease diagnosis, drug discovery

\`\`\`python
# A simple example of AI classification
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
\`\`\`

## Summary

AI is transforming every industry. In this course, you'll build a solid foundation to understand and work with AI systems.`,
    audioFileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    audioDuration: 375,
    buildVideoUrl: null,
    buildInstructions: null,
    questions: [
      {
        id: "q_001",
        question: "What does AI stand for?",
        options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Integration", "Algorithmic Inference"],
        correctOptionIndex: 1,
        explanation: "AI stands for Artificial Intelligence — the simulation of human intelligence in machines.",
      },
      {
        id: "q_002",
        question: "Which of these is NOT a subfield of AI?",
        options: ["Machine Learning", "Natural Language Processing", "Quantum Computing", "Computer Vision"],
        correctOptionIndex: 2,
        explanation: "Quantum Computing is a separate field of computer science, not a subfield of AI.",
      },
      {
        id: "q_003",
        question: "What type of AI can learn from data without explicit programming?",
        options: ["Rule-based AI", "Machine Learning", "Symbolic AI", "Expert Systems"],
        correctOptionIndex: 1,
        explanation: "Machine Learning enables systems to learn patterns from data rather than following explicit rules.",
      },
    ],
    resources: [
      { title: "AI Wikipedia Article", url: "https://en.wikipedia.org/wiki/Artificial_intelligence", type: "link" },
      { title: "Stanford AI Index Report", url: "https://aiindex.stanford.edu/report/", type: "article" },
    ],
    status: "completed",
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2026-01-10"),
  },
  {
    id: "lesson_005",
    slug: "supervised-learning",
    title: "Supervised Learning",
    description: "Understand how supervised learning works with labeled data, including classification and regression.",
    order: 2,
    duration: 40,
    difficulty: "beginner",
    category: "AI Fundamentals",
    sectionId: "section_002",
    courseId: "course_001",
    courseSlug: "ai-fundamentals",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    learnContent: `# Supervised Learning

Supervised learning is the most common type of machine learning. The algorithm learns from labeled training data to make predictions on new, unseen data.

## How It Works

1. **Training Phase**: Feed the model labeled examples (input → output pairs)
2. **Learning**: The model finds patterns connecting inputs to outputs
3. **Prediction**: Use the trained model on new, unlabeled data

## Types of Supervised Learning

### Classification
Predicting a **category** or **class label**.

- Email: spam or not spam?
- Image: cat or dog?
- Patient: healthy or at risk?

### Regression
Predicting a **continuous value**.

- House price prediction
- Temperature forecasting
- Stock price estimation

\`\`\`python
# Classification example
from sklearn.tree import DecisionTreeClassifier

clf = DecisionTreeClassifier()
clf.fit(X_train, y_train)

# Predict the class for new data
prediction = clf.predict([[5.1, 3.5, 1.4, 0.2]])
print(f"Predicted class: {prediction[0]}")
\`\`\`

## Key Metrics

| Metric | Classification | Regression |
|--------|---------------|------------|
| Accuracy | ✅ | ❌ |
| Precision/Recall | ✅ | ❌ |
| MAE | ❌ | ✅ |
| R² Score | ❌ | ✅ |`,
    audioFileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    audioDuration: 345,
    buildVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    buildInstructions: `## Build: Train a Classifier

In this exercise, you'll train a decision tree classifier on the Iris dataset.

### Step 1: Set up your environment
\`\`\`bash
pip install scikit-learn pandas matplotlib
\`\`\`

### Step 2: Load and explore the data
\`\`\`python
from sklearn.datasets import load_iris
import pandas as pd

iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['species'] = iris.target
print(df.head())
\`\`\`

### Step 3: Train the model
\`\`\`python
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)

clf = DecisionTreeClassifier()
clf.fit(X_train, y_train)
print(f"Accuracy: {clf.score(X_test, y_test):.2%}")
\`\`\``,
    questions: [
      {
        id: "q_004",
        question: "What type of data does supervised learning require?",
        options: ["Unlabeled data", "Labeled data", "Synthetic data", "Streaming data"],
        correctOptionIndex: 1,
        explanation: "Supervised learning requires labeled data — input-output pairs where the correct answer is known.",
      },
      {
        id: "q_005",
        question: "Predicting house prices is an example of which type of supervised learning?",
        options: ["Classification", "Regression", "Clustering", "Reinforcement Learning"],
        correctOptionIndex: 1,
        explanation: "House price prediction outputs a continuous number, making it a regression problem.",
      },
    ],
    resources: [
      { title: "Scikit-learn Documentation", url: "https://scikit-learn.org/stable/", type: "link" },
    ],
    status: "in-progress",
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2026-01-12"),
  },
]

// ─── Labs ─────────────────────────────────────────────────────────────────────

export const mockLabs: Lab[] = [
  {
    id: "lab_001",
    slug: "chatbot-with-openai",
    title: "Build a Chatbot with OpenAI",
    description: "Create a fully functional chatbot using the OpenAI API, React, and Next.js with streaming responses.",
    difficulty: "intermediate",
    duration: 90,
    technologies: ["TypeScript", "React", "Next.js", "OpenAI API"],
    learningOutcomes: [
      "Set up an OpenAI API integration",
      "Implement streaming chat responses",
      "Build a responsive chat interface",
      "Handle errors and rate limits",
    ],
    prerequisites: "Basic knowledge of React and TypeScript",
    content: "In this lab, you'll build a production-ready chatbot from scratch...",
    instructions: [
      { step: 1, title: "Project Setup", content: "Initialize a new Next.js project and install the OpenAI SDK..." },
      { step: 2, title: "API Route", content: "Create an API route that handles chat completions with streaming..." },
      { step: 3, title: "Chat UI", content: "Build the chat interface with message bubbles and auto-scroll..." },
      { step: 4, title: "Error Handling", content: "Add error boundaries, rate limit handling, and retry logic..." },
      { step: 5, title: "Polish & Deploy", content: "Add loading states, keyboard shortcuts, and deploy to Vercel..." },
    ],
    category: "AI Development",
    projectType: "Web Application",
    color: "oklch(0.7 0.18 220)",
    icon: "MessageSquare",
    isPremium: false,
    createdAt: new Date("2025-09-01"),
    updatedAt: new Date("2026-01-20"),
  },
  {
    id: "lab_002",
    slug: "rag-pipeline",
    title: "Build a RAG Pipeline",
    description: "Create a Retrieval-Augmented Generation pipeline with document embeddings, vector search, and LLM responses.",
    difficulty: "advanced",
    duration: 120,
    technologies: ["Python", "LangChain", "Qdrant", "OpenAI"],
    learningOutcomes: [
      "Chunk and embed documents",
      "Store vectors in Qdrant",
      "Implement semantic search",
      "Generate context-aware responses",
    ],
    prerequisites: "Familiarity with Python and basic ML concepts",
    content: "RAG combines the power of retrieval systems with generative AI...",
    instructions: [
      { step: 1, title: "Environment Setup", content: "Install Python dependencies and set up Qdrant..." },
      { step: 2, title: "Document Processing", content: "Chunk documents and generate embeddings..." },
      { step: 3, title: "Vector Storage", content: "Store embeddings in Qdrant and configure search..." },
      { step: 4, title: "Query Pipeline", content: "Build the retrieval and generation pipeline..." },
    ],
    category: "AI Development",
    projectType: "Data Pipeline",
    color: "oklch(0.65 0.16 165)",
    icon: "Database",
    isPremium: true,
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2026-02-05"),
  },
  {
    id: "lab_003",
    slug: "image-classifier",
    title: "Image Classification with TensorFlow",
    description: "Train a convolutional neural network to classify images using TensorFlow and Keras.",
    difficulty: "intermediate",
    duration: 75,
    technologies: ["Python", "TensorFlow", "Keras", "NumPy"],
    learningOutcomes: [
      "Preprocess image datasets",
      "Build a CNN architecture",
      "Train and evaluate a model",
      "Use data augmentation",
    ],
    prerequisites: "Basic Python, understanding of neural networks",
    content: "Image classification is one of the most fundamental tasks in computer vision...",
    instructions: [
      { step: 1, title: "Data Preparation", content: "Download and preprocess the CIFAR-10 dataset..." },
      { step: 2, title: "Model Architecture", content: "Build a CNN with convolutional and pooling layers..." },
      { step: 3, title: "Training", content: "Train the model with data augmentation..." },
      { step: 4, title: "Evaluation", content: "Evaluate accuracy and visualize predictions..." },
    ],
    category: "Machine Learning",
    projectType: "ML Model",
    color: "oklch(0.75 0.15 75)",
    icon: "ImageIcon",
    isPremium: false,
    createdAt: new Date("2025-07-15"),
    updatedAt: new Date("2026-01-10"),
  },
  {
    id: "lab_004",
    slug: "sentiment-analysis-api",
    title: "Sentiment Analysis REST API",
    description: "Build a sentiment analysis API using Hugging Face Transformers and FastAPI.",
    difficulty: "intermediate",
    duration: 60,
    technologies: ["Python", "FastAPI", "Hugging Face", "Docker"],
    learningOutcomes: [
      "Load a pre-trained sentiment model",
      "Build a REST API with FastAPI",
      "Containerize with Docker",
      "Add batch processing",
    ],
    prerequisites: "Basic Python and REST API concepts",
    content: "Sentiment analysis determines the emotional tone of text...",
    instructions: [
      { step: 1, title: "Model Setup", content: "Load the pre-trained sentiment analysis pipeline..." },
      { step: 2, title: "API Development", content: "Create FastAPI endpoints for single and batch analysis..." },
      { step: 3, title: "Docker", content: "Containerize the application for deployment..." },
    ],
    category: "NLP",
    projectType: "API",
    color: "oklch(0.627 0.265 303.9)",
    icon: "Brain",
    isPremium: false,
    createdAt: new Date("2025-08-01"),
    updatedAt: new Date("2026-01-05"),
  },
  {
    id: "lab_005",
    slug: "ai-agent-framework",
    title: "Build an AI Agent Framework",
    description: "Create a modular AI agent with tool use, memory, and multi-step reasoning capabilities.",
    difficulty: "advanced",
    duration: 150,
    technologies: ["TypeScript", "Anthropic API", "Zod", "Node.js"],
    learningOutcomes: [
      "Design an agent loop with tool calling",
      "Implement memory and context management",
      "Build custom tools with schema validation",
      "Handle multi-step reasoning chains",
    ],
    prerequisites: "Strong TypeScript skills, familiarity with LLM APIs",
    content: "AI agents go beyond simple chat — they can reason, plan, and take actions...",
    instructions: [
      { step: 1, title: "Agent Core", content: "Build the core agent loop with message handling..." },
      { step: 2, title: "Tool System", content: "Implement the tool registration and execution system..." },
      { step: 3, title: "Memory", content: "Add conversation memory and context window management..." },
      { step: 4, title: "Custom Tools", content: "Build tools for web search, file operations, and code execution..." },
      { step: 5, title: "Multi-Step Reasoning", content: "Implement chain-of-thought and task decomposition..." },
    ],
    category: "AI Development",
    projectType: "Framework",
    color: "oklch(0.65 0.18 50)",
    icon: "Cpu",
    isPremium: true,
    createdAt: new Date("2025-12-01"),
    updatedAt: new Date("2026-02-12"),
  },
]

// ─── Progress ─────────────────────────────────────────────────────────────────

export const mockLessonProgress: LessonProgress[] = [
  { lessonId: "lesson_001", isCompleted: true, progress: 1, quizScore: 100, bestQuizScore: 100, quizAttempts: 1, timeSpent: 1800, lastAccessedAt: new Date("2026-01-20") },
  { lessonId: "lesson_002", isCompleted: true, progress: 1, quizScore: 80, bestQuizScore: 80, quizAttempts: 2, timeSpent: 1500, lastAccessedAt: new Date("2026-01-22") },
  { lessonId: "lesson_003", isCompleted: true, progress: 1, quizScore: 90, bestQuizScore: 90, quizAttempts: 1, timeSpent: 2100, lastAccessedAt: new Date("2026-01-25") },
  { lessonId: "lesson_004", isCompleted: true, progress: 1, quizScore: 70, bestQuizScore: 85, quizAttempts: 3, timeSpent: 2400, lastAccessedAt: new Date("2026-01-28") },
  { lessonId: "lesson_005", isCompleted: false, progress: 0.6, quizScore: null, bestQuizScore: null, quizAttempts: 0, timeSpent: 900, lastAccessedAt: new Date("2026-02-14") },
  { lessonId: "lesson_010", isCompleted: true, progress: 1, quizScore: 95, bestQuizScore: 95, quizAttempts: 1, timeSpent: 2000, lastAccessedAt: new Date("2026-02-01") },
  { lessonId: "lesson_011", isCompleted: true, progress: 1, quizScore: 85, bestQuizScore: 85, quizAttempts: 1, timeSpent: 2200, lastAccessedAt: new Date("2026-02-05") },
  { lessonId: "lesson_012", isCompleted: false, progress: 0.3, quizScore: null, bestQuizScore: null, quizAttempts: 0, timeSpent: 600, lastAccessedAt: new Date("2026-02-13") },
]

export const mockLabProgress: LabProgress[] = [
  { labId: "lab_001", isCompleted: false, progress: 0.6, currentStep: 3, lastAccessedAt: new Date("2026-02-10") },
  { labId: "lab_003", isCompleted: true, progress: 1, currentStep: 4, lastAccessedAt: new Date("2026-01-30") },
  { labId: "lab_004", isCompleted: false, progress: 0.33, currentStep: 1, lastAccessedAt: new Date("2026-02-08") },
]

export const mockCourseProgress: CourseProgress[] = [
  { courseId: "course_001", progress: 0.44, completedLessons: 4, totalLessons: 9, completedAt: null },
  { courseId: "course_002", progress: 0.4, completedLessons: 2, totalLessons: 5, completedAt: null },
  { courseId: "course_003", progress: 0, completedLessons: 0, totalLessons: 4, completedAt: null },
]

// ─── Study Streak ─────────────────────────────────────────────────────────────

export const mockStudyStreak: StudyStreak = {
  currentStreak: 5,
  longestStreak: 14,
  lastActiveDate: new Date("2026-02-15"),
  weeklyActivity: [true, false, true, true, true, true, true],
  yearlyActivity: Array.from({ length: 365 }, (_, i) => {
    const date = new Date("2025-02-16")
    date.setDate(date.getDate() + i)
    return {
      date,
      // Generate somewhat realistic activity — more active recently
      count: i > 300 ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 2),
    }
  }),
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export const mockBookmarks: Bookmark[] = [
  { id: "bm_001", userId: "user_mock_001", lessonId: "lesson_005", labId: null, createdAt: new Date("2026-02-14") },
  { id: "bm_002", userId: "user_mock_001", lessonId: "lesson_012", labId: null, createdAt: new Date("2026-02-13") },
  { id: "bm_003", userId: "user_mock_001", lessonId: null, labId: "lab_001", createdAt: new Date("2026-02-10") },
  { id: "bm_004", userId: "user_mock_001", lessonId: null, labId: "lab_005", createdAt: new Date("2026-02-08") },
]

// ─── Notes ────────────────────────────────────────────────────────────────────

export const mockNotes: Note[] = [
  {
    id: "note_001",
    userId: "user_mock_001",
    lessonId: "lesson_001",
    content: "Key insight: AI is not just ML — it encompasses rule-based systems, expert systems, and more.",
    timestamp: 320,
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-01-20"),
  },
  {
    id: "note_002",
    userId: "user_mock_001",
    lessonId: "lesson_005",
    content: "Remember: classification = categories, regression = continuous values. The key difference is the output type.",
    timestamp: null,
    createdAt: new Date("2026-02-14"),
    updatedAt: new Date("2026-02-14"),
  },
]

// ─── Certificates ─────────────────────────────────────────────────────────────

export const mockCertificates: Certificate[] = []

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    userId: "user_mock_001",
    type: "achievement",
    title: "5-Day Streak! 🔥",
    message: "You've studied for 5 consecutive days. Keep up the momentum!",
    read: false,
    createdAt: new Date("2026-02-15"),
  },
  {
    id: "notif_002",
    userId: "user_mock_001",
    type: "reminder",
    title: "Continue Supervised Learning",
    message: "You're 60% through \"Supervised Learning\". Pick up where you left off!",
    read: false,
    createdAt: new Date("2026-02-15"),
  },
  {
    id: "notif_003",
    userId: "user_mock_001",
    type: "announcement",
    title: "New Lab: AI Agent Framework",
    message: "A new advanced lab has been published! Build your own AI agent with tool use and memory.",
    read: true,
    createdAt: new Date("2026-02-12"),
  },
  {
    id: "notif_004",
    userId: "user_mock_001",
    type: "achievement",
    title: "Course Progress: 44%",
    message: "You've completed 4 out of 9 lessons in AI Fundamentals. Almost halfway!",
    read: true,
    createdAt: new Date("2026-01-28"),
  },
]
