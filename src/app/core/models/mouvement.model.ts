import { Produit } from "./produit.model";

export type TypeMouvement = 'ajout' | 'retrait-par-vente' | 'retrait-par-invendus';

export interface Mouvement {
  id: number;
  produit: Produit;
  produitNom: string;
  categorie: number;
  transaction: TypeMouvement;
  quantite: number;
  prixUnitaire: number;
  total: number;
  date: Date;
}