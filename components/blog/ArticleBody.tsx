import { parseArticleDoc, extractBlockIds } from "@/lib/article-doc";
import { getGalleryMediaForBlocks } from "@/lib/content-blocks";
import { sanitizeArticleDoc } from "@/lib/sanitize-article-doc";
import { ArticleDocRenderer } from "@/components/blog/ArticleDocRenderer";

export async function ArticleBody({ content }: { content: string | null }) {
  if (!content?.trim()) {
    return null;
  }

  const doc = sanitizeArticleDoc(parseArticleDoc(content));
  const blockIds = extractBlockIds(doc);
  const mediaByBlock = await getGalleryMediaForBlocks(blockIds);

  return <ArticleDocRenderer doc={doc} mediaByBlock={mediaByBlock} />;
}
