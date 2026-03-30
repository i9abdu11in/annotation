import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnnotationService, buildHtml } from './annotation.service';
import { STORAGE_TOKEN } from '../storage/storage.abstract';
import { MockStorageService } from '../storage/mock-storage.service';
import { Annotation } from '../models/models';

function makeAnnotation(
  overrides: Partial<Omit<Annotation, 'id' | 'createdAt'>> = {},
): Omit<Annotation, 'id' | 'createdAt'> {
  return {
    articleId: 'article-1',
    startOffset: 0,
    endOffset: 5,
    color: 'yellow',
    note: 'Test note',
    ...overrides,
  };
}

describe('AnnotationService', () => {
  let service: AnnotationService;
  let storage: MockStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnnotationService,
        { provide: STORAGE_TOKEN, useClass: MockStorageService },
      ],
    });
    service = TestBed.inject(AnnotationService);
    storage = TestBed.inject(STORAGE_TOKEN) as MockStorageService;
  });

  it('add() adds annotation to signal and returns the annotation with generated id and createdAt', () => {
    const input = makeAnnotation();
    const result = service.add(input);

    expect(result.articleId).toBe('article-1');
    expect(result.startOffset).toBe(0);
    expect(result.endOffset).toBe(5);
    expect(result.color).toBe('yellow');
    expect(result.note).toBe('Test note');
    expect(result.id).toBeTruthy();
    expect(result.createdAt).toBeGreaterThan(0);
    expect(service.annotations()).toContain(result);
  });

  it('forArticle() returns only annotations for the given articleId', () => {
    const a1 = service.add(makeAnnotation({ articleId: 'article-1' }));
    const a2 = service.add(makeAnnotation({ articleId: 'article-1', startOffset: 10, endOffset: 15 }));
    service.add(makeAnnotation({ articleId: 'article-2' }));

    const result = service.forArticle('article-1');

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(a1);
    expect(result).toContainEqual(a2);
  });

  it('forArticle() returns empty array when no annotations match', () => {
    service.add(makeAnnotation({ articleId: 'article-1' }));

    const result = service.forArticle('article-999');

    expect(result).toEqual([]);
  });

  it('delete() removes annotation by id', () => {
    const ann = service.add(makeAnnotation());

    service.delete(ann.id);

    expect(service.annotations().find((a: Annotation) => a.id === ann.id)).toBeUndefined();
  });

  it('deleteByArticleId() removes all annotations for a given articleId', () => {
    service.add(makeAnnotation({ articleId: 'article-1' }));
    service.add(makeAnnotation({ articleId: 'article-1', startOffset: 10, endOffset: 20 }));

    service.deleteByArticleId('article-1');

    expect(service.forArticle('article-1')).toHaveLength(0);
  });

  it('deleteByArticleId() leaves annotations for other articles intact', () => {
    service.add(makeAnnotation({ articleId: 'article-1' }));
    const other = service.add(makeAnnotation({ articleId: 'article-2' }));

    service.deleteByArticleId('article-1');

    const remaining = service.annotations();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(other.id);
  });

  it('signal reactivity: after add(), annotations() includes the new annotation', () => {
    expect(service.annotations()).toHaveLength(0);

    const ann = service.add(makeAnnotation());

    const annotationsAfter = service.annotations();
    expect(annotationsAfter).toHaveLength(1);
    expect(annotationsAfter[0].id).toBe(ann.id);
  });

  it('persistence: add() calls storage.saveAnnotations()', () => {
    const saveSpy = vi.spyOn(storage, 'saveAnnotations');

    service.add(makeAnnotation());

    expect(saveSpy).toHaveBeenCalledOnce();
    const savedAnnotations = saveSpy.mock.calls[0][0];
    expect(savedAnnotations).toHaveLength(1);
    expect(savedAnnotations[0].note).toBe('Test note');
  });

  it('persistence: delete() calls storage.saveAnnotations()', () => {
    const ann = service.add(makeAnnotation());
    const saveSpy = vi.spyOn(storage, 'saveAnnotations');

    service.delete(ann.id);

    expect(saveSpy).toHaveBeenCalledOnce();
    const savedAnnotations = saveSpy.mock.calls[0][0];
    expect(savedAnnotations).toHaveLength(0);
  });

  it('persistence: deleteByArticleId() calls storage.saveAnnotations()', () => {
    service.add(makeAnnotation({ articleId: 'article-1' }));
    service.add(makeAnnotation({ articleId: 'article-1', startOffset: 5, endOffset: 10 }));
    const saveSpy = vi.spyOn(storage, 'saveAnnotations');

    service.deleteByArticleId('article-1');

    expect(saveSpy).toHaveBeenCalledOnce();
    const savedAnnotations = saveSpy.mock.calls[0][0];
    expect(savedAnnotations).toHaveLength(0);
  });

  it('exposes a readonly annotations signal', () => {
    expect((service.annotations as unknown as { set?: unknown }).set).toBeUndefined();
    expect((service.annotations as unknown as { update?: unknown }).update).toBeUndefined();
  });

  it('delete() with unknown id leaves signal unchanged', () => {
    service.add(makeAnnotation());
    const before = service.annotations().length;
    const saveSpy = vi.spyOn(storage, 'saveAnnotations');
    service.delete('non-existent-id');
    expect(service.annotations().length).toBe(before);
    expect(saveSpy).toHaveBeenCalledOnce();
  });

  it('instance method buildHtml delegates to the exported function', () => {
    const ann = TestBed.runInInjectionContext(() => service.add(makeAnnotation({ startOffset: 0, endOffset: 5 })));
    const html = service.buildHtml('Hello World', [ann]);
    expect(html).toContain('data-annotation-id');
    expect(html).toContain('Hello');
  });
});

function makeBuildAnnotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 'ann-1',
    articleId: 'a-1',
    startOffset: 0,
    endOffset: 5,
    color: 'yellow' as const,
    note: 'test',
    createdAt: 0,
    ...overrides,
  };
}

describe('buildHtml', () => {
  it('returns empty string for empty content', () => {
    expect(buildHtml('', [])).toBe('');
  });

  it('returns escaped plain text when no annotations', () => {
    expect(buildHtml('Hello <World>', [])).toBe('Hello &lt;World&gt;');
  });

  it('wraps a single annotation in a span with data-annotation-id', () => {
    const ann = makeBuildAnnotation({ id: 'ann-1', startOffset: 0, endOffset: 5 });
    const html = buildHtml('Hello World', [ann]);
    expect(html).toContain('data-annotation-id="ann-1"');
    expect(html).toContain('Hello');
    expect(html).toContain(' World');
  });

  it('applies the correct Tailwind underline class for the annotation color', () => {
    const ann = makeBuildAnnotation({ color: 'green', startOffset: 0, endOffset: 5 });
    const html = buildHtml('Hello World', [ann]);
    expect(html).toContain('decoration-green-400');
  });

  it('handles annotation at the end of text', () => {
    const ann = makeBuildAnnotation({ startOffset: 6, endOffset: 11 });
    const html = buildHtml('Hello World', [ann]);
    expect(html).toMatch(/^Hello /);
    expect(html).toContain('data-annotation-id');
  });

  it('handles multiple non-overlapping annotations', () => {
    const a1 = makeBuildAnnotation({ id: 'a1', startOffset: 0, endOffset: 5 });
    const a2 = makeBuildAnnotation({ id: 'a2', startOffset: 6, endOffset: 11 });
    const html = buildHtml('Hello World', [a1, a2]);
    expect(html).toContain('a1');
    expect(html).toContain('a2');
  });

  it('renders overlapping annotations with nested spans', () => {
    const a1 = makeBuildAnnotation({ id: 'a1', startOffset: 0, endOffset: 10, color: 'yellow' });
    const a2 = makeBuildAnnotation({ id: 'a2', startOffset: 5, endOffset: 15, color: 'green' });
    const html = buildHtml('Hello World!!!', [a1, a2]);

    // Both annotations should be present
    expect(html).toContain('a1');
    expect(html).toContain('a2');

    // Should have nested spans for the overlapping region (5-10: " Worl")
    const spanCount = (html.match(/data-annotation-id/g) ?? []).length;
    expect(spanCount).toBeGreaterThanOrEqual(4); // At least 2 for overlap region
  });

  it('handles partial overlap correctly', () => {
    // Annotation 1: "Hello World" (0-11)
    // Annotation 2: "World!!!" (6-14)
    // Expected segments: "Hello " (a1 only), "World" (a1+a2), "!!!" (a2 only)
    const a1 = makeBuildAnnotation({ id: 'a1', startOffset: 0, endOffset: 11, color: 'yellow' });
    const a2 = makeBuildAnnotation({ id: 'a2', startOffset: 6, endOffset: 14, color: 'blue' });
    const html = buildHtml('Hello World!!!', [a1, a2]);

    expect(html).toContain('a1');
    expect(html).toContain('a2');
  });

  it('handles one annotation fully inside another', () => {
    // Annotation 1: "Hello World!!!" (0-14)
    // Annotation 2: "World" (6-11) - fully inside a1
    const a1 = makeBuildAnnotation({ id: 'a1', startOffset: 0, endOffset: 14, color: 'yellow' });
    const a2 = makeBuildAnnotation({ id: 'a2', startOffset: 6, endOffset: 11, color: 'green' });
    const html = buildHtml('Hello World!!!', [a1, a2]);

    expect(html).toContain('a1');
    expect(html).toContain('a2');

    // The inner annotation should have nested span
    const spanCount = (html.match(/data-annotation-id/g) ?? []).length;
    expect(spanCount).toBeGreaterThanOrEqual(4);
  });

  it('escapes HTML special characters in content outside annotations', () => {
    const html = buildHtml('Hello & <World>', []);
    expect(html).toBe('Hello &amp; &lt;World&gt;');
  });
});
