import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ArticleListComponent } from './article-list.component';
import { ArticleService } from '../../services/article.service';
import { AnnotationService } from '../../services/annotation.service';
import { STORAGE_TOKEN } from '../../storage/storage.abstract';
import { MockStorageService } from '../../storage/mock-storage.service';

describe('ArticleListComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArticleListComponent],
      providers: [
        provideRouter([]),
        { provide: STORAGE_TOKEN, useClass: MockStorageService },
      ],
    });
  });

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(ArticleListComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('displays empty state when no articles', () => {
    const fixture = TestBed.createComponent(ArticleListComponent);
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('No articles yet');
    expect(content).toContain('Create your first article');
  });

  it('displays articles list when articles exist', () => {
    const articleService = TestBed.inject(ArticleService);
    articleService.create('Test Article', 'Test content here');

    const fixture = TestBed.createComponent(ArticleListComponent);
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Test Article');
  });

  it('delete button calls both articleService.delete and annotationService.deleteByArticleId', () => {
    const articleService = TestBed.inject(ArticleService);
    const annotationService = TestBed.inject(AnnotationService);

    const article = articleService.create('To Delete', 'Content');
    annotationService.add({
      articleId: article.id,
      startOffset: 0,
      endOffset: 4,
      color: 'yellow',
      note: 'Test',
    });

    const deleteArticleSpy = vi.spyOn(articleService, 'delete');
    const deleteAnnotationsSpy = vi.spyOn(annotationService, 'deleteByArticleId');

    // Mock confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const fixture = TestBed.createComponent(ArticleListComponent);
    fixture.detectChanges();

    // Find delete button by text content
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const deleteButton = Array.from(buttons).find((btn) =>
      btn.textContent?.includes('Delete')
    );
    deleteButton?.click();

    expect(deleteArticleSpy).toHaveBeenCalledWith(article.id);
    expect(deleteAnnotationsSpy).toHaveBeenCalledWith(article.id);

    vi.restoreAllMocks();
  });
});
