// Photo IDs match the picsum ids used in the original mockup so the
// imagery reads identically to the design doc.
const img = (id) => `https://picsum.photos/id/${id}/1200/900`;

export const HERO_IMG = img(1018);
export const STORY_IMG = img(1061);
export const QUOTE_IMG = img(1036);

export const DESTINATIONS = [
  { name: 'darjeeling',            meta: 'west bengal · heritage rail & tea', img: img(1043) },
  { name: 'north sikkim',          meta: 'high passes & glacial valleys',     img: img(1015) },
  { name: 'east sikkim',           meta: 'alpine lakes & silk route',         img: img(1016) },
  { name: 'west sikkim',           meta: 'monastery ridges · pelling',        img: img(1039) },
  { name: 'dooars',                meta: 'forests, rivers & tea gardens',     img: img(28)   },
  { name: 'offbeat & unexplored',  meta: 'the roads few ever take',           img: img(29)   },
];

export const SERVICES = [
  {
    n: '01',
    title: 'hand-crafted itinerary',
    body: 'no one-size-fits-all. every journey is built around how you like to travel and the little things that matter to you.',
  },
  {
    n: '02',
    title: 'shadowing your journey',
    body: "once you set off, we're only a call away — a friend on the other end who knows your trip.",
  },
  {
    n: '03',
    title: 'an augmenting experience',
    body: 'the local side of every place — hidden corners, food locals love, and quiet moments of solace.',
  },
  {
    n: '04',
    title: 'encompassing all segments',
    body: 'stays, transfers, permits, guides — every detail handled, so the journey stays seamless.',
  },
];

export const PROCESS = [
  {
    step: 'step 01',
    title: 'commencing the journey',
    body: 'it starts with a conversation. we hear you out and shape a journey that feels right for you.',
  },
  {
    step: 'step 02',
    title: 'tailored planning',
    body: "an itinerary built entirely around you. we walk you through it and refine until it's yours.",
  },
  {
    step: 'step 03',
    title: 'trippin begins',
    body: "bags packed. from the first pickup to the last goodbye, we're there in the background.",
  },
];

export const NAV = {
  expeditions: [
    'darjeeling', 'north sikkim', 'east sikkim',
    'west sikkim', 'dooars', 'offbeat', 'unexplored',
  ],
  tours: ['group trips', 'corporate trips', 'school excursions', 'solo trips'],
  rentals: ['cars', 'bikes'],
  story: ['about us', 'gallery', 'our services', 'our process', 'our team', 'contact'],
};

// Footer columns (labels differ slightly from nav in the mockup)
export const FOOTER = {
  expeditions: ['darjeeling', 'north sikkim', 'east sikkim', 'west sikkim', 'dooars', 'offbeat & unexplored'],
  toursRentals: ['group trips', 'corporate trips', 'school excursions', 'solo trips', 'car rentals', 'bike rentals'],
  story: ['about us', 'gallery', 'our services', 'our process', 'our team', 'contact'],
};

// Enquiry intent dropdown options
export const INTENT_OPTIONS = [
  { key: 'loc',    label: 'a specific destination' },
  { key: 'rental', label: 'bike or car rental' },
  { key: 'group',  label: 'corporate & group trips' },
];
