import { provideHttpClient } from '@angular/common/http';
import { type ApplicationConfig } from '@angular/core';
import { provideRouter, type Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'projects',
    loadChildren: () => import('./project.routes').then((module) => module.PROJECT_ROUTES),
  },
];
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideRouter(APP_ROUTES)],
};
