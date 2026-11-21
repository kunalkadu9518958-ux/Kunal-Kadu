import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { GarmentSize, Product, formatInr } from '../data/catalog';
import { GarmentImage } from './GarmentImage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product, size: GarmentSize) => void;
  onEnquireWhatsApp: (product: Product, size: GarmentSize) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onEnquireWhatsApp,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<GarmentSize>(product.sizes[0] || 'M');
  const activeSize = product.sizes.includes(selectedSize)
    ? selectedSize
    : product.sizes[0] || 'M';

  return (
    <article className="flex flex-col bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#A87C2D]">
      <div className="aspect-[4/3] w-full bg-[#F2ECE1] overflow-hidden">
        <GarmentImage
          src={product.image}
          alt={product.alt}
          title={product.name}
          className="w-full h-full object-cover object-top"
        />
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#665B56] truncate">
            <span>{product.subCategory}</span>
            <span aria-hidden="true">·</span>
            <span>{product.fabric}</span>
            {product.inStock === false ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#58111E] font-medium">Restocking Soon</span>
              </>
            ) : null}
          </div>

          <h3 className="mt-1.5 font-display text-lg sm:text-xl font-semibold text-[#1E1917] leading-snug">
            {product.name}
          </h3>

          <p className="mt-1.5 text-sm text-[#665B56] leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="space-y-4 pt-3 border-t border-[#EAE0D0]">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-lg font-semibold text-[#58111E] tabular-nums">
              {formatInr(product.priceInr)}
            </span>
            <span className="text-xs text-[#665B56] truncate">{product.colorName}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-[#4A403B] shrink-0">Size</span>
            <div className="flex items-center gap-1.5" role="group" aria-label={`Select size for ${product.name}`}>
              {product.sizes.map((size) => {
                const active = activeSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={active}
                    className={`min-w-[36px] h-9 px-2 text-xs font-medium rounded border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58111E] ${
                      active
                        ? 'bg-[#142136] text-[#FAF7F2] border-[#142136]'
                        : 'bg-[#F2ECE1] text-[#1E1917] border-[#DDD2C2] hover:border-[#A87C2D]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onEnquireWhatsApp(product, activeSize)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[42px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58111E]"
            >
              <MessageCircle className="w-4 h-4 text-[#D4AF63]" strokeWidth={1.75} aria-hidden="true" />
              <span>Enquire on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleWishlist(product, activeSize)}
              aria-pressed={isWishlisted}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-md border transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[42px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58111E] ${
                isWishlisted
                  ? 'bg-[#F2ECE1] text-[#58111E] border-[#58111E]'
                  : 'bg-transparent text-[#1E1917] border-[#D8CCBA] hover:border-[#58111E] hover:text-[#58111E]'
              }`}
            >
              <Heart
                className="w-4 h-4"
                fill={isWishlisted ? '#58111E' : 'none'}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
