import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { STORAGE_TOKEN } from './storage/storage.abstract';
import { LocalStorageService } from './storage/local-storage.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: STORAGE_TOKEN, useClass: LocalStorageService },
  ],
};
