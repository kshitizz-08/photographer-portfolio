// ─── Sample Photography Data ────────────────────────────────────────────────
// All image URLs pull from Unsplash — reliable, high-quality, freely usable.
// To connect to MongoDB later, replace these arrays with API responses
// and keep the same object shape: { id, src, alt, category, location?, year? }

export const PHOTOGRAPHER = {
  name: "Jalindar Pale",
  tagline: "Capturing Moments That Last Forever.",
  sectionLabel: "THE PHOTOGRAPHER",
  headline: "Every Story, Beautifully Framed",
  bio: "I believe every moment has a story worth telling. From the intimacy of weddings and the energy of celebrations to the individuality of portraits and the beauty of the world around us, my photography is driven by a passion for capturing life in all its forms.",
  bioExtra: "My approach blends creativity, natural light, and genuine emotion to create photographs that feel timeless, authentic, and personal. Whatever the subject, my goal remains the same — to turn fleeting moments into lasting memories.",
  shortBio: "Photographer passionate about capturing life in all its forms — weddings, celebrations, portraits, and the beauty of the world around us.",
  location: "Khadambe, Rahuri, Ahilyanagar. 413704",
  email: "jalindarpalephotography@gmail.com",
  phone: "+91 84080 31390",
  instagram: "https://www.instagram.com/jalindar_pale_photography?utm_source=ig_web_button_share_sheet&exln=ZDNlZDc0MzIxNw==",
  facebook: "https://facebook.com",
  pinterest: "https://pinterest.com",
};

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&auto=format&fit=crop&q=80";

export const PHOTOGRAPHER_PORTRAIT =
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&auto=format&fit=crop&q=80";

// ─── Portfolio Categories ────────────────────────────────────────────────────
// To add a new category: add it here AND add matching photos in ALL_PHOTOS below.
export const CATEGORIES = [
  "All",
  "Wedding",
  "Pre-Wedding",
  "Portrait",
  "Events",
  "Fashion",
  "Travel",
];

// ─── Full Portfolio ──────────────────────────────────────────────────────────
// Each photo object shape:
//   id        – unique string (use your MongoDB _id when live)
//   src       – full image URL
//   alt       – descriptive, accessible alt text
//   category  – must match one of CATEGORIES (excluding "All")
//   location  – optional display string
//   year      – optional 4-digit number
//
// "aspect" hints the grid how tall to render the tile:
//   "portrait"  → aspect-[3/4]   (tall)
//   "landscape" → aspect-[4/3]   (wide)
//   "square"    → aspect-square
//   "tall"      → aspect-[2/3]   (very tall)
export const ALL_PHOTOS = [
  // ── Wedding ─────────────────────────────────────────────────────────────
  {
    id: "w1",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80",
    alt: "Bride and groom sharing a first look at golden hour in the garden",
    category: "Wedding",
    location: "Hudson Valley, NY",
    year: 2024,
    aspect: "portrait",
  },
  {
    id: "w2",
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&auto=format&fit=crop&q=80",
    alt: "Bride walking through a sunlit field in a flowing gown",
    category: "Wedding",
    location: "Catskills, NY",
    year: 2024,
    aspect: "landscape",
  },
  {
    id: "w3",
    src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&auto=format&fit=crop&q=80",
    alt: "Wedding ceremony under a floral arch at a vineyard",
    category: "Wedding",
    location: "Napa Valley, CA",
    year: 2023,
    aspect: "landscape",
  },
  {
    id: "w4",
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&auto=format&fit=crop&q=80",
    alt: "Couple exchanging vows in a candlelit barn ceremony",
    category: "Wedding",
    location: "Vermont",
    year: 2023,
    aspect: "portrait",
  },
  {
    id: "w5",
    src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&auto=format&fit=crop&q=80",
    alt: "Newlyweds walking down a cobblestone street at dusk",
    category: "Wedding",
    location: "Savannah, GA",
    year: 2024,
    aspect: "square",
  },

  // ── Pre-Wedding ──────────────────────────────────────────────────────────
  {
    id: "pw1",
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&auto=format&fit=crop&q=80",
    alt: "Engaged couple walking hand in hand through an autumn forest",
    category: "Pre-Wedding",
    location: "Central Park, NY",
    year: 2024,
    aspect: "portrait",
  },
  {
    id: "pw2",
    src: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=900&auto=format&fit=crop&q=80",
    alt: "Couple laughing on a wooden dock at sunset over the lake",
    category: "Pre-Wedding",
    location: "Lake Placid, NY",
    year: 2024,
    aspect: "landscape",
  },
  {
    id: "pw3",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&auto=format&fit=crop&q=80",
    alt: "Intimate close-up of engaged couple sharing a quiet moment",
    category: "Pre-Wedding",
    location: "Brooklyn, NY",
    year: 2023,
    aspect: "square",
  },
  {
    id: "pw4",
    src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&auto=format&fit=crop&q=80",
    alt: "Couple posing in front of a field of wildflowers at golden hour",
    category: "Pre-Wedding",
    location: "Long Island, NY",
    year: 2023,
    aspect: "portrait",
  },

  // ── Portrait ─────────────────────────────────────────────────────────────
  {
    id: "pr1",
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&auto=format&fit=crop&q=80",
    alt: "Soft natural-light portrait of a woman against a warm background",
    category: "Portrait",
    location: "Studio, NY",
    year: 2024,
    aspect: "portrait",
  },
  {
    id: "pr2",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=80",
    alt: "Studio portrait with diffused window light and minimal background",
    category: "Portrait",
    location: "Studio, NY",
    year: 2024,
    aspect: "portrait",
  },
  {
    id: "pr3",
    src: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=900&auto=format&fit=crop&q=80",
    alt: "Dramatic black and white close-up portrait with strong shadows",
    category: "Portrait",
    location: "Studio, NY",
    year: 2023,
    aspect: "square",
  },
  {
    id: "pr4",
    src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&auto=format&fit=crop&q=80",
    alt: "Candid outdoor portrait of a young woman in a sun-drenched park",
    category: "Portrait",
    location: "Prospect Park, NY",
    year: 2023,
    aspect: "landscape",
  },
  {
    id: "pr5",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80",
    alt: "Executive headshot with a clean background and confident expression",
    category: "Portrait",
    location: "Studio, NY",
    year: 2024,
    aspect: "portrait",
  },

  // ── Events ───────────────────────────────────────────────────────────────
  {
    id: "ev1",
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop&q=80",
    alt: "Conference room filled with attendees at an industry summit",
    category: "Events",
    location: "Javits Center, NY",
    year: 2024,
    aspect: "landscape",
  },
  {
    id: "ev2",
    src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&auto=format&fit=crop&q=80",
    alt: "Elegant gala dinner reception with candlelit tables and guests mingling",
    category: "Events",
    location: "Plaza Hotel, NY",
    year: 2024,
    aspect: "landscape",
  },
  {
    id: "ev3",
    src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&auto=format&fit=crop&q=80",
    alt: "Speaker on stage addressing a large auditorium audience",
    category: "Events",
    location: "Brooklyn Academy, NY",
    year: 2023,
    aspect: "landscape",
  },
  {
    id: "ev4",
    src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&auto=format&fit=crop&q=80",
    alt: "Birthday celebration with sparklers and candid laughter",
    category: "Events",
    location: "Rooftop, Manhattan",
    year: 2023,
    aspect: "portrait",
  },

  // ── Fashion ──────────────────────────────────────────────────────────────
  {
    id: "fa1",
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=80",
    alt: "Editorial fashion portrait of a model in a flowing couture dress",
    category: "Fashion",
    location: "Dumbo, Brooklyn",
    year: 2024,
    aspect: "portrait",
  },
  {
    id: "fa2",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&auto=format&fit=crop&q=80",
    alt: "High-fashion model posing against an industrial concrete wall",
    category: "Fashion",
    location: "Meatpacking District, NY",
    year: 2024,
    aspect: "portrait",
  },
  {
    id: "fa3",
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80",
    alt: "Full-length fashion editorial shot of a model on a rooftop at dusk",
    category: "Fashion",
    location: "Williamsburg, Brooklyn",
    year: 2024,
    aspect: "tall",
  },
  {
    id: "fa4",
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop&q=80",
    alt: "Street-style fashion photo capturing movement and energy on Fifth Avenue",
    category: "Fashion",
    location: "Fifth Avenue, NY",
    year: 2023,
    aspect: "landscape",
  },
  {
    id: "fa5",
    src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
    alt: "Close-up editorial portrait of a model with bold makeup and styling",
    category: "Fashion",
    location: "Studio, NY",
    year: 2023,
    aspect: "square",
  },

  // ── Travel ───────────────────────────────────────────────────────────────
  {
    id: "tr1",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=80",
    alt: "Sweeping alpine mountain range bathed in early morning light",
    category: "Travel",
    location: "Swiss Alps",
    year: 2023,
    aspect: "landscape",
  },
  {
    id: "tr2",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&auto=format&fit=crop&q=80",
    alt: "Lone hiker silhouetted against a dramatic mountain ridge at dusk",
    category: "Travel",
    location: "Dolomites, Italy",
    year: 2023,
    aspect: "portrait",
  },
  {
    id: "tr3",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80",
    alt: "Couple walking a winding mountain trail surrounded by autumn foliage",
    category: "Travel",
    location: "Patagonia, Chile",
    year: 2022,
    aspect: "landscape",
  },
  {
    id: "tr4",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop&q=80",
    alt: "Open highway stretching to the horizon through a vast desert landscape",
    category: "Travel",
    location: "Monument Valley, AZ",
    year: 2022,
    aspect: "landscape",
  },
  {
    id: "tr5",
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&auto=format&fit=crop&q=80",
    alt: "Turquoise tropical lagoon with overwater bungalows in soft afternoon light",
    category: "Travel",
    location: "Bora Bora",
    year: 2023,
    aspect: "landscape",
  },
  {
    id: "tr6",
    src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&auto=format&fit=crop&q=80",
    alt: "Misty mountain valley with a river winding through an ancient forest",
    category: "Travel",
    location: "New Zealand",
    year: 2022,
    aspect: "portrait",
  },
];

// ─── Featured Gallery (Home page — curated picks) ─────────────────────────────
export const FEATURED_PHOTOS = [];

// ─── Services ────────────────────────────────────────────────────────────────
export const SERVICES = [
  {
    id: "s1",
    title: "Wedding Photography",
    description:
      "Full-day documentary coverage of your wedding, from preparations through the last dance. Every glance, tear, and laugh — preserved.",
    price: "From ₹2,90,000",
    duration: "8–12 hours",
    includes: ["Engagement session", "Online gallery", "Print-ready files", "Second shooter"],
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=700&auto=format&fit=crop&q=80",
  },
  {
    id: "s2",
    title: "Portrait Sessions",
    description:
      "Individual, couple, or executive portraits made in natural light or studio. Ideal for personal branding, LinkedIn, or simply a beautiful memory.",
    price: "From ₹54,000",
    duration: "1–2 hours",
    includes: ["20+ edited images", "Online gallery", "Commercial license available"],
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&auto=format&fit=crop&q=80",
  },
  {
    id: "s3",
    title: "Events Coverage",
    description:
      "Candid, editorial-style event photography for galas, conferences, corporate dinners, and private celebrations.",
    price: "From ₹99,000",
    duration: "4–8 hours",
    includes: ["Online gallery", "Print-ready files", "Same-week delivery"],
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&auto=format&fit=crop&q=80",
  },
  {
    id: "s4",
    title: "Fashion & Editorial",
    description:
      "Creative direction and photography for magazines, brands, and campaigns. Concept development, styling coordination, and full post-production included.",
    price: "Contact for pricing",
    duration: "Half or full day",
    includes: ["Art direction", "Retouching", "Usage licensing", "Deliverables brief"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&auto=format&fit=crop&q=80",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Kshitij Kalhapure",
    role: "Wedding clients, 2024",
    quote:
      "The most beautiful thing about our photographs is how they bring us back to the feelings of that day. Every glance, every tear, and every little moment was captured with so much love. These are memories we'll cherish forever.",
  },
  {
    id: "t2",
    name: "Bhushan Pawar",
    role: "Wedding clients, 2025",
    quote:
      "Somehow, they captured not only how our wedding looked, but exactly how it felt. Every photograph is filled with warmth, emotion, and the kind of beauty that only grows more precious with time.",
  },
  {
    id: "t3",
    name: "Vogue Living",
    role: "Editorial client, 2023",
    quote:
      "Jalindar's editorial eye is extraordinary. He delivered a series of images that exceeded our creative brief and felt genuinely timeless.",
  },
];
