import { describe, it, expect, beforeEach } from 'vitest';
import { DialogService, AnnotationRequest } from './dialog.service';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    service = new DialogService();
  });

  it('open() emits annotation request', () => {
    const request: AnnotationRequest = {
      articleId: 'article-1',
      startOffset: 0,
      endOffset: 5,
      selectedText: 'Hello',
    };

    let emitted: AnnotationRequest | null = null;
    service.events$.subscribe((req) => {
      emitted = req;
    });

    service.open(request);

    expect(emitted).toEqual(request);
  });

  it('close() emits null', () => {
    let emitted: unknown = 'initial';
    service.events$.subscribe((req) => {
      emitted = req;
    });

    service.close();

    expect(emitted).toBeNull();
  });

  it('multiple open/close calls emit correct values in order', () => {
    const emissions: (AnnotationRequest | null)[] = [];
    service.events$.subscribe((req) => {
      emissions.push(req);
    });

    const req1: AnnotationRequest = { articleId: 'a1', startOffset: 0, endOffset: 5, selectedText: 'Hello' };
    const req2: AnnotationRequest = { articleId: 'a1', startOffset: 10, endOffset: 15, selectedText: 'World' };

    service.open(req1);
    service.close();
    service.open(req2);
    service.close();

    expect(emissions).toHaveLength(4);
    expect(emissions[0]).toEqual(req1);
    expect(emissions[1]).toBeNull();
    expect(emissions[2]).toEqual(req2);
    expect(emissions[3]).toBeNull();
  });
});
