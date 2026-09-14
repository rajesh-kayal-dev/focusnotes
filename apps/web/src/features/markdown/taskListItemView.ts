import { Plugin } from "@milkdown/kit/prose/state";
import type { Node } from "@milkdown/kit/prose/model";
import type { EditorView, NodeView } from "@milkdown/kit/prose/view";
import { $prose } from "@milkdown/kit/utils";

class TaskListItemNodeView implements NodeView {
  dom: HTMLLIElement;
  contentDOM?: HTMLElement;
  node: Node;
  view: EditorView;
  getPos: () => number | undefined;

  constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    this.dom = document.createElement("li");

    if (node.attrs.checked != null) {
      this.dom.className = "task-list-item";
      this.dom.setAttribute("data-item-type", "task");
      this.dom.setAttribute("data-checked", String(node.attrs.checked));

      const checkboxContainer = document.createElement("label");
      checkboxContainer.className = "task-checkbox-container";
      checkboxContainer.contentEditable = "false";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = Boolean(node.attrs.checked);
      checkbox.contentEditable = "false";

      // Prevent focus stealing / blur when clicking checkbox
      checkbox.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      });

      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      checkbox.addEventListener("change", (e) => {
        e.stopPropagation();
        const pos = this.getPos();
        if (typeof pos === "number") {
          const isChecked = (e.target as HTMLInputElement).checked;
          const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
            ...this.node.attrs,
            checked: isChecked,
          });
          this.view.dispatch(tr);
        }
      });

      checkboxContainer.appendChild(checkbox);
      this.dom.appendChild(checkboxContainer);

      const content = document.createElement("div");
      content.className = "task-content";
      this.dom.appendChild(content);
      this.contentDOM = content;
    } else {
      this.contentDOM = this.dom;
    }
  }

  update(node: Node): boolean {
    if (node.type !== this.node.type) return false;

    const wasTask = this.node.attrs.checked != null;
    const isTask = node.attrs.checked != null;
    if (wasTask !== isTask) return false;

    this.node = node;
    if (isTask) {
      this.dom.setAttribute("data-checked", String(node.attrs.checked));
      const cb = this.dom.querySelector<HTMLInputElement>("input.task-checkbox");
      if (cb) {
        cb.checked = Boolean(node.attrs.checked);
      }
    }
    return true;
  }
}

export const taskListItemPlugin = $prose(() =>
  new Plugin({
    props: {
      nodeViews: {
        list_item: (node, view, getPos) =>
          new TaskListItemNodeView(node, view, getPos as () => number | undefined),
      },
    },
  })
);
