import {
  type ArticleDoc,
  type BlockNode,
  type ParagraphNode,
  EMPTY_ARTICLE_DOC,
} from "@/lib/article-doc";

function isHtmlContent(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.startsWith("<") &&
    /<\/?(?:p|h2|h3|ul|ol|li|blockquote|strong|em|b|i|a|br)\b/i.test(trimmed)
  );
}

function parseHtmlWithRegex(html: string): ArticleDoc {
  const blocks: BlockNode[] = [];
  const pattern =
    /<(p|h2|h3|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const inner = match[2]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!inner) {
      continue;
    }

    if (tag === "h2" || tag === "h3") {
      blocks.push({
        type: "heading",
        attrs: { level: tag === "h2" ? 2 : 3 },
        content: [{ type: "text", text: inner }],
      });
    } else {
      blocks.push({
        type: "paragraph",
        content: [{ type: "text", text: inner }],
      });
    }
  }

  if (blocks.length === 0) {
    const stripped = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return stripped
      ? {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: stripped }] }],
        }
      : EMPTY_ARTICLE_DOC;
  }

  return { type: "doc", content: blocks };
}

export function htmlToArticleDoc(html: string): ArticleDoc {
  const trimmed = html.trim();
  if (!trimmed) {
    return EMPTY_ARTICLE_DOC;
  }

  return demoteAccidentalHeadings(parseHtmlWithRegex(trimmed));
}

function blockPlainText(node: BlockNode): string {
  if (node.type === "paragraph" || node.type === "heading") {
    return (node.content ?? [])
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("");
  }
  return "";
}

/** Nadpis v těle článku by neměl nést celý odstavcový text — typicky omylem z H2 v toolbaru. */
const HEADING_BODY_MAX_LENGTH = 80;

function demoteAccidentalHeadings(doc: ArticleDoc): ArticleDoc {
  return {
    type: "doc",
    content: doc.content.map((node) => {
      if (node.type !== "heading") {
        return node;
      }

      const text = blockPlainText(node).trim();
      const sentenceCount = (text.match(/[.!?](?:\s|$)/g) ?? []).length;
      const looksLikeBody =
        text.length > HEADING_BODY_MAX_LENGTH || sentenceCount >= 2;

      if (!looksLikeBody) {
        return node;
      }

      return {
        type: "paragraph",
        content: node.content,
      } satisfies ParagraphNode;
    }),
  };
}

/** Opraví starý HTML obsah uložený jako plain text v odstavci/nadpisu. */
export function normalizeLegacyArticleDoc(doc: ArticleDoc): ArticleDoc {
  if (doc.content.length === 1) {
    const only = doc.content[0];
    if (only.type === "paragraph" || only.type === "heading") {
      const text = blockPlainText(only).trim();
      if (isHtmlContent(text)) {
        return htmlToArticleDoc(text);
      }
    }
  }

  return demoteAccidentalHeadings(doc);
}

export { isHtmlContent };
