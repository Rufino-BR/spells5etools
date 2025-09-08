#!/usr/bin/env node
import Database from "better-sqlite3";
import fs from "fs-extra";

// Create a final clean module with proper data
const sourceDb = new Database("spells-5etools/packs/spells-5etools.db");
const finalDb = new Database("final-spells.db");

finalDb.pragma("journal_mode = WAL");
finalDb.exec("CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, name TEXT, type TEXT, data TEXT)");

const insert = finalDb.prepare("INSERT OR REPLACE INTO documents (id, name, type, data) VALUES (@_id, @name, @type, @data)");

// Get all spells and clean them
const allSpells = sourceDb.prepare("SELECT * FROM documents ORDER BY name").all();
console.log(`Processing ${allSpells.length} spells`);

let processedCount = 0;
const seenNames = new Set();

allSpells.forEach((spell, index) => {
  try {
    // Skip duplicates
    if (seenNames.has(spell.name)) {
      return;
    }
    seenNames.add(spell.name);
    
    const data = JSON.parse(spell.data);
    
    // Create clean, minimal data structure
    const cleanData = {
      name: data.name,
      type: "spell",
      img: data.img || "icons/magic/air/air-burst-spiral-pink.webp",
      system: {
        description: {
          value: data.system?.description?.value || ""
        },
        level: parseInt(data.system?.level) || 0,
        school: data.system?.school || "evocation",
        preparation: {
          mode: "prepared",
          prepared: false
        },
        components: {
          value: data.system?.components?.value || "",
          vocal: Boolean(data.system?.components?.vocal),
          somatic: Boolean(data.system?.components?.somatic),
          material: Boolean(data.system?.components?.material),
          ritual: Boolean(data.system?.components?.ritual)
        },
        materials: {
          value: data.system?.materials?.value || ""
        }
      }
    };
    
    // Create unique ID
    const cleanId = `spell-${index.toString().padStart(4, '0')}`;
    
    insert.run({
      _id: cleanId,
      name: spell.name,
      type: "spell",
      data: JSON.stringify(cleanData)
    });
    
    processedCount++;
    
    if (processedCount % 100 === 0) {
      console.log(`Processed ${processedCount} spells`);
    }
    
  } catch (e) {
    console.log(`Error processing ${spell.name}:`, e.message);
  }
});

sourceDb.close();
finalDb.close();

console.log(`Created final database with ${processedCount} unique spells`);
