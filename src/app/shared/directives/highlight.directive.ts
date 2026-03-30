import { Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseup)': 'onMouseUp()',
  },
})
export class HighlightDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  annotationRequest = output<{ startOffset: number; endOffset: number; selectedText: string }>();

  onMouseUp(): void {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const container = this.el.nativeElement;
    if (!container.contains(range.commonAncestorContainer)) return;

    const start = this.getOffset(container, range.startContainer, range.startOffset);
    const end = this.getOffset(container, range.endContainer, range.endOffset);
    if (start === end) return;

    this.annotationRequest.emit({ startOffset: start, endOffset: end, selectedText: sel.toString() });
    sel.removeAllRanges();
  }

  private getOffset(container: HTMLElement, node: Node, nodeOffset: number): number {
    const r = document.createRange();
    r.setStart(container, 0);
    r.setEnd(node, nodeOffset);
    return r.toString().length;
  }
}
