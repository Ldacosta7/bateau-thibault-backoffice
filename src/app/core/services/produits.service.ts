import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Produit } from '../models/produit.model';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProduitsService {

  constructor(private http: HttpClient) {}

  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzczNzg0ODk0LCJpYXQiOjE3NzM3ODEyOTQsImp0aSI6IjNiZWY1ZTdlNDRlMTRjMDViYTJhMmI4NGFlYTA0NWY3IiwidXNlcl9pZCI6IjMifQ.4OTmdYZK301JQolzZIEoma3OXDq7tA4bMYy_j7eG3rE";

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
}