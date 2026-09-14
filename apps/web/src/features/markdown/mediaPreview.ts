import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { $prose } from "@milkdown/kit/utils";

const youtubeUrlPattern = /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/g;

const createYouTubePreview = (videoId: string): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.className = "focusnotes-video-preview";
  wrapper.contentEditable = "false";

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.title = "YouTube video preview";
  iframe.loading = "lazy";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  wrapper.appendChild(iframe);
  return wrapper;
};

const createImageToolbar = (
  image: HTMLImageElement,
  view: import("@milkdown/kit/prose/view").EditorView,
  onClose: () => void,
): HTMLDivElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "focusnotes-image-toolbar";
  toolbar.contentEditable = "false";

  const addButton = (label: string, title: string, handler: () => void) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.title = title;
    button.setAttribute("aria-label", title);
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handler();
    });
    toolbar.appendChild(button);
  };

  const source = image.currentSrc || image.src;
  addButton("Copy", "Copy image", async () => {
    try {
      const response = await fetch(source);
      const blob = await response.blob();
      if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } else {
        await navigator.clipboard.writeText(source);
      }
    } catch {
      await navigator.clipboard?.writeText(source);
    }
  });

  addButton("Save", "Download image", () => {
    const link = document.createElement("a");
    link.href = source;
    link.download = source.split("/").pop()?.split("?")[0] || "image";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  });

  addButton("Delete", "Delete image", () => {
    const position = view.posAtDOM(image, 0);
    const node = view.state.doc.nodeAt(position);
    if (node?.type.name === "image") {
      view.dispatch(view.state.tr.delete(position, position + node.nodeSize).scrollIntoView());
    }
    onClose();
  });

  return toolbar;
};
const buildMediaDecorations = (doc: Parameters<typeof DecorationSet.create>[0]) => {
  const decorations: ReturnType<typeof Decoration.widget>[] = [];

  doc.descendants((node, position, parent) => {
    if (!node.isText || parent?.type.name === "code_block") return;

    youtubeUrlPattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = youtubeUrlPattern.exec(node.text ?? "")) !== null) {
      const videoId = match[1];
      const widgetPosition = position + match.index + match[0].length;
      decorations.push(
        Decoration.widget(widgetPosition, () => createYouTubePreview(videoId), {
          side: 1,
          key: `youtube-${videoId}-${widgetPosition}`,
        }),
      );
    }
  });

  return DecorationSet.create(doc, decorations);
};

const mediaPreviewKey = new PluginKey("MEDIA_PREVIEW");

export const mediaPreviewPlugin = $prose(
  () =>
    new Plugin({
      view: (view) => {
        let resizingImage: HTMLImageElement | null = null;
        let imageToolbar: HTMLDivElement | null = null;
        let imageResizeHandle: HTMLDivElement | null = null;

        const closeImageToolbar = () => {
          imageToolbar?.remove();
          imageResizeHandle?.remove();
          imageToolbar = null;
          imageResizeHandle = null;
        };

        const positionImageOverlays = () => {
          if (!imageToolbar || !imageResizeHandle) return;
          const image = imageToolbar.dataset.imageId ? document.querySelector<HTMLImageElement>(`img[data-focusnotes-image-id="${imageToolbar.dataset.imageId}"]`) : null;
          if (!image) return;
          const rect = image.getBoundingClientRect();
          imageToolbar.style.top = `${Math.max(8, rect.top - imageToolbar.offsetHeight - 8)}px`;
          imageToolbar.style.left = `${Math.min(window.innerWidth - imageToolbar.offsetWidth - 8, Math.max(8, rect.right - imageToolbar.offsetWidth))}px`;
          imageResizeHandle.style.top = `${Math.max(8, rect.bottom - 18)}px`;
          imageResizeHandle.style.left = `${Math.max(8, Math.min(window.innerWidth - 18, rect.right - 18))}px`;
        };

        const showImageToolbar = (image: HTMLImageElement) => {
          closeImageToolbar();
          image.style.height = "auto";
          image.style.aspectRatio = "auto";
          imageToolbar = createImageToolbar(image, view, closeImageToolbar);
          imageResizeHandle = document.createElement("div");
          imageResizeHandle.className = "focusnotes-image-resize-handle";
          imageResizeHandle.setAttribute("aria-label", "Resize image");
          imageResizeHandle.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 20 20 4M10 20h10V10\" /></svg>";
          document.body.appendChild(imageToolbar);
          document.body.appendChild(imageResizeHandle);
          positionImageOverlays();

        };

        const onImageClick = (event: MouseEvent) => {
          const target = event.target;
          if (target instanceof HTMLImageElement && view.dom.contains(target)) {
            event.stopPropagation();
            showImageToolbar(target);
          }
        };

        const onDocumentClick = (event: MouseEvent) => {
          if (imageToolbar && !imageToolbar.contains(event.target as Node)) closeImageToolbar();
        };

        view.dom.addEventListener("click", onImageClick);
        document.addEventListener("click", onDocumentClick);
        let startX = 0;
        let startWidth = 0;

        const isResizeCorner = (image: HTMLImageElement, event: PointerEvent) => {
          const rect = image.getBoundingClientRect();
          return event.clientX >= rect.right - 24 && event.clientY >= rect.bottom - 24;
        };

        const onPointerMove = (event: PointerEvent) => {
          const target = event.target;
          if (!(target instanceof HTMLImageElement)) return;
          target.style.cursor = isResizeCorner(target, event) ? "nwse-resize" : "grab";
        };

        const onPointerDown = (event: PointerEvent) => {
          const target = event.target;
          if (!(target instanceof HTMLImageElement) || !isResizeCorner(target, event)) return;

          const rect = target.getBoundingClientRect();
          resizingImage = target;
          startX = event.clientX;
          startWidth = rect.width;
          target.setPointerCapture(event.pointerId);
          target.style.cursor = "nwse-resize";
          event.preventDefault();
          event.stopPropagation();
        };

        const onPointerMoveWhileResizing = (event: PointerEvent) => {
          if (!resizingImage) return;
          const editorWidth = view.dom.clientWidth;
          const nextWidth = Math.max(
            160,
            Math.min(editorWidth, startWidth + event.clientX - startX),
          );
          resizingImage.style.width = `${nextWidth}px`;
          resizingImage.style.height = "auto";
          resizingImage.style.aspectRatio = "auto";
        };

        const stopResizing = () => {
          if (resizingImage) resizingImage.style.cursor = "grab";
          resizingImage = null;
        };

        view.dom.addEventListener("pointermove", onPointerMove);
        window.addEventListener("scroll", positionImageOverlays, true);
        window.addEventListener("resize", positionImageOverlays);
        view.dom.addEventListener("pointerdown", onPointerDown);
        view.dom.addEventListener("pointermove", onPointerMoveWhileResizing);
        view.dom.addEventListener("pointerup", stopResizing);
        view.dom.addEventListener("pointercancel", stopResizing);

        return {
          destroy: () => {
            view.dom.removeEventListener("click", onImageClick);
            document.removeEventListener("click", onDocumentClick);
            closeImageToolbar();
            view.dom.removeEventListener("pointermove", onPointerMove);
            view.dom.removeEventListener("pointerdown", onPointerDown);
            view.dom.removeEventListener("pointermove", onPointerMoveWhileResizing);
            view.dom.removeEventListener("pointerup", stopResizing);
            view.dom.removeEventListener("pointercancel", stopResizing);
          },
        };
      },
      state: {
        init: (_, state) => buildMediaDecorations(state.doc),
        apply: (transaction, oldDecorations) =>
          transaction.docChanged
            ? buildMediaDecorations(transaction.doc)
            : oldDecorations,
      },
      props: {
        decorations: (state) => mediaPreviewKey.getState(state),
      },
    }),
);











