import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { ArticleFormComponent } from './article-form.component';
import { ArticleService } from '../../services/article.service';
import { AnnotationService } from '../../services/annotation.service';
import { STORAGE_TOKEN } from '../../storage/storage.abstract';
import { MockStorageService } from '../../storage/mock-storage.service';

describe('ArticleFormComponent', () => {
  let articleService: ArticleService;
  let router: Router;

  describe('create mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ArticleFormComponent],
        providers: [
          provideRouter([]),
          { provide: STORAGE_TOKEN, useClass: MockStorageService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: () => null } },
            },
          },
        ],
      });
      articleService = TestBed.inject(ArticleService);
      router = TestBed.inject(Router);
    });

    it('creates successfully in create mode', () => {
      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('shows create mode title when not in edit mode', () => {
      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Create Article');
    });

    it('form has required validators for title and content', () => {
      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      expect(component['form'].get('title')?.hasValidator(Validators.required)).toBe(true);
      expect(component['form'].get('content')?.hasValidator(Validators.required)).toBe(true);
    });

    it('form is invalid when empty', () => {
      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance['form'].valid).toBe(false);
    });

    it('form becomes valid when filled', () => {
      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      component['form'].patchValue({ title: 'Test', content: 'Content' });

      expect(component['form'].valid).toBe(true);
    });

    it('navigates to /articles after successful create', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      component['form'].patchValue({ title: 'New Article', content: 'New content' });
      component['onSubmit']();

      expect(navigateSpy).toHaveBeenCalledWith(['/articles']);
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ArticleFormComponent],
        providers: [
          provideRouter([]),
          { provide: STORAGE_TOKEN, useClass: MockStorageService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: (key: string) => key === 'id' ? 'test-article-id' : null } },
            },
          },
        ],
      });
      articleService = TestBed.inject(ArticleService);
      router = TestBed.inject(Router);
    });

    it('shows edit mode title when in edit mode', () => {
      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Edit Article');
    });

    it('shows warning about clearing annotations', () => {
      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Saving will clear all annotations');
    });

    it('loads existing article data into form', () => {
      const article = articleService.create('Original Title', 'Original Content');

      TestBed.overrideProvider(ActivatedRoute, {
        useValue: {
          snapshot: { paramMap: { get: (key: string) => key === 'id' ? article.id : null } },
        },
      });

      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      expect(component['form'].value.title).toBe('Original Title');
      expect(component['form'].value.content).toBe('Original Content');
    });

    it('calls update and deleteByArticleId on submit', () => {
      const annotationService = TestBed.inject(AnnotationService);
      const article = articleService.create('Original', 'Content');

      const updateSpy = vi.spyOn(articleService, 'update');
      const deleteAnnotationsSpy = vi.spyOn(annotationService, 'deleteByArticleId');

      TestBed.overrideProvider(ActivatedRoute, {
        useValue: {
          snapshot: { paramMap: { get: (key: string) => key === 'id' ? article.id : null } },
        },
      });

      const fixture = TestBed.createComponent(ArticleFormComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      component['form'].patchValue({ title: 'Updated Title', content: 'Updated Content' });
      component['onSubmit']();

      expect(updateSpy).toHaveBeenCalledWith(article.id, {
        title: 'Updated Title',
        content: 'Updated Content',
      });
      expect(deleteAnnotationsSpy).toHaveBeenCalledWith(article.id);
    });
  });
});
