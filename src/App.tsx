import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { CatalogSection } from './components/CatalogSection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { VisitUsSection } from './components/VisitUsSection';
import { WhatsAppModal } from './components/WhatsAppModal';
import { WishlistDrawer, WishlistItem } from './components/WishlistDrawer';

const StoreManagerModal = lazy(() =>
  import('./components/StoreManagerModal').then((mod) => ({
    default: mod.StoreManagerModal,
  }))
);
import {
  CategoryId,
  GarmentSize,
  PRODUCTS,
  Product,
  STORE_INFO,
  StoreConfig,
} from './data/catalog';
import { auth } from './lib/firebase';
import {
  checkUserStaffAccess,
  subscribePublishedProducts,
  subscribeStoreConfig,
} from './lib/storeSync';

const WISHLIST_STORAGE_KEY = 'saubhagya_emporium_wishlist_v1';

interface StoredWishlistEntry {
  productId: string;
  size: GarmentSize;
}

function loadInitialWishlist(products: Product[]): WishlistItem[] {
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredWishlistEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        const product = products.find((p) => p.id === entry.productId);
        if (!product) return null;
        const validSize: GarmentSize = ['S', 'M', 'L', 'XL'].includes(entry.size)
          ? entry.size
          : 'M';
        return { product, size: validSize };
      })
      .filter((item): item is WishlistItem => item !== null);
  } catch {
    return [];
  }
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(STORE_INFO);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [hasCloudProducts, setHasCloudProducts] = useState(false);

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() =>
    loadInitialWishlist(PRODUCTS)
  );
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [whatsAppItems, setWhatsAppItems] = useState<WishlistItem[]>([]);

  // Firebase Auth & Mobile Store Manager state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [initialInviteCode, setInitialInviteCode] = useState('');
  const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false);

  const refreshStaffStatus = useCallback(async (user: User | null) => {
    if (!user) {
      setIsOwner(false);
      setIsEditor(false);
      return;
    }
    try {
      const access = await checkUserStaffAccess(user);
      setIsOwner(access.isOwner);
      setIsEditor(access.isEditor);
    } catch {
      setIsOwner(false);
      setIsEditor(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    const admin = params.get('admin');
    if (invite) {
      setInitialInviteCode(invite.trim().toUpperCase());
      setIsStoreManagerOpen(true);
    } else if (admin === '1' || admin === 'true') {
      setIsStoreManagerOpen(true);
    }
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      void refreshStaffStatus(user);
    });
    return () => unsubAuth();
  }, [refreshStaffStatus]);

  useEffect(() => {
    const unsubConfig = subscribeStoreConfig(
      (liveConfig) => {
        if (liveConfig) {
          setStoreConfig(liveConfig);
        }
      },
      (err) => {
        console.warn('Using local store info fallback:', err.message);
      }
    );

    const unsubProducts = subscribePublishedProducts(
      (liveProducts, hasDocs) => {
        setHasCloudProducts(hasDocs);
        if (hasDocs && liveProducts.length > 0) {
          setProducts(liveProducts);
        } else {
          setProducts(PRODUCTS);
        }
      },
      (err) => {
        console.warn('Using local catalog fallback:', err.message);
        setProducts(PRODUCTS);
      }
    );

    return () => {
      unsubConfig();
      unsubProducts();
    };
  }, []);

  useEffect(() => {
    try {
      const serializable: StoredWishlistEntry[] = wishlistItems.map((item) => ({
        productId: item.product.id,
        size: item.size,
      }));
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignore storage quota errors in restricted browsing modes
    }
  }, [wishlistItems]);

  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map((entry) => entry.product.id)),
    [wishlistItems]
  );

  const handleToggleWishlist = (product: Product, size: GarmentSize) => {
    setWishlistItems((prev) => {
      const exists = prev.some((entry) => entry.product.id === product.id);
      if (exists) {
        return prev.filter((entry) => entry.product.id !== product.id);
      }
      return [...prev, { product, size }];
    });
  };

  const handleRemoveWishlistItem = (productId: string) => {
    setWishlistItems((prev) => prev.filter((entry) => entry.product.id !== productId));
  };

  const handleEnquireSingle = (product: Product, size: GarmentSize) => {
    setWhatsAppItems([{ product, size }]);
  };

  const handleEnquireAllWishlist = () => {
    if (wishlistItems.length === 0) return;
    setIsWishlistOpen(false);
    setWhatsAppItems(wishlistItems);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1E1917]">
      <Navbar
        wishlistCount={wishlistItems.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      <main className="flex-1">
        <HeroSection storeConfig={storeConfig} />
        <CategoryShowcase
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
        <CatalogSection
          products={products}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onEnquireWhatsApp={handleEnquireSingle}
        />
        <VisitUsSection storeConfig={storeConfig} />
      </main>

      <Footer
        storeConfig={storeConfig}
        onOpenStoreManager={() => setIsStoreManagerOpen(true)}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        items={wishlistItems}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveItem={handleRemoveWishlistItem}
        onEnquireAll={handleEnquireAllWishlist}
      />

      <WhatsAppModal
        items={whatsAppItems}
        storeConfig={storeConfig}
        onClose={() => setWhatsAppItems([])}
      />

      {isStoreManagerOpen ? (
        <Suspense fallback={null}>
          <StoreManagerModal
            isOpen={isStoreManagerOpen}
            onClose={() => setIsStoreManagerOpen(false)}
            user={currentUser}
            isOwner={isOwner}
            isEditor={isEditor}
            initialInviteCode={initialInviteCode}
            storeConfig={storeConfig}
            products={products}
            hasCloudProducts={hasCloudProducts}
            onStaffChanged={() => void refreshStaffStatus(currentUser)}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
