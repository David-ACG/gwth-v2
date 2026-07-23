import { Spinner } from "@/components/shared/spinner"

/**
 * Loading fallback for a lab detail page. Minimal, centred spinner: the page is
 * a public marketing surface with no per-user data to skeleton.
 */
export default function LabDetailLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size={28} />
    </div>
  )
}
