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
  contacts: 3,
  repost: 6,
  dm: 4,

  nip15_stall: 30017,
  nip15_product: 30018,

  nip23_longform: 30023,

  nip51_curated_set: 30004,

  nip37_edit: 30078,

  nip99_classified: 30402,
  nip99_draft: 30403,

  nip57_zap_request: 9734,
  nip57_zap_receipt: 9735,

  nip58_badge_award: 8,
  nip58_badge_definition: 30009,

  // BFTA Artist Hub extensions (client-side only; published to public relays)
  // Use parameterized replaceable events (NIP-33 style) with a `d` tag.
  bfta_studio: 30050,
  bfta_zap_challenge: 30051,
} as const;

export const BFTA_DEFAULT_FEATURED_SET_D = 'bfta-featured-artists';

