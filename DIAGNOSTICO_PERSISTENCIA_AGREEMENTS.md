# Diagnóstico: Persistencia de Datos en Agreements

## 📋 Resumen Ejecutivo

**Objetivo:** Implementar persistencia de datos para los formularios del componente agreements, asegurando que los datos se vean en la vista publicada del proyecto y en la vista de edición de forma precargada.

**Conclusión:** ✅ **ES VIABLE** implementar la persistencia sin conflictos significativos. Requiere agregar código en 3 lugares principales.

---

## 🔍 Análisis de la Implementación Actual

### Estado Actual

#### 1. **Guardado de Datos (Publish)**
- **Ubicación:** `project_empty.html` línea ~7560-7759
- **Estado:** ❌ **NO IMPLEMENTADO** para agreements
- **Funcionalidad:** Se recopilan stages, teams, assets, goals, kpis pero NO agreements
- **Código actual:**
  ```javascript
  const projectData = {
      name: projectName,
      status: 'published',
      stages: stages,
      teams: teams,
      assets: assets,
      goals: goals,
      kpis: kpis
      // ❌ FALTA: agreements: agreements
  };
  ```

#### 2. **Carga de Datos (Edit View)**
- **Ubicación:** `project_empty.html` función `loadProjectData()` línea ~3659-4031
- **Estado:** ❌ **NO IMPLEMENTADO** para agreements
- **Funcionalidad:** Se cargan stages, teams, assets, goals, kpis pero NO agreements

#### 3. **Vista Publicada**
- **Ubicación:** `project_view.html`
- **Estado:** ❌ **NO IMPLEMENTADO** para agreements
- **Necesidad:** Mostrar agreements guardados en la vista publicada

---

## 📊 Datos a Persistir

Cada agreement tiene la siguiente estructura:
```javascript
{
    name: string,           // Nombre del acuerdo (ej: "Meeting May 5")
    date: string,           // Fecha seleccionada (ej: "May 5, 2024")
    status: string,         // Estado: 'to-start', 'in-progress', 'paused', 'done'
    items: string[]         // Array de items/artículos del acuerdo
}
```

---

## 🔧 Implementación Requerida

### Paso 1: Recopilar Datos de Agreements al Publicar

**Ubicación:** `project_empty.html` línea ~7655 (después de recopilar KPIs)

**Código a agregar:**
```javascript
// Recopilar Agreements
const agreements = [];
const emptyContainer = document.getElementById('projectAgreementsEmpty');
if (emptyContainer && emptyContainer.style.display !== 'none') {
    const contentContainer = emptyContainer.querySelector('.dsu-agreements__content');
    if (contentContainer) {
        // Buscar todos los formularios de agreements (base y creados)
        const agreementForms = contentContainer.querySelectorAll('.dsu-agreements__agreement[id^="projectAgreementForm"]');
        
        agreementForms.forEach(agreementForm => {
            const agreementId = agreementForm.id.replace('projectAgreementForm', '').replace('_', '');
            const uniqueId = agreementId || 'base';
            
            // Obtener nombre del acuerdo
            let agreementName = '';
            const nameInput = document.getElementById(`projectAgreementName_${uniqueId}`) || document.getElementById('projectAgreementName');
            const nameTitle = agreementForm.querySelector('.dsu-agreements__agreement-title');
            
            if (nameTitle && nameTitle.textContent.trim()) {
                agreementName = nameTitle.textContent.trim();
            } else if (nameInput && nameInput.value.trim()) {
                agreementName = nameInput.value.trim();
            }
            
            // Obtener fecha
            const dateButtonText = document.getElementById(`projectAgreementDateButtonText_${uniqueId}`) || document.getElementById('projectAgreementDateButtonText');
            const date = (dateButtonText && dateButtonText.textContent !== 'Select a date') 
                ? dateButtonText.textContent 
                : '';
            
            // Obtener status
            const statusButtonText = document.getElementById(`projectAgreementStatusButtonText_${uniqueId}`) || document.getElementById('projectAgreementStatusButtonText');
            let status = 'to-start';
            if (statusButtonText) {
                status = statusButtonText.textContent.toLowerCase().replace(' ', '-');
            }
            
            // Obtener items
            const items = [];
            const itemsContainer = document.getElementById(`projectEmptyItems_${uniqueId}`) || document.getElementById('projectEmptyItems');
            if (itemsContainer) {
                itemsContainer.querySelectorAll('.dsu-agreements__agreement-item-text').forEach(itemText => {
                    const itemContent = itemText.textContent.replace(/^-\s*/, '').trim();
                    if (itemContent) {
                        items.push(itemContent);
                    }
                });
            }
            
            // Solo agregar si tiene al menos nombre o items
            if (agreementName || items.length > 0) {
                agreements.push({
                    name: agreementName,
                    date: date,
                    status: status,
                    items: items
                });
            }
        });
    }
}

console.log('📋 Agreements recopilados:', agreements.length, agreements);
```

**Agregar al projectData:**
```javascript
const projectData = {
    name: projectName,
    status: 'published',
    stages: stages,
    teams: teams,
    assets: assets,
    goals: goals,
    kpis: kpis,
    agreements: agreements  // ✅ NUEVO
};
```

---

### Paso 2: Cargar Datos de Agreements en Vista de Edición

**Ubicación:** `project_empty.html` función `loadProjectData()` después de cargar KPIs (línea ~3984)

**Código a agregar:**
```javascript
// Cargar Agreements
if (project.agreements && Array.isArray(project.agreements) && project.agreements.length > 0) {
    console.log('📋 Cargando Agreements:', project.agreements.length);
    
    // Esperar a que initAgreements haya terminado
    setTimeout(() => {
        const emptyContainer = document.getElementById('projectAgreementsEmpty');
        const defaultContainer = document.getElementById('projectAgreementsDefault');
        
        if (emptyContainer && defaultContainer) {
            // Ocultar default, mostrar empty
            defaultContainer.style.display = 'none';
            emptyContainer.style.display = 'block';
            
            // Limpiar agreements existentes (excepto el formulario base)
            const contentContainer = emptyContainer.querySelector('.dsu-agreements__content');
            if (contentContainer) {
                // Eliminar todos los agreements creados dinámicamente (con ID que contiene _)
                const existingAgreements = contentContainer.querySelectorAll('.dsu-agreements__agreement[id^="projectAgreementForm_"]');
                existingAgreements.forEach(agreement => agreement.remove());
                
                // Eliminar todos los forms creados dinámicamente
                const existingForms = contentContainer.querySelectorAll('.dsu-agreements__agreement-form[id^="projectAgreementFormForm_"]');
                existingForms.forEach(form => form.remove());
                
                // Limpiar formulario base
                const baseAgreementForm = document.getElementById('projectAgreementForm');
                const baseNameInput = document.getElementById('projectAgreementName');
                const baseDateButtonText = document.getElementById('projectAgreementDateButtonText');
                const baseStatusButtonText = document.getElementById('projectAgreementStatusButtonText');
                const baseItemsContainer = document.getElementById('projectEmptyItems');
                
                if (baseNameInput) baseNameInput.value = '';
                if (baseDateButtonText) baseDateButtonText.textContent = 'Select a date';
                if (baseStatusButtonText) {
                    baseStatusButtonText.textContent = 'To start';
                    const baseStatusButton = document.getElementById('projectAgreementStatusButton');
                    if (baseStatusButton) {
                        baseStatusButton.className = 'dsu-status-button dsu-status-button--to-start';
                    }
                }
                if (baseItemsContainer) baseItemsContainer.innerHTML = '';
            }
            
            // Cargar cada agreement secuencialmente
            project.agreements.forEach((agreementData, index) => {
                setTimeout(() => {
                    // Crear nuevo agreement usando createNewAgreementGroup
                    if (typeof createNewAgreementGroup === 'function') {
                        createNewAgreementGroup();
                        
                        // Esperar a que se cree para poblar datos
                        setTimeout(() => {
                            // Encontrar el último agreement creado
                            const allAgreements = contentContainer.querySelectorAll('.dsu-agreements__agreement[id^="projectAgreementForm"]');
                            const lastAgreement = Array.from(allAgreements).pop();
                            
                            if (lastAgreement) {
                                const agreementId = lastAgreement.id.replace('projectAgreementForm', '').replace('_', '');
                                const uniqueId = agreementId || 'base';
                                
                                // Cargar nombre
                                const nameInput = document.getElementById(`projectAgreementName_${uniqueId}`);
                                const nameTitle = lastAgreement.querySelector('.dsu-agreements__agreement-title');
                                if (agreementData.name) {
                                    if (nameInput) {
                                        nameInput.value = agreementData.name;
                                        // Trigger updateAgreementTitle si el nombre se muestra como título
                                        if (typeof updateAgreementTitleForGroup === 'function') {
                                            updateAgreementTitleForGroup(uniqueId, agreementData.name);
                                        }
                                    }
                                }
                                
                                // Cargar fecha
                                if (agreementData.date) {
                                    const dateButtonText = document.getElementById(`projectAgreementDateButtonText_${uniqueId}`);
                                    if (dateButtonText) {
                                        dateButtonText.textContent = agreementData.date;
                                        // Actualizar date picker si es necesario
                                    }
                                }
                                
                                // Cargar status
                                if (agreementData.status) {
                                    const statusButtonText = document.getElementById(`projectAgreementStatusButtonText_${uniqueId}`);
                                    const statusButton = document.getElementById(`projectAgreementStatusButton_${uniqueId}`);
                                    if (statusButtonText && statusButton) {
                                        const statusText = agreementData.status.split('-').map(word => 
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ');
                                        statusButtonText.textContent = statusText;
                                        statusButton.className = `dsu-status-button dsu-status-button--${agreementData.status}`;
                                    }
                                }
                                
                                // Cargar items
                                if (agreementData.items && Array.isArray(agreementData.items) && agreementData.items.length > 0) {
                                    const itemsContainer = document.getElementById(`projectEmptyItems_${uniqueId}`);
                                    if (itemsContainer && typeof addEmptyAgreementItem === 'function') {
                                        agreementData.items.forEach(itemText => {
                                            addEmptyAgreementItem(itemText, itemsContainer);
                                        });
                                        // Mostrar items container
                                        itemsContainer.style.display = 'flex';
                                        // Mostrar meta
                                        const meta = document.getElementById(`projectEmptyMeta_${uniqueId}`);
                                        if (meta) meta.style.display = 'flex';
                                        // Mostrar toggle button
                                        const toggleBtn = document.getElementById(`projectEmptyToggleBtn_${uniqueId}`);
                                        if (toggleBtn) {
                                            toggleBtn.style.display = 'block';
                                            const toggleImg = toggleBtn.querySelector('img');
                                            if (toggleImg) toggleImg.src = 'images/minus.svg';
                                        }
                                    }
                                }
                            }
                        }, 150 * (index + 1));
                    }
                }, 200 * (index + 1));
            });
        }
    }, 1000); // Esperar a que initAgreements termine
}
```

---

### Paso 3: Mostrar Agreements en Vista Publicada

**Ubicación:** `project_view.html` función `loadProjectData()` o función de renderizado

**Estructura a mostrar:**
- Similar a la vista de edición pero sin campos editables
- Mostrar todos los agreements con su nombre, fecha, status e items

---

## ⚠️ Evaluación de Conflictos

### Conflictos Potenciales

#### 1. **Funciones Existentes** ✅
- `createNewAgreementGroup()` - ✅ Existe y puede reutilizarse
- `initNewAgreementGroup()` - ✅ Existe para inicializar funcionalidad
- `addEmptyAgreementItem()` - ✅ Existe para agregar items
- `updateAgreementTitleForGroup()` - ✅ Existe para actualizar título

**Conclusión:** No hay conflictos, todas las funciones necesarias existen.

#### 2. **Estructura de IDs** ✅
- Los agreements dinámicos usan IDs como `projectAgreementForm_${uniqueId}`
- El formulario base usa `projectAgreementForm` (sin sufijo)
- Los elementos internos usan IDs como `projectAgreementName_${uniqueId}`

**Conclusión:** La estructura es consistente y permite identificar elementos correctamente.

#### 3. **Orden de Inicialización** ⚠️
- `initAgreements()` se llama en `initProjectEmptyPage()` (línea 2904)
- `loadProjectData()` se llama después con delay (línea 2940, setTimeout 600ms)

**Riesgo:** Bajo. El delay existente debería ser suficiente. Si hay problemas, aumentar delay.

#### 4. **Estado del Contenedor** ✅
- El contenedor puede estar en estado "default" o "empty"
- Al cargar datos, necesitamos cambiar a "empty" si hay agreements

**Conclusión:** Se maneja correctamente en el código propuesto.

#### 5. **Persistencia de Estado del Botón Toggle** ⚠️
- Los agreements pueden estar expandidos o colapsados
- No se persiste este estado actualmente

**Riesgo:** Bajo. Por defecto, se cargan todos expandidos. No afecta funcionalidad.

---

## 📝 Plan de Implementación

### Fase 1: Guardado de Datos ✅
1. Agregar recopilación de agreements en función de publish
2. Agregar `agreements` al objeto `projectData`
3. Verificar que se guarda correctamente

### Fase 2: Carga en Vista de Edición ✅
1. Agregar carga de agreements en `loadProjectData()`
2. Crear agreements dinámicamente usando `createNewAgreementGroup()`
3. Poblar datos de cada agreement
4. Manejar estados expandidos/colapsados

### Fase 3: Vista Publicada ✅
1. Agregar renderizado de agreements en `project_view.html`
2. Mostrar datos en formato de solo lectura

---

## ✅ Checklist de Validación

- [ ] Los agreements se guardan correctamente al publicar
- [ ] Los agreements se cargan correctamente en vista de edición
- [ ] Los nombres de agreements se muestran correctamente
- [ ] Las fechas se cargan correctamente
- [ ] Los status se cargan correctamente
- [ ] Los items se cargan correctamente
- [ ] Los agreements aparecen en orden correcto (más nuevo primero)
- [ ] Los agreements se muestran en vista publicada
- [ ] No hay conflictos con otras funcionalidades
- [ ] El estado expandido/colapsado funciona correctamente

---

## 🎯 Conclusión

**VIABILIDAD:** ✅ **ALTA**

La implementación es viable porque:
1. Todas las funciones necesarias ya existen
2. La estructura de datos es clara y consistente
3. No hay conflictos significativos
4. El código puede integrarse sin afectar funcionalidades existentes

**RECOMENDACIÓN:** Proceder con la implementación siguiendo el plan de 3 fases.










