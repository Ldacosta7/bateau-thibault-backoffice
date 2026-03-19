import { Injectable } from '@angular/core';
import { Mouvement, TypeMouvement } from '../models/mouvement.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MouvementsService {

  constructor(private http: HttpClient) {}

  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzczODQzNDkxLCJpYXQiOjE3NzM4Mzk4OTEsImp0aSI6IjY3ODE0ODAzY2ZmNjQ5YTFhNzY0ZmU0MTM2NDE0MjA1IiwidXNlcl9pZCI6IjMifQ.Nz1qg_dvlRK_sIr2UH98lGYcwQXCNnCLXpHZ98pfsn4";

  httpHeaders = new HttpHeaders({
    Authorization: `Bearer ${this.token}`
  });

  getHistorique(): Observable<Mouvement[]> {
    return this.http.get<any[]>(
      'http://127.0.0.1:8000/journalisation/',
      { headers: this.httpHeaders }
    ).pipe(
      map(data => data.map(h => ({
        id:           h.id,
        produit:      h.produit,
        produitNom:   h.produit?.nom,         
        categorie:    h.produit?.categorie, 
        transaction:  h.transaction,
        quantite:     h.unite,        
        prixUnitaire: h.prixUnitaire,
        total:        h.montant,  
        date:         new Date(h.date),  
      } as Mouvement)))
    );
  }

  getHistoriqueFiltre(categorie?: number, type?: string): Observable<Mouvement[]> {
    return this.getHistorique().pipe(
      map(historique => historique.filter(h =>
        (categorie === undefined || h.categorie === categorie) &&
        (type === undefined || h.transaction === type)
      ))
    );
  }

  postMouvements(data: any): void {
    this.http.post('http://127.0.0.1:8000/journalisation/', data, { headers: this.httpHeaders }).subscribe({
      next: () => {},
      error: (err) => {
        console.log(data);
        console.error("Erreur lors de l'envoi de données");
      }
    });
  }
}