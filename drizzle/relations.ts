import { relations } from "drizzle-orm/relations";
import { lessons, lessonResources, courses, sections, quizQuestions, newsArticles, newsVotes, newsComments, benchmarkRuns, benchmarkResults, userAccess, lessonProgress, credentialVerifications, betaAccessGrants } from "./schema";
// W11: the user-scoped relations now point at the Better Auth `user` table
// (public."user", text ids) instead of the removed Supabase `auth.users`.
import { user } from "../src/db/auth-schema";

export const lessonResourcesRelations = relations(lessonResources, ({one}) => ({
	lesson: one(lessons, {
		fields: [lessonResources.lessonId],
		references: [lessons.id]
	}),
}));

export const lessonsRelations = relations(lessons, ({one, many}) => ({
	lessonResources: many(lessonResources),
	course: one(courses, {
		fields: [lessons.courseId],
		references: [courses.id]
	}),
	section: one(sections, {
		fields: [lessons.sectionId],
		references: [sections.id]
	}),
	quizQuestions: many(quizQuestions),
	lessonProgresses: many(lessonProgress),
}));

export const sectionsRelations = relations(sections, ({one, many}) => ({
	course: one(courses, {
		fields: [sections.courseId],
		references: [courses.id]
	}),
	lessons: many(lessons),
}));

export const coursesRelations = relations(courses, ({many}) => ({
	sections: many(sections),
	lessons: many(lessons),
	credentialVerifications: many(credentialVerifications),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({one}) => ({
	lesson: one(lessons, {
		fields: [quizQuestions.lessonId],
		references: [lessons.id]
	}),
}));

export const newsVotesRelations = relations(newsVotes, ({one}) => ({
	newsArticle: one(newsArticles, {
		fields: [newsVotes.articleId],
		references: [newsArticles.id]
	}),
	user: one(user, {
		fields: [newsVotes.userId],
		references: [user.id]
	}),
}));

export const newsArticlesRelations = relations(newsArticles, ({many}) => ({
	newsVotes: many(newsVotes),
	newsComments: many(newsComments),
}));

export const userRelations = relations(user, ({many}) => ({
	newsVotes: many(newsVotes),
	newsComments: many(newsComments),
	userAccesses: many(userAccess),
	lessonProgresses: many(lessonProgress),
	credentialVerifications: many(credentialVerifications),
	betaAccessGrants: many(betaAccessGrants),
}));

export const newsCommentsRelations = relations(newsComments, ({one, many}) => ({
	newsArticle: one(newsArticles, {
		fields: [newsComments.articleId],
		references: [newsArticles.id]
	}),
	newsComment: one(newsComments, {
		fields: [newsComments.parentId],
		references: [newsComments.id],
		relationName: "newsComments_parentId_newsComments_id"
	}),
	newsComments: many(newsComments, {
		relationName: "newsComments_parentId_newsComments_id"
	}),
	user: one(user, {
		fields: [newsComments.userId],
		references: [user.id]
	}),
}));

export const benchmarkResultsRelations = relations(benchmarkResults, ({one}) => ({
	benchmarkRun: one(benchmarkRuns, {
		fields: [benchmarkResults.runId],
		references: [benchmarkRuns.id]
	}),
}));

export const benchmarkRunsRelations = relations(benchmarkRuns, ({many}) => ({
	benchmarkResults: many(benchmarkResults),
}));

export const userAccessRelations = relations(userAccess, ({one}) => ({
	user: one(user, {
		fields: [userAccess.userId],
		references: [user.id]
	}),
}));

export const lessonProgressRelations = relations(lessonProgress, ({one}) => ({
	user: one(user, {
		fields: [lessonProgress.userId],
		references: [user.id]
	}),
	lesson: one(lessons, {
		fields: [lessonProgress.lessonId],
		references: [lessons.id]
	}),
}));

export const credentialVerificationsRelations = relations(credentialVerifications, ({one}) => ({
	course: one(courses, {
		fields: [credentialVerifications.courseId],
		references: [courses.id]
	}),
	user: one(user, {
		fields: [credentialVerifications.userId],
		references: [user.id]
	}),
}));

export const betaAccessGrantsRelations = relations(betaAccessGrants, ({one}) => ({
	user: one(user, {
		fields: [betaAccessGrants.userId],
		references: [user.id]
	}),
}));