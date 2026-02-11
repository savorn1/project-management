import type { TeamMember } from '~/types'

export interface MentionSegment {
  type: 'text' | 'mention' | 'everyone'
  value: string
  userId?: string
}

// Matches @[Name](objectId) for individual mentions and @[everyone] for group mention
const MENTION_REGEX = /@\[([^\]]+)\](?:\(([a-f0-9]{24})\))?/g

export function parseMentions(content: string): MentionSegment[] {
  const segments: MentionSegment[] = []
  let lastIndex = 0

  for (const match of content.matchAll(MENTION_REGEX)) {
    const matchIndex = match.index!
    if (matchIndex > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, matchIndex) })
    }

    const name = match[1]
    const userId = match[2]

    if (name === 'everyone') {
      segments.push({ type: 'everyone', value: 'everyone' })
    } else if (name && userId) {
      segments.push({ type: 'mention', value: name, userId })
    }

    lastIndex = matchIndex + match[0].length
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) })
  }

  return segments
}

/**
 * Extract the set of user IDs that should be notified for a comment.
 *
 * Rules:
 * - Deduplicate with Set
 * - @[everyone] expands to all active members
 * - Exclude inactive/deleted users
 * - Exclude the comment author
 * - Scope: only members passed in (task/project team)
 */
export function extractMentionedUserIds(
  content: string,
  members: TeamMember[],
  authorId: string,
): string[] {
  const ids = new Set<string>()
  const activeMembers = members.filter(m => m.isActive)

  for (const match of content.matchAll(MENTION_REGEX)) {
    const name = match[1]
    const userId = match[2]

    if (name === 'everyone') {
      for (const m of activeMembers) {
        ids.add(m._id)
      }
    } else if (userId) {
      // Only include if user is an active member
      const exists = activeMembers.some(m => m._id === userId)
      if (exists) {
        ids.add(userId)
      }
    }
  }

  // Never notify the author
  ids.delete(authorId)

  return Array.from(ids)
}
