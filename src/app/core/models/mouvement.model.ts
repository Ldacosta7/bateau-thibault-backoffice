export type TypeMouvement = 'ajout' | 'retrait-par-vente' | 'retrait-par-invendus';

export interface Mouvement {
  id: number;
  produitId: number;
  produitNom: string;
  categorie: 'poisson' | 'fruit-de-mer' | 'crustace';
  type: TypeMouvement;
  quantite: number;
  prixUnitaire: number;
  total: number;
  date: Date;
}