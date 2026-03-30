import { Injectable, inject, signal } from '@angular/core';
import { STORAGE_TOKEN } from '../storage/storage.abstract';
import { Article } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly storage = inject(STORAGE_TOKEN);
  private readonly _articles = signal<Article[]>(this.storage.getArticles());
  readonly articles = this._articles.asReadonly();

  getById(id: string): Article | undefined {
    return this._articles().find(a => a.id === id);
  }

  create(title: string, content: string): Article {
    const a: Article = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this._articles.update(list => [...list, a]);
    this.persist();
    return a;
  }

  update(id: string, patch: Pick<Article, 'title' | 'content'>): void {
    this._articles.update(list =>
      list.map(a => a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a)
    );
    this.persist();
  }

  delete(id: string): void {
    this._articles.update(list => list.filter(a => a.id !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.saveArticles(this._articles());
  }
}
