import { Injectable, inject, signal } from '@angular/core';
import { STORAGE_TOKEN } from '../storage/storage.abstract';
import { Annotation, ANNOTATION_COLORS } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private readonly storage = inject(STORAGE_TOKEN);
  private readonly _annotations = signal<Annotation[]>(this.storage.getAnnotations());
  readonly annotations = this._annotations.asReadonly();

  forArticle(articleId: string): Annotation[] {
    return this._annotations().filter(a => a.articleId === articleId);
  }

  add(annotation: Omit<Annotation, 'id' | 'createdAt'>): Annotation {
    const full: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    this._annotations.update(list => [...list, full]);
    this.persist();
    return full;
  }

  delete(id: string): void {
    this._annotations.update(list => list.filter(a => a.id !== id));
    this.persist();
  }

  deleteByArticleId(articleId: string): void {
    this._annotations.update(list => list.filter(a => a.articleId !== articleId));
    this.persist();
  }

  private persist(): void {
    this.storage.saveAnnotations(this._annotations());
  }

  buildHtml(content: string, annotations: Annotation[]): string {
    return buildHtml(content, annotations);
  }
}

export function buildHtml(content: string, annotations: Annotation[]): string {
  if (!content) return '';
  if (annotations.length === 0) return escapeHtml(content);

  // Collect all boundary points (start and end offsets)
  const boundaries = new Set<number>();
  boundaries.add(0);
  boundaries.add(content.length);

  for (const ann of annotations) {
    boundaries.add(ann.startOffset);
    boundaries.add(ann.endOffset);
  }

  // Sort boundaries to create atomic segments
  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

  // Build HTML by processing each atomic segment
  const parts: string[] = [];

  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const segStart = sortedBoundaries[i];
    const segEnd = sortedBoundaries[i + 1];
    const segText = escapeHtml(content.slice(segStart, segEnd));

    // Find all annotations that cover this segment
    const coveringAnnotations = annotations.filter(
      ann => ann.startOffset <= segStart && ann.endOffset >= segEnd
    );

    if (coveringAnnotations.length === 0) {
      // No annotations - plain text
      parts.push(segText);
    } else if (coveringAnnotations.length === 1) {
      // Single annotation - simple span
      const ann = coveringAnnotations[0];
      const colorEntry = ANNOTATION_COLORS.find(c => c.value === ann.color);
      const cls = colorEntry ? colorEntry.underline : '';
      parts.push(
        `<span data-annotation-id="${escapeHtml(ann.id)}" ` +
        `class="underline decoration-2 cursor-pointer ${cls}">${segText}</span>`
      );
    } else {
      // Multiple overlapping annotations - nested spans
      // Sort by endOffset descending to create proper nesting
      const sorted = [...coveringAnnotations].sort((a, b) => b.endOffset - a.endOffset);

      let nestedHtml = segText;
      for (const ann of sorted) {
        const colorEntry = ANNOTATION_COLORS.find(c => c.value === ann.color);
        const cls = colorEntry ? colorEntry.underline : '';
        nestedHtml =
          `<span data-annotation-id="${escapeHtml(ann.id)}" ` +
          `class="underline decoration-2 cursor-pointer ${cls}">${nestedHtml}</span>`;
      }
      parts.push(nestedHtml);
    }
  }

  return parts.join('');
}

export function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
