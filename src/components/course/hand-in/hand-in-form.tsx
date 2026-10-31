"use client"

/**
 * The capstone hand-in form and its preview (beads gwth-launch-9289.2 and
 * 9289.3).
 *
 * Two steps. "Check and preview" sends the folder, the choice of whose
 * details are in it, the names to hide and the four answers to
 * /api/hand-in/<capstone>/prepare, which stores only the redacted copies and
 * returns them. The learner reads exactly that, ticks, and "Hand in" sends
 * the tick and the preview's hash to /confirm. Nothing goes to a marker
 * before that tick.
 */
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import styles from "./hand-in.module.css"

/** Props for {@link HandInForm}. */
export interface HandInFormProps {
  /** Capstone id, the API path segment. */
  capstoneId: string
  /** The number this hand-in will get if confirmed. */
  attemptNo: number
  /** The most hand-ins allowed. */
  maxHandIns: number
  /** One line on what to hand in. */
  summary: string
  /** Label of the "my own details" choice. */
  ownLabel: string
  /** Label of the "the lesson's example" choice. */
  exampleLabel: string
  /** Kinds a names line may start with (Child, Partner...). */
  nameKinds: string[]
  /** The files the marking guide asks for. */
  expectedFiles: { id: string; label: string; required: boolean }[]
  /** The four questions. */
  questions: { id: string; question: string; help: string }[]
}

interface PreviewFile {
  path: string
  kind: "text" | "image" | "other"
  /** Set when a PDF or Word file is sent as its text: the original's path. */
  convertedFrom: string | null
  size: number
  replaced: number
  text: string | null
}

interface Preview {
  handInId: string
  hash: string
  dataChoice: "own" | "example"
  checklist: { id: string; label: string; required: boolean; found: string[] }[]
  labels: { label: string; kind: string; source: "name" | "pattern"; count: number }[]
  unusedNameLabels: string[]
  leftOut: { path: string; reason: "unreadable" }[]
  answers: Record<string, string>
  files: PreviewFile[]
}

const LABEL = /(\[[A-Z][A-Za-z]*(?: [a-z]+)? \d+\])/g

/** Shows text with every hiding label marked, so the learner can find them. */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(LABEL).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={styles.label}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

/** The hand-in form, then the preview the learner confirms. */
export function HandInForm(props: HandInFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [source, setSource] = useState<"files" | "zip" | "repo">("files")
  const [dataChoice, setDataChoice] = useState<"own" | "example">("own")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [ticked, setTicked] = useState(false)
  const [done, setDone] = useState<number | null>(null)
  const recordingRef = useRef<HTMLInputElement>(null)
  const base = `/api/hand-in/${props.capstoneId}`

  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData()
    for (const [key, value] of new FormData(form).entries()) {
      if (typeof value === "string") data.append(key, value)
    }
    if (source === "files") {
      for (const input of form.querySelectorAll<HTMLInputElement>("input[data-files]")) {
        for (const file of Array.from(input.files ?? [])) {
          // A folder pick keeps its folder path, so the marker sees the structure.
          data.append("files", file, file.webkitRelativePath || file.name)
        }
      }
    } else if (source === "zip") {
      const zip = form.querySelector<HTMLInputElement>("input[data-zip]")?.files?.[0]
      if (zip) data.append("zip", zip)
    }
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`${base}/prepare`, { method: "POST", body: data })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(json.error ?? "Please try again. Something went wrong.")
        return
      }
      setPreview(json as Preview)
      setTicked(false)
      requestAnimationFrame(() => document.getElementById("preview")?.focus())
    } catch {
      setError("Check your connection and try again. We couldn't reach the server.")
    } finally {
      setBusy(false)
    }
  }

  async function confirm() {
    if (!preview || !ticked) return
    const data = new FormData()
    data.append("hand_in_id", preview.handInId)
    data.append("preview_hash", preview.hash)
    data.append("confirm", "yes")
    const recording = recordingRef.current?.files?.[0]
    if (recording) data.append("recording", recording)
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`${base}/confirm`, { method: "POST", body: data })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(json.error ?? "Please try again. Something went wrong.")
        return
      }
      setDone(json.attemptNo)
      toast.success(`Handed in. This was hand-in ${json.attemptNo} of ${props.maxHandIns}.`)
      router.refresh()
    } catch {
      setError("Check your connection and try again. We couldn't reach the server.")
    } finally {
      setBusy(false)
    }
  }

  if (done !== null) {
    return (
      <section className={styles.section} aria-live="polite">
        <h2 className={styles.h2}>Handed in</h2>
        <p className={styles.body}>
          This was hand-in {done} of {props.maxHandIns}. You will see your mark on this page once it is ready.
        </p>
      </section>
    )
  }

  const missing = preview?.checklist.filter((c) => c.required && c.found.length === 0) ?? []

  return (
    <>
      <form ref={formRef} onSubmit={prepare} className={styles.form} hidden={preview !== null} noValidate>
        <section className={styles.section} aria-labelledby="step-folder">
          <h2 id="step-folder" className={styles.h2}>
            1. Your project folder
          </h2>
          {props.summary && <p className={styles.body}>{props.summary}</p>}
          <p className={styles.body}>
            You can hand in up to 300 files: 25 MB in total and 10 MB per file. The marking guide asks for:
          </p>
          <ul className={styles.expected}>
            {props.expectedFiles.map((f) => (
              <li key={f.id}>
                {f.label}
                {!f.required && <span className={styles.muted}> (if you have it)</span>}
              </li>
            ))}
          </ul>
          <fieldset className={styles.choices}>
            <legend className={styles.legend}>How are you handing it in?</legend>
            <label className={styles.choice}>
              <input type="radio" name="source" value="files" checked={source === "files"} onChange={() => setSource("files")} />
              Files or a folder
            </label>
            <label className={styles.choice}>
              <input type="radio" name="source" value="zip" checked={source === "zip"} onChange={() => setSource("zip")} />
              A zip file
            </label>
            <label className={styles.choice}>
              <input type="radio" name="source" value="repo" checked={source === "repo"} onChange={() => setSource("repo")} />
              A link to a public project on GitHub
            </label>
          </fieldset>
          {source === "files" && (
            <div className={styles.fields}>
              <label className={styles.field}>
                <span>Choose files</span>
                <input type="file" multiple data-files />
              </label>
              <label className={styles.field}>
                <span>Or choose a whole folder</span>
                <input type="file" data-files {...{ webkitdirectory: "", directory: "" }} />
              </label>
            </div>
          )}
          {source === "zip" && (
            <label className={styles.field}>
              <span>Choose your zip file (up to 25 MB)</span>
              <input type="file" accept=".zip,application/zip" data-zip />
            </label>
          )}
          {source === "repo" && (
            <label className={styles.field}>
              <span>GitHub project link</span>
              <input type="url" name="repo_url" placeholder="https://github.com/your-name/your-project" className={styles.input} />
            </label>
          )}
        </section>

        <section className={styles.section} aria-labelledby="step-details">
          <h2 id="step-details" className={styles.h2}>
            2. Whose details are in it?
          </h2>
          <fieldset className={styles.choices}>
            <legend className={styles.legend}>Both are marked the same way.</legend>
            <label className={styles.choice}>
              <input type="radio" name="data_choice" value="own" checked={dataChoice === "own"} onChange={() => setDataChoice("own")} />
              {props.ownLabel}
            </label>
            <label className={styles.choice}>
              <input type="radio" name="data_choice" value="example" checked={dataChoice === "example"} onChange={() => setDataChoice("example")} />
              {props.exampleLabel}
            </label>
          </fieldset>
          {dataChoice === "own" ? (
            <label className={styles.field}>
              <span>Names to hide, one person, company or place per line</span>
              <span className={styles.help}>
                Start each line with {props.nameKinds.join(", ")} or Detail, followed by a colon. List every spelling
                you use, separated by commas. For example: Detail: Alex Morgan, Alex. We replace these with the same
                label, such as [Detail 1], in every file.
              </span>
              <textarea name="names" rows={5} className={styles.textarea} />
            </label>
          ) : null}
          <p className={styles.help}>
            Check pictures and other files for private details. We hide phone numbers, email addresses, postcodes, NHS
            numbers, bank and account numbers, and API keys (secret access codes) that we find in text. We turn PDF and
            Word files into text and hide the same details there. Only that text is sent, never the original PDF or Word
            file. You&apos;ll see every change and tick to confirm before anything is sent to a marker.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="step-answers">
          <h2 id="step-answers" className={styles.h2}>
            3. Four short answers
          </h2>
          {props.questions.map((q) => (
            <label key={q.id} className={styles.field}>
              <span className={styles.question}>{q.question}</span>
              <span className={styles.help}>{q.help}</span>
              <textarea name={`answer_${q.id}`} rows={4} maxLength={2000} className={styles.textarea} />
            </label>
          ))}
        </section>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className={styles.button} disabled={busy}>
          {busy ? "Checking..." : "Check and preview"}
        </button>
      </form>

      {preview && (
        <section id="preview" tabIndex={-1} className={styles.section} aria-labelledby="preview-title">
          <h2 id="preview-title" className={styles.h2}>
            Check what the marker will read
          </h2>
          <p className={styles.body}>
            This is exactly what will be marked. Nothing has been sent to a marker yet.
          </p>

          <h3 className={styles.h3}>What is in your hand-in</h3>
          <ul className={styles.checklist}>
            {preview.checklist.map((c) => (
              <li key={c.id} className={c.found.length ? styles.found : c.required ? styles.missing : undefined}>
                <strong>{c.found.length ? "Matching file found" : "No matching file found"}:</strong> {c.label}
                {c.found.length > 0 && <span className={styles.muted}> ({c.found.join(", ")})</span>}
              </li>
            ))}
          </ul>
          {missing.length > 0 && (
            <p className={styles.notice}>
              {`${plural(missing.length, "required item could not be matched", "required items could not be matched")} to a file. `}
              Check you&apos;ve included the work. You can still hand in, but missing work may affect your mark. Choose
              Change something to add files.
            </p>
          )}

          <h3 className={styles.h3}>What we hid</h3>
          {preview.labels.length === 0 ? (
            <p className={styles.body}>We did not find anything to hide.</p>
          ) : (
            <ul className={styles.labels}>
              {preview.labels.map((l) => (
                <li key={l.label}>
                  <mark className={styles.label}>{l.label}</mark> {plural(l.count, "time", "times")}
                </li>
              ))}
            </ul>
          )}
          {preview.unusedNameLabels.length > 0 && (
            <p className={styles.notice}>
              We did not find {preview.unusedNameLabels.join(", ")} in any file. If a name is spelt another way in your
              files, add that spelling to its line.
            </p>
          )}

          <h3 className={styles.h3}>Your answers</h3>
          {props.questions.map((q) => (
            <div key={q.id} className={styles.answer}>
              <p className={styles.question}>{q.question}</p>
              <p className={styles.preText}>
                <Highlighted text={preview.answers[q.id] ?? ""} />
              </p>
            </div>
          ))}

          <h3 className={styles.h3}>Your files ({preview.files.length})</h3>
          {preview.files.map((f) => {
            const href = `${base}/file?id=${encodeURIComponent(preview.handInId)}&path=${encodeURIComponent(f.path)}`
            return (
              <details key={f.path} className={styles.file} open={f.replaced > 0 || f.kind !== "text"}>
                <summary className={styles.fileHead}>
                  <span className={styles.filePath}>
                    {f.convertedFrom ? `${f.convertedFrom}, sent as text` : f.path}
                  </span>
                  <span className={styles.muted}>
                    {f.kind === "text"
                      ? f.replaced > 0
                        ? plural(f.replaced, "detail hidden", "details hidden")
                        : "nothing hidden"
                      : "not changed: check it yourself"}
                  </span>
                </summary>
                {f.convertedFrom && (
                  <p className={styles.notice}>
                    Compare the text below with your file to check every private detail is hidden. The marker reads only
                    this text. The {f.convertedFrom.split(".").pop()?.toUpperCase() === "PDF" ? "PDF" : "Word file"}{" "}
                    itself is never sent.
                  </p>
                )}
                {f.kind === "text" && f.text !== null && (
                  <pre className={styles.pre}>
                    <Highlighted text={f.text} />
                  </pre>
                )}
                {f.kind === "text" && f.text === null && (
                  <p className={styles.body}>
                    This file is too long to show here. <a href={href} target="_blank" rel="noreferrer">Open it</a> to
                    read it as it will be sent.
                  </p>
                )}
                {f.kind === "image" && (
                  <>
                    <p className={styles.notice}>
                      We cannot hide anything inside a picture. Check it shows nothing private before you hand in.
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element -- a private, per-learner file; next/image cannot proxy it */}
                    <img src={href} alt={`Your file ${f.path}`} className={styles.image} />
                  </>
                )}
                {f.kind === "other" && (
                  <p className={styles.notice}>
                    We cannot look inside this kind of file, so nothing in it was hidden.{" "}
                    <a href={href}>Download it</a> and check it shows nothing private, or hand in a text copy instead.
                  </p>
                )}
              </details>
            )
          })}

          {preview.leftOut.map((f) => (
            <div key={f.path} className={styles.file}>
              <p className={styles.fileHead}>
                <span className={styles.filePath}>{f.path}</span>
                <span className={styles.muted}>left out</span>
              </p>
              <p className={styles.notice}>
                Hand in a text copy of this file instead. We couldn&apos;t read any text in it, so it won&apos;t be sent.
              </p>
            </div>
          ))}

          <h3 className={styles.h3}>A short recording (optional)</h3>
          <label className={styles.field}>
            <span className={styles.help}>
              Up to 2 minutes and 40 MB, showing your project working. We keep it for checks and for questions about your mark. It
              is never sent to an AI.
            </span>
            <input ref={recordingRef} type="file" accept="video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp4" />
          </label>

          <label className={styles.tick}>
            <input type="checkbox" checked={ticked} onChange={(e) => setTicked(e.currentTarget.checked)} />
            <span>I have checked everything above. This is what I want the marker to read.</span>
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.button} disabled={!ticked || busy} onClick={confirm}>
              {busy ? "Handing in..." : `Hand in (hand-in ${props.attemptNo} of ${props.maxHandIns})`}
            </button>
            <button type="button" className={styles.secondary} disabled={busy} onClick={() => setPreview(null)}>
              Change something
            </button>
          </div>
        </section>
      )}
    </>
  )
}
