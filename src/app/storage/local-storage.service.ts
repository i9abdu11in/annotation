import { Injectable } from '@angular/core';
import { IStorageService } from './storage.abstract';
import { Article, Annotation } from '../models/models';

const ARTICLES_KEY = 'annotation:articles';
const ANNOTATIONS_KEY = 'annotation:annotations';

@Injectable({ providedIn: 'root' })
export class LocalStorageService extends IStorageService {
  getArticles(): Article[] {
    return this.parse<Article[]>(localStorage.getItem(ARTICLES_KEY)) ?? [];
  }

  saveArticles(articles: Article[]): void {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  }

  getAnnotations(): Annotation[] {
    return this.parse<Annotation[]>(localStorage.getItem(ANNOTATIONS_KEY)) ?? [];
  }

  saveAnnotations(annotations: Annotation[]): void {
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(annotations));
  }

  private parse<T>(raw: string | null): T | null {
    if (!raw) return null;
    try { return JSON.parse(raw) as T; }
    catch { return null; }
  }
}
