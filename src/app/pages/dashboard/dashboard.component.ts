import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DashboardService, KpiTrimestre } from '../../core/services/dashboard.service';
import { Mouvement } from '../../core/models/mouvement.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('barChart')     barChartRef!:     ElementRef;
  @ViewChild('pieChart')     pieChartRef!:     ElementRef;
  @ViewChild('groupedChart') groupedChartRef!: ElementRef;

  private charts: Chart[] = [];
  private viewReady = false;
  private dataReady = false;

  anneeSelectionnee = 2026;
  annees = [2026, 2025, 2024, 2023];

  // KPIs affichés
  caTotal           = 0;
  margeAnnuelle     = 0;
  impotPrevisionnel = 0;
  valeurStock:   Promise<number> | undefined;
  top3:          Promise<{ nom: string; total: number }[]> | undefined;
  rupturesStock: Promise<{ nom: string; stock: number }[]> | undefined;
  tauxInvendus:  { categorie: number; taux: number }[] = [];
  trimestres:    KpiTrimestre[] = [];
  confettisActifs = false;

  // Données brutes typées
  private historiqueVente:    Mouvement[] = [];
  private historiqueAchat:    Mouvement[] = [];
  private historiqueInvendus: Mouvement[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.chargerKpis();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.dataReady) setTimeout(() => this.creerTousLesGraphiques(), 0);
  }

  async charger(): Promise<void> {
    this.detruireTousLesGraphiques();
    await this.chargerKpis();
  }

  async chargerKpis(): Promise<void> {
    this.dataReady = false;
    const annee = this.anneeSelectionnee;
    console.log(`\n[Dashboard] ── Chargement pour l'année ${annee} ──`);

    // Chargement parallèle des 3 historiques
    [this.historiqueAchat, this.historiqueVente, this.historiqueInvendus] = await Promise.all([
      this.dashboardService.getHistoriqueAchat(),
      this.dashboardService.getHistoriqueVentes(),
      this.dashboardService.getHistoriqueInvendus(),
    ]);

    console.log(`[Dashboard] Données brutes reçues :`,
      `\n  achats    : ${this.historiqueAchat.length} mouvements`,
      `\n  ventes    : ${this.historiqueVente.length} mouvements`,
      `\n  invendus  : ${this.historiqueInvendus.length} mouvements`
    );

    // ── KPIs ──────────────────────────────────────────────────────────────────
    this.caTotal           = this.computeCaTotal(annee);
    this.margeAnnuelle     = this.computeMargeAnnuelle(annee);
    this.impotPrevisionnel = this.margeAnnuelle > 0 ? this.margeAnnuelle * 0.3 : 0;
    this.trimestres        = this.computeCAParTrimestre(annee);
    this.tauxInvendus      = this.computeTauxInvendusParCategorie();
    this.confettisActifs   = this.trimestres.some(t => t.confettis);

    console.log(`[Dashboard] KPIs calculés :`,
      `\n  CA total           : ${this.caTotal} €`,
      `\n  Marge annuelle     : ${this.margeAnnuelle} €`,
      `\n  Impôt prévisionnel : ${this.impotPrevisionnel} €`,
      `\n  Trimestres         :`, this.trimestres,
      `\n  Taux invendus      :`, this.tauxInvendus
    );

    // Ces méthodes fonctionnent via firstValueFrom / produits
    this.valeurStock   = this.dashboardService.getValeurStock();
    this.top3          = this.dashboardService.getTop3Vendus(this.historiqueVente);
    this.rupturesStock = this.dashboardService.getProduitsSousSeuilStock(5);

    this.dataReady = true;
    if (this.viewReady) setTimeout(() => this.creerTousLesGraphiques(), 0);
  }

  // ─── Helpers de filtrage / agrégation ───────────────────────────────────────

  private filterByYear(list: Mouvement[], annee: number): Mouvement[] {
    return list.filter(m => new Date(m.date).getFullYear() === annee);
  }

  private filterByYearAndMonth(list: Mouvement[], annee: number, mois: number): Mouvement[] {
    return list.filter(m => {
      const d = new Date(m.date);
      return d.getFullYear() === annee && d.getMonth() === mois;
    });
  }

  private sumTotal(list: Mouvement[]): number {
    return list.reduce((s, m) => s + (m.total ?? 0), 0);
  }

  private sumQuantite(list: Mouvement[]): number {
    return list.reduce((s, m) => s + (m.quantite ?? 0), 0);
  }

  // ─── Calculs KPIs ───────────────────────────────────────────────────────────

  computeCaTotal(annee: number): number {
    const ventesAnnee = this.filterByYear(this.historiqueVente, annee);
    const ca = this.sumTotal(ventesAnnee);
    console.log(`[Dashboard] computeCaTotal(${annee}) : ${ventesAnnee.length} ventes → ${ca} €`);
    return ca;
  }

  computeMargeAnnuelle(annee: number): number {
    const ca     = this.sumTotal(this.filterByYear(this.historiqueVente, annee));
    const achats = this.sumTotal(this.filterByYear(this.historiqueAchat,  annee));
    const marge  = ca - achats;
    console.log(`[Dashboard] computeMargeAnnuelle(${annee}) : CA=${ca} € | Achats=${achats} € | Marge=${marge} €`);
    return marge;
  }

  computeCAParTrimestre(annee: number): KpiTrimestre[] {
    const trimestresMois = [
      { label: 'T1', mois: [0, 1, 2]  },
      { label: 'T2', mois: [3, 4, 5]  },
      { label: 'T3', mois: [6, 7, 8]  },
      { label: 'T4', mois: [9, 10, 11] },
    ];

    const resultats: KpiTrimestre[] = trimestresMois.map((t, i) => {
      const ventesT = this.historiqueVente.filter(m => {
        const d = new Date(m.date);
        return d.getFullYear() === annee && t.mois.includes(d.getMonth());
      });
      const achatsT = this.historiqueAchat.filter(m => {
        const d = new Date(m.date);
        return d.getFullYear() === annee && t.mois.includes(d.getMonth());
      });
      const ca    = this.sumTotal(ventesT);
      const achat = this.sumTotal(achatsT);
      const marge = ca - achat;
      console.log(`[Dashboard] ${t.label}(${annee}) : CA=${ca} € | Achats=${achat} € | Marge=${marge} €`);
      return {
        label: t.label, trimestre: i + 1, annee,
        chiffreAffaires: ca, achats: achat, marge,
        alerteNegative: false, confettis: false
      };
    });

    const benefices = resultats.map(t => Math.max(0, t.marge));
    resultats.forEach((t, i) => {
      t.alerteNegative = t.marge < 0;
      if (i >= 1) {
        const moyenne = benefices.slice(0, i).reduce((s, v) => s + v, 0) / i;
        t.confettis = t.marge > 0 && t.marge >= moyenne * 2;
      }
    });

    return resultats;
  }

  computeTauxInvendusParCategorie(): { categorie: number; taux: number }[] {
    return [0, 1, 2].map(cat => {
      const invendus = this.sumQuantite(this.historiqueInvendus.filter(m => m.categorie === cat));
      const ventes   = this.sumQuantite(this.historiqueVente.filter(m => m.categorie === cat));
      const total    = ventes + invendus;
      const taux     = total > 0 ? Math.round((invendus / total) * 100) : 0;
      console.log(`[Dashboard] TauxInvendus cat=${cat} : ventes=${ventes} | invendus=${invendus} | taux=${taux}%`);
      return { categorie: cat, taux };
    });
  }

  // ─── Données graphiques ─────────────────────────────────────────────────────

  private computeCAParMois(annee: number): { label: string; chiffreAffaires: number; marge: number }[] {
    const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const data = labels.map((label, i) => {
      const ca    = this.sumTotal(this.filterByYearAndMonth(this.historiqueVente, annee, i));
      const achat = this.sumTotal(this.filterByYearAndMonth(this.historiqueAchat,  annee, i));
      return { label, chiffreAffaires: ca, marge: ca - achat };
    });
    console.log(`[Dashboard] computeCAParMois(${annee}) :`, data);
    return data;
  }

  private computeCAParCategorie(annee: number): number[] {
    const data = [0, 1, 2].map(cat =>
      this.sumTotal(this.filterByYear(this.historiqueVente, annee).filter(m => m.categorie === cat))
    );
    console.log(`[Dashboard] computeCAParCategorie(${annee}) : [Poissons, Fruits de mer, Crustacés] =`, data);
    return data;
  }

  private computeVentesVsInvendus(annee: number): { ventes: number; invendus: number }[] {
    const data = [0, 1, 2].map(cat => ({
      ventes:   this.sumQuantite(this.filterByYear(this.historiqueVente,    annee).filter(m => m.categorie === cat)),
      invendus: this.sumQuantite(this.filterByYear(this.historiqueInvendus, annee).filter(m => m.categorie === cat)),
    }));
    console.log(`[Dashboard] computeVentesVsInvendus(${annee}) :`, data);
    return data;
  }

  // ─── Graphiques ──────────────────────────────────────────────────────────────

  detruireTousLesGraphiques(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  creerTousLesGraphiques(): void {
    console.log('[Dashboard] Création des graphiques...');
    this.detruireTousLesGraphiques();
    this.creerGraphiqueBarres();
    this.creerGraphiqueCamembert();
    this.creerGraphiqueGrouped();
  }

  creerGraphiqueBarres(): void {
    if (!this.barChartRef?.nativeElement) {
      console.warn('[Dashboard] barChartRef introuvable — graphique barres ignoré');
      return;
    }
    const mois = this.computeCAParMois(this.anneeSelectionnee);
    const chart = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: mois.map(m => m.label),
        datasets: [
          { label: "Chiffre d'affaires (€)", data: mois.map(m => m.chiffreAffaires), backgroundColor: '#1a73e8' },
          { label: 'Marge (€)',              data: mois.map(m => m.marge),            backgroundColor: '#34a853' }
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
    console.log('[Dashboard] Graphique barres créé ✓');
  }

  creerGraphiqueCamembert(): void {
    if (!this.pieChartRef?.nativeElement) {
      console.warn('[Dashboard] pieChartRef introuvable — graphique camembert ignoré');
      return;
    }
    const data = this.computeCAParCategorie(this.anneeSelectionnee);
    const chart = new Chart(this.pieChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Poissons', 'Fruits de mer', 'Crustacés'],
        datasets: [{
          data,
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
    console.log('[Dashboard] Graphique camembert créé ✓');
  }

  creerGraphiqueGrouped(): void {
    if (!this.groupedChartRef?.nativeElement) {
      console.warn('[Dashboard] groupedChartRef introuvable — graphique groupé ignoré');
      return;
    }
    const data = this.computeVentesVsInvendus(this.anneeSelectionnee);
    const chart = new Chart(this.groupedChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Poissons', 'Fruits de mer', 'Crustacés'],
        datasets: [
          { label: 'Ventes (unités)',   data: data.map(d => d.ventes),   backgroundColor: '#34a853' },
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
    console.log('[Dashboard] Graphique groupé créé ✓');
  }

  getLabelCategorie(cat: number): string {
    const map: Record<string, string> = {
      0: 'Poissons', 1: 'Fruits de mer', 2: 'Crustacés'
    };
    return map[String(cat)] || String(cat);
  }
}