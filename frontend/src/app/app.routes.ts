import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/country-selector/country-selector.component')
      .then(m => m.CountrySelectorComponent)
  },
  {
    path: 'election/:countryCode/:electionType',
    loadComponent: () => import('./components/election-timeline/election-timeline.component')
      .then(m => m.ElectionTimelineComponent)
  },
  {
    path: 'civic-search',
    loadComponent: () => import('./components/civic-search/civic-search.component')
      .then(m => m.CivicSearchComponent)
  },
  {
    path: 'voter-info',
    loadComponent: () => import('./components/voter-info/voter-info.component')
      .then(m => m.VoterInfoComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
