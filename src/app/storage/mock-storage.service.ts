import { Injectable } from '@angular/core';
import { IStorageService } from './storage.abstract';
import { Article, Annotation } from '../models/models';

@Injectable()
export class MockStorageService extends IStorageService {
  private articles: Article[] = [];
  private annotations: Annotation[] = [];

  getArticles(): Article[] { return [...this.articles]; }
  saveArticles(articles: Article[]): void { this.articles = [...articles]; }
  getAnnotations(): Annotation[] { return [...this.annotations]; }
  saveAnnotations(annotations: Annotation[]): void { this.annotations = [...annotations]; }
}
