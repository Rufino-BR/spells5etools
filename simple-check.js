const leveldown = require('leveldown');

async function simpleCheck() {
    console.log('🔍 Verificando estrutura simples...');
    
    const dbPath = './spells-5etools/packs/spells-5etools.ldb';
    const db = leveldown(dbPath);
    
    try {
        await new Promise((resolve, reject) => {
            db.open((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('📚 Contando entradas...');
        
        let count = 0;
        const iterator = db.iterator();
        
        await new Promise((resolve, reject) => {
            const next = () => {
                iterator.next((err, key, value) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (key) {
                        count++;
                        console.log(`${count}. ${key.toString()}`);
                        next();
                    } else {
                        resolve();
                    }
                });
            };
            next();
        });
        
        console.log(`\n📊 Total: ${count} entradas`);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

simpleCheck();
