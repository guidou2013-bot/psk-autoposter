// Renouvelle le jeton Meta du robot PSK SANS que le jeton passe par le chat (29/09/2026).
// 29/09 : l app soiree28 n est pas sur son compte -> jeton Velyria Autoposter PROLONGE dans le debogueur Meta
// (Extend Access Token, 60 jours) copie dans le presse-papiers, puis : node jeton.mjs
// me/accounts -> jeton de la Page PSK (n expire jamais car issu d un jeton 60 jours)
// 4. controle debug_token (expires_at = 0) + Instagram lie  5. pose le secret GitHub, vide le presse-papiers
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const G = 'https://graph.facebook.com/v23.0';
const REPO = 'guidou2013-bot/psk-autoposter';
const PAGE_ID = '196291543756293';
const get = async (path, params) => {
  const r = await fetch(`${G}/${path}?${new URLSearchParams(params)}`);
  const j = await r.json();
  if (j.error) throw new Error(`${path} : ${j.error.message}`);
  return j;
};
const stop = m => { console.error('ECHEC : ' + m); process.exit(1); };

const court = execSync('powershell -NoProfile -Command Get-Clipboard', { encoding: 'utf8' }).trim();
if (!/^EA[A-Za-z0-9]{50,}$/.test(court)) stop("le presse-papiers ne contient pas un jeton Meta (il doit commencer par EA). Recopie-le dans Graph Explorer.");

const dbg = async t => (await get("debug_token", { input_token: t, access_token: t })).data;
const d0 = await dbg(court);
const manque = ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "instagram_basic", "instagram_content_publish"]
  .filter(p => !(d0.scopes || []).includes(p));
if (manque.length) stop("autorisations manquantes : " + manque.join(", "));
if (d0.expires_at && d0.expires_at * 1000 - Date.now() < 30 * 86400000) stop("jeton COURT : le prolonger dans le debogueur (Extend Access Token) puis copier le NOUVEAU jeton.");
const long = court;

const pages = (await get('me/accounts', { access_token: long, fields: 'id,name,access_token,instagram_business_account' })).data || [];
const page = pages.find(p => p.id === PAGE_ID);
if (!page) stop('la Page PSK n\'est pas dans les pages autorisees (' + pages.map(p => p.name).join(', ') + '). Refaire « Generate Access Token » en cochant Psykotik sound kartel.');
if (!page.instagram_business_account) stop('Instagram PSK non autorise : refaire le jeton en cochant aussi le compte Instagram.');

const d1 = await dbg(page.access_token);
if (d1.expires_at !== 0) stop('le jeton de Page a une date de fin (' + new Date(d1.expires_at * 1000).toLocaleString('fr-FR') + '), il n\'est pas permanent.');

execSync(`gh secret set META_PAGE_TOKEN -R ${REPO}`, { input: page.access_token, stdio: ['pipe', 'ignore', 'inherit'] });
execSync('powershell -NoProfile -Command Set-Clipboard -Value $null');
console.log(`OK : jeton de Page « ${page.name} » permanent (n'expire jamais), Instagram lie ${page.instagram_business_account.id}, secret META_PAGE_TOKEN pose, presse-papiers vide.`);
