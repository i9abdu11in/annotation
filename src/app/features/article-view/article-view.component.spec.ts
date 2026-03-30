import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ArticleViewComponent } from './article-view.component';
import { ArticleService } from '../../services/article.service';
import { AnnotationService } from '../../services/annotation.service';
import { DialogService } from '../../services/dialog.service';
import { STORAGE_TOKEN } from '../../storage/storage.abstract';
import { MockStorageService } from '../../storage/mock-storage.service';
import { of } from 'rxjs';

describe('ArticleViewComponent', () => {
  let articleService: ArticleService;
  let dialogService: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArticleViewComponent],
      providers: [
        provideRouter([]),
        { provide: STORAGE_TOKEN, useClass: MockStorageService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'test-id' } },
          },
        },
      ],
    });
    articleService = TestBed.inject(ArticleService);
    dialogService = TestBed.inject(DialogService);
  });

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(ArticleViewComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('displays article not found when article does not exist', () => {
    const fixture = TestBed.createComponent(ArticleViewComponent);
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Article not found');
  });

  it('displays article title and content when article exists', () => {
    articleService.create('Test Article', 'Test content here');

    const fixture = TestBed.createComponent(ArticleViewComponent);
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Test Article');
  });

  it('calls dialogService.open when annotationRequest is emitted', () => {
    const article = articleService.create('Test', 'Hello World');
    const openSpy = vi.spyOn(dialogService, 'open');

    const fixture = TestBed.createComponent(ArticleViewComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    (component as any)['onRequest']({ startOffset: 0, endOffset: 5, selectedText: 'Hello' }, article.id);

    expect(openSpy).toHaveBeenCalledWith({
      articleId: article.id,
      startOffset: 0,
      endOffset: 5,
      selectedText: 'Hello',
    });
  });

  it('annotatedHtml returns sanitized HTML with annotation spans', () => {
    const article = articleService.create('Test', 'Hello World');
    const annotationService = TestBed.inject(AnnotationService);
    annotationService.add({
      articleId: article.id,
      startOffset: 0,
      endOffset: 5,
      color: 'yellow',
      note: 'Test note',
    });

    const fixture = TestBed.createComponent(ArticleViewComponent);
    fixture.detectChanges();

    const html = (fixture.componentInstance as any)['annotatedHtml']();
    expect(html).toBeTruthy();
    expect(html.toString()).toContain('data-annotation-id');
    expect(html.toString()).toContain('decoration-yellow-400');
  });
});
