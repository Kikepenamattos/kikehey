/**
 * ==========================================
 * TOGGLE SECTION UTILITY
 * Design System Docu
 * ==========================================
 * 
 * Utilidad para habilitar/deshabilitar elementos mediante un botón toggle.
 * Cambia el icono entre eye.svg (mostrar) y eye_hidden.svg (ocultar).
 * 
 * Uso básico:
 *   initToggleSection('.dsu-toggle-button', '.dsu-target-element', '.dsu-toggle-icon img');
 * 
 * Parámetros:
 *   @param {string} toggleSelector - Selector CSS del botón toggle
 *   @param {string} targetSelector - Selector CSS del elemento a habilitar/deshabilitar
 *   @param {string} iconSelector - Selector CSS del icono a cambiar (opcional)
 *   @param {string} parentSelector - Selector CSS del contenedor padre (opcional, default: busca el más cercano)
 * 
 * Ejemplo de HTML:
 *   <div class="dsu-toggle-group">
 *     <button class="dsu-toggle-button">
 *       <span>Hide section</span>
 *       <span class="dsu-toggle-icon">
 *         <img src="images/eye.svg" alt="Toggle">
 *       </span>
 *     </button>
 *     <input type="text" class="dsu-target-element" />
 *   </div>
 */

function initToggleSection(toggleSelector, targetSelector, iconSelector = null, parentSelector = null) {
  const toggleButtons = document.querySelectorAll(toggleSelector);
  
  toggleButtons.forEach((toggleButton) => {
    toggleButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Buscar el contenedor padre
      const parentContainer = parentSelector 
        ? this.closest(parentSelector)
        : this.parentElement;
      
      if (!parentContainer) {
        console.warn('Toggle Section: No se encontró el contenedor padre');
        return;
      }
      
      // Buscar el elemento objetivo
      const targetElement = parentContainer.querySelector(targetSelector);
      
      if (!targetElement) {
        console.warn('Toggle Section: No se encontró el elemento objetivo');
        return;
      }
      
      // Buscar el icono si se proporciona un selector
      const icon = iconSelector 
        ? this.querySelector(iconSelector) 
        : null;
      
      // Determinar si está deshabilitado
      const isDisabled = targetElement.disabled || 
                         targetElement.classList.contains('disabled') ||
                         targetElement.hasAttribute('disabled');
      
      if (isDisabled) {
        // Habilitar el elemento
        targetElement.disabled = false;
        targetElement.removeAttribute('disabled');
        targetElement.classList.remove('disabled');
        parentContainer.classList.remove('dsu-section--hidden');
        
        // Cambiar icono a "mostrar" (eye.svg)
        if (icon) {
          icon.src = icon.src.replace('eye_hidden.svg', 'eye.svg');
        }
        
        // Disparar evento personalizado
        targetElement.dispatchEvent(new CustomEvent('sectionEnabled', {
          bubbles: true,
          detail: { element: targetElement, toggleButton: this }
        }));
      } else {
        // Deshabilitar el elemento
        targetElement.disabled = true;
        targetElement.setAttribute('disabled', 'disabled');
        targetElement.classList.add('disabled');
        parentContainer.classList.add('dsu-section--hidden');
        
        // Cambiar icono a "ocultar" (eye_hidden.svg)
        if (icon) {
          icon.src = icon.src.replace('eye.svg', 'eye_hidden.svg');
        }
        
        // Disparar evento personalizado
        targetElement.dispatchEvent(new CustomEvent('sectionDisabled', {
          bubbles: true,
          detail: { element: targetElement, toggleButton: this }
        }));
      }
    });
  });
}

/**
 * Versión específica para inputs (misma funcionalidad que en input.html)
 */
function initInputHideSection() {
  initToggleSection(
    '.dsu-input-label__hide',
    '.dsu-input',
    '.dsu-input-label__hide-icon img',
    '.dsu-input-group'
  );
}

/**
 * Versión genérica con más opciones
 */
function initAdvancedToggleSection(config) {
  const {
    toggleSelector,
    targetSelector,
    iconSelector = null,
    parentSelector = null,
    enabledIcon = 'images/eye.svg',
    disabledIcon = 'images/eye_hidden.svg',
    onEnabled = null,
    onDisabled = null
  } = config;
  
  const toggleButtons = document.querySelectorAll(toggleSelector);
  
  toggleButtons.forEach((toggleButton) => {
    toggleButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      const parentContainer = parentSelector 
        ? this.closest(parentSelector)
        : this.parentElement;
      
      if (!parentContainer) return;
      
      const targetElement = parentContainer.querySelector(targetSelector);
      if (!targetElement) return;
      
      const icon = iconSelector ? this.querySelector(iconSelector) : null;
      const isDisabled = targetElement.disabled || 
                         targetElement.classList.contains('disabled') ||
                         targetElement.hasAttribute('disabled');
      
      if (isDisabled) {
        // Habilitar
        targetElement.disabled = false;
        targetElement.removeAttribute('disabled');
        targetElement.classList.remove('disabled');
        parentContainer.classList.remove('dsu-section--hidden');
        
        if (icon) icon.src = enabledIcon;
        if (onEnabled) onEnabled(targetElement, this);
        
      } else {
        // Deshabilitar
        targetElement.disabled = true;
        targetElement.setAttribute('disabled', 'disabled');
        targetElement.classList.add('disabled');
        parentContainer.classList.add('dsu-section--hidden');
        
        if (icon) icon.src = disabledIcon;
        if (onDisabled) onDisabled(targetElement, this);
      }
    });
  });
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initToggleSection,
    initInputHideSection,
    initAdvancedToggleSection
  };
}

