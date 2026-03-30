import { InjectionToken } from '@angular/core';
import { Article, Annotation } from '../models/models';

export abstract class IStorageService {
  abstract getArticles(): Article[];
  abstract saveArticles(articles: Article[]): void;
  abstract getAnnotations(): Annotation[];
  abstract saveAnnotations(annotations: Annotation[]): void;
}

export const STORAGE_TOKEN = new InjectionToken<IStorageService>('IStorageService');
