import { Search, X } from 'lucide-react';
import { CategoryId, GarmentSize, Product } from '../data/catalog';
import { ProductCard } from './ProductCard';

interface CatalogSectionProps {
  products: Product[];
  activeCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  wishlistIds: Set<string>;
  onToggleWishlist: (product: Product, size: GarmentSize) => void;
  onEnquireWhatsApp: (product: Product, size: GarmentSize) => void;
}

const FILTER_TABS: { id: CategoryId; label: string }[] = [
  { id: 'all', label: 'All Pieces' },
  { id: 'sarees', label: 'Sarees' },
  { id: 'kurtis', label: 'Kurtis & Suits' },
  { id: 'western', label: "Girls' & Western" },
  { id: 'bridal', label: 'Bridal & Festive' },
];

export function CatalogSection({
  products,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  wishlistIds,
  onToggleWishlist,
  onEnquireWhatsApp,
}: CatalogSectionProps) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = products.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.subCategory.toLowerCase().includes(normalizedQuery) ||
      item.fabric.toLowerCase().includes(normalizedQuery) ||
      item.colorName.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <section id="catalog" className="py-14 sm:py-20 bg-[#F2ECE1] border-t border-b border-[#E5DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#DDD2C2]">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#A87C2D] tracking-wide">
              Featured Catalog
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1E1917] text-balance">
              Sarees, Kurtis &amp; Ladies&apos; Wear
            </h2>
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              className="w-4 h-4 text-[#665B56] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search saree, kurti, lehenga..."
              aria-label="Search garments in catalog"
              className="w-full h-11 pl-10 pr-9 text-sm bg-[#FAF7F2] text-[#1E1917] placeholder:text-[#8A7D76] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#665B56] hover:text-[#1E1917] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EAE0D0] rounded-lg"
            role="tablist"
            aria-label="Filter catalog by department"
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectCategory(tab.id)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[38px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58111E] ${
                    isSelected
                      ? 'bg-[#58111E] text-[#FAF7F2]'
                      : 'text-[#4A403B] hover:text-[#1E1917] hover:bg-[#FAF7F2]/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <p className="text-xs sm:text-sm text-[#665B56] tabular-nums">
            Showing {filteredProducts.length} of {products.length} styles
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.has(product.id)}
                onToggleWishlist={onToggleWishlist}
                onEnquireWhatsApp={onEnquireWhatsApp}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 py-14 px-6 text-center bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg">
            <h3 className="font-display text-xl font-semibold text-[#1E1917]">
              No matching garments found
            </h3>
            <p className="mt-2 text-sm text-[#665B56] max-w-md mx-auto">
              Try clearing your search or switching back to all collections to view every style available at our Katol showroom.
            </p>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                onSearchChange('');
              }}
              className="mt-5 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] rounded-md transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
