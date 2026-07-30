import { Mail, Phone } from "lucide-react";
import { announcements, site } from "@/data/site";

export default function AnnouncementBar() {
  // Duplicate the list so the marquee loops seamlessly (track slides -50%).
  const ticker = [...announcements, ...announcements];

  return (
    <div className="bg-ink text-cream">
      <div className="mx-auto flex max-w-350 items-center gap-4 px-4 py-1.5 text-[11px] sm:px-6 lg:px-10">
        <div className="hidden shrink-0 items-center gap-4 md:flex">
          <a href={site.phoneHref} className="flex items-center gap-1.5 transition-colors hover:text-gold">
            <Phone className="h-3 w-3" /> {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 transition-colors hover:text-gold">
            <Mail className="h-3 w-3" /> {site.email}
          </a>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden" aria-label="Store offers">
          <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
            {ticker.map((text, i) => (
              <span key={i} className="tracking-wide">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
