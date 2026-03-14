import { Injectable } from '@angular/core';
import { MouvementsService } from './mouvements.service';
import { ProduitsService } from './produits.service';
import { Mouvement } from '../models/mouvement.model';

export interface KpiPeriode {
  label: string;
  chiffreAffaires: number;
  achats: number;
  marge: number;
}

export interface KpiTrimestre extends KpiPeriode {
  trimestre: number;
  annee: number;
  alerteNegative: boolean;
  confettis: boolean;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(
    private mouvementsService: MouvementsService,
    private produitsService: ProduitsService
  ) {}

  private getVentes(): Mouvement[] {
    return this.mouvementsService.getMouvements()
      .filter(m => m.type === 'retrait-par-vente');
  }

  private getAchats(): Mouvement[] {
    return this.mouvementsService.getMouvements()
      .filter(m => m.type === 'ajout');
  }

  // CA par période
  getCAParMois(annee: number): KpiPeriode[] {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return mois.map((label, i) => {
      const ventes = this.getVentes().filter(m => m.date.getFullYear() === annee && m.date.getMonth() === i);
      const achats = this.getAchats().filter(m => m.date.getFullYear() === annee && m.date.getMonth() === i);
      const ca = ventes.reduce((s, m) => s + m.total, 0);
      const achat = achats.reduce((s, m) => s + m.total, 0);
      return { label, chiffreAffaires: ca, achats: achat, marge: ca - achat };
    });
  }

  getCAParTrimestre(annee: number): KpiTrimestre[] {
    const trimestres = [
      { label: 'T1', mois: [0, 1, 2] },
      { label: 'T2', mois: [3, 4, 5] },
      { label: 'T3', mois: [6, 7, 8] },
      { label: 'T4', mois: [9, 10, 11] },
    ];

    const resultats = trimestres.map((t, i) => {
      const ventes = this.getVentes().filter(m => m.date.getFullYear() === annee && t.mois.includes(m.date.getMonth()));
      const achats = this.getAchats().filter(m => m.date.getFullYear() === annee && t.mois.includes(m.date.getMonth()));
      const ca = ventes.reduce((s, m) => s + m.total, 0);
      const achat = achats.reduce((s, m) => s + m.total, 0);
      const marge = ca - achat;
      return { label: t.label, trimestre: i + 1, annee, chiffreAffaires: ca, achats: achat, marge, alerteNegative: false, confettis: false };
    });

    // Alertes et confettis
    const benefices = resultats.map(t => Math.max(0, t.marge));
    resultats.forEach((t, i) => {
      t.alerteNegative = t.marge < 0;
      if (i >= 6) {
        const moyenne6 = benefices.slice(i - 6, i).reduce((s, v) => s + v, 0) / 6;
        t.confettis = t.marge > 0 && t.marge >= moyenne6 * 2;
      }
    });

    return resultats;
  }

  getCATotal(annee: number): number {
    return this.getVentes()
      .filter(m => m.date.getFullYear() === annee)
      .reduce((s, m) => s + m.total, 0);
  }

  getMargeAnnuelle(annee: number): number {
    const ca = this.getCATotal(annee);
    const achats = this.getAchats()
      .filter(m => m.date.getFullYear() === annee)
      .reduce((s, m) => s + m.total, 0);
    return ca - achats;
  }

  getImpotPrevisionnel(annee: number): number {
    const marge = this.getMargeAnnuelle(annee);
    return marge > 0 ? marge * 0.3 : 0;
  }

  getValeurStock(): number {
    const produits = [
      ...this.produitsService.getByCategorie('poisson'),
      ...this.produitsService.getByCategorie('fruit-de-mer'),
      ...this.produitsService.getByCategorie('crustace'),
    ];
    return produits.reduce((s, p) => s + p.prix * p.quantiteStock, 0);
  }

  getTop3Vendus(): { nom: string; total: number }[] {
    const map = new Map<string, number>();
    this.getVentes().forEach(m => {
      map.set(m.produitNom, (map.get(m.produitNom) || 0) + m.quantite);
    });
    return Array.from(map.entries())
      .map(([nom, total]) => ({ nom, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }

  getProduitsSousSeuilStock(seuil = 5): { nom: string; stock: number }[] {
    const produits = [
      ...this.produitsService.getByCategorie('poisson'),
      ...this.produitsService.getByCategorie('fruit-de-mer'),
      ...this.produitsService.getByCategorie('crustace'),
    ];
    return produits
      .filter(p => p.quantiteStock <= seuil)
      .map(p => ({ nom: p.nom, stock: p.quantiteStock }));
  }

  getTauxInvendusParCategorie(): { categorie: string; taux: number }[] {
    const categories = ['poisson', 'fruit-de-mer', 'crustace'] as const;
    return categories.map(cat => {
      const invendus = this.mouvementsService.getMouvements()
        .filter(m => m.categorie === cat && m.type === 'retrait-par-invendus')
        .reduce((s, m) => s + m.quantite, 0);
      const total = this.mouvementsService.getMouvements()
        .filter(m => m.categorie === cat)
        .reduce((s, m) => s + m.quantite, 0);
      return { categorie: cat, taux: total > 0 ? Math.round((invendus / total) * 100) : 0 };
    });
  }

  getCAParCategorie(annee: number): { categorie: string; ca: number }[] {
  const categories = ['poisson', 'fruit-de-mer', 'crustace'] as const;
  return categories.map(cat => {
    const ca = this.getVentes()
      .filter(m => m.date.getFullYear() === annee && m.categorie === cat)
      .reduce((s, m) => s + m.total, 0);
    return { categorie: cat, ca };
  });
}

getVentesVsInvendusParCategorie(annee: number): { categorie: string; ventes: number; invendus: number }[] {
  const categories = ['poisson', 'fruit-de-mer', 'crustace'] as const;
  return categories.map(cat => {
    const ventes = this.mouvementsService.getMouvements()
      .filter(m => m.date.getFullYear() === annee && m.categorie === cat && m.type === 'retrait-par-vente')
      .reduce((s, m) => s + m.quantite, 0);
    const invendus = this.mouvementsService.getMouvements()
      .filter(m => m.date.getFullYear() === annee && m.categorie === cat && m.type === 'retrait-par-invendus')
      .reduce((s, m) => s + m.quantite, 0);
    return { categorie: cat, ventes, invendus };
  });
}
}