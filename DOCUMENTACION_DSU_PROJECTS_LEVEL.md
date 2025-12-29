# Documentación: `dsu-projects-level` en el Sidebar

## 📋 Resumen General

`dsu-projects-level` es un componente del sidebar que permite gestionar y navegar entre proyectos. Incluye un botón trigger, un chevron para expandir/colapsar, un dropdown con lista de proyectos, y funcionalidades avanzadas como menú contextual, creación de proyectos, y navegación.

---

## 🏗️ Estructura HTML

```html
<div class="dsu-projects-button">
    <div class="dsu-projects-level">
        <button class="dsu-projects-button__trigger dsu-projects-button__trigger--active">
            <span class="dsu-projects-button__icon">
                <img src="images/project.svg" alt="Projects">
            </span>
            <span class="dsu-projects-button__text">Projects</span>
        </button>
        <div class="dsu-projects-chevron">
            <img src="images/up-chevron.svg" alt="Chevron">
        </div>
    </div>
    
    <!-- Projects Dropdown -->
    <div class="dsu-projects-dropdown dsu-projects-dropdown--expanded">
        <button class="dsu-projects-create" id="createProjectBtn">
            <span>Create new project</span>
            <span class="dsu-projects-create__icon">
                <img src="images/plus.svg" alt="Plus">
            </span>
        </button>
        <!-- Projects list -->
        <div class="dsu-projects-list" id="projectsList">
            <!-- Projects list se poblará dinámicamente -->
        </div>
    </div>
</div>
```

---

## 🎯 Funcionalidades Implementadas

### 1. **Botón Trigger (`dsu-projects-button__trigger`)**

#### Funcionalidad Principal
- **Navegación a `myprojects.html`**: Al hacer clic en el botón, redirige a la página de proyectos.
- **Estado activo**: Muestra subrayado cuando está activo (`dsu-projects-button__trigger--active`).

#### Comportamiento
```javascript
trigger.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = 'myprojects.html';
});
```

**Características**:
- ✅ Previene propagación de eventos
- ✅ Redirige a `myprojects.html`
- ✅ No colapsa/expande el dropdown (solo navega)

---

### 2. **Chevron de Expansión/Colapso (`dsu-projects-chevron`)**

#### Funcionalidad Principal
- **Toggle del dropdown**: Solo el chevron puede expandir/colapsar el dropdown (no el botón completo).
- **Animación de icono**: Cambia entre `up-chevron.svg` (expandido) y `down-chevron.svg` (colapsado).

#### Comportamiento
```javascript
chevronElement.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const isExpanded = dropdown.classList.contains('dsu-projects-dropdown--expanded');
    
    if (isExpanded) {
        dropdown.classList.remove('dsu-projects-dropdown--expanded');
        trigger.classList.remove('dsu-projects-button__trigger--active');
        chevron.src = 'images/down-chevron.svg';
    } else {
        dropdown.classList.add('dsu-projects-dropdown--expanded');
        trigger.classList.add('dsu-projects-button__trigger--active');
        chevron.src = 'images/up-chevron.svg';
    }
});
```

**Características**:
- ✅ Solo el chevron controla el dropdown (separado del botón)
- ✅ Cambio de icono según estado (up/down)
- ✅ Animación CSS suave (transición de 0.3s-0.4s)
- ✅ Estado activo sincronizado con el trigger

---

### 3. **Dropdown de Proyectos (`dsu-projects-dropdown`)**

#### Estados

**Colapsado**:
- `max-height: 0`
- `opacity: 0`
- `padding-top: 0`, `padding-bottom: 0`
- `overflow: hidden`

**Expandido** (`dsu-projects-dropdown--expanded`):
- `max-height: 1000px`
- `opacity: 1`
- `padding-top: var(--spacing-08)`
- Transición suave con delays

#### Inicialización
- **Por defecto**: Siempre expandido al cargar la página
- **Persistencia**: No se guarda el estado (siempre expandido al recargar)

---

### 4. **Botón "Create new project" (`dsu-projects-create`)**

#### Funcionalidad Principal
- **Crear nuevo proyecto**: Redirige a `project_empty.html` en modo creación.

#### Comportamiento
```javascript
createProjectBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    sessionStorage.removeItem('docu_selected_project_id');
    sessionStorage.setItem('docu_create_new_project', 'true');
    window.location.href = 'project_empty.html';
});
```

**Características**:
- ✅ Limpia `docu_selected_project_id` de sessionStorage
- ✅ Marca `docu_create_new_project` como `true`
- ✅ Redirige a `project_empty.html`

---

### 5. **Lista de Proyectos (`dsu-projects-list`)**

#### Carga Dinámica (`loadProjectsInSidebar()`)

**Proceso**:

1. **Validación de Dependencias**:
   - Verifica que `DocuProjectData` esté disponible
   - Verifica que `DocuAuth` esté disponible
   - Verifica sesión activa
   - Reintenta si no están disponibles (200ms delay)

2. **Obtención de Datos**:
   ```javascript
   projectData = DocuProjectData.getProjectData();
   // Fallback a localStorage directo si es necesario
   const directData = DocuAuth.loadProjectData(session.email);
   ```

3. **Filtrado y Validación**:
   - Filtra proyectos con nombre válido (no vacío, string)
   - Excluye proyectos `null` o sin nombre

4. **Ordenamiento**:
   ```javascript
   validProjects.sort((a, b) => {
       const dateA = a.createdAt || a.updatedAt || 0;
       const dateB = b.createdAt || b.updatedAt || 0;
       return dateB - dateA; // Más reciente primero
   });
   ```

5. **Renderizado**:
   - Limpia la lista (`innerHTML = ''`)
   - Crea un wrapper (`dsu-project-item-wrapper`) para cada proyecto
   - Crea el item del proyecto (`dsu-project-item`)
   - Crea el botón de elipsis (`dsu-project-item__ellipsis`)
   - Agrega event listeners

**Estructura de cada item**:
```html
<div class="dsu-project-item-wrapper">
    <button class="dsu-project-item" data-project-id="..." data-project-name="...">
        <span class="dsu-project-item__text">Project Name</span>
    </button>
    <button class="dsu-project-item__ellipsis">
        <img src="images/elipsis.svg" alt="Más opciones">
    </button>
</div>
```

---

### 6. **Navegación a Proyecto (Click en Item)**

#### Funcionalidad Principal
- **Cargar proyecto**: Al hacer clic en un item de proyecto, navega a `project_view.html` con el ID del proyecto.

#### Comportamiento
```javascript
projectItem.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Remover active de todos los items
    projectsList.querySelectorAll('.dsu-project-item').forEach(item => {
        item.classList.remove('dsu-project-item--active', 'active');
    });
    
    // Agregar active al item clickeado
    projectItem.classList.add('dsu-project-item--active', 'active');
    
    // Redirigir
    sessionStorage.setItem('docu_selected_project_id', project.id);
    window.location.href = `project_view.html?id=${project.id}`;
});
```

**Características**:
- ✅ Actualiza estado activo (solo un proyecto activo a la vez)
- ✅ Guarda ID en `sessionStorage`
- ✅ Redirige a `project_view.html` con ID en URL

---

### 7. **Botón de Elipsis (`dsu-project-item__ellipsis`)**

#### Funcionalidad Principal
- **Menú contextual**: Al hacer clic, muestra un menú flotante con opciones (Share, Duplicate, Edit, Delete).

#### Comportamiento Visual
- **Visibilidad**: Solo visible al hacer hover sobre el wrapper (`dsu-project-item-wrapper:hover`)
- **Estados**:
  - Default: `opacity: 0`, `visibility: hidden`, `pointer-events: none`
  - Hover: `opacity: 1`, `visibility: visible`, `pointer-events: auto`

#### Comportamiento Funcional
```javascript
ellipsisBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    showContextMenu(e, 'project', project.id, project.name);
});
```

**Características**:
- ✅ Previene propagación completa (`stopImmediatePropagation`)
- ✅ Abre menú contextual con tipo `'project'`
- ✅ Pasa ID y nombre del proyecto

---

### 8. **Menú Contextual (Context Menu)**

#### Funcionalidad Principal
- **Opciones disponibles**: Share, Duplicate, Edit, Delete
- **Posicionamiento dinámico**: Se ajusta para permanecer visible en el viewport

#### Estructura del Menú
```javascript
const menuItems = [
    { action: 'share', label: 'Share', icon: 'images/share.svg' },
    { action: 'duplicate', label: 'Duplicate', icon: 'images/duplicate.svg' },
    { action: 'edit', label: 'Edit', icon: 'images/Edit.svg' },
    { separator: true },
    { action: 'delete', label: 'Delete', icon: 'images/trash.svg', danger: true }
];
```

#### Funcionalidades por Acción

**a) Share (`handleShare`)**:
- Usa Web Share API si está disponible
- Fallback: Copia URL al clipboard
- URL generada: `window.location.origin + window.location.pathname + '?id=' + itemId`

**b) Duplicate (`handleDuplicate`)**:
- Redirige a `project_empty.html?id=${itemId}&duplicate=true`
- El proyecto se duplica al cargar la página

**c) Edit (`handleEdit`)**:
- Redirige a `project_empty.html?edit=true&id=${itemId}`
- Carga el proyecto en modo edición

**d) Delete (`handleDelete`)**:
- Muestra confirmación antes de eliminar
- **Estado actual**: Funcionalidad pendiente de implementar (solo muestra alert)

#### Posicionamiento
```javascript
function positionContextMenu(menu, event) {
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    
    // Ajustar si se sale del viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > viewportWidth) {
        menu.style.left = (viewportWidth - rect.width - 10) + 'px';
    }
    if (rect.bottom > viewportHeight) {
        menu.style.top = (viewportHeight - rect.height - 10) + 'px';
    }
}
```

**Características**:
- ✅ Se cierra al hacer clic fuera
- ✅ Animación de fade-in (0.15s)
- ✅ Z-index alto (10002) para estar sobre otros elementos
- ✅ Dark mode compatible

---

### 9. **Marcado de Proyecto Activo (`markActiveProject()`)**

#### Funcionalidad Principal
- **Indicador visual**: Marca el proyecto actualmente seleccionado con clase `dsu-project-item--active`.

#### Proceso
```javascript
function markActiveProject() {
    // Obtener ID desde URL o sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdFromURL = urlParams.get('id');
    let selectedProjectId = projectIdFromURL || sessionStorage.getItem('docu_selected_project_id');
    
    // Buscar item y marcar como activo
    projectItems.forEach(item => {
        const itemId = item.getAttribute('data-project-id');
        if (itemId === selectedProjectId) {
            item.classList.add('dsu-project-item--active', 'active');
        }
    });
}
```

**Características**:
- ✅ Se ejecuta después de `loadProjectsInSidebar()`
- ✅ Prioriza ID de URL sobre sessionStorage
- ✅ Usa `setTimeout(100ms)` para asegurar que el DOM esté listo
- ✅ Solo un proyecto activo a la vez

**Estilos del item activo**:
- `text-decoration: underline`
- `font-weight: var(--font-weight-semibold)`

---

## 🎨 Estilos CSS Clave

### `.dsu-projects-level`
```css
.dsu-projects-level {
  display: flex;
  gap: var(--spacing-08);
  align-items: center;
  width: 100%;
}
```

### `.dsu-projects-button__trigger`
- **Estados**:
  - Default: `background-color: var(--color-surface-regular)`
  - Hover: `background-color: var(--color-surface-especial)`
  - Active: `text-decoration: underline`

### `.dsu-projects-dropdown`
- **Transición**: `max-height 0.3s ease-out, opacity 0.3s ease-out, padding 0.3s ease-out`
- **Expandido**: `max-height: 1000px`, `opacity: 1`, `padding-top: var(--spacing-08)`

### `.dsu-project-item-wrapper`
- **Hover**: Muestra el botón de elipsis
- **Layout**: Flex con gap de 8px

### `.dsu-project-item__ellipsis`
- **Visibilidad**: Solo en hover del wrapper
- **Tamaño**: 20x20px
- **Dark mode**: Icono invertido

---

## 🔄 Flujo de Funcionamiento Completo

### 1. **Inicialización de la Página**

```
DOMContentLoaded
  ↓
initNavigationDropdowns()
  ↓
Configurar event listeners para:
  - Botón trigger (navegación a myprojects.html)
  - Chevron (toggle dropdown)
  - Botón "Create new project"
  ↓
loadProjectsInSidebar()
  ↓
Cargar proyectos desde DocuProjectData
  ↓
Filtrar, ordenar y renderizar proyectos
  ↓
markActiveProject()
  ↓
Marcar proyecto activo si existe
```

### 2. **Interacción del Usuario**

**Caso A: Click en botón "Projects"**:
```
Click en trigger
  ↓
Prevenir propagación
  ↓
Redirigir a myprojects.html
```

**Caso B: Click en chevron**:
```
Click en chevron
  ↓
Toggle clase dsu-projects-dropdown--expanded
  ↓
Cambiar icono (up/down chevron)
  ↓
Actualizar estado activo del trigger
```

**Caso C: Click en "Create new project"**:
```
Click en createProjectBtn
  ↓
Limpiar sessionStorage
  ↓
Marcar docu_create_new_project = true
  ↓
Redirigir a project_empty.html
```

**Caso D: Click en item de proyecto**:
```
Click en dsu-project-item
  ↓
Remover active de todos los items
  ↓
Agregar active al item clickeado
  ↓
Guardar ID en sessionStorage
  ↓
Redirigir a project_view.html?id={id}
```

**Caso E: Click en elipsis**:
```
Hover sobre wrapper
  ↓
Elipsis se hace visible
  ↓
Click en elipsis
  ↓
Prevenir propagación
  ↓
showContextMenu()
  ↓
Mostrar menú flotante
  ↓
Click en opción del menú
  ↓
handleContextMenuAction()
  ↓
Ejecutar acción (Share/Duplicate/Edit/Delete)
```

---

## 📊 Datos y Persistencia

### Fuente de Datos
- **Primaria**: `DocuProjectData.getProjectData()` (IndexedDB o localStorage)
- **Fallback**: `DocuAuth.loadProjectData(session.email)` (localStorage directo)

### Estructura de Proyecto
```javascript
{
    id: string,           // ID único del proyecto
    name: string,         // Nombre del proyecto
    createdAt: number,    // Timestamp de creación
    updatedAt: number,    // Timestamp de actualización
    // ... otros campos
}
```

### SessionStorage
- **`docu_selected_project_id`**: ID del proyecto actualmente seleccionado
- **`docu_create_new_project`**: Flag para crear nuevo proyecto

### Ordenamiento
- **Criterio**: Fecha de creación o actualización (más reciente primero)
- **Método**: `sort()` con comparación de timestamps descendente

---

## ⚙️ Funciones JavaScript Principales

### 1. `initNavigationDropdowns()`
- **Ubicación**: Inicialización general del sidebar
- **Responsabilidad**: Configurar event listeners para trigger y chevron
- **Ejecución**: Al cargar la página

### 2. `loadProjectsInSidebar()`
- **Ubicación**: Función principal de carga
- **Responsabilidad**: 
  - Obtener proyectos desde storage
  - Filtrar y validar
  - Ordenar por fecha
  - Renderizar en el DOM
- **Ejecución**: Al cargar la página y cuando sea necesario recargar

### 3. `markActiveProject()`
- **Ubicación**: Después de `loadProjectsInSidebar()`
- **Responsabilidad**: Marcar visualmente el proyecto activo
- **Ejecución**: Después de renderizar proyectos

### 4. `showContextMenu(event, itemType, itemId, itemName)`
- **Responsabilidad**: Crear y mostrar menú contextual
- **Parámetros**:
  - `itemType`: `'project'` o `'team'`
  - `itemId`: ID del item
  - `itemName`: Nombre del item

### 5. `handleContextMenuAction(action, itemType, itemId, itemName)`
- **Responsabilidad**: Ejecutar acción del menú contextual
- **Acciones**: `'share'`, `'duplicate'`, `'edit'`, `'delete'`

### 6. `handleShare(itemType, itemId, itemName)`
- **Responsabilidad**: Compartir proyecto (Web Share API o clipboard)

### 7. `handleDuplicate(itemType, itemId, itemName)`
- **Responsabilidad**: Duplicar proyecto (redirige con flag `duplicate=true`)

### 8. `handleEdit(itemType, itemId, itemName)`
- **Responsabilidad**: Editar proyecto (redirige con flag `edit=true`)

### 9. `handleDelete(itemType, itemId, itemName)`
- **Responsabilidad**: Eliminar proyecto (pendiente de implementar)

---

## 🎯 Puntos Clave de Funcionamiento

### 1. **Separación de Responsabilidades**
- **Botón trigger**: Solo navegación (no toggle)
- **Chevron**: Solo toggle dropdown (no navegación)
- **Item de proyecto**: Solo navegación al proyecto
- **Elipsis**: Solo menú contextual (no navegación)

### 2. **Gestión de Estado**
- **Dropdown**: Siempre expandido por defecto
- **Proyecto activo**: Se marca basado en URL o sessionStorage
- **Estado visual**: Sincronizado con clases CSS

### 3. **Carga Asíncrona**
- **Reintentos**: Si `DocuProjectData` no está disponible, reintenta cada 200ms
- **Fallback**: Si falla IndexedDB, usa localStorage directo
- **Validación**: Verifica sesión activa antes de cargar

### 4. **Ordenamiento Inteligente**
- **Prioridad**: `createdAt` > `updatedAt` > `0`
- **Orden**: Descendente (más reciente primero)
- **Filtrado**: Solo proyectos con nombre válido

### 5. **Prevención de Conflictos**
- **Event propagation**: `stopPropagation()` y `stopImmediatePropagation()` en elipsis
- **Zones separadas**: Elipsis y texto del item tienen zonas de click independientes
- **Context menu**: Se cierra al hacer clic fuera

### 6. **Compatibilidad**
- **Dark mode**: Iconos con filtro de inversión
- **Responsive**: Funciona en diferentes tamaños de viewport
- **Accesibilidad**: `aria-label` en botones de elipsis

### 7. **Performance**
- **Renderizado eficiente**: Solo renderiza proyectos válidos
- **Lazy loading**: No carga proyectos hasta que se necesita
- **Debouncing**: `setTimeout` para marcar proyecto activo

---

## 🔍 Ubicaciones de Implementación

### Archivos que incluyen `dsu-projects-level`:
- ✅ `project_empty.html`
- ✅ `project_view.html`
- ✅ `team_filled.html`
- ✅ `create_team.html`
- ✅ `create_space.html`
- ✅ `myprojects.html`

### Archivos de Estilos:
- ✅ `design-system/components/navigation.css` (línea 452)

### Archivos de Funcionalidad:
- ✅ Cada HTML tiene su propia implementación de `loadProjectsInSidebar()`
- ✅ Funciones de context menu compartidas en múltiples archivos

---

## 📝 Notas Importantes

1. **Estado del Dropdown**: Siempre expandido por defecto (no se guarda estado colapsado)

2. **Navegación vs Toggle**: El botón trigger navega, el chevron togglea (separación clara)

3. **Async/Await**: `loadProjectsInSidebar()` debe ser `async` si usa `await` con `DocuProjectData.getProjectData()`

4. **Validación de Datos**: Solo se muestran proyectos con nombre válido (no null, no vacío)

5. **Ordenamiento**: Los proyectos se ordenan automáticamente (más reciente primero)

6. **Context Menu**: Funcionalidad transversal (también disponible para teams)

7. **Delete**: Funcionalidad pendiente de implementar (solo muestra confirmación)

---

## 🐛 Consideraciones y Limitaciones

1. **Reintentos**: Si `DocuProjectData` no está disponible, se reintenta indefinidamente (podría causar loop infinito si nunca se carga)

2. **Performance**: Si hay muchos proyectos (>100), el renderizado puede ser lento

3. **Estado del Dropdown**: No se persiste el estado colapsado/expandido entre recargas

4. **Delete**: Funcionalidad no implementada completamente

5. **Error Handling**: Algunos errores solo se loguean en consola sin feedback al usuario

---

**Última actualización**: Enero 2025

