// Predefined site asset slots. The admin Photos page renders one upload widget
// per entry here. Public components reference slots by key. Add a slot, render
// it in a component, and it's editable from the portal — no schema change.

export const SITE_SLOTS = [
  {
    key: 'hero-lounge',
    label: 'Hero — The Lounge',
    hint: 'Wide shot, leather chairs, low light. Roughly 16:9 (this one takes the top of the collage).',
    storagePrefix: 'site/hero-lounge',
  },
  {
    key: 'hero-humidor',
    label: 'Hero — The Humidor',
    hint: 'Walk-in shelves. Square or vertical works best (lower-left of the collage).',
    storagePrefix: 'site/hero-humidor',
  },
  {
    key: 'hero-regular',
    label: 'Hero — A Regular',
    hint: 'Candid, low key. Square or vertical (lower-right of the collage).',
    storagePrefix: 'site/hero-regular',
  },
  {
    key: 'visit-map',
    label: 'Visit — Map / storefront',
    hint: 'Static map screenshot, or a photo of the storefront. Tall — fills the left side of the Visit section.',
    storagePrefix: 'site/visit-map',
  },
];

export const SLOT_KEYS = new Set(SITE_SLOTS.map((s) => s.key));
