import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Produit } from '../../core/models/produit.model';
import { TypeMouvement } from '../../core/models/mouvement.model';
import { ProduitsService } from '../../core/services/produits.service';
import { MouvementsService } from '../../core/services/mouvements.service';
import { firstValueFrom } from 'rxjs';

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
  standalone: false,
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
  formPrixPromo : any = 0;
  formPrix: any = 0;
  formPromo: any = 0;


  constructor(
    private produitsService: ProduitsService,
    private mouvementsService: MouvementsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
    this.produitsService.getProduits();
  }

  async chargerProduits(): Promise<void> {

    const produits = await firstValueFrom(
      this.produitsService.getProduits()
    );

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
    this.poissons = produits.filter(p => p.categorie === 0).map(toForm);
    this.fruitsDesMer = produits.filter(p => p.categorie === 1).map(toForm);
    this.crustaces = produits.filter(p => p.categorie === 2).map(toForm);
    console.log(this.poissons)

  }

  getPrixPromo(pf: ProduitForm): string {
    if (pf.produit.promo == 0) return '—';
    const promo = pf.produit.prix * (1 - pf.produit.promo / 100);
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
          ? pf.produit.stock + pf.quantiteMouvement
          : pf.produit.stock - pf.quantiteMouvement;
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
        changes.promo = pf.nouveauPourcentage;
      }

      if (pf.quantiteMouvement !== null) {
        const estAjout = pf.typeMouvement === 'ajout';
        const nouveauStock = estAjout
          ? pf.produit.stock + pf.quantiteMouvement
          : pf.produit.stock - pf.quantiteMouvement;
        const nouveauxVendus = pf.typeMouvement === 'retrait-par-vente'
          ? pf.produit.unite + pf.quantiteMouvement
          : pf.produit.unite;

        changes.stock = nouveauStock;
        changes.unite = nouveauxVendus;

        const prixFinal = pf.typeMouvement === 'retrait-par-invendus' ? 0 : (pf.prixMouvement ?? 0);
        this.mouvementsService.ajouterMouvement(pf.produit, pf.typeMouvement, pf.quantiteMouvement, prixFinal);
        nbModifs++;
      }

      if (Object.keys(changes).length > 0) {
        if(pf.nouveauPrix != null){
          this.formPrixPromo = pf.nouveauPrix * (1 - pf.produit.promo / 100)
        }else{
          this.formPrixPromo = pf.produit.prix * (1 - pf.produit.promo / 100)
        }

        pf.nouveauPrix != null ? this.formPrix = pf.nouveauPrix : this.formPrix = pf.produit.prix
        
        pf.nouveauPourcentage != null ? this.formPromo = pf.nouveauPourcentage : this.formPromo = pf.produit.promo


        const postForm = {
          "prix": this.formPrix,
          "prixPromo": this.formPrixPromo,
          "promo": this.formPromo
        }
        console.log(postForm);
        this.produitsService.postProduit(pf.produit.id, postForm)
        this.chargerProduits();
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