/** Prisma enum hodnoty bez importu @prisma/client (bezpečné pro server actions volané z klienta). */
export const CONTENT_BLOCK_TYPE = {
  GALLERY: "GALLERY",
  AUDIO_PLAYER: "AUDIO_PLAYER",
} as const;

export type ContentBlockTypeValue =
  (typeof CONTENT_BLOCK_TYPE)[keyof typeof CONTENT_BLOCK_TYPE];

export const MEDIA_TYPE = {
  IMAGE: "IMAGE",
  AUDIO: "AUDIO",
  VIDEO: "VIDEO",
} as const;

export type MediaTypeValue = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export type GalleryMediaItem = {
  id: string;
  url: string;
  publicId: string;
  caption: string | null;
  position: number;
};

export type AudioMediaItem = GalleryMediaItem;

export type BlockMediaMaps = {
  gallery: Map<string, GalleryMediaItem[]>;
  audio: Map<string, AudioMediaItem[]>;
};
