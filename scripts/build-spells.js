#!/usr/bin/env node
import fetch from "node-fetch";
import fs from "fs-extra";
import path from "path";
import Database from "better-sqlite3";

const MODULE_ID = "spells-5etools";
const MODULE_TITLE = "Spells (5etools)";
const SYSTEM = "dnd5e";

const MIRROR_BASES = [
  // Public 5etools JSON mirrors (order matters)
  "https://raw.githubusercontent.com/5etools-mirror-2/5etools-mirror-2.github.io/master",
  "https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master",
  "https://raw.githubusercontent.com/TheGiddyLimit/5etools-data/master"
];

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function getSpells() {
  let lastErr;
  // Strategy:
  // 1) Try combined data file at /data/spells.json
  // 2) Try folder index at /data/spells/index.json then fetch each listed file
  // 3) Fallback to common per-source files list
  const fallbackFiles = [
    "data/spells/spells-phb.json",
    "data/spells/spells-xge.json",
    "data/spells/spells-tce.json",
    "data/spells/spells-scag.json",
    "data/spells/spells-ai.json",
    "data/spells/spells-ua.json"
  ];

  // 0) Local directory override via env LOCAL_5ETOOLS_DIR
  const localBase = process.env.LOCAL_5ETOOLS_DIR;
  if (localBase) {
    try {
      const spells = await getSpellsFromLocal(localBase);
      if (spells?.length) return spells;
    } catch (e) { lastErr = e; }
  }

  for (const base of MIRROR_BASES) {
    // 1) combined
    try {
      const json = await fetchJSON(`${base}/data/spells.json`);
      if (json && Array.isArray(json.spell)) return json.spell;
    } catch (e) { lastErr = e; }

    // 2) index-driven
    try {
      const index = await fetchJSON(`${base}/data/spells/index.json`);
      if (index && Array.isArray(index.items)) {
        const files = index.items.map(it => `${base}/data/spells/${it}`);
        const all = [];
        for (const f of files) {
          try {
            const j = await fetchJSON(f);
            if (j?.spell) all.push(...j.spell);
          } catch (_) { /* skip */ }
        }
        if (all.length) return all;
      }
    } catch (e) { lastErr = e; }

    // 3) fallback list
    try {
      const all = [];
      for (const f of fallbackFiles) {
        try {
          const j = await fetchJSON(`${base}/${f}`);
          if (j?.spell) all.push(...j.spell);
        } catch (_) { /* ignore */ }
      }
      if (all.length) return all;
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error("Could not download spell data from any mirror");
}

async function getSpellsFromLocal(root) {
  const base = root;
  const combined = path.join(base, "data", "spells.json");
  if (fs.existsSync(combined)) {
    const json = await fs.readJson(combined);
    if (Array.isArray(json.spell)) return json.spell;
  }
  const indexPath = path.join(base, "data", "spells", "index.json");
  if (fs.existsSync(indexPath)) {
    const index = await fs.readJson(indexPath);
    if (index && Array.isArray(index.items)) {
      const all = [];
      for (const file of index.items) {
        const p = path.join(base, "data", "spells", file);
        if (!fs.existsSync(p)) continue;
        const j = await fs.readJson(p);
        if (j?.spell) all.push(...j.spell);
      }
      if (all.length) return all;
    }
  }
  // Fallback: load all files that match spells-*.json in data/spells
  const dir = path.join(base, "data", "spells");
  if (fs.existsSync(dir)) {
    const files = (await fs.readdir(dir)).filter(f => f.startsWith("spells-") && f.endsWith(".json"));
    const all = [];
    for (const f of files) {
      const p = path.join(dir, f);
      try {
        const j = await fs.readJson(p);
        if (j?.spell) all.push(...j.spell);
      } catch (_) { /* ignore */ }
    }
    if (all.length) return all;
  }
  throw new Error(`Could not read spells locally from ${root}`);
}

function map5eToolsToFoundryItem(sp) {
  const level = sp.level ?? 0;
  const name = sp.name;
  const system = {
    description: { value: (sp.entries ? renderEntries(sp.entries) : "") },
    source: sp.source,
    level,
    school: (sp.school || "")?.toLowerCase(),
    preparation: { mode: "prepared", prepared: false },
    // Keep simple minimal fields; dnd5e system will tolerate missing optional fields
    // Components
    components: {
      value: (sp.components ? Object.keys(sp.components).join("") : ""),
      vocal: !!sp.components?.v,
      somatic: !!sp.components?.s,
      material: !!sp.components?.m,
      ritual: !!sp.meta?.ritual
    },
    materials: { value: sp.components?.m ? (typeof sp.components.m === "string" ? sp.components.m : sp.components.m?.text || "") : "" }
  };

  /**
   * Preserve extra metadata for filtering
   */
  const flags = {
    og5e: {
      classes: sp.classes || {},
      fromClassList: sp.classes?.fromClassList || [],
      level,
      school: sp.school,
      source: sp.source,
      page: sp.page
    }
  };

  return {
    name,
    type: "spell",
    img: getSpellIcon(sp),
    system,
    flags
  };
}

function renderEntries(entries) {
  // Minimal HTML renderer for 5etools entries
  const parts = [];
  const walk = (it) => {
    if (it == null) return;
    if (typeof it === "string") { parts.push(`<p>${escapeHtml(it)}</p>`); return; }
    if (Array.isArray(it)) { it.forEach(walk); return; }
    if (it.type === "entries" && it.entries) { it.entries.forEach(walk); return; }
    if (it.type === "list" && it.items) { parts.push(`<ul>`); it.items.forEach(li => parts.push(`<li>${escapeHtml(typeof li === "string" ? li : li.entry || "")}</li>`)); parts.push(`</ul>`); return; }
    if (it.type === "table") { return; }
  };
  walk(entries);
  return parts.join("\n");
}

function escapeHtml(s) { return String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

function getSpellIcon(sp) {
  const level = sp.level ?? 0;
  if (level === 0) return "icons/magic/symbols/runes-star-pentagon-blue.webp";
  return "icons/magic/air/air-burst-spiral-pink.webp";
}

function ensureModuleFiles(moduleDir) {
  fs.ensureDirSync(`${moduleDir}/packs`);
  const manifest = {
    id: MODULE_ID,
    title: MODULE_TITLE,
    description: "Compendium of D&D 5e spells generated from 5etools JSON",
    version: "0.1.0",
    compatibility: { minimum: "10", verified: "12" },
    authors: [{ name: "Generated" }],
    packs: [
      {
        name: "spells-5etools",
        label: "Spells (5etools)",
        path: "packs/spells-5etools.db",
        type: "Item",
        system: SYSTEM
      }
    ],
    relationships: { systems: [{ id: SYSTEM }] }
  };
  fs.writeJsonSync(`${moduleDir}/module.json`, manifest, { spaces: 2 });
}

function writeCompendium(dbPath, items) {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec("CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, name TEXT, type TEXT, data TEXT)");
  const insert = db.prepare("INSERT OR REPLACE INTO documents (id, name, type, data) VALUES (@_id, @name, @type, @data)");
  const run = db.transaction((rows) => rows.forEach(r => insert.run(r)));
  const rows = items.map((it, idx) => ({
    _id: cryptoLikeId(idx),
    name: it.name,
    type: it.type,
    data: JSON.stringify(it)
  }));
  run(rows);
  db.close();
}

function cryptoLikeId(i) {
  return `id-${i}-${Math.random().toString(36).slice(2, 10)}`;
}

async function main() {
  const outDir = `${process.cwd()}/${MODULE_ID}`;
  await fs.remove(outDir);
  await fs.ensureDir(outDir);
  ensureModuleFiles(outDir);

  console.log("Downloading spells from 5etools mirrors...");
  const spells = await getSpells();
  console.log(`Fetched ${spells.length} spells`);

  const mapped = spells.map(map5eToolsToFoundryItem);
  const dbPath = `${outDir}/packs/${MODULE_ID}.db`;
  writeCompendium(dbPath, mapped);
  console.log(`Wrote compendium: ${dbPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


