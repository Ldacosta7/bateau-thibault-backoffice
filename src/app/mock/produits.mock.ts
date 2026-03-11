import { Produit } from '../core/models/produit.model';

export const PRODUITS_MOCK: Produit[] = [
  // Poissons
  { id: 1, nom: 'Bar de ligne', categorie: 'poisson', prix: 28, enPromotion: false, pourcentagePromotion: 0, quantiteStock: 15, nombreVendus: 42, commentaires: 'Arrivage du mardi' },
  { id: 2, nom: 'Daurade royale', categorie: 'poisson', prix: 22, enPromotion: true, pourcentagePromotion: 15, quantiteStock: 8, nombreVendus: 30, commentaires: '' },
  { id: 3, nom: 'Sole', categorie: 'poisson', prix: 35, enPromotion: false, pourcentagePromotion: 0, quantiteStock: 5, nombreVendus: 18, commentaires: 'Produit fragile' },
  // Fruits de mer
  { id: 4, nom: 'Huîtres', categorie: 'fruit-de-mer', prix: 12, enPromotion: true, pourcentagePromotion: 10, quantiteStock: 50, nombreVendus: 120, commentaires: 'Calibre n°3' },
  { id: 5, nom: 'Moules', categorie: 'fruit-de-mer', prix: 6, enPromotion: false, pourcentagePromotion: 0, quantiteStock: 30, nombreVendus: 85, commentaires: '' },
  { id: 6, nom: 'Coquilles Saint-Jacques', categorie: 'fruit-de-mer', prix: 18, enPromotion: false, pourcentagePromotion: 0, quantiteStock: 20, nombreVendus: 55, commentaires: 'Saison octobre-avril' },
  // Crustacés
  { id: 7, nom: 'Homard breton', categorie: 'crustace', prix: 55, enPromotion: false, pourcentagePromotion: 0, quantiteStock: 6, nombreVendus: 12, commentaires: 'Vivant' },
  { id: 8, nom: 'Araignée de mer', categorie: 'crustace', prix: 20, enPromotion: true, pourcentagePromotion: 30, quantiteStock: 10, nombreVendus: 28, commentaires: '' },
  { id: 9, nom: 'Langoustine', categorie: 'crustace', prix: 32, enPromotion: false, pourcentagePromotion: 0, quantiteStock: 12, nombreVendus: 40, commentaires: 'Arrivage du jeudi' },
];