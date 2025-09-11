
// Spells 5etools - Advanced Search and Filter System
console.log('🔮 Spells 5etools: Sistema avançado de busca e filtros carregado!');

Hooks.once('ready', () => {
    console.log('🔮 Spells 5etools: Inicializando sistema de busca avançada...');
    
    // Lista de classes disponíveis
    const classes = ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger', 'warlock', 'artificer'];
    
    console.log('✅ Sistema de busca avançada habilitado!');
    console.log('🎯 Classes disponíveis:', classes.join(', '));
});

Hooks.on('renderCompendium', (app, html, data) => {
    // Verificar se é nosso compendium
    if (!app.collection || !app.collection.metadata || app.collection.metadata.id !== 'spells-5etools.spells-5etools') {
        return;
    }
    
    console.log('🎨 Adicionando sistema de busca avançada ao compendium...');
    
    const $html = html instanceof $ ? html : $(html);
    
    // Verificar se já foi adicionado
    if ($html.find('.spells-5etools-search').length > 0) {
        return;
    }
    
    // Criar container de busca avançada
    const searchContainer = `
        <div class="spells-5etools-search" style="margin-bottom: 10px; padding: 10px; background: #f0f0f0; border-radius: 5px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">🔍 Busca Avançada de Magias</h3>
            
            <!-- Campo de busca por nome -->
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Buscar por nome:</label>
                <input type="text" id="spell-name-search" placeholder="Digite o nome da magia..." 
                       style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
            </div>
            
            <!-- Filtros por classe -->
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Filtrar por classe:</label>
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                    <button class="class-filter-btn" data-class="all" 
                            style="padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Todas
                    </button>
                    <button class="class-filter-btn" data-class="cleric" 
                            style="padding: 5px 10px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Cleric
                    </button>
                    <button class="class-filter-btn" data-class="wizard" 
                            style="padding: 5px 10px; background: #9C27B0; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Wizard
                    </button>
                    <button class="class-filter-btn" data-class="sorcerer" 
                            style="padding: 5px 10px; background: #FF9800; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Sorcerer
                    </button>
                    <button class="class-filter-btn" data-class="bard" 
                            style="padding: 5px 10px; background: #E91E63; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Bard
                    </button>
                    <button class="class-filter-btn" data-class="druid" 
                            style="padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Druid
                    </button>
                    <button class="class-filter-btn" data-class="paladin" 
                            style="padding: 5px 10px; background: #F44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Paladin
                    </button>
                    <button class="class-filter-btn" data-class="ranger" 
                            style="padding: 5px 10px; background: #8BC34A; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Ranger
                    </button>
                    <button class="class-filter-btn" data-class="warlock" 
                            style="padding: 5px 10px; background: #673AB7; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Warlock
                    </button>
                    <button class="class-filter-btn" data-class="artificer" 
                            style="padding: 5px 10px; background: #607D8B; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Artificer
                    </button>
                </div>
            </div>
            
            <!-- Filtros por nível -->
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Filtrar por nível:</label>
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                    <button class="level-filter-btn" data-level="all" 
                            style="padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Todos
                    </button>
                    <button class="level-filter-btn" data-level="0" 
                            style="padding: 5px 10px; background: #9E9E9E; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Cantrips
                    </button>
                    <button class="level-filter-btn" data-level="1" 
                            style="padding: 5px 10px; background: #FFC107; color: black; border: none; border-radius: 3px; cursor: pointer;">
                        1º Nível
                    </button>
                    <button class="level-filter-btn" data-level="2" 
                            style="padding: 5px 10px; background: #FF9800; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        2º Nível
                    </button>
                    <button class="level-filter-btn" data-level="3" 
                            style="padding: 5px 10px; background: #FF5722; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        3º Nível
                    </button>
                    <button class="level-filter-btn" data-level="4" 
                            style="padding: 5px 10px; background: #E91E63; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        4º Nível
                    </button>
                    <button class="level-filter-btn" data-level="5" 
                            style="padding: 5px 10px; background: #9C27B0; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        5º Nível
                    </button>
                </div>
            </div>
            
            <!-- Botão de limpar filtros -->
            <button id="clear-filters" 
                    style="padding: 8px 15px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
                🗑️ Limpar Filtros
            </button>
        </div>
    `;
    
    // Inserir antes da lista de documentos
    $html.find('.directory-list').before(searchContainer);
    
    // Event listeners
    let currentClassFilter = 'all';
    let currentLevelFilter = 'all';
    let currentNameFilter = '';
    
    // Busca por nome
    $html.find('#spell-name-search').on('input', function() {
        currentNameFilter = $(this).val().toLowerCase();
        applyFilters();
    });
    
    // Filtro por classe
    $html.find('.class-filter-btn').on('click', function() {
        currentClassFilter = $(this).data('class');
        $html.find('.class-filter-btn').css('opacity', '0.6');
        $(this).css('opacity', '1');
        applyFilters();
    });
    
    // Filtro por nível
    $html.find('.level-filter-btn').on('click', function() {
        currentLevelFilter = $(this).data('level');
        $html.find('.level-filter-btn').css('opacity', '0.6');
        $(this).css('opacity', '1');
        applyFilters();
    });
    
    // Limpar filtros
    $html.find('#clear-filters').on('click', function() {
        currentClassFilter = 'all';
        currentLevelFilter = 'all';
        currentNameFilter = '';
        
        $html.find('#spell-name-search').val('');
        $html.find('.class-filter-btn').css('opacity', '0.6');
        $html.find('.level-filter-btn').css('opacity', '0.6');
        $html.find('.class-filter-btn[data-class="all"]').css('opacity', '1');
        $html.find('.level-filter-btn[data-level="all"]').css('opacity', '1');
        
        applyFilters();
    });
    
    function applyFilters() {
        console.log('🔍 Aplicando filtros:', {
            class: currentClassFilter,
            level: currentLevelFilter,
            name: currentNameFilter
        });
        
        const compendium = app.collection;
        if (!compendium) return;
        
        // Obter todos os documentos
        const allDocuments = compendium.contents;
        console.log('📚 Total de documentos:', allDocuments.length);
        
        // Aplicar filtros
        let filteredDocuments = allDocuments.filter(doc => {
            // Filtro por nome
            if (currentNameFilter && !doc.name.toLowerCase().includes(currentNameFilter)) {
                return false;
            }
            
            // Filtro por classe
            if (currentClassFilter !== 'all') {
                const docClasses = doc.data.classes?.value || [];
                if (!docClasses.includes(currentClassFilter)) {
                    return false;
                }
            }
            
            // Filtro por nível
            if (currentLevelFilter !== 'all') {
                const docLevel = doc.data.level || 0;
                if (docLevel.toString() !== currentLevelFilter) {
                    return false;
                }
            }
            
            return true;
        });
        
        console.log('✅ Documentos filtrados:', filteredDocuments.length);
        
        // Aplicar filtro na coleção
        compendium.filtered = filteredDocuments;
        compendium.render();
    }
    
    console.log('✅ Sistema de busca avançada adicionado com sucesso!');
});
