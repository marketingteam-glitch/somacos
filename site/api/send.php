<?php
/**
 * SOMACOS — réception des formulaires de contact et de demande de devis.
 * Fonctionne sur tout hébergement PHP 7.4+ disposant de la fonction mail().
 * Pour un envoi plus fiable (SMTP authentifié), voir le README.
 */

// ------------------------------------------------------------------ configuration
$TO        = 'info@somacos.ma';                 // destinataire des demandes
$CC        = 'somacos-delta@hotmail.com';       // copie (laisser '' pour désactiver)
$FROM      = 'no-reply@' . preg_replace(['/^www\./', '/:\d+$/'], '', $_SERVER['HTTP_HOST'] ?? 'somacos.ma');
$MAX_LEN   = 5000;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out($ok, $error = '', $code = 200) {
  http_response_code($code);
  echo json_encode(['ok' => $ok, 'error' => $error], JSON_UNESCAPED_UNICODE);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(false, 'Méthode non autorisée.', 405);

// robot : le champ caché doit rester vide
if (!empty($_POST['site_web'])) out(true);

// limitation simple : 1 envoi toutes les 20 secondes par session
session_start();
if (!empty($_SESSION['somacos_last']) && time() - $_SESSION['somacos_last'] < 20) out(false, 'Veuillez patienter quelques secondes.', 429);

$clean = function ($k) use ($MAX_LEN) {
  $v = trim((string)($_POST[$k] ?? ''));
  $v = str_replace(["\r\n", "\r"], "\n", $v);
  return mb_substr($v, 0, $MAX_LEN);
};
$type    = $clean('type') === 'devis' ? 'devis' : 'contact';
$nom     = $clean('nom');
$email   = $clean('email');
$tel     = $clean('telephone');
$message = $clean('message');
$prods   = $clean('produits');

if ($nom === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 'Nom et e-mail valides requis.', 422);
if ($type === 'contact' && mb_strlen($message) < 10) out(false, 'Message trop court.', 422);
if ($type === 'devis' && $tel === '') out(false, 'Téléphone requis.', 422);
if ($type === 'devis' && $message === '' && $prods === '') out(false, 'Demande vide.', 422);

$labels = ['nom' => 'Nom', 'societe' => 'Société', 'email' => 'E-mail', 'telephone' => 'Téléphone', 'ville' => 'Ville', 'profil' => 'Profil', 'sujet' => 'Sujet'];
$body = ($type === 'devis' ? "Nouvelle demande de devis" : "Nouveau message") . " depuis le site web\n\n";
foreach ($labels as $k => $l) { $v = $clean($k); if ($v !== '') $body .= "$l : $v\n"; }
if ($prods !== '') $body .= "\nProduits :\n$prods\n";
if ($message !== '') $body .= "\n" . ($type === 'devis' ? 'Projet' : 'Message') . " :\n$message\n";
$body .= "\n---\nPage : " . $clean('page') . "\nIP : " . ($_SERVER['REMOTE_ADDR'] ?? '') . "\nDate : " . date('Y-m-d H:i') . "\n";

$subjectTxt = $type === 'devis' ? "Demande de devis — $nom" : ('Contact site — ' . ($clean('sujet') ?: $nom));
$subject = '=?UTF-8?B?' . base64_encode($subjectTxt) . '?=';
$safeName = preg_replace('/[\r\n"<>]/', '', $nom);
$headers = [
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
  "From: SOMACOS site web <$FROM>",
  "Reply-To: =?UTF-8?B?" . base64_encode($safeName) . "?= <$email>",
];
if ($CC !== '') $headers[] = "Cc: $CC";

$sent = @mail($TO, $subject, $body, implode("\r\n", $headers), "-f$FROM");
if (!$sent) out(false, "L'envoi a échoué sur le serveur.", 500);

$_SESSION['somacos_last'] = time();
out(true);
