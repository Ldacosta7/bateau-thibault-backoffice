import { Injectable } from '@angular/core';
import { MouvementsService } from './mouvements.service';
import { ProduitsService } from './produits.service';
import { Mouvement } from '../models/mouvement.model';
import { firstValueFrom, map, Observable, reduce } from 'rxjs';

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

  private getVentes(): Observable<Mouvement[]> {
    return this.mouvementsService.getHistoriqueFiltre(undefined, 'retrait-par-vente');
  }

  private getAchats(): Observable<Mouvement[]> {
    return this.mouvementsService.getHistoriqueFiltre(undefined, 'ajout');
  }

  // CA par période
  getCAParMois(annee: number): KpiPeriode[] {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return mois.map((label, i) => {
      const ventes = this.getVentes().pipe(map(ventes => ventes.filter(v => v.date.getFullYear() === annee && v.date.getMonth() === i)));
      const achats = this.getAchats().pipe(map(ventes => ventes.filter(v => v.date.getFullYear() === annee && v.date.getMonth() === i)));
      const ca = Number(ventes.pipe(map(ventes => ventes.reduce((s, m) => s + m.total, 0))));
      const achat = Number(achats.pipe(map(achat => achat.reduce((s, m) => s + m.total, 0))));

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
      const ventes = this.getVentes().pipe(map(ventes => ventes.filter(v => v.date.getFullYear() === annee && v.date.getMonth() === i)));
      const achats = this.getAchats().pipe(map(ventes => ventes.filter(v => v.date.getFullYear() === annee && v.date.getMonth() === i)));
      const ca = Number(ventes.pipe(map(ventes => ventes.reduce((s, m) => s + m.total, 0))));
      const achat = Number(achats.pipe(map(achat => achat.reduce((s, m) => s + m.total, 0))));
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
    const ventes = this.getVentes().pipe(map(ventes => ventes.filter(v => v.date.getFullYear() === annee)));
    return Number(ventes.pipe(map(ventes => ventes.reduce((s, m) => s + m.total, 0))));
  }

  getMargeAnnuelle(annee: number): number {
    const ca = this.getCATotal(annee);
    const achats = this.getAchats().pipe(map(achat => achat.filter(a => a.date.getFullYear() === annee)));
    
    return ca - Number(achats.pipe(map(achat => achat.reduce((s, m) => s + m.total, 0))));;
  }

  getImpotPrevisionnel(annee: number): number {
    const marge = this.getMargeAnnuelle(annee);
    return marge > 0 ? marge * 0.3 : 0;
  }

  async getValeurStock(): Promise<number> {
    const produits = await firstValueFrom(
      this.produitsService.getProduits());

    return produits.reduce((s, p) => s + p.prix * p.stock, 0);
  }

  async getTop3Vendus(): Promise<{ nom: string; total: number }[]> {
    const ventes = await firstValueFrom(this.getVentes());

    const mapProduits = new Map<string, number>();

    ventes.forEach(v => {
      mapProduits.set(
        v.produitNom,
        (mapProduits.get(v.produitNom) || 0) + v.quantite
      );
    });

    return Array.from(mapProduits.entries())
      .map(([nom, total]) => ({ nom, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }

  async getProduitsSousSeuilStock(seuil = 5): Promise<{ nom: string; stock: number }[]> {
    const produits = await firstValueFrom(
      this.produitsService.getProduits()
    );
    return produits
      .filter(p => p.stock <= seuil)
      .map(p => ({ nom: p.nom, stock: p.stock }));
  }

  getTauxInvendusParCategorie(): { categorie: number; taux: number }[] {
    const categories = [0, 1, 2] as const;
    return categories.map(cat => {
      const listeInvendus = this.mouvementsService.getHistoriqueFiltre(cat, 'retrait-par-invendus');
      const invendus = Number(listeInvendus.pipe(map(invendu => invendu.reduce((s, m) => s + m.quantite, 0))));

      const listeTotal = this.mouvementsService.getHistoriqueFiltre(cat);
      const total = Number(listeTotal.pipe(map(total => total.reduce((s, m) => s + m.quantite, 0))));

      return { categorie: cat, taux: total > 0 ? Math.round((invendus / total) * 100) : 0 };
    });
  }

  getCAParCategorie(annee: number): { categorie: number; ca: number }[] {
  const categories = [0, 1, 2] as const;
  return categories.map(cat => {
    const listeCa = this.mouvementsService.getHistoriqueFiltre(cat).pipe(map(ventes => ventes.filter(v => v.date.getFullYear() === annee)));
    const ca = Number(listeCa.pipe(map(total => total.reduce((s, m) => s + m.quantite, 0))));

    return { categorie: cat, ca };
  });
}

getVentesVsInvendusParCategorie(annee: number): { categorie: number; ventes: number; invendus: number }[] {
  const categories = [0, 1, 2] as const;
  return categories.map(cat => {

    const listeVentes = this.getVentes().pipe(map(ventes => ventes.filter(v => v.date.getFullYear() === annee && v.categorie === cat && v.transaction === 'retrait-par-vente')));
    const ventes = Number(listeVentes.pipe(map(ventes => ventes.reduce((s, m) => s + m.quantite, 0))));

    const listeInvendus = this.getVentes().pipe(map(ventes => ventes.filter(v => v.date.getFullYear() === annee && v.categorie === cat && v.transaction === 'retrait-par-invendus')));
    const invendus = Number(listeVentes.pipe(map(ventes => ventes.reduce((s, m) => s + m.quantite, 0))));

    /*const ventes = this.mouvementsService.getMouvements()
      .filter(m => m.date.getFullYear() === annee && m.categorie === cat && m.type === 'retrait-par-vente')
      .reduce((s, m) => s + m.quantite, 0);
    const invendus = this.mouvementsService.getMouvements()
      .filter(m => m.date.getFullYear() === annee && m.categorie === cat && m.type === 'retrait-par-invendus')
      .reduce((s, m) => s + m.quantite, 0);*/
    return { categorie: cat, ventes, invendus };
  });
}
}