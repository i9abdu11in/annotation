import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ArticleService } from '../../services/article.service';
import { AnnotationService } from '../../services/annotation.service';
import { DialogService } from '../../services/dialog.service';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { TooltipHostDirective } from '../../shared/directives/tooltip-host.directive';
import { AnnotationDialogComponent } from '../annotation-dialog/annotation-dialog.component';

@Component({
  selector: 'app-article-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    HighlightDirective,
    TooltipHostDirective,
    AnnotationDialogComponent,
  ],
  template: `
    @if (article(); as a) {
      <article class="max-w-3xl mx-auto p-6">
        <header class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">{{ a.title }}</h1>
          <nav class="flex gap-3">
            <a
              routerLink="/articles"
              class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Back
            </a>
            <a
              [routerLink]="['/articles', a.id, 'edit']"
              class="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              Edit
            </a>
          </nav>
        </header>
        <section
          appHighlight
          appTooltipHost
          (annotationRequest)="onRequest($event, a.id)"
          [innerHTML]="annotatedHtml()"
          class="leading-relaxed whitespace-pre-wrap select-text cursor-text bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        ></section>
      </article>
      <app-annotation-dialog />
    } @else {
      <div class="max-w-3xl mx-auto p-6">
        <p class="text-gray-500 text-center py-12">Article not found.</p>
        <a
          routerLink="/articles"
          class="inline-block mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          Back to articles
        </a>
      </div>
    }
  `,
})
export class ArticleViewComponent {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private annotationService = inject(AnnotationService);
  private dialogService = inject(DialogService);
  private sanitizer = inject(DomSanitizer);

  private readonly articleId = signal<string>('');

  protected readonly article = computed(() =>
    this.articleService.getById(this.articleId()),
  );

  protected readonly annotatedHtml = computed(() => {
    const a = this.article();
    if (!a) return '';
    const html = this.annotationService.buildHtml(
      a.content,
      this.annotationService.forArticle(a.id),
    );
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.articleId.set(id);
    }
  }

  protected onRequest(
    req: { startOffset: number; endOffset: number; selectedText: string },
    articleId: string,
  ): void {
    this.dialogService.open({ ...req, articleId });
  }
}
