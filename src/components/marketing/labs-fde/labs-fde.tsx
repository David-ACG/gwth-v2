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
  title: "Only a few at once.",
  body: "Models change quickly, so we keep a small set of labs up to date rather than a long list that goes stale.",
}

/** A single reason the Model Arena format exists, shown in the explainer row. */
const HOW_IT_WORKS: ReadonlyArray<HowItWorksItem> = [
  {
    title: "One task, two tools.",
    body: "A real job you would actually give an AI, handed to two models with the exact same prompt.",
  },
  {
    title: "You judge, we date it.",
    body: "Outputs sit side by side with a rubric a beginner can follow, and a verdict stamped with the models and the date.",
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
 * the course. Labs are included free with a beta
 * place; during the private pre-launch period (W25) the route itself is behind
 * the content gate, so the copy must not promise anonymous reading.
 *
 * The live cards were rebuilt for bead gwth-launch-88z.32.22 from David's
 * annotation a-20260914-205407-b3dbb2: "They need a video for each lab and the
 * menu here on the labs page should show a thumbnail from the video (like
 * youtube) so people understand just by glancing what it's going to be about.
 * For example, spreadsheets." No lab video has been recorded yet, so each card
 * opens with a preview panel built from that lab's OWN material (see
 * `LabPreview`), then a plain task cue, the matchup, one outcome line in place
 * of the four-line brief that made every card look identical, and a metadata
 * row that says "Video guide planned" as a fact rather than a promise. The day
 * a lab gains a real `video` object, the same card shows its poster frame and
 * its running time with no further change here.
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
            Each lab runs two AI tools head to head on a real job, with the same
            prompt, and shows you both answers side by side. A short rubric
            helps you call the winner. Lessons teach you how; labs show you
            which tool when.
          </p>
          {/* The UK thread on this page (bead gwth-launch-88z.32.25), and it
              is a description of the labs that exist rather than a promise:
              lab 01 is a Registered Nurse vacancy at a Shropshire care home
              with an NMC pin in the advert, and lab 03 asks for the National
              Living Wage, Statutory Sick Pay and the redundancy pay cap with
              a GOV.UK link for each. Check the lab JSON before changing this
              sentence. */}
          <p className={styles.standfirst} data-testid="labs-uk-note">
            The tasks are British ones, because that is the test that tells you
            anything. A care home in Shropshire that cannot fill a nursing
            vacancy, or a payroll administrator who needs this year&apos;s
            Statutory Sick Pay rate with the GOV.UK page to prove it.
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
            <p>Included free with your beta place</p>
            <p>New matchups as the models change</p>
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
            <p className={styles.mono}>{liveLabs.length} in the arena</p>
          </div>

          {/*
            This line states the CURRENT video position, so it is derived from
            the data rather than written once and left to go stale. It said "none
            has been recorded yet" until the messy-spreadsheet guide landed
            (bead gwth-launch-88z.32.23).
          */}
          <p className={styles.sectionLead}>
            Each card previews the real material its lab starts from, so you can
            tell at a glance what the task is.{" "}
            {withVideo === 0
              ? "Video guides are planned for every lab and none has been recorded yet, which is why no card offers one to play."
              : withVideo === liveLabs.length
                ? "Every lab has a video guide, and each card shows a still from its own."
                : `${withVideo} of these ${liveLabs.length} has a video guide, and its card shows a still from it. The other cards say that their video guides are planned, and they show no play button.`}
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
                        One metadata row, and the video fact lives in it as
                        metadata rather than as the card's promise. A play
                        control appears only where media genuinely plays, which
                        for now is nowhere: `labVideoState` reads the authored
                        `video` object and nothing else.
                      */}
                      <p className={styles.cardMeta}>
                        <span className={styles.cardLive}>
                          <span aria-hidden="true">{"●"}</span>
                          Live now
                        </span>
                        <span>Tested {formatTestedOn(lab.testedOn)}</span>
                        <span data-testid="lab-video-state">
                          {video
                            ? `Video guide${
                                video.durationLabel
                                  ? `, ${video.durationLabel}`
                                  : ""
                              }`
                            : "Video guide planned"}
                        </span>
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
            The labs tell you which tool earns its keep this month. The course
            is three months of building with AI: plain English, real projects,
            and progress you can see.
          </p>
          <div className={styles.closingActions}>
            <Link href="/pricing" className={styles.buttonSolid}>
              See the course
            </Link>
            <Link href="/about" className={styles.buttonOutline}>
              About GWTH
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
