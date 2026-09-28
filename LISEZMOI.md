# Robot PSK (psk-autoposter)

Publie sur la Page Facebook **Psykotik sound kartel** et l'Instagram **@psykotik_sound_kartel_**
aux dates prévues, via l'API officielle Meta. Tourne sur GitHub Actions : le PC peut être éteint.

## Fonctionnement
- `schedule.json` : le planning (média, légende Instagram, légende Facebook sans @, date heure de Paris, statut).
- `publish.py` : toutes les 30 min de 6h à 23h.
  - Facebook : programmé nativement dès qu'on est à moins de 28 jours (visible dans Business Suite > Programmé).
  - Instagram : publié à l'heure dite (au passage suivant du robot, 30 min de décalage au plus).
  - `type: story` : story Instagram + Facebook à l'heure dite.
- Médias : dossier `media/`, servis par GitHub Pages (`https://guidou2013-bot.github.io/psk-autoposter/media/`).
- Bilan de chaque action (et panne) envoyé sur Telegram à Guillaume.

## Ajouter une publication (session du pont, demande de Philippe ou de Guillaume)
```
cd "F:\Desktop\CLAUDE ALL PROJECT\psk-autoposter"
node ajouter.mjs "<video ou image>" 2026-10-24T11:00 legende-ig.txt --fb legende-fb.txt --titre "G9 J-7"
node ajouter.mjs "<image 1080x1920>" 2026-10-25T11:00 vide.txt --type story --titre "Compte a rebours J-6"
node ajouter.mjs liste
node ajouter.mjs retirer <id>
```
Règles : Instagram avec @ des artistes, Facebook sans @. Ne jamais ajouter une publication déjà posée dans Business Suite (doublon).

## Secrets (Settings > Secrets and variables > Actions)
- `META_PAGE_TOKEN` : posé par Guillaume lui-même (jamais dans le chat). Permissions : pages_manage_posts,
  pages_read_engagement, pages_show_list, instagram_basic, instagram_content_publish.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` : bilans.

## Tester
Actions > « Publier les posts PSK » > Run workflow : `check_only = 1` (connexion) ou `dry_run = 1` (simulation).
