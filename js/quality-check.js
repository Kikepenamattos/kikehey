/**
 * Script de Validación de Calidad
 * Ejecutar antes de hacer cambios que afecten almacenamiento de datos
 * 
 * Uso: Abrir consola del navegador y ejecutar:
 *   QualityCheck.runAll()
 */

const QualityCheck = {
    results: [],
    
    /**
     * Ejecutar todas las validaciones
     */
    async runAll() {
        console.log('🔍 Iniciando validaciones de calidad...\n');
        this.results = [];
        
        await this.checkDataPreservation();
        await this.checkMigrationSafety();
        await this.checkFallbackMechanisms();
        await this.checkAsyncConsistency();
        await this.checkAsyncCalls();
        
        this.printResults();
    },
    
    /**
     * Verificar que los datos existentes se preservan
     */
    async checkDataPreservation() {
        console.log('📊 Verificando preservación de datos...');
        
        try {
            // Verificar localStorage
            const localStorageData = localStorage.getItem('docu_project_data');
            if (localStorageData) {
                const data = JSON.parse(localStorageData);
                const userCount = Object.keys(data).length;
                this.addResult('✅', `Datos encontrados en localStorage: ${userCount} usuarios`);
            } else {
                this.addResult('⚠️', 'No hay datos en localStorage (puede ser normal si es primera vez)');
            }
            
            // Verificar IndexedDB si está disponible
            if (typeof DocuProjectStorage !== 'undefined') {
                try {
                    await DocuProjectStorage.init();
                    const size = await DocuProjectStorage.getStorageSize();
                    if (size.records > 0) {
                        this.addResult('✅', `Datos encontrados en IndexedDB: ${size.records} registros (${size.mb.toFixed(2)} MB)`);
                    } else {
                        this.addResult('ℹ️', 'IndexedDB está vacío');
                    }
                } catch (error) {
                    this.addResult('⚠️', `Error accediendo IndexedDB: ${error.message}`);
                }
            }
        } catch (error) {
            this.addResult('❌', `Error verificando datos: ${error.message}`);
        }
    },
    
    /**
     * Verificar seguridad de migración
     */
    async checkMigrationSafety() {
        console.log('🔄 Verificando seguridad de migración...');
        
        if (typeof DocuProjectStorage === 'undefined') {
            this.addResult('⚠️', 'DocuProjectStorage no está disponible');
            return;
        }
        
        try {
            const isMigrated = DocuProjectStorage.isMigrated();
            
            if (isMigrated) {
                // Verificar que hay datos en IndexedDB si está marcado como migrado
                await DocuProjectStorage.init();
                const size = await DocuProjectStorage.getStorageSize();
                
                if (size.records === 0) {
                    this.addResult('❌', 'PROBLEMA: Migración marcada como completada pero IndexedDB está vacío');
                } else {
                    this.addResult('✅', `Migración marcada como completada y hay ${size.records} registros en IndexedDB`);
                }
            } else {
                this.addResult('ℹ️', 'Migración no marcada como completada (normal si no se ha migrado)');
            }
        } catch (error) {
            this.addResult('❌', `Error verificando migración: ${error.message}`);
        }
    },
    
    /**
     * Verificar mecanismos de fallback
     */
    async checkFallbackMechanisms() {
        console.log('🛡️ Verificando mecanismos de fallback...');
        
        if (typeof DocuAuth === 'undefined') {
            this.addResult('⚠️', 'DocuAuth no está disponible');
            return;
        }
        
        try {
            const session = DocuAuth.getCurrentSession();
            if (!session) {
                this.addResult('⚠️', 'No hay sesión activa - no se puede probar fallback');
                return;
            }
            
            // Intentar cargar datos (debería usar fallback si IndexedDB falla)
            const data = await DocuAuth.loadProjectData(session.email);
            
            if (data) {
                this.addResult('✅', 'Fallback funciona: datos cargados correctamente');
            } else {
                this.addResult('⚠️', 'No se pudieron cargar datos (puede ser normal si no hay datos)');
            }
        } catch (error) {
            this.addResult('❌', `Error probando fallback: ${error.message}`);
        }
    },
    
    /**
     * Verificar consistencia async/await
     */
    checkAsyncConsistency() {
        console.log('⚡ Verificando consistencia async/await...');
        
        // Verificar funciones críticas
        const criticalFunctions = [
            { name: 'DocuProjectData.getProjectData', obj: DocuProjectData },
            { name: 'DocuProjectData.saveProjectData', obj: DocuProjectData },
            { name: 'DocuAuth.loadProjectData', obj: DocuAuth },
            { name: 'DocuAuth.saveProjectData', obj: DocuAuth }
        ];
        
        criticalFunctions.forEach(func => {
            if (typeof func.obj === 'undefined') {
                this.addResult('⚠️', `${func.name} no está disponible`);
                return;
            }
            
            const funcRef = func.obj[func.name.split('.').pop()];
            if (funcRef && funcRef.constructor.name === 'AsyncFunction') {
                this.addResult('✅', `${func.name} es async`);
            } else {
                this.addResult('❌', `PROBLEMA: ${func.name} NO es async pero debería serlo`);
            }
        });
        
        // Verificar funciones del sidebar (comunes)
        const sidebarFunctions = [
            'loadTeamsInSidebar',
            'loadProjectsInSidebar',
            'loadTeamsIntoDropdown',
            'loadPublishedProjectsInDropdown'
        ];
        
        sidebarFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                const func = window[funcName];
                if (func.constructor.name === 'AsyncFunction') {
                    this.addResult('✅', `${funcName} es async`);
                } else {
                    this.addResult('⚠️', `${funcName} NO es async - verificar si llama funciones async`);
                }
            }
        });
    },
    
    /**
     * Verificar que las funciones async se llaman correctamente
     */
    async checkAsyncCalls() {
        console.log('🔍 Verificando llamadas async...');
        
        try {
            // Intentar cargar datos
            if (typeof DocuProjectData !== 'undefined') {
                const data = await DocuProjectData.getProjectData();
                
                // Verificar que NO es una Promise
                if (data instanceof Promise) {
                    this.addResult('❌', 'PROBLEMA CRÍTICO: getProjectData() retorna Promise en lugar de datos');
                } else {
                    this.addResult('✅', 'getProjectData() retorna datos correctamente');
                    
                    // Verificar estructura
                    if (data && typeof data === 'object') {
                        this.addResult('✅', `Estructura de datos válida: teams=${data.teams?.length || 0}, projects=${data.projects?.length || 0}`);
                    } else {
                        this.addResult('⚠️', 'Datos no tienen estructura esperada');
                    }
                }
            }
        } catch (error) {
            this.addResult('❌', `Error al verificar llamadas async: ${error.message}`);
        }
    },
    
    /**
     * Agregar resultado
     */
    addResult(type, message) {
        this.results.push({ type, message });
    },
    
    /**
     * Imprimir resultados
     */
    printResults() {
        console.log('\n📋 Resumen de Validaciones:\n');
        console.log('═'.repeat(60));
        
        this.results.forEach(result => {
            console.log(`${result.type} ${result.message}`);
        });
        
        console.log('═'.repeat(60));
        
        const errors = this.results.filter(r => r.type === '❌').length;
        const warnings = this.results.filter(r => r.type === '⚠️').length;
        const success = this.results.filter(r => r.type === '✅').length;
        
        console.log(`\n📊 Estadísticas:`);
        console.log(`   ✅ Exitosos: ${success}`);
        console.log(`   ⚠️  Advertencias: ${warnings}`);
        console.log(`   ❌ Errores: ${errors}`);
        
        if (errors > 0) {
            console.log(`\n🚨 ATENCIÓN: Se encontraron ${errors} error(es). Revisar antes de continuar.`);
        } else if (warnings > 0) {
            console.log(`\n⚠️  Se encontraron ${warnings} advertencia(s). Revisar si es necesario.`);
        } else {
            console.log(`\n✅ Todas las validaciones pasaron correctamente.`);
        }
    },
    
    /**
     * Verificar antes de hacer cambios
     */
    async checkBeforeChanges() {
        console.log('🔒 Verificación Pre-Cambio\n');
        console.log('Ejecutando validaciones críticas antes de hacer cambios...\n');
        
        await this.runAll();
        
        const errors = this.results.filter(r => r.type === '❌').length;
        
        if (errors > 0) {
            console.log('\n🚨 BLOQUEADO: Hay errores que deben corregirse antes de continuar.');
            console.log('Por favor, revisa el protocolo de calidad: PROTOCOLO_CALIDAD.md');
            return false;
        }
        
        console.log('\n✅ Verificación completada. Puedes proceder con los cambios.');
        console.log('Recuerda seguir el protocolo de calidad en cada paso.');
        return true;
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.QualityCheck = QualityCheck;
}

// Mensaje de ayuda
console.log(`
🔍 QualityCheck disponible

Uso:
  QualityCheck.runAll()           - Ejecutar todas las validaciones
  QualityCheck.checkBeforeChanges() - Verificación pre-cambio (bloquea si hay errores)

Ver protocolo completo en: PROTOCOLO_CALIDAD.md
`);

