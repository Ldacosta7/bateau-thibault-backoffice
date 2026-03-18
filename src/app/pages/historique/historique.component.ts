import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { Mouvement, TypeMouvement } from '../../core/models/mouvement.model';
import { MouvementsService } from '../../core/services/mouvements.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-historique',
  standalone: false,
  templateUrl: './historique.component.html',
  styleUrl: './historique.component.css'
})
export class HistoriqueComponent implements OnInit {

  colonnes = ['date', 'produit', 'categorie', 'type', 'quantite', 'prixUnitaire', 'total'];

  filtreCategorie: any = '';
  filtreType = '';

  categories = [
    { valeur: '', label: 'Toutes les catégories' },
    { valeur: 'poisson', label: 'Poissons' },
    { valeur: 'fruit-de-mer', label: 'Fruits de mer' },
    { valeur: 'crustace', label: 'Crustacés' }
  ];

  types = [
    { valeur: '', label: 'Tous les types' },
    { valeur: 'ajout', label: 'Ajout de stock' },
    { valeur: 'retrait-par-vente', label: 'Vente' },
    { valeur: 'retrait-par-invendus', label: 'Invendus' }
  ];

  mouvements: Mouvement[] = [];
  private tousLesMouvements: Mouvement[] = [];

  constructor(private mouvementsService: MouvementsService) {}

  ngOnInit(): void {
    this.actualiser();
  }

  async actualiser(): Promise<void> {
    const historique = await firstValueFrom(this.mouvementsService.getHistorique());
    this.tousLesMouvements = historique;
    this.appliquerFiltres();
  }

  appliquerFiltres(): void {
    this.mouvements = this.tousLesMouvements.filter(h => {
      const matchCat  = !this.filtreCategorie || h.categorie === this.filtreCategorie;
      const matchType = !this.filtreType      || h.type === this.filtreType;
      return matchCat && matchType;
    });
  }
  countByType(type: string): number {
    return this.mouvements.filter(m => m.type === type).length;
  }

  getLabelCategorie(cat: string): string {
    const map: Record<string, string> = {
      'poisson': 'Poisson', 'fruit-de-mer': 'Fruit de mer', 'crustace': 'Crustacé'
    };
    return map[cat] || cat;
  }

  getLabelType(type: TypeMouvement): string {
    const map: Record<TypeMouvement, string> = {
      'ajout': 'Ajout', 'retrait-par-vente': 'Vente', 'retrait-par-invendus': 'Invendus'
    };
    return map[type];
  }

  getClassType(type: TypeMouvement): string {
    const map: Record<TypeMouvement, string> = {
      'ajout': 'badge-ajout', 'retrait-par-vente': 'badge-vente', 'retrait-par-invendus': 'badge-invendus'
    };
    return map[type];
  }
}