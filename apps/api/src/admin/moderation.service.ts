import { Injectable } from '@nestjs/common';
import { MessageSender } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';

export interface RecentMessagesInput {
  /** Return only messages created strictly after this ISO timestamp. Used
   *  for polling — the client passes the createdAt of its latest known
   *  message so it only pulls the new ones. */
  since?: Date;
  /** Cap on rows per call — admin panel default 100. Server clamps 500. */
  limit?: number;
  /** If true, restrict to messages whose clientMeta has ANY anti-cheat
   *  signal set (paste, superhuman speed). Used to focus on likely abuse. */
  suspiciousOnly?: boolean;
}

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  /** Live-tail of SALESPERSON messages across every conversation. Newest
   *  first. Purpose: catch spam / abuse / obvious cheating in-flight so an
   *  admin can act before scoring completes. LEAD messages are excluded —
   *  they're LLM output, not user content to moderate. */
  async recentMessages(input: RecentMessagesInput = {}) {
    const limit = Math.min(500, Math.max(1, input.limit ?? 100));
    const rows = await this.prisma.message.findMany({
      where: {
        sender: MessageSender.SALESPERSON,
        ...(input.since ? { createdAt: { gt: input.since } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        conversation: {
          include: {
            attempt: {
              include: {
                challenge: { select: { id: true, title: true, difficulty: true } },
                salesperson: {
                  include: {
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const items = rows.map((m) => {
      const attempt = m.conversation.attempt;
      const meta = (m.clientMeta ?? null) as Record<string, unknown> | null;
      return {
        id: m.id,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        hasClientMeta: meta != null,
        // Cheap surface signal — the full suspicion score gets computed
        // at scoring time; here we just flag messages that came with any
        // paste event so an admin can spot patterns.
        pasteCount: typeof meta?.pasteCount === 'number' ? meta.pasteCount : 0,
        pastedChars: typeof meta?.pastedChars === 'number' ? meta.pastedChars : 0,
        attempt: {
          id: attempt.id,
          status: attempt.status,
          quarantined: attempt.quarantined,
          suspicionScore: attempt.suspicionScore,
        },
        challenge: attempt.challenge,
        user: {
          id: attempt.salesperson.user.id,
          name: attempt.salesperson.user.name,
          email: attempt.salesperson.user.email,
        },
      };
    });

    if (!input.suspiciousOnly) return { items };
    return {
      items: items.filter((i) => i.pasteCount > 0 || i.attempt.quarantined),
    };
  }
}
