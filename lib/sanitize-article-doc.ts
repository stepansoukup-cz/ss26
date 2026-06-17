import {
  EMPTY_ARTICLE_DOC,
  type ArticleDoc,
  type BlockNode,
  type TextNode,
} from "@/lib/article-doc";

const MAX_TEXT_NODE_LENGTH = 50_000;
const MAX_LINKS_PER_DOC = 200;

function sanitizeText(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, MAX_TEXT_NODE_LENGTH);
}

function sanitizeLinkHref(href: string | undefined): string | null {
  if (!href?.trim()) {
    return null;
  }

  try {
    const parsed = new URL(href.trim());
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function sanitizeTextNode(node: TextNode, linkCount: { value: number }): TextNode {
  const text = sanitizeText(node.text);
  if (!node.marks?.length) {
    return { type: "text", text };
  }

  const marks = node.marks
    .map((mark) => {
      if (mark.type === "link") {
        if (linkCount.value >= MAX_LINKS_PER_DOC) {
          return null;
        }
        const href = sanitizeLinkHref(mark.attrs?.href);
        if (!href) {
          return null;
        }
        linkCount.value += 1;
        return {
          type: "link" as const,
          attrs: {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      }
      if (mark.type === "bold" || mark.type === "italic") {
        return { type: mark.type };
      }
      return null;
    })
    .filter(Boolean) as TextNode["marks"];

  return marks?.length ? { type: "text", text, marks } : { type: "text", text };
}

function sanitizeInlineContent(
  content: unknown,
  linkCount: { value: number },
): TextNode[] | undefined {
  if (!Array.isArray(content)) {
    return undefined;
  }

  const result = content
    .map((node) => {
      if (!node || typeof node !== "object") {
        return null;
      }
      if ((node as { type?: string }).type === "hardBreak") {
        return { type: "hardBreak" as const };
      }
      if ((node as { type?: string }).type === "text") {
        return sanitizeTextNode(node as TextNode, linkCount);
      }
      return null;
    })
    .filter(Boolean);

  return result.length ? (result as TextNode[]) : undefined;
}

function sanitizeBlockNode(node: unknown, linkCount: { value: number }): BlockNode | null {
  if (!node || typeof node !== "object") {
    return null;
  }

  const typed = node as { type?: string; attrs?: Record<string, unknown>; content?: unknown };

  switch (typed.type) {
    case "galleryBlock":
    case "audioPlayerBlock": {
      const blockId =
        typeof typed.attrs?.blockId === "string" ? typed.attrs.blockId.trim() : "";
      return blockId
        ? ({
            type: typed.type,
            attrs: { blockId },
          } as BlockNode)
        : null;
    }
    case "paragraph":
      return {
        type: "paragraph",
        content: sanitizeInlineContent(typed.content, linkCount),
      };
    case "heading": {
      const level = typed.attrs?.level;
      if (level !== 2 && level !== 3) {
        return null;
      }
      return {
        type: "heading",
        attrs: { level },
        content: sanitizeInlineContent(typed.content, linkCount)?.filter(
          (item): item is TextNode => item.type === "text",
        ),
      };
    }
    case "blockquote": {
      if (!Array.isArray(typed.content)) {
        return null;
      }
      const paragraphs = typed.content
        .map((item) => sanitizeBlockNode(item, linkCount))
        .filter((item): item is BlockNode => item !== null && item.type === "paragraph");
      return paragraphs.length ? { type: "blockquote", content: paragraphs } : null;
    }
    case "bulletList":
    case "orderedList": {
      if (!Array.isArray(typed.content)) {
        return null;
      }
      const items = typed.content
        .map((item) => {
          if (!item || typeof item !== "object" || (item as { type?: string }).type !== "listItem") {
            return null;
          }
          const paragraphs = ((item as { content?: unknown }).content ?? [])
            .map((paragraph) => sanitizeBlockNode(paragraph, linkCount))
            .filter(
              (block): block is BlockNode =>
                block !== null && block.type === "paragraph",
            );
          return paragraphs.length
            ? { type: "listItem" as const, content: paragraphs }
            : null;
        })
        .filter(Boolean);
      return items.length
        ? ({ type: typed.type, content: items } as BlockNode)
        : null;
    }
    default:
      return null;
  }
}

function isStorageEmpty(doc: ArticleDoc): boolean {
  return doc.content.every((node) => {
    if (node.type === "galleryBlock" || node.type === "audioPlayerBlock") {
      return false;
    }
    if (node.type === "paragraph") {
      const text = (node.content ?? [])
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("")
        .trim();
      return text.length === 0;
    }
    return false;
  });
}

export function sanitizeArticleDoc(doc: unknown): ArticleDoc {
  if (!doc || typeof doc !== "object" || (doc as ArticleDoc).type !== "doc") {
    return EMPTY_ARTICLE_DOC;
  }

  const linkCount = { value: 0 };
  const content = ((doc as ArticleDoc).content ?? [])
    .map((node) => sanitizeBlockNode(node, linkCount))
    .filter((node): node is BlockNode => node !== null);

  return { type: "doc", content };
}

export function sanitizeArticleDocForStorage(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const sanitized = sanitizeArticleDoc(parsed);
    if (isStorageEmpty(sanitized)) {
      return null;
    }
    return JSON.stringify(sanitized);
  } catch {
    return null;
  }
}
