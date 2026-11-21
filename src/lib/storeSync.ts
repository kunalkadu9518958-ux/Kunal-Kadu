import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import {
  GarmentSize,
  PRODUCTS,
  Product,
  STORE_INFO,
  StoreConfig,
} from '../data/catalog';
import { BOOTSTRAPPED_OWNER_EMAIL, OperationType, db, handleFirestoreError } from './firebase';

export interface StoreAdminRecord {
  uid: string;
  email: string;
  displayName: string;
  role: 'editor';
  inviteCode: string;
}

export interface EditorInviteRecord {
  code: string;
  label: string;
  active: boolean;
  createdByUid: string;
  usedByUid?: string;
}

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function sanitizeString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

function sanitizeDigits(value: string, maxLen: number): string {
  return value.replace(/\D/g, '').slice(0, maxLen);
}

export function isValidDocumentId(id: string): boolean {
  return id.length >= 1 && id.length <= 128 && SAFE_ID_REGEX.test(id);
}

export function subscribeStoreConfig(
  onUpdate: (config: StoreConfig | null) => void,
  onError?: (err: Error) => void
) {
  const path = 'store_config/main';
  return onSnapshot(
    doc(db, 'store_config', 'main'),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data();
      onUpdate({
        name: String(data.storeName || STORE_INFO.name),
        tagline: String(data.tagline || STORE_INFO.tagline),
        addressLine1: String(data.addressLine1 || STORE_INFO.addressLine1),
        addressLine2: String(data.addressLine2 || STORE_INFO.addressLine2),
        hoursLabel: String(data.hoursLabel || STORE_INFO.hoursLabel),
        hoursTime: String(data.hoursTime || STORE_INFO.hoursTime),
        phoneDisplay: String(data.phoneDisplay || STORE_INFO.phoneDisplay),
        phoneHref: `tel:+${sanitizeDigits(String(data.whatsappNumber || STORE_INFO.whatsappNumber), 15)}`,
        whatsappNumber: String(data.whatsappNumber || STORE_INFO.whatsappNumber),
        email: STORE_INFO.email,
      });
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  );
}

export function subscribePublishedProducts(
  onUpdate: (products: Product[], hasCloudDocs: boolean) => void,
  onError?: (err: Error) => void
) {
  const path = 'products';
  const q = query(collection(db, path), where('published', '==', true));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([], false);
        return;
      }

      const items: Product[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const validSizes = Array.isArray(d.sizes)
          ? (d.sizes.filter((s: unknown) =>
              ['S', 'M', 'L', 'XL'].includes(String(s))
            ) as GarmentSize[])
          : (['S', 'M', 'L', 'XL'] as GarmentSize[]);

        const rawCat = String(d.category || 'sarees');
        const mappedCategory = (
          ['sarees', 'kurtis', 'western', 'bridal'].includes(rawCat)
            ? rawCat
            : rawCat === 'festive'
              ? 'bridal'
              : 'kurtis'
        ) as Product['category'];

        return {
          id: docSnap.id,
          name: String(d.name || ''),
          category: mappedCategory,
          subCategory: String(d.subCategory || ''),
          fabric: String(d.fabric || ''),
          priceInr: Number(d.priceInr || 0),
          sizes: validSizes.length > 0 ? validSizes : ['M'],
          colorName: String(d.colorName || ''),
          image: String(d.image || ''),
          alt: String(d.alt || d.name || ''),
          description: String(d.description || ''),
          inStock: typeof d.inStock === 'boolean' ? d.inStock : true,
        };
      });

      items.sort((a, b) => a.name.localeCompare(b.name));
      onUpdate(items, true);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
  );
}

export async function checkUserStaffAccess(user: User): Promise<{
  isOwner: boolean;
  isEditor: boolean;
}> {
  const email = (user.email || '').toLowerCase();
  const isOwner = Boolean(user.emailVerified && email === BOOTSTRAPPED_OWNER_EMAIL);
  if (isOwner) {
    return { isOwner: true, isEditor: true };
  }

  if (!user.emailVerified || !isValidDocumentId(user.uid)) {
    return { isOwner: false, isEditor: false };
  }

  const path = `admins/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return { isOwner: false, isEditor: snap.exists() };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveStoreConfig(config: StoreConfig, userUid: string): Promise<void> {
  const path = 'store_config/main';
  const whatsappDigits = sanitizeDigits(config.whatsappNumber, 15);
  if (whatsappDigits.length < 10) {
    throw new Error('WhatsApp number must contain 10 to 15 digits.');
  }

  try {
    await setDoc(doc(db, 'store_config', 'main'), {
      storeName: sanitizeString(config.name, 80) || STORE_INFO.name,
      tagline: sanitizeString(config.tagline, 200) || STORE_INFO.tagline,
      addressLine1: sanitizeString(config.addressLine1, 120) || STORE_INFO.addressLine1,
      addressLine2: sanitizeString(config.addressLine2, 120) || STORE_INFO.addressLine2,
      hoursLabel: sanitizeString(config.hoursLabel, 40) || STORE_INFO.hoursLabel,
      hoursTime: sanitizeString(config.hoursTime, 60) || STORE_INFO.hoursTime,
      phoneDisplay: sanitizeString(config.phoneDisplay, 24) || STORE_INFO.phoneDisplay,
      whatsappNumber: whatsappDigits,
      updatedByUid: userUid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveProductToCloud(
  product: Omit<Product, 'id'> & { id?: string },
  userUid: string,
  isNew: boolean
): Promise<string> {
  const generatedId =
    product.id && isValidDocumentId(product.id)
      ? product.id
      : `se-${product.category}-${Date.now().toString(36)}`;

  const path = `products/${generatedId}`;
  const price = Math.max(1, Math.min(1000000, Math.round(Number(product.priceInr) || 0)));
  const sizes: GarmentSize[] =
    product.sizes.length > 0 ? product.sizes.slice(0, 4) : ['M'];

  const payloadBase = {
    name: sanitizeString(product.name, 100),
    category: product.category,
    subCategory: sanitizeString(product.subCategory, 60),
    fabric: sanitizeString(product.fabric, 60),
    priceInr: price,
    sizes,
    colorName: sanitizeString(product.colorName, 50),
    image: sanitizeString(product.image, 500),
    alt: sanitizeString(product.alt || product.name, 200),
    description: sanitizeString(product.description, 300),
    published: true,
    inStock: Boolean(product.inStock ?? true),
    updatedByUid: userUid,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'products', generatedId), {
        ...payloadBase,
        createdAt: serverTimestamp(),
      });
    } else {
      const existingSnap = await getDoc(doc(db, 'products', generatedId));
      if (!existingSnap.exists()) {
        await setDoc(doc(db, 'products', generatedId), {
          ...payloadBase,
          createdAt: serverTimestamp(),
        });
      } else {
        await setDoc(
          doc(db, 'products', generatedId),
          {
            ...payloadBase,
            createdAt: existingSnap.data().createdAt,
          },
          { merge: false }
        );
      }
    }
    return generatedId;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteProductFromCloud(productId: string): Promise<void> {
  if (!isValidDocumentId(productId)) {
    throw new Error('Invalid product identifier.');
  }
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedDefaultCatalogToCloud(userUid: string): Promise<void> {
  const batch = writeBatch(db);
  const path = 'products';

  batch.set(doc(db, 'store_config', 'main'), {
    storeName: STORE_INFO.name,
    tagline: STORE_INFO.tagline,
    addressLine1: STORE_INFO.addressLine1,
    addressLine2: STORE_INFO.addressLine2,
    hoursLabel: STORE_INFO.hoursLabel,
    hoursTime: STORE_INFO.hoursTime,
    phoneDisplay: STORE_INFO.phoneDisplay,
    whatsappNumber: STORE_INFO.whatsappNumber,
    updatedByUid: userUid,
    updatedAt: serverTimestamp(),
  });

  for (const item of PRODUCTS) {
    batch.set(doc(db, 'products', item.id), {
      name: sanitizeString(item.name, 100),
      category: item.category,
      subCategory: sanitizeString(item.subCategory, 60),
      fabric: sanitizeString(item.fabric, 60),
      priceInr: item.priceInr,
      sizes: item.sizes,
      colorName: sanitizeString(item.colorName, 50),
      image: sanitizeString(item.image, 500),
      alt: sanitizeString(item.alt, 200),
      description: sanitizeString(item.description, 300),
      published: true,
      inStock: item.inStock ?? true,
      updatedByUid: userUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeOwnerTeamAccess(
  onAdmins: (admins: StoreAdminRecord[]) => void,
  onInvites: (invites: EditorInviteRecord[]) => void
) {
  const unsubAdmins = onSnapshot(
    collection(db, 'admins'),
    (snap) => {
      onAdmins(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            uid: String(data.uid || d.id),
            email: String(data.email || ''),
            displayName: String(data.displayName || 'Store Editor'),
            role: 'editor',
            inviteCode: String(data.inviteCode || ''),
          };
        })
      );
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'admins');
    }
  );

  const unsubInvites = onSnapshot(
    collection(db, 'editor_invites'),
    (snap) => {
      onInvites(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            code: String(data.code || d.id),
            label: String(data.label || 'Friend Invite'),
            active: Boolean(data.active),
            createdByUid: String(data.createdByUid || ''),
            usedByUid: data.usedByUid ? String(data.usedByUid) : undefined,
          };
        })
      );
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'editor_invites');
    }
  );

  return () => {
    unsubAdmins();
    unsubInvites();
  };
}

export async function createFriendInvite(
  ownerUid: string,
  label: string
): Promise<string> {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  const code = `KATOL-${randomChars}${randomDigits}`;
  const path = `editor_invites/${code}`;

  try {
    await setDoc(doc(db, 'editor_invites', code), {
      code,
      label: sanitizeString(label || 'Friend Mobile Editor', 60),
      active: true,
      createdByUid: ownerUid,
      createdAt: serverTimestamp(),
    });
    return code;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function claimFriendInvite(
  user: User,
  rawCode: string
): Promise<void> {
  const code = rawCode.trim().toUpperCase();
  if (!isValidDocumentId(code) || code.length < 6 || code.length > 32) {
    throw new Error('Please enter a valid invite code.');
  }
  if (!user.emailVerified || !user.email) {
    throw new Error('A verified Google account is required.');
  }

  const inviteRef = doc(db, 'editor_invites', code);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) {
    throw new Error('Invite code not found. Please ask the store owner for a fresh link.');
  }

  const inviteData = inviteSnap.data();
  if (!inviteData.active) {
    throw new Error('This invite code has already been used or revoked.');
  }

  const batch = writeBatch(db);
  batch.set(doc(db, 'admins', user.uid), {
    uid: user.uid,
    email: sanitizeString(user.email, 120),
    displayName: sanitizeString(user.displayName || user.email.split('@')[0] || 'Store Editor', 80),
    role: 'editor',
    inviteCode: code,
    createdAt: serverTimestamp(),
  });

  batch.update(inviteRef, {
    active: false,
    usedByUid: user.uid,
    claimedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `editor_invites/${code}`);
  }
}

export async function revokeEditor(adminUid: string): Promise<void> {
  if (!isValidDocumentId(adminUid)) return;
  try {
    await deleteDoc(doc(db, 'admins', adminUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `admins/${adminUid}`);
  }
}

export async function deleteInvite(code: string): Promise<void> {
  if (!isValidDocumentId(code)) return;
  try {
    await deleteDoc(doc(db, 'editor_invites', code));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `editor_invites/${code}`);
  }
}
