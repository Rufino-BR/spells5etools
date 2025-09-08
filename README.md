5e Spells module (generator)

This workspace contains a simple generator that downloads public 5etools spell JSON and converts it into a FoundryVTT compendium pack for the `dnd5e` system.

Quick start:

1. Install Node.js 18+.
2. In this folder, run:
   - `npm install`
   - `npm run build`
3. The build will create `spells-5etools/packs/spells-5etools.db` and a `module.json` manifest inside `spells-5etools/`.
4. Copy the `spells-5etools/` folder to your Foundry `Data/modules/` directory (or symlink it) and enable the module in your world. A compendium called "Spells (5etools)" will appear.

Notes:

- The script fetches the public JSON mirrors under the 5etools mirrors on GitHub. If one mirror is unavailable, it tries others.
- The conversion is intentionally minimal to stay compatible across Foundry versions. You can enhance the mapper later to add full component data, ranges, saving throws, etc.
- Class and source information are preserved in `flags.og5e.*` so you can build filters or macros over them.


