import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { getCourses } from "@/lib/data/courses"
import { getAllCourseProgress, getStreak } from "@/lib/data/progress"
import { getNotifications } from "@/lib/data/notifications"
import {
  getDashboardUser,
  canUserAccessCourse,
  isInGracePeriod,
} from "@/lib/auth"
import { HeroDevice } from "@/components/marketing/hero/hero-device"
import { ENABLE_BILLING, ENABLE_GWTH_SCORE, COURSE_MONTHLY_PRICE } from "@/lib/config"
import { cn } from "@/lib/utils"
import type { User, Course, CourseProgress } from "@/lib/types"
import styles from "./dashboard-fde.module.css"

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your learning dashboard and course progress.",
}

/**
 * Tailwind classes used to negate the dashboard layout padding so section
 * borders run edge-to-edge inside the max-w-[1400px] wrapper. Exported for
 * the demo route to mirror the breakout.
 */
export const DASHBOARD_BREAKOUT =
  "-mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8"

/**
 * Student dashboard. Renders one of three FDE journal-register layouts based
 * on subscription state: active (month1/2/3/ongoing or grace period), lapsed,
 * or free (visitor/registered). The visual register is the FDE journal system
 * (see DESIGN_FDE.md): Source Serif 4 display + body, JetBrains Mono metadata,
 * paper surfaces with hairline rules, dash-progress strips, square corners.
 *
 * Real data: user identity, course title, lesson progress, notifications,
 * streak. Fixture data: capstone status, progress history, lessons-updated feed,
 * portfolio. Post-beta score panel reuses <HeroDevice /> behind a flag.
 */
export default async function DashboardPage() {
  const [user, courses, courseProgress, streak, notifications] =
    await Promise.all([
      getDashboardUser(),
      getCourses(),
      getAllCourseProgress(),
      getStreak(),
      getNotifications(),
    ])

  const course = courses[0]
  const progress = course
    ? courseProgress.find((p) => p.courseId === course.id)
    : undefined

  // Layout breakout: the dashboard layout adds p-4..p-8 padding around children
  // and centers them inside max-w-[1400px]. The FDE register relies on section
  // borders running edge-to-edge, so we negate the padding here.
  const breakout = DASHBOARD_BREAKOUT

  if (!user) {
    return (
      <div className={breakout}>
        <FreeDashboard user={null} />
      </div>
    )
  }

  if (user.subscriptionState === "lapsed" && isInGracePeriod(user)) {
    return (
      <div className={breakout}>
        <LapsedDashboard
          user={user}
          course={course}
          progress={progress}
          notifications={notifications}
        />
      </div>
    )
  }

  if (canUserAccessCourse(user) && course) {
    return (
      <div className={breakout}>
        <ActiveDashboard
          user={user}
          course={course}
          progress={progress}
          streak={streak}
          notifications={notifications}
        />
      </div>
    )
  }

  return (
    <div className={breakout}>
      <FreeDashboard user={user} />
    </div>
  )
}

// ─── Active learner dashboard ─────────────────────────────────────────────────

export type ActiveDashboardProps = {
  user: User
  course: Course
  progress: CourseProgress | undefined
  streak: Awaited<ReturnType<typeof getStreak>>
  notifications: Awaited<ReturnType<typeof getNotifications>>
}

export function ActiveDashboard({
  user,
  course,
  progress,
  streak,
  notifications,
}: ActiveDashboardProps) {
  const completed = progress?.completedLessons ?? 0
  const total =
    progress?.totalLessons ??
    course.sections.flatMap((s) => s.lessons).length ??
    24
  const monthNumber = Math.max(1, user.subscriptionMonth)
  const nextLessonNumber = completed + 1

  return (
    <div className={styles.shell} data-section="dashboard-active">
      <MastRow section={`DASHBOARD · TODAY`} date={formatToday()} />

      {/* TOP TASK BAND */}
      <section className={styles.band}>
        <div>
          <p className={styles.mono}>TODAY · {formatTimeBst()}</p>
          <h1 className={styles.bandTitle}>
            Welcome back, {firstName(user.name)}.
            <br />
            <em>Five hours this week.</em>
          </h1>
          <p className={styles.bandLead}>
            Month {monthNumber}, lesson {nextLessonNumber}. {ENABLE_GWTH_SCORE
              ? "Capstone 01 approved 6 May. Score 104, verified two days ago."
              : "Your course progress is ready to continue."}
          </p>
        </div>
        <div className={styles.bandAside}>
          <p className={styles.mono}>NEXT, IF YOU HAVE 24 MINUTES</p>
          <p className={cn(styles.mono, "mt-3")}>
            LESSON {nextLessonNumber} · MONTH {monthNumber}
          </p>
          <div className={styles.asideTitle}>
            Building with Claude: your first useful tool.
          </div>
          <div className={styles.asideNote}>
            You wrote the brief yesterday. Today you ship it.
          </div>
          <div className={styles.actionRow}>
            <Link href={`/course/${course.slug}`} className={styles.buttonSolid}>
              Continue Lesson {nextLessonNumber}
            </Link>
            <Link
              href={`/course/${course.slug}`}
              className={cn(styles.buttonOutline, styles.buttonSm)}
            >
              Skip to Q&amp;A
            </Link>
          </div>
        </div>
      </section>

      {/* COURSE */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            Month {monthNumber} of 3. <em>Plain English.</em>
          </h2>
          <p className={styles.mono}>SECTION 01 · YOUR COURSE</p>
        </div>
        <div className="flex items-baseline justify-between">
          <span className={styles.mono}>
            {completed} / {total} mandatory
          </span>
        </div>
        <div className="mt-3">
          <Dashes value={completed} total={total} />
        </div>
        <div className={styles.dashMeta}>
          <span className={styles.mono}>UNLOCKED 8 APR</span>
          <span className={styles.mono}>TARGET 24 LESSONS · 7 JUN</span>
        </div>

        {/* lesson list */}
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span />
            <span className={styles.mono}>NO.</span>
            <span className={styles.mono}>LESSON</span>
            <span className={styles.mono}>LENGTH</span>
          </div>
          {/* compressed previous range */}
          <div className={styles.tableRow}>
            <span className={styles.glyphDone} aria-hidden="true">
              ✓
            </span>
            <span className={styles.mono}>
              L01–L{String(Math.max(completed, 12)).padStart(2, "0")}
            </span>
            <span className={styles.rowTitle}>
              {Math.max(completed, 12)} foundations, complete.{" "}
              <span className={styles.rowNote}>
                ChatGPT past Google, prompt patterns, three small builds.
              </span>
            </span>
            <Link href={`/course/${course.slug}`} className={styles.monoLinkMuted}>
              REVIEW →
            </Link>
          </div>
          <LessonRow
            num={nextLessonNumber}
            title="Building with Claude: your first useful tool"
            length="24 MIN"
            state="current"
          />
          <LessonRow
            num={nextLessonNumber + 1}
            title="Q&A: when to reach for which model"
            length="9 MIN"
            state="pending"
          />
          <LessonRow
            num={nextLessonNumber + 2}
            title="Reading docs without reading docs"
            length="18 MIN"
            state="pending"
          />
          <LessonRow
            num={nextLessonNumber + 3}
            title="Codex for non-engineers, part one"
            length="22 MIN"
            state="pending"
          />
          <LessonRow
            num={nextLessonNumber + 4}
            title="Plain-English automations"
            length="26 MIN"
            state="pending"
            tag="OPTIONAL"
          />
          <LessonRow
            num={nextLessonNumber + 5}
            title="Two-week capstone brief"
            length="14 MIN"
            state="pending"
          />
          <div className={styles.tableFoot}>
            <span className={styles.mono}>
              + {Math.max(0, total - nextLessonNumber - 5)} MORE LESSONS THIS MONTH
            </span>
            <Link href={`/course/${course.slug}`} className={styles.monoLink}>
              VIEW ALL {total} →
            </Link>
          </div>
        </div>

        {/* upcoming months */}
        <div className={styles.cardsRow}>
          <div className={styles.card}>
            <div className={cn(styles.cardTop, styles.flvMoss)}>
              <span>MONTH 02 · LOCKED</span>
              <span>No. 02</span>
            </div>
            <div className={styles.cardBody}>
              <h3>Apps, agents, and the consultant&rsquo;s skill.</h3>
              <p className={styles.cardNote}>
                20 mandatory plus 15 optional. Build towards app fluency.
              </p>
              <div className={styles.cardFoot}>
                <span className={styles.monoStrong}>UNLOCKS 8 JUN</span>
                <span className={styles.cardPrice}>
                  £{COURSE_MONTHLY_PRICE.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.card}>
            <div className={cn(styles.cardTop, styles.flvTeal)}>
              <span>MONTH 03 · LOCKED</span>
              <span>No. 03</span>
            </div>
            <div className={styles.cardBody}>
              <h3>Enterprise transformation, in your job.</h3>
              <p className={styles.cardNote}>
                20 mandatory plus 15 optional. Build towards enterprise fluency.
              </p>
              <div className={styles.cardFoot}>
                <span className={styles.monoStrong}>UNLOCKS 8 JUL</span>
                <span className={styles.cardPrice}>
                  £{COURSE_MONTHLY_PRICE.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRESS + CURRENTNESS */}
      <div className={styles.splitGrid}>
        <div className={styles.splitCell}>
          <p className={styles.mono}>
            {ENABLE_GWTH_SCORE ? "SECTION 02 · YOUR GWTH SCORE" : "SECTION 02 · YOUR PROGRESS"}
          </p>
          <h2 className={cn(styles.sectionTitle, "mt-3")}>
            {ENABLE_GWTH_SCORE ? (
              <>
                <em>Improving.</em> Verified two days ago.
              </>
            ) : (
              <>
                <em>{completed} complete.</em> {total - completed} lessons to go.
              </>
            )}
          </h2>

          {ENABLE_GWTH_SCORE ? (
            <div className="mt-5 max-w-[520px]">
              <HeroDevice />
            </div>
          ) : (
            <div className={styles.panel} style={{ maxWidth: "32rem" }}>
              <div className="flex items-baseline justify-between">
                <span className={styles.mono}>Course progress</span>
                <span className={styles.monoStrong}>
                  {completed} / {total}
                </span>
              </div>
              <div className="mt-4">
                <Dashes value={completed} total={total} />
              </div>
            </div>
          )}

          {ENABLE_GWTH_SCORE && (
            <div className={styles.actionRow}>
              <Link href="#" className={cn(styles.buttonOutline, styles.buttonSm)}>
                Copy public URL
              </Link>
              <Link href="#" className={cn(styles.buttonOutline, styles.buttonSm)}>
                Add to LinkedIn
              </Link>
              <Link href="#" className={cn(styles.buttonOutline, styles.buttonSm)}>
                Download QR
              </Link>
            </div>
          )}
        </div>

        <div className={styles.splitCell}>
          <p className={styles.mono}>
            {ENABLE_GWTH_SCORE ? "SECTION 03 · CREDENTIAL CURRENTNESS" : "SECTION 03 · COURSE CURRENTNESS"}
          </p>
          <h2 className={cn(styles.sectionTitle, "mt-3")}>
            {ENABLE_GWTH_SCORE ? "Score is current." : "Course is current."}{" "}
            <em>Keep going to stay up to date.</em>
          </h2>
          <div className={styles.panel}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className={styles.listTitle}>
                  {ENABLE_GWTH_SCORE ? "Last verified work: Capstone 01." : "Last completed milestone: Capstone 01."}
                </div>
                <div className={styles.listMeta}>
                  Approved 6 May by reviewer M. Patel.
                </div>
              </div>
              <span className={styles.statusGood}>✓ Stable</span>
            </div>
            <div className="mt-4">
              <Dashes value={92} total={100} segments={20} />
              <div className={styles.dashMeta}>
                <span className={styles.mono}>
                  {ENABLE_GWTH_SCORE ? "FRESHNESS 92%" : "CURRENTNESS 92%"}
                </span>
                <span className={styles.mono}>
                  {ENABLE_GWTH_SCORE ? "NEXT DECAY CHECK 11 MAY" : "NEXT REVIEW CHECK 11 MAY"}
                </span>
              </div>
            </div>
          </div>

          {/* Lessons updated */}
          <div className="mt-7">
            <div className="flex justify-between items-baseline gap-4">
              <p className={styles.mono}>UPDATED SINCE YOU LAST WATCHED · 4</p>
              <Link href="#" className={styles.monoLinkMuted}>
                MARK ALL REVIEWED
              </Link>
            </div>
            <p className={cn(styles.note, "mt-2")}>
              The course updates as the tools do. A short re-watch keeps your
              work current and in step with what employers are using right now.
            </p>
            <div className={styles.updatedList}>
              <UpdatedLessonRow
                num="L09"
                title="Reading docs without reading docs"
                change="New section on Claude Sonnet 4.5 doc-tool, 4 min added at 12:18."
                date="2 DAYS AGO"
              />
              <UpdatedLessonRow
                num="L11"
                title="Spreadsheets, plain English"
                change="Replaced the GPT-4 demo with Claude Code, same brief, faster path."
                date="5 DAYS AGO"
              />
              <UpdatedLessonRow
                num="L07"
                title="When to reach for which model"
                change="Updated pricing table and Apr-2026 model line-up. Two new examples."
                date="1 WEEK AGO"
              />
              <UpdatedLessonRow
                num="L04"
                title="Prompt patterns that survive a model swap"
                change="Re-recorded with new Claude voice. Same six patterns."
                date="2 WEEKS AGO"
              />
            </div>
            <div className="mt-3 flex justify-between items-center gap-4 flex-wrap">
              <span className={styles.mono}>
                REVIEWING UPDATED LESSONS HOLDS YOUR CURRENTNESS ABOVE 90%
              </span>
              <Link href="#" className={styles.monoLink}>
                UPDATE LOG →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            Five-hour rhythm. <em>Held for {streak.currentStreak} days.</em>
          </h2>
          <p className={styles.mono}>SECTION 04 · ACTIVITY</p>
        </div>
        <div className={styles.activityGrid}>
          <div className={styles.activityCell}>
            <p className={styles.mono}>HOURS THIS WEEK</p>
            <div className={styles.hugeNum}>5.2</div>
            <p className={styles.activityNote}>
              On target. The course is built around five hours a week, you are
              exactly there.
            </p>
            <div className={styles.factPair}>
              <div>
                <p className={styles.mono}>VS LAST WEEK</p>
                <p className={styles.factValue}>+0.8 HRS</p>
              </div>
              <div>
                <p className={styles.mono}>4-WEEK AVG</p>
                <p className={styles.factValue}>4.9 HRS</p>
              </div>
            </div>
          </div>

          <div className={styles.activityCell}>
            <div className="flex justify-between items-baseline gap-3 flex-wrap">
              <p className={styles.mono}>LAST 12 WEEKS</p>
              <p className={styles.mono}>EVERY GREEN CELL · A SESSION YOU SHIPPED</p>
            </div>
            <div className="mt-5">
              <ActivityHeatmap />
            </div>
          </div>

          <div className={styles.activityCellTeal}>
            <p className={styles.tealMono}>CURRENT STREAK</p>
            <div className={styles.hugeNumCream}>
              {streak.currentStreak}
              <span className={styles.hugeNumUnit}>DAYS</span>
            </div>
            <p className={styles.activityNoteCream}>
              Longest yet: {streak.longestStreak} days.
            </p>
            <div className={styles.tealDivider}>
              <p className={styles.tealMono}>PROJECTS SHIPPED</p>
              <div className={styles.hugeNumCream} style={{ fontSize: "2.6rem" }}>
                12
              </div>
              <p className={styles.activityNoteCream}>
                Across nine lessons, two labs, one capstone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            Every lesson ships a project. <em>They all live here.</em>
          </h2>
          <p className={styles.mono}>SECTION 05 · PORTFOLIO</p>
        </div>

        {/* capstone strip */}
        <div className={styles.capstoneStrip}>
          <span className={styles.tealMono}>CAPSTONES · 1 OF 3</span>
          <span className="flex gap-2 items-center">
            <CapstoneTick state="approved" label="C01" />
            <CapstoneTick state="brief" label="C02" />
            <CapstoneTick state="locked" label="C03" />
          </span>
          <span className={styles.capstoneNote}>
            Three pieces of verifiable work, one per month. These projects count
            for credential.
          </span>
          <Link href="#" className={styles.creamLink}>
            EVIDENCE LOCKER →
          </Link>
        </div>

        {/* portfolio grid */}
        <div className={styles.portfolioGrid}>
          <div className={styles.portfolioCell}>
            <div className="flex justify-between items-baseline gap-3 flex-wrap">
              <p className={styles.mono}>SHIPPED · 12 PROJECTS</p>
              <div className={styles.filterRow}>
                <FilterChip active>ALL</FilterChip>
                <FilterChip>CAPSTONES</FilterChip>
                <FilterChip>LESSONS</FilterChip>
                <FilterChip>LABS</FilterChip>
              </div>
            </div>
            <div className="mt-3 flex flex-col">
              <PortfolioRow
                tag="CAPSTONE 01"
                tagKind="capstone"
                title="Internal ops assistant"
                meta="Built in M1 · Claude + Notion API · approved by M. Patel"
                statusKind="approved"
                statusLabel="APPROVED"
                date="6 MAY"
              />
              <PortfolioRow
                tag="L09"
                tagKind="lesson"
                title="Doc triage scanner for inbound briefs"
                meta="Lesson project · ChatGPT · 240 lines TS"
                statusKind="public"
                statusLabel="PUBLIC"
                date="4 MAY"
              />
              <PortfolioRow
                tag="L08"
                tagKind="lesson"
                title="Three-rule email triage"
                meta="Lesson project · Claude + Gmail filter export"
                statusKind="public"
                statusLabel="PUBLIC"
                date="1 MAY"
              />
              <PortfolioRow
                tag="LAB"
                tagKind="lab"
                title="Spreadsheet QA in plain English"
                meta="Lab · practice · Claude + Sheets"
                statusKind="public"
                statusLabel="PUBLIC"
                date="28 APR"
              />
              <PortfolioRow
                tag="L07"
                tagKind="lesson"
                title="Meeting recap to Jira tickets"
                meta="Lesson project · Claude Code · 1 webhook"
                statusKind="public"
                statusLabel="PUBLIC"
                date="24 APR"
              />
              <PortfolioRow
                tag="L06"
                tagKind="lesson"
                title="Personal CRM in Notion + Claude"
                meta="Lesson project · private build"
                statusKind="private"
                statusLabel="PRIVATE"
                date="20 APR"
              />
              <PortfolioRow
                tag="LAB"
                tagKind="lab"
                title="Resume rewriter for non-tech roles"
                meta="Lab · practice · public template"
                statusKind="public"
                statusLabel="PUBLIC"
                date="17 APR"
              />
            </div>
            <div className="mt-4 flex justify-between items-center gap-3 flex-wrap">
              <Link href="#" className={styles.monoLink}>
                VIEW ALL 12 →
              </Link>
              <span className={styles.mono}>
                LESSON PROJECTS ARE REVIEWED SEPARATELY · LABS ARE PRACTICE
              </span>
            </div>
          </div>

          <div className={styles.portfolioCell}>
            <p className={styles.mono}>SAVED · 12 ITEMS</p>
            <div className={cn(styles.listTitle, "mt-2")} style={{ fontSize: "1.05rem" }}>
              Bookmarks, drafts, notes.
            </div>
            <div className="mt-3 flex flex-col">
              <SavedRow
                kind="DRAFT"
                title="Capstone 02 brief"
                date="YESTERDAY"
              />
              <SavedRow
                kind="NOTE"
                title="Six prompt patterns I keep reusing"
                date="2 MAY"
              />
              <SavedRow
                kind="LESSON"
                title="L09 · Reading docs without reading docs"
                date="29 APR"
              />
              <SavedRow
                kind="LAB"
                title="Email triage with three rules"
                date="24 APR"
              />
              <SavedRow
                kind="DRAFT"
                title="Lab idea, invoice chaser"
                date="22 APR"
              />
            </div>
            <Link
              href="/bookmarks"
              className={cn(styles.monoLink, "mt-4 inline-block")}
            >
              OPEN ALL SAVED →
            </Link>
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className={styles.section}>
        <div className="flex justify-between items-baseline gap-4">
          <p className={styles.mono}>SECTION 06 · NOTIFICATIONS</p>
          <Link href="/notifications" className={styles.monoLinkMuted}>
            MARK ALL READ
          </Link>
        </div>
        <div className="mt-4 flex flex-col">
          {notifications.length === 0 ? (
            <div className={cn(styles.bodyText, "py-3")}>
              No notifications yet.
            </div>
          ) : (
            notifications
              .slice(0, 5)
              .map((n) => (
                <NotifRow
                  key={n.id}
                  time={formatNotificationTime(n.createdAt)}
                  tag={n.type.toUpperCase()}
                  body={n.title}
                />
              ))
          )}
        </div>
      </section>

      {/* POSTSCRIPT */}
      <section className={styles.postscript}>
        <p className={styles.tealMono}>SECTION 07 · POSTSCRIPT</p>
        <div className={styles.postscriptGrid}>
          <h3 className={styles.postscriptTitle}>
            Five hours a week.
            <br />
            <em>Decide later, but keep going.</em>
          </h3>
          <p className={styles.postscriptBody}>
            {ENABLE_GWTH_SCORE
              ? "Your score reflects the last 90 days. Skip a week and the freshness check will tell you."
              : "Your progress reflects steady work. Skip a week and the review checklist will tell you where to restart."}
            Stay Current opens after Month 3 to keep things current without
            resitting the whole course.
          </p>
        </div>
      </section>

      <DashFooter />
    </div>
  )
}

// ─── Free / registered learner dashboard ──────────────────────────────────────

export function FreeDashboard({ user }: { user: User | null }) {
  const name = user ? firstName(user.name) : "there"
  return (
    <div className={styles.shell} data-section="dashboard-free">
      <MastRow section="DASHBOARD · LABS" date={formatToday()} />

      <section className={styles.band}>
        <div>
          <p className={styles.mono}>FREE LABS · BETA INVITE REQUIRED FOR COURSE</p>
          <h1 className={styles.bandTitle}>
            Welcome, {name}.
            <br />
            <em>Try a lab. Decide later.</em>
          </h1>
          <p className={styles.bandLead}>
            You have access to all 18 free labs. The course is £
            {COURSE_MONTHLY_PRICE.toFixed(0)}/month when beta billing reopens;
            access is currently invite-only and manually granted.
          </p>
        </div>
        <div className={styles.bandAside}>
          <p className={styles.mono}>BETA · 23 JUNE 2026</p>
          <div className={styles.asideTitle}>
            Month 1 unlocks Building with Claude, Codex and the consultant&rsquo;s
            prompt patterns.
          </div>
          <div className={styles.asideNote}>
            24 mandatory lessons, six optional. Five hours a week.
          </div>
          <div className={styles.actionRow}>
            <Link
              href={ENABLE_BILLING ? "/pricing" : "/signup"}
              className={styles.buttonSolid}
            >
              {ENABLE_BILLING
                ? `Buy month 1 · £${COURSE_MONTHLY_PRICE.toFixed(0)}`
                : "Request beta access"}
            </Link>
            <Link href="/about" className={cn(styles.buttonOutline, styles.buttonSm)}>
              Read the brief
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            24 lessons. <em>Plain English.</em>
          </h2>
          <p className={styles.mono}>SECTION 01 · WHAT MONTH 1 ACTUALLY CONTAINS</p>
        </div>
        <div className={styles.teaserGrid}>
          <TeaserCol
            num="01"
            title="Past ChatGPT-as-Google"
            body="Six lessons that move you from search-style prompting to real intent and iteration."
          />
          <TeaserCol
            num="02"
            title="Three small builds"
            body="A spreadsheet QA, an email triage, a brief generator. All shippable, all reviewed."
          />
          <TeaserCol
            num="03"
            title="Capstone 01"
            body="One internal-use tool you build with Claude Code. Reviewed by a human."
          />
        </div>
      </section>

      <div className={styles.splitGridWide}>
        <div className={styles.splitCell}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              18 public labs. <em>Use them tonight.</em>
            </h2>
            <p className={styles.mono}>SECTION 02 · FREE LABS · PRACTICE</p>
          </div>
          <p className={styles.mono}>NO CARD REQUIRED</p>
          <div className={styles.labList}>
            <LabFullRow title="Resume rewriter for non-tech roles" tag="JOB SEARCH" duration="40 MIN" />
            <LabFullRow title="Email triage with three rules" tag="OPS" duration="25 MIN" />
            <LabFullRow title="Spreadsheet QA in plain English" tag="OPS" duration="35 MIN" />
            <LabFullRow title="Brief generator for marketing teams" tag="MARKETING" duration="50 MIN" />
            <LabFullRow title="Reading dense PDFs without reading them" tag="RESEARCH" duration="30 MIN" />
            <div className={styles.tableFoot}>
              <span className={styles.mono}>+ 13 MORE</span>
              <Link href="/labs" className={styles.monoLink}>
                BROWSE ALL 18 →
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.splitCell}>
          <p className={styles.mono}>SECTION 03 · BETA ACCESS</p>
          <h2 className={cn(styles.sectionTitle, "mt-3")}>
            <em>Invite-only.</em> Public signup and billing are closed for beta.
          </h2>
          <div className={styles.panel}>
            <p className={styles.mono}>Plain beta progress</p>
            <div className={cn(styles.bigStat, "mt-2")}>18 free labs</div>
            <p className={cn(styles.bodyText, "mt-2")}>
              Approved learners receive course access from the GWTH team.
              Everyone else can join the waitlist and keep using the labs.
            </p>
          </div>
        </div>
      </div>

      <section className={styles.section} style={{ borderBottom: 0 }}>
        <p className={styles.note} style={{ fontSize: "1.05rem", maxWidth: "44rem" }}>
          Stay Current opens after the course to keep your knowledge updated,
          with about two hours of new content a month.
        </p>
      </section>

      <DashFooter />
    </div>
  )
}

// ─── Lapsed dashboard ─────────────────────────────────────────────────────────

export function LapsedDashboard({
  user,
  course,
  progress,
}: {
  user: User
  course: Course | undefined
  progress: CourseProgress | undefined
  notifications: Awaited<ReturnType<typeof getNotifications>>
}) {
  const completed = progress?.completedLessons ?? 13
  const total =
    progress?.totalLessons ??
    course?.sections.flatMap((s) => s.lessons).length ??
    24
  const nextLessonNumber = completed + 1
  return (
    <div className={styles.shell} data-section="dashboard-lapsed">
      <MastRow section="DASHBOARD · TODAY" date={formatToday()} />

      {/* GRACE BANNER */}
      <div className={styles.graceBanner}>
        <div className="flex items-center gap-5 flex-wrap">
          <span className={styles.statusWarm}>
            ▲ {ENABLE_BILLING ? "PAYMENT FAILED · 4 MAY" : "ACCOUNT REVIEW · BETA"}
          </span>
          <div className={styles.graceText}>
            {ENABLE_BILLING
              ? "Your card was declined. You have 6 days left in your grace period before access changes."
              : "Your beta access needs manual review. Lessons stay visible while GWTH resolves the account state."}
          </div>
        </div>
        <div className={cn(styles.actionRow, "shrink-0")} style={{ marginTop: 0 }}>
          <Link href="/settings" className={styles.buttonSolid}>
            {ENABLE_BILLING ? "Update payment" : "Contact GWTH"}
          </Link>
          <Link href="/settings" className={cn(styles.buttonOutline, styles.buttonSm)}>
            {ENABLE_BILLING ? "Pause instead" : "View settings"}
          </Link>
        </div>
      </div>

      {/* TOP TASK BAND */}
      <section className={styles.band}>
        <div>
          <p className={styles.mono}>TODAY · {formatTimeBst()}</p>
          <h1 className={styles.bandTitle}>
            You&rsquo;re still on track,
            <br />
            {firstName(user.name)}.
            <br />
            <em>{ENABLE_BILLING ? "Just not paid up." : "Access under review."}</em>
          </h1>
          <p className={styles.bandLead}>
            Lessons stay open through 14 May. Your course progress is paused
            until access is restored manually.
          </p>
        </div>
        <div className={styles.bandAside}>
          <p className={styles.mono}>NEXT, IF YOU HAVE 24 MINUTES</p>
          <p className={cn(styles.mono, "mt-3")}>
            LESSON {nextLessonNumber} · MONTH {user.subscriptionMonth} · STILL OPEN
          </p>
          <div className={styles.asideTitle}>
            Building with Claude: your first useful tool.
          </div>
          <div className={styles.asideNote}>
            Lessons keep working through your grace window.
          </div>
          <div className={styles.actionRow}>
            <Link
              href={course ? `/course/${course.slug}` : "/courses"}
              className={styles.buttonOutline}
            >
              Continue Lesson {nextLessonNumber} →
            </Link>
            <Link href="/settings" className={cn(styles.buttonSolid, styles.buttonSm)}>
              {ENABLE_BILLING ? "Resubscribe" : "Contact support"}
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <div className={styles.splitGridWide}>
        <div className={styles.splitCell}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Month {user.subscriptionMonth} of 3.
            </h2>
            <p className={styles.mono}>SECTION 01 · YOUR COURSE · STILL OPEN</p>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={styles.mono}>
              {completed} / {total} mandatory
            </span>
          </div>
          <div className="mt-3">
            <Dashes value={completed} total={total} frozen />
          </div>
          <div className={styles.dashMeta}>
            <span className={styles.mono}>OPEN UNTIL 14 MAY</span>
            <span className={styles.statusWarm}>
              ▲ {ENABLE_BILLING ? "UPDATE PAYMENT TO CONTINUE" : "MANUAL REVIEW REQUIRED"}
            </span>
          </div>

          <div className={styles.table}>
            <LessonRow
              num={nextLessonNumber}
              title="Building with Claude: your first useful tool"
              length="24 MIN"
              state="current"
            />
            <LessonRow
              num={nextLessonNumber + 1}
              title="Q&A: when to reach for which model"
              length="9 MIN"
              state="pending"
            />
            <LessonRow
              num={nextLessonNumber + 2}
              title="Reading docs without reading docs"
              length="18 MIN"
              state="pending"
            />
            <LessonRow
              num={nextLessonNumber + 3}
              title="Codex for non-engineers, part one"
              length="22 MIN"
              state="locked"
            />
            <LessonRow
              num={nextLessonNumber + 4}
              title="Plain-English automations"
              length="26 MIN"
              state="locked"
            />
            <div className={styles.tableFoot}>
              <span className={styles.statusWarm}>
                ▲ LESSONS LOCK IF GRACE LAPSES
              </span>
              <Link href="/settings" className={styles.monoLink}>
                {ENABLE_BILLING ? "UPDATE CARD →" : "CONTACT SUPPORT →"}
              </Link>
            </div>
          </div>

          {/* impact callout */}
          <div className={styles.impactGrid}>
            <div className={styles.impactCell}>
              <p className={styles.mono}>
                {ENABLE_BILLING ? "IF YOU UPDATE BY 14 MAY" : "IF ACCESS IS RESTORED"}
              </p>
              <p className={styles.impactNote}>
                Nothing changes. Lessons stay open and your capstone keeps its
                review slot.
              </p>
            </div>
            <div className={styles.impactCell}>
              <p className={styles.statusWarm}>▲ IF YOU DON&rsquo;T</p>
              <p className={styles.impactNote}>
                Lessons close 15 May. Your progress is retained, and you can
                resume at any time with no re-enrolment.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.splitCell}>
          <p className={styles.mono}>
            {ENABLE_GWTH_SCORE
              ? "SECTION 02 · YOUR GWTH SCORE · FROZEN"
              : "SECTION 02 · PROGRESS PAUSED"}
          </p>
          <h2 className={cn(styles.sectionTitle, "mt-3")}>
            <em>Holding.</em>{" "}
            {ENABLE_GWTH_SCORE ? "No new verification." : "No new course progress."}
          </h2>

          {ENABLE_GWTH_SCORE ? (
            <div className="mt-5">
              <HeroDevice />
            </div>
          ) : (
            <div className={styles.panel}>
              <p className={styles.mono}>Course progress</p>
              <div className={cn(styles.bigStat, "mt-2")}>
                {completed} / {total}
              </div>
              <div className="mt-3">
                <Dashes value={completed} total={total} frozen />
              </div>
            </div>
          )}

          <div className={styles.panelRust}>
            <p className={styles.statusWarm}>
              ▲ {ENABLE_GWTH_SCORE ? "WHAT EMPLOYERS SEE NOW" : "WHAT HAPPENS NOW"}
            </p>
            <p className={cn(styles.bodyText, "mt-2")}>
              {ENABLE_GWTH_SCORE
                ? "The public URL is marked frozen until access resumes."
                : "Course progress is paused until access is restored manually."}
            </p>
          </div>

          <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--v-line)" }}>
            <p className={styles.mono}>SECTION 03 · ACCOUNT</p>
            {ENABLE_BILLING ? (
              <div className={styles.panel}>
                <div className="flex justify-between items-center mb-2 gap-3">
                  <span className={styles.monoStrong}>VISA •••• 4421</span>
                  <span className={styles.statusWarm}>▲ Declined 4 May</span>
                </div>
                <div className={styles.note}>
                  Bank reason: insufficient funds. We will retry 11 May.
                </div>
                <div className={cn(styles.actionRow, "mt-4")}>
                  <Link href="/settings" className={cn(styles.buttonSolid, styles.buttonSm)}>
                    Update card
                  </Link>
                  <Link href="/settings" className={cn(styles.buttonOutline, styles.buttonSm)}>
                    Pause for a month
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.panel}>
                <div className={styles.listTitle}>
                  Billing is disabled for beta.
                </div>
                <p className={cn(styles.bodyText, "mt-1")}>
                  Course access changes are handled manually by the GWTH team.
                </p>
                <div className={cn(styles.actionRow, "mt-3")}>
                  <Link href="/contact" className={cn(styles.buttonOutline, styles.buttonSm)}>
                    Contact GWTH
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* postscript */}
      <section className={styles.postscript}>
        <p className={styles.tealMono}>SECTION 04 · POSTSCRIPT</p>
        <h3 className={styles.postscriptTitle}>
          Progress pauses
          <br />
          <em>until access is restored.</em>
        </h3>
        <p className={cn(styles.postscriptBody, "mt-4")} style={{ maxWidth: "40rem" }}>
          Billing is disabled during beta, so account changes go through the
          manual access process instead of billing self-service.
        </p>
      </section>

      <DashFooter />
    </div>
  )
}

// ─── Inline subcomponents ─────────────────────────────────────────────────────

function MastRow({ section, date }: { section: string; date: string }) {
  return (
    <div className={styles.mastRow}>
      <span className={styles.mono}>{section}</span>
      <span className={styles.mono}>{date}</span>
      <span className={styles.mono}>BETA · v0.4.1</span>
    </div>
  )
}

/**
 * §4.5 dash-progress strip. aria-hidden; every usage sits next to text that
 * states the same fact ("12 / 24 mandatory", "CURRENTNESS 92%").
 */
function Dashes({
  value,
  total,
  segments,
  frozen = false,
}: {
  value: number
  total: number
  segments?: number
  frozen?: boolean
}) {
  const segs = segments ?? Math.max(1, Math.min(total, 24))
  const filled =
    total === 0 ? 0 : Math.round((Math.max(0, Math.min(value, total)) / total) * segs)
  return (
    <div
      className={styles.dashes}
      aria-hidden="true"
      data-frozen={frozen ? "true" : undefined}
    >
      {Array.from({ length: segs }, (_, dash) => (
        <span key={dash} data-active={dash < filled ? "true" : undefined} />
      ))}
    </div>
  )
}

/** Lesson-state glyph. Always paired with the row's text state label. */
function StateGlyph({ state }: { state: "done" | "current" | "pending" | "locked" }) {
  if (state === "done") {
    return (
      <span className={styles.glyphDone} aria-hidden="true">
        ✓
      </span>
    )
  }
  if (state === "current") {
    return (
      <span className={styles.glyphCurrent} aria-hidden="true">
        ●
      </span>
    )
  }
  return (
    <span className={styles.glyphMuted} aria-hidden="true">
      ○
    </span>
  )
}

function LessonRow({
  num,
  title,
  length,
  state,
  tag,
}: {
  num: number
  title: string
  length: string
  state: "done" | "current" | "pending" | "locked"
  tag?: string
}) {
  const stateLabel = {
    done: "DONE",
    current: "IN PROGRESS",
    pending: "",
    locked: "NEXT MONTH",
  }[state]
  return (
    <div
      className={cn(
        styles.tableRow,
        state === "current" && styles.tableRowCurrent,
        state === "locked" && styles.tableRowLocked
      )}
    >
      <StateGlyph state={state} />
      <span className={styles.mono}>L{String(num).padStart(2, "0")}</span>
      <span>
        <span
          className={cn(
            styles.rowTitle,
            state === "current" && styles.rowTitleCurrent
          )}
        >
          {title}
          {tag && (
            <span className={cn(styles.statusMuted, "ml-2")}>{tag}</span>
          )}
        </span>
        {stateLabel && (
          <span
            className={cn(
              "block mt-0.5",
              state === "current" ? styles.statusGood : styles.statusMuted
            )}
          >
            {stateLabel}
          </span>
        )}
      </span>
      <span className={styles.mono}>{length}</span>
    </div>
  )
}

function UpdatedLessonRow({
  num,
  title,
  change,
  date,
}: {
  num: string
  title: string
  change: string
  date: string
}) {
  return (
    <div className={styles.updatedRow}>
      <span className={styles.updatedNum}>{num}</span>
      <span>
        <span className="flex items-baseline gap-2.5 justify-between">
          <span className={styles.listTitle}>{title}</span>
          <Link href="#" className={cn(styles.monoLink, "whitespace-nowrap")}>
            RE-WATCH →
          </Link>
        </span>
        <span className={cn(styles.updatedChange, "block")}>{change}</span>
      </span>
      <span className={cn(styles.mono, "whitespace-nowrap")}>{date}</span>
    </div>
  )
}

function ActivityHeatmap({ data }: { data?: number[] }) {
  // 12 weeks × 7 days = 84 cells. Default fixture matches the bundle's
  // intensity rhythm: an established 5-hour-a-week cadence with one or
  // two darker bursts per fortnight.
  const cells =
    data ??
    [
      0, 1, 1, 2, 3, 0, 0, 1, 2, 2, 3, 4, 1, 0, 1, 1, 2, 3, 4, 1, 0, 2, 3, 1,
      2, 4, 2, 0, 2, 3, 2, 1, 3, 4, 1, 1, 4, 3, 2, 3, 2, 1, 3, 2, 4, 3, 3, 2,
      4, 2, 3, 4, 3, 2, 1, 1, 3, 2, 4, 4, 3, 2, 0, 2, 3, 4, 3, 2, 4, 1, 2, 4,
      3, 2, 1, 4, 3, 2, 2, 3, 1, 2, 4, 3,
    ]
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  return (
    <div className={styles.heatGrid}>
      <div />
      {days.map((d, i) => (
        <div key={i} className={styles.heatLabel}>
          {d}
        </div>
      ))}
      {Array.from({ length: 12 }).map((_, week) => (
        <React.Fragment key={week}>
          <div className={styles.heatLabel}>W{week + 1}</div>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const heat = cells[week * 7 + day] ?? 0
            return (
              <div
                key={day}
                className={styles.heatCell}
                data-heat={heat > 0 ? heat : undefined}
              />
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}

function CapstoneTick({
  state,
  label,
}: {
  state: "approved" | "brief" | "locked"
  label: string
}) {
  return (
    <span
      className={
        state === "approved"
          ? styles.tickApproved
          : state === "brief"
            ? styles.tickBrief
            : styles.tick
      }
    >
      {state === "approved" ? "✓ " : state === "brief" ? "● " : "○ "}
      {label}
    </span>
  )
}

function FilterChip({
  children,
  active = false,
}: {
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href="#"
      className={cn(styles.filterChip, active && styles.filterChipActive)}
    >
      {children}
    </Link>
  )
}

function PortfolioRow({
  tag,
  tagKind,
  title,
  meta,
  statusKind,
  statusLabel,
  date,
}: {
  tag: string
  tagKind: "capstone" | "lesson" | "lab"
  title: string
  meta: string
  statusKind: "approved" | "public" | "private"
  statusLabel: string
  date: string
}) {
  return (
    <div className={styles.listRow}>
      <span
        className={
          tagKind === "capstone"
            ? styles.listTagCapstone
            : tagKind === "lesson"
              ? styles.listTagLesson
              : styles.listTagLab
        }
      >
        {tag}
      </span>
      <span>
        <span className={cn(styles.listTitle, "block")}>{title}</span>
        <span className={cn(styles.listMeta, "block")}>{meta}</span>
      </span>
      <span
        className={statusKind === "approved" ? styles.statusGood : styles.statusMuted}
      >
        {statusKind === "approved" ? "✓ " : statusKind === "private" ? "○ " : "· "}
        {statusLabel}
      </span>
      <span className={cn(styles.mono, "text-right whitespace-nowrap")}>{date}</span>
    </div>
  )
}

function SavedRow({
  kind,
  title,
  date,
}: {
  kind: string
  title: string
  date: string
}) {
  return (
    <div className={styles.savedRow}>
      <span className={styles.mono}>{kind}</span>
      <span className={styles.savedTitle}>{title}</span>
      <span className={styles.mono}>{date}</span>
    </div>
  )
}

function NotifRow({
  time,
  tag,
  body,
}: {
  time: string
  tag: string
  body: string
}) {
  return (
    <div className={styles.notifRow}>
      <span className={styles.mono}>{time}</span>
      <span className={styles.monoStrong}>{tag}</span>
      <span className={styles.notifBody}>{body}</span>
    </div>
  )
}

function TeaserCol({
  num,
  title,
  body,
}: {
  num: string
  title: string
  body: string
}) {
  return (
    <div className={styles.teaserCell}>
      <p className={styles.mono}>UNIT {num}</p>
      <div className={styles.teaserTitle}>{title}</div>
      <div className={styles.teaserBody}>{body}</div>
    </div>
  )
}

function LabFullRow({
  title,
  tag,
  duration,
}: {
  title: string
  tag: string
  duration: string
}) {
  return (
    <div className={styles.labRow}>
      <span className={styles.mono}>{tag}</span>
      <span className={styles.labTitle}>{title}</span>
      <span className={styles.mono}>{duration}</span>
      <Link href="/labs" className={styles.monoLink}>
        OPEN →
      </Link>
    </div>
  )
}

function DashFooter() {
  return (
    <footer className={styles.dashFooter}>
      <span className={styles.mono}>© 2026 GWTH.ai · UK</span>
      <span className={styles.mono}>Built for the 23 May beta · v0.4.1</span>
      <span className={styles.mono}>Privacy · Terms · Accessibility</span>
    </footer>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function firstName(full: string): string {
  return full.split(" ")[0] ?? full
}

function formatToday(): string {
  const now = new Date()
  const day = now.toLocaleDateString("en-GB", {
    weekday: "short",
  })
  const date = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  })
  return `${day.toUpperCase()} ${date.toUpperCase()} · ${time} BST`
}

function formatTimeBst(): string {
  const time = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  })
  return `${time} BST`
}

function formatNotificationTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffH < 1) return "JUST NOW"
  if (diffH < 24) return `${diffH}H AGO`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "YESTERDAY"
  if (diffD < 7) return `${diffD} DAYS AGO`
  return date
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase()
}
