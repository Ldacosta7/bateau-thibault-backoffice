import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HistoriqueComponent } from './pages/historique/historique.component';
import { ProduitsComponent } from './pages/produits/produits.component';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthInterceptor } from './core/services/interceptor';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HistoriqueComponent,
    ProduitsComponent    
  ],
  imports: [
    NavbarComponent,
    BrowserModule,
    CommonModule, 
    RouterModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    CommonModule,
    HttpClientModule
  ],
  providers: [DecimalPipe,
    {
      provide:  HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi:    true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
