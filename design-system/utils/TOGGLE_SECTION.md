# Toggle Section Utility

Utilidad para habilitar/deshabilitar elementos mediante un botón toggle con cambio de icono.

## Descripción

Esta funcionalidad permite alternar el estado de cualquier elemento (inputs, divs, textareas, etc.) mediante un botón que cambia el icono entre `eye.svg` (mostrar) y `eye_hidden.svg` (ocultar).

## Implementación

### Versión Básica

```javascript
function initToggleSection(toggleSelector, targetSelector, iconSelector, parentSelector) {
  const toggleButtons = document.querySelectorAll(toggleSelector);
  
  toggleButtons.forEach((toggleButton) => {
    toggleButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Buscar el contenedor padre
      const parentContainer = parentSelector 
        ? this.closest(parentSelector)
        : this.parentElement;
      
      if (!parentContainer) return;
      
      // Buscar el elemento objetivo
      const targetElement = parentContainer.querySelector(targetSelector);
      if (!targetElement) return;
      
      // Buscar el icono
      const icon = iconSelector ? this.querySelector(iconSelector) : null;
      
      // Determinar estado actual
      const isDisabled = targetElement.disabled || 
                         targetElement.classList.contains('disabled');
      
      if (isDisabled) {
        // Habilitar
        targetElement.disabled = false;
        targetElement.removeAttribute('disabled');
        targetElement.classList.remove('disabled');
        if (icon) icon.src = icon.src.replace('eye_hidden.svg', 'eye.svg');
      } else {
        // Deshabilitar
        targetElement.disabled = true;
        targetElement.setAttribute('disabled', 'disabled');
        targetElement.classList.add('disabled');
        if (icon) icon.src = icon.src.replace('eye.svg', 'eye_hidden.svg');
      }
    });
  });
}
```

### Parámetros

- **toggleSelector** (string): Selector CSS del botón que activa el toggle (ej: `.dsu-toggle-button`)
- **targetSelector** (string): Selector CSS del elemento a habilitar/deshabilitar (ej: `.dsu-target-element`)
- **iconSelector** (string, opcional): Selector CSS del icono a cambiar (ej: `.dsu-toggle-icon img`)
- **parentSelector** (string, opcional): Selector CSS del contenedor padre común (ej: `.dsu-toggle-group`)

### Estructura HTML

```html
<div class="dsu-toggle-group">
  <!-- Botón toggle -->
  <button class="dsu-toggle-button">
    <span>Hide section</span>
    <span class="dsu-toggle-icon">
      <img src="images/eye.svg" alt="Toggle">
    </span>
  </button>
  
  <!-- Elemento a habilitar/deshabilitar -->
  <input type="text" class="dsu-target-element" />
</div>
```

### Ejemplos de Uso

#### Para Inputs
```javascript
initToggleSection(
  '.dsu-input-label__hide',
  '.dsu-input',
  '.dsu-input-label__hide-icon img',
  '.dsu-input-group'
);
```

#### Para Textareas
```javascript
initToggleSection(
  '.dsu-textarea-label__hide',
  '.dsu-textarea',
  '.dsu-textarea-label__hide-icon img',
  '.dsu-textarea-group'
);
```

#### Para Divs u otros elementos
```javascript
initToggleSection(
  '.dsu-section-toggle',
  '.dsu-section-content',
  '.dsu-section-toggle-icon img',
  '.dsu-section-wrapper'
);
```

### CSS Recomendado

```css
/* Estado disabled */
.dsu-target-element:disabled,
.dsu-target-element.disabled {
  background-color: var(--color-status-disabled);
  cursor: not-allowed;
  opacity: 0.6;
  color: var(--color-text-secondary);
}

/* Clase para estilos adicionales cuando está oculto */
.dsu-section--hidden .dsu-target-element {
  background-color: var(--color-status-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}
```

## Eventos Personalizados

La funcionalidad dispara eventos personalizados que puedes escuchar:

```javascript
document.addEventListener('sectionEnabled', function(e) {
  console.log('Sección habilitada:', e.detail.element);
});

document.addEventListener('sectionDisabled', function(e) {
  console.log('Sección deshabilitada:', e.detail.element);
});
```

## Archivo de Utilidad

Para reutilizar en múltiples componentes, puedes usar el archivo:
`design-system/utils/toggle-section.js`

```html
<script src="../utils/toggle-section.js"></script>
<script>
  // Usar la función exportada
  initToggleSection('.my-toggle', '.my-target', '.my-icon img');
</script>
```

## Notas

- El icono debe estar inicialmente en `eye.svg` para que funcione correctamente
- Los elementos que no soportan `disabled` (como `<div>`) usan la clase `disabled` en su lugar
- La funcionalidad busca automáticamente el contenedor padre común para encontrar el elemento objetivo

