export type ItemStatus = 'available' | 'unavailable';

/** Fields shared by every shape that carries images — all optional, all data:image/... URIs. */
export interface ItemImages {
  /** Card/presentation crop shown on phone-width screens. */
  presentationImage4x3?: string;
  /** Card/presentation crop shown on desktop-width screens. */
  presentationImage16x9?: string;
  /** Up to 3 extra always-4:3 photos shown on the detail page's carousel. Only present on detail responses. */
  galleryImages?: string[];
}

/** Shape returned by GET /menu — the list view never carries the gallery. */
export interface PublicItem extends ItemImages {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  status: ItemStatus;
}

/** Shape returned by GET /menu/items/{id} — adds the gallery for the carousel. */
export type PublicItemDetail = PublicItem;

/** Shape returned by the admin endpoints — includes soft-deleted rows. */
export interface AdminItem extends ItemImages {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  /** Present only when the item has been soft-deleted. */
  deletedAt?: string;
}

/** Body for POST /admin/items and PUT /admin/items/{id}. */
export interface ItemFormValue extends ItemImages {
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  available: boolean;
}
