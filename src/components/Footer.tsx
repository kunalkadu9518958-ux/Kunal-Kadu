import { StoreConfig } from '../data/catalog';

interface FooterProps {
  storeConfig: StoreConfig;
  onOpenStoreManager: () => void;
}

export function Footer({ storeConfig, onOpenStoreManager }: FooterProps) {
  return (
    <footer className="bg-[#0F1929] text-[#FAF7F2]/80 border-t border-[#FAF7F2]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-display text-lg font-semibold text-[#FAF7F2]">
            {storeConfig.name}
          </p>
          <p className="mt-1 text-xs sm:text-sm text-[#FAF7F2]/65">
            {storeConfig.addressLine1}, {storeConfig.addressLine2} · {storeConfig.hoursLabel} {storeConfig.hoursTime}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
          <a href="#collections" className="hover:text-[#D4AF63] transition-colors whitespace-nowrap">
            Collections
          </a>
          <a href="#catalog" className="hover:text-[#D4AF63] transition-colors whitespace-nowrap">
            Catalog
          </a>
          <a href="#visit-us" className="hover:text-[#D4AF63] transition-colors whitespace-nowrap">
            Visit Us
          </a>
          <a href={storeConfig.phoneHref} className="hover:text-[#D4AF63] transition-colors whitespace-nowrap tabular-nums">
            {storeConfig.phoneDisplay}
          </a>
          <button
            type="button"
            onClick={onOpenStoreManager}
            className="text-[#D4AF63] hover:text-[#E8C87A] transition-colors whitespace-nowrap cursor-pointer"
          >
            Store Manager
          </button>
        </div>
      </div>
    </footer>
  );
}
