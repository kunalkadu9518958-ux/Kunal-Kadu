import { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';

interface NavbarProps {
  wishlistCount: number;
  onOpenWishlist: () => void;
}

const NAV_LINKS = [
  { label: 'Collections', href: '#collections' },
  { label: 'Catalog', href: '#catalog' },
  { label: 'Visit Us', href: '#visit-us' },
  { label: 'Store Hours', href: '#visit-us' },
] as const;

export function Navbar({ wishlistCount, onOpenWishlist }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#E5DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#58111E] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#58111E]"
        >
          Saubhagya Emporium
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A403B]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#A87C2D] hover:text-[#58111E] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#58111E]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenWishlist}
            aria-label={`Open wishlist with ${wishlistCount} saved items`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58111E] cursor-pointer"
          >
            <Heart
              className="w-4 h-4 text-[#D4AF63]"
              fill={wishlistCount > 0 ? '#D4AF63' : 'none'}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span>Wishlist</span>
            <span className="tabular-nums">({wishlistCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#1E1917] hover:bg-[#F2ECE1] rounded-md transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[#E5DDD0] bg-[#FAF7F2] px-4 py-3 flex flex-col gap-1"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-2 text-sm font-medium text-[#1E1917] hover:text-[#58111E] hover:bg-[#F2ECE1] rounded-md transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
