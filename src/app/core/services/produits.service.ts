import { Injectable } from '@angular/core';
import { Produit } from '../models/produit.model';
import { PRODUITS_MOCK } from '../../mock/produits.mock';

@Injectable({ providedIn: 'root' })
export class ProduitsService {

  private produits: Produit[] = [...PRODUITS_MOCK];

  getByCategorie(categorie: 'poisson' | 'fruit-de-mer' | 'crustace'): Produit[] {
    return this.produits.filter(p => p.categorie === categorie);
  }

  updateProduit(id: number, changes: Partial<Produit>): void {
    const index = this.produits.findIndex(p => p.id === id);
    if (index !== -1) {
      this.produits[index] = { ...this.produits[index], ...changes };
    }
  }
}