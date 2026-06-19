import { parseArticleDoc, extractBlockIds } from "@/lib/article-doc";
import { getBlockMediaForRender } from "@/lib/content-blocks";
import { sanitizeArticleDoc } from "@/lib/sanitize-article-doc";
import { ArticleDocRenderer } from "@/components/blog/ArticleDocRenderer";

export async function ArticleBody({ content }: { content: string | null }) {
  if (!content?.trim()) {
    return null;
  }

  const doc = sanitizeArticleDoc(parseArticleDoc(content));
  const blockIds = extractBlockIds(doc);
  const { gallery: galleryByBlock, audio: audioByBlock } =
    await getBlockMediaForRender(blockIds);

  return (
    <ArticleDocRenderer
      doc={doc}
      galleryByBlock={galleryByBlock}
      audioByBlock={audioByBlock}
    />
  );
}
