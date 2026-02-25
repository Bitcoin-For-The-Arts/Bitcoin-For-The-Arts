import { signWithNip07, publishSignedEvent } from '$lib/nostr/pool';

export async function publishChannelMessage(opts: {
  channelId: string;
  content: string;
  replyTo?: string;
}): Promise<string> {
  const channelId = opts.channelId.trim();
  if (!channelId) throw new Error('Missing channel id');
  const content = opts.content.trim();
  if (!content) throw new Error('Message is empty');

  const pubkey = await window.nostr!.getPublicKey();
  const tags: string[][] = [['e', channelId, '', 'root']];
  if (opts.replyTo) tags.push(['e', opts.replyTo, '', 'reply']);

  const unsigned = {
    kind: 42,
    created_at: Math.floor(Date.now() / 1000),
    content,
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

