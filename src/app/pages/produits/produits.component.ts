import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Produit } from '../../core/models/produit.model';
import { TypeMouvement } from '../../core/models/mouvement.model';
import { ProduitsService } from '../../core/services/produits.service';
import { MouvementsService } from '../../core/services/mouvements.service';

interface ProduitForm {
  produit: Produit;
  nouveauPrix: number | null;
  nouveauPourcentage: number | null;
  typeMouvement: TypeMouvement;
  quantiteMouvement: number | null;
  prixMouvement: number | null;
  erreurPrix: string;
  erreurPromo: string;
  erreurQuantite: string;
  erreurPrixMouvement: string;
}

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatSnackBarModule
  ],
  templateUrl: './produits.component.html',
  styleUrl: './produits.component.css'
})
export class ProduitsComponent implements OnInit {

  colonnes = ['nom', 'prix', 'prixPromo', 'pourcentage', 'stock', 'vendus', 'commentaires', 'modifPrix', 'modifPromo', 'mouvement'];

  typesMouvement: { valeur: TypeMouvement, label: string }[] = [
    { valeur: 'ajout', label: 'Ajout de stock' },
    { valeur: 'retrait-par-vente', label: 'Vente' },
    { valeur: 'retrait-par-invendus', label: 'Invendus' }
  ];

  poissons: ProduitForm[] = [];
  fruitsDesMer: ProduitForm[] = [];
  crustaces: ProduitForm[] = [];

  constructor(
    private produitsService: ProduitsService,
    private mouvementsService: MouvementsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  chargerProduits(): void {
    const toForm = (p: Produit): ProduitForm => ({
      produit: p,
      nouveauPrix: null,
      nouveauPourcentage: null,
      typeMouvement: 'ajout',
      quantiteMouvement: null,
      prixMouvement: null,
      erreurPrix: '',
      erreurPromo: '',
      erreurQuantite: '',
      erreurPrixMouvement: ''
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

  getLabelType(type: TypeMouvement): string {
    return this.typesMouvement.find(t => t.valeur === type)?.label || '';
  }

  toutEnvoyer(liste: ProduitForm[]): void {
    let toutValide = true;

    liste.forEach(pf => {
      pf.erreurPrix = '';
      pf.erreurPromo = '';
      pf.erreurQuantite = '';
      pf.erreurPrixMouvement = '';

      // Validation prix
      if (pf.nouveauPrix !== null) {
        if (isNaN(pf.nouveauPrix) || pf.nouveauPrix <= 0) {
          pf.erreurPrix = 'Prix invalide'; toutValide = false;
        }
      }

      // Validation promo
      if (pf.nouveauPourcentage !== null) {
        if (isNaN(pf.nouveauPourcentage) || pf.nouveauPourcentage < 0 || pf.nouveauPourcentage > 100) {
          pf.erreurPromo = 'Entre 0 et 100'; toutValide = false;
        }
      }

      // Validation mouvement
      if (pf.quantiteMouvement !== null) {
        if (isNaN(pf.quantiteMouvement) || pf.quantiteMouvement <= 0) {
          pf.erreurQuantite = 'Quantité invalide'; toutValide = false;
        }
        if (pf.typeMouvement !== 'retrait-par-invendus' && (pf.prixMouvement === null || pf.prixMouvement <= 0)) {
          pf.erreurPrixMouvement = 'Prix requis'; toutValide = false;
        }
        const stockApres = pf.typeMouvement === 'ajout'
          ? pf.produit.quantiteStock + pf.quantiteMouvement
          : pf.produit.quantiteStock - pf.quantiteMouvement;
        if (stockApres < 0) {
          pf.erreurQuantite = 'Stock insuffisant'; toutValide = false;
        }
      }
    });

    if (!toutValide) {
      this.snackBar.open('❌ Corrige les erreurs avant d\'envoyer', 'Fermer', { duration: 3000 });
      return;
    }

    let nbModifs = 0;

    liste.forEach(pf => {
      const changes: Partial<Produit> = {};

      if (pf.nouveauPrix !== null) changes.prix = pf.nouveauPrix;

      if (pf.nouveauPourcentage !== null) {
        changes.pourcentagePromotion = pf.nouveauPourcentage;
        changes.enPromotion = pf.nouveauPourcentage > 0;
      }

      if (pf.quantiteMouvement !== null) {
        const estAjout = pf.typeMouvement === 'ajout';
        const nouveauStock = estAjout
          ? pf.produit.quantiteStock + pf.quantiteMouvement
          : pf.produit.quantiteStock - pf.quantiteMouvement;
        const nouveauxVendus = pf.typeMouvement === 'retrait-par-vente'
          ? pf.produit.nombreVendus + pf.quantiteMouvement
          : pf.produit.nombreVendus;

        changes.quantiteStock = nouveauStock;
        changes.nombreVendus = nouveauxVendus;

        const prixFinal = pf.typeMouvement === 'retrait-par-invendus' ? 0 : (pf.prixMouvement ?? 0);
        this.mouvementsService.ajouterMouvement(pf.produit, pf.typeMouvement, pf.quantiteMouvement, prixFinal);
        nbModifs++;
      }

      if (Object.keys(changes).length > 0) {
        this.produitsService.updateProduit(pf.produit.id, changes);
        nbModifs++;
      }
    });

    this.chargerProduits();

    if (nbModifs === 0) {
      this.snackBar.open('ℹ️ Aucune modification saisie', 'Fermer', { duration: 3000 });
    } else {
      this.snackBar.open(`✅ Modifications enregistrées !`, 'Fermer', { duration: 3000 });
    }
  }
}