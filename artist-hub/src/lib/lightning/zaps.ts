import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { relayUrls } from '$lib/stores/settings';
import { fetchLnurlPayParams, lnurlpUrlFromLud, requestInvoice } from '$lib/lightning/lnurl';
import { sendPayment } from '$lib/lightning/webln';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import { pubkey as myPubkey } from '$lib/stores/auth';
import { signWithNip07 } from '$lib/nostr/pool';

export async function zapOrPay(opts: {
  recipientPubkey: string;
  lud16?: string;
  lud06?: string;
  amountSats: number;
  comment?: string;
  eventId?: string;
  address?: string;
}): Promise<{ invoice: string; mode: 'zap' | 'pay' }> {
  if (!browser) throw new Error('Zaps require a browser');

  const lud = (opts.lud16 || opts.lud06 || '').trim();
  if (!lud) throw new Error('Recipient has no lightning address (lud16/lud06) set in profile.');

  const params = await fetchLnurlPayParams(lud);
  const amountMsats = Math.floor(opts.amountSats * 1000);
  const relays = get(relayUrls);

  const commentAllowed = typeof params.commentAllowed === 'number' ? params.commentAllowed : 0;
  const comment = (opts.comment || '').slice(0, Math.max(0, commentAllowed));

  // If the receiver supports Nostr zaps and the user has a signer, do a real zap request (NIP-57).
  let payerPubkey = get(myPubkey);
  if (!payerPubkey && window.nostr?.getPublicKey) {
    try {
      payerPubkey = await window.nostr.getPublicKey();
    } catch {
      // ignore
    }
  }
  if (params.allowsNostr && params.nostrPubkey && payerPubkey) {
    const lnurl = lnurlpUrlFromLud(lud);
    const unsigned = {
      kind: NOSTR_KINDS.nip57_zap_request,
      created_at: Math.floor(Date.now() / 1000),
      content: comment || '',
      pubkey: payerPubkey,
      tags: [
        ['p', opts.recipientPubkey],
        ...(opts.eventId ? [['e', opts.eventId]] : []),
        ...(opts.address ? [['a', opts.address]] : []),
        ['amount', String(amountMsats)],
        ['lnurl', lnurl],
        ['relays', ...relays],
      ],
    };

    const signed = await signWithNip07(unsigned as any);
    const invoice = await requestInvoice({
      callback: params.callback,
      amountMsats,
      comment: comment || undefined,
      nostr: JSON.stringify(signed),
    });
    await sendPayment(invoice);
    return { invoice, mode: 'zap' };
  }

  // Fallback: plain LNURL-pay invoice (still P2P, but not a zap receipt on Nostr).
  const invoice = await requestInvoice({
    callback: params.callback,
    amountMsats,
    comment: comment || undefined,
  });
  await sendPayment(invoice);
  return { invoice, mode: 'pay' };
}

