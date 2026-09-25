import { getCommentRole } from "@/lib/comments/role"
import { CommentLayer } from "./comment-layer"

/**
 * Server gate for the comment layer (bead gwth-launch-8ksq). Renders nothing,
 * and makes no network calls in the browser, unless the real session belongs
 * to David (admin) or a beta tester. Students never see it.
 */
export async function CommentLayerGate() {
  const { role, identity } = await getCommentRole()
  if (!role) return null
  return <CommentLayer role={role} email={identity?.email ?? null} />
}
