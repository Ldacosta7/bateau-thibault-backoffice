import { Injectable } from '@angular/core';
import { Mouvement, TypeMouvement } from '../models/mouvement.model';
import { Produit } from '../models/produit.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
//import { PRODUITS_MOCK } from '../../mock/produits.mock';

@Injectable({ providedIn: 'root' })
export class MouvementsService {
/*
  private mouvements: Mouvement[] = this.genererHistorique();
  private nextId = 1000;

  private genererHistorique(): Mouvement[] {
    const mouvements: Mouvement[] = [];
    let id = 1;
    //const produits = PRODUITS_MOCK;

    const ajout = (produit: any, type: TypeMouvement, quantite: number, prix: number, date: Date) => {
      mouvements.push({
        id: id++, produitId: produit.id, produitNom: produit.nom,
        categorie: produit.categorie, type, quantite, prixUnitaire: prix,
        total: quantite * prix, date
      });
    };

    const d = (mois: number, jour: number) => new Date(2025, mois - 1, jour);

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

  getMouvementsFiltres(categorie?: number, type?: string): Mouvement[] {
    return this.mouvements.filter(m => {
      const matchCategorie = !categorie || m.categorie === categorie;
      const matchType = !type || m.type === type;
      return matchCategorie && matchType;
    });
  }*/

  constructor(private http: HttpClient) {}

  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzczODQzNDkxLCJpYXQiOjE3NzM4Mzk4OTEsImp0aSI6IjY3ODE0ODAzY2ZmNjQ5YTFhNzY0ZmU0MTM2NDE0MjA1IiwidXNlcl9pZCI6IjMifQ.Nz1qg_dvlRK_sIr2UH98lGYcwQXCNnCLXpHZ98pfsn4";

  httpHeaders = new HttpHeaders({
    Authorization: `Bearer ${this.token}`
  });

  getHistorique() : Observable<Mouvement[]>{
    return this.http.get<Mouvement[]>(
      'http://127.0.0.1:8000/journalisation/',
      { headers: this.httpHeaders }
    );
  }

  getHistoriqueFiltre(categorie?: number, type?: string): Observable<Mouvement[]> {
    return this.getHistorique().pipe(
      map(historique => historique.filter(h => h.categorie === categorie && h.type === type))
    )
  }


  ajouterMouvement(produit: Produit, type: TypeMouvement, quantite: number, prixUnitaire: number){

  }
}