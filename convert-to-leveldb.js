#!/usr/bin/env node
import Database from "better-sqlite3";
import fs from "fs-extra";
import { Level } from "level";

// Convert SQLite to LevelDB format for Foundry
const sqliteDb = new Database("final-module/packs/final-spells.db");
const levelDb = new Level("leveldb-spells");

console.log("Converting SQLite to LevelDB format...");

// Get all spells from SQLite
const spells = sqliteDb.prepare("SELECT * FROM documents ORDER BY name").all();
console.log(`Processing ${spells.length} spells`);

// Convert to LevelDB format
let count = 0;
for (const spell of spells) {
  try {
    // LevelDB uses specific key format for Foundry
    const key = `_id:${spell.id}`;
    const value = spell.data;
    
    await levelDb.put(key, value);
    count++;
    
    if (count % 100 === 0) {
      console.log(`Processed ${count} spells`);
    }
  } catch (e) {
    console.log(`Error processing ${spell.name}:`, e.message);
  }
}

await levelDb.close();
sqliteDb.close();

console.log(`Converted ${count} spells to LevelDB format`);
console.log("LevelDB files created in leveldb-spells/ directory");
