/**
 * Sistema de Almacenamiento de Proyectos y Teams usando IndexedDB
 * Permite almacenar proyectos grandes sin llenar localStorage
 * Capacidad: Hasta 50% del espacio en disco disponible (típicamente GB)
 * 
 * Migración automática desde localStorage a IndexedDB
 */

const DocuProjectStorage = {
    dbName: 'DocuProjectDB',
    dbVersion: 1,
    storeName: 'projectData',
    db: null,
    migrationFlag: 'docu_migrated_to_indexeddb',

    /**
     * Inicializar la base de datos IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ Error al abrir IndexedDB para proyectos:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB para proyectos inicializado correctamente');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear object store si no existe
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'userId' });
                    objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                    console.log('✅ Object store de proyectos creado en IndexedDB');
                }
            };
        });
    },

    /**
     * Verificar si ya se migró desde localStorage
     */
    isMigrated() {
        try {
            return localStorage.getItem(this.migrationFlag) === 'true';
        } catch (error) {
            console.warn('⚠️ Error al verificar flag de migración:', error);
            return false;
        }
    },

    /**
     * Marcar que la migración se completó
     */
    markAsMigrated() {
        try {
            localStorage.setItem(this.migrationFlag, 'true');
            console.log('✅ Migración a IndexedDB marcada como completada');
        } catch (error) {
            console.warn('⚠️ Error al marcar migración:', error);
        }
    },

    /**
     * Migrar datos desde localStorage a IndexedDB
     */
    async migrateFromLocalStorage() {
        if (this.isMigrated()) {
            console.log('ℹ️ Los datos ya fueron migrados a IndexedDB');
            return true;
        }

        try {
            console.log('🔄 Iniciando migración de datos desde localStorage a IndexedDB...');
            
            // Verificar que DocuAuth esté disponible
            if (typeof DocuAuth === 'undefined') {
                console.error('❌ DocuAuth no está disponible para migración');
                return false;
            }

            // Obtener todos los datos de localStorage
            const allProjectsData = DocuAuth.loadFromStorage(DocuAuth.STORAGE_KEYS.PROJECT_DATA);
            
            if (!allProjectsData || typeof allProjectsData !== 'object') {
                console.log('ℹ️ No hay datos en localStorage para migrar');
                // ⚠️ NO marcar como migrado si no hay datos - permite que el fallback funcione
                // this.markAsMigrated(); // REMOVIDO: No marcar como migrado sin datos
                return true;
            }

            // Inicializar IndexedDB
            await this.init();

            // Migrar cada usuario
            const userIds = Object.keys(allProjectsData);
            let migratedCount = 0;

            for (const userId of userIds) {
                const userData = allProjectsData[userId];
                if (userData) {
                    try {
                        await this.saveUserData(userId, userData);
                        migratedCount++;
                        console.log(`✅ Datos migrados para usuario: ${userId}`);
                    } catch (error) {
                        console.error(`❌ Error al migrar datos para ${userId}:`, error);
                    }
                }
            }

            console.log(`✅ Migración completada: ${migratedCount}/${userIds.length} usuarios migrados`);
            
            // ⚠️ Solo marcar como migrado si TODOS los usuarios se migraron correctamente
            if (migratedCount === userIds.length && migratedCount > 0) {
                this.markAsMigrated();
                console.log('✅ Migración completada y verificada. Flag de migración establecido.');
            } else if (migratedCount > 0 && migratedCount < userIds.length) {
                console.warn(`⚠️ Migración parcial: ${migratedCount}/${userIds.length} usuarios migrados. NO se marca como completada.`);
                // NO marcar como migrado si hubo errores parciales
            } else {
                console.warn('⚠️ No se migraron usuarios. NO se marca como completada.');
                // NO marcar como migrado si no se migró nada
            }
            
            return migratedCount === userIds.length;
        } catch (error) {
            console.error('❌ Error durante la migración:', error);
            return false;
        }
    },

    /**
     * Guardar datos del proyecto de un usuario en IndexedDB
     */
    async saveUserData(userId, projectData) {
        try {
            await this.init();
            
            const dataRecord = {
                userId: userId,
                projectData: projectData,
                updatedAt: Date.now()
            };

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put(dataRecord);

                request.onsuccess = () => {
                    const sizeInMB = (JSON.stringify(dataRecord).length / (1024 * 1024)).toFixed(2);
                    console.log(`✅ Datos guardados en IndexedDB para ${userId} (${sizeInMB} MB)`);
                    resolve(true);
                };

                request.onerror = () => {
                    console.error('❌ Error al guardar en IndexedDB:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Error en saveUserData:', error);
            throw error;
        }
    },

    /**
     * Cargar datos del proyecto de un usuario desde IndexedDB
     */
    async loadUserData(userId) {
        try {
            await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(userId);

                request.onsuccess = () => {
                    const result = request.result;
                    if (result && result.projectData) {
                        console.log(`✅ Datos cargados desde IndexedDB para ${userId}`);
                        resolve(result.projectData);
                    } else {
                        console.log(`ℹ️ No hay datos en IndexedDB para ${userId}`);
                        resolve(null);
                    }
                };

                request.onerror = () => {
                    console.error('❌ Error al cargar desde IndexedDB:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Error en loadUserData:', error);
            return null;
        }
    },

    /**
     * Eliminar datos de un usuario de IndexedDB
     */
    async deleteUserData(userId) {
        try {
            await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(userId);

                request.onsuccess = () => {
                    console.log(`✅ Datos eliminados de IndexedDB para ${userId}`);
                    resolve(true);
                };

                request.onerror = () => {
                    console.error('❌ Error al eliminar de IndexedDB:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Error en deleteUserData:', error);
            return false;
        }
    },

    /**
     * Obtener el tamaño aproximado de los datos almacenados
     */
    async getStorageSize() {
        try {
            await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    const allData = request.result;
                    let totalSize = 0;
                    
                    allData.forEach(record => {
                        totalSize += JSON.stringify(record).length;
                    });
                    
                    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
                    const sizeInKB = (totalSize / 1024).toFixed(2);
                    
                    resolve({
                        bytes: totalSize,
                        kb: parseFloat(sizeInKB),
                        mb: parseFloat(sizeInMB),
                        records: allData.length
                    });
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Error al calcular tamaño:', error);
            return { bytes: 0, kb: 0, mb: 0, records: 0 };
        }
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DocuProjectStorage = DocuProjectStorage;
}

// Exportar para módulos (si se usa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocuProjectStorage;
}

