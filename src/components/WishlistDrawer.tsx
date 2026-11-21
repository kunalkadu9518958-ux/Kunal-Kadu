import { MessageCircle, Trash2, X } from 'lucide-react';
import { GarmentSize, Product, formatInr } from '../data/catalog';
import { GarmentImage } from './GarmentImage';

export interface WishlistItem {
  product: Product;
  size: GarmentSize;
}

interface WishlistDrawerProps {
  isOpen: boolean;
  items: WishlistItem[];
  onClose: () => void;
  onRemoveItem: (productId: string) => void;
  onEnquireAll: () => void;
}

export function WishlistDrawer({
  isOpen,
  items,
  onClose,
  onRemoveItem,
  onEnquireAll,
}: WishlistDrawerProps) {
  if (!isOpen) return null;

  const totalValue = items.reduce((sum, entry) => sum + entry.product.priceInr, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#140B0C]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-drawer-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md bg-[#FAF7F2] h-full flex flex-col border-l border-[#E5DDD0] shadow-xl">
        <div className="px-6 py-5 border-b border-[#E5DDD0] flex items-center justify-between gap-4">
          <div>
            <h2 id="wishlist-drawer-title" className="font-display text-xl font-semibold text-[#1E1917]">
              Saved Wishlist
            </h2>
            <p className="text-xs text-[#665B56] mt-0.5 tabular-nums">
              {items.length} {items.length === 1 ? 'garment' : 'garments'} saved
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist drawer"
            className="w-10 h-10 inline-flex items-center justify-center rounded-md text-[#4A403B] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-lg font-medium text-[#1E1917]">
                Your wishlist is empty
              </p>
              <p className="mt-2 text-sm text-[#665B56] max-w-xs mx-auto">
                Save your favorite sarees, kurtis, or bridal outfits while browsing to enquire together on WhatsApp.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-5 py-2.5 text-sm font-medium text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] rounded-md transition-colors cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            items.map(({ product, size }) => (
              <div
                key={product.id}
                className="flex gap-4 p-3 bg-[#F2ECE1] border border-[#E5DDD0] rounded-lg"
              >
                <div className="w-20 h-20 rounded overflow-hidden shrink-0 bg-[#EAE0D0]">
                  <GarmentImage
                    src={product.image}
                    alt={product.alt}
                    title={product.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#665B56] truncate">
                      {product.subCategory} · Size {size}
                    </p>
                    <h3 className="text-sm font-semibold text-[#1E1917] truncate mt-0.5">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-sm font-semibold text-[#58111E] tabular-nums">
                      {formatInr(product.priceInr)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="inline-flex items-center gap-1 text-xs text-[#665B56] hover:text-[#58111E] py-1 px-1.5 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 ? (
          <div className="p-6 border-t border-[#E5DDD0] bg-[#F2ECE1] space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#665B56]">Estimated Total</span>
              <span className="text-base font-semibold text-[#1E1917] tabular-nums">
                {formatInr(totalValue)}
              </span>
            </div>

            <button
              type="button"
              onClick={onEnquireAll}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] rounded-md transition-colors cursor-pointer min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-[#D4AF63]" strokeWidth={1.75} aria-hidden="true" />
              <span>Enquire All on WhatsApp</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
