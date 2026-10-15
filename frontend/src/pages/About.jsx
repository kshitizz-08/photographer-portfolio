import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Award, Globe } from "lucide-react";
import SafeImage from "../components/common/SafeImage";
import { getPhotographerProfile } from "../services/api";
import { PHOTOGRAPHER as FALLBACK_PHOTOGRAPHER, PHOTOGRAPHER_PORTRAIT, TESTIMONIALS } from "../data/sampleData";

const PHILOSOPHY = [
  {
    icon: Camera,
    title: "Documentary at Heart",
    body: "I do not direct; I observe. My role is to be present — sensitive to the light, the mood, and the story unfolding in front of me.",
  },
  {
    icon: Award,
    title: "Craft Over Quantity",
    body: "I take on a limited number of clients each year. This is not a volume business. Every client deserves my complete attention.",
  },
  {
    icon: Globe,
    title: "Available Worldwide",
    body: "Based in New York, I travel wherever the work takes me — from intimate Upstate elopements to European destination weddings.",
  },
];

export default function About() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getPhotographerProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.warn("[About] Using fallback profile:", err.message));
  }, []);

  const p = profile || FALLBACK_PHOTOGRAPHER;
  const portrait = p.profileImage?.imageUrl || p.profileImage?.src || PHOTOGRAPHER_PORTRAIT;

  const stats = p.stats && p.stats.length > 0 ? p.stats : [
    { value: "10+", label: "Years of experience" },
    { value: "600+", label: "Sessions completed" },
    { value: "3", label: "Continents covered" },
    { value: "12", label: "Editorial features" },
  ];

  return (
    <main className="pt-32 pb-28">
      {/* ── Hero split ── */}
      <section className="max-w-7xl mx-auto px-6 mb-28" aria-labelledby="about-heading">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Portrait */}
          <div className="aspect-[3/4] overflow-hidden bg-[#E0DDD8]">
            <SafeImage
              src={portrait}
              alt={`${p.name} — photographer`}
              className="w-full h-full object-cover"
              fetchPriority="high"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-6">
            <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b]">The Photographer</p>
            <h1 id="about-heading" className="font-serif text-5xl md:text-6xl text-[#141414] leading-tight">
              {p.name}
            </h1>
            <div className="w-12 h-px bg-[#C4A882]" />
            <p className="text-[#6b6b6b] leading-relaxed">
              {p.bio}
            </p>
            <p className="text-[#6b6b6b] leading-relaxed">
              My work has been featured in Vogue Living, The New York Times, and Kinfolk Magazine. I hold a BFA in Fine Art Photography from the Rhode Island School of Design.
            </p>
            <Link
              to="/contact"
              className="self-start inline-flex items-center gap-2 bg-[#141414] text-[#FAF9F7] text-xs tracking-widest uppercase px-7 py-3.5 hover:bg-[#3a3a3a] transition-colors mt-2"
            >
              Get in Touch <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#F5F3EF] py-20 mb-28" aria-label="Key statistics">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map((s, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <p className="font-serif text-5xl md:text-6xl text-[#141414]">{s.value}</p>
                <p className="text-xs tracking-widest uppercase text-[#6b6b6b]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="max-w-7xl mx-auto px-6 mb-28" aria-labelledby="philosophy-heading">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-3">Approach</p>
          <h2 id="philosophy-heading" className="font-serif text-4xl md:text-5xl text-[#141414]">
            My Philosophy
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {PHILOSOPHY.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col gap-5 border-t border-[#E0DDD8] pt-8">
                <div className="w-10 h-10 border border-[#E0DDD8] flex items-center justify-center text-[#C4A882]">
                  <Icon size={18} />
                </div>
                <h3 className="font-serif text-2xl text-[#141414]">{item.title}</h3>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Client Quote ── */}
      <section className="max-w-4xl mx-auto px-6 text-center" aria-label="Featured testimonial">
        <div className="w-12 h-px bg-[#C4A882] mx-auto mb-10" />
        <blockquote className="font-serif text-2xl md:text-3xl text-[#141414] italic leading-relaxed mb-6">
          &ldquo;{TESTIMONIALS[0].quote}&rdquo;
        </blockquote>
        <p className="text-xs tracking-widest uppercase text-[#6b6b6b]">
          {TESTIMONIALS[0].name} — {TESTIMONIALS[0].role}
        </p>
      </section>
    </main>
  );
}
