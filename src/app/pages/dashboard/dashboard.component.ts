import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe, NgFor, NgIf } from '@angular/common';
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
  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('groupedChart') groupedChartRef!: ElementRef;

  private charts: Chart[] = [];

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
    setTimeout(() => this.creerTousLesGraphiques(), 100);
  }

  charger(): void {
    this.chargerKpis();
    this.detruireTousLesGraphiques();
    setTimeout(() => this.creerTousLesGraphiques(), 100);
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

  detruireTousLesGraphiques(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  creerTousLesGraphiques(): void {
  console.log('pieRef:', this.pieChartRef);
  console.log('groupedRef:', this.groupedChartRef);
  this.creerGraphiqueBarres();
  this.creerGraphiqueCamembert();
  this.creerGraphiqueGrouped();
}

  creerGraphiqueBarres(): void {
    if (!this.barChartRef?.nativeElement) return;
    const mois = this.dashboardService.getCAParMois(this.anneeSelectionnee);
    const chart = new Chart(this.barChartRef.nativeElement, {
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
    this.charts.push(chart);
  }

  creerGraphiqueCamembert(): void {
    if (!this.pieChartRef?.nativeElement) return;
    const data = this.dashboardService.getCAParCategorie(this.anneeSelectionnee);
    const chart = new Chart(this.pieChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Poissons', 'Fruits de mer', 'Crustacés'],
        datasets: [{
          data: data.map(d => d.ca),
          backgroundColor: ['#1a73e8', '#34a853', '#fa7b17'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label} : ${ctx.parsed.toLocaleString('fr-FR')} €`
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  creerGraphiqueGrouped(): void {
    if (!this.groupedChartRef?.nativeElement) return;
    const data = this.dashboardService.getVentesVsInvendusParCategorie(this.anneeSelectionnee);
    const chart = new Chart(this.groupedChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Poissons', 'Fruits de mer', 'Crustacés'],
        datasets: [
          { label: 'Ventes (unités)', data: data.map(d => d.ventes), backgroundColor: '#34a853' },
          { label: 'Invendus (unités)', data: data.map(d => d.invendus), backgroundColor: '#e53935' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      }
    });
    this.charts.push(chart);
  }

  getLabelCategorie(cat: string): string {
    const map: Record<string, string> = {
      'poisson': 'Poissons', 'fruit-de-mer': 'Fruits de mer', 'crustace': 'Crustacés'
    };
    return map[cat] || cat;
  }
}