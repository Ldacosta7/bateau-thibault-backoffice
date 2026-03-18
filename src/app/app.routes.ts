import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProduitsComponent } from './pages/produits/produits.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HistoriqueComponent } from './pages/historique/historique.component';
import { ConnectionComponent } from './pages/connection/connection.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';

export const routes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  { path: 'produits', component: ProduitsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'historique', component: HistoriqueComponent},
  { path: 'connexion', component: ConnectionComponent},
  { path: 'inscription', component: InscriptionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }