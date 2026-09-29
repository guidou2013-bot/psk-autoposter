// Renouvelle le jeton Meta du robot PSK SANS que le jeton passe par le chat (29/09/2026).
// Guillaume copie le jeton COURT de Graph Explorer (app « soiree28 ») dans le presse-papiers,
// puis : node jeton.mjs
// 1. lit le presse-papiers  2. echange contre un jeton utilisateur 60 jours (secret de l'app soiree28)
// 3. me/accounts -> jeton de la Page PSK (n'expire jamais quand il vient d'un jeton 60 jours)
// 4. controle debug_token (expires_at = 0) + Instagram lie  5. pose le secret GitHub, vide le presse-papiers
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const G = 'https://graph.facebook.com/v23.0';
const REPO = 'guidou2013-bot/psk-autoposter';
const PAGE_ID = '196291543756293';
const ENV = 'F:/Desktop/CLAUDE ALL PROJECT/soirees28claude/.env';

const env = Object.fromEntries(readFileSync(ENV, 'utf8').split(/\r?\n/)
  .filter(l => l.includes('=') && !l.startsWith('#'))
  .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const appId = env.META_APP_ID, secret = env.META_APP_SECRET;

const get = async (path, params) => {
  const r = await fetch(`${G}/${path}?${new URLSearchParams(params)}`);
  const j = await r.json();
  if (j.error) throw new Error(`${path} : ${j.error.message}`);
  return j;
};
const stop = m => { console.error('ECHEC : ' + m); process.exit(1); };

const court = execSync('powershell -NoProfile -Command Get-Clipboard', { encoding: 'utf8' }).trim();
if (!/^EA[A-Za-z0-9]{50,}$/.test(court)) stop("le presse-papiers ne contient pas un jeton Meta (il doit commencer par EA). Recopie-le dans Graph Explorer.");

const dbg = async t => (await get('debug_token', { input_token: t, access_token: `${appId}|${secret}` })).data;
const d0 = await dbg(court);
if (String(d0.app_id) !== appId) stop(`le jeton vient de l'app « ${d0.application} », il faut choisir l'app « soiree28 » en haut a droite de Graph Explorer.`);
const manque = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish']
  .filter(p => !(d0.scopes || []).includes(p));
if (manque.length) stop('autorisations manquantes : ' + manque.join(', '));

const long = (await get('oauth/access_token', {
  grant_type: 'fb_exchange_token', client_id: appId, client_secret: secret, fb_exchange_token: court,
})).access_token;

const pages = (await get('me/accounts', { access_token: long, fields: 'id,name,access_token,instagram_business_account' })).data || [];
const page = pages.find(p => p.id === PAGE_ID);
if (!page) stop('la Page PSK n\'est pas dans les pages autorisees (' + pages.map(p => p.name).join(', ') + '). Refaire « Generate Access Token » en cochant Psykotik sound kartel.');
if (!page.instagram_business_account) stop('Instagram PSK non autorise : refaire le jeton en cochant aussi le compte Instagram.');

const d1 = await dbg(page.access_token);
if (d1.expires_at !== 0) stop('le jeton de Page a une date de fin (' + new Date(d1.expires_at * 1000).toLocaleString('fr-FR') + '), il n\'est pas permanent.');

execSync(`gh secret set META_PAGE_TOKEN -R ${REPO}`, { input: page.access_token, stdio: ['pipe', 'ignore', 'inherit'] });
execSync('powershell -NoProfile -Command Set-Clipboard -Value $null');
console.log(`OK : jeton de Page « ${page.name} » permanent (n'expire jamais), Instagram lie ${page.instagram_business_account.id}, secret META_PAGE_TOKEN pose, presse-papiers vide.`);
