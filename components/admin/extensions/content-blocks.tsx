import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AudioPlayerBlockView } from "@/components/admin/AudioPlayerBlockView";
import { GalleryBlockView } from "@/components/admin/GalleryBlockView";

export type ContentBlockExtensionOptions = {
  articleId: string | null;
};

export const GalleryBlock = Node.create<ContentBlockExtensionOptions>({
  name: "galleryBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      articleId: null,
    };
  },

  addAttributes() {
    return {
      blockId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-block-id"),
        renderHTML: (attributes) => ({
          "data-block-id": attributes.blockId,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="gallery-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "gallery-block" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => (
      <GalleryBlockView
        {...props}
        articleId={props.extension.options.articleId}
      />
    ));
  },
});

export const AudioPlayerBlock = Node.create<ContentBlockExtensionOptions>({
  name: "audioPlayerBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      articleId: null,
    };
  },

  addAttributes() {
    return {
      blockId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-block-id"),
        renderHTML: (attributes) => ({
          "data-block-id": attributes.blockId,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="audio-player-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "audio-player-block" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => (
      <AudioPlayerBlockView
        {...props}
        articleId={props.extension.options.articleId}
      />
    ));
  },
});

/** @deprecated alias pro zpětnou kompatibilitu */
export type GalleryBlockOptions = ContentBlockExtensionOptions;
