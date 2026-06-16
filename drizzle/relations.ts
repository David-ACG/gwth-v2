import { relations } from "drizzle-orm/relations";
import { lessons, lessonResources, courses, sections, quizQuestions, newsArticles, newsVotes, usersInAuth, newsComments, benchmarkRuns, benchmarkResults, userAccess, lessonProgress, credentialVerifications, betaAccessGrants } from "./schema";

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
	usersInAuth: one(usersInAuth, {
		fields: [newsVotes.userId],
		references: [usersInAuth.id]
	}),
}));

export const newsArticlesRelations = relations(newsArticles, ({many}) => ({
	newsVotes: many(newsVotes),
	newsComments: many(newsComments),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
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
	usersInAuth: one(usersInAuth, {
		fields: [newsComments.userId],
		references: [usersInAuth.id]
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
	usersInAuth: one(usersInAuth, {
		fields: [userAccess.userId],
		references: [usersInAuth.id]
	}),
}));

export const lessonProgressRelations = relations(lessonProgress, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [lessonProgress.userId],
		references: [usersInAuth.id]
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
	usersInAuth: one(usersInAuth, {
		fields: [credentialVerifications.userId],
		references: [usersInAuth.id]
	}),
}));

export const betaAccessGrantsRelations = relations(betaAccessGrants, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [betaAccessGrants.userId],
		references: [usersInAuth.id]
	}),
}));