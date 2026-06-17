"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState, useTransition } from "react";
import { createGalleryBlockAction } from "@/app/admin/gallery-actions";
import { GalleryBlock } from "@/components/admin/extensions/content-blocks";
import {
  EMPTY_ARTICLE_DOC,
  prepareContentForEditor,
  type ArticleDoc,
} from "@/lib/article-content";
import { serializeArticleDoc } from "@/lib/article-doc";
import { sanitizeArticleDoc } from "@/lib/sanitize-article-doc";
import "./article-editor.css";

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-admin-md px-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-admin-accent-muted text-admin-accent"
          : "text-admin-muted hover:bg-admin-surface-muted hover:text-admin-text"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-admin-border-subtle" aria-hidden />;
}

function EditorToolbar({
  editor,
  articleId,
  onInsertGallery,
  galleryPending,
}: {
  editor: Editor;
  articleId?: string;
  onInsertGallery: () => void;
  galleryPending: boolean;
}) {
  function setLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL odkazu", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    try {
      const parsed = new URL(url, window.location.origin);
      if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
        window.alert("Povolené jsou jen odkazy http, https a mailto.");
        return;
      }
    } catch {
      window.alert("Zadej platnou URL.");
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-admin-border-subtle bg-admin-surface-muted px-2 py-2">
      <ToolbarButton
        label="Nadpis 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="Nadpis 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        H3
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        label="Tučné"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </ToolbarButton>
      <ToolbarButton
        label="Kurzíva"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        label="Odrážky"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •
      </ToolbarButton>
      <ToolbarButton
        label="Číslovaný seznam"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </ToolbarButton>
      <ToolbarButton
        label="Citace"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        „
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        label="Odkaz"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        URL
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        label="Vložit galerii"
        disabled={!articleId || galleryPending}
        onClick={onInsertGallery}
      >
        Galerie
      </ToolbarButton>
    </div>
  );
}

function normalizeDoc(editor: Editor): ArticleDoc {
  const json = editor.getJSON() as ArticleDoc;
  return sanitizeArticleDoc(json);
}

export function ArticleContentEditor({
  name,
  defaultValue = "",
  articleId,
}: {
  name: string;
  defaultValue?: string;
  articleId?: string;
}) {
  const initialDoc = prepareContentForEditor(defaultValue);
  const [json, setJson] = useState(() => serializeArticleDoc(initialDoc));
  const [, refreshToolbar] = useState(0);
  const [galleryPending, startGalleryTransition] = useTransition();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      GalleryBlock.configure({ articleId: articleId ?? null }),
    ],
    content: initialDoc as JSONContent,
    editorProps: {
      attributes: {
        class: "article-editor-content",
        "data-placeholder": "Hlavní text článku…",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setJson(serializeArticleDoc(normalizeDoc(currentEditor)));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const refresh = () => {
      refreshToolbar((value) => value + 1);
    };

    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);

    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("transaction", refresh);
    };
  }, [editor]);

  function insertGallery() {
    if (!articleId || !editor) {
      return;
    }

    startGalleryTransition(async () => {
      try {
        const { blockId } = await createGalleryBlockAction(articleId);
        editor
          .chain()
          .focus()
          .insertContent({
            type: "galleryBlock",
            attrs: { blockId },
          })
          .run();
        setJson(serializeArticleDoc(normalizeDoc(editor)));
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : "Galerii se nepodařilo vytvořit.",
        );
      }
    });
  }

  if (!editor) {
    return (
      <div className="rounded-admin-lg border border-admin-border bg-admin-bg px-4 py-10 text-sm text-admin-muted">
        Načítám editor…
      </div>
    );
  }

  return (
    <div className="article-editor overflow-hidden rounded-admin-lg border border-admin-border bg-admin-bg shadow-admin-sm focus-within:border-admin-accent focus-within:ring-2 focus-within:ring-admin-accent/20">
      <input type="hidden" name={name} value={json} />
      <EditorToolbar
        editor={editor}
        articleId={articleId}
        onInsertGallery={insertGallery}
        galleryPending={galleryPending}
      />
      {!articleId ? (
        <p className="border-b border-admin-border-subtle px-4 py-2 text-xs text-admin-muted">
          Galerie půjde vkládat až po prvním uložení konceptu článku.
        </p>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}

export { EMPTY_ARTICLE_DOC };
