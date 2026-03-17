export type TypeMouvement = 'ajout' | 'retrait-par-vente' | 'retrait-par-invendus';

export interface Mouvement {
  id: number;
  produitId: number;
  produitNom: string;
  categorie: number;
  type: TypeMouvement;
  quantite: number;
  prixUnitaire: number;
  total: number;
  date: Date;
}