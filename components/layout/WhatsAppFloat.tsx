import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { site } from "@/data/site";

export default function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${site.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-20 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 lg:bottom-6"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
