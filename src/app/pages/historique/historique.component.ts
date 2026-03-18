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

  filtreCategorie = undefined;
  filtreType = '';

  categories = [
    { valeur: undefined, label: 'Toutes les catégories' },
    { valeur: 0, label: 'Poissons' },
    { valeur: 1, label: 'Fruits de mer' },
    { valeur: 2, label: 'Crustacés' }
  ];

  types = [
    { valeur: undefined, label: 'Tous les types' },
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
    if(this.filtreCategorie == undefined && this.filtreType == ''){
      this.mouvements = historique;
    }else if(this.filtreType != '' &&this.filtreCategorie != undefined){
      this.mouvements = historique.filter(h => h.categorie === this.filtreCategorie && h.type === this.filtreType);
    }else if (this.filtreCategorie != undefined){
      this.mouvements = historique.filter(h => h.categorie === this.filtreCategorie );
    }else if (this.filtreType != ''){
      this.mouvements = historique.filter(h => h.type === this.filtreType );
    }
    console.log(this.mouvements);
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

 getLabelCategorie(cat: number): string {
  const map: Record<number, string> = {
    0: 'Poisson',
    1: 'Fruit de mer',
    2: 'Crustacé'
  };
  return map[cat] || '—';
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