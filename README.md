Rapid Towing Netlify Site
=========================

This folder is a ready-to-deploy static version of Rapid Towing with stronger local SEO.

Files included:

- `index.html` - main website page.
- `thank-you.html` - form confirmation page.
- `robots.txt` - allows crawling and points to the sitemap.
- `sitemap.xml` - sitemap for Google.
- `netlify.toml` and `_redirects` - Netlify deploy and canonical redirect settings.
- `deploy-to-netlify.ps1` - one-command deploy after Netlify login.
- `vercel.json` - Vercel static hosting config.
- `deploy-to-vercel.ps1` - one-command deploy after Vercel login.

SEO improvements included:

- Miami towing title and meta description.
- LocalBusiness/TowingService schema.
- FAQ schema.
- English and Spanish service content.
- Service area content for Miami, Doral, Hialeah, Miami Springs, Medley, Virginia Gardens, and West Miami.
- Dedicated service pages for flatbed towing, roadside assistance, jump starts, and car lockouts.
- Dedicated city pages for Miami, Doral, Hialeah, Miami Springs, Medley, Virginia Gardens, and West Miami.
- Netlify form with thank-you page.

Deploy after login:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
& "C:\Users\cashj\Documents\Codex\2026-06-18\hola-puedes-verificarque-tenemos-en-c\outputs\rapid-towing-site\deploy-to-netlify.ps1"
```

If Netlify says you are not logged in:

```powershell
$env:APPDATA="C:\Users\cashj\Documents\Codex\2026-06-18\hola-puedes-verificarque-tenemos-en-c\outputs\netlify-appdata"
netlify.cmd login
```

Optional Vercel deploy:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
& "C:\Users\cashj\Documents\Codex\2026-06-18\hola-puedes-verificarque-tenemos-en-c\outputs\rapid-towing-site\deploy-to-vercel.ps1"
```

After Vercel deploy, keep the domain registered in GoDaddy and point DNS to Vercel using the records Vercel shows for `rapid-towing.com`.
