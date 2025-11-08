// Wishlist API Service
const API_BASE_URL = "https://api.wetrippo.com/api";

export interface WishlistItem {
  id: string;
  title: string;
  imageurl: string;
  producturl: string;
  source?: "local" | "api"; // Track the source of the item
}

export interface CreateWishlistDto {
  title: string;
  imageurl: string;
  producturl: string;
}

export interface UpdateWishlistDto {
  title?: string;
  imageurl?: string;
  producturl?: string;
}

const normalizeWishlistItem = (item: any): WishlistItem => {
  const rawId =
    item?.id ??
    item?._id ??
    item?.ID ??
    (item?.slug ? `${item.slug}` : undefined);
  const globalCrypto: Crypto | undefined =
    typeof globalThis !== "undefined"
      ? (globalThis as unknown as { crypto?: Crypto }).crypto
      : undefined;
  const fallbackId =
    globalCrypto && "randomUUID" in globalCrypto
      ? globalCrypto.randomUUID()
      : `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: rawId !== undefined && rawId !== null ? String(rawId) : fallbackId,
    title: item?.title ?? "",
    imageurl: item?.imageurl ?? item?.imageUrl ?? "",
    producturl: item?.producturl ?? item?.productUrl ?? "",
    source: "api",
  };
};

// Fetch all wishlist items from API
export async function fetchWishlistItems(): Promise<WishlistItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch wishlist items: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    return items.map(normalizeWishlistItem);
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    return [];
  }
}

// Create a new wishlist item
export async function createWishlistItem(
  item: CreateWishlistDto,
): Promise<WishlistItem | null> {
  try {
    const payload = {
      ...item,
      imageUrl: item.imageurl,
      productUrl: item.producturl,
    };

    const response = await fetch(`${API_BASE_URL}/wishlist/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create wishlist item: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const itemData = data?.data ?? data;
    return normalizeWishlistItem(itemData);
  } catch (error) {
    console.error("Error creating wishlist item:", error);
    return null;
  }
}

// Update an existing wishlist item
export async function updateWishlistItem(
  id: string,
  updates: UpdateWishlistDto,
): Promise<WishlistItem | null> {
  try {
    const payload = {
      id,
      ...updates,
    };
    const response = await fetch(`${API_BASE_URL}/wishlist/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update wishlist item: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const itemData = data?.data ?? data;
    return normalizeWishlistItem(itemData);
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    return null;
  }
}

// Delete a wishlist item
export async function deleteWishlistItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete wishlist item: ${response.statusText}`,
      );
    }

    return true;
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    return false;
  }
}
