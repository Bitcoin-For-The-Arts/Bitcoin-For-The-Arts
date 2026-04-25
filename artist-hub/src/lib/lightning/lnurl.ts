import { bech32 } from '@scure/base';

export type LnurlPayParams = {
  callback: string;
  minSendable: number; // msats
  maxSendable: number; // msats
  metadata: string;
  tag: 'payRequest';
  commentAllowed?: number;
  allowsNostr?: boolean;
  nostrPubkey?: string;
};

export async function fetchLnurlPayParams(lud16OrLud06: string): Promise<LnurlPayParams> {
  const url = lnurlpUrlFromLud(lud16OrLud06);
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`LNURL endpoint error: ${res.status}`);
  const json = (await res.json()) as any;
  if (!json?.callback || json?.tag !== 'payRequest') throw new Error('Invalid LNURL-pay response');
  return json as LnurlPayParams;
}

export async function requestInvoice(params: {
  callback: string;
  amountMsats: number;
  comment?: string;
  nostr?: string;
}): Promise<string> {
  const u = new URL(params.callback);
  u.searchParams.set('amount', String(params.amountMsats));
  if (params.comment) u.searchParams.set('comment', params.comment.slice(0, 200));
  if (params.nostr) u.searchParams.set('nostr', params.nostr);

  const res = await fetch(u.toString(), { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Invoice callback error: ${res.status}`);
  const json = (await res.json()) as any;
  const pr = json?.pr || json?.payment_request;
  if (typeof pr !== 'string') throw new Error('No invoice returned from LNURL callback');
  return pr;
}

export function lnurlpUrlFromLud(lud: string): string {
  const v = lud.trim();
  if (!v) throw new Error('Missing lightning address / lnurl');

  if (v.toLowerCase().startsWith('lnurl')) {
    const decoded = decodeLnurl(v);
    return decoded;
  }

  if (v.includes('@')) {
    const [name, domain] = v.split('@');
    if (!name || !domain) throw new Error('Invalid lightning address');
    const proto = domain.includes('localhost') ? 'http' : 'https';
    return `${proto}://${domain}/.well-known/lnurlp/${encodeURIComponent(name)}`;
  }

  throw new Error('Unsupported lightning identifier');
}

export function decodeLnurl(lnurl: string): string {
  const normalized = lnurl.toLowerCase();
  if (!normalized.includes('1')) throw new Error('Invalid LNURL');
  const { words } = bech32.decode(normalized as any, 2000);
  const bytes = bech32.fromWords(words);
  const text = new TextDecoder().decode(Uint8Array.from(bytes));
  if (!text.startsWith('http://') && !text.startsWith('https://')) {
    throw new Error('LNURL did not decode to an http(s) URL');
  }
  return text;
}

