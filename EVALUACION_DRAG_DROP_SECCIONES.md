# Evaluación: Drag & Drop de Secciones en Project Empty

## 📋 Resumen Ejecutivo

**Objetivo:** Evaluar la viabilidad de implementar funcionalidad de drag & drop para reorganizar secciones del proyecto según el criterio del usuario.

**Conclusión:** ✅ **ES VIABLE** con consideraciones técnicas importantes. Requiere implementación cuidadosa para mantener compatibilidad con persistencia y vista publicada.

---

## 🔍 Análisis de Estructura Actual

### Secciones Identificadas

Las siguientes secciones están dentro de `.project-content`:

1. **project-name-section** (fija - no arrastrable)
2. **project-budget-section** (fija - no arrastrable)
3. **project-stages-section** - "Define your project stages"
4. **team-members-section** - "Team members"
5. **project-ceremonies-section** - "Project ceremonies"
6. **project-communication-channels-section** - "Communication channels"
7. **project-objective-section** - "What do you want to accomplish?"
8. **project-agreements-section** - "Project agreements"
9. **project-tasks-section** - "Task planner"
10. **project-deliverables-section** - "Deliverables"
11. **project-assets-section** - "Assets or links"
12. **project-test-section** - "Project context"
13. **project-solve-section** - "How do you solve it?"

### Estructura de Datos Actual

```javascript
const projectData = {
    name: string,
    status: 'published',
    stages: [],
    teams: [],
    ceremonies: [],
    communicationChannels: [],
    assets: [],
    goals: [],
    kpis: [],
    tasks: [],
    agreements: [],
    projectContext: string,
    solveDescription: string,
    solutionApproach: string,
    deliverables: [],
    collapsibleSectionsState: {}
};
```

**Observación:** Los datos se guardan por tipo de contenido, NO por orden de sección.

---

## 🎯 Escenarios de Uso

### Escenario 1: Reorganización Básica
**Caso:** Usuario quiere mover "Task planner" arriba de "Deliverables"
- **Acción:** Arrastrar sección `project-tasks-section` arriba de `project-deliverables-section`
- **Resultado esperado:** Las tareas aparecen antes de los deliverables en la vista
- **Persistencia:** El orden debe guardarse y reflejarse en `project_view.html`

### Escenario 2: Personalización por Proyecto
**Caso:** Diferentes proyectos requieren diferentes órdenes de secciones
- **Proyecto A:** Tasks → Deliverables → Assets
- **Proyecto B:** Assets → Tasks → Deliverables
- **Resultado esperado:** Cada proyecto mantiene su orden personalizado
- **Persistencia:** El orden debe ser específico por proyecto

### Escenario 3: Reorganización Durante Edición
**Caso:** Usuario reorganiza secciones mientras edita contenido
- **Acción:** Mover secciones mientras se está editando contenido dentro de ellas
- **Resultado esperado:** El contenido editado se mantiene, solo cambia el orden
- **Persistencia:** El orden se guarda al publicar o auto-guardar

### Escenario 4: Vista Publicada
**Caso:** Usuario publica proyecto y luego lo visualiza
- **Acción:** Ver `project_view.html` después de publicar
- **Resultado esperado:** El orden de secciones debe coincidir con el orden en `project_empty.html`
- **Persistencia:** El orden debe estar en los datos guardados

---

## 💡 Soluciones Propuestas

### Solución 1: HTML5 Drag & Drop API (Recomendada)

#### Ventajas:
- ✅ Nativa del navegador, sin dependencias
- ✅ Buena compatibilidad (todos los navegadores modernos)
- ✅ Accesible (soporte para lectores de pantalla)
- ✅ Funciona en móviles con touch events

#### Implementación:

```javascript
// 1. Agregar atributos draggable a secciones
function initSectionDragDrop() {
    const draggableSections = document.querySelectorAll('.project-content > [class*="-section"]:not(.project-name-section):not(.project-budget-section)');
    
    draggableSections.forEach(section => {
        section.draggable = true;
        section.dataset.sectionId = section.id || generateSectionId(section);
        
        // Agregar indicador visual de drag
        section.classList.add('draggable-section');
        
        // Event listeners
        section.addEventListener('dragstart', handleDragStart);
        section.addEventListener('dragover', handleDragOver);
        section.addEventListener('drop', handleDrop);
        section.addEventListener('dragend', handleDragEnd);
    });
}

// 2. Manejar eventos de drag
let draggedElement = null;
let draggedIndex = null;

function handleDragStart(e) {
    draggedElement = this;
    draggedIndex = Array.from(this.parentNode.children).indexOf(this);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const afterElement = getDragAfterElement(this.parentNode, e.clientY);
    if (afterElement == null) {
        this.parentNode.appendChild(draggedElement);
    } else {
        this.parentNode.insertBefore(draggedElement, afterElement);
    }
}

function handleDrop(e) {
    e.preventDefault();
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Guardar nuevo orden
    saveSectionOrder();
}

// 3. Guardar orden en projectData
function saveSectionOrder() {
    const sections = Array.from(document.querySelectorAll('.project-content > [class*="-section"]:not(.project-name-section):not(.project-budget-section)'));
    const sectionOrder = sections.map(section => {
        // Extraer identificador de sección del ID o clase
        return extractSectionIdentifier(section);
    });
    
    // Guardar en projectData
    if (!window.currentProjectData) {
        window.currentProjectData = {};
    }
    window.currentProjectData.sectionOrder = sectionOrder;
    
    // Auto-guardar (opcional)
    autoSaveSectionOrder();
}
```

#### CSS Necesario:

```css
.draggable-section {
    cursor: move;
    transition: opacity 0.2s ease;
}

.draggable-section:hover {
    opacity: 0.8;
}

.draggable-section.dragging {
    opacity: 0.5;
    border: 2px dashed var(--color-basics-light-blue);
}

.draggable-section.drag-over {
    border-top: 3px solid var(--color-basics-light-blue);
    margin-top: 8px;
}
```

#### Estructura de Datos Actualizada:

```javascript
const projectData = {
    // ... datos existentes ...
    sectionOrder: [
        'project-stages-section',
        'team-members-section',
        'project-tasks-section',
        'project-deliverables-section',
        'project-assets-section',
        // ... resto de secciones
    ]
};
```

---

### Solución 2: SortableJS (Librería Externa)

#### Ventajas:
- ✅ Muy fácil de implementar
- ✅ Excelente UX (animaciones, feedback visual)
- ✅ Soporte para touch devices
- ✅ Manejo automático de eventos

#### Desventajas:
- ❌ Dependencia externa (~20KB)
- ❌ Requiere mantenimiento de versión

#### Implementación:

```html
<!-- Agregar al head -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
```

```javascript
function initSectionDragDrop() {
    const projectContent = document.querySelector('.project-content');
    
    // Excluir secciones fijas
    const sortableContainer = document.createElement('div');
    sortableContainer.className = 'sortable-sections-container';
    
    // Mover secciones arrastrables al contenedor sortable
    const draggableSections = Array.from(
        projectContent.querySelectorAll('[class*="-section"]:not(.project-name-section):not(.project-budget-section)')
    );
    
    draggableSections.forEach(section => {
        sortableContainer.appendChild(section);
    });
    
    projectContent.appendChild(sortableContainer);
    
    // Inicializar Sortable
    new Sortable(sortableContainer, {
        animation: 150,
        handle: '.section-drag-handle', // Opcional: handle específico
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: function(evt) {
            saveSectionOrder();
        }
    });
}
```

---

### Solución 3: Botones de Reordenamiento (Sin Drag & Drop)

#### Ventajas:
- ✅ Más accesible
- ✅ Funciona en todos los dispositivos
- ✅ Más controlado (menos errores)

#### Desventajas:
- ❌ Menos intuitivo que drag & drop
- ❌ Requiere más clics

#### Implementación:

```javascript
function addSectionReorderButtons() {
    const sections = document.querySelectorAll('.project-content > [class*="-section"]:not(.project-name-section):not(.project-budget-section)');
    
    sections.forEach((section, index) => {
        const header = section.querySelector('[class*="-header"]');
        if (!header) return;
        
        const reorderControls = document.createElement('div');
        reorderControls.className = 'section-reorder-controls';
        
        const upBtn = document.createElement('button');
        upBtn.className = 'section-reorder-btn section-reorder-btn--up';
        upBtn.innerHTML = '<img src="images/arrow-up.svg" alt="Move up">';
        upBtn.disabled = index === 0;
        upBtn.addEventListener('click', () => moveSection(section, 'up'));
        
        const downBtn = document.createElement('button');
        downBtn.className = 'section-reorder-btn section-reorder-btn--down';
        downBtn.innerHTML = '<img src="images/arrow-down.svg" alt="Move down">';
        downBtn.disabled = index === sections.length - 1;
        downBtn.addEventListener('click', () => moveSection(section, 'down'));
        
        reorderControls.appendChild(upBtn);
        reorderControls.appendChild(downBtn);
        header.appendChild(reorderControls);
    });
}

function moveSection(section, direction) {
    const parent = section.parentNode;
    const sibling = direction === 'up' 
        ? section.previousElementSibling 
        : section.nextElementSibling;
    
    if (sibling && !sibling.classList.contains('project-name-section') && !sibling.classList.contains('project-budget-section')) {
        if (direction === 'up') {
            parent.insertBefore(section, sibling);
        } else {
            parent.insertBefore(section, sibling.nextSibling);
        }
        saveSectionOrder();
        updateReorderButtons();
    }
}
```

---

## ⚠️ Riesgos y Conflictos

### 1. **Persistencia de Datos**
**Riesgo:** El orden de secciones no está actualmente en la estructura de datos.

**Impacto:** 
- Al cargar un proyecto, las secciones volverían al orden por defecto
- La vista publicada (`project_view.html`) no reflejaría el orden personalizado

**Solución:**
- Agregar `sectionOrder` a `projectData`
- Modificar `loadProjectData()` para aplicar el orden guardado
- Modificar `project_view.html` para respetar el orden

### 2. **Compatibilidad con Vista Publicada**
**Riesgo:** `project_view.html` tiene estructura HTML similar pero diferente.

**Impacto:**
- El orden guardado en `project_empty.html` debe aplicarse en `project_view.html`
- Las secciones en `project_view.html` deben tener los mismos IDs o identificadores

**Solución:**
- Asegurar que los IDs de secciones coincidan entre ambas vistas
- Crear función compartida para aplicar orden de secciones

### 3. **Secciones Fijas**
**Riesgo:** `project-name-section` y `project-budget-section` no deben moverse.

**Impacto:**
- Usuario podría intentar mover secciones fijas
- Confusión en la UI

**Solución:**
- Excluir explícitamente estas secciones del drag & drop
- Agregar indicadores visuales claros

### 4. **Estados Colapsados/Expandidos**
**Riesgo:** Al mover secciones, los estados colapsados/expandidos podrían perderse.

**Impacto:**
- Usuario pierde contexto visual al reorganizar

**Solución:**
- Mantener `collapsibleSectionsState` independiente del orden
- Los estados se guardan por ID de sección, no por posición

### 5. **Responsive y Mobile**
**Riesgo:** Drag & drop puede ser difícil en dispositivos táctiles.

**Impacto:**
- Mala experiencia de usuario en móviles

**Solución:**
- Usar SortableJS (mejor soporte touch)
- O implementar botones de reordenamiento como alternativa
- Detectar dispositivo y ofrecer ambas opciones

### 6. **Performance con Muchas Secciones**
**Riesgo:** Reorganizar muchas secciones podría causar lag.

**Impacto:**
- Experiencia de usuario degradada

**Solución:**
- Usar `requestAnimationFrame` para animaciones
- Limitar re-renders innecesarios
- Usar `transform` en lugar de cambiar `top/left` para mejor performance

---

## 📊 Comparación de Soluciones

| Criterio | HTML5 Drag & Drop | SortableJS | Botones Reordenar |
|----------|-------------------|------------|-------------------|
| **Facilidad de implementación** | Media | Alta | Alta |
| **Tamaño (KB)** | 0 (nativo) | ~20KB | 0 (nativo) |
| **UX/Animaciones** | Básica | Excelente | Básica |
| **Soporte Touch** | Limitado | Excelente | Excelente |
| **Accesibilidad** | Buena | Media | Excelente |
| **Mantenimiento** | Bajo | Medio (dependencia) | Bajo |
| **Performance** | Buena | Excelente | Excelente |

---

## ✅ Recomendación Final

### Opción Recomendada: **HTML5 Drag & Drop API** con mejoras

**Razones:**
1. ✅ Sin dependencias externas
2. ✅ Control total sobre la implementación
3. ✅ Buen rendimiento
4. ✅ Compatible con el stack actual

### Mejoras Sugeridas:

1. **Indicador Visual de Drag Handle:**
   - Agregar icono de "grip" o "drag" en el header de cada sección
   - Solo visible en hover o modo edición

2. **Feedback Visual Mejorado:**
   - Línea indicadora donde se soltará la sección
   - Sombra/opacidad durante el arrastre
   - Animación suave al soltar

3. **Persistencia Automática:**
   - Guardar orden en `localStorage` inmediatamente
   - Sincronizar con `projectData` al publicar
   - Cargar orden al inicializar página

4. **Compatibilidad con Vista Publicada:**
   - Función compartida para aplicar orden
   - Validar que IDs coincidan entre vistas

---

## 🔧 Plan de Implementación Sugerido

### Fase 1: Estructura Base
1. Agregar `sectionOrder` a estructura de datos
2. Crear función `saveSectionOrder()`
3. Crear función `loadSectionOrder()`

### Fase 2: Drag & Drop
1. Implementar HTML5 Drag & Drop API
2. Agregar estilos CSS para feedback visual
3. Agregar indicadores de drag handle

### Fase 3: Persistencia
1. Integrar con `publishProject()`
2. Integrar con `loadProjectData()`
3. Aplicar orden en `project_view.html`

### Fase 4: Testing
1. Probar en diferentes navegadores
2. Probar en dispositivos móviles
3. Validar persistencia después de recargar
4. Validar orden en vista publicada

### Fase 5: Mejoras UX
1. Agregar animaciones suaves
2. Mejorar feedback visual
3. Agregar tooltips/ayuda

---

## 📝 Notas Adicionales

### Consideraciones de Accesibilidad:
- Agregar `aria-label` a elementos draggable
- Asegurar que funcione con teclado (opcional: atajos de teclado)
- Mantener contraste adecuado en indicadores visuales

### Consideraciones de Performance:
- Usar `transform` en lugar de `top/left` para animaciones
- Debounce en `saveSectionOrder()` si se llama frecuentemente
- Lazy load de contenido pesado durante drag

### Consideraciones de UX:
- Mostrar confirmación visual al guardar orden
- Permitir "deshacer" reordenamiento (opcional)
- Guardar orden automáticamente sin necesidad de "publicar"

---

## 🎯 Conclusión

La implementación de drag & drop para secciones es **totalmente viable** y agregaría un valor significativo al producto. La solución recomendada (HTML5 Drag & Drop API) es robusta, sin dependencias, y se integra bien con la arquitectura actual.

**Próximos pasos sugeridos:**
1. Aprobar esta evaluación
2. Implementar Fase 1 (estructura base)
3. Probar con usuarios para validar UX
4. Continuar con fases restantes

