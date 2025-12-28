import { useEffect, useState } from "react";
import { Phone, Mail, GraduationCap, Sparkles, BookOpen, Heart, Star, Flame, Church, Trophy } from "lucide-react";
import faitelLogo from "@/assets/faitel-logo.png";
import { useI18n } from "@/i18n/I18nProvider";

const AnnouncementBanner = () => {
  const { t } = useI18n();
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      id: 1,
      title: t('banner.slide1_title'),
      subtitle: t('banner.slide1_subtitle'),
      icon: GraduationCap,
      gradient: "from-primary via-primary/90 to-accent",
      highlight: true,
    },
    {
      id: 2,
      title: t('banner.slide2_title'),
      subtitle: t('banner.slide2_subtitle'),
      icon: BookOpen,
      gradient: "from-accent via-primary to-primary/90",
      highlight: false,
    },
    {
      id: 3,
      title: t('banner.slide3_title'),
      subtitle: t('banner.slide3_subtitle'),
      icon: Church,
      gradient: "from-success via-primary to-accent",
      highlight: false,
    },
    {
      id: 4,
      title: t('banner.slide4_title'),
      subtitle: t('banner.slide4_subtitle'),
      icon: Trophy,
      gradient: "from-primary via-accent to-primary/90",
      highlight: false,
    },
    {
      id: 5,
      title: t('banner.slide5_title'),
      subtitle: t('banner.slide5_subtitle'),
      icon: Star,
      gradient: "from-accent via-success to-primary",
      highlight: false,
    },
    {
      id: 6,
      title: t('banner.slide6_title'),
      subtitle: t('banner.slide6_subtitle'),
      icon: Flame,
      gradient: "from-destructive via-primary to-accent",
      highlight: false,
    },
    {
      id: 7,
      title: t('banner.slide7_title'),
      subtitle: t('banner.slide7_subtitle'),
      icon: Heart,
      gradient: "from-primary via-destructive/50 to-accent",
      highlight: false,
    },
  ];
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const currentBanner = bannerSlides[currentSlide];
  const IconComponent = currentBanner.icon;

  return (
    <div
      className={`bg-gradient-to-r ${currentBanner.gradient} relative overflow-hidden transition-all duration-700`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-white/5 rounded-full blur-3xl" />

        {/* Moving particles */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-4 right-20 w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-2 left-1/3 w-2 h-2 bg-accent/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo and Main Message */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative hidden sm:block">
              <img
                src={faitelLogo}
                alt="FAITEL"
                className="h-14 w-14 object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
              />
              <div className="absolute inset-0 bg-accent/40 blur-xl rounded-full animate-pulse" />
            </div>

            {/* Sliding Content */}
            <div className="relative h-16 flex-1 overflow-hidden">
              {bannerSlides.map((slide, index) => {
                const SlideIcon = slide.icon;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-in-out ${index === currentSlide
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-8 scale-95"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <SlideIcon className="h-5 w-5 text-accent animate-pulse hidden sm:block" />
                      {slide.highlight && (
                        <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                      )}
                      <h3 className="text-sm md:text-xl font-display font-bold text-white tracking-wide drop-shadow-lg">
                        {slide.title}
                      </h3>
                      {slide.highlight && (
                        <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-white/90 mt-1 italic">
                      {slide.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-white">
            <a
              href="tel:+557198338488"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-full px-3 py-2 backdrop-blur-sm transition-all hover:scale-105"
            >
              <Phone className="h-4 w-4 text-accent" />
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                (71) 9 8338-4883
              </span>
            </a>

            <a
              href="tel:+5571996822782"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-full px-3 py-2 backdrop-blur-sm transition-all hover:scale-105"
            >
              <Phone className="h-4 w-4 text-accent" />
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                (71) 9 9682-2782
              </span>
            </a>

            <a
              href="mailto:faiteloficial@gmail.com"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-full px-3 py-2 backdrop-blur-sm transition-all hover:scale-105"
            >
              <Mail className="h-4 w-4 text-accent" />
              <span className="text-xs md:text-sm font-medium">
                faiteloficial@gmail.com
              </span>
            </a>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                  ? "bg-accent w-6 shadow-[0_0_8px_rgba(255,215,0,0.6)]"
                  : "bg-white/40 w-1.5 hover:bg-white/60"
                }`}
              aria-label={`${t('common.go_to_slide')} ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />
    </div>
  );
};

export default AnnouncementBanner;
