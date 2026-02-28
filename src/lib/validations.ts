/**
 * Zod validation schemas for all forms in the application.
 * Each schema defines the shape, constraints, and error messages
 * for a specific form. Types are inferred from schemas.
 */

import { z } from "zod"

// ─── Auth Forms ───────────────────────────────────────────────────────────────

/** Login form schema — email and password */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
})

/** Signup form schema — name, email, password with confirmation */
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

/** Forgot password form schema — email only */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

// ─── Profile & Settings ───────────────────────────────────────────────────────

/** Profile edit form schema */
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

/** Settings form schema — notification and display preferences */
export const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  studyReminders: z.boolean(),
  achievementAlerts: z.boolean(),
  weeklyDigest: z.boolean(),
})

// ─── Quiz ─────────────────────────────────────────────────────────────────────

/** Single quiz answer submission */
export const quizAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOption: z.number().min(0),
})

/** Full quiz submission — array of answers */
export const quizSubmissionSchema = z.object({
  lessonId: z.string().min(1),
  answers: z.array(quizAnswerSchema).min(1, "Please answer at least one question"),
})

// ─── Notes ────────────────────────────────────────────────────────────────────

/** Note creation/edit schema */
export const noteSchema = z.object({
  content: z
    .string()
    .min(1, "Note content is required")
    .max(5000, "Note must be less than 5000 characters"),
  timestamp: z.number().min(0).optional(),
})

// ─── Contact Form ────────────────────────────────────────────────────────────

/** Contact form schema — name, email, and message */
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
})

// ─── Waitlist / Newsletter ────────────────────────────────────────────────────

/** Waitlist signup schema */
export const waitlistSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
})

// ─── News Comments ───────────────────────────────────────────────────────────

/** News comment creation schema */
export const newsCommentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment is required")
    .max(2000, "Comment must be less than 2000 characters"),
  parentId: z.string().optional(),
})

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
export type QuizAnswerData = z.infer<typeof quizAnswerSchema>
export type QuizSubmissionData = z.infer<typeof quizSubmissionSchema>
export type NoteFormData = z.infer<typeof noteSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type WaitlistFormData = z.infer<typeof waitlistSchema>
export type NewsCommentFormData = z.infer<typeof newsCommentSchema>
