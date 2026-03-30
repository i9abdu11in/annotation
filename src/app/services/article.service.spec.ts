import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArticleService } from './article.service';
import { STORAGE_TOKEN } from '../storage/storage.abstract';
import { MockStorageService } from '../storage/mock-storage.service';

describe('ArticleService', () => {
  let service: ArticleService;
  let storage: MockStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArticleService,
        { provide: STORAGE_TOKEN, useClass: MockStorageService },
      ],
    });
    service = TestBed.inject(ArticleService);
    storage = TestBed.inject(STORAGE_TOKEN) as MockStorageService;
  });

  it('create() adds article to signal and returns the article', () => {
    const article = service.create('Test Title', 'Test Content');

    expect(article.title).toBe('Test Title');
    expect(article.content).toBe('Test Content');
    expect(article.id).toBeTruthy();
    expect(article.createdAt).toBeGreaterThan(0);
    expect(article.updatedAt).toBeGreaterThan(0);
    expect(service.articles()).toContain(article);
  });

  it('getById() returns the article by id', () => {
    const created = service.create('Find Me', 'Content here');

    const found = service.getById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.title).toBe('Find Me');
  });

  it('getById() returns undefined for unknown id', () => {
    const result = service.getById('non-existent-id');

    expect(result).toBeUndefined();
  });

  it('update() modifies title and content, and updates updatedAt', async () => {
    const article = service.create('Original Title', 'Original Content');
    const originalUpdatedAt = article.updatedAt;

    // Small delay to ensure updatedAt changes
    await new Promise(resolve => setTimeout(resolve, 1));

    service.update(article.id, { title: 'New Title', content: 'New Content' });

    const updated = service.getById(article.id);
    expect(updated?.title).toBe('New Title');
    expect(updated?.content).toBe('New Content');
    expect(updated?.updatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  it('delete() removes article from signal', () => {
    const article = service.create('To Delete', 'Will be gone');

    service.delete(article.id);

    expect(service.articles().find(a => a.id === article.id)).toBeUndefined();
    expect(service.getById(article.id)).toBeUndefined();
  });

  it('signal reactivity: articles() signal includes new article after create()', () => {
    expect(service.articles()).toHaveLength(0);

    const article = service.create('Signal Test', 'Reactive content');

    const articlesAfter = service.articles();
    expect(articlesAfter).toHaveLength(1);
    expect(articlesAfter[0].id).toBe(article.id);
  });

  it('persistence: create() calls storage.saveArticles() with the new article', () => {
    const saveSpy = vi.spyOn(storage, 'saveArticles');

    service.create('Persisted Article', 'Saved to storage');

    expect(saveSpy).toHaveBeenCalledOnce();
    const savedArticles = saveSpy.mock.calls[0][0];
    expect(savedArticles).toHaveLength(1);
    expect(savedArticles[0].title).toBe('Persisted Article');
  });

  it('persistence: update() calls storage.saveArticles() with updated data', () => {
    const article = service.create('Original', 'Content');
    const saveSpy = vi.spyOn(storage, 'saveArticles');

    service.update(article.id, { title: 'Updated', content: 'New content' });

    expect(saveSpy).toHaveBeenCalledOnce();
    const savedArticles = saveSpy.mock.calls[0][0];
    expect(savedArticles[0].title).toBe('Updated');
  });

  it('persistence: delete() calls storage.saveArticles() with article removed', () => {
    const article = service.create('To Delete', 'Content');
    const saveSpy = vi.spyOn(storage, 'saveArticles');

    service.delete(article.id);

    expect(saveSpy).toHaveBeenCalledOnce();
    const savedArticles = saveSpy.mock.calls[0][0];
    expect(savedArticles).toHaveLength(0);
  });

  it('update() with unknown id: signal remains unchanged and saveArticles is still called', () => {
    service.create('Existing Article', 'Content');
    const saveSpy = vi.spyOn(storage, 'saveArticles');
    const lengthBefore = service.articles().length;
    const articlesBefore = service.articles();

    service.update('non-existent-id', { title: 'Ghost', content: 'Nowhere' });

    expect(service.articles()).toHaveLength(lengthBefore);
    expect(service.articles()).toEqual(articlesBefore);
    expect(saveSpy).toHaveBeenCalledOnce();
  });

  it('delete() with unknown id: signal remains unchanged and saveArticles is still called', () => {
    service.create('Existing Article', 'Content');
    const saveSpy = vi.spyOn(storage, 'saveArticles');
    const lengthBefore = service.articles().length;

    service.delete('non-existent-id');

    expect(service.articles()).toHaveLength(lengthBefore);
    expect(saveSpy).toHaveBeenCalledOnce();
  });

  it('articles signal is readonly', () => {
    // articles should be a readonly signal (no set/update methods)
    const articlesSignal = service.articles;
    expect(typeof (articlesSignal as unknown as Record<string, unknown>)['set']).toBe('undefined');
    expect(typeof (articlesSignal as unknown as Record<string, unknown>)['update']).toBe('undefined');
  });
});
