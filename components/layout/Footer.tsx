import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/SocialIcons";
import { footerCategories, footerQuickLinks } from "@/data/navigation";
import { footerBadges, site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-ink text-cream/85">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* brand */}
        <div>
          <p className="font-display text-2xl tracking-[0.3em] text-cream">RAKKHI</p>
          <p className="mt-4 text-[13px] leading-relaxed text-cream/60">{site.about}</p>
          <div className="mt-5 space-y-1.5 text-[13px]">
            <a href={site.phoneHref} className="flex items-center gap-2 hover:text-gold">
              <Phone className="h-3.5 w-3.5" /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-gold">
              <Mail className="h-3.5 w-3.5" /> {site.email}
            </a>
          </div>
        </div>

        {/* categories */}
        <FooterColumn title="All Category" links={footerCategories} />

        {/* quick links */}
        <FooterColumn title="Quick Links" links={footerQuickLinks} />

        {/* subscribe */}
        <div>
          <h4 className="text-xs font-semibold tracking-[0.16em] uppercase text-cream">
            Subscribe to Rakkhi
          </h4>
          <p className="mt-4 text-[13px] leading-relaxed text-cream/60">
            Subscribe for early access to new drops, special offers and once-in-a-season deals.
          </p>
          <form className="mt-4 flex">
            <input
              type="email"
              required
              placeholder="Your email address"
              aria-label="Email address"
              className="min-w-0 flex-1 border border-cream/25 bg-transparent px-3 py-2.5 text-[13px] outline-none placeholder:text-cream/40 focus:border-gold"
            />
            <button
              type="submit"
              className="bg-gold px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-white transition-colors hover:bg-gold-dark"
            >
              Subscribe
            </button>
          </form>
          <div className="mt-5 flex gap-3">
            <a
              href={site.instagram}
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/25 transition-colors hover:border-gold hover:text-gold"
            >
              <InstagramIcon />
            </a>
            <a
              href={`https://wa.me/${site.whatsapp}`}
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/25 transition-colors hover:border-gold hover:text-gold"
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>
      </Container>

      {/* trust badges */}
      <div className="border-t border-cream/10">
        <Container className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 text-[11px] tracking-[0.1em] uppercase text-cream/55">
          {footerBadges.map((b) => (
            <span key={b}>{b}</span>
          ))}
        </Container>
      </div>

      {/* copyright */}
      <div className="border-t border-cream/10">
        <Container className="py-4 pb-20 text-center text-[11px] text-cream/45 lg:pb-4">
          {site.copyright}
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-[0.16em] uppercase text-cream">{title}</h4>
      <ul className="mt-4 space-y-2 text-[13px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-cream/60 transition-colors hover:text-gold">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
