import { Routes } from '@angular/router';
import { ProduitsComponent } from './pages/produits/produits.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HistoriqueComponent } from './pages/historique/historique.component';

export const routes: Routes = [
  { path: '', redirectTo: 'produits', pathMatch: 'full' },
  { path: 'produits', component: ProduitsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'historique', component: HistoriqueComponent}
];