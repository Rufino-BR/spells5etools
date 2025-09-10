const leveldown = require('leveldown');

async function checkDBStructure() {
    console.log('🔍 Verificando estrutura da base de dados...');
    
    const dbPath = './spells-5etools/packs/spells-5etools.ldb';
    
    // Abrir o banco
    const db = leveldown(dbPath);
    
    try {
        // Abrir o banco
        await new Promise((resolve, reject) => {
            db.open((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('📚 Listando todas as chaves na base de dados...');
        
        const keys = [];
        const iterator = db.iterator();
        
        // Coletar todas as chaves
        await new Promise((resolve, reject) => {
            iterator.next((err, key, value) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (key) {
                    keys.push(key.toString());
                    iterator.next();
                } else {
                    resolve();
                }
            });
        });
        
        console.log(`\n📊 Total de entradas: ${keys.length}`);
        console.log('\n🔑 Chaves encontradas:');
        
        keys.forEach((key, index) => {
            console.log(`   ${index + 1}. ${key}`);
        });
        
        // Mostrar detalhes de algumas entradas
        console.log('\n📋 Detalhes das primeiras 3 entradas:');
        
        for (let i = 0; i < Math.min(3, keys.length); i++) {
            const key = keys[i];
            const value = await new Promise((resolve, reject) => {
                db.get(key, (err, value) => {
                    if (err) reject(err);
                    else resolve(value);
                });
            });
            
            const spell = JSON.parse(value.toString());
            console.log(`\n   ${i + 1}. Chave: ${key}`);
            console.log(`      Nome: ${spell.name}`);
            console.log(`      Tipo: ${spell.type}`);
            console.log(`      Nível: ${spell.system?.level || 'N/A'}`);
            console.log(`      Classes: ${spell.system?.classes?.value?.join(', ') || 'N/A'}`);
            console.log(`      Escola: ${spell.system?.school || 'N/A'}`);
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        // Fechar o banco
        await new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    
    console.log('\n✅ Verificação concluída!');
}

checkDBStructure();
