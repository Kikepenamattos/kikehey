/**
 * Sistema de Almacenamiento de Imágenes usando IndexedDB
 * Permite almacenar imágenes grandes sin llenar localStorage
 * Capacidad: Hasta 50% del espacio en disco disponible (típicamente GB)
 */

const DocuImageStorage = {
    dbName: 'DocuImageDB',
    dbVersion: 1,
    storeName: 'images',
    db: null,

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
                console.error('❌ Error al abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB inicializado correctamente');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear object store si no existe
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    objectStore.createIndex('userId', 'userId', { unique: false });
                    objectStore.createIndex('memberId', 'memberId', { unique: false });
                    objectStore.createIndex('teamId', 'teamId', { unique: false });
                    console.log('✅ Object store creado en IndexedDB');
                }
            };
        });
    },

    /**
     * Guardar una imagen en IndexedDB
     * @param {string} imageData - Data URL de la imagen (base64)
     * @param {string} userId - ID del usuario
     * @param {string} memberId - ID del miembro (opcional)
     * @param {string} teamId - ID del team (opcional)
     * @returns {Promise<string>} - ID de referencia de la imagen
     */
    async saveImage(imageData, userId, memberId = null, teamId = null) {
        try {
            await this.init();
            
            // Generar ID único para la imagen
            const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const imageRecord = {
                id: imageId,
                userId: userId,
                memberId: memberId,
                teamId: teamId,
                imageData: imageData,
                createdAt: Date.now(),
                size: imageData.length
            };

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.add(imageRecord);

                request.onsuccess = () => {
                    console.log(`✅ Imagen guardada en IndexedDB: ${imageId} (${(imageData.length / 1024).toFixed(0)}KB)`);
                    resolve(imageId);
                };

                request.onerror = () => {
                    console.error('❌ Error al guardar imagen en IndexedDB:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Error en saveImage:', error);
            throw error;
        }
    },

    /**
     * Obtener una imagen de IndexedDB
     * @param {string} imageId - ID de referencia de la imagen
     * @returns {Promise<string|null>} - Data URL de la imagen o null si no existe
     */
    async getImage(imageId) {
        try {
            await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(imageId);

                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        resolve(result.imageData);
                    } else {
                        resolve(null);
                    }
                };

                request.onerror = () => {
                    console.error('❌ Error al obtener imagen de IndexedDB:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Error en getImage:', error);
            return null;
        }
    },

    /**
     * Eliminar una imagen de IndexedDB
     * @param {string} imageId - ID de referencia de la imagen
     * @returns {Promise<boolean>}
     */
    async deleteImage(imageId) {
        try {
            await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(imageId);

                request.onsuccess = () => {
                    console.log(`✅ Imagen eliminada de IndexedDB: ${imageId}`);
                    resolve(true);
                };

                request.onerror = () => {
                    console.error('❌ Error al eliminar imagen de IndexedDB:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Error en deleteImage:', error);
            return false;
        }
    },

    /**
     * Obtener todas las imágenes de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>}
     */
    async getUserImages(userId) {
        try {
            await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const index = store.index('userId');
                const request = index.getAll(userId);

                request.onsuccess = () => {
                    resolve(request.result || []);
                };

                request.onerror = () => {
                    console.error('❌ Error al obtener imágenes del usuario:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Error en getUserImages:', error);
            return [];
        }
    },

    /**
     * Eliminar todas las imágenes de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<number>} - Número de imágenes eliminadas
     */
    async deleteUserImages(userId) {
        try {
            const images = await this.getUserImages(userId);
            let deleted = 0;

            for (const image of images) {
                const success = await this.deleteImage(image.id);
                if (success) deleted++;
            }

            console.log(`✅ Eliminadas ${deleted} imágenes del usuario ${userId}`);
            return deleted;
        } catch (error) {
            console.error('❌ Error en deleteUserImages:', error);
            return 0;
        }
    },

    /**
     * Obtener estadísticas de almacenamiento
     * @param {string} userId - ID del usuario
     * @returns {Promise<Object>}
     */
    async getStorageStats(userId) {
        try {
            const images = await this.getUserImages(userId);
            let totalSize = 0;
            let imageCount = 0;

            images.forEach(img => {
                totalSize += img.size || 0;
                imageCount++;
            });

            return {
                imageCount: imageCount,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                totalSizeKB: (totalSize / 1024).toFixed(0),
                avgSizeKB: imageCount > 0 ? (totalSize / imageCount / 1024).toFixed(0) : 0
            };
        } catch (error) {
            console.error('❌ Error en getStorageStats:', error);
            return { imageCount: 0, totalSize: 0, totalSizeMB: '0', totalSizeKB: '0', avgSizeKB: '0' };
        }
    },

    /**
     * Migrar imagen de base64 (localStorage) a IndexedDB
     * @param {string} imageData - Data URL de la imagen
     * @param {string} userId - ID del usuario
     * @param {string} memberId - ID del miembro
     * @returns {Promise<string>} - ID de referencia
     */
    async migrateImageToIndexedDB(imageData, userId, memberId) {
        if (!imageData || !imageData.startsWith('data:')) {
            return null;
        }

        try {
            const imageId = await this.saveImage(imageData, userId, memberId);
            return imageId;
        } catch (error) {
            console.error('❌ Error al migrar imagen a IndexedDB:', error);
            return null;
        }
    },

    /**
     * Verificar si IndexedDB está disponible
     * @returns {boolean}
     */
    isAvailable() {
        return typeof indexedDB !== 'undefined' && indexedDB !== null;
    },

    /**
     * Limpiar imágenes no utilizadas (huérfanas)
     * Compara las imágenes en IndexedDB con las referencias en los datos del proyecto
     * @param {string} userId - ID del usuario
     * @param {Object} projectData - Datos del proyecto con teams y miembros
     * @returns {Promise<Object>} - Estadísticas de limpieza
     */
    async cleanUnusedImages(userId, projectData) {
        try {
            await this.init();

            // Obtener todas las imágenes del usuario desde IndexedDB
            const allImages = await this.getUserImages(userId);
            
            // Extraer todas las referencias de imágenes que están siendo usadas
            const usedImageIds = new Set();
            
            if (projectData && projectData.teams && Array.isArray(projectData.teams)) {
                projectData.teams.forEach(team => {
                    if (team.members && Array.isArray(team.members)) {
                        team.members.forEach(member => {
                            if (member.image && member.image.startsWith('indexeddb:')) {
                                const imageId = member.image.replace('indexeddb:', '');
                                usedImageIds.add(imageId);
                            }
                            // También verificar avatar como fallback
                            if (member.avatar && member.avatar.startsWith('indexeddb:')) {
                                const imageId = member.avatar.replace('indexeddb:', '');
                                usedImageIds.add(imageId);
                            }
                        });
                    }
                });
            }

            // Encontrar imágenes huérfanas (no referenciadas)
            const orphanImages = allImages.filter(img => !usedImageIds.has(img.id));
            
            // Eliminar imágenes huérfanas
            let deletedCount = 0;
            let deletedSize = 0;
            const errors = [];

            for (const orphanImage of orphanImages) {
                try {
                    const success = await this.deleteImage(orphanImage.id);
                    if (success) {
                        deletedCount++;
                        deletedSize += orphanImage.size || 0;
                    }
                } catch (error) {
                    errors.push({ id: orphanImage.id, error: error.message });
                }
            }

            const stats = {
                totalImages: allImages.length,
                usedImages: usedImageIds.size,
                orphanImages: orphanImages.length,
                deletedCount: deletedCount,
                deletedSize: deletedSize,
                deletedSizeMB: (deletedSize / (1024 * 1024)).toFixed(2),
                deletedSizeKB: (deletedSize / 1024).toFixed(0),
                errors: errors
            };

            console.log('🧹 Limpieza de imágenes completada:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Error en cleanUnusedImages:', error);
            return {
                totalImages: 0,
                usedImages: 0,
                orphanImages: 0,
                deletedCount: 0,
                deletedSize: 0,
                deletedSizeMB: '0',
                deletedSizeKB: '0',
                errors: [{ error: error.message }]
            };
        }
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DocuImageStorage = DocuImageStorage;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocuImageStorage;
}

