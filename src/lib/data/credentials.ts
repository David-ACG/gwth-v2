import { createClient } from "@/lib/supabase/server"

export type PublicCredential = {
  verificationCode: string
  learnerName: string
  courseTitle: string
  gwthScore: number
  percentileLabel: string
  trajectoryLabel: string
  issuedAt: Date
  updatedAt: Date
}

type CredentialRow = {
  verification_code: string
  learner_name: string
  course_id: string
  gwth_score: number
  percentile_label: string
  trajectory_label: string
  issued_at: string
  updated_at: string
}

export async function getPublicCredentialByCode(
  code: string
): Promise<PublicCredential | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("credential_verifications")
    .select(
      "verification_code, learner_name, course_id, gwth_score, percentile_label, trajectory_label, issued_at, updated_at"
    )
    .eq("verification_code", code)
    .eq("is_public", true)
    .maybeSingle()

  if (error || !data) return null

  const credential = data as CredentialRow
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", credential.course_id)
    .maybeSingle()

  return {
    verificationCode: credential.verification_code,
    learnerName: credential.learner_name,
    courseTitle: (course?.title as string | undefined) ?? "GWTH Applied AI Skills",
    gwthScore: credential.gwth_score,
    percentileLabel: credential.percentile_label,
    trajectoryLabel: credential.trajectory_label,
    issuedAt: new Date(credential.issued_at),
    updatedAt: new Date(credential.updated_at),
  }
}
