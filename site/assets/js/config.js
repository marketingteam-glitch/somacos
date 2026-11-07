/* Configuration du site — à adapter avant la mise en ligne. */
window.SOMACOS_CONFIG = {
  // Script d'envoi des formulaires (chemin depuis la racine du site).
  // 'api/send.php' fonctionne sur tout hébergement PHP (voir README). Laisser '' pour désactiver :
  // les visiteurs pourront alors envoyer leur demande via leur messagerie (mailto).
  formEndpoint: 'api/send.php',

  // Adresse qui reçoit les demandes envoyées via la messagerie du visiteur (solution de repli).
  email: 'info@somacos.ma',

  // Numéro WhatsApp au format international sans « + » (ex. '212661446318').
  // Laisser '' tant que le numéro WhatsApp officiel n'est pas confirmé.
  whatsapp: '',
};
