import { ArrowRight } from 'lucide-react';
import { CATEGORIES, CategoryId, formatInr } from '../data/catalog';
import { GarmentImage } from './GarmentImage';

interface CategoryShowcaseProps {
  activeCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
}

export function CategoryShowcase({
  activeCategory,
  onSelectCategory,
}: CategoryShowcaseProps) {
  const handleCategoryClick = (id: Exclude<CategoryId, 'all'>) => {
    onSelectCategory(id);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="collections" className="py-14 sm:py-20 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E5DDD0]">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#A87C2D] tracking-wide">
              Departments & Curations
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1E1917] text-balance">
              Shop by Collection
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#665B56] max-w-md">
            Select a department below to filter our seasonal and wedding catalog directly.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className={`group text-left rounded-lg overflow-hidden bg-[#F2ECE1] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58111E] cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-[#58111E]'
                    : 'border border-[#E5DDD0] hover:border-[#A87C2D]'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#EAE0D0]">
                  <GarmentImage
                    src={category.image}
                    alt={category.alt}
                    title={category.title}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#665B56]">
                    <span className="tabular-nums">
                      From {formatInr(category.startingPrice)}
                    </span>
                    <ArrowRight
                      className="w-4 h-4 text-[#58111E] transition-transform duration-150 group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="font-display text-xl font-semibold text-[#1E1917]">
                    {category.title}
                  </h3>

                  <p className="text-sm text-[#665B56] leading-snug">
                    {category.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
