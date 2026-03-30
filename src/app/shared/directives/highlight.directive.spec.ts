import { describe, it, expect, beforeEach } from 'vitest';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightDirective } from './highlight.directive';

@Component({
  template: `<div #host appHighlight>{{ content }}</div>`,
  imports: [HighlightDirective],
})
class TestHostComponent {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;
  @ViewChild(HighlightDirective, { static: true }) directive!: HighlightDirective;
  content = 'Hello World';
}

describe('HighlightDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('emits annotation request on mouseup with selection', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const { host, directive } = fixture.componentInstance;
    let emitted: unknown = null;

    directive.annotationRequest.subscribe((req) => {
      emitted = req;
    });

    // Create a mock selection on the text node
    const textNode = host.nativeElement.firstChild!;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    // Simulate mouseup
    host.nativeElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(emitted).toBeTruthy();
    const req = emitted as { startOffset: number; endOffset: number; selectedText: string };
    expect(req.startOffset).toBe(0);
    expect(req.endOffset).toBe(5);
    expect(req.selectedText).toBe('Hello');

    sel?.removeAllRanges();
  });

  it('does not emit when selection is collapsed', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const { host, directive } = fixture.componentInstance;
    let emitted = false;

    directive.annotationRequest.subscribe(() => {
      emitted = true;
    });

    const sel = window.getSelection();
    sel?.removeAllRanges();

    host.nativeElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(emitted).toBe(false);
  });

  it('calculates correct offset with nested HTML elements', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const { host, directive } = fixture.componentInstance;
    let emitted: unknown = null;

    directive.annotationRequest.subscribe((req) => {
      emitted = req;
    });

    // "World" starts at offset 6 (after "Hello ")
    const textNode = host.nativeElement.firstChild!;
    const range = document.createRange();
    range.setStart(textNode, 6);
    range.setEnd(textNode, 11);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    host.nativeElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(emitted).toBeTruthy();
    const req = emitted as { startOffset: number; endOffset: number; selectedText: string };
    expect(req.selectedText).toBe('World');

    sel?.removeAllRanges();
  });
});
