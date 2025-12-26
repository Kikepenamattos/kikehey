# 📋 Protocolo de Calidad - Prevención de Fallos

## 🎯 Objetivo

Establecer un protocolo estricto para prevenir pérdida de datos, errores de migración, problemas de compatibilidad y errores de async/await en futuros cambios.

---

## ✅ Checklist Pre-Cambio (OBLIGATORIO)

Antes de hacer CUALQUIER cambio que afecte almacenamiento o persistencia de datos:

### 1. Análisis de Impacto
- [ ] **Identificar TODOS los archivos afectados**
- [ ] **Listar TODAS las funciones que usan los datos**
- [ ] **Verificar dependencias entre módulos**
- [ ] **Documentar el flujo de datos completo**

### 2. Verificación de Datos Existentes
- [ ] **Verificar estructura actual de datos en localStorage/IndexedDB**
- [ ] **Identificar TODAS las claves de almacenamiento usadas**
- [ ] **Documentar formato de datos actual**
- [ ] **Crear backup de datos de prueba**

### 3. Plan de Migración (si aplica)
- [ ] **Definir estrategia de migración paso a paso**
- [ ] **Asegurar compatibilidad hacia atrás**
- [ ] **Planificar rollback si falla**
- [ ] **NO eliminar datos originales hasta verificar migración exitosa**

### 4. Validaciones Críticas
- [ ] **NUNCA marcar migración como completada sin validar datos**
- [ ] **SIEMPRE mantener fallback a datos originales**
- [ ] **Verificar que datos existan antes de marcar como migrado**
- [ ] **Validar integridad de datos después de migración**

---

## 🔒 Reglas de Oro (NUNCA Violar)

### Regla 1: Preservación de Datos
```javascript
// ❌ NUNCA hacer esto:
if (!data) {
    this.markAsMigrated(); // Marcar sin datos
    return;
}

// ✅ SIEMPRE hacer esto:
if (!data) {
    console.warn('⚠️ No hay datos para migrar');
    // NO marcar como migrado
    return; // Permitir que fallback funcione
}
```

### Regla 2: Fallback Obligatorio
```javascript
// ✅ SIEMPRE incluir fallback:
async loadData() {
    try {
        // Intentar nuevo método
        const data = await newMethod();
        if (data) return data;
    } catch (error) {
        console.warn('⚠️ Error con nuevo método, usando fallback');
    }
    
    // SIEMPRE tener fallback a método original
    return oldMethod();
}
```

### Regla 3: Validación Post-Migración
```javascript
// ✅ SIEMPRE validar después de migrar:
async migrate() {
    const originalData = getOriginalData();
    await saveToNewStorage(originalData);
    
    // VALIDAR que se guardó correctamente
    const migratedData = await loadFromNewStorage();
    if (JSON.stringify(originalData) !== JSON.stringify(migratedData)) {
        throw new Error('❌ Migración falló: datos no coinciden');
    }
    
    // SOLO entonces marcar como migrado
    markAsMigrated();
}
```

### Regla 4: No Eliminar Datos Originales
```javascript
// ❌ NUNCA eliminar datos originales inmediatamente:
localStorage.removeItem('old_key'); // PELIGROSO

// ✅ SIEMPRE mantener datos originales hasta verificar:
// 1. Migrar datos
await migrate();
// 2. Validar migración
const isValid = await validateMigration();
// 3. SOLO si es válida, limpiar (opcional, mejor mantener)
if (isValid) {
    console.log('✅ Migración validada. Datos originales se mantienen como backup.');
    // Opcional: localStorage.removeItem('old_key');
}
```

---

## 🧪 Pruebas Obligatorias

### Antes de Commit

#### 1. Prueba de Datos Existentes
```javascript
// Crear script de prueba:
async function testExistingData() {
    // 1. Cargar datos existentes
    const existingData = await loadExistingData();
    console.assert(existingData !== null, '❌ No hay datos existentes');
    
    // 2. Aplicar cambios
    await applyChanges();
    
    // 3. Verificar que datos siguen accesibles
    const loadedData = await loadData();
    console.assert(loadedData !== null, '❌ Datos no accesibles después de cambios');
    console.assert(
        JSON.stringify(existingData) === JSON.stringify(loadedData),
        '❌ Datos modificados incorrectamente'
    );
}
```

#### 2. Prueba de Migración
```javascript
async function testMigration() {
    // 1. Simular datos en almacenamiento antiguo
    const testData = { projects: [], teams: [] };
    localStorage.setItem('old_key', JSON.stringify(testData));
    
    // 2. Ejecutar migración
    await migrate();
    
    // 3. Verificar que datos están en nuevo almacenamiento
    const migratedData = await loadFromNewStorage();
    console.assert(migratedData !== null, '❌ Datos no migrados');
    
    // 4. Verificar que datos originales siguen disponibles
    const originalData = JSON.parse(localStorage.getItem('old_key'));
    console.assert(originalData !== null, '❌ Datos originales eliminados');
}
```

#### 3. Prueba de Fallback
```javascript
async function testFallback() {
    // 1. Simular fallo en nuevo método
    // (deshabilitar IndexedDB temporalmente)
    
    // 2. Intentar cargar datos
    const data = await loadData();
    
    // 3. Verificar que fallback funciona
    console.assert(data !== null, '❌ Fallback no funciona');
}
```

### Después de Deploy

#### 1. Verificación en Producción
- [ ] Verificar consola del navegador (sin errores)
- [ ] Verificar que datos se cargan correctamente
- [ ] Verificar que migración se ejecuta (si aplica)
- [ ] Verificar que fallback funciona (simular error)

#### 2. Monitoreo
- [ ] Revisar logs de consola por 24 horas
- [ ] Verificar que no hay errores de QuotaExceededError
- [ ] Verificar que no hay pérdida de datos reportada

---

## 📝 Patrones de Código Seguros

### Patrón 1: Migración Segura
```javascript
async function safeMigration() {
    // 1. Verificar si ya se migró
    if (isMigrated()) {
        return true;
    }
    
    // 2. Obtener datos originales
    const originalData = getOriginalData();
    if (!originalData) {
        console.log('ℹ️ No hay datos para migrar');
        // NO marcar como migrado
        return true;
    }
    
    // 3. Migrar datos
    try {
        await saveToNewStorage(originalData);
    } catch (error) {
        console.error('❌ Error en migración:', error);
        // NO marcar como migrado si falla
        return false;
    }
    
    // 4. Validar migración
    const migratedData = await loadFromNewStorage();
    if (!migratedData || 
        JSON.stringify(originalData) !== JSON.stringify(migratedData)) {
        console.error('❌ Migración falló: datos no coinciden');
        // NO marcar como migrado si validación falla
        return false;
    }
    
    // 5. SOLO si todo es exitoso, marcar como migrado
    markAsMigrated();
    return true;
}
```

### Patrón 2: Carga con Fallback
```javascript
async function loadDataWithFallback(userId) {
    // 1. Intentar nuevo método
    if (typeof NewStorage !== 'undefined') {
        try {
            // Asegurar migración
            if (!NewStorage.isMigrated()) {
                await NewStorage.migrate();
            }
            
            // Cargar desde nuevo almacenamiento
            const data = await NewStorage.load(userId);
            if (data) {
                return data;
            }
        } catch (error) {
            console.warn('⚠️ Error con nuevo almacenamiento:', error);
        }
    }
    
    // 2. Fallback a método original
    const data = OldStorage.load(userId);
    
    // 3. Si encontramos datos en fallback pero no en nuevo método,
    // intentar re-migrar
    if (data && NewStorage?.isMigrated()) {
        console.warn('⚠️ Datos en fallback pero no en nuevo método. Re-migrando...');
        try {
            await NewStorage.save(userId, data);
        } catch (error) {
            console.error('❌ Error al re-migrar:', error);
        }
    }
    
    return data;
}
```

### Patrón 3: Función Async Segura
```javascript
// ✅ SIEMPRE hacer funciones async si usan await
async function loadData() {
    const data = await getData();
    return data;
}

// ✅ SIEMPRE usar await al llamar funciones async
async function init() {
    const data = await loadData(); // ✅ Correcto
    // const data = loadData(); // ❌ INCORRECTO
}

// ✅ SIEMPRE manejar errores
async function init() {
    try {
        const data = await loadData();
    } catch (error) {
        console.error('❌ Error:', error);
        // Fallback o manejo de error
    }
}
```

---

## 🔄 Procedimiento de Rollback

### Si se Detecta un Error en Producción

#### Paso 1: Detener el Problema
```javascript
// Agregar flag de emergencia
const EMERGENCY_ROLLBACK = true;

if (EMERGENCY_ROLLBACK) {
    // Forzar uso de método original
    window.USE_INDEXEDDB = false;
}
```

#### Paso 2: Revertir Cambios
1. Revertir commit problemático
2. Restaurar versión anterior de archivos afectados
3. Limpiar flags de migración si es necesario:
```javascript
localStorage.removeItem('docu_migrated_to_indexeddb');
```

#### Paso 3: Verificar Datos
```javascript
// Verificar que datos están accesibles
const data = OldStorage.load(userId);
console.assert(data !== null, '❌ Datos no accesibles después de rollback');
```

---

## 📊 Checklist de Revisión de Código

Antes de hacer merge o commit, verificar:

### Funcionalidad
- [ ] ¿El código hace lo que se espera?
- [ ] ¿Maneja casos edge (datos vacíos, null, undefined)?
- [ ] ¿Tiene validaciones de entrada?
- [ ] ¿Tiene manejo de errores?

### Datos
- [ ] ¿Preserva datos existentes?
- [ ] ¿Tiene fallback si nuevo método falla?
- [ ] ¿Valida datos después de cambios?
- [ ] ¿No elimina datos originales prematuramente?

### Compatibilidad
- [ ] ¿Funciona con datos existentes?
- [ ] ¿Es compatible hacia atrás?
- [ ] ¿No rompe funcionalidades existentes?

### Testing
- [ ] ¿Se probó con datos reales?
- [ ] ¿Se probó el fallback?
- [ ] ¿Se probó la migración?
- [ ] ¿Se probó con datos vacíos?

### Documentación
- [ ] ¿Está documentado el cambio?
- [ ] ¿Está documentado el impacto?
- [ ] ¿Está documentado el procedimiento de rollback?

---

## 🚨 Señales de Alerta (Revisar Inmediatamente)

Si ves alguno de estos patrones en el código, **DETENER** y revisar:

1. **Marcar como completado sin validar**
   ```javascript
   markAsCompleted(); // ⚠️ Sin validación
   ```

2. **Eliminar datos originales**
   ```javascript
   localStorage.removeItem('old_key'); // ⚠️ Peligroso
   ```

3. **Sin fallback**
   ```javascript
   const data = await newMethod(); // ⚠️ Sin fallback
   return data;
   ```

4. **Funciones async sin await**
   ```javascript
   const data = asyncFunction(); // ⚠️ Falta await
   ```

5. **Migración sin validación**
   ```javascript
   await migrate();
   markAsMigrated(); // ⚠️ Sin validar
   ```

---

## 📚 Ejemplos de Implementación Correcta

### Ejemplo 1: Migración Segura Completa
```javascript
async function migrateToIndexedDB() {
    // 1. Verificar estado
    if (DocuProjectStorage.isMigrated()) {
        console.log('ℹ️ Ya migrado');
        return true;
    }
    
    // 2. Obtener datos originales
    const originalData = DocuAuth.loadFromStorage('docu_project_data');
    if (!originalData || typeof originalData !== 'object') {
        console.log('ℹ️ No hay datos para migrar');
        // NO marcar como migrado
        return true;
    }
    
    // 3. Inicializar nuevo almacenamiento
    try {
        await DocuProjectStorage.init();
    } catch (error) {
        console.error('❌ Error inicializando IndexedDB:', error);
        return false; // NO marcar como migrado
    }
    
    // 4. Migrar datos
    const userIds = Object.keys(originalData);
    let successCount = 0;
    
    for (const userId of userIds) {
        try {
            await DocuProjectStorage.saveUserData(userId, originalData[userId]);
            successCount++;
        } catch (error) {
            console.error(`❌ Error migrando usuario ${userId}:`, error);
        }
    }
    
    // 5. Validar migración
    if (successCount !== userIds.length) {
        console.error(`❌ Migración parcial: ${successCount}/${userIds.length}`);
        return false; // NO marcar como migrado
    }
    
    // 6. Verificar integridad
    for (const userId of userIds) {
        const migrated = await DocuProjectStorage.loadUserData(userId);
        const original = originalData[userId];
        
        if (JSON.stringify(migrated) !== JSON.stringify(original)) {
            console.error(`❌ Datos no coinciden para ${userId}`);
            return false; // NO marcar como migrado
        }
    }
    
    // 7. SOLO si todo es exitoso, marcar como migrado
    DocuProjectStorage.markAsMigrated();
    console.log('✅ Migración completada y validada');
    return true;
}
```

### Ejemplo 2: Carga con Fallback Completo
```javascript
async function loadProjectData(userId) {
    // 1. Intentar IndexedDB
    if (typeof DocuProjectStorage !== 'undefined') {
        try {
            // Asegurar migración
            if (!DocuProjectStorage.isMigrated()) {
                const migrated = await DocuProjectStorage.migrateFromLocalStorage();
                if (!migrated) {
                    console.warn('⚠️ Migración falló, usando localStorage');
                }
            }
            
            // Cargar desde IndexedDB
            const data = await DocuProjectStorage.loadUserData(userId);
            if (data) {
                console.log('✅ Datos cargados desde IndexedDB');
                return data;
            }
        } catch (error) {
            console.warn('⚠️ Error con IndexedDB:', error);
        }
    }
    
    // 2. Fallback a localStorage
    const allProjects = DocuAuth.loadFromStorage('docu_project_data') || {};
    const data = allProjects[userId] || null;
    
    if (data) {
        console.log('✅ Datos cargados desde localStorage');
        
        // 3. Re-migrar si es necesario
        if (DocuProjectStorage?.isMigrated()) {
            console.warn('⚠️ Datos en localStorage pero no en IndexedDB. Re-migrando...');
            try {
                await DocuProjectStorage.saveUserData(userId, data);
                console.log('✅ Datos re-migrados');
            } catch (error) {
                console.error('❌ Error re-migrando:', error);
            }
        }
    } else {
        console.warn('⚠️ No se encontraron datos para usuario:', userId);
    }
    
    return data;
}
```

---

## 🎓 Lecciones Aprendidas

### De los Errores Recientes

1. **Nunca asumir que no hay datos**
   - Siempre verificar antes de marcar como completado
   - Mantener fallback activo

2. **Validar después de migrar**
   - Comparar datos originales vs migrados
   - Solo marcar como migrado si validación pasa

3. **Mantener datos originales**
   - No eliminar hasta verificar migración exitosa
   - Mejor mantener como backup permanente

4. **Fallback siempre activo**
   - Nuevo método puede fallar
   - Fallback debe funcionar siempre

5. **Async/await consistente** ⚠️ **CRÍTICO**
   - Todas las funciones que usan await deben ser async
   - Todas las llamadas a funciones async deben usar await
   - **PROBLEMA DEL SIDEBAR**: Funciones NO async llamando a funciones async sin await causan que los datos sean Promises en lugar de objetos

---

## 🚨 NUEVA SECCIÓN: Prevención de Errores Async/Await

### Problema Crítico Identificado: Sidebar Dañado

**Síntoma**: El sidebar no muestra información correctamente, aparece vacío o con datos incorrectos.

**Causa Raíz**: Funciones que NO son async llamando a funciones async sin `await`, resultando en que las variables contengan Promises en lugar de datos.

### Regla Crítica: Async/Await en Cascada

```javascript
// ❌ PROBLEMA: Función NO async llamando a función async
function loadSidebar() {
    const data = getProjectData(); // Retorna Promise, no datos
    const teams = data.teams; // undefined porque data es Promise
    // Sidebar se renderiza vacío
}

// ✅ SOLUCIÓN: Función async con await
async function loadSidebar() {
    const data = await getProjectData(); // Retorna datos reales
    const teams = data.teams; // Funciona correctamente
    // Sidebar se renderiza con datos
}
```

### Checklist de Async/Await (OBLIGATORIO)

Antes de cambiar una función a async o usar funciones async:

- [ ] **Identificar TODAS las funciones que llaman a la función async**
- [ ] **Convertir funciones llamadoras a async si necesitan los datos**
- [ ] **Agregar `await` a TODAS las llamadas a funciones async**
- [ ] **Agregar `.catch()` a llamadas async en event listeners o setTimeout**
- [ ] **Verificar que NO hay llamadas sin await en funciones NO async**

### Patrón Seguro para Async/Await

#### Patrón 1: Función que Necesita Datos
```javascript
// ✅ CORRECTO
async function loadData() {
    const data = await getProjectData();
    return data.teams;
}

// Llamada:
const teams = await loadData();
```

#### Patrón 2: Event Listener que Llama Función Async
```javascript
// ✅ CORRECTO
button.addEventListener('click', async function() {
    const data = await loadData();
    // Usar data
});

// O si no necesitas esperar:
button.addEventListener('click', function() {
    loadData().catch(err => console.error('Error:', err));
});
```

#### Patrón 3: setTimeout con Función Async
```javascript
// ✅ CORRECTO
setTimeout(() => {
    loadData().catch(err => console.error('Error:', err));
}, 200);

// O mejor:
setTimeout(async () => {
    try {
        await loadData();
    } catch (err) {
        console.error('Error:', err);
    }
}, 200);
```

#### Patrón 4: Función que Llama Múltiples Funciones Async
```javascript
// ✅ CORRECTO
async function initPage() {
    const teams = await loadTeams();
    const projects = await loadProjects();
    // Usar teams y projects
}

// Llamada:
initPage().catch(err => console.error('Error inicializando:', err));
```

### Señales de Alerta Async/Await

Si ves alguno de estos patrones, **DETENER** y corregir:

1. **Función NO async llamando función async sin await**
   ```javascript
   function load() {
       const data = asyncFunction(); // ❌ Falta await
   }
   ```

2. **Variable contiene Promise en lugar de datos**
   ```javascript
   const data = getProjectData(); // data es Promise
   console.log(data.teams); // undefined
   ```

3. **setTimeout sin manejo de errores**
   ```javascript
   setTimeout(() => {
       asyncFunction(); // ❌ Sin await ni .catch()
   }, 200);
   ```

4. **Event listener sin manejo de async**
   ```javascript
   button.addEventListener('click', function() {
       asyncFunction(); // ❌ Sin await ni .catch()
   });
   ```

### Verificación Post-Cambio

Después de cambiar funciones a async:

```javascript
// Verificar en consola:
const data = await getProjectData();
console.assert(data !== null, '❌ Datos no cargados');
console.assert(data.teams !== undefined, '❌ Teams no disponibles');
console.assert(Array.isArray(data.teams), '❌ Teams no es array');
```

### Comando de Verificación

```javascript
// En consola del navegador:
// Verificar que getProjectData retorna datos, no Promise
const test = await DocuProjectData.getProjectData();
console.log('Tipo:', typeof test);
console.log('Es Promise?', test instanceof Promise);
console.log('Tiene teams?', test?.teams !== undefined);
```

---

## 📋 Checklist Actualizado: Async/Await

### Antes de Cambiar Función a Async

- [ ] **Buscar TODAS las llamadas a la función** (usar grep)
- [ ] **Identificar funciones que llaman a esta función**
- [ ] **Convertir funciones llamadoras a async si es necesario**
- [ ] **Agregar await a TODAS las llamadas**
- [ ] **Agregar .catch() a llamadas en event listeners**
- [ ] **Agregar .catch() a llamadas en setTimeout**
- [ ] **Probar que los datos se cargan correctamente**

### Después de Cambiar Función a Async

- [ ] **Verificar que NO hay llamadas sin await**
- [ ] **Verificar que funciones llamadoras son async**
- [ ] **Probar en consola que datos se cargan**
- [ ] **Verificar que UI se actualiza correctamente**
- [ ] **Revisar logs de consola por errores**

---

## 🔍 Diagnóstico de Problemas Async/Await

### Síntoma: Sidebar Vacío o Dañado

**Pasos de diagnóstico**:

1. **Abrir consola del navegador**
2. **Verificar errores**:
   ```javascript
   // Buscar errores como:
   // "Cannot read property 'teams' of undefined"
   // "data.teams is not a function"
   ```

3. **Verificar tipo de datos**:
   ```javascript
   const data = await DocuProjectData.getProjectData();
   console.log('Tipo:', typeof data);
   console.log('Es Promise?', data instanceof Promise);
   ```

4. **Verificar funciones**:
   ```javascript
   // Verificar que funciones son async
   console.log(loadTeamsInSidebar.constructor.name); // Debe ser "AsyncFunction"
   ```

5. **Buscar llamadas sin await**:
   ```bash
   # En terminal:
   grep -n "getProjectData()" create_team.html | grep -v "await"
   ```

### Solución Rápida

Si el sidebar está vacío:

1. **Verificar consola** por errores
2. **Buscar funciones que llaman getProjectData() sin await**
3. **Convertir funciones a async**
4. **Agregar await a las llamadas**
5. **Recargar página**

---

**Última actualización**: Después del error de migración a IndexedDB y problema del sidebar
**Versión**: 1.1
**Estado**: Activo - OBLIGATORIO seguir este protocolo

---

## 📞 Contacto y Escalación

Si detectas un problema que podría causar pérdida de datos:

1. **DETENER** el cambio inmediatamente
2. **REVERTIR** a versión anterior
3. **DOCUMENTAR** el problema
4. **REVISAR** este protocolo
5. **CORREGIR** siguiendo este protocolo

---

## ✅ Checklist Final Antes de Deploy

- [ ] Todas las pruebas pasan
- [ ] Datos existentes se preservan
- [ ] Fallback funciona correctamente
- [ ] Migración valida datos
- [ ] No hay errores en consola
- [ ] Documentación actualizada
- [ ] Procedimiento de rollback documentado
- [ ] Revisión de código completada

---

**Última actualización**: Después del error de migración a IndexedDB
**Versión**: 1.0
**Estado**: Activo - OBLIGATORIO seguir este protocolo

