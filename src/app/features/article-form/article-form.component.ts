import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { AnnotationService } from '../../services/annotation.service';

@Component({
  selector: 'app-article-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto p-6">
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditMode() ? 'Edit Article' : 'Create Article' }}
        </h1>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            formControlName="title"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter article title"
          />
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <p class="mt-1 text-sm text-red-600">Title is required</p>
          }
        </div>

        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            formControlName="content"
            rows="12"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter article content"
          ></textarea>
          @if (form.get('content')?.invalid && form.get('content')?.touched) {
            <p class="mt-1 text-sm text-red-600">Content is required</p>
          }
        </div>

        @if (isEditMode()) {
          <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p class="text-sm text-yellow-800">
              <strong>Note:</strong> Saving will clear all annotations for this article.
            </p>
          </div>
        }

        <div class="flex justify-end gap-3">
          <a
            routerLink="/articles"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </a>
          <button
            type="submit"
            [disabled]="form.invalid"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isEditMode() ? 'Save Changes' : 'Create Article' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ArticleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  private readonly annotationService = inject(AnnotationService);

  private readonly articleId = signal<string | null>(null);

  protected readonly isEditMode = computed(() => this.articleId() !== null);

  protected readonly form = this.fb.group({
    title: ['', { validators: [Validators.required], nonNullable: true }],
    content: ['', { validators: [Validators.required], nonNullable: true }],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.articleId.set(id);
      this.loadArticle(id);
    }
  }

  private loadArticle(id: string): void {
    const article = this.articleService.getById(id);
    if (article) {
      this.form.patchValue({
        title: article.title,
        content: article.content,
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;

    const { title, content } = this.form.getRawValue();

    if (this.isEditMode()) {
      const id = this.articleId();
      if (id) {
        this.articleService.update(id, { title: title!, content: content! });
        this.annotationService.deleteByArticleId(id);
      }
    } else {
      this.articleService.create(title!, content!);
    }

    this.router.navigate(['/articles']);
  }
}
