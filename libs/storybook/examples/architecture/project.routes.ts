import { type Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./project-page').then((module) => module.ProjectPage) },
];
