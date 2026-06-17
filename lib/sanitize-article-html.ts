import sanitizeHtml from "sanitize-html";

export const ARTICLE_CONTENT_ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "strong",
  "em",
  "b",
  "i",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "br",
] as const;

export function normalizeEditorHtml(html: string) {
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<p></p>") {
    return null;
  }

  return trimmed;
}

export function sanitizeArticleHtml(dirty: string) {
  return sanitizeHtml(dirty, {
    allowedTags: [...ARTICLE_CONTENT_ALLOWED_TAGS],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...(attribs.href ? { href: attribs.href } : {}),
          ...(attribs.title ? { title: attribs.title } : {}),
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  }).trim();
}

export function sanitizeArticleContentForStorage(content: string) {
  const normalized = normalizeEditorHtml(content);
  if (!normalized) {
    return null;
  }

  const sanitized = sanitizeArticleHtml(normalized);
  return sanitized || null;
}

export function sanitizeArticleContentForDisplay(content: string) {
  const sanitized = sanitizeArticleHtml(content);
  return sanitized || "";
}
