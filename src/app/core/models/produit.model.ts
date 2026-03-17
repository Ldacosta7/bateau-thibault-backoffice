export interface Produit {
  id: number;
  nom: string;
  prix: number;
  prixPromo: number;
  promo: number;
  stock: number;
  commentaire: string;
  categorie: number;
  disponible: boolean;
  proprietaire: string;
  unite: string;
}