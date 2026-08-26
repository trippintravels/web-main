// Photo IDs match the picsum ids used in the original mockup so the
// imagery reads identically to the design doc.
const img = (id) => `https://picsum.photos/id/${id}/1200/900`;

// Social + contact, in one place — these appear in the footer, the mobile menu
// and the story page's contact block, so they can't be allowed to drift.
export const INSTAGRAM_URL = 'https://www.instagram.com/trippintravels.in';

export const HERO_IMG = img(1018);
export const STORY_IMG = img(1061);
export const QUOTE_IMG = img(1036);

// Homepage "where to wander" rows — the same four regions as EXPEDITIONS,
// in the same order, with the imagery and captions for the landing page.
export const DESTINATIONS = [
  { name: 'north bengal',          slug: 'north-bengal',         meta: 'darjeeling, kalimpong & heritage rail',        img: img(1043) },
  { name: 'sikkim',                slug: 'sikkim',               meta: 'high passes, alpine lakes & monastery ridges', img: img(1015) },
  { name: 'dooars',                slug: 'dooars',               meta: 'forests, rivers & tea gardens',                img: img(28)   },
  { name: 'offbeat & unexplored',  slug: 'offbeat-unexplored',   meta: 'the roads few ever take',                      img: img(29)   },
];

// ---- where a destination links to ----
// Regions whose pages are actually built. Everything else stays inert — an
// explore link, nav item or footer item for an unbuilt region renders as plain
// text rather than a dead hyperlink. Add a slug here when its page ships.
export const LIVE_REGIONS = new Set(['north-bengal', 'sikkim']);

export const destinationHref = (slug) =>
  LIVE_REGIONS.has(slug) ? `#/destinations/${slug}` : null;

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

// The four regions we run. Single source of truth — nav, hamburger and footer
// all read this, so the lists can't drift apart.
export const EXPEDITIONS = ['north bengal', 'sikkim', 'dooars', 'offbeat & unexplored'];

export const NAV = {
  expeditions: EXPEDITIONS,
  tours: ['group trips', 'corporate trips', 'school excursions', 'solo trips'],
  rentals: ['cars', 'bikes'],
  story: ['about us', 'gallery', 'our services', 'our process', 'our team', 'contact'],
};

export const FOOTER = {
  expeditions: EXPEDITIONS,
  toursRentals: ['group trips', 'corporate trips', 'school excursions', 'solo trips', 'car rentals', 'bike rentals'],
  story: ['about us', 'gallery', 'our services', 'our process', 'our team', 'contact'],
};

// ---- "Our story" single-page content (verbatim doc copy) ----
export const STORY = {
  heroImg: img(1025),
  aboutImg: img(1061),
  intro:
    "An immersive experience, unexplored destinations, redefined luxury and catering to your every need. Trippin' Travels has got it all covered, and then some more. We present a unique hand-crafted escape guide that connects you to the ethos of each place.",
  aboutUs:
    "Trippin Travels started with three friends who shared one simple passion — exploring places that most people haven't discovered yet. What began as weekend getaways and a curiosity to see what lies beyond the usual tourist trails slowly turned into something much bigger. We wanted to create travel experiences that felt personal, not packaged. From finding beautiful, character-filled stays to experiencing the culture, people, food, and stories that make each place unique, our idea of luxury is all about feeling connected. Trippin Travels is our attempt to make every journey feel less like a holiday and more like a story worth coming back with.",
  servicesTagline: 'everything we take off your plate — so the journey stays yours.',
  services: [
    {
      n: '01',
      title: 'hand-crafted itinerary',
      body: "At Trippin Travels, we believe no two travellers are the same, which is why we don't believe in one-size-fits-all itineraries. We take the time to listen — to what you want, how you like to travel, and the little things that matter to you. From handpicking the best properties to planning every transfer, experience, meal, and moment, we pay attention to the details that can make a trip truly special. Every itinerary is thoughtfully built around your needs, giving you access to stays and experiences we genuinely believe are worth your time. For us, planning a trip isn't just about putting together an itinerary — it's about understanding you first, and then creating a journey that feels uniquely yours.",
    },
    {
      n: '02',
      title: 'shadowing your journey',
      body: "Once your trip begins, we don't just disappear. We're always just a call or message away whenever you need us. Whether it's a last-minute change, a recommendation for a great place to grab a bite, help with your stay, or something unexpected that comes up along the way, you can reach out to us. Think of it as having a friend on the other end who knows your trip and is ready to help whenever you need it.",
    },
    {
      n: '03',
      title: 'an augmenting experience',
      body: "We want our clients to experience a place, not just visit it. That means taking you beyond the usual tourist spots and helping you discover the local side of every destination — the food that locals love, quiet little corners, hidden viewpoints, and places that often don't make it onto the usual travel lists. We also love bringing you closer to the culture and everyday life of the people who call these places home. And when you need a little escape from it all, we curate peaceful excursions and experiences that let you slow down, breathe, and find your own little moment of solace. For us, the best souvenirs are the stories, connections, and experiences you carry back home.",
    },
    {
      n: '04',
      title: 'encompassing all segments',
      body: "At Trippin Travels, we take care of every little detail so you can focus on enjoying the journey. From handpicked hotels, homestays, resorts, cottages and tents to great food and recommendations for authentic local food joints, we make sure you're well taken care of throughout. Our personal cab services make the journey more than just a transfer — helping you discover hidden gems and unexplored places along the way. We also handle permits, local guides and everything else you may need, making your trip seamless, enriching and truly stress-free.",
    },
  ],
  process: [
    {
      step: 'step 01',
      title: 'commencing the journey',
      body: "It all starts with a conversation. A quick call — video or audio — or simply a text or email. We take the time to hear you out, understand what you're looking for, and get to know how you like to travel. From there, we start shaping a journey that feels right for you.",
    },
    {
      step: 'step 02',
      title: 'tailored planning',
      body: "The next step is where your ideas start taking shape. We put together an itinerary based entirely on what you've told us — your preferences, pace, interests, and the little things that matter to you. Once it's ready, we connect with you again and walk you through it, explaining everything in detail and making changes wherever needed. We want you to know exactly what your trip will look like before you set off.",
    },
    {
      step: 'step 03',
      title: 'trippin begins',
      body: "The planning is done. The bags are packed. Now it's time to actually enjoy the journey. Once you're on the road, our role is simple — we make sure you never feel lost or left on your own. From the first pickup to the last goodbye, we're there in the background, ready when you need us. You focus on soaking in the views, trying something new, meeting people, and making memories. We'll quietly take care of the rest.",
    },
  ],
  teamTagline: 'three friends who shared one simple passion — and turned it into trippin travels.',
  teamFallbackPhone: '+91 XXXXXXXXXX',
  gallery: [
    { id: 1039, cs: 2, rs: 2 },
    { id: 1015, cs: 2, rs: 1 },
    { id: 1016, cs: 1, rs: 1 },
    { id: 28,   cs: 1, rs: 1 },
    { id: 1043, cs: 2, rs: 1 },
    { id: 29,   cs: 1, rs: 2 },
    { id: 1036, cs: 1, rs: 1 },
    { id: 1061, cs: 1, rs: 1 },
  ].map((g) => ({ ...g, img: img(g.id) })),
};

// Founders — photos to be added later (placeholder tiles until then).
export const TEAM = [
  {
    name: 'Amlan Dey',
    role: 'the curator',
    line: 'your go-to for making that vision board a reality',
    img: null,
  },
  {
    name: 'Adeya Bhattacherjee',
    role: 'the hotline',
    line: 'your lifeline for live support, 2 am detours, and immaculate local recommendations',
    img: null,
  },
  {
    name: 'Raj Paswan',
    role: 'the fixer',
    line: 'your escape plan when the plot twists and you need a way out, no questions asked',
    img: null,
  },
];

// Enquiry intent dropdown options
export const INTENT_OPTIONS = [
  { key: 'loc',    label: 'a specific destination' },
  { key: 'rental', label: 'bike or car rental' },
  { key: 'group',  label: 'corporate & group trips' },
];
