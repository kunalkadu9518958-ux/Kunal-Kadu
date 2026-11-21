import { useEffect, useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import {
  Check,
  Copy,
  KeyRound,
  LogOut,
  MessageCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import {
  GarmentSize,
  Product,
  STUDIO_GALLERY,
  StoreConfig,
  formatInr,
} from '../data/catalog';
import { auth, googleProvider } from '../lib/firebase';
import {
  EditorInviteRecord,
  StoreAdminRecord,
  claimFriendInvite,
  createFriendInvite,
  deleteInvite,
  deleteProductFromCloud,
  revokeEditor,
  saveProductToCloud,
  saveStoreConfig,
  seedDefaultCatalogToCloud,
  subscribeOwnerTeamAccess,
} from '../lib/storeSync';
import { GarmentImage } from './GarmentImage';

interface StoreManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isOwner: boolean;
  isEditor: boolean;
  initialInviteCode: string;
  storeConfig: StoreConfig;
  products: Product[];
  hasCloudProducts: boolean;
  onStaffChanged: () => void;
}

type AdminTab = 'products' | 'store' | 'team';

const ALL_SIZES: GarmentSize[] = ['S', 'M', 'L', 'XL'];

const EMPTY_FORM: Omit<Product, 'id'> = {
  name: '',
  category: 'sarees',
  subCategory: 'Silk Sarees',
  fabric: 'Silk Blend',
  priceInr: 2450,
  sizes: ['S', 'M', 'L', 'XL'],
  colorName: 'Deep Maroon',
  image: STUDIO_GALLERY[0].src,
  alt: '',
  description: '',
  inStock: true,
};

export function StoreManagerModal({
  isOpen,
  onClose,
  user,
  isOwner,
  isEditor,
  initialInviteCode,
  storeConfig,
  products,
  hasCloudProducts,
  onStaffChanged,
}: StoreManagerModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [authBusy, setAuthBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Invite claim state
  const [inviteCodeInput, setInviteCodeInput] = useState(initialInviteCode);
  const [claimingInvite, setClaimingInvite] = useState(false);

  // Product editor state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>(EMPTY_FORM);
  const [savingProduct, setSavingProduct] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [seedingCloud, setSeedingCloud] = useState(false);

  // Store info form state
  const [storeForm, setStoreForm] = useState<StoreConfig>(storeConfig);
  const [savingStore, setSavingStore] = useState(false);

  // Owner team access state
  const [admins, setAdmins] = useState<StoreAdminRecord[]>([]);
  const [invites, setInvites] = useState<EditorInviteRecord[]>([]);
  const [inviteLabel, setInviteLabel] = useState('Friend Mobile Editor');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null);

  useEffect(() => {
    setStoreForm(storeConfig);
  }, [storeConfig]);

  useEffect(() => {
    if (initialInviteCode) {
      setInviteCodeInput(initialInviteCode);
    }
  }, [initialInviteCode]);

  useEffect(() => {
    if (!isOpen || !isOwner || !user) return;
    const unsub = subscribeOwnerTeamAccess(setAdmins, setInvites);
    return () => unsub();
  }, [isOpen, isOwner, user]);

  if (!isOpen) return null;

  const isAuthorized = isOwner || isEditor;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setStatusMsg('');
    setAuthBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code || '')
          : '';
      if (code === 'auth/unauthorized-domain') {
        setErrorMsg(
          `Domain "${window.location.hostname}" is not authorized in Firebase Auth yet. Add it in Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
      } else if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        setErrorMsg(
          'Sign-in popup was blocked by this browser. Please open this link directly in Chrome or Safari and allow popups.'
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in was cancelled. Tap "Continue with Google" to try again.');
      } else {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'Google sign-in could not be completed. Please allow popups and try again.'
        );
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMsg('');
    setStatusMsg('');
    await signOut(auth);
  };

  const handleClaimInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setStatusMsg('');
    setClaimingInvite(true);
    try {
      await claimFriendInvite(user, inviteCodeInput);
      setStatusMsg('Editor access activated! You can now add and edit store items.');
      onStaffChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to activate invite code.');
    } finally {
      setClaimingInvite(false);
    }
  };

  const handleSeedDefault = async () => {
    if (!user) return;
    setErrorMsg('');
    setStatusMsg('');
    setSeedingCloud(true);
    try {
      await seedDefaultCatalogToCloud(user.uid);
      setStatusMsg('Default store catalog & details synced to live database.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to initialize catalog.');
    } finally {
      setSeedingCloud(false);
    }
  };

  const openNewProductForm = () => {
    setEditingProductId(null);
    setProductForm(EMPTY_FORM);
    setShowProductForm(true);
    setErrorMsg('');
    setStatusMsg('');
  };

  const openEditProductForm = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      subCategory: product.subCategory,
      fabric: product.fabric,
      priceInr: product.priceInr,
      sizes: product.sizes,
      colorName: product.colorName,
      image: product.image,
      alt: product.alt,
      description: product.description,
      inStock: product.inStock ?? true,
    });
    setShowProductForm(true);
    setErrorMsg('');
    setStatusMsg('');
  };

  const toggleFormSize = (size: GarmentSize) => {
    setProductForm((prev) => {
      const exists = prev.sizes.includes(size);
      if (exists && prev.sizes.length === 1) return prev;
      const next = exists
        ? prev.sizes.filter((s) => s !== size)
        : ALL_SIZES.filter((s) => prev.sizes.includes(s) || s === size);
      return { ...prev, sizes: next };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setStatusMsg('');

    if (productForm.name.trim().length < 2) {
      setErrorMsg('Please enter a product name (at least 2 characters).');
      return;
    }
    if (productForm.description.trim().length < 4) {
      setErrorMsg('Please enter a short description (at least 4 characters).');
      return;
    }
    if (!Number.isFinite(Number(productForm.priceInr)) || Number(productForm.priceInr) <= 0) {
      setErrorMsg('Please enter a valid INR price above 0.');
      return;
    }

    setSavingProduct(true);
    try {
      await saveProductToCloud(
        {
          ...productForm,
          id: editingProductId ?? undefined,
          alt: productForm.alt.trim() || productForm.name.trim(),
        },
        user.uid,
        editingProductId === null
      );
      setShowProductForm(false);
      setEditingProductId(null);
      setStatusMsg('Product saved live for all visitors.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setErrorMsg('');
    setStatusMsg('');
    try {
      await deleteProductFromCloud(id);
      setConfirmDeleteId(null);
      setStatusMsg('Product removed from live catalog.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to delete product.');
    }
  };

  const handleSaveStoreInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setStatusMsg('');
    setSavingStore(true);
    try {
      await saveStoreConfig(storeForm, user.uid);
      setStatusMsg('Store details updated live across the website.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to update store details.');
    } finally {
      setSavingStore(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setStatusMsg('');
    setCreatingInvite(true);
    try {
      const code = await createFriendInvite(user.uid, inviteLabel);
      setStatusMsg(`Invite code ${code} created. Copy and send the link to your friend.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to generate invite link.');
    } finally {
      setCreatingInvite(false);
    }
  };

  const getInviteUrl = (code: string) => {
    return `${window.location.origin}/?invite=${encodeURIComponent(code)}`;
  };

  const handleCopyInviteLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(getInviteUrl(code));
      setCopiedInviteCode(code);
      setTimeout(() => setCopiedInviteCode(null), 2000);
    } catch {
      setCopiedInviteCode(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#140B0C]/65 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-manager-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full sm:max-w-3xl h-[92dvh] sm:h-auto sm:max-h-[90vh] bg-[#FAF7F2] border border-[#E5DDD0] sm:rounded-lg rounded-t-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 bg-[#142136] text-[#FAF7F2] flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h2 id="store-manager-title" className="font-display text-lg sm:text-xl font-semibold truncate">
              Store Manager · Mobile Editor
            </h2>
            <p className="text-xs text-[#D4AF63] truncate mt-0.5">
              {user
                ? `${user.email} (${isOwner ? 'Store Owner' : isEditor ? 'Authorized Editor' : 'Pending Access'})`
                : 'Sign in with Google to edit catalog & store details'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#FAF7F2] bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Store Manager"
              className="w-10 h-10 inline-flex items-center justify-center rounded-md text-[#FAF7F2]/80 hover:text-[#FAF7F2] hover:bg-[#FAF7F2]/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg ? (
            <div className="p-3.5 text-sm bg-[#58111E]/10 border border-[#58111E]/30 text-[#58111E] rounded-md">
              {errorMsg}
            </div>
          ) : null}

          {statusMsg ? (
            <div className="p-3.5 text-sm bg-[#142136]/10 border border-[#142136]/25 text-[#142136] rounded-md">
              {statusMsg}
            </div>
          ) : null}

          {!user ? (
            <div className="py-8 px-4 text-center max-w-md mx-auto space-y-5">
              <div className="w-12 h-12 rounded-full bg-[#F2ECE1] border border-[#E5DDD0] flex items-center justify-center mx-auto text-[#58111E]">
                <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#1E1917]">
                  Sign in to Edit Store
                </h3>
                <p className="mt-2 text-sm text-[#665B56] leading-relaxed">
                  Changes saved here sync instantly across every customer&apos;s phone. Sign in with the owner Google account, or use a Friend Invite link.
                </p>
              </div>
              <button
                type="button"
                disabled={authBusy}
                onClick={handleGoogleSignIn}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] disabled:opacity-60 rounded-md transition-colors cursor-pointer min-h-[46px]"
              >
                <span>{authBusy ? 'Signing in...' : 'Continue with Google'}</span>
              </button>
            </div>
          ) : !isAuthorized ? (
            <form onSubmit={handleClaimInvite} className="py-4 max-w-md mx-auto space-y-4">
              <div className="flex items-center gap-2.5 text-[#58111E]">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-display text-xl font-semibold text-[#1E1917]">
                  Activate Friend Editor Access
                </h3>
              </div>
              <p className="text-sm text-[#665B56] leading-relaxed">
                Your account (<strong>{user.email}</strong>) is signed in. Enter the single-use invite code shared by the store owner to unlock mobile editing.
              </p>

              <div>
                <label htmlFor="invite-code-input" className="block text-xs font-medium text-[#4A403B] mb-1.5">
                  Invite Code
                </label>
                <input
                  id="invite-code-input"
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. KATOL-ABC1234"
                  required
                  className="w-full h-11 px-3.5 text-sm font-medium tracking-wide bg-[#F2ECE1] text-[#1E1917] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                />
              </div>

              <button
                type="submit"
                disabled={claimingInvite}
                className="w-full py-3 px-5 text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] disabled:opacity-60 rounded-md transition-colors cursor-pointer min-h-[44px]"
              >
                {claimingInvite ? 'Verifying Invite...' : 'Activate Editor Access'}
              </button>
            </form>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EAE0D0] rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 min-w-[110px] px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'bg-[#58111E] text-[#FAF7F2]'
                      : 'text-[#4A403B] hover:text-[#1E1917]'
                  }`}
                >
                  Catalog ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('store')}
                  className={`flex-1 min-w-[110px] px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'store'
                      ? 'bg-[#58111E] text-[#FAF7F2]'
                      : 'text-[#4A403B] hover:text-[#1E1917]'
                  }`}
                >
                  Store Info
                </button>
                {isOwner ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('team')}
                    className={`flex-1 min-w-[110px] px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'team'
                        ? 'bg-[#58111E] text-[#FAF7F2]'
                        : 'text-[#4A403B] hover:text-[#1E1917]'
                    }`}
                  >
                    Friend Access
                  </button>
                ) : null}
              </div>

              {activeTab === 'products' ? (
                <div className="space-y-4">
                  {!hasCloudProducts ? (
                    <div className="p-4 bg-[#F2ECE1] border border-[#D4AF63] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1E1917]">
                          Sync initial catalog to cloud database
                        </p>
                        <p className="text-xs text-[#665B56] mt-0.5">
                          Push the 8 starter garments into Firestore so you and your friend can edit or delete them live.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={seedingCloud}
                        onClick={handleSeedDefault}
                        className="px-4 py-2.5 text-xs font-semibold text-[#FAF7F2] bg-[#142136] hover:bg-[#1E3150] disabled:opacity-60 rounded-md whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
                      >
                        {seedingCloud ? 'Syncing...' : 'Sync Default Catalog'}
                      </button>
                    </div>
                  ) : null}

                  {showProductForm ? (
                    <form
                      onSubmit={handleSaveProduct}
                      className="p-4 sm:p-5 bg-[#F2ECE1] border border-[#D8CCBA] rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-lg font-semibold text-[#1E1917]">
                          {editingProductId ? 'Edit Garment' : 'Add New Garment'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowProductForm(false)}
                          className="text-xs font-medium text-[#665B56] hover:text-[#1E1917] px-2 py-1 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-medium text-[#4A403B] mb-1">
                            Garment Name
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={100}
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm((p) => ({ ...p, name: e.target.value }))
                            }
                            placeholder="e.g. Paithani Silk Saree"
                            className="w-full h-11 px-3 text-sm bg-[#FAF7F2] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#4A403B] mb-1">
                            Department
                          </label>
                          <select
                            value={productForm.category}
                            onChange={(e) =>
                              setProductForm((p) => ({
                                ...p,
                                category: e.target.value as Product['category'],
                              }))
                            }
                            className="w-full h-11 px-3 text-sm bg-[#FAF7F2] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                          >
                            <option value="sarees">Sarees Collection</option>
                            <option value="kurtis">Kurtis &amp; Ethnic Suits</option>
                            <option value="western">Girls&apos; &amp; Western Wear</option>
                            <option value="bridal">Bridal &amp; Festive Lehengas</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#4A403B] mb-1">
                            Sub-Category Label
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={60}
                            value={productForm.subCategory}
                            onChange={(e) =>
                              setProductForm((p) => ({ ...p, subCategory: e.target.value }))
                            }
                            placeholder="e.g. Wedding Sarees"
                            className="w-full h-11 px-3 text-sm bg-[#FAF7F2] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#4A403B] mb-1">
                            Price in INR (₹)
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            max={1000000}
                            value={productForm.priceInr}
                            onChange={(e) =>
                              setProductForm((p) => ({
                                ...p,
                                priceInr: Number(e.target.value),
                              }))
                            }
                            className="w-full h-11 px-3 text-sm bg-[#FAF7F2] border border-[#D8CCBA] rounded-md tabular-nums focus:outline-none focus:border-[#58111E]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#4A403B] mb-1">
                            Fabric
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={60}
                            value={productForm.fabric}
                            onChange={(e) =>
                              setProductForm((p) => ({ ...p, fabric: e.target.value }))
                            }
                            placeholder="e.g. Pure Katan Silk"
                            className="w-full h-11 px-3 text-sm bg-[#FAF7F2] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#4A403B] mb-1">
                            Color Name
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={50}
                            value={productForm.colorName}
                            onChange={(e) =>
                              setProductForm((p) => ({ ...p, colorName: e.target.value }))
                            }
                            placeholder="e.g. Deep Maroon & Gold"
                            className="w-full h-11 px-3 text-sm bg-[#FAF7F2] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#4A403B] mb-1">
                          Short Description
                        </label>
                        <textarea
                          rows={2}
                          required
                          maxLength={300}
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm((p) => ({ ...p, description: e.target.value }))
                          }
                          placeholder="Fabric weave, border finish, or occasion suitability..."
                          className="w-full p-3 text-sm bg-[#FAF7F2] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="block text-xs font-medium text-[#4A403B] mb-1.5">
                            Available Sizes
                          </span>
                          <div className="flex items-center gap-1.5">
                            {ALL_SIZES.map((sz) => {
                              const active = productForm.sizes.includes(sz);
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => toggleFormSize(sz)}
                                  className={`w-10 h-10 text-xs font-semibold rounded border cursor-pointer ${
                                    active
                                      ? 'bg-[#142136] text-[#FAF7F2] border-[#142136]'
                                      : 'bg-[#FAF7F2] text-[#1E1917] border-[#D8CCBA]'
                                  }`}
                                >
                                  {sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <label className="inline-flex items-center gap-2.5 text-sm font-medium text-[#1E1917] cursor-pointer py-2">
                          <input
                            type="checkbox"
                            checked={productForm.inStock ?? true}
                            onChange={(e) =>
                              setProductForm((p) => ({ ...p, inStock: e.target.checked }))
                            }
                            className="w-4 h-4 accent-[#58111E]"
                          />
                          <span>In Stock</span>
                        </label>
                      </div>

                      <div>
                        <span className="block text-xs font-medium text-[#4A403B] mb-2">
                          Choose Store Photo or Enter Image URL
                        </span>
                        <div className="grid grid-cols-4 gap-2 mb-2.5">
                          {STUDIO_GALLERY.map((preset) => {
                            const selected = productForm.image === preset.src;
                            return (
                              <button
                                key={preset.src}
                                type="button"
                                onClick={() =>
                                  setProductForm((p) => ({ ...p, image: preset.src }))
                                }
                                className={`relative rounded overflow-hidden aspect-[4/3] border-2 cursor-pointer ${
                                  selected ? 'border-[#58111E]' : 'border-transparent'
                                }`}
                                title={preset.label}
                              >
                                <img
                                  src={preset.src}
                                  alt={preset.label}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover object-top"
                                />
                              </button>
                            );
                          })}
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={500}
                          value={productForm.image}
                          onChange={(e) =>
                            setProductForm((p) => ({ ...p, image: e.target.value }))
                          }
                          placeholder="https://... or /src/assets/images/..."
                          className="w-full h-10 px-3 text-xs bg-[#FAF7F2] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingProduct}
                          className="flex-1 py-3 px-5 text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] disabled:opacity-60 rounded-md transition-colors cursor-pointer min-h-[44px]"
                        >
                          {savingProduct
                            ? 'Saving to Store...'
                            : editingProductId
                              ? 'Update Garment'
                              : 'Publish Garment'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs sm:text-sm text-[#665B56]">
                        Tap any item below to edit price, stock, sizes, or photo from mobile.
                      </p>
                      <button
                        type="button"
                        onClick={openNewProductForm}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] rounded-md whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
                      >
                        <Plus className="w-4 h-4 text-[#D4AF63]" />
                        <span>Add Garment</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {products.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3.5 p-3 bg-[#F2ECE1] border border-[#E5DDD0] rounded-lg"
                      >
                        <div className="w-16 h-16 rounded overflow-hidden shrink-0 bg-[#EAE0D0]">
                          <GarmentImage
                            src={item.image}
                            alt={item.alt}
                            title={item.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#1E1917] truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-[#665B56] mt-0.5 tabular-nums truncate">
                            {formatInr(item.priceInr)} · {item.subCategory} ·{' '}
                            {item.inStock === false ? 'Out of Stock' : 'In Stock'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditProductForm(item)}
                            aria-label={`Edit ${item.name}`}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#1E1917] bg-[#FAF7F2] hover:bg-[#EAE0D0] border border-[#D8CCBA] rounded-md cursor-pointer min-h-[38px]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {confirmDeleteId === item.id ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(item.id)}
                              className="px-3 py-2 text-xs font-semibold text-[#FAF7F2] bg-[#58111E] rounded-md cursor-pointer min-h-[38px]"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              aria-label={`Delete ${item.name}`}
                              className="w-9 h-9 inline-flex items-center justify-center text-[#665B56] hover:text-[#58111E] hover:bg-[#FAF7F2] rounded-md cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeTab === 'store' ? (
                <form onSubmit={handleSaveStoreInfo} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#4A403B] mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        value={storeForm.name}
                        onChange={(e) =>
                          setStoreForm((s) => ({ ...s, name: e.target.value }))
                        }
                        className="w-full h-11 px-3 text-sm bg-[#F2ECE1] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#4A403B] mb-1">
                        Phone Display
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={24}
                        value={storeForm.phoneDisplay}
                        onChange={(e) =>
                          setStoreForm((s) => ({ ...s, phoneDisplay: e.target.value }))
                        }
                        className="w-full h-11 px-3 text-sm bg-[#F2ECE1] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#4A403B] mb-1">
                        WhatsApp Number (digits with country code)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        value={storeForm.whatsappNumber}
                        onChange={(e) =>
                          setStoreForm((s) => ({
                            ...s,
                            whatsappNumber: e.target.value.replace(/\D/g, ''),
                          }))
                        }
                        placeholder="919823041502"
                        className="w-full h-11 px-3 text-sm bg-[#F2ECE1] border border-[#D8CCBA] rounded-md tabular-nums focus:outline-none focus:border-[#58111E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#4A403B] mb-1">
                        Opening Hours
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={60}
                        value={storeForm.hoursTime}
                        onChange={(e) =>
                          setStoreForm((s) => ({ ...s, hoursTime: e.target.value }))
                        }
                        className="w-full h-11 px-3 text-sm bg-[#F2ECE1] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#4A403B] mb-1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={storeForm.addressLine1}
                        onChange={(e) =>
                          setStoreForm((s) => ({ ...s, addressLine1: e.target.value }))
                        }
                        className="w-full h-11 px-3 text-sm bg-[#F2ECE1] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#4A403B] mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={storeForm.addressLine2}
                        onChange={(e) =>
                          setStoreForm((s) => ({ ...s, addressLine2: e.target.value }))
                        }
                        className="w-full h-11 px-3 text-sm bg-[#F2ECE1] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A403B] mb-1">
                      Hero Tagline
                    </label>
                    <textarea
                      rows={2}
                      required
                      maxLength={200}
                      value={storeForm.tagline}
                      onChange={(e) =>
                        setStoreForm((s) => ({ ...s, tagline: e.target.value }))
                      }
                      className="w-full p-3 text-sm bg-[#F2ECE1] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingStore}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] disabled:opacity-60 rounded-md transition-colors cursor-pointer min-h-[44px]"
                  >
                    {savingStore ? 'Saving...' : 'Save Store Info'}
                  </button>
                </form>
              ) : null}

              {activeTab === 'team' && isOwner ? (
                <div className="space-y-6">
                  <form
                    onSubmit={handleCreateInvite}
                    className="p-4 bg-[#F2ECE1] border border-[#E5DDD0] rounded-lg space-y-3"
                  >
                    <div className="flex items-center gap-2 text-[#58111E]">
                      <UserPlus className="w-4 h-4" />
                      <h3 className="font-display text-lg font-semibold text-[#1E1917]">
                        Share Mobile Edit Access with Your Friend
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-[#665B56] leading-relaxed">
                      Create a single-use invite link below and send it to your friend on WhatsApp. They simply open the link on their phone and sign in with Google to start editing.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        required
                        maxLength={60}
                        value={inviteLabel}
                        onChange={(e) => setInviteLabel(e.target.value)}
                        placeholder="Label e.g. Dost Mobile Access"
                        className="flex-1 h-11 px-3 text-sm bg-[#FAF7F2] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
                      />
                      <button
                        type="submit"
                        disabled={creatingInvite}
                        className="px-5 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] disabled:opacity-60 rounded-md whitespace-nowrap cursor-pointer min-h-[44px]"
                      >
                        {creatingInvite ? 'Creating...' : 'Generate Invite Link'}
                      </button>
                    </div>
                  </form>

                  {invites.length > 0 ? (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#665B56]">
                        Generated Invites
                      </h4>
                      {invites.map((inv) => {
                        const inviteUrl = getInviteUrl(inv.code);
                        const shareWhatsApp = `https://wa.me/?text=${encodeURIComponent(
                          `Open this link on your phone and sign in with Google to manage Saubhagya Emporium catalog: ${inviteUrl}`
                        )}`;
                        return (
                          <div
                            key={inv.code}
                            className="p-3.5 bg-[#F2ECE1] border border-[#E5DDD0] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1E1917] truncate">
                                {inv.label} · <span className="tabular-nums">{inv.code}</span>
                              </p>
                              <p className="text-xs text-[#665B56]">
                                {inv.active ? 'Ready to claim' : 'Already claimed'}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {inv.active ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyInviteLink(inv.code)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1E1917] bg-[#FAF7F2] border border-[#D8CCBA] rounded-md cursor-pointer"
                                  >
                                    {copiedInviteCode === inv.code ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-[#58111E]" />
                                        <span>Copied Link</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5 text-[#58111E]" />
                                        <span>Copy Link</span>
                                      </>
                                    )}
                                  </button>

                                  <a
                                    href={shareWhatsApp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FAF7F2] bg-[#58111E] rounded-md"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 text-[#D4AF63]" />
                                    <span>Send on WhatsApp</span>
                                  </a>
                                </>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => deleteInvite(inv.code)}
                                aria-label={`Delete invite ${inv.code}`}
                                className="p-2 text-[#665B56] hover:text-[#58111E] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[#665B56]">
                      Authorized Editors ({admins.length})
                    </h4>
                    {admins.length === 0 ? (
                      <p className="text-sm text-[#665B56]">
                        No friend editors activated yet. Generate an invite link above to add your friend.
                      </p>
                    ) : (
                      admins.map((adm) => (
                        <div
                          key={adm.uid}
                          className="p-3.5 bg-[#F2ECE1] border border-[#E5DDD0] rounded-lg flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1E1917] truncate">
                              {adm.displayName}
                            </p>
                            <p className="text-xs text-[#665B56] truncate">{adm.email}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => revokeEditor(adm.uid)}
                            className="px-3 py-2 text-xs font-medium text-[#58111E] bg-[#FAF7F2] border border-[#58111E]/30 hover:bg-[#58111E] hover:text-[#FAF7F2] rounded-md transition-colors cursor-pointer shrink-0"
                          >
                            Revoke Access
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
