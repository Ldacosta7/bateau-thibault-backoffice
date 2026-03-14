import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { Chart } from 'chart.js/auto';
import { DashboardService, KpiTrimestre } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, MatSelectModule, MatCardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('barChart') barChartRef!: ElementRef;
  private chart: Chart | null = null;

  anneeSelectionnee = 2025;
  annees = [2025, 2024, 2023];

  caTotal = 0;
  margeAnnuelle = 0;
  impotPrevisionnel = 0;
  valeurStock = 0;
  top3: { nom: string; total: number }[] = [];
  rupturesStock: { nom: string; stock: number }[] = [];
  tauxInvendus: { categorie: string; taux: number }[] = [];
  trimestres: KpiTrimestre[] = [];
  confettisActifs = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.chargerKpis();
  }

  ngAfterViewInit(): void {
  setTimeout(() => {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.creerGraphique();
  }, 100);
}

  charger(): void {
    this.chargerKpis();
    this.mettreAJourGraphique();
  }

  chargerKpis(): void {
  const annee = this.anneeSelectionnee;
  this.caTotal = this.dashboardService.getCATotal(annee);
  this.margeAnnuelle = this.dashboardService.getMargeAnnuelle(annee);
  this.impotPrevisionnel = this.dashboardService.getImpotPrevisionnel(annee);
  this.valeurStock = this.dashboardService.getValeurStock();
  this.top3 = this.dashboardService.getTop3Vendus();
  this.rupturesStock = this.dashboardService.getProduitsSousSeuilStock(5);
  this.tauxInvendus = this.dashboardService.getTauxInvendusParCategorie();
  this.trimestres = this.dashboardService.getCAParTrimestre(annee);
  this.confettisActifs = this.trimestres.some(t => t.confettis);

  
}

  creerGraphique(): void {
  if (!this.barChartRef?.nativeElement) return;
  if (this.chart) {
    this.chart.destroy();
    this.chart = null;
  }
  const mois = this.dashboardService.getCAParMois(this.anneeSelectionnee);
  this.chart = new Chart(this.barChartRef.nativeElement, {
    type: 'bar',
    data: {
      labels: mois.map(m => m.label),
      datasets: [
        { label: "Chiffre d'affaires (€)", data: mois.map(m => m.chiffreAffaires), backgroundColor: '#1a73e8' },
        { label: 'Marge (€)', data: mois.map(m => m.marge), backgroundColor: '#34a853' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

  mettreAJourGraphique(): void {
    if (!this.chart) return;
    const mois = this.dashboardService.getCAParMois(this.anneeSelectionnee);
    this.chart.data.datasets[0].data = mois.map(m => m.chiffreAffaires);
    this.chart.data.datasets[1].data = mois.map(m => m.marge);
    this.chart.update();
  }

  getLabelCategorie(cat: string): string {
    const map: Record<string, string> = {
      'poisson': 'Poissons', 'fruit-de-mer': 'Fruits de mer', 'crustace': 'Crustacés'
    };
    return map[cat] || cat;
  }
}