import { ArrowDownRight, MapPin } from 'lucide-react';
import { HERO_IMAGE, StoreConfig } from '../data/catalog';
import { GarmentImage } from './GarmentImage';

interface HeroSectionProps {
  storeConfig: StoreConfig;
}

const STORE_PILLARS = [
  { label: 'Silk & Daily Sarees', detail: 'Banarasi, Paithani & festive drapes' },
  { label: 'Kurtis & Ethnic Suits', detail: 'Chanderi anarkalis & cotton-silk sets' },
  { label: "Girls' & Western Wear", detail: 'Party gowns, co-ord sets & fusion styles' },
  { label: 'Bridal Lehengas', detail: 'Zardozi couture & wedding reception wear' },
];

export function HeroSection({ storeConfig }: HeroSectionProps) {
  return (
    <section id="top" className="bg-[#FAF7F2] border-b border-[#E5DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between bg-[#58111E] text-[#FAF7F2] p-7 sm:p-10 lg:p-12 rounded-lg">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#EED9B3] tracking-wide">
                <span>{storeConfig.addressLine1}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {storeConfig.hoursLabel} {storeConfig.hoursTime}
                </span>
              </div>

              <h1 className="mt-5 font-display text-[clamp(2.25rem,4vw,3.65rem)] font-semibold leading-[1.1] tracking-tight text-balance text-[#FAF7F2]">
                {storeConfig.name}
              </h1>

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#F5ECE1]/90 max-w-xl">
                {storeConfig.tagline} Exclusive sarees, ethnic kurtis, girls&apos; western ensembles, and bridal couture curated in the heart of Katol.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#FAF7F2]/15 flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#1E1917] bg-[#D4AF63] hover:bg-[#E2BF76] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF63]"
              >
                <span>Explore Collection</span>
                <ArrowDownRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </a>

              <a
                href="#visit-us"
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#FAF7F2] hover:text-[#D4AF63] transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[44px]"
              >
                <MapPin className="w-4 h-4 text-[#D4AF63]" strokeWidth={1.75} aria-hidden="true" />
                <span>Visit Katol Store</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 relative rounded-lg overflow-hidden bg-[#F2ECE1] min-h-[280px] sm:min-h-[360px] lg:min-h-full">
            <GarmentImage
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              title={storeConfig.name}
              priority
              className="w-full h-full lg:absolute lg:inset-0 object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#140B0C]/80 via-[#140B0C]/35 to-transparent p-6 sm:p-8 flex items-end justify-between gap-4">
              <p className="text-sm text-[#FAF7F2] font-medium max-w-sm">
                Curated silk sarees, designer kurtis, girls&apos; western wear, and bridal lehengas under one roof.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[#E5DDD0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STORE_PILLARS.map((pillar) => (
            <div key={pillar.label} className="flex flex-col gap-1">
              <span className="font-display text-lg font-semibold text-[#1E1917]">
                {pillar.label}
              </span>
              <span className="text-sm text-[#665B56]">{pillar.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
