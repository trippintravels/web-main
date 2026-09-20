// Offbeat & unexplored — level 2 (the field map + register) and the content for
// its level-3 hamlet pages (HamletPage).
//
// Unlike the other regions this one is a loose scatter of hamlets, not zones,
// so it has its own page (OffbeatPage) and its own map (src/maps/offbeat.js)
// rather than the shared RegionPage / ZoneMap. Each hamlet carries its pin
// position (map-space coords) alongside its index copy, so the numbered pins
// and the field index stay in lock-step — the number on the map is the number
// in the list.
//
// `body` is the COMPLETE verbatim hamlet copy from
// design_ins/mockup/uploads/Website Content.docx (the "Offbeat" section),
// one entry per paragraph like destinations.js — generated from the .docx,
// not retyped. `coord` and `blurb` are the register's own short lines.
//
// Self-hosted placeholders, same picsum ids as the mockup and the other pages
// (see the note in data.js). Swapping in real photography is one line each.
const img = (id) => `/photos/placeholder/${id}.jpg`;

export const OFFBEAT = {
  slug: 'offbeat-unexplored',
  num: '04',
  name: 'offbeat & unexplored',
  heroImg: img(1039),
  // hero standfirst, over the hero photograph on both breakpoints.
  intro:
    'No zones, no set circuit \u2014 just a scatter of quiet hamlets hidden along the Sikkim, Nepal and Bhutan borders. The roads few people take.',
  hamlets: [
  {
    n: '01', slug: 'dhotrey', name: "Dhotrey",
    coord: "27.05\u00b0N \u00b7 88.08\u00b0E \u00b7 nepal border",
    blurb: "Singalila trailhead hamlet.",
    img: img(1036),
    pin: { cx: 240.2, cy: 790.8, tx: 255.2, ty: 784.8 },
    body: [
      "There\u2019s something magical about waking up in Dhotrey and finding Kanchenjunga standing quietly on the horizon. On a clear morning, the snow-covered peaks appear between the pine trees, glowing softly as the first light touches them. There\u2019s no crowd, no rush\u2014just the mountains, the crisp air and a view that makes you want to stop for a while and take it all in. It\u2019s one of those simple moments in the hills that stays with you long after the journey is over.",
    ],
  },
  {
    n: '02', slug: 'lepchajagat', name: "Lepchajagat",
    coord: "27.02\u00b0N \u00b7 88.21\u00b0E \u00b7 darjeeling hills",
    blurb: "Pine forests and a clean Kanchenjunga line.",
    img: img(1039),
    pin: { cx: 355.0, cy: 725.2, tx: 370.0, ty: 719.2 },
    body: [
      "Tucked away in the forests near Darjeeling, Lepchajagat is where towering pines, misty mornings and birdsong replace the bustle of the hills. Its greatest luxury is solitude\u2014slow mornings overlooking forested valleys, cosy stays wrapped in nature, and evenings when the mist quietly takes over the landscape.",
    ],
  },
  {
    n: '03', slug: 'tonglu', name: "Tonglu",
    coord: "27.03\u00b0N \u00b7 88.08\u00b0E \u00b7 nepal border",
    blurb: "High ridge viewpoint on the Singalila trek.",
    img: img(1015),
    pin: { cx: 264.8, cy: 762.1, tx: 279.8, ty: 756.1 },
    body: [
      "Perched high along the famous Singalila ridge, Tonglu is one of those rare places where the Himalayas become the main attraction. On clear mornings, Kanchenjunga dominates the horizon, while clouds drift through the valleys below. Reaching Tonglu is itself an experience\u2014making the destination feel earned, exclusive and wonderfully remote.",
    ],
  },
  {
    n: '04', slug: 'rimbick', name: "Rimbick",
    coord: "27.11\u00b0N \u00b7 88.11\u00b0E \u00b7 nepal border",
    blurb: "The base village for the Singalila trails.",
    img: img(1043),
    pin: { cx: 223.8, cy: 676.0, tx: 238.8, ty: 670.0 },
    body: [
      "Rimbick is a charming mountain village where life moves at an unhurried pace. Surrounded by forests, streams and terraced hillsides, it is an ideal base for exploring the quieter side of the Singalila region. Its luxury lies in authenticity\u2014fresh mountain produce, village trails, warm hospitality and evenings spent listening to the silence.",
    ],
  },
  {
    n: '05', slug: 'bijanbari', name: "Bijanbari",
    coord: "27.07\u00b0N \u00b7 88.20\u00b0E \u00b7 darjeeling valley",
    blurb: "A riverside valley below Darjeeling.",
    img: img(1016),
    pin: { cx: 363.2, cy: 856.4, tx: 378.2, ty: 850.4 },
    body: [
      "Set in a green valley below Darjeeling, Bijanbari offers a side of the hills that feels refreshingly untouched. Tea gardens, forests, rivers and small mountain settlements create a landscape made for slow exploration. Here, luxury means experiencing the hills without the crowds\u2014with nature, local life and expansive valley views taking centre stage.",
    ],
  },
  {
    n: '06', slug: 'kolbong', name: "Kolbong",
    coord: "27.07\u00b0N \u00b7 88.13\u00b0E \u00b7 nepal border",
    blurb: "A quiet ridge hamlet off the trekking route.",
    img: img(1018),
    pin: { cx: 273.0, cy: 840.0, tx: 259.0, ty: 834.0, anchor: 'end' },
    body: [
      "Hidden among the forests of the Darjeeling hills, Kolbong is an escape for travellers who prefer their mountains quiet, intimate and unexplored. Surrounded by dense greenery and rolling Himalayan landscapes, it offers the rare pleasure of feeling genuinely away from it all. It is the kind of destination where a beautifully designed stay becomes part of the experience.",
    ],
  },
  {
    n: '07', slug: 'shittong', name: "Shittong",
    coord: "26.91\u00b0N \u00b7 88.36\u00b0E \u00b7 orange valley",
    blurb: "Terraced orange orchards along the Riyang.",
    img: img(433),
    pin: { cx: 535.4, cy: 1053.2, tx: 550.4, ty: 1047.2 },
    body: [
      "Spread across the lower Himalayan hills, Shittong is known for its orange orchards, sweeping valleys and peaceful village landscapes. Far removed from the tourist bustle of Darjeeling, it invites you to slow down and savour the simpler pleasures of mountain living. The combination of orchard walks, panoramic views and secluded stays gives Shittong an understated sense of luxury.",
    ],
  },
  {
    n: '08', slug: 'takdah', name: "Takdah",
    coord: "27.03\u00b0N \u00b7 88.35\u00b0E \u00b7 darjeeling hills",
    blurb: "Cantonment lanes and an old orchid centre.",
    img: img(225),
    pin: { cx: 502.6, cy: 815.4, tx: 518.6, ty: 837.4 },
    body: [
      "Once a British cantonment and now a tranquil forest retreat, Takdah has an intriguing blend of colonial history and Himalayan wilderness. Tall forests, old colonial structures and winding mountain roads give the village an almost storybook quality. It is a destination for those who appreciate luxury with character\u2014where heritage, nature and silence come together.",
    ],
  },
  {
    n: '09', slug: 'lamahatta', name: "Lamahatta",
    coord: "27.04\u00b0N \u00b7 88.35\u00b0E \u00b7 darjeeling hills",
    blurb: "A forested eco-hamlet with a hilltop shrine.",
    img: img(164),
    pin: { cx: 478.0, cy: 766.2, tx: 494.0, ty: 758.2 },
    body: [
      "Lamahatta is a beautifully landscaped mountain village where manicured gardens meet sweeping views of the Eastern Himalayas. Its famous Japanese-style garden, pine forests and tranquil atmosphere make it particularly suited to slow escapes. Come here for leisurely walks, spectacular sunsets and the pleasure of doing very little.",
    ],
  },
  {
    n: '10', slug: 'dawaipani', name: "Dawaipani",
    coord: "27.05\u00b0N \u00b7 88.30\u00b0E \u00b7 darjeeling hills",
    blurb: "A secluded hillside away from the crowds.",
    img: img(180),
    pin: { cx: 420.6, cy: 774.4, tx: 435.6, ty: 768.4 },
    body: [
      "Perched on a quiet ridge overlooking the mountains, Dawaipani is a small retreat with a remarkably grand view. The landscape unfolds towards Kanchenjunga and the Teesta valley, while the village itself remains wonderfully peaceful. It is the kind of place where luxury isn't about excess\u2014it is about privacy, views and uninterrupted time in the mountains.",
    ],
  },
  {
    n: '11', slug: 'bara-mangwa', name: "Bara Mangwa",
    coord: "27.07\u00b0N \u00b7 88.41\u00b0E \u00b7 teesta valley",
    blurb: "An orange-growing village by the Teesta.",
    img: img(177),
    pin: { cx: 609.2, cy: 889.2, tx: 624.2, ty: 883.2 },
    body: [
      "Bara Mangwa combines terraced farms, forested hills and sweeping Himalayan vistas in one secluded setting. The surrounding landscape offers plenty to explore, from village walks to viewpoints and riverside experiences, yet the atmosphere remains deeply peaceful. It is an ideal escape for travellers looking for a more immersive and private mountain holiday.",
    ],
  },
  {
    n: '12', slug: 'icche-gaon', name: "Icche Gaon",
    coord: "27.13\u00b0N \u00b7 88.57\u00b0E \u00b7 kalimpong hills",
    blurb: "A flower-filled ridge with wide valley views.",
    img: img(192),
    pin: { cx: 674.8, cy: 725.2, tx: 690.8, ty: 747.2 },
    body: [
      "Floating high above the Teesta valley, Icche Gaon is a tiny Himalayan village blessed with magnificent views of Kanchenjunga. Surrounded by pine forests and traditional village landscapes, it offers a wonderfully intimate mountain experience. Here, luxury comes in the form of fresh air, spectacular sunrises and the rare privilege of having the mountains all to yourself.",
    ],
  },
  {
    n: '13', slug: 'kolakham', name: "Kolakham",
    coord: "27.11\u00b0N \u00b7 88.65\u00b0E \u00b7 neora valley",
    blurb: "A forest village at the edge of Neora Valley.",
    img: img(206),
    pin: { cx: 740.4, cy: 676.0, tx: 756.4, ty: 696.0 },
    body: [
      "Hidden in the foothills of Neora Valley National Park, Kolakham is where dense forests meet dramatic Himalayan views. The village is surrounded by pristine wilderness and offers an excellent base for exploring the region's rich biodiversity. For luxury seekers, its real appeal is the feeling of being immersed in untouched nature without sacrificing comfort.",
    ],
  },
  {
    n: '14', slug: 'rishop', name: "Rishop",
    coord: "27.11\u00b0N \u00b7 88.65\u00b0E \u00b7 kalimpong hills",
    blurb: "Pine-clad slopes and a favourite sunrise point.",
    img: img(217),
    pin: { cx: 724.0, cy: 643.2, tx: 708.0, ty: 637.2, anchor: 'end' },
    body: [
      "Rishop is a quiet Himalayan village surrounded by pine forests and spectacular mountain scenery. On clear days, the views stretch across the Eastern Himalayas, with Kanchenjunga forming an unforgettable backdrop. Its secluded setting, forest trails and peaceful atmosphere make it a perfect destination for a luxurious digital detox.",
    ],
  },
  {
    n: '15', slug: 'sillery-gaon', name: "Sillery Gaon",
    coord: "27.14\u00b0N \u00b7 88.57\u00b0E \u00b7 kalimpong hills",
    blurb: "A ridge hamlet they call \"New Darjeeling\".",
    img: img(235),
    pin: { cx: 715.8, cy: 766.2, tx: 731.8, ty: 760.2 },
    body: [
      "Often described as a \u201cnew Darjeeling\u201d, Sillery Gaon is a tiny forested hamlet overlooking the Himalayan ranges. Pine forests, village trails and extraordinary sunrise views create an atmosphere of effortless tranquillity. It is especially magical at dawn, when the first light touches Kanchenjunga and the mountains slowly emerge from the mist.",
    ],
  },
  {
    n: '16', slug: 'dzongu-valley', name: "Dzongu Valley",
    coord: "27.56\u00b0N \u00b7 88.51\u00b0E \u00b7 north sikkim",
    blurb: "A protected Lepcha valley in north Sikkim.",
    img: img(244),
    pin: { cx: 532.4, cy: 154.4, tx: 547.4, ty: 148.4 },
    body: [
      "A protected homeland of the Lepcha people, Dzongu is one of Sikkim's most distinctive and culturally rich destinations. Waterfalls, forests, rivers and remote villages unfold across a landscape that feels almost untouched. The true luxury here is access to an authentic way of life\u2014staying close to nature, discovering Lepcha culture and experiencing Sikkim at its most unhurried.",
    ],
  },
  {
    n: '17', slug: 'yuksom', name: "Yuksom",
    coord: "27.38\u00b0N \u00b7 88.22\u00b0E \u00b7 west sikkim",
    blurb: "Sikkim's first capital and a classic trek base.",
    img: img(250),
    pin: { cx: 386.8, cy: 283.2, tx: 402.8, ty: 275.2 },
    body: [
      "The historic gateway to Kanchenjunga, Yuksom is where Sikkim's history and Himalayan wilderness meet. It was the first capital of Sikkim and the starting point for some of the region's most celebrated treks. Ancient monasteries, forest trails and traditional villages give Yuksom a rare depth, making it far more than simply a base for adventure.",
    ],
  },
  {
    n: '18', slug: 'khecheopalri', name: "Khecheopalri",
    coord: "27.38\u00b0N \u00b7 88.18\u00b0E \u00b7 west sikkim",
    blurb: "A sacred wishing lake ringed by forest.",
    img: img(257),
    pin: { cx: 370.0, cy: 316.8, tx: 354.0, ty: 310.8, anchor: 'end' },
    body: [
      "Hidden within the forests of western Sikkim, Khecheopalri is centred around a serene sacred lake revered by both Buddhists and Hindus. Local belief holds that the lake is miraculously free of leaves, as birds are said to remove them before they touch its surface. Surrounded by dense forest and an atmosphere of profound stillness, it offers a uniquely spiritual form of mountain luxury.",
    ],
  },
  {
    n: '19', slug: 'chatakpur', name: "Chatakpur",
    coord: "approx. \u00b7 kurseong hills",
    blurb: "A red-panda forest village above Kurseong.",
    img: img(129),
    pin: { cx: 475.0, cy: 995.0, tx: 459.0, ty: 989.0, anchor: 'end' },
    body: [
      "One of the highest villages in the Darjeeling hills, Chatakpur lies hidden deep within the forests of the Senchal sanctuary, where just a handful of homes look out onto an uninterrupted sweep of Kanchenjunga. It is a place of profound seclusion\u2014dense pine woods, birdsong at first light and a stillness broken only by the wind moving through the trees. From the village watchtower the horizon opens across valleys, distant plains and the great snow peaks, a sunrise many consider the equal of any in the region. Here, luxury is measured in silence, clean mountain air and the rare privilege of having the Himalayas almost entirely to yourself.",
    ],
  },
  ],
};
