import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { GalleryBlockView } from "@/components/admin/GalleryBlockView";

export type GalleryBlockOptions = {
  articleId: string | null;
};

export const GalleryBlock = Node.create<GalleryBlockOptions>({
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

/** Připraveno pro budoucí audio blok — stejný princip. */
export const AudioPlayerBlock = Node.create<GalleryBlockOptions>({
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
});
