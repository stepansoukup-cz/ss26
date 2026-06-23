import { z } from "zod";

const emptyWhenMissing = (value: unknown) =>
  typeof value === "string" ? value : "";

const optionalText = z.preprocess(
  emptyWhenMissing,
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value)),
);

const optionalUrl = z.preprocess(
  emptyWhenMissing,
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || /^https?:\/\/.+/i.test(value), {
      message: "URL musí začínat http:// nebo https://.",
    }),
);

const optionalDate = z.preprocess(
  emptyWhenMissing,
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : new Date(value)))
    .refine((value) => value === null || !Number.isNaN(value.getTime()), {
      message: "Datum není platné.",
    }),
);

const optionalMoney = z.preprocess(
  emptyWhenMissing,
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value.replace(",", ".")))
    .refine((value) => value === null || /^\d+(\.\d{1,2})?$/.test(value), {
      message: "Cena musí být číslo, maximálně se dvěma desetinnými místy.",
    }),
);

export const gearFormSchema = z.object({
  id: optionalText,
  brand: z.string().trim().min(1, "Značka je povinná."),
  model: z.string().trim().min(1, "Model je povinný."),
  categoryId: z.string().trim().min(1, "Vyber kategorii."),
  newCategoryName: optionalText,
  note: optionalText,
  boughtAt: optionalDate,
  soldAt: optionalDate,
  inDrawer: z.coerce.boolean().default(false),
  purchaseUrl: optionalUrl,
  eshopUrl: optionalUrl,
  listingUrl: optionalUrl,
  coverImageUrl: optionalUrl,
  removeCover: z.coerce.boolean().default(false),
  containerId: optionalText,
  sameModelGroupId: optionalText,
  newGroupName: optionalText,
});

export const gearPrivateInfoSchema = z.object({
  serial: optionalText,
  purchasePrice: optionalMoney,
  sellPrice: optionalMoney,
  sellerName: optionalText,
  sellerPhone: optionalText,
  sellerEmail: optionalText,
  sellerCity: optionalText,
  sellerFb: optionalText,
  buyerName: optionalText,
  buyerPhone: optionalText,
  buyerEmail: optionalText,
  buyerAddress: optionalText,
  buyerFb: optionalText,
});

export const gigFormSchema = z.object({
  id: optionalText,
  date: z
    .string()
    .trim()
    .min(1, "Datum koncertu je povinné.")
    .transform((value) => new Date(value))
    .refine((value) => !Number.isNaN(value.getTime()), {
      message: "Datum koncertu není platné.",
    }),
  city: z.string().trim().min(1, "Město je povinné."),
  place: optionalText,
  name: optionalText,
  bandId: z.string().trim().min(1, "Vyber kapelu."),
  newBandName: optionalText,
  note: optionalText,
  photosUrl: optionalUrl,
  recordingUrl: optionalUrl,
  youtubeUrl: optionalUrl.refine(
    (value) => {
      if (value === null) {
        return true;
      }
      try {
        const url = new URL(value);
        return url.hostname === "youtu.be" || url.hostname.endsWith("youtube.com");
      } catch {
        return false;
      }
    },
    { message: "YouTube URL musí být z domény youtube.com nebo youtu.be." },
  ),
});
