/**
 * Comment on the real student view (bead gwth-launch-8ksq, ship student-view-comments).
 *
 * David and beta testers select words or click a picture on any page, a Comment
 * button appears at the selection, and a right-hand pane opens with the
 * selection quoted. Comments are stored here and triaged by an agent
 * (GWTH-launch-plan/scripts/comment_triage.py); David never reviews an inbox.
 *
 * This file is the contract shared by the API routes, the data layer, the
 * client comment layer and the admin pages. Keep it dependency-free.
 */

export const COMMENT_ROLES = ["admin", "beta"] as const;
export type CommentRole = (typeof COMMENT_ROLES)[number];

export const COMMENT_TARGET_TYPES = ["text", "image", "area", "page"] as const;
export type CommentTargetType = (typeof COMMENT_TARGET_TYPES)[number];

export const COMMENT_STATUSES = [
  "open", // saved, not yet triaged
  "accepted", // triage judged it valid (or it is David's); a fix is under way
  "fixed", // the fix landed (or the lesson rewrite consumed it)
  "declined", // triage judged it not valid; reason in triage.reason
  "asked", // unclear: a question is with David in the cockpit
  "withdrawn", // the author took it back
] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export const LESSON_VARIANTS = ["live", "draft"] as const;
export type LessonVariant = (typeof LESSON_VARIANTS)[number];

export const SITE_KINDS = ["preview", "production", "local"] as const;
export type SiteKind = (typeof SITE_KINDS)[number];

/**
 * Canned actions (David 2026-09-25, "Option 1, go ahead" on the hybrid): the
 * one-tap reasons from review-annotate, so words are optional. Keys and labels
 * are the contract with the triage and the lesson rewrite; add, never rename.
 */
export const CANNED_ACTIONS = {
  content: {
    label: "Content",
    actions: {
      rewrite: "Rewrite this",
      simplify: "Simplify this",
      correct: "This is wrong, correct it",
      remove: "Remove this",
    },
  },
  design: {
    label: "Design and layout",
    actions: {
      spacing: "Spacing",
      alignment: "Alignment",
      hierarchy: "Hierarchy",
      rounding: "Rounding",
      colour: "Colour",
      friendlier: "Make it friendlier",
      harsh: "Too harsh, soften it",
    },
  },
  image: {
    label: "Image",
    actions: {
      meaning_unclear: "Meaning unclear",
      replace: "Replace this image",
      simplify_image: "Simplify this image",
      wrong_style: "Wrong style",
    },
  },
  functionality: {
    label: "Works",
    actions: {
      broken: "Broken",
      confusing: "Confusing",
    },
  },
  keep: {
    label: "Keep",
    actions: {
      keep: "Keep this, I like it",
    },
  },
} as const;
export type CannedCategory = keyof typeof CANNED_ACTIONS;

export interface CommentAction {
  category: CannedCategory;
  key: string; // a key of CANNED_ACTIONS[category].actions
  label: string; // the label as shown, for the record
}

/** Where a mark sits inside its anchored element, as fractions of that element's box. */
export interface CommentShape {
  kind: "point" | "box";
  rel: { x: number; y: number; w: number; h: number };
}

/** An in-place edit of the words: applied verbatim by the lesson rewrite. */
export interface CommentTextEdit {
  original: string;
  replacement: string;
}

/** What the browser sends to POST /api/comments. */
export interface NewPageComment {
  pagePath: string;
  pageTitle?: string;
  lessonId?: string; // m1_l01
  lessonPage?: number; // 1-based page in the lesson viewer
  lessonPageTitle?: string;
  lessonVariant?: LessonVariant;
  targetType: CommentTargetType;
  quote?: string; // selected words, whitespace-normalised; for a picture, its alt text
  quotePrefix?: string; // up to 80 chars before the quote
  quoteSuffix?: string; // up to 80 chars after the quote
  selector?: string; // CSS selector of the enclosing element (id, data-testid or tag path)
  selectorKind?: "id" | "testid" | "path" | "root";
  heading?: string; // nearest preceding h1-h3 text
  imageSrc?: string;
  imageAlt?: string;
  context?: string; // ~260 chars either side of the quote, whitespace-normalised
  comment: string; // may be empty when an action or a text edit is given
  action?: CommentAction;
  shape?: CommentShape;
  textEdit?: CommentTextEdit;
  viewport?: string; // "1440x900"
}

/** A stored comment as every API returns it. */
export interface PageComment extends NewPageComment {
  id: string;
  userId: string;
  authorEmail: string;
  authorRole: CommentRole;
  site: SiteKind;
  status: CommentStatus;
  triage: CommentTriage | null;
  userAgent?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** Written by the triage script through PATCH /api/pipeline/comments/[id]. */
export interface CommentTriage {
  by: string; // "david" | "opus" | "v3-rewrite" | "admin"
  at: string; // ISO
  verdict?: "valid" | "invalid" | "unclear";
  reason?: string;
  bead?: string; // gwth-launch-xxxx when a fix was filed
  questionId?: string; // idea inbox id when David was asked
  commit?: string; // the commit that fixed it
}

export const COMMENT_MAX_LENGTH = 4000;
export const QUOTE_MAX_LENGTH = 1000;

/** DOM contract between the lesson viewer and the comment layer. */
export const LESSON_VIEWER_SELECTOR = '[data-section="lesson-viewer"]';
export const LESSON_DATA_ATTRS = {
  id: "data-lesson-id",
  page: "data-lesson-page",
  pageTitle: "data-lesson-page-title",
  variant: "data-lesson-variant",
  draftAvailable: "data-lesson-draft-available",
} as const;

/** Body of POST /api/lesson-draft/verdict (admin only, preview only). */
export interface DraftVerdictRequest {
  lessonId: string;
  verdict: "approved" | "sent_back";
  note?: string;
}
