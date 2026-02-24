export const DEFAULT_RELAYS = [
  'wss://nostr.wine',
  'wss://purplepag.es',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://offchain.pub',
];

export const NOSTR_KINDS = {
  metadata: 0,
  note: 1,
  dm: 4,

  nip15_stall: 30017,
  nip15_product: 30018,

  nip23_longform: 30023,

  nip51_curated_set: 30004,

  nip99_classified: 30402,
  nip99_draft: 30403,

  nip57_zap_request: 9734,
  nip57_zap_receipt: 9735,
} as const;

export const BFTA_DEFAULT_FEATURED_SET_D = 'bfta-featured-artists';

