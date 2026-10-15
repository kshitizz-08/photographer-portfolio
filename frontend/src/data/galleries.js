// ─── Individual Gallery Data ─────────────────────────────────────────────────
// Each gallery is a curated shoot story, separate from the general portfolio.
// Shape mirrors what a MongoDB document would return — swap this file's arrays
// for API calls when the backend is ready.
//
// Required fields per gallery:
//   slug        – URL-safe unique identifier (used in /gallery/:slug)
//   title       – display title
//   subtitle    – short one-liner (client name, location, year)
//   description – 2–3 sentence narrative shown on the gallery page
//   category    – must match a CATEGORIES value in sampleData.js
//   coverImage  – { src, alt } — the hero banner image
//   location    – string
//   year        – number
//   photos      – array of { id, src, alt, aspect }
//                 aspect: "portrait" | "landscape" | "square" | "tall"

export const GALLERIES = [
  // ── 1. Romantic Pre-Wedding ────────────────────────────────────────────────
  {
    slug: "romantic-pre-wedding",
    title: "Romantic Pre-Wedding",
    subtitle: "Sophie & Daniel · Hudson Valley, NY · 2024",
    description:
      "Sophie and Daniel wanted photographs that felt like a quiet afternoon they actually lived — not a photoshoot. We spent a late October day wandering the apple orchards and riverside paths of the Hudson Valley, letting the light and the landscape do the work.",
    category: "Pre-Wedding",
    location: "Hudson Valley, NY",
    year: 2024,
    coverImage: {
      src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1800&auto=format&fit=crop&q=80",
      alt: "Sophie and Daniel walking hand in hand through an autumn orchard",
    },
    photos: [
      {
        id: "rpw-1",
        src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&auto=format&fit=crop&q=80",
        alt: "Couple walking through a golden autumn orchard hand in hand",
        aspect: "landscape",
      },
      {
        id: "rpw-2",
        src: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=900&auto=format&fit=crop&q=80",
        alt: "Couple laughing on a wooden dock at sunset over the lake",
        aspect: "landscape",
      },
      {
        id: "rpw-3",
        src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&auto=format&fit=crop&q=80",
        alt: "Intimate close-up of the couple sharing a tender moment",
        aspect: "square",
      },
      {
        id: "rpw-4",
        src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&auto=format&fit=crop&q=80",
        alt: "Couple posed in a golden field of wildflowers at dusk",
        aspect: "portrait",
      },
      {
        id: "rpw-5",
        src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&auto=format&fit=crop&q=80",
        alt: "Wide shot of couple walking under a floral archway",
        aspect: "landscape",
      },
      {
        id: "rpw-6",
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80",
        alt: "Couple silhouetted against a mountain ridge as sun sets",
        aspect: "landscape",
      },
    ],
  },

  // ── 2. Wedding Story ───────────────────────────────────────────────────────
  {
    slug: "wedding-story",
    title: "A Wedding Story",
    subtitle: "Amara & Thomas · Catskill Mountains, NY · 2024",
    description:
      "Amara and Thomas were married on a misty September morning at a barn nestled in the Catskills. The day was unhurried, emotional, and full of the kinds of small, unrepeatable moments I live to photograph. This is their story.",
    category: "Wedding",
    location: "Catskill Mountains, NY",
    year: 2024,
    coverImage: {
      src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&auto=format&fit=crop&q=80",
      alt: "Amara and Thomas sharing a first look at golden hour in the garden",
    },
    photos: [
      {
        id: "ws-1",
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80",
        alt: "Bride and groom sharing a first look at golden hour in the garden",
        aspect: "portrait",
      },
      {
        id: "ws-2",
        src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&auto=format&fit=crop&q=80",
        alt: "Bride walking through a sunlit meadow in her flowing gown",
        aspect: "landscape",
      },
      {
        id: "ws-3",
        src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&auto=format&fit=crop&q=80",
        alt: "Couple exchanging vows by candlelight in an intimate barn ceremony",
        aspect: "portrait",
      },
      {
        id: "ws-4",
        src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&auto=format&fit=crop&q=80",
        alt: "Guests gathered beneath the floral arch during the outdoor ceremony",
        aspect: "landscape",
      },
      {
        id: "ws-5",
        src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&auto=format&fit=crop&q=80",
        alt: "Newlyweds strolling down a cobblestone street at dusk",
        aspect: "square",
      },
      {
        id: "ws-6",
        src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&auto=format&fit=crop&q=80",
        alt: "Couple walking through the orchard after the ceremony",
        aspect: "landscape",
      },
      {
        id: "ws-7",
        src: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=900&auto=format&fit=crop&q=80",
        alt: "First dance reflected on the lake behind the barn venue",
        aspect: "landscape",
      },
    ],
  },

  // ── 3. Fashion Editorial ──────────────────────────────────────────────────
  {
    slug: "fashion-editorial",
    title: "Fashion Editorial",
    subtitle: "Vogue Living Commission · Brooklyn, NY · 2024",
    description:
      "A full-day editorial shoot commissioned by Vogue Living, exploring the intersection of industrial architecture and couture fashion. We worked across three Dumbo and Williamsburg locations as the light shifted throughout the day.",
    category: "Fashion",
    location: "Brooklyn, NY",
    year: 2024,
    coverImage: {
      src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&auto=format&fit=crop&q=80",
      alt: "Model in a flowing couture dress against a weathered brick wall in Dumbo",
    },
    photos: [
      {
        id: "fe-1",
        src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=80",
        alt: "Model in a flowing couture dress against a weathered brick wall in Dumbo",
        aspect: "portrait",
      },
      {
        id: "fe-2",
        src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&auto=format&fit=crop&q=80",
        alt: "High-fashion model posing against an industrial concrete wall",
        aspect: "portrait",
      },
      {
        id: "fe-3",
        src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80",
        alt: "Full-length editorial shot on a rooftop at dusk with city skyline",
        aspect: "tall",
      },
      {
        id: "fe-4",
        src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop&q=80",
        alt: "Street-style fashion photo capturing movement on a Brooklyn bridge walkway",
        aspect: "landscape",
      },
      {
        id: "fe-5",
        src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
        alt: "Close-up editorial portrait with bold styling and warm side light",
        aspect: "square",
      },
      {
        id: "fe-6",
        src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&auto=format&fit=crop&q=80",
        alt: "Natural-light portrait of the model between locations",
        aspect: "portrait",
      },
    ],
  },

  // ── 4. Mountain Travel ─────────────────────────────────────────────────────
  {
    slug: "alpine-light",
    title: "Alpine Light",
    subtitle: "Personal Travel Series · Swiss Alps & Dolomites · 2023",
    description:
      "A three-week personal journey through the Swiss Alps and the Italian Dolomites in late autumn. No briefs, no clients — just early mornings, cold air, and the particular quality of mountain light that cannot be manufactured.",
    category: "Travel",
    location: "Swiss Alps & Dolomites",
    year: 2023,
    coverImage: {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&auto=format&fit=crop&q=80",
      alt: "Sweeping alpine mountain range bathed in early morning golden light",
    },
    photos: [
      {
        id: "al-1",
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=80",
        alt: "Sweeping alpine mountain range bathed in early morning golden light",
        aspect: "landscape",
      },
      {
        id: "al-2",
        src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&auto=format&fit=crop&q=80",
        alt: "Lone hiker silhouetted against a dramatic mountain ridge at dusk",
        aspect: "portrait",
      },
      {
        id: "al-3",
        src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&auto=format&fit=crop&q=80",
        alt: "Misty mountain valley with a river winding through ancient forest",
        aspect: "portrait",
      },
      {
        id: "al-4",
        src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&auto=format&fit=crop&q=80",
        alt: "Turquoise alpine lake surrounded by snow-capped peaks",
        aspect: "landscape",
      },
      {
        id: "al-5",
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80",
        alt: "Winding mountain trail through autumn foliage",
        aspect: "landscape",
      },
    ],
  },

  // ── 5. Executive Portraits ─────────────────────────────────────────────────
  {
    slug: "executive-portraits",
    title: "Executive Portraits",
    subtitle: "Corporate Series · Manhattan, NY · 2024",
    description:
      "A series of executive headshots and team portraits for a Manhattan-based financial firm. The brief called for images that felt human and approachable, without losing authority. Natural window light and minimal post-processing.",
    category: "Portrait",
    location: "Manhattan, NY",
    year: 2024,
    coverImage: {
      src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1800&auto=format&fit=crop&q=80",
      alt: "Executive headshot with clean background and confident natural expression",
    },
    photos: [
      {
        id: "ep-1",
        src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80",
        alt: "Executive headshot with clean background and confident natural expression",
        aspect: "portrait",
      },
      {
        id: "ep-2",
        src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&auto=format&fit=crop&q=80",
        alt: "Soft natural-light portrait against a warm neutral background",
        aspect: "portrait",
      },
      {
        id: "ep-3",
        src: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=900&auto=format&fit=crop&q=80",
        alt: "Dramatic black and white executive portrait with strong directional light",
        aspect: "square",
      },
      {
        id: "ep-4",
        src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&auto=format&fit=crop&q=80",
        alt: "Candid outdoor portrait in a sun-filled urban park setting",
        aspect: "landscape",
      },
      {
        id: "ep-5",
        src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=80",
        alt: "Studio portrait with diffused window light and minimal background",
        aspect: "portrait",
      },
    ],
  },

  // ── 6. Gala Evening ───────────────────────────────────────────────────────
  {
    slug: "gala-evening",
    title: "Gala Evening",
    subtitle: "Arts Foundation Annual Gala · Plaza Hotel, NY · 2024",
    description:
      "The Arts Foundation's annual fundraising gala at The Plaza — a night of candlelight, couture, and conversation. Commissioned to document the evening in an editorial style that honoured the energy of the room.",
    category: "Events",
    location: "Plaza Hotel, NY",
    year: 2024,
    coverImage: {
      src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1800&auto=format&fit=crop&q=80",
      alt: "Elegant gala dinner reception with candlelit tables and guests in formal attire",
    },
    photos: [
      {
        id: "ge-1",
        src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&auto=format&fit=crop&q=80",
        alt: "Elegant gala dinner reception with candlelit tables and guests in formal attire",
        aspect: "landscape",
      },
      {
        id: "ge-2",
        src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop&q=80",
        alt: "Wide shot of the ballroom filled with guests during the keynote address",
        aspect: "landscape",
      },
      {
        id: "ge-3",
        src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&auto=format&fit=crop&q=80",
        alt: "Speaker on stage addressing the gala audience with confidence",
        aspect: "landscape",
      },
      {
        id: "ge-4",
        src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&auto=format&fit=crop&q=80",
        alt: "Candid celebration moment — sparklers and laughter at the reception",
        aspect: "portrait",
      },
    ],
  },
];

// ── Helper: look up a gallery by its slug ──────────────────────────────────
// Returns undefined if no gallery matches — Portfolio page handles this case.
export function getGalleryBySlug(slug) {
  return GALLERIES.find((g) => g.slug === slug);
}

// ── Helper: get all galleries for a given category ─────────────────────────
export function getGalleriesByCategory(category) {
  return GALLERIES.filter((g) => g.category === category);
}
