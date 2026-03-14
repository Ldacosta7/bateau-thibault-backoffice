import { Injectable } from '@angular/core';
import { Mouvement, TypeMouvement } from '../models/mouvement.model';
import { Produit } from '../models/produit.model';
import { PRODUITS_MOCK } from '../../mock/produits.mock';

@Injectable({ providedIn: 'root' })
export class MouvementsService {

  private mouvements: Mouvement[] = this.genererHistorique();
  private nextId = 1000;

  private genererHistorique(): Mouvement[] {
    const mouvements: Mouvement[] = [];
    let id = 1;
    const produits = PRODUITS_MOCK;

    const ajout = (produit: any, type: TypeMouvement, quantite: number, prix: number, date: Date) => {
      mouvements.push({
        id: id++, produitId: produit.id, produitNom: produit.nom,
        categorie: produit.categorie, type, quantite, prixUnitaire: prix,
        total: quantite * prix, date
      });
    };

    const d = (mois: number, jour: number) => new Date(2025, mois - 1, jour);

    // JANVIER
    ajout(produits[0], 'ajout', 20, 15, d(1, 2));
    ajout(produits[0], 'retrait-par-vente', 8, 28, d(1, 5));
    ajout(produits[1], 'ajout', 15, 12, d(1, 3));
    ajout(produits[1], 'retrait-par-vente', 10, 22, d(1, 8));
    ajout(produits[3], 'ajout', 60, 5, d(1, 2));
    ajout(produits[3], 'retrait-par-vente', 30, 12, d(1, 10));
    ajout(produits[6], 'ajout', 10, 30, d(1, 4));
    ajout(produits[6], 'retrait-par-vente', 4, 55, d(1, 15));
    ajout(produits[2], 'retrait-par-invendus', 2, 0, d(1, 20));

    // FÉVRIER
    ajout(produits[0], 'ajout', 18, 15, d(2, 1));
    ajout(produits[0], 'retrait-par-vente', 12, 28, d(2, 7));
    ajout(produits[4], 'ajout', 40, 3, d(2, 2));
    ajout(produits[4], 'retrait-par-vente', 25, 6, d(2, 12));
    ajout(produits[7], 'ajout', 12, 10, d(2, 3));
    ajout(produits[7], 'retrait-par-vente', 8, 20, d(2, 14));
    ajout(produits[1], 'retrait-par-invendus', 3, 0, d(2, 25));

    // MARS
    ajout(produits[5], 'ajout', 25, 9, d(3, 1));
    ajout(produits[5], 'retrait-par-vente', 18, 18, d(3, 8));
    ajout(produits[8], 'ajout', 15, 18, d(3, 2));
    ajout(produits[8], 'retrait-par-vente', 10, 32, d(3, 10));
    ajout(produits[0], 'ajout', 20, 15, d(3, 3));
    ajout(produits[0], 'retrait-par-vente', 15, 28, d(3, 15));
    ajout(produits[3], 'retrait-par-invendus', 5, 0, d(3, 28));

    // AVRIL
    ajout(produits[1], 'ajout', 20, 12, d(4, 1));
    ajout(produits[1], 'retrait-par-vente', 14, 22, d(4, 6));
    ajout(produits[6], 'ajout', 8, 30, d(4, 2));
    ajout(produits[6], 'retrait-par-vente', 5, 55, d(4, 12));
    ajout(produits[4], 'ajout', 35, 3, d(4, 3));
    ajout(produits[4], 'retrait-par-vente', 20, 6, d(4, 18));
    ajout(produits[2], 'retrait-par-invendus', 1, 0, d(4, 25));

    // MAI
    ajout(produits[2], 'ajout', 10, 18, d(5, 2));
    ajout(produits[2], 'retrait-par-vente', 6, 35, d(5, 8));
    ajout(produits[7], 'ajout', 15, 10, d(5, 3));
    ajout(produits[7], 'retrait-par-vente', 12, 20, d(5, 14));
    ajout(produits[0], 'ajout', 22, 15, d(5, 4));
    ajout(produits[0], 'retrait-par-vente', 18, 28, d(5, 20));
    ajout(produits[5], 'retrait-par-invendus', 3, 0, d(5, 28));

    // JUIN
    ajout(produits[3], 'ajout', 70, 5, d(6, 1));
    ajout(produits[3], 'retrait-par-vente', 50, 12, d(6, 10));
    ajout(produits[8], 'ajout', 18, 18, d(6, 2));
    ajout(produits[8], 'retrait-par-vente', 14, 32, d(6, 15));
    ajout(produits[6], 'ajout', 10, 30, d(6, 3));
    ajout(produits[6], 'retrait-par-vente', 7, 55, d(6, 18));
    ajout(produits[1], 'retrait-par-invendus', 2, 0, d(6, 25));

    // JUILLET
    ajout(produits[0], 'ajout', 25, 15, d(7, 1));
    ajout(produits[0], 'retrait-par-vente', 20, 28, d(7, 8));
    ajout(produits[4], 'ajout', 50, 3, d(7, 2));
    ajout(produits[4], 'retrait-par-vente', 40, 6, d(7, 12));
    ajout(produits[5], 'ajout', 30, 9, d(7, 3));
    ajout(produits[5], 'retrait-par-vente', 22, 18, d(7, 18));
    ajout(produits[2], 'retrait-par-invendus', 2, 0, d(7, 28));

    // AOÛT
    ajout(produits[7], 'ajout', 20, 10, d(8, 1));
    ajout(produits[7], 'retrait-par-vente', 16, 20, d(8, 10));
    ajout(produits[8], 'ajout', 20, 18, d(8, 2));
    ajout(produits[8], 'retrait-par-vente', 15, 32, d(8, 14));
    ajout(produits[1], 'ajout', 18, 12, d(8, 3));
    ajout(produits[1], 'retrait-par-vente', 14, 22, d(8, 18));
    ajout(produits[3], 'retrait-par-invendus', 4, 0, d(8, 25));

    // SEPTEMBRE
    ajout(produits[6], 'ajout', 12, 30, d(9, 1));
    ajout(produits[6], 'retrait-par-vente', 9, 55, d(9, 10));
    ajout(produits[0], 'ajout', 24, 15, d(9, 2));
    ajout(produits[0], 'retrait-par-vente', 19, 28, d(9, 15));
    ajout(produits[4], 'ajout', 45, 3, d(9, 3));
    ajout(produits[4], 'retrait-par-vente', 35, 6, d(9, 18));
    ajout(produits[5], 'retrait-par-invendus', 2, 0, d(9, 28));

    // OCTOBRE
    ajout(produits[2], 'ajout', 12, 18, d(10, 1));
    ajout(produits[2], 'retrait-par-vente', 9, 35, d(10, 8));
    ajout(produits[7], 'ajout', 18, 10, d(10, 2));
    ajout(produits[7], 'retrait-par-vente', 14, 20, d(10, 12));
    ajout(produits[8], 'ajout', 22, 18, d(10, 3));
    ajout(produits[8], 'retrait-par-vente', 17, 32, d(10, 18));
    ajout(produits[1], 'retrait-par-invendus', 2, 0, d(10, 25));

    // NOVEMBRE
    ajout(produits[3], 'ajout', 80, 5, d(11, 1));
    ajout(produits[3], 'retrait-par-vente', 60, 12, d(11, 10));
    ajout(produits[6], 'ajout', 15, 30, d(11, 2));
    ajout(produits[6], 'retrait-par-vente', 11, 55, d(11, 15));
    ajout(produits[0], 'ajout', 28, 15, d(11, 3));
    ajout(produits[0], 'retrait-par-vente', 22, 28, d(11, 18));
    ajout(produits[4], 'retrait-par-invendus', 3, 0, d(11, 28));

    // DÉCEMBRE (fêtes → gros volumes)
    ajout(produits[6], 'ajout', 20, 30, d(12, 1));
    ajout(produits[6], 'retrait-par-vente', 18, 55, d(12, 10));
    ajout(produits[5], 'ajout', 40, 9, d(12, 2));
    ajout(produits[5], 'retrait-par-vente', 35, 18, d(12, 15));
    ajout(produits[8], 'ajout', 30, 18, d(12, 3));
    ajout(produits[8], 'retrait-par-vente', 25, 32, d(12, 18));
    ajout(produits[3], 'ajout', 100, 5, d(12, 5));
    ajout(produits[3], 'retrait-par-vente', 85, 12, d(12, 20));
    ajout(produits[7], 'retrait-par-invendus', 2, 0, d(12, 28));

    return mouvements.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  ajouterMouvement(produit: Produit, type: TypeMouvement, quantite: number, prixUnitaire: number): void {
    this.mouvements.unshift({
      id: this.nextId++,
      produitId: produit.id,
      produitNom: produit.nom,
      categorie: produit.categorie,
      type, quantite, prixUnitaire,
      total: quantite * prixUnitaire,
      date: new Date()
    });
  }

  getMouvements(): Mouvement[] {
    return this.mouvements;
  }

  getMouvementsFiltres(categorie?: string, type?: string): Mouvement[] {
    return this.mouvements.filter(m => {
      const matchCategorie = !categorie || m.categorie === categorie;
      const matchType = !type || m.type === type;
      return matchCategorie && matchType;
    });
  }
}