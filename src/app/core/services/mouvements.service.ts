import { Injectable } from '@angular/core';
import { Mouvement, TypeMouvement } from '../models/mouvement.model';
import { Produit } from '../models/produit.model';

@Injectable({ providedIn: 'root' })
export class MouvementsService {

  private mouvements: Mouvement[] = [];
  private nextId = 1;

  ajouterMouvement(produit: Produit, type: TypeMouvement, quantite: number, prixUnitaire: number): void {
    this.mouvements.unshift({
      id: this.nextId++,
      produitId: produit.id,
      produitNom: produit.nom,
      categorie: produit.categorie,
      type,
      quantite,
      prixUnitaire,
      total: quantite * prixUnitaire,
      date: new Date()
    });
  }

  getMouvementsFiltres(categorie?: string, type?: string): Mouvement[] {
    return this.mouvements.filter(m => {
      const matchCategorie = !categorie || m.categorie === categorie;
      const matchType = !type || m.type === type;
      return matchCategorie && matchType;
    });
  }
}