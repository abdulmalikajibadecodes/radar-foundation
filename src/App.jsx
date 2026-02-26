import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const SECTEURS = ["Énergie", "Environnement", "Médecine/Santé", "Finance", "Défense", "Urbanisme", "Agriculture", "Transport", "Recherche", "Autre"];
const STATUTS = ["à envoyer", "envoyé", "réponse reçue", "entretien", "refus", "accepté"];
const STATUT_COLORS = {
  "à envoyer": "#64748b", "envoyé": "#3b82f6", "réponse reçue": "#f59e0b",
  "entretien": "#8b5cf6", "refus": "#ef4444", "accepté": "#10b981"
};
const SOURCE_COLORS = {
  "APEC": "#0052cc", "LinkedIn": "#0077b5",
  "Welcome to the Jungle": "#3ddc97", "Indeed": "#003a9b",
  "JobTeaser ENSG": "#e85d04", "JobTeaser IFP": "#7b2d8b", "Autre": "#64748b"
};
const CONTRACT_COLORS = {
  "CDI": "#10b981", "CDD": "#f59e0b", "CDD 18 mois": "#f59e0b",
  "Stage": "#8b5cf6", "Alternance": "#ec4899"
};

const LATEX_TEMPLATE = `%-------------------------
% CV LaTeX - Loice Graciane Pokam
%------------------------
\\documentclass[letterpaper,11pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\definecolor{light-grey}{gray}{0.83}
\\definecolor{dark-grey}{gray}{0.3}
\\definecolor{text-grey}{gray}{.08}
\\usepackage{tgheros}
\\renewcommand*{\\familydefault}{\\sfdefault}
\\usepackage[T1]{fontenc}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{0in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}
\\titleformat{\\section}{\\bfseries \\vspace{2pt} \\raggedright \\large}{}{0em}{}[\\color{light-grey} {\\titlerule[2pt]} \\vspace{-4pt}]
\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-1pt}}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & {\\color{dark-grey}\\small #2}\\vspace{1pt}\\\\
      \\textit{#3} & {\\color{dark-grey} \\small #4}\\\\
    \\end{tabular*}\\vspace{-4pt}}
\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      #1 & {\\color{dark-grey} #2} \\\\
    \\end{tabular*}\\vspace{-4pt}}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{0pt}}
\\color{text-grey}
\\begin{document}
[CONTENU]
\\end{document}`;

// ─── MOCK JOBS ────────────────────────────────────────────────────────────────
const MOCK_JOBS = [
  { id: 1, title: "Data Scientist - Géospatial & IA", company: "IGN / Institut National", location: "Saint-Mandé, France", source: "APEC", url: "https://apec.fr", date: "2026-02-24", contract: "CDI", secteur: "Recherche", description: `Missions: Développer des modèles ML/DL pour l'analyse d'imagerie satellite. Travailler sur des pipelines de traitement de données géospatiales (Python, PostGIS). Contribuer à des projets de cartographie automatisée par deep learning.\n\nCompétences requises: Python, TensorFlow, imagerie satellite, SQL, PostGIS, Machine Learning, Deep Learning. Bonus: CDMP, ArcGIS, QGIS`, tags: ["Python", "Machine Learning", "Télédétection", "PostGIS", "Deep Learning"] },
  { id: 2, title: "Ingénieur Data Science - Transition Énergétique", company: "TotalEnergies", location: "Paris La Défense, France", source: "LinkedIn", url: "https://linkedin.com", date: "2026-02-25", contract: "CDI", secteur: "Énergie", description: `Missions: Analyse de données énergie et environnement par IA. Développement de modèles prédictifs. Traitement de données satellitaires pour monitoring d'actifs énergétiques. Data quality et gouvernance.\n\nProfil: Ingénieur Data Science/Géomatique, Python, SQL, ML, CDMP est un plus, Anglais requis`, tags: ["Python", "SQL", "Data Management", "Énergie", "Machine Learning", "CDMP"] },
  { id: 3, title: "Data Analyst - Environnement & Climat", company: "Kayrros", location: "Paris, France", source: "Welcome to the Jungle", url: "https://welcometothejungle.com", date: "2026-02-23", contract: "CDI", secteur: "Environnement", description: `Missions: Analyser des données satellitaires pour surveiller les émissions de méthane et CO2. Développer des dashboards de monitoring énergétique. Contribuer à des modèles d'IA géospatiale.\n\nStack: Python, SQL, Google Earth Engine, ArcGIS/QGIS, AWS. Passion transition énergétique, Anglais courant`, tags: ["Python", "Imagerie Satellite", "Climat", "Google Earth Engine", "AWS"] },
  { id: 4, title: "Machine Learning Engineer - Computer Vision", company: "Airbus Defence & Space", location: "Toulouse, France", source: "Indeed", url: "https://indeed.fr", date: "2026-02-22", contract: "CDI", secteur: "Défense", description: `Responsabilités: Développer des modèles DL pour détection sur imagerie satellite. Optimiser les pipelines de traitement d'images. R&D sur CNN/Transformer pour télédétection. Déploiement MLOps (Docker, CI/CD).\n\nProfil: Python, TensorFlow/PyTorch, Computer Vision, télédétection appréciée`, tags: ["Deep Learning", "Computer Vision", "Python", "TensorFlow", "Télédétection"] },
  { id: 5, title: "Stage - Data Scientist Géospatial", company: "BRGM", location: "Orléans, France", source: "JobTeaser ENSG", url: "https://ensg.jobteaser.com", date: "2026-02-26", contract: "Stage", secteur: "Environnement", description: `Stage de 6 mois - Analyse de données géologiques et environnementales par ML. Traitement d'imagerie satellite pour cartographie des risques naturels. Python, QGIS, PostgreSQL/PostGIS requis.`, tags: ["Python", "GIS", "Machine Learning", "Géologie", "Stage"] },
  { id: 6, title: "Stage - Data Engineer Énergie", company: "Schlumberger (SLB)", location: "Paris, France", source: "JobTeaser IFP", url: "https://ifpschool.jobteaser.com", date: "2026-02-25", contract: "Stage", secteur: "Énergie", description: `Stage 6 mois dans notre équipe Data & Digital. Développement de pipelines ETL pour données puits et production. Python, SQL, cloud AWS. Connaissance secteur énergie appréciée. CDMP ou data management un plus.`, tags: ["Python", "ETL", "AWS", "SQL", "Énergie"] },
];

// ─── API CALLS ────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const response = await fetch("http://localhost:3001/api/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

async function geocodeAddress(address) {
  try {
    const query = encodeURIComponent(address + ", France");
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { "User-Agent": "JobHunterAI/1.0" }
    });
    const data = await res.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
    return null;
  } catch { return null; }
}

async function analyzeJob(job, profileContent) {
  const prompt = `Tu es un expert RH senior. Analyse la compatibilité entre ce profil et cette offre.

PROFIL RÉEL DE LA CANDIDATE:
${profileContent}

OFFRE D'EMPLOI:
Titre: ${job.title}
Entreprise: ${job.company}
Contrat: ${job.contract}
Description: ${job.description}

Réponds UNIQUEMENT avec un JSON valide sans markdown:
{
  "score": 85,
  "points_forts": ["compétence1 correspond exactement", "expérience2 très pertinente", "certification3 demandée"],
  "points_faibles": ["lacune1 à combler", "manque2"],
  "lacunes": ["compétence manquante 1", "expérience manquante 2"],
  "conseil": "conseil stratégique personnalisé en une phrase"
}

Score 0-100. Sois précis et basé sur le VRAI profil fourni.`;

  const text = await callClaude(prompt);
  try {
    const clean = text.replace(/\`\`\`json|\`\`\`/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { score: 70, points_forts: ["Profil compatible"], points_faibles: [], lacunes: [], conseil: "Candidature recommandée" };
  }
}

async function generateLatexFromProfile(job, analysis, profileContent) {
  const prompt = `Tu es expert CV. Génère le contenu LaTeX pour un CV FIDÈLE et ADAPTÉ à cette offre.

PROFIL RÉEL (utilise UNIQUEMENT ces informations, n'invente rien):
${profileContent}

OFFRE CIBLE:
Titre: ${job.title}
Entreprise: ${job.company}
Contrat: ${job.contract}
Description: ${job.description}
Points forts identifiés: ${analysis?.points_forts?.join(", ")}
Lacunes: ${analysis?.lacunes?.join(", ")}

RÈGLES ABSOLUES:
1. N'invente AUCUNE compétence, expérience ou formation non présente dans le profil
2. Mets en avant les compétences du profil qui correspondent à l'offre
3. Adapte le titre et l'accroche pour ce poste spécifique
4. Utilise \\textbf{} pour les mots-clés importants pour cette offre
5. Sections: header (nom+contact+titre adapté), PROFIL, EXPÉRIENCE, PROJETS, COMPÉTENCES, FORMATION
6. Commencer par \\begin{center}, NE PAS inclure \\documentclass ou \\begin{document}
7. Tout en français sauf termes techniques

Génère uniquement le contenu LaTeX, sans commentaires.`;

  return await callClaude(prompt);
}

// ─── SUPABASE OPS ─────────────────────────────────────────────────────────────
async function saveCandidature(job, analysis, latex) {
  const geo = await geocodeAddress(job.location);
  const { data, error } = await supabase.from("candidatures").insert({
    date_candidature: new Date().toISOString().split("T")[0],
    titre_poste: job.title,
    entreprise: job.company,
    source: job.source,
    secteur: job.secteur || "Autre",
    contrat: job.contract,
    localisation: job.location,
    adresse_complete: geo?.display || job.location,
    latitude: geo?.lat || null,
    longitude: geo?.lng || null,
    statut: "à envoyer",
    score_compatibilite: analysis?.score || null,
    points_forts: analysis?.points_forts || [],
    points_faibles: analysis?.points_faibles || [],
    lacunes: analysis?.lacunes || [],
    conseil: analysis?.conseil || "",
    cv_latex: latex || "",
    notes: "",
    url_offre: job.url || "",
    description_offre: job.description || "",
  }).select();
  return { data, error };
}

async function loadCandidatures() {
  const { data } = await supabase.from("candidatures").select("*").order("created_at", { ascending: false });
  return data || [];
}

async function updateStatut(id, statut) {
  await supabase.from("candidatures").update({ statut }).eq("id", id);
}

async function updateNotes(id, notes) {
  await supabase.from("candidatures").update({ notes }).eq("id", id);
}

async function loadProfil() {
  const { data } = await supabase.from("profil").select("*").eq("actif", true).order("created_at", { ascending: false });
  return data || [];
}

async function saveProfil(type, titre, contenu) {
  const { data } = await supabase.from("profil").insert({ type, titre, contenu, actif: true }).select();
  return data;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color, fontFamily: "'Space Mono', monospace" }}>{score}</div>
    </div>
  );
}

function Tag({ label, color = "#334155" }) {
  return (
    <span style={{ background: color+"22", color, border: `1px solid ${color}44`,
      borderRadius: 4, padding: "2px 8px", fontSize: 11,
      fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>{label}</span>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000,
      background: toast.type === "error" ? "#1a0a0a" : "#0a1a14",
      border: `1px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
      color: toast.type === "error" ? "#ef4444" : "#6ee7b7",
      padding: "10px 16px", borderRadius: 8,
      fontFamily: "'Space Mono', monospace", fontSize: 12,
      boxShadow: "0 4px 20px #0008" }}>{toast.msg}</div>
  );
}

// ─── PROFIL PANEL ─────────────────────────────────────────────────────────────
function ProfilPanel({ profilItems, onRefresh, showToast }) {
  const [tab, setTab] = useState("list");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!titre || !contenu) return showToast("Titre et contenu requis", "error");
    setSaving(true);
    await saveProfil("experience_manuelle", titre, contenu);
    setSaving(false);
    setTitre(""); setContenu("");
    onRefresh();
    showToast("Expérience ajoutée !");
    setTab("list");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const contenu = ev.target.result;
      await saveProfil("cv_upload", file.name, contenu);
      onRefresh();
      showToast(`CV "${file.name}" uploadé !`);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
          👤 Mon Profil
        </h2>
        <div style={{ display: "flex", gap: 6 }}>
          {["list", "add", "upload"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
              background: tab === t ? "#1e3a5f" : "#1e293b",
              color: tab === t ? "#93c5fd" : "#64748b",
              fontSize: 11, fontFamily: "'Space Mono', monospace"
            }}>{t === "list" ? "📋 Voir" : t === "add" ? "✏️ Ajouter" : "📎 Upload CV"}</button>
          ))}
        </div>
      </div>

      {tab === "list" && (
        <div>
          {profilItems.length === 0 ? (
            <div style={{ color: "#475569", fontSize: 12, fontFamily: "'Space Mono', monospace", textAlign: "center", padding: 20 }}>
              Aucun élément de profil. Ajoute ton CV ou des expériences !
            </div>
          ) : profilItems.map(item => (
            <div key={item.id} style={{ background: "#0a0f1a", border: "1px solid #1e293b",
              borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: item.type === "cv_upload" ? "#8b5cf6" : "#3b82f6",
                  background: item.type === "cv_upload" ? "#2d1b6922" : "#1e3a5f22",
                  border: `1px solid ${item.type === "cv_upload" ? "#8b5cf644" : "#3b82f644"}`,
                  borderRadius: 4, padding: "1px 6px", fontFamily: "'Space Mono', monospace" }}>
                  {item.type === "cv_upload" ? "📎 CV" : "✏️ Exp"}
                </span>
                <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>{item.titre}</span>
              </div>
              <div style={{ color: "#475569", fontSize: 11, fontFamily: "'Space Mono', monospace",
                whiteSpace: "pre-wrap", maxHeight: 60, overflow: "hidden" }}>
                {item.contenu.slice(0, 150)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "add" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input value={titre} onChange={e => setTitre(e.target.value)}
            placeholder="Titre (ex: Stage TotalEnergies 2025)"
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #1e293b",
              background: "#0a0f1a", color: "#f1f5f9", fontSize: 12,
              fontFamily: "'Space Mono', monospace", outline: "none" }} />
          <textarea value={contenu} onChange={e => setContenu(e.target.value)}
            placeholder="Décris ton expérience, compétences, formations..."
            rows={6} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #1e293b",
              background: "#0a0f1a", color: "#f1f5f9", fontSize: 12,
              fontFamily: "'Space Mono', monospace", outline: "none", resize: "vertical" }} />
          <button onClick={handleSave} disabled={saving} style={{
            padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
            background: "#1a3a2a", color: "#6ee7b7",
            fontSize: 12, fontFamily: "'Space Mono', monospace"
          }}>{saving ? "⏳ Sauvegarde..." : "✅ Sauvegarder"}</button>
        </div>
      )}

      {tab === "upload" && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ color: "#64748b", fontSize: 12, fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>
            Upload un fichier .txt ou .tex contenant ton CV
          </div>
          <input type="file" accept=".txt,.tex,.md" onChange={handleFileUpload}
            style={{ color: "#94a3b8", fontSize: 12, fontFamily: "'Space Mono', monospace" }} />
          <div style={{ color: "#475569", fontSize: 11, marginTop: 8, fontFamily: "'Space Mono', monospace" }}>
            💡 Copie le texte de ton CV dans un fichier .txt pour l'uploader
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CANDIDATURES TRACKER ─────────────────────────────────────────────────────
function CandidaturesTracker({ candidatures, onRefresh, showToast }) {
  const [editNotes, setEditNotes] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const handleStatut = async (id, statut) => {
    await updateStatut(id, statut);
    onRefresh();
    showToast("Statut mis à jour !");
  };

  const handleNotes = async (id) => {
    await updateNotes(id, editNotes[id] || "");
    onRefresh();
    showToast("Notes sauvegardées !");
  };

  if (candidatures.length === 0) {
    return (
      <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 12, padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
        <div style={{ color: "#475569", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
          Aucune candidature. Génère un CV et sauvegarde une candidature !
        </div>
      </div>
    );
  }

  // Stats
  const statsByStatut = STATUTS.reduce((acc, s) => {
    acc[s] = candidatures.filter(c => c.statut === s).length;
    return acc;
  }, {});
  const avgScore = candidatures.filter(c => c.score_compatibilite).length
    ? Math.round(candidatures.filter(c => c.score_compatibilite).reduce((s, c) => s + c.score_compatibilite, 0) / candidatures.filter(c => c.score_compatibilite).length)
    : null;

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(statsByStatut).filter(([,v]) => v > 0).map(([statut, count]) => (
          <div key={statut} style={{ background: (STATUT_COLORS[statut]||"#64748b")+"22",
            border: `1px solid ${(STATUT_COLORS[statut]||"#64748b")}44`,
            borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: STATUT_COLORS[statut]||"#64748b", fontSize: 18, fontWeight: 800,
              fontFamily: "'Space Mono', monospace" }}>{count}</span>
            <span style={{ color: "#64748b", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>{statut}</span>
          </div>
        ))}
        {avgScore && (
          <div style={{ background: "#10b98122", border: "1px solid #10b98144",
            borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#10b981", fontSize: 18, fontWeight: 800, fontFamily: "'Space Mono', monospace" }}>{avgScore}%</span>
            <span style={{ color: "#64748b", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>score moyen</span>
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {candidatures.map(c => (
          <div key={c.id} style={{ background: "#0d1117", border: "1px solid #1e293b",
            borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <Tag label={c.source} color={SOURCE_COLORS[c.source]||"#64748b"} />
                  <Tag label={c.contrat} color={CONTRACT_COLORS[c.contrat]||"#64748b"} />
                  <Tag label={c.secteur} color="#8b5cf6" />
                </div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13, marginBottom: 2,
                  fontFamily: "'Sora', sans-serif" }}>{c.titre_poste}</div>
                <div style={{ color: "#64748b", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
                  {c.entreprise} · {c.localisation} · {c.date_candidature}
                  {c.latitude && <span style={{ color: "#3b82f6" }}> 📍 {c.latitude?.toFixed(2)}, {c.longitude?.toFixed(2)}</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {c.score_compatibilite && <ScoreRing score={c.score_compatibilite} size={44} />}
                <select value={c.statut} onChange={e => handleStatut(c.id, e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${(STATUT_COLORS[c.statut]||"#64748b")}44`,
                    background: (STATUT_COLORS[c.statut]||"#64748b")+"22",
                    color: STATUT_COLORS[c.statut]||"#64748b",
                    fontSize: 11, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>
                  {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #1e293b",
                    background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 12 }}>
                  {expandedId === c.id ? "▲" : "▼"}
                </button>
              </div>
            </div>

            {expandedId === c.id && (
              <div style={{ marginTop: 12, borderTop: "1px solid #1e293b", paddingTop: 12 }}>
                {c.lacunes?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ color: "#f59e0b", fontSize: 11, fontFamily: "'Space Mono', monospace",
                      marginBottom: 4, fontWeight: 700 }}>⚠️ Lacunes identifiées:</div>
                    {c.lacunes.map((l, i) => (
                      <div key={i} style={{ color: "#94a3b8", fontSize: 11,
                        fontFamily: "'Space Mono', monospace" }}>• {l}</div>
                    ))}
                  </div>
                )}
                {c.conseil && (
                  <div style={{ background: "#1e293b", borderRadius: 6, padding: "6px 10px",
                    color: "#cbd5e1", fontSize: 11, fontStyle: "italic",
                    fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>
                    💡 {c.conseil}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <textarea
                    value={editNotes[c.id] !== undefined ? editNotes[c.id] : (c.notes || "")}
                    onChange={e => setEditNotes(p => ({ ...p, [c.id]: e.target.value }))}
                    placeholder="Notes personnelles..."
                    rows={2}
                    style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid #1e293b",
                      background: "#0a0f1a", color: "#94a3b8", fontSize: 11,
                      fontFamily: "'Space Mono', monospace", resize: "none", outline: "none" }} />
                  <button onClick={() => handleNotes(c.id)}
                    style={{ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                      background: "#1a3a2a", color: "#6ee7b7", fontSize: 11,
                      fontFamily: "'Space Mono', monospace", alignSelf: "flex-end" }}>
                    💾
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LATEX MODAL ──────────────────────────────────────────────────────────────
function LatexModal({ latex, job, onClose, onSave, saving }) {
  const [copied, setCopied] = useState(false);
  const fullLatex = LATEX_TEMPLATE.replace("[CONTENU]", latex);

  const copy = () => {
    navigator.clipboard.writeText(fullLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([fullLatex], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_Pokam_${job.company.replace(/\s+/g, "_")}.tex`;
    a.click();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)", padding: 20 }}>
      <div style={{ background: "#0d1117", border: "1px solid #1e293b",
        borderRadius: 16, width: "100%", maxWidth: 820,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 60px #000a" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #1e293b" }}>
          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15,
              fontFamily: "'Sora', sans-serif" }}>CV LaTeX — {job.company}</div>
            <div style={{ color: "#64748b", fontSize: 12,
              fontFamily: "'Space Mono', monospace" }}>{job.title}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copy} style={{ padding: "7px 14px", borderRadius: 8,
              border: "1px solid #1e293b", background: copied ? "#1a3a2a" : "#1e293b",
              color: copied ? "#6ee7b7" : "#94a3b8", cursor: "pointer",
              fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
              {copied ? "✓ Copié!" : "📋 Copier"}
            </button>
            <button onClick={download} style={{ padding: "7px 14px", borderRadius: 8,
              border: "none", background: "#1e3a5f", color: "#93c5fd",
              cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
              ⬇ .tex
            </button>
            <button onClick={onSave} disabled={saving} style={{ padding: "7px 14px", borderRadius: 8,
              border: "none", background: saving ? "#1e293b" : "#1a3a2a",
              color: saving ? "#475569" : "#6ee7b7",
              cursor: saving ? "wait" : "pointer",
              fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
              {saving ? "⏳..." : "💾 Sauvegarder"}
            </button>
            <button onClick={onClose} style={{ padding: "7px 12px", borderRadius: 8,
              border: "1px solid #1e293b", background: "transparent",
              color: "#ef4444", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "8px 20px", background: "#1a3a2a44",
          borderBottom: "1px solid #1e293b", color: "#6ee7b7",
          fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
          💡 Compile sur overleaf.com (gratuit) · Upload le fichier .tex
        </div>
        <pre style={{ flex: 1, overflow: "auto", margin: 0, padding: "16px 20px",
          color: "#94a3b8", fontSize: 11, lineHeight: 1.6,
          fontFamily: "'Space Mono', monospace", background: "transparent" }}>
          {fullLatex}
        </pre>
      </div>
    </div>
  );
}

// ─── JOB CARD ─────────────────────────────────────────────────────────────────
function JobCard({ job, analysis, onAnalyze, onGenerate, isAnalyzing, isGenerating }) {
  return (
    <div style={{ background: "#0d1117", border: "1px solid #1e293b",
      borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
            <Tag label={job.source} color={SOURCE_COLORS[job.source]||"#64748b"} />
            <Tag label={job.contract} color={CONTRACT_COLORS[job.contract]||"#64748b"} />
            <Tag label={job.secteur} color="#8b5cf6" />
          </div>
          <h3 style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 700, margin: 0,
            marginBottom: 2, fontFamily: "'Sora', sans-serif" }}>{job.title}</h3>
          <div style={{ color: "#64748b", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
            {job.company} · {job.location}
          </div>
        </div>
        {analysis && <ScoreRing score={analysis.score} />}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {job.tags.slice(0, 4).map(t => <Tag key={t} label={t} color="#3b82f6" />)}
      </div>

      {analysis && (
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8, marginBottom: 10 }}>
          {analysis.points_forts?.slice(0,2).map(p => (
            <div key={p} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
              <span style={{ color: "#10b981", fontSize: 10 }}>✓</span>
              <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>{p}</span>
            </div>
          ))}
          {analysis.lacunes?.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              <span style={{ color: "#f59e0b", fontSize: 10 }}>⚠</span>
              <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
                {analysis.lacunes[0]}
              </span>
            </div>
          )}
          {analysis.conseil && (
            <div style={{ background: "#1e293b", borderRadius: 6, padding: "5px 8px",
              color: "#cbd5e1", fontSize: 10, fontStyle: "italic",
              fontFamily: "'Space Mono', monospace" }}>💡 {analysis.conseil}</div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onAnalyze(job)} disabled={isAnalyzing} style={{
          flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
          cursor: isAnalyzing ? "wait" : "pointer",
          background: isAnalyzing ? "#1e293b" : "#1e3a5f",
          color: isAnalyzing ? "#475569" : "#93c5fd",
          fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
          {isAnalyzing ? "⏳ Analyse..." : analysis ? "🔄 Ré-analyser" : "🔍 Analyser"}
        </button>
        <button onClick={() => onGenerate(job, analysis)} disabled={isGenerating || !analysis} style={{
          flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
          cursor: (isGenerating || !analysis) ? "not-allowed" : "pointer",
          background: (isGenerating || !analysis) ? "#1e293b" : "#1a3a2a",
          color: (isGenerating || !analysis) ? "#475569" : "#6ee7b7",
          fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
          {isGenerating ? "⏳ Génère..." : "📄 CV LaTeX"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("offres");
  const [jobs] = useState(MOCK_JOBS);
  const [analyses, setAnalyses] = useState({});
  const [analyzing, setAnalyzing] = useState({});
  const [generating, setGenerating] = useState({});
  const [latexModal, setLatexModal] = useState(null);
  const [savingCandidature, setSavingCandidature] = useState(false);
  const [toast, setToast] = useState(null);
  const [profilItems, setProfilItems] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [analyzeAll, setAnalyzeAll] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getProfileContent = () => {
    if (profilItems.length === 0) return `Loice Graciane Pokam — Ingénieur Géomatique & Data Scientist
Compétences: Python, ML, Deep Learning, GIS, Télédétection, PostGIS, CDMP
Expériences: TotalEnergies (IA Géospatiale), Institut Curie (Data Science), IGN (Géomatique)
Formation: ENSG & IFP School Ingénieur Géomatique, Master Géomatique Tunis`;
    return profilItems.map(p => `[${p.titre}]\n${p.contenu}`).join("\n\n");
  };

  const refreshProfil = async () => {
    const data = await loadProfil();
    setProfilItems(data);
  };

  const refreshCandidatures = async () => {
    const data = await loadCandidatures();
    setCandidatures(data);
  };

  useEffect(() => {
    refreshProfil();
    refreshCandidatures();
  }, []);

  const handleAnalyze = useCallback(async (job) => {
    setAnalyzing(p => ({ ...p, [job.id]: true }));
    try {
      const result = await analyzeJob(job, getProfileContent());
      setAnalyses(p => ({ ...p, [job.id]: result }));
      showToast(`Score: ${result.score}/100 pour ${job.company}`);
    } catch {
      showToast("Erreur lors de l'analyse", "error");
    } finally {
      setAnalyzing(p => ({ ...p, [job.id]: false }));
    }
  }, [profilItems]);

  const handleAnalyzeAll = async () => {
    setAnalyzeAll(true);
    for (const job of filteredJobs) {
      if (!analyses[job.id]) {
        await handleAnalyze(job);
        await new Promise(r => setTimeout(r, 600));
      }
    }
    setAnalyzeAll(false);
    showToast("Toutes les offres analysées !");
  };

  const handleGenerate = useCallback(async (job, analysis) => {
    setGenerating(p => ({ ...p, [job.id]: true }));
    try {
      const latex = await generateLatexFromProfile(job, analysis, getProfileContent());
      setLatexModal({ latex, job, analysis });
      showToast(`CV généré pour ${job.company} !`);
    } catch {
      showToast("Erreur génération CV", "error");
    } finally {
      setGenerating(p => ({ ...p, [job.id]: false }));
    }
  }, [profilItems]);

  const handleSaveCandidature = async () => {
    if (!latexModal) return;
    setSavingCandidature(true);
    const { error } = await saveCandidature(latexModal.job, latexModal.analysis, latexModal.latex);
    setSavingCandidature(false);
    if (error) {
      showToast("Erreur Supabase: " + error.message, "error");
    } else {
      showToast("Candidature sauvegardée dans Supabase !");
      refreshCandidatures();
      setLatexModal(null);
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (filter === "stage" && j.contract !== "Stage") return false;
    if (filter === "cdi" && j.contract !== "CDI") return false;
    if (filter === "high" && (!analyses[j.id] || analyses[j.id].score < 80)) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      return j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
        || j.tags.some(t => t.toLowerCase().includes(q)) || j.secteur?.toLowerCase().includes(q);
    }
    return true;
  });

  const avgScore = Object.values(analyses).length
    ? Math.round(Object.values(analyses).reduce((s, a) => s + a.score, 0) / Object.values(analyses).length)
    : null;

  const tabs = [
    { id: "offres", label: "🎯 Offres", count: jobs.length },
    { id: "profil", label: "👤 Profil", count: profilItems.length },
    { id: "candidatures", label: "📊 Candidatures", count: candidatures.length },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c14; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        button:hover:not(:disabled) { opacity: 0.85; }
        select option { background: #0d1117; }
      `}</style>

      <Toast toast={toast} />
      {latexModal && <LatexModal latex={latexModal.latex} job={latexModal.job}
        onClose={() => setLatexModal(null)}
        onSave={handleSaveCandidature} saving={savingCandidature} />}

      <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'Sora', sans-serif", color: "#f1f5f9" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #1e293b", background: "#0d1117", padding: "0 32px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 0",
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎯</div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 800 }}>
                  JobHunter <span style={{ color: "#3b82f6" }}>AI</span>
                </h1>
                <p style={{ color: "#475569", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
                  Loice Graciane Pokam · Ingénieur Géomatique & Data Scientist
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "Offres", value: jobs.length, color: "#3b82f6" },
                { label: "Analysées", value: Object.keys(analyses).length, color: "#8b5cf6" },
                { label: "Candidatures", value: candidatures.length, color: "#10b981" },
                { label: "Score moy.", value: avgScore ? `${avgScore}%` : "—", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color,
                    fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#475569",
                    fontFamily: "'Space Mono', monospace" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, maxWidth: 1200, margin: "0 auto" }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: "10px 20px", border: "none", cursor: "pointer",
                background: "transparent", fontFamily: "'Space Mono', monospace",
                fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 400,
                color: activeTab === tab.id ? "#f1f5f9" : "#475569",
                borderBottom: activeTab === tab.id ? "2px solid #3b82f6" : "2px solid transparent",
                transition: "all 0.2s"
              }}>
                {tab.label} {tab.count > 0 && <span style={{
                  background: "#1e293b", borderRadius: 10, padding: "1px 6px",
                  fontSize: 10, marginLeft: 4
                }}>{tab.count}</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px" }}>
          {/* OFFRES TAB */}
          {activeTab === "offres" && (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <input value={searchText} onChange={e => setSearchText(e.target.value)}
                  placeholder="🔍 Poste, entreprise, compétence, secteur..."
                  style={{ flex: 1, minWidth: 200, padding: "8px 14px", borderRadius: 8,
                    border: "1px solid #1e293b", background: "#0d1117",
                    color: "#f1f5f9", fontSize: 12, fontFamily: "'Space Mono', monospace", outline: "none" }} />
                <select value={filter} onChange={e => setFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #1e293b",
                    background: "#0d1117", color: "#94a3b8", fontSize: 11,
                    fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>
                  <option value="all">Tous contrats</option>
                  <option value="stage">Stages uniquement</option>
                  <option value="cdi">CDI uniquement</option>
                  <option value="high">Score ≥ 80%</option>
                </select>
                <button onClick={handleAnalyzeAll} disabled={analyzeAll} style={{
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  background: analyzeAll ? "#1e293b" : "#2d1b69",
                  color: analyzeAll ? "#475569" : "#a78bfa",
                  cursor: analyzeAll ? "wait" : "pointer",
                  fontSize: 11, fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
                  {analyzeAll ? "⏳ Analyse..." : "⚡ Analyser tout"}
                </button>
              </div>

              {profilItems.length === 0 && (
                <div style={{ background: "#1a1a0a", border: "1px solid #f59e0b44",
                  borderRadius: 10, padding: "10px 16px", marginBottom: 16,
                  color: "#f59e0b", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
                  ⚠️ Profil vide — les CVs générés utiliseront un profil par défaut. Va dans "Profil" pour ajouter ton vrai CV !
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
                {filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} analysis={analyses[job.id]}
                    onAnalyze={handleAnalyze} onGenerate={handleGenerate}
                    isAnalyzing={!!analyzing[job.id]} isGenerating={!!generating[job.id]} />
                ))}
              </div>
            </>
          )}

          {/* PROFIL TAB */}
          {activeTab === "profil" && (
            <ProfilPanel profilItems={profilItems} onRefresh={refreshProfil} showToast={showToast} />
          )}

          {/* CANDIDATURES TAB */}
          {activeTab === "candidatures" && (
            <CandidaturesTracker candidatures={candidatures}
              onRefresh={refreshCandidatures} showToast={showToast} />
          )}
        </div>
      </div>
    </>
  );
}
