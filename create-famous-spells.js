#!/usr/bin/env node
import Database from "better-sqlite3";

// Create a database with famous spells only
const sourceDb = new Database("spells-5etools/packs/spells-5etools.db");
const famousDb = new Database("famous-spells.db");

famousDb.pragma("journal_mode = WAL");
famousDb.exec("CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, name TEXT, type TEXT, data TEXT)");

const insert = famousDb.prepare("INSERT OR REPLACE INTO documents (id, name, type, data) VALUES (@_id, @name, @type, @data)");

// Get famous spells
const famousSpells = sourceDb.prepare(`
  SELECT * FROM documents 
  WHERE name IN ('Fireball', 'Magic Missile', 'Heal', 'Cure Wounds', 'Lightning Bolt', 'Bless', 'Bane', 'Charm Person', 'Detect Magic', 'Identify')
  GROUP BY name
`).all();

console.log(`Found ${famousSpells.length} famous spells`);

// Insert famous spells
famousSpells.forEach((spell, index) => {
  try {
    const data = JSON.parse(spell.data);
    
    // Clean and simplify the data
    const cleanData = {
      name: data.name,
      type: data.type,
      img: data.img || "icons/magic/air/air-burst-spiral-pink.webp",
      system: {
        description: data.system?.description || { value: "" },
        level: data.system?.level || 0,
        school: data.system?.school || "evocation",
        preparation: { mode: "prepared", prepared: false },
        components: data.system?.components || { value: "", vocal: false, somatic: false, material: false, ritual: false },
        materials: data.system?.materials || { value: "" }
      }
    };
    
    insert.run({
      _id: `famous-${index}`,
      name: spell.name,
      type: spell.type,
      data: JSON.stringify(cleanData)
    });
    
    console.log(`Added: ${spell.name}`);
  } catch (e) {
    console.log(`Error processing ${spell.name}:`, e.message);
  }
});

sourceDb.close();
famousDb.close();

console.log("Created famous spells database");
