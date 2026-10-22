/**
 * scripts/seed.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Database development seeder.
 *
 * Populates:
 * 1. Photographer profile (keeps password and private notes safely guarded)
 * 2. Services / Packages
 * 3. PortfolioImage collection
 * 4. Gallery collections (referencing PortfolioImage documents)
 * 5. Sample Inquiries with referenceId and private notes
 *
 * Run with:
 *   node scripts/seed.js
 * Or from package.json:
 *   npm run seed
 */

import "dotenv/config";
import mongoose from "mongoose";
import Photographer from "../models/Photographer.js";
import Service from "../models/Service.js";
import PortfolioImage from "../models/PortfolioImage.js";
import Gallery from "../models/Gallery.js";
import Inquiry from "../models/Inquiry.js";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  console.error("\n[Seed] Error: process.env.MONGODB_URI is not defined.");
  console.error("Please add your MongoDB connection string in backend/.env first.\n");
  process.exit(1);
}

async function seed() {
  try {
    console.log("[Seed] Connecting to MongoDB...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`[Seed] Connected to: ${mongoose.connection.host}`);

    // Clear existing development collections
    console.log("[Seed] Clearing existing collections...");
    await Promise.all([
      Photographer.deleteMany({}),
      Service.deleteMany({}),
      PortfolioImage.deleteMany({}),
      Gallery.deleteMany({}),
      Inquiry.deleteMany({}),
    ]);

    // ── 1. Seed Photographer ───────────────────────────────────────────────────
    console.log("[Seed] Seeding Photographer profile...");
    const adminPassword = process.env.ADMIN_PASSWORD || "Jalu@9900";
    const adminEmail = process.env.ADMIN_EMAIL || "jalindarpalephotography@gmail.com";
    const photographer = await Photographer.create({
      name: process.env.ADMIN_NAME || "Jalindar Pale",
      title: "Fine Art & Editorial Photographer",
      email: adminEmail,
      // Password will be hashed with bcrypt by the Photographer pre('save') hook
      password: adminPassword,
      privateNotes: "Admin Note: Travel radius is 150 miles without per-diem fees. Contact manager for Milan Fashion Week schedule.",
      bio: "Based in New York, I am a documentary-style photographer with over a decade of experience. I believe great photographs are quiet — they do not shout, they whisper. My work spans weddings, editorial portraits, and landscape photography across three continents.",
      shortBio: "Documentary-style photographer based in New York, specializing in weddings, portraits, and landscapes.",
      profileImage: {
        imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&auto=format&fit=crop&q=80",
        altText: "Elena Vasquez holding a 35mm rangefinder camera in her studio",
      },
      heroHeading: "Capturing Moments That Last Forever.",
      heroSubheading: "Documentary-style wedding, portrait, and editorial photography driven by natural light and unscripted emotion.",
      location: "New York, USA & Worldwide",
      phone: "+1 (212) 555-0198",
      socialLinks: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        pinterest: "https://pinterest.com",
        twitter: "https://twitter.com",
      },
      stats: [
        { label: "Years Behind Lens", value: "12+" },
        { label: "Weddings Documented", value: "180+" },
        { label: "Countries Visited", value: "24" },
        { label: "Editorial Publications", value: "35+" },
      ],
    });

    // Also create admin@emoharmony.com so both email logins always work
    await Photographer.create({
      name: "EmoHarmony Admin",
      title: "Fine Art & Editorial Photographer",
      email: "admin@emoharmony.com",
      password: adminPassword,
      privateNotes: "Primary studio administration account.",
    });

    // ── 2. Seed Services ───────────────────────────────────────────────────────
    console.log("[Seed] Seeding Services...");
    const services = await Service.insertMany([
      {
        name: "Full Wedding Story",
        slug: "wedding-story",
        description: "Complete, immersive documentary coverage of your celebration from quiet morning preparations through the midnight dance floor.",
        startingPrice: 3800,
        currency: "INR",
        coverImage: {
          imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80",
          altText: "Bride and groom sharing an emotional first look outdoors",
        },
        features: [
          "Up to 10 hours of comprehensive documentary coverage",
          "Second associate photographer included",
          "500+ curated and hand-color-graded high-resolution photographs",
          "Private online gallery with full print release & instant downloads",
          "Complimentary 90-minute engagement session in the Hudson Valley",
        ],
        deliverables: "High-resolution digital gallery + heirloom linen proof box with 50 fine-art prints",
        isPublished: true,
        sortOrder: 1,
      },
      {
        name: "Intimate Pre-Wedding & Elopement",
        slug: "intimate-pre-wedding",
        description: "A slow-paced, cinematic session in natural landscapes or architectural settings, celebrating intimacy without the rush of a ceremony schedule.",
        startingPrice: 1400,
        currency: "INR",
        coverImage: {
          imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&auto=format&fit=crop&q=80",
          altText: "Couple walking hand-in-hand through an autumn apple orchard",
        },
        features: [
          "Up to 3 hours of on-location natural light shooting",
          "Personalized location scouting and timing consultation",
          "Up to two wardrobe changes",
          "90+ hand-edited high-resolution images delivered in 3 weeks",
          "Travel within 2 hours of New York included",
        ],
        deliverables: "Curated online gallery + 10 archival 8x10 prints",
        isPublished: true,
        sortOrder: 2,
      },
      {
        name: "Editorial & Fine Art Portraits",
        slug: "editorial-portraiture",
        description: "Artistic, character-driven portraiture for artists, entrepreneurs, authors, and actors seeking photographs that feel authentic and soulful.",
        startingPrice: 850,
        currency: "INR",
        coverImage: {
          imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80",
          altText: "Natural light editorial portrait of a woman in minimalist studio",
        },
        features: [
          "90-minute studio or outdoor session",
          "Styling, moodboard, and wardrobe consultation prior to shoot",
          "30 master-retouched high-resolution images",
          "Private review gallery with web & print formats",
        ],
        deliverables: "Digital download package with commercial & personal usage rights",
        isPublished: true,
        sortOrder: 3,
      },
      {
        name: "Events & Cultural Gatherings",
        slug: "events-gatherings",
        description: "Candid, non-intrusive documentary photography for galas, gallery openings, private dinners, and celebrations.",
        startingPrice: 1800,
        currency: "INR",
        coverImage: {
          imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&auto=format&fit=crop&q=80",
          altText: "Warm evening banquet celebration illuminated by fairy lights",
        },
        features: [
          "Coverage from 4 to 8 hours tailored to your program",
          "Fast-turnaround preview set (24 hours) for press/social sharing",
          "Full downloadable gallery with unrestricted guest access",
        ],
        deliverables: "High-resolution digital gallery delivered within 7 business days",
        isPublished: true,
        sortOrder: 4,
      },
    ]);

    // ── 3. Seed Portfolio Images ────────────────────────────────────────────────
    console.log("[Seed] Seeding PortfolioImage collection...");
    const photoData = [
      // Wedding
      {
        title: "Golden Hour First Look",
        description: "Intimate first glance between bride and groom as warm sunset light filters through the orchard.",
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80",
        altText: "Bride and groom sharing a first look at golden hour in the garden",
        category: "Wedding",
        aspect: "portrait",
        location: "Hudson Valley, NY",
        year: 2024,
        isFeatured: false,
        isPublished: true,
        sortOrder: 1,
      },
      {
        title: "The Recessional Walk",
        description: "Unfiltered joy and confetti as newlyweds walk back down the stone chapel aisle.",
        imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&auto=format&fit=crop&q=80",
        altText: "Newlyweds walking down the aisle showered in petal confetti",
        category: "Wedding",
        aspect: "landscape",
        location: "Catskills, NY",
        year: 2024,
        isFeatured: false,
        isPublished: true,
        sortOrder: 2,
      },
      {
        title: "Vows in the Olive Grove",
        description: "Quiet outdoor ceremony framed by ancient olive trees at dusk.",
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&auto=format&fit=crop&q=80",
        altText: "Couple holding hands under an olive tree during vows",
        category: "Wedding",
        aspect: "square",
        location: "Napa Valley, CA",
        year: 2023,
        isFeatured: false,
        isPublished: true,
        sortOrder: 3,
      },
      // Pre-Wedding
      {
        title: "Orchard Afternoon Walk",
        description: "Sophie and Daniel sharing quiet laughter along the Hudson riverside orchard.",
        imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&auto=format&fit=crop&q=80",
        altText: "Couple walking hand in hand through an autumn orchard",
        category: "Pre-Wedding",
        aspect: "landscape",
        location: "Hudson Valley, NY",
        year: 2024,
        isFeatured: false,
        isPublished: true,
        sortOrder: 4,
      },
      {
        title: "Lake Twilight embrace",
        description: "Sun sinking below the horizon over the calm lake pier.",
        imageUrl: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=900&auto=format&fit=crop&q=80",
        altText: "Couple laughing on a wooden dock at sunset over the lake",
        category: "Pre-Wedding",
        aspect: "landscape",
        location: "Lake George, NY",
        year: 2024,
        isFeatured: false,
        isPublished: true,
        sortOrder: 5,
      },
      // Portrait
      {
        title: "Natural Light Editorial",
        description: "Minimalist studio portrait focusing on natural texture, expression, and form.",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80",
        altText: "Studio portrait in soft window light with subtle shadows",
        category: "Portrait",
        aspect: "portrait",
        location: "Brooklyn, NY",
        year: 2024,
        isFeatured: false,
        isPublished: true,
        sortOrder: 6,
      },
      {
        title: "Architectural Silhouette",
        description: "Pensive subject framed by mid-century concrete lines and afternoon shadow.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=80",
        altText: "Man looking toward window in a concrete brutalist interior",
        category: "Portrait",
        aspect: "square",
        location: "Manhattan, NY",
        year: 2023,
        isFeatured: false,
        isPublished: true,
        sortOrder: 7,
      },
      // Events
      {
        title: "Warm Banquet Under the Stars",
        description: "Laughter and clinking glasses under suspended amber lanterns.",
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&auto=format&fit=crop&q=80",
        altText: "Outdoor evening dinner with string lights and festive table setting",
        category: "Events",
        aspect: "landscape",
        location: "Sonoma, CA",
        year: 2023,
        isFeatured: false,
        isPublished: true,
        sortOrder: 8,
      },
      // Fashion
      {
        title: "Monochrome Linen Editorial",
        description: "Editorial for sustainable autumn capsule collection.",
        imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
        altText: "Model in structured beige coat against warm limestone wall",
        category: "Fashion",
        aspect: "portrait",
        location: "SoHo, NY",
        year: 2024,
        isFeatured: false,
        isPublished: true,
        sortOrder: 9,
      },
      // Travel
      {
        title: "Misty Highland Solitude",
        description: "Early dawn fog rising through glacial valley in the Isle of Skye.",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&auto=format&fit=crop&q=80",
        altText: "Misty mountain river surrounded by rugged pine forests",
        category: "Travel",
        aspect: "landscape",
        location: "Isle of Skye, Scotland",
        year: 2023,
        isFeatured: false,
        isPublished: true,
        sortOrder: 10,
      },
    ];

    const seededPhotos = await PortfolioImage.insertMany(photoData);

    // ── 4. Seed Galleries ──────────────────────────────────────────────────────
    console.log("[Seed] Seeding Gallery collections with references...");
    await Gallery.insertMany([
      {
        title: "Romantic Pre-Wedding",
        slug: "romantic-pre-wedding",
        subtitle: "Sophie & Daniel · Hudson Valley, NY · 2024",
        description: "Sophie and Daniel wanted photographs that felt like a quiet afternoon they actually lived — not a photoshoot. We spent a late October day wandering the apple orchards and riverside paths of the Hudson Valley.",
        category: "Pre-Wedding",
        location: "Hudson Valley, NY",
        year: 2024,
        coverImage: {
          imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1800&auto=format&fit=crop&q=80",
          altText: "Sophie and Daniel walking hand in hand through an autumn orchard",
          aspect: "landscape",
        },
        images: [seededPhotos[3]._id, seededPhotos[4]._id],
        photos: [
          {
            src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&auto=format&fit=crop&q=80",
            alt: "Couple walking through an orchard hand in hand",
            aspect: "landscape",
          },
          {
            src: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=900&auto=format&fit=crop&q=80",
            alt: "Couple laughing on a wooden dock at sunset",
            aspect: "landscape",
          },
          {
            src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&auto=format&fit=crop&q=80",
            alt: "Intimate close-up of couple sharing a tender moment",
            aspect: "square",
          },
        ],
        isPublished: true,
        sortOrder: 1,
      },
      {
        title: "Wedding Story in the Catskills",
        slug: "wedding-story",
        subtitle: "Claire & Julian · The Glass House, NY · 2024",
        description: "Claire and Julian built an entire weekend around bringing their families together from three different countries. An intimate ceremony surrounded by woodland pines followed by dinner beneath glass atrium lanterns.",
        category: "Wedding",
        location: "Catskills, NY",
        year: 2024,
        coverImage: {
          imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&auto=format&fit=crop&q=80",
          altText: "Claire and Julian under the ceremony canopy in the Catskills",
          aspect: "portrait",
        },
        images: [seededPhotos[0]._id, seededPhotos[1]._id, seededPhotos[2]._id],
        photos: [
          {
            src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80",
            alt: "First look under the weeping willow",
            aspect: "portrait",
          },
          {
            src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&auto=format&fit=crop&q=80",
            alt: "Couple showered with flower petals down the aisle",
            aspect: "landscape",
          },
        ],
        isPublished: true,
        sortOrder: 2,
      },
      {
        title: "Monochrome & Earth: Fashion Editorial",
        slug: "fashion-editorial",
        subtitle: "Maison Atelier Autumn/Winter Campaign · Paris · 2024",
        description: "A commercial commission exploring texture, form, and heavy wool fabrics across the minimalist limestone courtyards of the Marais in Paris.",
        category: "Fashion",
        location: "Paris, France",
        year: 2024,
        coverImage: {
          imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&auto=format&fit=crop&q=80",
          altText: "Editorial fashion portrait in limestone courtyard",
          aspect: "portrait",
        },
        images: [seededPhotos[8]._id],
        photos: [
          {
            src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
            alt: "Model in structured outerwear",
            aspect: "portrait",
          },
        ],
        isPublished: true,
        sortOrder: 3,
      },
    ]);

    // ── 5. Inquiries ───────────────────────────────────────────────────────────
    // Inquiries collection remains clean & empty for real client submissions

    console.log("\n=======================================================");
    console.log("[Seed] Success! Database seeded successfully.");
    console.log(`- 1 Photographer Profile (Elena Vasquez)`);
    console.log(`- ${services.length} Photography Services`);
    console.log(`- ${seededPhotos.length} Portfolio Images`);
    console.log(`- 3 Curated Galleries`);
    console.log(`- 0 Sample Inquiries (ready for client submissions)`);
    console.log("=======================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("[Seed] Failed:", err);
    process.exit(1);
  }
}

seed();
