// Script para habilitar busca por classes no compendium de magias
Hooks.once('ready', () => {
    console.log('🔮 Spells 5etools: Inicializando filtros de classe...');
    
    // Aguardar o compendium estar carregado
    const compendium = game.packs.get('spells-5etools.spells-5etools');
    if (!compendium) {
        console.warn('⚠️ Compendium spells-5etools não encontrado!');
        return;
    }
    
    console.log('✅ Filtros de classe habilitados!');
    console.log('🎯 Agora você pode buscar por: cleric, wizard, sorcerer, bard, druid, paladin, ranger, warlock, artificer');
});

// Adicionar botões de filtro rápido na interface
Hooks.on('renderCompendium', (compendium, html, data) => {
    if (!compendium.collection || !compendium.collection.metadata || compendium.collection.metadata.id !== 'spells-5etools.spells-5etools') {
        return;
    }
    
    // Converter html para jQuery se necessário
    const $html = html instanceof $ ? html : $(html);
    
    // Verificar se os filtros já foram adicionados
    if ($html.find('.spells-5etools-filters').length > 0) {
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
    $html.find('.directory-header').after(filterButtons);
    
    // Adicionar eventos aos botões
    $html.find('.filter-btn').on('click', function() {
        const className = $(this).data('class');
        const searchInput = $html.find('input[type="search"]');
        
        console.log(`🔍 Clicou no filtro: ${className}`);
        
        // Destacar botão ativo
        $html.find('.filter-btn').removeClass('active');
        $(this).addClass('active');
        
        if (className === 'all') {
            searchInput.val('');
            console.log('✅ Limpando filtro');
            // Aplicar filtro diretamente
            compendium.collection.filtered = compendium.collection.documents;
            compendium.render();
        } else {
            searchInput.val(className);
            console.log(`✅ Filtrando por: ${className}`);
            
            // Usar o compendium correto do game.packs
            const gameCompendium = game.packs.get('spells-5etools.spells-5etools');
            if (!gameCompendium) {
                console.error('❌ Compendium não encontrado!');
                return;
            }
            
            console.log('🔄 Carregando documentos do compendium...');
            gameCompendium.getDocuments().then(documents => {
                console.log(`📚 Total de documentos carregados: ${documents.length}`);
                
                // Debug: mostrar algumas magias
                documents.slice(0, 3).forEach(doc => {
                    console.log(`   - ${doc.name}: classes=${JSON.stringify(doc.system?.classes?.value)}`);
                });
                
                // Procurar por nossas magias específicas
                const ourSpells = documents.filter(doc => 
                    doc.name.includes('(Cleric)') || 
                    doc.name.includes('(Wizard)') || 
                    doc.name.includes('(Sorcerer)') ||
                    doc.name.includes('(Paladin)') ||
                    doc.name.includes('(Druid)')
                );
                console.log(`🎯 Nossas magias encontradas: ${ourSpells.length}`);
                ourSpells.forEach(doc => {
                    console.log(`   ✓ ${doc.name}: classes=${JSON.stringify(doc.system?.classes?.value)}`);
                });
                
                const filtered = documents.filter(doc => {
                    // Verificar se a magia tem a classe procurada
                    if (doc.system && doc.system.classes && doc.system.classes.value) {
                        return doc.system.classes.value.includes(className);
                    }
                    
                    // Verificar campos de busca customizados
                    if (doc.system && doc.system.searchable) {
                        return doc.system.searchable.classes.includes(className) ||
                               doc.system.searchable.classNames.toLowerCase().includes(className);
                    }
                    
                    // Verificar no nome da magia
                    return doc.name.toLowerCase().includes(className);
                });
                
                console.log(`✅ Encontradas ${filtered.length} magias para ${className}`);
                
                // Debug: mostrar magias encontradas
                filtered.forEach(doc => {
                    console.log(`   ✓ ${doc.name}`);
                });
                
                // Aplicar filtro na interface
                compendium.collection.filtered = filtered;
                compendium.render();
            }).catch(error => {
                console.error('❌ Erro ao carregar documentos:', error);
            });
        }
    });
    
    // Estilo para botões
    $html.find('.filter-btn').css({
        'padding': '5px 10px',
        'border': '1px solid #ccc',
        'background': '#fff',
        'cursor': 'pointer',
        'border-radius': '3px'
    });
    
    $html.find('.filter-btn.active').css({
        'background': '#007cba',
        'color': '#fff'
    });
});

// Interceptar busca do compendium para filtrar por classe
Hooks.on('renderCompendiumDirectory', (app, html, data) => {
    // Verificar se é o compendium correto e se tem collection
    if (!app.collection || !app.collection.metadata || app.collection.metadata.id !== 'spells-5etools.spells-5etools') {
        return;
    }
    
    console.log('🎯 Interceptando busca do compendium...');
    
    // Interceptar o evento de busca
    html.find('input[type="search"]').on('input', function() {
        const query = $(this).val().toLowerCase();
        console.log(`🔍 Busca: "${query}"`);
        
        if (query === '') {
            // Limpar filtros
            app.collection.filtered = app.collection.documents;
            app.render();
            return;
        }
        
        // Filtrar por classe
        const classNames = ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger', 'warlock', 'artificer'];
        const foundClass = classNames.find(cls => query.includes(cls));
        
        if (foundClass) {
            console.log(`🎯 Filtrando por classe: ${foundClass}`);
            
            const filtered = app.collection.documents.filter(doc => {
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
            app.collection.filtered = filtered;
            app.render();
        } else {
            // Busca normal por nome
            const filtered = app.collection.documents.filter(doc => 
                doc.name.toLowerCase().includes(query)
            );
            console.log(`✅ Encontradas ${filtered.length} magias para "${query}"`);
            app.collection.filtered = filtered;
            app.render();
        }
    });
});

console.log('🔮 Spells 5etools: Script carregado!');