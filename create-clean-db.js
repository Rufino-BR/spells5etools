#!/usr/bin/env node
import Database from "better-sqlite3";
import fs from "fs-extra";

// Create a clean database without duplicates
const sourceDb = new Database("spells-5etools/packs/spells-5etools.db");
const cleanDb = new Database("clean-spells.db");

cleanDb.pragma("journal_mode = WAL");
cleanDb.exec("CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, name TEXT, type TEXT, data TEXT)");

const insert = cleanDb.prepare("INSERT OR REPLACE INTO documents (id, name, type, data) VALUES (@_id, @name, @type, @data)");

// Get unique spells (take first occurrence of each name)
const uniqueSpells = sourceDb.prepare(`
  SELECT * FROM documents 
  WHERE name IN (
    SELECT name FROM documents 
    GROUP BY name 
    HAVING COUNT(*) = 1
  )
  ORDER BY name
`).all();

console.log(`Found ${uniqueSpells.length} unique spells`);

// Insert unique spells
uniqueSpells.forEach((spell, index) => {
  try {
    // Clean the data - remove problematic fields
    const data = JSON.parse(spell.data);
    
    // Simplify the data structure
    const cleanData = {
      name: data.name,
      type: data.type,
      img: data.img || "icons/magic/air/air-burst-spiral-pink.webp",
      system: {
        description: data.system?.description || { value: "" },
        level: data.system?.level || 0,
        school: data.system?.school || "evocation",
        preparation: data.system?.preparation || { mode: "prepared", prepared: false },
        components: data.system?.components || { value: "", vocal: false, somatic: false, material: false, ritual: false },
        materials: data.system?.materials || { value: "" }
      }
    };
    
    insert.run({
      _id: `clean-${index}`,
      name: spell.name,
      type: spell.type,
      data: JSON.stringify(cleanData)
    });
  } catch (e) {
    console.log(`Error processing ${spell.name}:`, e.message);
  }
});

sourceDb.close();
cleanDb.close();

console.log("Created clean database");
