// Photo IDs match the picsum ids used in the original mockup so the
// imagery reads identically to the design doc.
// Placeholder photography for every page except our-story, self-hosted in
// public/photos/placeholder/ rather than fetched from picsum at page load.
// picsum went down once and took the landing page's photography with it;
// these ship with the build so the site cannot lose its images to someone
// else's outage. Same pictures, same ids, so swapping in real photography
// stays a one-line change per image.
const img = (id) => `/photos/placeholder/${id}.jpg`;

// Real photography for the our-story page, in public/photos/story/. Named by
// the slot it fills rather than by subject, so swapping a picture is a one-file
// change with no code edit. The trailing note on each entry below is the
// original frame in the shared drive, kept so a swap can be traced back.
const photo = (name) => `/photos/story/${name}.jpg`;

// Social + contact, in one place — these appear in the footer, the mobile menu
// and the story page's contact block, so they can't be allowed to drift.
export const INSTAGRAM_URL = 'https://www.instagram.com/trippintravels.in';
export const CONTACT_EMAIL = 'hey@trippintravels.in';

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
export const LIVE_REGIONS = new Set(['north-bengal', 'sikkim', 'dooars']);

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
    body: "once you set off, we're only a call away – a friend on the other end who knows your trip.",
  },
  {
    n: '03',
    title: 'an augmenting experience',
    body: 'the local side of every place – hidden corners, food locals love, and quiet moments of solace.',
  },
  {
    n: '04',
    title: 'encompassing all segments',
    body: 'stays, transfers, permits, guides – every detail handled, so the journey stays seamless.',
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

// What we run, as against where. Same deal — nav, hamburger and footer all read
// this one list. Nothing under it is built yet, so it renders like tours and
// rentals do: named, not linked.
export const EXPERIENCES = ['treks', 'bike rides'];

export const NAV = {
  expeditions: EXPEDITIONS,
  experiences: EXPERIENCES,
  tours: ['group trips', 'corporate trips', 'school excursions', 'solo trips'],
  rentals: ['cars', 'bikes'],
  story: ['about us', 'gallery', 'our services', 'our process', 'our team', 'contact'],
};

export const FOOTER = {
  expeditions: EXPEDITIONS,
  experiences: EXPERIENCES,
  toursRentals: ['group trips', 'corporate trips', 'school excursions', 'solo trips', 'car rentals', 'bike rentals'],
  story: ['about us', 'gallery', 'our services', 'our process', 'our team', 'contact'],
};

// ---- "Our story" single-page content (verbatim doc copy) ----
export const STORY = {
  heroImg: photo('hero'), // Our Story10 — kanchenjunga above the cloud sea
  intro:
    "An immersive experience, unexplored destinations, redefined luxury and catering to your every need. Trippin' Travels has got it all covered, and then some more. We present a unique hand-crafted escape guide that connects you to the ethos of each place.",
  aboutUs:
    "Trippin Travels started with three friends who shared one simple passion – exploring places that most people haven't discovered yet. What began as weekend getaways and a curiosity to see what lies beyond the usual tourist trails slowly turned into something much bigger. We wanted to create travel experiences that felt personal, not packaged. From finding beautiful, character-filled stays to experiencing the culture, people, food, and stories that make each place unique, our idea of luxury is all about feeling connected. Trippin Travels is our attempt to make every journey feel less like a holiday and more like a story worth coming back with.",
  servicesTagline: 'everything we take off your plate – so the journey stays yours.',
  services: [
    {
      n: '01',
      img: photo('service-1'), // Our Story17 — the old stationers, in black and white
      cap: 'your pace, your people',
      title: 'hand-crafted itinerary',
      body: "At Trippin Travels, we believe no two travellers are the same, which is why we don't believe in one-size-fits-all itineraries. We take the time to listen – to what you want, how you like to travel, and the little things that matter to you. From handpicking the best properties to planning every transfer, experience, meal, and moment, we pay attention to the details that can make a trip truly special. Every itinerary is thoughtfully built around your needs, giving you access to stays and experiences we genuinely believe are worth your time. For us, planning a trip isn't just about putting together an itinerary – it's about understanding you first, and then creating a journey that feels uniquely yours.",
    },
    {
      n: '02',
      img: photo('service-2'), // Our Story27 — a hillside village at last light
      cap: "we're one text away",
      title: 'shadowing your journey',
      body: "Once your trip begins, we don't just disappear. We're always just a call or message away whenever you need us. Whether it's a last-minute change, a recommendation for a great place to grab a bite, help with your stay, or something unexpected that comes up along the way, you can reach out to us. Think of it as having a friend on the other end who knows your trip and is ready to help whenever you need it.",
    },
    {
      n: '03',
      img: photo('service-3'), // akash1 — the milky way over the ridge
      cap: 'find your little moment of solace',
      title: 'an augmenting experience',
      body: "We want our clients to experience a place, not just visit it. That means taking you beyond the usual tourist spots and helping you discover the local side of every destination – the food that locals love, quiet little corners, hidden viewpoints, and places that often don't make it onto the usual travel lists. We also love bringing you closer to the culture and everyday life of the people who call these places home. And when you need a little escape from it all, we curate peaceful excursions and experiences that let you slow down, breathe, and find your own little moment of solace. For us, the best souvenirs are the stories, connections, and experiences you carry back home.",
    },
    {
      n: '04',
      img: photo('service-4'), // Our Story19 — glacier water
      cap: 'you just show up',
      title: 'encompassing all segments',
      body: "At Trippin Travels, we take care of every little detail so you can focus on enjoying the journey. From handpicked hotels, homestays, resorts, cottages and tents to great food and recommendations for authentic local food joints, we make sure you're well taken care of throughout. Our personal cab services make the journey more than just a transfer – helping you discover hidden gems and unexplored places along the way. We also handle permits, local guides and everything else you may need, making your trip seamless, enriching and truly stress-free.",
    },
  ],
  process: [
    {
      step: 'step 01',
      cap: 'start with a hello',
      img: photo('process-1'),   // Our Story11 — the first conversation
      img2: photo('bridge-1'), // Our Story16 — the bridge straddling the seam
      title: 'commencing the journey',
      body: "It all starts with a conversation. A quick call – video or audio – or simply a text or email. We take the time to hear you out, understand what you're looking for, and get to know how you like to travel. From there, we start shaping a journey that feels right for you.",
    },
    {
      step: 'step 02',
      cap: "say what you'd change",
      img: photo('process-2'),   // Our Story5 — the route taking shape
      img2: photo('bridge-2'), // Our Story15 — the bridge straddling the seam
      title: 'tailored planning',
      body: "The next step is where your ideas start taking shape. We put together an itinerary based entirely on what you've told us – your preferences, pace, interests, and the little things that matter to you. Once it's ready, we connect with you again and walk you through it, explaining everything in detail and making changes wherever needed. We want you to know exactly what your trip will look like before you set off.",
    },
    {
      step: 'step 03',
      cap: "bags on, we've got the rest",
      img: photo('process-3'),   // Our Story28 — bags on, engines running
      img2: photo('bridge-3'), // Our Story26 — the bridge straddling the seam
      title: 'trippin begins',
      body: "The planning is done. The bags are packed. Now it's time to actually enjoy the journey. Once you're on the road, our role is simple – we make sure you never feel lost or left on your own. From the first pickup to the last goodbye, we're there in the background, ready when you need us. You focus on soaking in the views, trying something new, meeting people, and making memories. We'll quietly take care of the rest.",
    },
  ],
  teamTagline: 'three friends who shared one simple passion – and turned it into trippin travels.',
  teamFallbackPhone: '+91 93828 43212',
  // Staggered row under the story hero. `float` is the scroll speed — the
  // whole effect is that the three move at different rates, so keep them
  // distinct. Heights differ too, so the row reads as composed, not a grid.
  heroRow: [
    // The tallest frame sits in the middle and is the one the eye lands on, so
    // it carries the strongest picture of the three.
    { img: photo('row-1'), h: 300, top: 44, float: 12, cap: 'cloud line' }, // Our Story9
    { img: photo('row-2'), h: 420, top: 0,  float: 40, cap: 'first light' }, // Our Story25
    { img: photo('row-3'), h: 340, top: 76, float: 24, cap: 'to the pass' },  // Our Story32
  ],
  // The gallery slab. Order matters: StoryPage deals these round-robin into
  // four columns on desktop and two on mobile, so every fourth entry shares a
  // column. The list is sequenced to give each column its own rhythm of tall
  // and wide frames rather than a repeating pattern -- reordering it reshuffles
  // that rhythm, so move entries in fours if you want a column left alone.
  // `ar` is the frame's aspect-ratio; the photograph is cropped to it.
  // The gallery slab. Order matters twice over: StoryPage deals these
  // round-robin into four columns on desktop and two on mobile, so every fourth
  // entry shares a column -- and each column has to stay taller than its window
  // or the loop opens a gap at an edge. The sequence below keeps every column
  // well clear of that and gives each its own rhythm of tall and wide frames.
  // Move entries in fours if you want a column left alone.
  //
  // `ar` is set to the picture's own orientation so nothing is badly cropped:
  // 3/4 and 4/5 for uprights, 4/3 for landscapes, 1/1 for the near-squares.
  //
  // The two quiet frames -- 05 the misty line out of town, 10 the rain -- are
  // placed so the pictures directly above and below each of them, in the same
  // column, are bright ones. Because the columns counter-scroll, a tile's
  // left and right neighbours slide past constantly; only the ones stacked
  // with it in its own column stay put, so those are the ones that have to
  // carry the contrast. It holds at four columns and at two.
  gallery: [
    { n: 'gallery-01', ar: '4/3', cap: 'the range over the roofs' }, // Our Story6
    { n: 'gallery-02', ar: '4/5', cap: 'a village under stars' },    // Our Story35
    { n: 'gallery-03', ar: '4/5', cap: 'the temple square' },        // Our Story12
    { n: 'gallery-04', ar: '3/4', cap: 'the falls in cloud' },       // Our Story34
    { n: 'gallery-05', ar: '3/4', cap: 'the line out of town' },     // Our Story14 — moved down from services
    { n: 'gallery-06', ar: '4/3', cap: 'river country' },            // Our Story (the unnumbered one)
    { n: 'gallery-07', ar: '1/1', cap: 'kanchenjunga, clear' },      // Our Story7
    { n: 'gallery-08', ar: '3/4', cap: 'the pass in snow' },         // Our Story30
    { n: 'gallery-09', ar: '4/3', cap: 'the range at dusk' },        // Our Story31
    { n: 'gallery-10', ar: '3/4', cap: 'the rain comes in' },        // Our Story22 — moved down from services
    { n: 'gallery-11', ar: '3/4', cap: 'the wet road up' },          // Our Story3
    { n: 'gallery-12', ar: '3/4', cap: 'cold water' },               // Our Story18
    { n: 'gallery-13', ar: '4/3', cap: 'the town after dark' },      // Our Story23
    { n: 'gallery-14', ar: '4/3', cap: 'the high lake' },            // Our Story29
    { n: 'gallery-15', ar: '3/4', cap: 'fog on the treeline' },      // Our Story33
  ].map((g) => ({ ...g, img: photo(g.n) })),
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

// Dial codes for the enquiry form. India first — it's where most enquiries
// come from and the default — then the neighbours and the long-haul markets
// that actually reach the eastern himalaya. Adding one is a single line.
export const DIAL_CODES = [
  { code: '+91',  country: 'India' },
  { code: '+977', country: 'Nepal' },
  { code: '+975', country: 'Bhutan' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+94',  country: 'Sri Lanka' },
  { code: '+1',   country: 'USA / Canada' },
  { code: '+44',  country: 'United Kingdom' },
  { code: '+61',  country: 'Australia' },
  { code: '+64',  country: 'New Zealand' },
  { code: '+65',  country: 'Singapore' },
  { code: '+60',  country: 'Malaysia' },
  { code: '+66',  country: 'Thailand' },
  { code: '+971', country: 'UAE' },
  { code: '+972', country: 'Israel' },
  { code: '+49',  country: 'Germany' },
  { code: '+33',  country: 'France' },
  { code: '+31',  country: 'Netherlands' },
  { code: '+41',  country: 'Switzerland' },
  { code: '+39',  country: 'Italy' },
  { code: '+34',  country: 'Spain' },
  { code: '+81',  country: 'Japan' },
  { code: '+82',  country: 'South Korea' },
  { code: '+27',  country: 'South Africa' },
];

export const DEFAULT_DIAL = '+91';

// Expected national-number length, where it's fixed. Anything not listed falls
// back to the E.164 range, so an unlisted country is never wrongly rejected.
export const DIAL_LENGTHS = {
  '+91': 10, '+977': 10, '+880': 10, '+1': 10, '+61': 9, '+94': 9, '+975': 8, '+65': 8,
};

// Enquiry intent dropdown options
export const INTENT_OPTIONS = [
  { key: 'loc',    label: 'a specific destination' },
  { key: 'rental', label: 'bike or car rental' },
  { key: 'group',  label: 'corporate & group trips' },
];

// Follow-up "where?" field, shown only when the intent is INTENT_LOC.
// Built from DESTINATIONS so it can't drift from the regions we actually run.
export const INTENT_LOC = 'loc';

export const WHERE_OPTIONS = [
  ...DESTINATIONS.map((d) => ({ key: d.slug, label: d.name })),
  { key: 'undecided', label: 'undecided' },
];
