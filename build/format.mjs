// Mise en forme typographique des désignations produits (le site d'origine les écrit en capitales).
// La désignation d'origine est conservée telle quelle dans les tableaux de références et les demandes de devis.

const KEEP_UPPER = new Set(['AC', 'AMA', 'AMI', 'B', 'CPEC', 'GI', 'GIA', 'HQ', 'PE', 'PEBD', 'PP', 'PVC', 'RE', 'T', 'Y', 'PE-GAINE']);
const PROPER = {
  ALFA: 'Alfa', APOLLO: 'Apollo', ARANGUL: 'Arangül', COMER: 'Comer', DRAGON: 'Dragon', FLAG: 'Flag', FLAT: 'Flat',
  FOGGER: 'Fogger', GREENPLAINS: 'GreenPlains', GREEN: 'Green', LATIN: 'Latin', MAGO: 'Mago', NANO: 'Nano',
  NOVODRIP: 'Novodrip', PUMA: 'Puma', SERTSAN: 'Sertsan', SUNSTREAM: 'Sunstream', VICTORY: 'Victory', VIMI: 'Vimi',
  VIVO: 'Vivo', ITALY: 'Italy', DESIGN: 'Design', TRIPOD: 'Tripod', CIRCOJET: 'Circojet', MICROJET: 'Microjet',
};
const ACCENTS = {
  AUTOREGULANT: 'autorégulant', CLE: 'clé', COMPLETE: 'complète', CROISE: 'croisé', DEBITMETRE: 'débitmètre',
  DEPART: 'départ', DERIVATION: 'dérivation', 'D’EVACUATION': 'd’évacuation', EGALE: 'égale', EGAL: 'égal',
  FILETE: 'fileté', FILETEE: 'filetée', GEOMEMBRANE: 'géomembrane', GEOTEXTILE: 'géotextile', INTEGRE: 'intégré',
  MALE: 'mâle', MANOMETRE: 'manomètre', MECHE: 'mèche', MELANGEUR: 'mélangeur', REDUCTION: 'réduction',
  REDUIT: 'réduit', REDUITE: 'réduite', REGLABLE: 'réglable', SECURITE: 'sécurité', SOLENOIDE: 'solénoïde',
  TARAUDE: 'taraudé', TE: 'té', TETINE: 'tétine', TRESSE: 'tressé', CREPINE: 'crépine', TEFLON: 'téflon',
  DIAM: 'Ø', 'PE-GAINE': 'PE-gaine', A: 'à', 'MALE-FEMELLE': 'mâle-femelle',
};

export function displayName(raw) {
  const tokens = raw.replace(/\s+/g, ' ').trim().split(' ');
  const out = tokens.map((tok) => {
    const bare = tok.replace(/[(),]/g, '');
    if (ACCENTS[bare]) return tok.replace(bare, ACCENTS[bare]);
    if (KEEP_UPPER.has(bare)) return tok;
    if (PROPER[bare]) return tok.replace(bare, PROPER[bare]);
    let t = tok.toLowerCase();
    t = t.replace(/l\/h/g, 'L/h').replace(/(\d)l\b/g, '$1 L');
    return t;
  });
  let s = out.join(' ');
  s = s.replace(/(\d)(mm|cm)\b/g, '$1 $2').replace(/\b(mm|cm)(\d)/g, '$1 $2')
    .replace(/(\d)L\/h/g, '$1 L/h').replace(/(\d)v\b/g, '$1 V');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
