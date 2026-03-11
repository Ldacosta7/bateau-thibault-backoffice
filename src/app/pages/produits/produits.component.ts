import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Produit } from '../../core/models/produit.model';
import { ProduitsService } from '../../core/services/produits.service';

interface ProduitForm {
  produit: Produit;
  stockDelta: number | null;
  nouveauPourcentage: number | null;
  erreurStock: string;
  erreurPromo: string;
}

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatInputModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatSnackBarModule
  ],
  templateUrl: './produits.component.html',
  styleUrl: './produits.component.css'
})
export class ProduitsComponent implements OnInit {

  colonnes = ['nom', 'prix', 'prixPromo', 'pourcentage', 'stock', 'vendus', 'commentaires', 'modifStock', 'modifPromo', 'action'];

  poissons: ProduitForm[] = [];
  fruitsDesMer: ProduitForm[] = [];
  crustaces: ProduitForm[] = [];

  constructor(private produitsService: ProduitsService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  chargerProduits(): void {
    const toForm = (p: Produit): ProduitForm => ({
      produit: p, stockDelta: null, nouveauPourcentage: null, erreurStock: '', erreurPromo: ''
    });
    this.poissons = this.produitsService.getByCategorie('poisson').map(toForm);
    this.fruitsDesMer = this.produitsService.getByCategorie('fruit-de-mer').map(toForm);
    this.crustaces = this.produitsService.getByCategorie('crustace').map(toForm);
  }

  getPrixPromo(pf: ProduitForm): string {
    if (!pf.produit.enPromotion) return '—';
    const promo = pf.produit.prix * (1 - pf.produit.pourcentagePromotion / 100);
    return promo.toFixed(2) + ' €';
  }

  validerLigne(pf: ProduitForm): boolean {
    let valide = true;
    pf.erreurStock = '';
    pf.erreurPromo = '';

    if (pf.stockDelta !== null) {
      if (isNaN(pf.stockDelta)) {
        pf.erreurStock = 'Nombre invalide'; valide = false;
      } else if (pf.produit.quantiteStock + pf.stockDelta < 0) {
        pf.erreurStock = 'Stock ne peut pas être négatif'; valide = false;
      }
    }
    if (pf.nouveauPourcentage !== null) {
      if (isNaN(pf.nouveauPourcentage)) {
        pf.erreurPromo = 'Nombre invalide'; valide = false;
      } else if (pf.nouveauPourcentage < 0 || pf.nouveauPourcentage > 100) {
        pf.erreurPromo = 'Entre 0 et 100'; valide = false;
      }
    }
    return valide;
  }

  envoyerLigne(pf: ProduitForm): void {
    if (!this.validerLigne(pf)) return;
    const changes: Partial<Produit> = {};
    if (pf.stockDelta !== null) changes.quantiteStock = pf.produit.quantiteStock + pf.stockDelta;
    if (pf.nouveauPourcentage !== null) {
      changes.pourcentagePromotion = pf.nouveauPourcentage;
      changes.enPromotion = pf.nouveauPourcentage > 0;
    }
    this.produitsService.updateProduit(pf.produit.id, changes);
    this.chargerProduits();
    this.snackBar.open('✅ Produit mis à jour !', 'Fermer', { duration: 3000 });
  }

  toutEnvoyer(liste: ProduitForm[]): void {
    const toutValide = liste.every(pf => this.validerLigne(pf));
    if (!toutValide) return;
    liste.forEach(pf => {
      const changes: Partial<Produit> = {};
      if (pf.stockDelta !== null) changes.quantiteStock = pf.produit.quantiteStock + pf.stockDelta;
      if (pf.nouveauPourcentage !== null) {
        changes.pourcentagePromotion = pf.nouveauPourcentage;
        changes.enPromotion = pf.nouveauPourcentage > 0;
      }
      if (Object.keys(changes).length > 0) this.produitsService.updateProduit(pf.produit.id, changes);
    });
    this.chargerProduits();
    this.snackBar.open('✅ Tous les produits mis à jour !', 'Fermer', { duration: 3000 });
  }
}