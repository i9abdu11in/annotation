import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { AnnotationService } from '../../services/annotation.service';
import { Article } from '../../models/models';

@Component({
  selector: 'app-article-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <header class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Articles</h1>
        <a
          routerLink="/articles/new"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          New Article
        </a>
      </header>

      @if (articles().length > 0) {
        <ul class="space-y-4">
          @for (article of articles(); track article.id) {
            <li class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <h2 class="text-lg font-semibold text-gray-900 truncate">{{ article.title }}</h2>
                  <p class="text-sm text-gray-500 mt-1">
                    Created {{ formatDate(article.createdAt) }}
                  </p>
                </div>
                <div class="flex gap-2 ml-4">
                  <a
                    [routerLink]="['/articles', article.id]"
                    class="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    Open
                  </a>
                  <a
                    [routerLink]="['/articles', article.id, 'edit']"
                    class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Edit
                  </a>
                  <button
                    type="button"
                    (click)="onDelete(article.id)"
                    class="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          }
        </ul>
      } @else {
        <div class="text-center py-12">
          <p class="text-gray-500 text-lg mb-4">No articles yet</p>
          <a
            routerLink="/articles/new"
            class="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create your first article
          </a>
        </div>
      }
    </div>
  `,
})
export class ArticleListComponent {
  private articleService = inject(ArticleService);
  private annotationService = inject(AnnotationService);

  protected readonly articles = this.articleService.articles;

  protected formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  protected onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.delete(id);
      this.annotationService.deleteByArticleId(id);
    }
  }
}
