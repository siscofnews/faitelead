import { MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

const WhatsAppButton = ({
  phoneNumber = "5575991018395",
  message
}: WhatsAppButtonProps) => {
  const { t, lang } = useI18n();
  const displayMessage = message || t("whatsapp.default_message");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(displayMessage)}`;

  return (
    <a
      key={`whatsapp-${lang}`}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label={t("common.fale_conosco")}
    >
      <div className="relative">
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />

        {/* Button */}
        <div className="relative flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <MessageCircle className="h-6 w-6" />
          <span className="hidden sm:inline font-medium text-sm">
            {t("common.fale_conosco")}
          </span>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          <p className="text-sm font-medium">{t("common.help_title")}</p>
          <p className="text-xs text-muted-foreground">{t("common.help_desc")}</p>
          <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2 h-2 bg-card border-r border-b border-border" />
        </div>
      </div>
    </a>
  );
};

export default WhatsAppButton;
