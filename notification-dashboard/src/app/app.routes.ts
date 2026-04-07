import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Notification Dashboard',
  },
  {
    path: 'timeline/:requestId',
    loadComponent: () =>
      import('./features/timeline/timeline.component').then((m) => m.TimelineComponent),
    title: 'Request Timeline',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
