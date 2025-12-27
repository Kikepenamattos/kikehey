# Documentación: Sistema de Rich Text Input

## 📋 Resumen General

El sistema de **Rich Text Input** (`dsu-rich-text-input`) es un componente que permite edición de texto enriquecido con formato (negrita, cursiva, subrayado, listas, enlaces) y adjuntos de archivos. Existe en dos variantes:

1. **Modo Completo** (`dsu-rich-text-input`): Toolbar completa con todas las opciones de formato
2. **Modo Compacto** (`dsu-rich-text-input--compact`): Toolbar mínima con solo el botón de enlace

---

## 🎯 Modo Completo (`dsu-rich-text-input`)

### Estructura HTML

```html
<div class="dsu-rich-text-input" id="projectTestRichTextInput">
    <!-- Toolbar con botones de formato -->
    <div class="dsu-rich-text-input__toolbar">
        <button class="dsu-rich-text-input__toolbar-button" data-command="bold" title="Negrita">
            <img src="images/bold.svg" alt="Bold">
        </button>
        <button class="dsu-rich-text-input__toolbar-button" data-command="italic" title="Cursiva">
            <img src="images/italic.svg" alt="Italic">
        </button>
        <button class="dsu-rich-text-input__toolbar-button" data-command="underline" title="Subrayado">
            <img src="images/underline.svg" alt="Underline">
        </button>
        <div class="dsu-rich-text-input__toolbar-separator"></div>
        <button class="dsu-rich-text-input__toolbar-button" data-command="insertUnorderedList" title="Lista con viñetas">
            <img src="images/list-bullet.svg" alt="Bullet List">
        </button>
        <button class="dsu-rich-text-input__toolbar-button" data-command="insertOrderedList" title="Lista numerada">
            <img src="images/number_list.svg" alt="Numbered List">
        </button>
        <div class="dsu-rich-text-input__toolbar-separator"></div>
        <button class="dsu-rich-text-input__toolbar-button" data-command="createLink" data-value="https://" title="Insertar enlace">
            <img src="images/link.svg" alt="Link">
        </button>
    </div>
    
    <!-- Editor contenteditable -->
    <div class="dsu-rich-text-input__editor" contenteditable="true" data-placeholder="Add your project context..."></div>
    
    <!-- Footer con acciones adicionales -->
    <div class="dsu-rich-text-input__footer">
        <div class="dsu-rich-text-input__footer-left">
            <button class="dsu-rich-text-input__footer-button" data-command="attachment" title="Adjuntar archivo">
                <img src="images/attachment.svg" alt="Attachment">
            </button>
            <button class="dsu-rich-text-input__footer-button" data-command="delete" title="Eliminar">
                <img src="images/trash.svg" alt="Delete">
            </button>
        </div>
    </div>
</div>
```

### Funcionalidad

#### 1. Inicialización (`initRichTextInput`)

**Ubicación**: `project_empty.html` línea 13964

**Proceso**:
1. Busca el editor (`dsu-rich-text-input__editor`) dentro del componente
2. Busca todos los botones de toolbar (`dsu-rich-text-input__toolbar-button[data-command]`)
3. Busca botones del footer (`dsu-rich-text-input__footer-button[data-command]`)
4. Inicializa el sistema de placeholder
5. Asigna event listeners a los botones

#### 2. Sistema de Placeholder

**Función**: `checkPlaceholder()`

- Verifica si el editor está vacío (`textContent.trim() === ''`)
- Si está vacío, agrega la clase `dsu-rich-text-input__editor--empty`
- Si tiene contenido, remueve la clase
- Se ejecuta en eventos `input` y `blur`

#### 3. Toolbar Buttons

**Comandos disponibles**:
- `bold`: Aplica negrita al texto seleccionado
- `italic`: Aplica cursiva al texto seleccionado
- `underline`: Subraya el texto seleccionado
- `insertUnorderedList`: Crea lista con viñetas
- `insertOrderedList`: Crea lista numerada
- `createLink`: Crea un enlace (abre prompt para URL)

**Implementación**:
- Usa `document.execCommand(command, false, value)` para aplicar formato
- Para `createLink`, abre un `prompt()` para ingresar la URL
- Después de cada comando, actualiza el estado de los botones con `updateToolbarButtons()`

#### 4. Actualización de Estado de Botones (`updateToolbarButtons`)

**Ubicación**: `project_empty.html` línea 14281

**Proceso**:
1. Itera sobre todos los botones de toolbar
2. Usa `document.queryCommandState(command)` para verificar si el comando está activo
3. Agrega/remueve la clase `dsu-rich-text-input__toolbar-button--active` según el estado
4. Se ejecuta en eventos `keyup` y `mouseup` del editor

**Comandos verificados**:
- `bold`, `italic`, `underline`: Verifican si el formato está aplicado
- `insertUnorderedList`, `insertOrderedList`: Verifican si el cursor está dentro de una lista

#### 5. Footer Buttons

**Botones disponibles**:

**a) Attachment (`data-command="attachment"`)**:
- Crea dinámicamente un `<input type="file">` si no existe
- Maneja la selección de archivos según tipo:
  - **Imágenes** (`image/*`): Crea un `<img>` con preview, clickeable para abrir en modal
  - **PDFs** (`application/pdf`): Crea un `<iframe>` con preview del PDF, clickeable para abrir en modal
  - **Otros documentos**: Crea un contenedor con icono, nombre, tamaño y extensión, clickeable para mostrar info en modal
- Inserta el preview en la posición del cursor
- Los previews son clickeables y abren `openPreviewModal()`

**b) Delete (`data-command="delete"`)**:
- Muestra confirmación antes de eliminar
- Limpia todo el contenido del editor (`editor.textContent = ''`)
- Actualiza el placeholder

#### 6. Event Delegation para Previews

**Ubicación**: `project_empty.html` línea 14229

**Proceso**:
- Escucha clicks en el editor
- Detecta si el click fue en un `.rich-text-attachment-preview`
- Identifica el tipo de preview (imagen, PDF, documento)
- Abre el modal correspondiente con `openPreviewModal()`

---

## 🎯 Modo Compacto (`dsu-rich-text-input--compact`)

### Propósito

Versión simplificada para inputs que solo necesitan agregar enlaces a texto. Se usa principalmente en:
- Sección de Assets (proyectos y equipos)
- Sección de Deliverables (proyectos)
- Inputs de búsqueda con funcionalidad de enlace

### Estructura HTML (Generada dinámicamente)

```html
<div class="dsu-rich-text-input dsu-rich-text-input--compact">
    <!-- Toolbar compacta con solo botón de link -->
    <div class="dsu-rich-text-input__toolbar dsu-rich-text-input__toolbar--compact">
        <button class="dsu-rich-text-input__toolbar-button" data-command="createLink" data-value="https://" title="Insertar enlace">
            <img src="images/link.svg" alt="Link">
        </button>
    </div>
    
    <!-- Editor compacto -->
    <div class="dsu-rich-text-input__editor dsu-rich-text-input__editor--compact" contenteditable="true" data-placeholder="Placeholder..."></div>
</div>
```

### Conversión de Input a Rich Text Compact

**Función**: `convertInputToRichTextCompact(input, isValidUrlFunction, addItemFunction)`

**Ubicación**: `project_empty.html` línea 16402

**Parámetros**:
- `input`: El elemento `<input>` original a convertir
- `isValidUrlFunction`: Función opcional para validar URLs (por defecto usa `new URL()`)
- `addItemFunction`: Función que se ejecuta al presionar Enter para agregar el item

**Proceso de Conversión**:

1. **Validación**:
   - Verifica que el input exista y no haya sido convertido (`input.dataset.richTextConverted !== 'true'`)
   - Busca el contenedor padre (`.dsu-input-container`)

2. **Preservación de Datos**:
   - Guarda el `placeholder` original
   - Guarda el `value` original

3. **Creación de Estructura**:
   - Crea el wrapper `dsu-rich-text-input--compact`
   - Crea la toolbar compacta con solo el botón de link
   - Crea el editor `contenteditable` con las clases apropiadas
   - Ocultar el input original (`input.style.display = 'none'`)
   - Marcar como convertido (`input.dataset.richTextConverted = 'true'`)

4. **Sincronización Bidireccional**:

   **a) `syncToInput()`**: Editor → Input
   - Guarda el `innerHTML` en `input.dataset.richTextHtml`
   - Guarda el `textContent.trim()` en `input.value`
   - Se ejecuta en eventos `input` y `blur`

   **b) `syncFromInput()`**: Input → Editor
   - Lee `input.dataset.richTextHtml` si existe y lo aplica como `innerHTML`
   - Si no hay HTML, usa `input.value` como `textContent`
   - Actualiza el estado del placeholder

5. **Sistema de Placeholder**:
   - Similar al modo completo
   - Verifica si el editor está vacío y no tiene links
   - Agrega/remueve clase `dsu-rich-text-input__editor--empty`

6. **Botón de Link**:
   - Al hacer click, abre un `prompt()` para ingresar URL
   - Si hay texto seleccionado, crea un `<a>` con ese texto
   - Si no hay selección, crea un `<a>` con la URL como texto
   - El link se crea con `target="_blank"`
   - Actualiza placeholder y sincroniza

7. **Evento Enter (`keypress`)**:
   - Al presionar Enter, extrae el contenido con `extractContentFromEditor()`
   - Si hay contenido y existe `addItemFunction`, la ejecuta
   - Limpia el editor después de agregar el item

8. **Extracción de Contenido (`extractContentFromEditor()`)**:

   **Lógica**:
   ```javascript
   function extractContentFromEditor() {
       const text = editor.textContent.trim();
       const links = editor.querySelectorAll('a');
       
       if (links.length > 0) {
           // Si hay links, retornar el primer link
           const firstLink = links[0];
           return {
               type: 'link',
               url: firstLink.href,
               name: firstLink.textContent.trim() || firstLink.href
           };
       } else if (text) {
           // Verificar si el texto es una URL
           if (isValidUrl(text)) {
               return {
                   type: 'link',
                   url: text,
                   name: text
               };
           } else {
               return {
                   type: 'text',
                   text: text
               };
           }
       }
       return null;
   }
   ```

   **Retorna**:
   - Si hay links: `{ type: 'link', url: string, name: string }`
   - Si el texto es URL: `{ type: 'link', url: string, name: string }`
   - Si es texto normal: `{ type: 'text', text: string }`
   - Si está vacío: `null`

---

## 📦 Persistencia de Datos

### En Modo Completo

El contenido se guarda directamente desde el editor:
- Se lee el `innerHTML` del editor
- Se guarda en el objeto de datos del proyecto/equipo
- Al cargar, se restaura el `innerHTML` directamente

### En Modo Compacto

**Al Guardar (`getFormData()`)**:

1. **Sincronización Previa**:
   - Antes de recopilar datos, se sincroniza el contenido del editor al input:
   ```javascript
   const editor = richTextWrapper.querySelector('.dsu-rich-text-input__editor--compact');
   if (editor) {
       const htmlContent = editor.innerHTML.trim();
       input.dataset.richTextHtml = htmlContent;
       input.value = editor.textContent.trim();
   }
   ```

2. **Extracción de Contenido**:
   - Lee el `innerHTML` y `textContent` del editor
   - Detecta si hay links (`querySelectorAll('a')`)
   - Si hay links:
     - Si el texto completo es solo el link → guarda como link simple
     - Si hay texto adicional → guarda el texto completo como `name` y el link como `url`
   - Si no hay links pero el texto es una URL → guarda como link
   - Si es texto normal → guarda como texto

3. **Al Publicar**:
   - Se sincroniza explícitamente antes de `getFormData()`:
   ```javascript
   // Sincronizar todos los rich text inputs compactos
   document.querySelectorAll('.dsu-rich-text-input--compact').forEach(richTextWrapper => {
       const editor = richTextWrapper.querySelector('.dsu-rich-text-input__editor--compact');
       const inputId = richTextWrapper.dataset.inputId;
       const input = document.getElementById(inputId);
       if (editor && input) {
           const htmlContent = editor.innerHTML;
           input.dataset.richTextHtml = htmlContent;
           input.value = editor.textContent.trim();
       }
   });
   ```

**Al Cargar (`loadProjectData()`)**:

1. Se restaura el `innerHTML` desde `input.dataset.richTextHtml` si existe
2. Si no hay HTML, se usa `input.value` como `textContent`
3. Se actualiza el estado del placeholder

---

## 🎨 Estilos CSS

### Modo Completo

**`.dsu-rich-text-input`**:
- `display: flex; flex-direction: column;`
- `padding: var(--spacing-24);`
- `border: 1px solid var(--color-basics-mid-blue);`
- `border-radius: var(--radius-md);`

**`.dsu-rich-text-input__toolbar`**:
- `display: flex; align-items: center; gap: var(--spacing-08);`
- `padding-bottom: var(--spacing-16);`
- `border-bottom: 1px solid var(--color-basics-gray);`

**`.dsu-rich-text-input__editor`**:
- `min-height: 96px;`
- `contenteditable: true;`
- Sin borde, fondo transparente

**`.dsu-rich-text-input__footer`**:
- `display: flex; justify-content: space-between;`
- `padding-top: var(--spacing-16);`
- `border-top: 1px solid var(--color-basics-gray);`

### Modo Compacto

**`.dsu-rich-text-input--compact`**:
- `padding: 0;`
- `border: 1px solid var(--color-basics-mid-blue;`
- `border-radius: var(--radius-md);`
- `min-height: 48px;`
- `position: relative;`

**`.dsu-rich-text-input__toolbar--compact`**:
- `position: absolute;`
- `top: 50%; right: var(--spacing-12);`
- `transform: translateY(-50%);`
- `display: flex;` (siempre visible)
- Botones: `width: 20px; height: 20px; opacity: 0.6;`
- Al hover: `opacity: 1;`

**`.dsu-rich-text-input__editor--compact`**:
- `min-height: 48px;`
- `padding: var(--spacing-12) calc(var(--spacing-16) + 32px + var(--spacing-08)) var(--spacing-12) var(--spacing-16);`
- Padding derecho ajustado para el botón de link

**Placeholder en Compacto**:
- Usa `::before` con `content: attr(data-placeholder);`
- Solo visible cuando el editor tiene clase `dsu-rich-text-input__editor--empty`

### Dark Mode

**Modo Completo**:
- `background-color: var(--color-surface-regular);`
- `border: 1px solid var(--color-basics-mid-blue);`
- Iconos con `filter: brightness(0) saturate(100%) invert(1);`

**Modo Compacto**:
- Mismos ajustes de fondo y borde
- Texto del editor: `color: #ffffff !important;` (forzado con `!important`)
- Links: `color: var(--color-basics-light-blue) !important;`

---

## 🔄 Flujo de Uso

### Modo Completo

1. Usuario escribe en el editor
2. Usuario selecciona texto y aplica formato (negrita, cursiva, etc.)
3. Usuario puede agregar enlaces, listas, adjuntos
4. Al guardar, se lee el `innerHTML` del editor
5. Al cargar, se restaura el `innerHTML`

### Modo Compacto

1. **Conversión**: Input normal se convierte a rich text compact
2. **Edición**: Usuario escribe texto
3. **Agregar Link**: Usuario selecciona texto y hace click en botón de link, o hace click sin seleccionar
4. **Enter**: Al presionar Enter:
   - Se extrae el contenido (texto o link)
   - Se ejecuta `addItemFunction(content)`
   - Se limpia el editor
5. **Persistencia**: El contenido se sincroniza al input original en `input` y `blur`
6. **Al Guardar**: Se sincroniza explícitamente antes de `getFormData()`
7. **Al Cargar**: Se restaura desde `input.dataset.richTextHtml` o `input.value`

---

## 📍 Ubicaciones de Uso

### Modo Completo

- **`project_empty.html`**:
  - `#projectTestRichTextInput` (Test Section)
  - `#projectSolveRichTextInput` (Solve Section)

### Modo Compacto

- **`project_empty.html`**:
  - Assets input (`initAssetsSection()`)
  - Deliverables input (`initDeliverablesSection()`)

- **`create_team.html`**:
  - Team assets input (`initTeamAssetsSection()`)
  - Description/Mission inputs (`initInputLinkFunctionality()`)

- **`team_filled.html`**:
  - Description/Mission inputs en modo edición (`initInputLinkFunctionality()`)

- **`create_space.html`**:
  - Space deliverables input (`initInputLinkFunctionality()`)

---

## ⚠️ Consideraciones Importantes

1. **Sincronización**: En modo compacto, siempre sincronizar antes de `getFormData()` para asegurar que el contenido más reciente esté disponible.

2. **Placeholder**: El placeholder solo se muestra cuando el editor está vacío y no tiene links.

3. **Links**: Los links se crean con `target="_blank"` para abrir en nueva pestaña.

4. **Persistencia HTML**: En modo compacto, se guarda tanto el `innerHTML` (para preservar formato) como el `textContent` (para búsqueda/validación).

5. **Extracción de Contenido**: La función `extractContentFromEditor()` prioriza links sobre texto, y valida si el texto es una URL.

6. **Dark Mode**: Los colores de texto en dark mode están forzados con `!important` para asegurar visibilidad.

7. **Exclusión de Inputs**: El `searchInput` está excluido de la conversión a rich text compact para evitar conflictos.

---

## 🐛 Solución de Problemas Comunes

### Problema: El contenido no persiste al publicar

**Solución**: Asegurar que se sincronice el editor antes de `getFormData()`:
```javascript
// Sincronizar todos los rich text inputs compactos
document.querySelectorAll('.dsu-rich-text-input--compact').forEach(richTextWrapper => {
    const editor = richTextWrapper.querySelector('.dsu-rich-text-input__editor--compact');
    const inputId = richTextWrapper.dataset.inputId;
    const input = document.getElementById(inputId);
    if (editor && input) {
        const htmlContent = editor.innerHTML;
        input.dataset.richTextHtml = htmlContent;
        input.value = editor.textContent.trim();
    }
});
```

### Problema: El texto con link no persiste completamente

**Solución**: En `extractContentFromEditor()`, si hay links, capturar el `innerHTML` completo como `name`:
```javascript
if (links.length > 0) {
    const firstLink = links[0];
    return {
        type: 'link',
        url: firstLink.href,
        name: editor.innerHTML.trim() // Usar innerHTML completo
    };
}
```

### Problema: El placeholder no desaparece

**Solución**: Verificar que `checkPlaceholder()` se ejecute en eventos `input` y `blur`, y que verifique tanto `textContent` como la presencia de links.

---

## 📚 Referencias de Código

- **Inicialización modo completo**: `project_empty.html` línea 13964
- **Conversión a compacto**: `project_empty.html` línea 16402
- **Actualización de botones**: `project_empty.html` línea 14281
- **Estilos CSS**: `design-system/components/input.css` línea 386
- **Persistencia en getFormData**: `project_empty.html` línea 14693
- **Persistencia en loadProjectData**: `project_empty.html` línea 15200 (aproximado)

---

**Última actualización**: Enero 2025

