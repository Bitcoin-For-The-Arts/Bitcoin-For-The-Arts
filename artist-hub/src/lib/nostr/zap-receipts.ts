import { safeJsonParse } from '$lib/nostr/helpers';

export type ZapReceiptParsed = {
  receiptId: string;
  createdAt: number;
  recipientPubkey?: string;
  senderPubkey?: string;
  amountMsats?: number;
  amountSats?: number;
  comment?: string;
  eTags: string[];
  aTags: string[];
};

function getTag(tags: string[][], name: string): string | undefined {
  return tags.find((t) => t[0] === name)?.[1];
}

function getTags(tags: string[][], name: string): string[] {
  return tags.filter((t) => t[0] === name && typeof t[1] === 'string').map((t) => t[1]);
}

export function parseZapReceipt(ev: any): ZapReceiptParsed | null {
  if (!ev?.id || !ev?.created_at) return null;
  const tags = (ev.tags as string[][]) || [];

  const recipientPubkey = getTag(tags, 'p');
  const description = getTag(tags, 'description');
  const eTags = getTags(tags, 'e');
  const aTags = getTags(tags, 'a');

  // The zap request (kind 9734) is embedded as JSON in the "description" tag.
  const zapReq = description ? safeJsonParse<any>(description) : null;
  const senderPubkey = typeof zapReq?.pubkey === 'string' ? zapReq.pubkey : undefined;

  const reqTags: string[][] = Array.isArray(zapReq?.tags) ? zapReq.tags : [];
  const reqAmount = reqTags.find((t) => t[0] === 'amount')?.[1];
  const amountMsats = reqAmount && !Number.isNaN(Number(reqAmount)) ? Number(reqAmount) : undefined;
  const amountSats = typeof amountMsats === 'number' ? Math.floor(amountMsats / 1000) : undefined;

  const comment = typeof zapReq?.content === 'string' && zapReq.content.trim() ? zapReq.content.trim() : undefined;

  // Targets may be on the request tags, not the receipt tags.
  const reqETags = reqTags.filter((t) => t[0] === 'e' && typeof t[1] === 'string').map((t) => t[1]);
  const reqATags = reqTags.filter((t) => t[0] === 'a' && typeof t[1] === 'string').map((t) => t[1]);

  return {
    receiptId: ev.id,
    createdAt: ev.created_at,
    recipientPubkey,
    senderPubkey,
    amountMsats,
    amountSats,
    comment,
    eTags: [...new Set([...eTags, ...reqETags])],
    aTags: [...new Set([...aTags, ...reqATags])],
  };
}

