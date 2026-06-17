import {
  EMPTY_ARTICLE_DOC,
  parseArticleDoc,
  plainTextToArticleDoc,
  type ArticleDoc,
} from "@/lib/article-doc";
import { sanitizeArticleDoc } from "@/lib/sanitize-article-doc";

export { EMPTY_ARTICLE_DOC, parseArticleDoc, plainTextToArticleDoc, type ArticleDoc };

/** Načtení uloženého JSON obsahu pro Tiptap editor. */
export function prepareContentForEditor(content: string | null | undefined): ArticleDoc {
  if (!content?.trim()) {
    return EMPTY_ARTICLE_DOC;
  }

  const trimmed = content.trim();
  if (trimmed.startsWith("{")) {
    try {
      return sanitizeArticleDoc(JSON.parse(trimmed));
    } catch {
      return EMPTY_ARTICLE_DOC;
    }
  }

  return plainTextToArticleDoc(trimmed);
}
