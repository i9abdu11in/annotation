import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TooltipHostDirective } from './tooltip-host.directive';
import { AnnotationService } from '../../services/annotation.service';
import { Annotation } from '../../models/models';
import { STORAGE_TOKEN } from '../../storage/storage.abstract';
import { MockStorageService } from '../../storage/mock-storage.service';

const mockAnnotation: Annotation = {
  id: 'ann-1',
  articleId: 'article-1',
  startOffset: 0,
  endOffset: 5,
  color: 'yellow',
  note: 'Test note',
  createdAt: Date.now(),
};

describe('TooltipHostDirective', () => {
  let annotationService: AnnotationService;
  let annotationId = '';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnnotationService,
        { provide: STORAGE_TOKEN, useClass: MockStorageService },
      ],
    });
    annotationService = TestBed.inject(AnnotationService);
    annotationService.add({
      articleId: mockAnnotation.articleId,
      startOffset: mockAnnotation.startOffset,
      endOffset: mockAnnotation.endOffset,
      color: mockAnnotation.color,
      note: mockAnnotation.note,
    });

    annotationId = annotationService.annotations()[0]?.id ?? '';

  });

  afterEach(() => {
    if (vi.isFakeTimers()) {
      vi.useRealTimers();
    }
    document.querySelector('[role="tooltip"]')?.remove();
  });

  it('creates tooltip on mouseover annotated element', () => {
    @Component({
      template: `<div #host appTooltipHost><span data-annotation-id="${annotationId}">Hello</span></div>`,
      imports: [TooltipHostDirective],
    })
    class TestHost {
      @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;
    }

    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('[data-annotation-id]');
    span.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    const tooltip = document.querySelector('[role="tooltip"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.textContent).toContain('Test note');

    tooltip?.remove();
  });

  it('destroys tooltip on mouseout', () => {
    vi.useFakeTimers();

    @Component({
      template: `<div #host appTooltipHost><span data-annotation-id="${annotationId}">Hello</span></div>`,
      imports: [TooltipHostDirective],
    })
    class TestHost {
      @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;
    }

    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('[data-annotation-id]');

    span.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();

    span.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: null }));
    vi.runAllTimers();
    expect(document.querySelector('[role="tooltip"]')).toBeFalsy();
  });

  it('keeps tooltip visible briefly after mouseout to allow moving cursor to it', () => {
    vi.useFakeTimers();

    @Component({
      template: `<div #host appTooltipHost><span data-annotation-id="${annotationId}">Hello</span></div>`,
      imports: [TooltipHostDirective],
    })
    class TestHost {
      @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;
    }

    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('[data-annotation-id]') as HTMLElement;

    span.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();

    span.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: null }));
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();
  });
});
