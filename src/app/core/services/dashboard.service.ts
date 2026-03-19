import { Injectable } from '@angular/core';
import { MouvementsService } from './mouvements.service';
import { ProduitsService } from './produits.service';
import { Mouvement } from '../models/mouvement.model';
import { firstValueFrom } from 'rxjs';

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

  // ─── Fetching des données brutes ────────────────────────────────────────────
  // NOTE : les calculs (CA, marge, trimestres, graphiques...) sont intentionnellement
  // dans le component, car les méthodes synchrones basées sur Observable
  // (ex: Number(observable.pipe(...))) retournent toujours NaN.

  async getHistoriqueAchat(): Promise<Mouvement[]> {
    const data = await firstValueFrom(
      this.mouvementsService.getHistoriqueFiltre(undefined, 'ajout')
    );
    console.log(`[DashboardService] getHistoriqueAchat → ${data.length} entrées`, data);
    return data;
  }

  async getHistoriqueVentes(): Promise<Mouvement[]> {
    const data = await firstValueFrom(
      this.mouvementsService.getHistoriqueFiltre(undefined, 'retrait-par-vente')
    );
    console.log(`[DashboardService] getHistoriqueVentes → ${data.length} entrées`, data);
    return data;
  }

  async getHistoriqueInvendus(): Promise<Mouvement[]> {
    const data = await firstValueFrom(
      this.mouvementsService.getHistoriqueFiltre(undefined, 'retrait-par-invendus')
    );
    console.log(`[DashboardService] getHistoriqueInvendus → ${data.length} entrées`, data);
    return data;
  }

  async getValeurStock(): Promise<number> {
    const produits = await firstValueFrom(this.produitsService.getProduits());
    const valeur = produits.reduce((s, p) => s + p.prix * p.stock, 0);
    console.log(`[DashboardService] getValeurStock → ${valeur} €`, produits);
    return valeur;
  }

  async getTop3Vendus(historiqueVentes: Mouvement[]): Promise<{ nom: string; total: number }[]> {
    const mapProduits = new Map<string, number>();
    historiqueVentes.forEach(v => {
      mapProduits.set(v.produitNom, (mapProduits.get(v.produitNom) || 0) + v.quantite);
    });
    const top3 = Array.from(mapProduits.entries())
      .map(([nom, total]) => ({ nom, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
    console.log('[DashboardService] getTop3Vendus →', top3);
    return top3;
  }

  async getProduitsSousSeuilStock(seuil = 5): Promise<{ nom: string; stock: number }[]> {
    const produits = await firstValueFrom(this.produitsService.getProduits());
    const ruptures = produits
      .filter(p => p.stock <= seuil)
      .map(p => ({ nom: p.nom, stock: p.stock }));
    console.log(`[DashboardService] getProduitsSousSeuilStock (seuil=${seuil}) →`, ruptures);
    return ruptures;
  }
}