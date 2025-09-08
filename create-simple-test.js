#!/usr/bin/env node
import Database from "better-sqlite3";
import fs from "fs-extra";

// Create a simple test compendium with minimal data
const db = new Database("simple-test.db");
db.pragma("journal_mode = WAL");
db.exec("CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, name TEXT, type TEXT, data TEXT)");

const insert = db.prepare("INSERT OR REPLACE INTO documents (id, name, type, data) VALUES (@_id, @name, @type, @data)");

// Create 3 simple spells with minimal data
const spells = [
  {
    _id: "fireball-001",
    name: "Fireball",
    type: "spell",
    data: JSON.stringify({
      name: "Fireball",
      type: "spell",
      img: "icons/magic/fire/explosion-fire-large.webp",
      system: {
        description: { value: "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame." },
        level: 3,
        school: "evocation",
        preparation: { mode: "prepared", prepared: false },
        components: { value: "vsm", vocal: true, somatic: true, material: true, ritual: false },
        materials: { value: "a tiny ball of bat guano and sulfur" }
      }
    })
  },
  {
    _id: "heal-001", 
    name: "Heal",
    type: "spell",
    data: JSON.stringify({
      name: "Heal",
      type: "spell", 
      img: "icons/magic/healing/bandage-wrapped-staff-gold.webp",
      system: {
        description: { value: "Choose a creature that you can see within range. A surge of positive energy washes through the creature, causing it to regain 70 hit points." },
        level: 6,
        school: "evocation",
        preparation: { mode: "prepared", prepared: false },
        components: { value: "vs", vocal: true, somatic: true, material: false, ritual: false },
        materials: { value: "" }
      }
    })
  },
  {
    _id: "magic-missile-001",
    name: "Magic Missile", 
    type: "spell",
    data: JSON.stringify({
      name: "Magic Missile",
      type: "spell",
      img: "icons/magic/light/energy-bolt-blue.webp", 
      system: {
        description: { value: "You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range." },
        level: 1,
        school: "evocation",
        preparation: { mode: "prepared", prepared: false },
        components: { value: "vs", vocal: true, somatic: true, material: false, ritual: false },
        materials: { value: "" }
      }
    })
  }
];

spells.forEach(spell => insert.run(spell));
db.close();

console.log("Created simple test compendium with 3 spells");
