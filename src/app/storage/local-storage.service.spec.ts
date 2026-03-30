import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageService } from './local-storage.service';
import { Article, Annotation } from '../models/models';

function makeLocalStorageMock(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  } as Storage;
}

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    vi.stubGlobal('localStorage', makeLocalStorageMock());
    service = new LocalStorageService();
  });

  it('getArticles() returns empty array when nothing in storage', () => {
    expect(service.getArticles()).toEqual([]);
  });

  it('getAnnotations() returns empty array when nothing in storage', () => {
    expect(service.getAnnotations()).toEqual([]);
  });

  it('saveArticles() + getArticles() round-trip returns same data', () => {
    const articles: Article[] = [
      { id: '1', title: 'Test', content: 'Hello', createdAt: 1000, updatedAt: 2000 },
    ];
    service.saveArticles(articles);
    expect(service.getArticles()).toEqual(articles);
  });

  it('saveAnnotations() + getAnnotations() round-trip returns same data', () => {
    const annotations: Annotation[] = [
      {
        id: 'a1',
        articleId: '1',
        startOffset: 0,
        endOffset: 5,
        color: 'yellow',
        note: 'Nice',
        createdAt: 1000,
      },
    ];
    service.saveAnnotations(annotations);
    expect(service.getAnnotations()).toEqual(annotations);
  });

  it('getArticles() returns [] when localStorage has invalid JSON', () => {
    localStorage.setItem('annotation:articles', '{invalid json}');
    expect(service.getArticles()).toEqual([]);
  });
});
