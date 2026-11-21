"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { setScoreSharePublic } from "@/lib/data/score-share"
import { shareView, type ScoreShareView } from "@/lib/score/share"

/**
 * The learner turns their public score page on or off (bead
 * gwth-launch-phjb). The first time it is turned on, the share code is
 * minted. Signed-in learners only, and only while the score is switched on.
 */
export async function setScorePublicAction(isPublic: boolean): Promise<ScoreShareView | null> {
  if (!ENABLE_GWTH_SCORE) return null
  const user = await getCurrentUser()
  if (!user) return null
  const share = await setScoreSharePublic(user.id, isPublic === true)
  revalidatePath("/dashboard")
  revalidatePath("/progress")
  revalidatePath(`/verify/${share.code}`)
  return shareView(share)
}
