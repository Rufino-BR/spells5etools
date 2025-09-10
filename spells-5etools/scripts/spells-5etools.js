// Script para habilitar busca por classes no compendium de magias
Hooks.once('ready', () => {
    console.log('🔮 Spells 5etools: Inicializando filtros de classe...');
    
    // Aguardar o compendium estar carregado
    const compendium = game.packs.get('spells-5etools.spells-5etools');
    if (!compendium) {
        console.warn('⚠️ Compendium spells-5etools não encontrado!');
        return;
    }
    
    // Estender a funcionalidade de busca do compendium
    const originalSearch = compendium.search;
    compendium.search = function(query, options = {}) {
        console.log('🔍 Buscando por:', query);
        
        // Se a busca contém uma classe, filtrar por ela
        const classNames = ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger', 'warlock', 'artificer'];
        const foundClass = classNames.find(cls => query.toLowerCase().includes(cls));
        
        if (foundClass) {
            console.log(`🎯 Filtrando por classe: ${foundClass}`);
            
            // Buscar todas as magias
            return compendium.getDocuments().then(documents => {
                const filtered = documents.filter(doc => {
                    // Verificar se a magia tem a classe procurada
                    if (doc.system && doc.system.classes && doc.system.classes.value) {
                        return doc.system.classes.value.includes(foundClass);
                    }
                    
                    // Verificar campos de busca customizados
                    if (doc.system && doc.system.searchable) {
                        return doc.system.searchable.classes.includes(foundClass) ||
                               doc.system.searchable.classNames.toLowerCase().includes(foundClass);
                    }
                    
                    // Verificar no nome da magia
                    return doc.name.toLowerCase().includes(foundClass);
                });
                
                console.log(`✅ Encontradas ${filtered.length} magias para ${foundClass}`);
                return filtered;
            });
        }
        
        // Se não é busca por classe, usar busca normal
        return originalSearch.call(this, query, options);
    };
    
    console.log('✅ Filtros de classe habilitados!');
    console.log('🎯 Agora você pode buscar por: cleric, wizard, sorcerer, bard, druid, paladin, ranger, warlock, artificer');
});

// Adicionar botões de filtro rápido na interface
Hooks.on('renderCompendium', (compendium, html, data) => {
    if (compendium.collection.metadata.id !== 'spells-5etools.spells-5etools') {
        return;
    }
    
    console.log('🎨 Adicionando botões de filtro rápido...');
    
    // Criar botões de filtro
    const filterButtons = $(`
        <div class="spells-5etools-filters" style="margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0;">Filtros Rápidos:</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                <button class="filter-btn" data-class="cleric">Cleric</button>
                <button class="filter-btn" data-class="wizard">Wizard</button>
                <button class="filter-btn" data-class="sorcerer">Sorcerer</button>
                <button class="filter-btn" data-class="bard">Bard</button>
                <button class="filter-btn" data-class="druid">Druid</button>
                <button class="filter-btn" data-class="paladin">Paladin</button>
                <button class="filter-btn" data-class="ranger">Ranger</button>
                <button class="filter-btn" data-class="warlock">Warlock</button>
                <button class="filter-btn" data-class="artificer">Artificer</button>
                <button class="filter-btn" data-class="all">Todas</button>
            </div>
        </div>
    `);
    
    // Inserir antes da barra de busca
    html.find('.directory-header').after(filterButtons);
    
    // Adicionar eventos aos botões
    html.find('.filter-btn').on('click', function() {
        const className = $(this).data('class');
        const searchInput = html.find('input[type="search"]');
        
        if (className === 'all') {
            searchInput.val('').trigger('input');
        } else {
            searchInput.val(className).trigger('input');
        }
        
        // Destacar botão ativo
        html.find('.filter-btn').removeClass('active');
        $(this).addClass('active');
    });
    
    // Estilo para botão ativo
    html.find('.filter-btn').css({
        'padding': '5px 10px',
        'border': '1px solid #ccc',
        'background': '#fff',
        'cursor': 'pointer',
        'border-radius': '3px'
    });
    
    html.find('.filter-btn.active').css({
        'background': '#007cba',
        'color': '#fff'
    });
});

console.log('🔮 Spells 5etools: Script carregado!');