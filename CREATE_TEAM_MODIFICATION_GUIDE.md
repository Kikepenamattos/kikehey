# Guía de Modificación para `create_team.html`

## ⚠️ REGLAS CRÍTICAS ANTES DE MODIFICAR ESTE ARCHIVO

Este documento contiene reglas y mejores prácticas para modificar `create_team.html` sin romper el layout o la funcionalidad.

---

## 1. ESTRUCTURA Y LAYOUT

### ❌ NO HACER:
- **NO** agregar `setInterval()` sin `clearInterval()` - causa problemas de rendimiento y estado
- **NO** modificar clases CSS de botones (`.btn-share-team`, `.btn-add-member`) sin revisar el layout responsive
- **NO** cambiar la estructura HTML de `.primary-actions` sin verificar el diseño
- **NO** agregar clases dinámicas que modifiquen el layout base (como `.published`, `.published-team-name`)
- **NO** eliminar estilos CSS base sin verificar dependencias

### ✅ HACER:
- Usar eventos específicos (`addEventListener`) en lugar de polling (`setInterval`)
- Verificar que los cambios CSS no rompan el responsive design
- Probar en diferentes tamaños de pantalla después de cambios
- Documentar cualquier cambio en el comportamiento de botones

---

## 2. BOTONES Y ESTADOS

### Botón "Share team" (`.btn-share-team`)
- **Estado por defecto**: Siempre debe estar `disabled`
- **Ubicación**: Línea ~729 en el HTML
- **Comportamiento actual**: Permanente deshabilitado
- **Si necesitas cambiarlo**: 
  1. Documentar la razón específica
  2. Revisar la lógica en `initFormFunctionality()`
  3. Verificar que no afecte el layout

### Botón "Publish" (`#publishBtn`)
- **Estado**: Se habilita cuando hay texto en "Project name"
- **Lógica**: `initFormFunctionality()` línea ~1280
- **Acción**: Llama a `publishProject()` y luego `clearForm()`

---

## 3. FUNCIONES CRÍTICAS

### `initFormFunctionality()` (línea ~1282)
- **Propósito**: Maneja estados de botones del formulario
- **❌ NO agregar aquí**:
  - `setInterval()` continuos
  - Lógica que modifique clases CSS del layout
  - Cambios automáticos al estado del botón Share team sin documentar
- **✅ Puedes agregar**:
  - Event listeners específicos (`input`, `click`, etc.)
  - Validaciones de campos
  - Llamadas a funciones de guardado

### `publishProject()` (línea ~1351)
- **Propósito**: Publica un proyecto
- **Comportamiento requerido**:
  - Debe llamar `clearForm()` al final
  - Debe mostrar mensaje de éxito
  - Debe actualizar el sidebar
- **❌ NO agregar**:
  - Lógica que modifique clases CSS del layout
  - Cambios al estado del botón Share team sin documentar
  - Estilos inline que afecten el diseño

### `loadProjectData(projectData)` (línea ~2610)
- **Propósito**: Carga datos de un proyecto existente
- **Comportamiento requerido**:
  - Solo debe cargar valores en campos
  - No debe modificar estilos visuales
- **❌ NO agregar**:
  - Lógica que agregue/remueva clases CSS (como `.published`, `.published-team-name`)
  - Cambios al estado de botones sin documentar
  - Modificaciones al layout

### `createNewTeam()` (línea ~1207)
- **Propósito**: Crea un nuevo equipo limpio
- **Comportamiento requerido**:
  - Limpiar datos y formularios
  - Resetear IDs y variables de estado
  - NO debe modificar estilos del DOM
- **❌ NO agregar**:
  - Lógica para remover clases CSS de layout
  - Cambios al estado de botones sin documentar

---

## 4. CSS Y ESTILOS

### Áreas Sensibles:
1. **`.btn-share-team`** (línea ~143): Estilos del botón Share team
2. **`.primary-actions`** (línea ~135): Contenedor de botones principales
3. **`.project-name-group`** (línea ~74): Grupo del input de nombre del proyecto
4. **Layout general** (línea ~23): Estructura del body y contenedores

### Reglas:
- **NO** eliminar estilos base sin verificar dependencias
- **NO** agregar estilos inline que afecten el layout general
- **Siempre** verificar que los cambios CSS no rompan el responsive design

---

## 5. CHECKLIST DE PRUEBAS OBLIGATORIAS

Después de cualquier modificación, verificar:

- [ ] El layout se mantiene igual visualmente
- [ ] No hay errores en la consola del navegador
- [ ] Los botones mantienen su comportamiento original
- [ ] El diseño es responsive (probar en móvil, tablet, desktop)
- [ ] La funcionalidad de publicar sigue funcionando
- [ ] La funcionalidad de crear nuevo team funciona correctamente
- [ ] No hay `setInterval()` sin limpiar
- [ ] El botón Share team permanece deshabilitado (si aplica)

---

## 6. PATRONES A SEGUIR

### Para agregar funcionalidad nueva:
```javascript
// ✅ BUENO: Usar eventos específicos
element.addEventListener('click', function() {
    // lógica aquí
});

// ❌ MALO: Usar setInterval continuo
setInterval(function() {
    // esto puede causar problemas de rendimiento
}, 500);
```

### Para modificar estados de botones:
```javascript
// ✅ BUENO: Cambiar estado basado en evento específico
input.addEventListener('input', function() {
    button.disabled = !input.value.trim();
});

// ❌ MALO: Cambiar estado automáticamente con setInterval
setInterval(function() {
    button.disabled = condition;
}, 500);
```

---

## 7. CASOS ESPECÍFICOS CONOCIDOS

### Error común: Layout roto después de cambios
**Causa**: Agregar clases CSS dinámicas o `setInterval()` que modifican el DOM continuamente  
**Solución**: Usar eventos específicos y no modificar clases de layout

### Error común: Botón Share team habilitado cuando no debería
**Causa**: Modificar `shareTeamBtn.disabled` sin documentar  
**Solución**: Mantener `disabled` por defecto y solo cambiar con lógica específica documentada

---

## 8. CONTACTO Y DOCUMENTACIÓN

Si necesitas hacer cambios que contradigan estas reglas:
1. Documenta la razón específica en comentarios
2. Agrega comentarios de advertencia (`⚠️`) en el código
3. Actualiza esta guía si el cambio se vuelve permanente

---

**Última actualización**: Después de revertir cambios que rompían el layout (botón Share team y estilos de input publicado)

