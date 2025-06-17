import type { ServiceCategory } from '../interfaces/service-category.interface';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'skincare',
    title: 'Soins de la Peau',
    description: 'Des soins personnalisés pour une peau éclatante et en bonne santé, adaptés à votre type de peau.',
    icon: 'https://img.icons8.com/color/96/000000/face-scan.png',
    features: [
      'Analyse de peau gratuite',
      'Soins anti-âge',
      'Traitement des imperfections',
      'Soins hydratants intenses',
    ],
  },
  {
    id: 'haircare',
    title: 'Soins Capillaires',
    description: 'Des traitements professionnels pour des cheveux forts, brillants et en pleine santé.',
    icon: 'https://img.icons8.com/fluency/96/hair-clip.png',
    features: ['Soins capillaires naturels', 'Traitements anti-chute', 'Lissage brésilien', 'Soins réparateurs'],
  },
  {
    id: 'makeup',
    title: 'Maquillage Professionnel',
    description: 'Des looks magnifiques pour toutes les occasions, réalisés par nos maquilleurs experts.',
    icon: 'https://img.icons8.com/color/96/000000/makeup.png',
    features: ['Maquillage de jour', 'Maquillage de soirée', 'Maquillage de mariage', 'Cours de maquillage'],
  },
  {
    id: 'spa',
    title: 'Soins du Corps & Spa',
    description: 'Détente et bien-être avec nos soins corporels relaxants et régénérants.',
    icon: 'https://img.icons8.com/fluency/96/lotus.png',
    features: ['Massages relaxants', 'Enveloppements corporels', 'Gommages naturels', 'Soins minceur'],
  },
];
