// Destination content — regions, zones and sights.
// Sight names and bodies are the COMPLETE verbatim text of
// design_ins/mockup/uploads/destinations.docx; `body` and `intro` are arrays,
// one entry per paragraph in the doc. Generated from the .docx, not retyped.
// Photo captions, list blurbs and the north bengal region intro are ours.

const img = (id) => `https://picsum.photos/id/${id}/1200/900`;

export const NORTH_BENGAL = {
  slug: 'north-bengal',
  num: '01',
  name: 'north bengal',
  heroImg: img(1043),
  // the doc has no region-level intro for north bengal; this is the canvas's copy
  intro:
    'the hill towns of the darjeeling himalaya — tea gardens, toy trains and misty ridges. tap a zone on the map, or pick from the list.',
  zones: [
    {
      slug: "darjeeling",
      name: "Darjeeling",
      count: 7,
      blurb: "the queen of the hills \u2014 tea gardens, toy trains and kanchenjunga views.",
      heroImg: img(1043),
      intro: [
        "Darjeeling, fondly known as the \u201cQueen of the Hills,\u201d is one of those places that feels special the moment you arrive. With the mighty Kanchenjunga in the distance, winding mountain roads, endless tea gardens and the cool Himalayan air, every corner has a story to tell.",
        "It\u2019s not just about sightseeing here. It\u2019s about sipping a warm cup of Darjeeling tea, wandering through quiet lanes, watching the hills disappear into the mist, and simply slowing down for a while. From the charming toy train and old monasteries to cosy caf\u00e9s and breathtaking viewpoints, Darjeeling has a way of making you feel at home while leaving you with memories you\u2019ll want to come back for.",
      ],
      sights: [
        {
          n: "01",
          name: "Darjeeling Zoological Park",
          cap: "the zoo",
          img: img(237),
          body: [
            "Tucked away in the hills, the Darjeeling Zoo is a place where wildlife and the Himalayas come together. Walking through its forested paths, you\u2019ll get to see some of the region\u2019s most fascinating animals, including the adorable red panda, majestic snow leopard and Himalayan black bear.",
            "But what makes the zoo special is that it\u2019s more than just a place to see animals. It plays an important role in protecting and conserving Himalayan wildlife. With the misty mountains and lush greenery around you, even a simple walk through the zoo feels like a little adventure in the wild.",
          ],
        },
        {
          n: "02",
          name: "Tiger Hill",
          cap: "sunrise",
          img: img(1015),
          body: [
            "Tiger Hill is one of those places that makes waking up before sunrise completely worth it. As the sky slowly changes colour, the first rays of sunlight touch the snow-covered peaks of Kanchenjunga, painting the mountains in shades of gold and orange.",
            "Standing there in the chilly morning air, watching the mountains come alive, feels almost unreal. It\u2019s more than just a viewpoint\u2014it\u2019s one of those quiet, beautiful moments in Darjeeling that you\u2019ll carry with you long after the trip is over.",
          ],
        },
        {
          n: "03",
          name: "Batasia Loop",
          cap: "toy train",
          img: img(1039),
          body: [
            "Batasia Loop is one of those places where the journey itself becomes part of the experience. Located just outside Darjeeling, this beautiful spiral railway track offers lovely views of the surrounding hills and, on a clear day, Kanchenjunga in the distance.",
            "As the famous Darjeeling Toy Train winds its way around the loop, you get to see the mountains, gardens and the little railway tracks come together in one picture-perfect setting. It\u2019s a peaceful stop, a great place to take in the views, and a little glimpse into the charm of Darjeeling\u2019s old-world railway heritage.",
          ],
        },
        {
          n: "04",
          name: "Peace Pagoda",
          cap: "stillness",
          img: img(1016),
          body: [
            "Tucked away in the peaceful surroundings of Darjeeling, the Japanese Peace Pagoda is a place that instantly makes you slow down. The beautiful white structure, surrounded by greenery and mountain views, has a calmness that\u2019s hard to put into words.",
            "It\u2019s not just a place to admire; it\u2019s a place to pause, breathe and take in the silence. Step inside, look around, and let the views of the hills and the peaceful atmosphere do the rest. It\u2019s one of those stops in Darjeeling that feels less like sightseeing and more like a moment of peace.",
          ],
        },
        {
          n: "05",
          name: "Ghoom Monastery",
          cap: "prayer flags",
          img: img(1036),
          body: [
            "Perched high in the hills of Darjeeling, Ghoom Monastery is a quiet little escape from the bustle of the town. The moment you step inside, the peaceful atmosphere, colourful prayer flags and the gentle sound of prayers make you feel a world away.",
            "The monastery is home to a beautiful statue of Maitreya Buddha, and its simple, spiritual surroundings invite you to slow down and take it all in. It\u2019s not just about seeing another landmark\u2014it\u2019s about experiencing a quieter, more peaceful side of Darjeeling.",
          ],
        },
        {
          n: "06",
          name: "Himalayan Mountaineering Institute",
          cap: "the climbers",
          img: img(28),
          body: [
            "If you\u2019re curious about what it takes to conquer the Himalayas, the Himalayan Mountaineering Institute is a fascinating place to explore. Located in Darjeeling, it celebrates the spirit of mountaineering and the incredible people who have taken on some of the world\u2019s highest peaks.",
            "From old climbing equipment and expedition stories to photographs and achievements, there\u2019s plenty to discover here. It gives you a glimpse into the courage, determination and adventure that lie behind every Himalayan expedition\u2014and makes you appreciate the mountains in a whole new way.",
          ],
        },
      ],
      // 'special mention' band — a featured story block, counted in the
      // sight total but presented apart from the grid.
      feature: {
        label: 'special mention',
        name: "Darjeeling Tea",
        cap: 'tea estates · darjeeling',
        img: img(225),
        body: [
          "Darjeeling and tea have been connected for nearly two centuries. Tea cultivation began here in the mid-1800s, when the British introduced tea plants to the hills, discovering that Darjeeling\u2019s cool climate, high altitude and misty slopes were perfect for producing exceptional tea.",
          "Over the years, Darjeeling Tea travelled far beyond the hills, becoming highly sought-after in Britain, Europe and markets around the world. Its distinctive flavour, floral aroma and limited production gave it a reputation as one of the finest teas on the planet, earning it the famous title \u201cChampagne of Teas.\u201d",
          "Today, Darjeeling\u2019s tea gardens continue this legacy, with their teas enjoyed and exported across the globe. And there\u2019s something special about having a cup right here\u2014surrounded by rolling tea estates, cool mountain air and the very hills that made this tea famous.",
        ],
      },
    },
    {
      slug: "kurseong",
      name: "Kurseong",
      count: 5,
      blurb: "the land of white orchids \u2014 misty forests, heritage stops and cosy caf\u00e9s.",
      heroImg: img(29),
      intro: [
        "Kurseong is one of those little hill towns that you might drive past, but once you stop, you\u2019ll wonder why you didn\u2019t stay longer. Known as the \u201cLand of White Orchids,\u201d it is surrounded by misty hills, lush tea gardens and quiet forested roads.",
        "There\u2019s a slower rhythm here\u2014fewer crowds, peaceful walks, beautiful viewpoints and the occasional sight of the Toy Train making its way through the hills. If Darjeeling feels lively and iconic, Kurseong feels more personal, relaxed and wonderfully unhurried.",
      ],
      sights: [
        {
          n: "01",
          name: "Dow Hill",
          cap: "pine mist",
          img: img(1018),
          body: [
            "Dow Hill is one of those places where nature feels a little mysterious. Surrounded by dense pine forests and often wrapped in mist, this quiet corner near Kurseong has an almost otherworldly atmosphere.",
            "The area is known for its beautiful forest trails, old colonial-era surroundings and a collection of local legends that have added to its mysterious reputation over the years. Whether you come for the scenery, the stories or simply the peaceful escape, Dow Hill offers a completely different side of the Darjeeling hills\u2014quiet, atmospheric and just a little intriguing.",
          ],
        },
        {
          n: "02",
          name: "Eagle\u2019s Crag",
          cap: "the crag",
          img: img(1025),
          body: [
            "Eagle\u2019s Crag is one of those viewpoints where you can simply stand, look around and forget about everything else for a while. Perched above Kurseong, it offers beautiful views of the surrounding hills, valleys and distant mountains.",
            "The best part is the peaceful atmosphere. With the cool breeze, open skies and hills stretching out in front of you, it\u2019s a lovely spot to slow down, take a few photographs and enjoy the quieter side of the Darjeeling hills.",
          ],
        },
        {
          n: "03",
          name: "Chimney View Point",
          cap: "the chimney",
          img: img(110),
          body: [
            "Chimney View Point is a quiet little stop near Kurseong that offers a beautiful glimpse of the surrounding hills and valleys. The name comes from the old stone chimney standing here, a small reminder of the area\u2019s colonial past.",
            "With misty mountains, cool mountain air and plenty of greenery around, it\u2019s the kind of place where you can take a break from the road, enjoy the view and simply soak in the peaceful atmosphere. Not crowded or overly commercial, Chimney is perfect for travellers who enjoy discovering the quieter corners of the hills.",
          ],
        },
        {
          n: "04",
          name: "Hanuman Tok",
          cap: "quiet corner",
          img: img(164),
          body: [
            "Hanuman Tok in Kurseong is a peaceful little spot tucked away in the hills, offering a lovely combination of spirituality and mountain scenery. Surrounded by greenery and fresh mountain air, it\u2019s a place that feels calm and unhurried.",
            "The visit is less about ticking off another sightseeing point and more about enjoying the quiet, taking in the views and spending a few peaceful moments away from the crowds. It\u2019s a simple stop, but one that gives you a glimpse of the quieter, more local side of Kurseong.",
          ],
        },
        {
          n: "05",
          name: "Rohini",
          cap: "along the way",
          img: img(146),
          body: [
            "Rohini is one of those places where the journey feels just as beautiful as the destination. Nestled along the winding roads between Siliguri and Kurseong, it is surrounded by lush green hills, tea gardens and quiet villages.",
            "Away from the usual tourist crowds, Rohini lets you experience the hills at a slower pace. The scenic roads, fresh mountain air and peaceful surroundings make it a lovely place to stop, explore and simply enjoy the beauty of the landscape. It\u2019s the kind of hidden gem that reminds you that sometimes the best parts of a trip are found along the way.",
          ],
        },
      ],
    },
    {
      slug: "mirik",
      name: "Mirik",
      count: 3,
      blurb: "a serene lakeside town of pine forests and unhurried afternoons.",
      heroImg: img(1061),
      intro: [
        "Think of Mirik as Darjeeling\u2019s more laid-back cousin. Sitting quietly among tea gardens, pine forests and rolling hills, this charming town is centred around its beautiful lake\u2014the perfect spot for a relaxed boat ride or an unhurried stroll along the water.",
        "But there\u2019s more to Mirik than the lake. Winding roads lead through tea estates and little mountain settlements, with plenty of scenic stops along the way. It\u2019s a place where you can swap a packed sightseeing schedule for a cup of tea, a beautiful view and a few hours of simply enjoying the hills.",
      ],
      sights: [
        {
          n: "01",
          name: "Simana View Point",
          cap: "the border road",
          img: img(177),
          body: [
            "Simana View Point is quite literally where the landscape seems to open up. Sitting along the winding road between Darjeeling and Mirik, this narrow stretch of land offers sweeping views of the mountains and valleys on either side.",
            "On a clear day, the views stretch all the way towards the Himalayan ranges, while the cool breeze and surrounding greenery make it a perfect place for a quick stop. Add a cup of tea from one of the small local stalls, and suddenly a simple roadside break becomes one of the memorable moments of the journey.",
          ],
        },
        {
          n: "02",
          name: "Tingling View Point",
          cap: "tea terraces",
          img: img(217),
          body: [
            "Tingling View Point is a perfect little stop for anyone who loves mountain views. From here, the rolling tea gardens of Mirik stretch out beautifully across the hills, with the mountains adding to the charm. There\u2019s something very peaceful about standing here, feeling the cool breeze and watching the landscape unfold below. It\u2019s the kind of place where you\u2019ll naturally want to pause for a while and take a few pictures.",
          ],
        },
        {
          n: "03",
          name: "Mirik Lake",
          cap: "the lake",
          img: img(225),
          body: [
            "Right in the heart of Mirik, this beautiful lake is a lovely place to slow down and enjoy the surroundings. Surrounded by pine trees, hills and a walking path, the calm water gives the town a peaceful feel. You can take a relaxed stroll around the lake, enjoy a boat ride, or simply sit back and take in the scenery. It\u2019s less about rushing from one attraction to another and more about enjoying a quiet moment in the hills.",
          ],
        },
      ],
    },
    {
      slug: "kalimpong",
      name: "Kalimpong",
      count: 3,
      blurb: "a quieter hill town of monasteries, colonial lanes and mountain viewpoints.",
      heroImg: img(219),
      intro: [
        "Kalimpong has a charm that feels a little different from the usual hill stations. It\u2019s quieter, slower and surrounded by beautiful mountain landscapes, with colourful monasteries, old colonial buildings and winding roads adding to its character. Spend a day exploring the town, stop for a cup of tea, or simply find a viewpoint and watch the hills roll into the distance. Kalimpong is best enjoyed without a packed schedule\u2014just take your time and let the town reveal itself.",
      ],
      sights: [
        {
          n: "01",
          name: "Delo",
          cap: "above the town",
          img: img(238),
          body: [
            "Delo is one of those places in Kalimpong where the journey feels just as rewarding as the destination. Perched high above the town, it offers beautiful views of the surrounding hills and valleys, and on a clear day, you can even catch a glimpse of the distant Himalayan peaks. The cool breeze and open landscapes make it a wonderful place to slow down, wander around, and simply enjoy the mountains. It\u2019s a peaceful escape that lets you see Kalimpong from a whole new perspective.",
          ],
        },
        {
          n: "02",
          name: "Durpin Monastery",
          cap: "durpin hill",
          img: img(244),
          body: [
            "Perched on Durpin Hill, Durpin Monastery is a peaceful spot with a wonderful view of Kalimpong and the surrounding mountains. The monastery itself has a calm, welcoming atmosphere, with beautiful Buddhist artwork and colourful prayer flags adding to its charm. Take a little time to walk around, soak in the quiet, and enjoy the panoramic views outside. It\u2019s a place that feels less like a sightseeing stop and more like a moment to pause and breathe.",
          ],
        },
        {
          n: "03",
          name: "Sakya Monastery",
          cap: "the murals",
          img: img(249),
          body: [
            "Sakya Monastery is a quiet and beautiful corner of Kalimpong, away from the bustle of the town. Its peaceful surroundings, colourful prayer flags and traditional Buddhist details create a lovely sense of calm. Step inside and you\u2019ll find vibrant murals and a serene atmosphere that invites you to slow down for a while. It\u2019s a simple yet memorable stop, especially if you enjoy discovering the quieter side of Kalimpong.",
          ],
        },
      ],
    },
  ],
};

export const SIKKIM = {
  slug: 'sikkim',
  num: '02',
  name: 'sikkim',
  heroImg: img(1015),
  intro: "Sikkim is small, but there\u2019s a lot packed into it. You\u2019ll find everything from busy mountain towns and local markets to quiet monasteries, high-altitude lakes and some seriously beautiful roads. What makes a trip here special is the variety\u2014you can spend the morning exploring a monastery, stop for some local food, and end the day surrounded by mountains. And honestly, sometimes the best parts of Sikkim are the unexpected stops you make along the way.",
  // the doc has no zone-level intro for the sikkim quarters — east is the
  // canvas's copy, the other three are ours, written to that same pattern.
  zones: [
    {
      slug: "north-sikkim",
      name: "North Sikkim",
      count: 6,
      blurb: "Lachen \u00b7 Gurudongmar \u00b7 Yumthang \u00b7 Zero Point",
      heroImg: img(1015),
      intro: [
        "Where the road runs out and the Himalaya take over \u2014 glacial lakes, high passes and villages deep in the mountains. Six stops to build a trip around.",
      ],
      sights: [
        {
          n: "01",
          name: "Lachen",
          cap: "the last town",
          img: img(1016),
          body: [
            "Lachen is a small mountain town in North Sikkim, and it feels wonderfully removed from the usual tourist rush. It\u2019s often the starting point for journeys towards places like Gurudongmar Lake, but Lachen itself is worth taking some time to experience. Surrounded by rugged mountains, forests and traditional homes, the town has a raw, unpolished charm. Don\u2019t expect a long list of attractions here\u2014the real experience is the landscape, the quiet and the feeling of being deep in the mountains.",
          ],
        },
        {
          n: "02",
          name: "Gurudongmar Lake",
          cap: "high water",
          img: img(1039),
          body: [
            "Gurudongmar Lake is one of those places where the journey is a big part of the experience. Sitting high in the mountains of North Sikkim, the lake is surrounded by stark, dramatic landscapes that look completely different from the greener parts of the region. The bright blue water, rugged mountains and crisp mountain air make the setting unforgettable. It\u2019s remote, quiet and a little surreal\u2014and definitely a place you\u2019ll remember long after the trip is over.",
          ],
        },
        {
          n: "03",
          name: "Kala Patthar",
          cap: "dark rock",
          img: img(110),
          body: [
            "Kala Patthar is where Sikkim takes on a completely different look. The landscape becomes stark and rugged, with dark rocks, open mountain slopes and snow-covered peaks creating an almost otherworldly setting. There\u2019s very little around you here\u2014just mountains, sky and an incredible sense of being far away from everything. It\u2019s not a place you visit for a long list of activities; you go there for the experience of standing in the middle of such a raw Himalayan landscape.",
          ],
        },
        {
          n: "04",
          name: "Lachung",
          cap: "the village",
          img: img(164),
          body: [
            "Lachung is a charming mountain village in North Sikkim, surrounded by forests, steep slopes and snow-covered peaks. The village itself is quiet and simple, with traditional houses and the Lachung Chu flowing alongside it. It\u2019s also a convenient base for exploring some of North Sikkim\u2019s most spectacular landscapes. But before heading out, take some time to wander through the village\u2014you\u2019ll get a glimpse of a slower, more authentic side of Sikkim.",
          ],
        },
        {
          n: "05",
          name: "Yumthang Valley",
          cap: "the valley",
          img: img(146),
          body: [
            "Yumthang Valley is where the landscape really steals the show. Surrounded by towering mountains and crossed by the Teesta River, the valley changes character with the seasons\u2014lush and colourful in spring, while winter can turn it into a snowy wonderland. The drive from Lachung is an experience in itself, with forests, waterfalls and dramatic mountain scenery along the way. Don\u2019t rush through this one; stop wherever the views catch your eye and simply enjoy being surrounded by the Himalayas.",
          ],
        },
        {
          n: "06",
          name: "Zero Point",
          cap: "end of the road",
          img: img(177),
          body: [
            "Zero Point feels like the road has taken you to the very edge of the map. With snow-covered mountains all around and hardly any vegetation, the landscape is stark, open and incredibly dramatic. Depending on the season, you can walk around in the snow, play in it or simply take in the views. The weather can change quickly up here, so come prepared\u2014but once you\u2019re there, the cold is easily forgotten in the excitement of the place.",
          ],
        },
      ],
    },
    {
      slug: "east-sikkim",
      name: "East Sikkim",
      count: 4,
      blurb: "Gangtok \u00b7 Nathu La \u00b7 Changu \u00b7 Zuluk",
      heroImg: img(1036),
      intro: [
        "Where Sikkim's laid-back mountain charm meets the buzz of a proper town \u2014 lively streets, high passes and lakes that freeze in winter. Four stops to build a trip around.",
      ],
      sights: [
        {
          n: "01",
          name: "Gangtok",
          cap: "mg marg",
          img: img(217),
          body: [
            "Gangtok is where Sikkim\u2019s laid-back mountain charm meets the energy of a proper town. You can spend the day exploring monasteries and viewpoints, wander through MG Marg in the evening, or simply find a caf\u00e9 and watch life go by. The streets are lively, the food is worth exploring, and the surrounding hills are never too far from view. It\u2019s also a great base for heading out to some of Sikkim\u2019s more remote destinations.",
          ],
        },
        {
          n: "02",
          name: "Nathu La",
          cap: "the silk route",
          img: img(225),
          body: [
            "Nathu La is more than just a mountain pass\u2014it\u2019s a place where history, geography and the Himalayas come together. Sitting at a high altitude on the old Silk Route, the pass connects Sikkim with Tibet and has long been an important trade route. The drive up is filled with dramatic mountain views, winding roads and changing landscapes. Once you reach Nathu La, the sheer altitude and rugged surroundings make you realise just how far into the Himalayas you\u2019ve travelled.",
          ],
        },
        {
          n: "03",
          name: "Changu Lake",
          cap: "frozen lake",
          img: img(237),
          body: [
            "Changu Lake, also known as Tsomgo Lake, is one of Sikkim\u2019s most popular mountain stops\u2014and for good reason. The lake sits high above Gangtok, surrounded by steep mountains that change dramatically with the seasons. In winter, the water can freeze and the landscape turns beautifully snowy, while warmer months bring clearer views and a different kind of charm. Take a little time here to walk around, enjoy the mountain air and soak in the scenery before continuing your journey.",
          ],
        },
        {
          n: "04",
          name: "Zuluk",
          cap: "the hairpins",
          img: img(238),
          body: [
            "Zuluk is a tiny mountain village tucked away in the hills of East Sikkim, best known for its incredible winding roads and sweeping Himalayan views. The journey here is part of the attraction, especially the famous hairpin bends that seem to fold endlessly across the mountainside. Life in Zuluk is quiet and simple, with homestays offering a chance to experience the warmth of a local mountain community. It\u2019s a great place to escape the crowds and see a more remote, less-travelled side of Sikkim.",
          ],
        },
      ],
    },
    {
      slug: "west-sikkim",
      name: "West Sikkim",
      count: 4,
      blurb: "Pelling \u00b7 Pemayangtse \u00b7 Yuksom \u00b7 Kanchenjunga Falls",
      heroImg: img(1039),
      intro: [
        "Monastery ridges and Kanchenjunga mornings \u2014 old capitals, forest trails and the state's Buddhist heart. Four stops to build a trip around.",
      ],
      sights: [
        {
          n: "01",
          name: "Pelling",
          cap: "first light",
          img: img(244),
          body: [
            "Pelling is a great place to experience Sikkim without the rush of a busy hill town. Its biggest attraction is the spectacular view of the Himalayas, especially on clear mornings when the snow-covered peaks come into full view. But there\u2019s more to Pelling than just the scenery\u2014monasteries, old ruins, forests and peaceful trails give you plenty to explore. It\u2019s the kind of place where you can keep your plans light and let the mountains do most of the entertaining.",
          ],
        },
        {
          n: "02",
          name: "Pemayangtse",
          cap: "the monastery",
          img: img(249),
          body: [
            "Pemayangtse is a quiet little corner of West Sikkim, best known for its beautiful monastery and rich Buddhist heritage. The Pemayangtse Monastery sits amidst forested hills, with the mountains adding to the peaceful setting. Take a moment to explore the monastery\u2019s intricate interiors and traditional artwork, then step outside for the views. It\u2019s a short visit, but one that gives you a real sense of Sikkim\u2019s culture and history.",
          ],
        },
        {
          n: "03",
          name: "Yuksom",
          cap: "the old capital",
          img: img(219),
          body: [
            "Yuksom has a quieter, more laid-back feel than many of Sikkim\u2019s better-known towns. It\u2019s a place where history and nature come together, as Yuksom was the first capital of Sikkim and is closely connected with the state\u2019s Buddhist heritage. It\u2019s also the starting point for some of Sikkim\u2019s famous trekking routes, making it a favourite among those who prefer trails and forests over crowded tourist spots. Spend some time here and you\u2019ll see a slower, more local side of the state.",
          ],
        },
        {
          n: "04",
          name: "Kanchenjunga Falls",
          cap: "the falls",
          img: img(28),
          body: [
            "Kanchenjunga Falls is one of those stops where you can hear the waterfall before you actually see it. Water rushes down the rocky mountainside, surrounded by dense greenery, creating a refreshing spot to take a break during your journey. You can get quite close to the falls, making it more fun than simply viewing it from a distance. It\u2019s a quick stop, but the sound of the water, cool spray and mountain setting make it worth pulling over for.",
          ],
        },
      ],
    },
    {
      slug: "south-sikkim",
      name: "South Sikkim",
      count: 4,
      blurb: "Ravangla \u00b7 Namchi \u00b7 Tarey Bhir \u00b7 Chardham",
      heroImg: img(29),
      intro: [
        "The gentler, greener side \u2014 ridge walks, hilltop temples and towns that keep their own pace. Four stops to build a trip around.",
      ],
      sights: [
        {
          n: "01",
          name: "Tarey Bhir",
          cap: "the ridge",
          img: img(1025),
          body: [
            "Tarey Bhir is a beautiful viewpoint in South Sikkim, known for its dramatic ridge and sweeping views of the surrounding valleys. The walk along the ridge is part of the experience, with open skies and mountains stretching out in every direction. It\u2019s a great spot for a little adventure, some quiet time and, of course, a few memorable photographs.",
          ],
        },
        {
          n: "02",
          name: "Ravangla",
          cap: "buddha park",
          img: img(1061),
          body: [
            "Ravangla is a peaceful mountain town in South Sikkim, surrounded by forests and beautiful Himalayan views. It\u2019s best known for the impressive Buddha Park, but there\u2019s more to the place than just one attraction. The town has a relaxed pace, cool weather and plenty of scenic spots to explore. It\u2019s a good choice if you want to experience Sikkim at a slower, quieter rhythm, away from the busier tourist hubs.",
          ],
        },
        {
          n: "03",
          name: "Namchi",
          cap: "the hills",
          img: img(1018),
          body: [
            "Namchi is one of those South Sikkim towns where there\u2019s a nice mix of culture, spirituality and mountain scenery. It\u2019s home to attractions like Chardham and the impressive Samdruptse Hill, while the town itself has a relaxed, local feel. The surrounding hills and tea gardens make the drive here just as enjoyable as the stops along the way. Namchi is a good place to slow down and explore a different, less-rushed side of Sikkim.",
          ],
        },
        {
          n: "04",
          name: "Chardham",
          cap: "the hilltop",
          img: img(1043),
          body: [
            "Chardham is one of Namchi\u2019s most striking attractions, bringing together four important Hindu temples in a beautifully landscaped hilltop complex. At the centre stands a towering statue of Lord Shiva, visible from quite a distance. The complex is spacious and peaceful, with mountain views adding to the experience. Even if you\u2019re not visiting purely for religious reasons, the scale, architecture and setting make Chardham an interesting stop while exploring South Sikkim.",
          ],
        },
      ],
    },
  ],
};
