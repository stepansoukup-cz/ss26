import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleGallery } from "@/components/blog/ArticleGallery";
import { ArticleAudioPlayer } from "@/components/blog/ArticleAudioPlayer";
import type { ArticleDoc, BlockNode, ParagraphNode, TextNode } from "@/lib/article-doc";
import type { AudioMediaItem, GalleryMediaItem } from "@/lib/content-block-constants";

function safeHref(href: string | undefined): string | null {
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

function renderTextNode(node: TextNode, key: number): ReactNode {
  let content: ReactNode = node.text;

  if (node.marks?.length) {
    for (const mark of node.marks) {
      if (mark.type === "bold") {
        content = <strong key={`b-${key}`}>{content}</strong>;
      }
      if (mark.type === "italic") {
        content = <em key={`i-${key}`}>{content}</em>;
      }
      if (mark.type === "link") {
        const href = safeHref(mark.attrs?.href);
        content = href ? (
          <Link
            key={`a-${key}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {content}
          </Link>
        ) : (
          content
        );
      }
    }
  }

  return <span key={key}>{content}</span>;
}

function renderInline(content: ParagraphNode["content"]): ReactNode {
  if (!content?.length) {
    return null;
  }

  return content.map((node, index) => {
    if (node.type === "hardBreak") {
      return <br key={index} />;
    }
    return renderTextNode(node, index);
  });
}

function renderBlock(
  node: BlockNode,
  index: number,
  galleryByBlock: Map<string, GalleryMediaItem[]>,
  audioByBlock: Map<string, AudioMediaItem[]>,
): ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p key={index}>{renderInline(node.content)}</p>;
    case "heading": {
      const Tag = node.attrs.level === 2 ? "h2" : "h3";
      return <Tag key={index}>{renderInline(node.content)}</Tag>;
    }
    case "blockquote":
      return (
        <blockquote key={index}>
          {node.content.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex}>{renderInline(paragraph.content)}</p>
          ))}
        </blockquote>
      );
    case "bulletList":
      return (
        <ul key={index}>
          {node.content.map((item, itemIndex) => (
            <li key={itemIndex}>
              {item.content.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{renderInline(paragraph.content)}</p>
              ))}
            </li>
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={index}>
          {node.content.map((item, itemIndex) => (
            <li key={itemIndex}>
              {item.content.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{renderInline(paragraph.content)}</p>
              ))}
            </li>
          ))}
        </ol>
      );
    case "galleryBlock": {
      const images = galleryByBlock.get(node.attrs.blockId) ?? [];
      return <ArticleGallery key={index} images={images} />;
    }
    case "audioPlayerBlock": {
      const tracks = audioByBlock.get(node.attrs.blockId) ?? [];
      return <ArticleAudioPlayer key={index} tracks={tracks} />;
    }
    default:
      return null;
  }
}

export function ArticleDocRenderer({
  doc,
  galleryByBlock,
  audioByBlock,
}: {
  doc: ArticleDoc;
  galleryByBlock: Map<string, GalleryMediaItem[]>;
  audioByBlock: Map<string, AudioMediaItem[]>;
}) {
  if (doc.content.length === 0) {
    return null;
  }

  return (
    <div className="article-content border-t border-graphite-border pt-8">
      {doc.content.map((node, index) =>
        renderBlock(node, index, galleryByBlock, audioByBlock),
      )}
    </div>
  );
}
