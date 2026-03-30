import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'articles', pathMatch: 'full' },
  {
    path: 'articles',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/article-list/article-list.component')
            .then(m => m.ArticleListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/article-form/article-form.component')
            .then(m => m.ArticleFormComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/article-view/article-view.component')
            .then(m => m.ArticleViewComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/article-form/article-form.component')
            .then(m => m.ArticleFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'articles' },
];
