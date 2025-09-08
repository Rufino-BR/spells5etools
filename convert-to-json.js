#!/usr/bin/env node
import Database from "better-sqlite3";
import fs from "fs-extra";

// Convert SQLite to JSON format for Foundry
const db = new Database("spells-5etools/packs/spells-5etools.db");
const spells = db.prepare("SELECT * FROM documents ORDER BY name").all();

console.log(`Converting ${spells.length} spells to JSON format`);

const jsonSpells = spells.map(spell => {
  try {
    const data = JSON.parse(spell.data);
    return {
      _id: spell.id,
      name: spell.name,
      type: spell.type,
      img: data.img || "icons/magic/air/air-burst-spiral-pink.webp",
      system: {
        description: data.system?.description || { value: "" },
        level: data.system?.level || 0,
        school: data.system?.school || "evocation",
        preparation: { mode: "prepared", prepared: false },
        components: data.system?.components || { value: "", vocal: false, somatic: false, material: false, ritual: false },
        materials: data.system?.materials || { value: "" }
      },
      flags: data.flags || {}
    };
  } catch (e) {
    console.log(`Error processing ${spell.name}:`, e.message);
    return null;
  }
}).filter(Boolean);

// Write JSON file
fs.writeJsonSync("spells-5etools.json", jsonSpells, { spaces: 2 });
console.log(`Created spells-5etools.json with ${jsonSpells.length} spells`);

db.close();
