import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { getServices } from "../services/api";
import { LoadingSpinner, ErrorState, EmptyState, ServicesListSkeleton } from "../components/ui/StatusNotice";
import { formatINRStarting } from "../utils/currency";
import SafeImage from "../components/common/SafeImage";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServices();
      setServices(data || []);
    } catch (err) {
      console.error("[Services] Failed to load services:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <main className="pt-32 pb-28">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-6 mb-20" aria-labelledby="services-heading">
        <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-3">What I Offer</p>
        <h1 id="services-heading" className="font-serif text-5xl md:text-6xl text-[#141414] mb-6">
          Services
        </h1>
        <div className="w-12 h-px bg-[#C4A882] mb-8" />
        <p className="text-[#6b6b6b] max-w-xl leading-relaxed">
          Every session is tailored to your story. Below you will find the core experiences I offer — each one designed with intention, delivered with care.
        </p>
      </section>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-6">
          <LoadingSpinner message="Loading photography services…" />
          <ServicesListSkeleton />
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-6">
          <ErrorState error={error} onRetry={loadServices} title="Unable to Load Services" />
        </div>
      ) : services.length === 0 ? (
        <div className="max-w-7xl mx-auto px-6">
          <EmptyState title="No Services Listed" message="Services are currently being updated." />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-0 divide-y divide-[#E0DDD8]">
          {services.map((service, i) => {
            const imgSrc = service.coverImage?.imageUrl || service.coverImage?.src;
            const imgAlt = service.coverImage?.altText || service.coverImage?.alt || service.name;

            return (
              <article
                key={service.slug || service._id || i}
                className="grid grid-cols-1 md:grid-cols-2 gap-0 py-20"
                aria-labelledby={`service-${service.slug}-heading`}
              >
                {/* Image — alternates left/right */}
                <div
                  className={`aspect-[4/3] overflow-hidden bg-[#E0DDD8] ${
                    i % 2 === 1 ? "md:order-2" : ""
                  }`}
                >
                  {imgSrc && (
                    <SafeImage
                      src={imgSrc}
                      alt={imgAlt}
                      loading="lazy"
                      decoding="async"
                      targetWidth={900}
                      widths={[450, 900, 1400]}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
                    />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`flex flex-col justify-center px-0 ${
                    i % 2 === 1 ? "md:pr-16 md:order-1" : "md:pl-16"
                  } py-10 md:py-0`}
                >
                  <p className="text-xs tracking-[0.3em] uppercase text-[#C4A882] mb-4">
                    {formatINRStarting(service.startingPrice)}
                  </p>
                  <h2
                    id={`service-${service.slug}-heading`}
                    className="font-serif text-3xl md:text-4xl text-[#141414] mb-5"
                  >
                    {service.name || service.title}
                  </h2>
                  <p className="text-[#6b6b6b] leading-relaxed mb-8">{service.description}</p>

                  {/* Includes */}
                  {service.features && service.features.length > 0 && (
                    <ul className="flex flex-col gap-2 mb-8">
                      {service.features.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-[#3a3a3a]">
                          <Check size={16} className="text-[#C4A882] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Deliverables note */}
                  {service.deliverables && (
                    <p className="text-xs text-[#888] italic mb-8 border-l border-[#C4A882] pl-3">
                      Deliverables: {service.deliverables}
                    </p>
                  )}

                  <Link
                    to={`/contact?eventType=${encodeURIComponent(service.name || "")}`}
                    className="self-start inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#141414] border-b border-[#141414] pb-1 hover:border-[#C4A882] hover:text-[#C4A882] transition-colors"
                  >
                    Inquire About This Session <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
