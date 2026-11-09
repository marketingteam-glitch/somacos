// Contenu vérifié, extrait de https://somacos.ma (pages Accueil, À propos, Contact, catalogue WooCommerce).
// Ne rien ajouter ici qui ne figure pas sur le site d'origine.

export const SITE = {
  // URL publique du nouveau site (utilisée pour les balises canonical, Open Graph et le sitemap).
  url: 'https://somacos.ma',
  name: 'SOMACOS',
  legalName: 'Société Marocaine de Commerce et Service',
  city: 'Meknès',
  address: ['Coop Al Khayrate', 'Commune rurale Sidi Slimane Moul Kifan', 'Meknès, Maroc'],
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=SOMACOS+Meknes+Maroc',
  phones: [
    { label: '+212 535 466 455', href: 'tel:+212535466455' },
    { label: '+212 535 522 196', href: 'tel:+212535522196' },
  ],
  emails: ['info@somacos.ma', 'somacos-delta@hotmail.com'],
  hours: [
    ['Lundi – vendredi', '8h00 – 19h00'],
    ['Samedi – dimanche', '9h00 – 14h00'],
  ],
  team: [
    { name: 'Morad Chahhou', role: 'Directeur technique', tel: '06 61 44 63 19', telHref: 'tel:+212661446319', email: 'morad-chahhou@somacos.ma' },
    { name: 'Mohamed Chahhou', role: 'Directeur commercial', tel: '06 61 44 63 18', telHref: 'tel:+212661446318', email: 'mohamed-chahhou@somacos.ma' },
  ],
};

// Texte de la page d'accueil d'origine.
export const HOME_INTRO = "Les systèmes d’irrigation que nous fournissons proviennent des meilleurs fabricants mondiaux, que ce soit les pompes, les tuyaux, les systèmes localisés, pivots ou enrouleurs.";
export const HOME_PARTNER = "Nos ingénieurs vous apportent leur expertise, des solutions techniques adaptées, une mise en œuvre et un suivi de vos installations des plus performantes.";

// Texte de la page « À propos » d'origine.
export const ABOUT = [
  "La Société Marocaine de Commerce et Service « SOMACOS » s’est spécialisée depuis 2014 dans la distribution de matériels agricoles, d’irrigation, de revêtement de bassins, ainsi que dans l’étude et la réalisation de projets d’irrigation, auprès des professionnels du domaine ainsi que des particuliers à la recherche de conseils techniques.",
  "La Société Marocaine de Commerce et Service s’appuie sur des vendeurs et technico-commerciaux très confirmés sur l’information des nouveaux produits et services.",
];

export const VALUES = [
  { title: 'Ambition', text: "La Société Marocaine de Commerce et Service a la volonté de participer activement au développement de l’irrigation agricole moderne et responsable." },
  { title: 'Fierté', text: "Depuis 12 ans, les produits et les services SOMACOS sont reconnus dans tout le Maroc, pour leur qualité et le développement de leur expertise." },
  { title: 'Innovation', text: "Notre mission est de participer au développement agricole et de répondre ainsi aux besoins de mise en culture, même de grands périmètres. Son objectif : l’autosuffisance alimentaire." },
];

// Services : uniquement ceux mentionnés sur le site d'origine.
export const SERVICES = [
  { id: 'distribution', title: 'Distribution de matériel agricole et d’irrigation', text: "Pompes, tuyaux, systèmes localisés, pivots ou enrouleurs : des systèmes d’irrigation issus des meilleurs fabricants mondiaux, disponibles à Meknès.", link: 'catalogue/' },
  { id: 'bassins', title: 'Revêtement de bassins', text: "Géomembrane et géotextile pour le revêtement de vos bassins.", link: 'categories/revetement-bassins/' },
  { id: 'etude', title: 'Étude et réalisation de projets d’irrigation', text: "Nos ingénieurs vous apportent leur expertise et des solutions techniques adaptées à votre projet." },
  { id: 'suivi', title: 'Mise en œuvre et suivi des installations', text: "Une mise en œuvre et un suivi de vos installations des plus performantes." },
  { id: 'conseil', title: 'Conseil technique', text: "Pour les professionnels du domaine comme pour les particuliers à la recherche de conseils techniques, avec des vendeurs et technico-commerciaux confirmés." },
];

export const PROCESS = [
  { title: 'Étude', text: 'Étude de votre projet d’irrigation par nos ingénieurs.' },
  { title: 'Solution technique', text: 'Des solutions techniques adaptées et le matériel des meilleurs fabricants.' },
  { title: 'Mise en œuvre', text: 'La réalisation de votre installation.' },
  { title: 'Suivi', text: 'Un suivi de vos installations dans la durée.' },
];

// Marques présentes sur la page d'accueil d'origine (bandeau partenaires).
export const PARTNERS = [
  { file: 'partner-1', name: 'Arangül Plastik' },
  { file: 'partner-2', name: 'Sertsan' },
  { file: 'partner-3', name: 'Serdrip' },
  { file: 'partner-4', name: 'Onur Plas' },
  { file: 'partner-5', name: 'Hepworth' },
  { file: 'partner-6', name: 'GreenPlains' },
  { file: 'partner-7', name: 'MPI' },
  { file: 'partner-8', name: 'Sunstream' },
];

// Les 18 catégories WooCommerce d'origine (+ les produits « Tous » non classés).
export const CATEGORIES = {
  'accessoires-micro-irrigation-goutteurs': { name: 'Accessoires micro-irrigation : goutteurs', short: 'Goutteurs & diffuseurs' },
  'micro-irrigation-gaine': { name: 'Micro-irrigation : gaine', short: 'Gaine goutte-à-goutte' },
  'micro-irrigation-tuyau-pebd-et-goutteur-integre': { name: 'Micro-irrigation : tuyau PEBD et goutteur intégré', short: 'Tuyau PEBD & goutteur intégré' },
  'accessoires-micro-irrigation-pe': { name: 'Accessoires micro-irrigation PE', short: 'Accessoires PE' },
  'accessoires-micro-irrigation-pour-gaine': { name: 'Accessoires micro-irrigation pour gaine', short: 'Accessoires pour gaine' },
  'accessoires-micro-irrigation-vannettes': { name: 'Accessoires micro-irrigation : vannettes', short: 'Vannettes' },
  'tubing-et-accessoires-tubing': { name: 'Tubing et accessoires tubing', short: 'Tubing' },
  'accessoires-de-compression-en-pp': { name: 'Accessoires de compression en PP', short: 'Compression PP' },
  'accessoires-en-pvc': { name: 'Accessoires en PVC', short: 'Accessoires PVC' },
  'colliers-de-prise-en-charge': { name: 'Colliers de prise en charge', short: 'Colliers de prise en charge' },
  'tuyaux-darrosage': { name: 'Tuyaux d’arrosage', short: 'Tuyaux d’arrosage' },
  'aspersion': { name: 'Aspersion', short: 'Aspersion' },
  'filtration-et-fertilisation': { name: 'Filtration et fertilisation', short: 'Filtration & fertilisation' },
  'vannes-clapets': { name: 'Vannes et clapets', short: 'Vannes & clapets' },
  'instruments-de-mesure-et-manchette-anti-vibratoire': { name: 'Instruments de mesure et manchette anti-vibratoire', short: 'Instruments de mesure' },
  'revetement-bassins': { name: 'Revêtement bassins', short: 'Revêtement bassins' },
  'colle-et-outillage': { name: 'Colle et outillage', short: 'Colle & outillage' },
  'divers-accessoires': { name: 'Divers accessoires', short: 'Divers accessoires' },
  'uncategorized': { name: 'Autres produits', short: 'Autres produits' },
};

// Regroupement éditorial des catégories d'origine en familles (navigation uniquement).
export const FAMILIES = [
  { id: 'micro-irrigation', name: 'Micro-irrigation', image: 'gaine-greenplains-novodrip-vimi-400u-25-cm', cats: ['accessoires-micro-irrigation-goutteurs', 'micro-irrigation-gaine', 'micro-irrigation-tuyau-pebd-et-goutteur-integre', 'accessoires-micro-irrigation-pe', 'accessoires-micro-irrigation-pour-gaine', 'accessoires-micro-irrigation-vannettes', 'tubing-et-accessoires-tubing'] },
  { id: 'raccords-tuyauterie', image: 'te-egale-pvc', name: 'Raccords & tuyauterie', cats: ['accessoires-de-compression-en-pp', 'accessoires-en-pvc', 'colliers-de-prise-en-charge', 'tuyaux-darrosage'] },
  { id: 'filtration-fertilisation', image: 'filtre-a-tamis-semi-automatique-greenplains', name: 'Filtration & fertilisation', cats: ['filtration-et-fertilisation'] },
  { id: 'vannes-clapets', image: 'vanne-hydraulique-ama-greenplains', name: 'Vannes & clapets', cats: ['vannes-clapets'] },
  { id: 'aspersion', image: 'asperseur-mago', name: 'Aspersion', cats: ['aspersion'] },
  { id: 'mesure', image: 'compteur-deau-2', name: 'Mesure & contrôle', cats: ['instruments-de-mesure-et-manchette-anti-vibratoire'] },
  { id: 'bassins', image: 'geomembrane-2', name: 'Revêtement de bassins', cats: ['revetement-bassins'] },
  { id: 'outillage-divers', image: 'colle-greenplains', name: 'Outillage & divers', cats: ['colle-et-outillage', 'divers-accessoires', 'uncategorized'] },
];

// Photographies d'ambiance (hors site d'origine) — licences libres, créditées dans le pied de page.
export const PHOTO_CREDITS = [
  { file: 'hero-drip', title: 'Chinakohl Bestand mit Tropfbewässerung', author: 'Josef Schlaghecken', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Chinakohl_Bestand_mit_Tropfbew%C3%A4sserung,_Josef_Schlaghecken.jpg' },
  { file: 'pivot', title: 'Center-pivot irrigation system - 1', author: 'Killarnee', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Center-pivot_irrigation_system_-_1.jpg' },
  { file: 'field-sprinklers', title: 'Agricultural field being irrigated with sprinklers', author: 'Kwameghana (Bright Kwame Ayisi)', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Agricultural_field_being_irrigated_with_sprinklers.jpg' },
  { file: 'olive-grove', title: 'Tarya.tafersit', author: 'Floppa ameqqran', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Tarya.tafersit.jpg' },
];

// Produits mis en avant sur l'accueil (slugs du catalogue).
export const FEATURED = [
  'filtre-automatique-double-corps-greenplains',
  'vanne-hydraulique-ama-greenplains',
  'pompe-doseuse-greenplains',
  'te-egale-pvc',
  'gaine-greenplains-novodrip-vimi-400u-25-cm',
  'goutteur-autoregulant-alfa',
  'micro-asperseur-avec-support',
  'geomembrane-2',
];
