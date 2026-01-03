import { ChevronLeft, ChevronRight, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

import book1 from "@/assets/books/book-1.png";
import book2 from "@/assets/books/book-2.png";
import book3 from "@/assets/books/book-3.png";
import book4 from "@/assets/books/book-4.png";
import book5 from "@/assets/books/book-5.png";
import book6 from "@/assets/books/book-6.png";
import book7 from "@/assets/books/book-7.png";
import book8 from "@/assets/books/book-8.png";
import book9 from "@/assets/books/book-9.png";
import book10 from "@/assets/books/book-10.png";

const books = [
  { id: 1, src: book1, title: "Teologia Sistemática" },
  { id: 2, src: book2, title: "Hermenêutica Bíblica" },
  { id: 3, src: book3, title: "História da Igreja" },
  { id: 4, src: book4, title: "Ética Cristã" },
  { id: 5, src: book5, title: "Apologética" },
  { id: 6, src: book6, title: "Homilética" },
  { id: 7, src: book7, title: "Liderança Cristã" },
  { id: 8, src: book8, title: "Missões" },
  { id: 9, src: book9, title: "Aconselhamento" },
  { id: 10, src: book10, title: "Escatologia" },
];

interface BookGalleryProps {
  className?: string;
}

const BookGallery = ({ className = "" }: BookGalleryProps) => {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-gold rounded-xl p-2.5">
            <BookOpenCheck className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">{t("dashboards.student.library.title", { defaultValue: "Biblioteca Digital" })}</h2>
            <p className="text-sm text-muted-foreground">{t("dashboards.student.library.subtitle", { defaultValue: "Material didático exclusivo FAITEL" })}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {books.map((book) => (
          <div
            key={book.id}
            className="group flex-shrink-0 w-36 cursor-pointer"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 bg-card border border-border/50">
              <img
                src={book.src}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <p className="text-xs font-medium text-primary-foreground line-clamp-2">
                  {book.title}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
              {book.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BookGallery;
