import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Produit } from '../models/produit.model';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProduitsService {

  constructor(private http: HttpClient) {}

  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzczODQ1NzQyLCJpYXQiOjE3NzM4NDIxNDIsImp0aSI6Ijc1YjI1Mzk2Y2NlMDRmZGFiNWEzZDY4YWY3ZWYxM2Y1IiwidXNlcl9pZCI6IjMifQ.hxT_fmYgIbd64jwC0y6FOMmHc7rwANbGbjS549mitTo";

  httpHeaders = new HttpHeaders({
    Authorization: `Bearer ${this.token}`
  });

  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(
      'http://127.0.0.1:8000/produit/',
      { headers: this.httpHeaders }
    );
  }

  getPoissons(): Observable<Produit[]> {
    return this.getProduits().pipe(
      map(produits => produits.filter(p => p.categorie === 0))
    );
  }

  getCrustaces(): Observable<Produit[]> {
    return this.getProduits().pipe(
      map(produits => produits.filter(p => p.categorie === 1))
    );
  }

  getFruitsDeMer(): Observable<Produit[]>{
    return this.getProduits().pipe(
      map(produits => produits.filter(p => p.categorie === 2))
    );
  }

  postProduit(id: number, data : any): void{
    this.http.patch("http://127.0.0.1:8000/produit/" + id + '/', data, {headers: this.httpHeaders}).subscribe({
      next: (res) => {
        alert('Données envoyés')
      },
      error: (err) =>{
        console.log(data)
        alert("Erreur lors de l'envoi de données")
      }
    })
  }
}