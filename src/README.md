# 🎯 JobHunter AI — Loice Graciane Pokam

Outil personnel de veille et candidature automatisée, propulsé par Claude AI et Supabase.

**Stack:** React + Vite · Node.js (proxy) · Claude API · Supabase · OpenStreetMap (géocodage)

---

## 📁 Structure du projet

```
C:\Users\lpokambo\job-hunter\
├── src/
│   └── App.jsx          ← Code principal React
├── proxy.cjs            ← Serveur proxy Node.js (contourne CORS)
├── .env                 ← Clés API (ne jamais commit sur GitHub)
├── package.json
└── vite.config.js
```

---

## 🚀 Relancer le projet (après redémarrage PC)

Tu as besoin d'ouvrir **2 PowerShell** à chaque fois.

### PowerShell 1 — Proxy Claude API

```powershell
cd C:\Users\lpokambo\job-hunter
node proxy.cjs
```

✅ Tu dois voir : `Proxy running on http://localhost:3001`

### PowerShell 2 — Application React

```powershell
cd C:\Users\lpokambo\job-hunter
npm run dev
```

✅ Tu dois voir : `VITE v7.x.x ready · Local: http://localhost:5173/`

### Ouvrir l'app

👉 **http://localhost:5173/**

---

## ⚙️ Fichier .env (à la racine du projet)

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_KEY=eyJxxxx...
VITE_ANTHROPIC_KEY=sk-ant-xxxx...
```

| Clé | Où la trouver |
|-----|---------------|
| VITE_SUPABASE_URL | Supabase → Settings → API → Project URL |
| VITE_SUPABASE_KEY | Supabase → Settings → API → anon public key |
| VITE_ANTHROPIC_KEY | console.anthropic.com → API Keys |

---

## 🔧 Fichier proxy.cjs

```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = 'sk-ant-XXXXXXXX'; // Ta vraie clé ici

app.post('/api/v1/messages', async (req, res) => {
  console.log('>>> Requête reçue');
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'));
```

---

## 🗄️ Base de données Supabase

Projet : **job-hunter** sur https://supabase.com

### SQL pour recréer les tables si besoin

```sql
CREATE TABLE candidatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP DEFAULT now(),
  date_candidature DATE,
  titre_poste TEXT,
  entreprise TEXT,
  source TEXT,
  secteur TEXT,
  contrat TEXT,
  localisation TEXT,
  adresse_complete TEXT,
  latitude FLOAT,
  longitude FLOAT,
  statut TEXT DEFAULT 'à envoyer',
  score_compatibilite INTEGER,
  points_forts JSONB,
  points_faibles JSONB,
  lacunes JSONB,
  conseil TEXT,
  cv_latex TEXT,
  notes TEXT,
  url_offre TEXT,
  description_offre TEXT
);

CREATE TABLE profil (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP DEFAULT now(),
  type TEXT,
  titre TEXT,
  contenu TEXT,
  actif BOOLEAN DEFAULT true
);

ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON candidatures FOR ALL USING (true);
CREATE POLICY "Allow all" ON profil FOR ALL USING (true);
```

---

## 📱 Fonctionnalités

### Onglet Offres 🎯
- Offres pré-chargées (APEC, LinkedIn, WTTJ, Indeed, JobTeaser ENSG/IFP)
- **Analyser** → Score de compatibilité basé sur TON profil
- **Générer CV** → CV LaTeX fidèle adapté à l'offre
- **💾 Sauvegarder** → Enregistre dans Supabase avec géocodage GPS

### Onglet Profil 👤
- Upload de tes CVs (.txt/.tex)
- Saisie manuelle d'expériences
- Plus tu enrichis, plus les CVs sont précis

### Onglet Candidatures 📊
- Suivi statut (à envoyer → envoyé → entretien → accepté/refus)
- Notes personnelles
- Coordonnées GPS pour analyses géographiques dans QGIS

---

## 🌐 Mise sur GitHub

```powershell
cd C:\Users\lpokambo\job-hunter
git init
git add .
git commit -m "Initial commit - JobHunter AI"
git remote add origin https://github.com/loice-pokam/job-hunter.git
git push -u origin main
```

⚠️ **Le fichier `.env` ne doit JAMAIS être pushé** — il est déjà dans `.gitignore`.

---

## 🛠️ Dépannage

| Problème | Solution |
|----------|----------|
| App blanche | Vérifier F12 Console → erreur rouge |
| "supabaseUrl is required" | `.env` manquant ou dans `src/` au lieu de la racine |
| Erreur analyse 500 | Vérifier que `node proxy.cjs` tourne |
| Proxy ne démarre pas | Port 3001 occupé → redémarrer le PC |
| Variables .env non lues | Redémarrer Vite après modification du .env |

---

## 📊 Export pour analyse géographique QGIS

```sql
-- Dans Supabase SQL Editor → exporte en CSV
SELECT titre_poste, entreprise, latitude, longitude, secteur, score_compatibilite, statut
FROM candidatures
WHERE latitude IS NOT NULL;
```

Importe le CSV dans QGIS comme couche de points pour cartographier tes candidatures.

---

## 🔄 Prochaines étapes

- [ ] Scraping automatique JobTeaser ENSG + IFP School
- [ ] Carte interactive des offres (Leaflet.js)
- [ ] Export Excel pour analyse
- [ ] Déploiement Vercel (accès depuis n'importe où)

---

*JobHunter AI · Loice Graciane Pokam · Powered by Claude API + Supabase*
