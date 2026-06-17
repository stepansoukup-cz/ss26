import { z } from "zod";

export const EMPTY_ARTICLE_DOC: ArticleDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const textNodeSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  marks: z
    .array(
      z.object({
        type: z.enum(["bold", "italic", "link"]),
        attrs: z
          .object({
            href: z.string().optional(),
            target: z.string().optional(),
            rel: z.string().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

const hardBreakSchema = z.object({
  type: z.literal("hardBreak"),
});

const inlineNodeSchema = z.union([textNodeSchema, hardBreakSchema]);

const paragraphSchema = z.object({
  type: z.literal("paragraph"),
  content: z.array(inlineNodeSchema).optional(),
});

const headingSchema = z.object({
  type: z.literal("heading"),
  attrs: z.object({ level: z.union([z.literal(2), z.literal(3)]) }),
  content: z.array(textNodeSchema).optional(),
});

const listItemSchema: z.ZodType<ListItemNode> = z.lazy(() =>
  z.object({
    type: z.literal("listItem"),
    content: z.array(
      z.union([paragraphSchema, z.object({ type: z.literal("paragraph") })]),
    ),
  }),
);

const bulletListSchema = z.object({
  type: z.literal("bulletList"),
  content: z.array(listItemSchema),
});

const orderedListSchema = z.object({
  type: z.literal("orderedList"),
  content: z.array(listItemSchema),
});

const blockquoteSchema = z.object({
  type: z.literal("blockquote"),
  content: z.array(paragraphSchema),
});

export const galleryBlockSchema = z.object({
  type: z.literal("galleryBlock"),
  attrs: z.object({
    blockId: z.string().min(1),
  }),
});

/** Připraveno pro budoucí audio blok — stejný princip jako galerie. */
export const audioPlayerBlockSchema = z.object({
  type: z.literal("audioPlayerBlock"),
  attrs: z.object({
    blockId: z.string().min(1),
  }),
});

const blockNodeSchema = z.union([
  paragraphSchema,
  headingSchema,
  bulletListSchema,
  orderedListSchema,
  blockquoteSchema,
  galleryBlockSchema,
  audioPlayerBlockSchema,
]);

export const articleDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(blockNodeSchema),
});

export type TextNode = z.infer<typeof textNodeSchema>;
export type HardBreakNode = z.infer<typeof hardBreakSchema>;
export type ParagraphNode = z.infer<typeof paragraphSchema>;
export type HeadingNode = z.infer<typeof headingSchema>;
export type ListItemNode = {
  type: "listItem";
  content: ParagraphNode[];
};
export type BulletListNode = z.infer<typeof bulletListSchema>;
export type OrderedListNode = z.infer<typeof orderedListSchema>;
export type BlockquoteNode = z.infer<typeof blockquoteSchema>;
export type GalleryBlockNode = z.infer<typeof galleryBlockSchema>;
export type AudioPlayerBlockNode = z.infer<typeof audioPlayerBlockSchema>;
export type BlockNode =
  | ParagraphNode
  | HeadingNode
  | BulletListNode
  | OrderedListNode
  | BlockquoteNode
  | GalleryBlockNode
  | AudioPlayerBlockNode;
export type ArticleDoc = z.infer<typeof articleDocSchema>;

export function parseArticleDoc(raw: string | null | undefined): ArticleDoc {
  if (!raw?.trim()) {
    return EMPTY_ARTICLE_DOC;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as ArticleDoc).type === "doc" &&
      Array.isArray((parsed as ArticleDoc).content)
    ) {
      return parsed as ArticleDoc;
    }
  } catch {
    // fall through
  }

  return EMPTY_ARTICLE_DOC;
}

export function serializeArticleDoc(doc: ArticleDoc): string {
  return JSON.stringify(doc);
}

export function extractBlockIds(doc: ArticleDoc): string[] {
  const ids = new Set<string>();

  for (const node of doc.content) {
    if (
      (node.type === "galleryBlock" || node.type === "audioPlayerBlock") &&
      node.attrs.blockId
    ) {
      ids.add(node.attrs.blockId);
    }
  }

  return [...ids];
}

/** Převod plain textu (seed / legacy) na Tiptap JSON dokument. */
export function plainTextToArticleDoc(text: string): ArticleDoc {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return EMPTY_ARTICLE_DOC;
  }

  return {
    type: "doc",
    content: blocks.map((block) => ({
      type: "paragraph",
      content: [{ type: "text", text: block.replace(/\n/g, " ") }],
    })),
  };
}

export function isEmptyArticleDoc(doc: ArticleDoc): boolean {
  if (doc.content.length === 0) {
    return true;
  }

  return doc.content.every((node) => {
    if (node.type !== "paragraph") {
      return false;
    }
    const text = (node.content ?? [])
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("")
      .trim();
    return text.length === 0;
  });
}
