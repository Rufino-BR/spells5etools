Hooks.once("init", function() {
    console.log("Spells 5etools | Initializing enhanced search functionality");
});

Hooks.on("ready", function() {
    console.log("Spells 5etools | Ready - Adding custom search filters");
    
    // Estender a funcionalidade de busca do compêndio
    if (game.packs) {
        const spellsPack = game.packs.get("spells-5etools.spells-5etools");
        if (spellsPack) {
            console.log("Spells 5etools | Found spells pack, enhancing search");
            
            // Interceptar a busca do compêndio
            const originalSearch = spellsPack.search;
            spellsPack.search = function(query, options = {}) {
                console.log("Spells 5etools | Custom search for:", query);
                
                // Se a busca original não retornar resultados, tentar busca customizada
                const originalResults = originalSearch.call(this, query, options);
                
                if (originalResults.length === 0) {
                    console.log("Spells 5etools | No results from original search, trying custom search");
                    return this.searchCustom(query, options);
                }
                
                return originalResults;
            };
            
            // Adicionar método de busca customizada
            spellsPack.searchCustom = function(query, options = {}) {
                const searchTerm = query.toLowerCase();
                const results = [];
                
                // Mapeamento de termos de busca
                const searchMap = {
                    "cleric": ["heal-5etools", "bless-5etools"],
                    "druid": ["heal-5etools"],
                    "paladin": ["bless-5etools"],
                    "sorcerer": ["fireball-5etools"],
                    "wizard": ["fireball-5etools"],
                    "level 1": ["bless-5etools"],
                    "level 3": ["fireball-5etools"],
                    "level 6": ["heal-5etools"],
                    "evocation": ["fireball-5etools", "heal-5etools"],
                    "enchantment": ["bless-5etools"],
                    "healing": ["heal-5etools"],
                    "damage": ["fireball-5etools"],
                    "fire": ["fireball-5etools"],
                    "blessing": ["bless-5etools"]
                };
                
                // Buscar por termo exato
                if (searchMap[searchTerm]) {
                    console.log("Spells 5etools | Found exact match for:", searchTerm);
                    for (const spellId of searchMap[searchTerm]) {
                        const spell = this.get(spellId);
                        if (spell) {
                            results.push(spell);
                        }
                    }
                }
                
                // Buscar por termo parcial
                if (results.length === 0) {
                    console.log("Spells 5etools | No exact match, trying partial search");
                    for (const [term, spellIds] of Object.entries(searchMap)) {
                        if (term.includes(searchTerm) || searchTerm.includes(term)) {
                            for (const spellId of spellIds) {
                                const spell = this.get(spellId);
                                if (spell && !results.includes(spell)) {
                                    results.push(spell);
                                }
                            }
                        }
                    }
                }
                
                console.log("Spells 5etools | Custom search results:", results.length);
                return results;
            };
        }
    }
});

// Adicionar filtros visuais na interface
Hooks.on("renderCompendium", function(compendium, html, data) {
    if (compendium.collection.metadata.id === "spells-5etools.spells-5etools") {
        console.log("Spells 5etools | Rendering custom filters");
        
        // Adicionar botões de filtro rápido
        const filterButtons = $(`
            <div class="spells-5etools-filters" style="margin: 10px 0; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #fff;">Filtros Rápidos:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                    <button class="filter-btn" data-filter="cleric" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Cleric</button>
                    <button class="filter-btn" data-filter="wizard" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Wizard</button>
                    <button class="filter-btn" data-filter="paladin" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Paladin</button>
                    <button class="filter-btn" data-filter="druid" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Druid</button>
                    <button class="filter-btn" data-filter="sorcerer" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Sorcerer</button>
                    <button class="filter-btn" data-filter="level 1" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Level 1</button>
                    <button class="filter-btn" data-filter="level 3" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Level 3</button>
                    <button class="filter-btn" data-filter="level 6" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Level 6</button>
                    <button class="filter-btn" data-filter="healing" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Healing</button>
                    <button class="filter-btn" data-filter="damage" style="padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 3px; cursor: pointer;">Damage</button>
                </div>
            </div>
        `);
        
        // Inserir os botões antes da lista de itens
        html.find('.directory-list').before(filterButtons);
        
        // Adicionar event listeners para os botões
        html.find('.filter-btn').on('click', function() {
            const filter = $(this).data('filter');
            console.log("Spells 5etools | Filter clicked:", filter);
            
            // Limpar busca anterior
            html.find('input[type="search"]').val('');
            
            // Aplicar filtro
            const spellsPack = game.packs.get("spells-5etools.spells-5etools");
            if (spellsPack) {
                const results = spellsPack.searchCustom(filter);
                console.log("Spells 5etools | Filter results:", results.length);
                
                // Atualizar a lista de itens
                const list = html.find('.directory-list');
                list.empty();
                
                results.forEach(spell => {
                    const item = $(`
                        <li class="directory-item document spells-5etools-item" data-document-id="${spell.id}">
                            <div class="document-name">
                                <img src="${spell.img}" alt="${spell.name}" style="width: 20px; height: 20px; margin-right: 5px;">
                                <span>${spell.name}</span>
                            </div>
                        </li>
                    `);
                    list.append(item);
                });
                
                // Destacar botão ativo
                html.find('.filter-btn').removeClass('active');
                $(this).addClass('active').css('background', '#2d3748');
            }
        });
        
        // Botão para limpar filtros
        const clearButton = $(`
            <button class="clear-filters" style="padding: 5px 10px; background: #e53e3e; color: white; border: none; border-radius: 3px; cursor: pointer; margin-left: 10px;">Limpar</button>
        `);
        
        html.find('.spells-5etools-filters').append(clearButton);
        
        clearButton.on('click', function() {
            console.log("Spells 5etools | Clearing filters");
            html.find('.filter-btn').removeClass('active').css('background', '#4a5568');
            html.find('input[type="search"]').val('');
            
            // Recarregar o compêndio
            compendium.render(true);
        });
    }
});
