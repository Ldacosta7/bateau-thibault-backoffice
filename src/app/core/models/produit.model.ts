export interface Produit {
  id: number;
  nom: string;
  categorie: 'poisson' | 'fruit-de-mer' | 'crustace';
  prix: number;
  enPromotion: boolean;
  pourcentagePromotion: number;
  quantiteStock: number;
  nombreVendus: number;
  commentaires: string;
}