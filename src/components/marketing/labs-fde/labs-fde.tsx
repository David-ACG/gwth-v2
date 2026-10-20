import Link from "next/link"
import type { Lab, ModelArenaLab } from "@/lib/types"
import { formatTestedOn } from "@/lib/data/model-arena"
import {
  LabPreview,
  labVideoState,
  shortLabTitle,
} from "@/components/lab/arena/lab-preview"
import { formatDate } from "@/lib/utils"
import styles from "./labs-fde.module.css"

/**
 * Whether /labs lists the archive of superseded and retired labs.
 *
 * Off since bead gwth-launch-amb. David, 2026-07-25, on the CIPD walkthrough:
 * "I'm not sure we should have all of the olds Labs archived because it just
 * looks like we started them and didn't finish them let's just have one lab
 * as a demo and then we can add more Labs later". The old labs are NOT
 * deleted: they stay in the database and on disk, and their own pages still
 * answer at /labs/<slug>. Only the listing hides them. Set this to `true` to
 * bring the archive section back; nothing else needs to change.
 */
export const LABS_ARCHIVE_VISIBLE = false

/**
 * Props for {@link LabsFde}.
 */
interface LabsFdeProps {
  /** The ~6 labs currently in rotation, newest test first. */
  liveLabs: ModelArenaLab[]
  /** Archived arena labs (superseded matchups kept for comparison). */
  archivedArenaLabs: ModelArenaLab[]
  /** Retired tiered-format labs, kept read-only as part of the archive. */
  legacyArchive: Lab[]
  /**
   * Whether to render the archive section. Defaults to
   * {@link LABS_ARCHIVE_VISIBLE}; tests pass it explicitly.
   */
  showArchive?: boolean
}

/** One item in the "how it works" explainer row. */
interface HowItWorksItem {
  /** Short heading. */
  title: string
  /** One or two sentences under it. */
  body: string
}

/**
 * The third explainer item while the archive is hidden. It must not point at
 * an archive the page no longer shows.
 */
const FEW_AT_ONCE: HowItWorksItem = {
  // It said "we keep a small set of labs up to date", beside labs tested in
  // July 2026. The labs are not re-run for the launch, so the promise went and
  // the page says what is true instead (launch readiness review, 2026-10-20).
  title: "Every lab is dated.",
  body: "Each lab names the models it tested and the date. The tools change often, so the answers you get today may differ.",
}

/** A single reason the Model Arena format exists, shown in the explainer row. */
const HOW_IT_WORKS: ReadonlyArray<HowItWorksItem> = [
  {
    title: "One task, two tools.",
    body: "Two AI tools get exactly the same instructions for a realistic work task.",
  },
  {
    title: "Compare both answers.",
    body: "The answers sit side by side with a checklist a beginner can follow, and a verdict that names the models and the date.",
  },
  {
    title: "Fresh now, kept forever.",
    body: "Only a handful run at once, because models change. Old ones move to the archive so you can watch the tools improve.",
  },
]

/**
 * A short archive row describing one superseded lab.
 */
interface ArchiveRow {
  /** Stable key. */
  key: string
  /** Destination detail route. */
  href: string
  /** Lab title. */
  title: string
  /** Mono meta line (matchup or category). */
  meta: string
  /** Human date the lab was current. */
  date: string
}

/**
 * Free labs landing in the Model Arena format, PAPER-FIRST register.
 *
 * A lab is a head-to-head test: two AI tools run the same realistic task, their
 * outputs shown verbatim side by side, with a beginner rubric and a dated
 * verdict. Labs complement lessons rather than overlap them: lessons teach you
 * HOW, labs show you WHICH TOOL WHEN. Only a handful are live at once because
 * models keep changing, and superseded ones move to a dated archive.
 *
 * Structure: a two-column quiet masthead, a "how it works" explainer, a live
 * card row, a dated ARCHIVE list (arena first, then retired tiered labs; hidden
 * while {@link LABS_ARCHIVE_VISIBLE} is false), and a closing band pointing at
 * the course. Labs are free to open; during the private pre-launch period (W25)
 * the route itself is behind the content gate.
 *
 * The live cards were rebuilt for bead gwth-launch-88z.32.22 from David's
 * annotation a-20260914-205407-b3dbb2: "They need a video for each lab and the
 * menu here on the labs page should show a thumbnail from the video (like
 * youtube) so people understand just by glancing what it's going to be about.
 * For example, spreadsheets." No lab video has been recorded yet, so each card
 * opens with a preview panel built from that lab's OWN material (see
 * `LabPreview`), then a plain task cue, the matchup, one outcome line in place
 * of the four-line brief that made every card look identical, and a metadata
 * row. A card names a video guide only where one exists: "Video guide planned"
 * was a promise of unfinished work and went on 2026-10-20 (launch readiness
 * review). The day a lab gains a real `video` object, the same card shows its
 * poster frame and its running time with no further change here.
 */
export function LabsFde({
  liveLabs,
  archivedArenaLabs,
  legacyArchive,
  showArchive = LABS_ARCHIVE_VISIBLE,
}: LabsFdeProps) {
  const howItWorks = showArchive
    ? HOW_IT_WORKS
    : [...HOW_IT_WORKS.slice(0, -1), FEW_AT_ONCE]
  // How many live labs genuinely have media. `labVideoState` is the only
  // evidence any surface accepts, so the section lead cannot drift from the
  // cards below it.
  const withVideo = liveLabs.filter(
    (l) => labVideoState(l) === "available",
  ).length
  const archiveRows: ArchiveRow[] = [
    ...archivedArenaLabs.map((lab) => ({
      key: lab.id,
      href: `/labs/${lab.slug}`,
      title: lab.title,
      meta: `${lab.matchup[0].name} vs ${lab.matchup[1].name}${
        lab.category ? ` · ${lab.category}` : ""
      }`,
      date: formatTestedOn(lab.testedOn),
    })),
    ...legacyArchive.map((lab) => ({
      key: lab.id,
      href: `/labs/${lab.slug}`,
      title: lab.title,
      meta: `${lab.category || "Lab"} · Retired format`,
      date: formatDate(lab.updatedAt),
    })),
  ]

  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            Two tools, one task. <em>You judge.</em>
          </h1>
          <p className={styles.standfirst}>
            Each lab gives two AI tools the same instructions for a realistic
            work task, then shows you both answers side by side. A short checklist
            of what a good answer should include helps you decide which is
            better. Lessons teach you how to use AI; labs help you choose which
            tool to use for a job.
          </p>
          {/* The UK thread on this page (bead gwth-launch-88z.32.25), and it
              is a description of the labs that exist rather than a promise:
              lab 01 is a Registered Nurse vacancy at a Shropshire care home
              with an NMC pin in the advert, and lab 03 asks for the National
              Living Wage, Statutory Sick Pay and the redundancy pay cap with
              a GOV.UK link for each. Check the lab JSON before changing this
              sentence. */}
          <p className={styles.standfirst} data-testid="labs-uk-note">
            The tasks are set in UK workplaces, so you see how each tool
            handles UK rules and sources. One lab asks each tool to rewrite
            a job advert for a nursing vacancy at a Shropshire care home.
            Another asks for this year&apos;s Statutory Sick Pay rate, with
            the GOV.UK page that proves it.
          </p>
          <div className={styles.mastheadActions}>
            {liveLabs[0] ? (
              <Link
                href={`/labs/${liveLabs[0].slug}`}
                className={styles.buttonSolid}
              >
                Open the live lab
              </Link>
            ) : null}
            <Link href="/pricing" className={styles.buttonOutline}>
              See the course
            </Link>
          </div>
          <div className={styles.mastheadFoot}>
            <p>Dated head-to-head tests</p>
            <p>Free, no card required</p>
          </div>
        </div>
      </section>

      <section className={styles.explainer} data-section="how-it-works">
        <div className={styles.page}>
          <div className={styles.explainerRow}>
            {howItWorks.map((item) => (
              <div key={item.title} className={styles.explainerItem}>
                <h2 className={styles.explainerTitle}>{item.title}</h2>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="live-labs">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Live now.</h2>
            <p className={styles.mono}>
              {liveLabs.length} {liveLabs.length === 1 ? "lab" : "labs"}
            </p>
          </div>

          {/*
            This line states the CURRENT video position, so it is derived from
            the data rather than written once and left to go stale. It said "none
            has been recorded yet" until the messy-spreadsheet guide landed
            (bead gwth-launch-88z.32.23).
          */}
          <p className={styles.sectionLead}>
            Start with the task that is closest to your own work.{" "}
            {/* States only what exists: no "planned" guides (launch readiness
                review, 2026-10-20). */}
            {withVideo === 0
              ? ""
              : withVideo === liveLabs.length
                ? "Each of these labs has a video guide."
                : `${withVideo} of these ${liveLabs.length} labs ${
                    withVideo === 1 ? "has" : "have"
                  } a video guide.`}
          </p>

          {liveLabs.length === 0 ? (
            <div className={styles.empty}>
              <h3>No live labs right now.</h3>
              <p>
                {showArchive
                  ? "The next matchups are being prepared. In the meantime, the archive below shows how the tools compared last time."
                  : "The next matchups are being tested. They will appear here when they are ready."}
              </p>
            </div>
          ) : (
            <div className={styles.cardsRow}>
              {liveLabs.map((lab) => {
                const video =
                  labVideoState(lab) === "available" ? lab.video : null
                return (
                  <Link
                    href={`/labs/${lab.slug}`}
                    aria-label={lab.title}
                    className={styles.card}
                    data-testid="arena-lab-card"
                    data-video-state={labVideoState(lab)}
                    key={lab.id}
                  >
                    <LabPreview lab={lab} />
                    <div className={styles.cardBody}>
                      <p className={styles.cardCue} data-testid="lab-task-cue">
                        {lab.preview?.taskCue ?? lab.category ?? "Lab"}
                        {lab.category && lab.preview?.taskCue
                          ? ` · ${lab.category}`
                          : ""}
                      </p>
                      <h3>{shortLabTitle(lab)}</h3>
                      <p className={styles.cardMatchup}>
                        {lab.matchup[0].name} vs {lab.matchup[1].name}
                      </p>
                      <p className={styles.cardOutcome}>
                        {lab.preview?.outcome ?? lab.brief}
                      </p>
                      {/*
                        One metadata row. The video fact appears only where a
                        video exists, and the index never draws a play control:
                        a card links to the lab page. `labVideoState` reads the
                        authored `video` object and nothing else.
                      */}
                      <p className={styles.cardMeta}>
                        <span className={styles.cardLive}>
                          <span aria-hidden="true">{"●"}</span>
                          Live now
                        </span>
                        <span>Tested {formatTestedOn(lab.testedOn)}</span>
                        {video ? (
                          <span data-testid="lab-video-state">
                            {`Video guide${
                              video.durationLabel
                                ? `, ${video.durationLabel}`
                                : ""
                            }`}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {showArchive ? (
        <section className={styles.section} data-section="archive">
          <div className={styles.page}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>The archive.</h2>
              <p className={styles.mono}>
                {archiveRows.length} older{" "}
                {archiveRows.length === 1 ? "lab" : "labs"}
              </p>
            </div>
            <p className={styles.sectionLead}>
              Nothing is deleted when a lab goes out of date. Kept here, the
              archive shows how the tools compared at a point in time, which
              only gets more useful as newer models arrive.
            </p>

            {archiveRows.length === 0 ? (
              <div className={styles.empty}>
                <h3>The archive is empty.</h3>
                <p>Once a live lab is superseded it will appear here, dated.</p>
              </div>
            ) : (
              <ul className={styles.archiveList}>
                {archiveRows.map((row) => (
                  <li key={row.key} className={styles.archiveItem}>
                    <Link
                      href={row.href}
                      className={styles.archiveLink}
                      data-testid="archive-lab-row"
                    >
                      <span className={styles.archiveMain}>
                        <span className={styles.archiveTitle}>{row.title}</span>
                        <span className={styles.archiveMeta}>{row.meta}</span>
                      </span>
                      <span className={styles.archiveTail}>
                        <span className={styles.archiveBadge}>Archived</span>
                        <span className={styles.archiveDate}>{row.date}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Labs show you which tool. <em>The course shows you how.</em>
          </h2>
          <p>
            Each lab shows which tool did better on one task, and the date it
            was tested. Over three months, the course shows you, in plain
            English, how to build a household helper, a simple website and
            an automation for a weekly chore. Every lesson ends with a short
            project you do yourself.
          </p>
          <div className={styles.closingActions}>
            <Link href="/pricing" className={styles.buttonSolid}>
              See the course
            </Link>
            <Link href="/why-gwth" className={styles.buttonOutline}>
              Why GWTH
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
