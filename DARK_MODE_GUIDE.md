# 🌙 Guía de Modo Dark - Docu

Esta guía documenta todos los patrones y principios establecidos para la implementación del modo dark en el proyecto Docu. **Debe seguirse para todos los elementos nuevos o layouts que se construyan en el proyecto.**

## 📋 Tabla de Contenidos

1. [Principios Generales](#principios-generales)
2. [Inicialización del Tema](#inicialización-del-tema)
3. [Manejo de Colores](#manejo-de-colores)
4. [Iconos](#iconos)
5. [Inputs y Bordes](#inputs-y-bordes)
6. [Transiciones](#transiciones)
7. [Componentes Específicos](#componentes-específicos)
8. [Checklist para Nuevos Elementos](#checklist-para-nuevos-elementos)

---

## 🎯 Principios Generales

### 1. Uso de Variables CSS
**Siempre** usar variables CSS del design system en lugar de colores hardcodeados:

```css
/* ❌ MAL - Colores hardcodeados */
.element {
    background-color: #ffffff;
    color: #0a243f;
}

/* ✅ BIEN - Variables CSS */
.element {
    background-color: var(--color-surface-regular);
    color: var(--color-text-primary);
}
```

### 2. Selector de Modo Dark
Usar el selector `[data-theme="dark"]` para aplicar estilos de modo dark:

```css
.element {
    /* Estilos en modo light */
    background-color: var(--color-surface-regular);
    color: var(--color-text-primary);
}

/* Estilos en modo dark */
[data-theme="dark"] .element {
    background-color: var(--color-surface-regular); /* Se actualiza automáticamente */
    color: var(--color-text-primary); /* Se actualiza automáticamente */
}
```

### 3. Atributo data-theme
El atributo `data-theme` se establece en el elemento `<html>`:
- `data-theme="light"` - Modo claro
- `data-theme="dark"` - Modo oscuro

---

## ⚡ Inicialización del Tema

### JavaScript Requerido

**TODOS los archivos HTML deben incluir esta inicialización:**

```javascript
// ============================================
// DARK MODE FUNCTIONS
// ============================================

// Function to load saved theme
function loadTheme() {
    try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (error) {
        console.warn('⚠️ No se pudo cargar el tema:', error);
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// Initialize theme immediately (before DOMContentLoaded to prevent flash)
loadTheme();
```

**Ubicación**: Debe estar **antes** del evento `DOMContentLoaded` para evitar el flash de contenido.

---

## 🎨 Manejo de Colores

### Variables de Color Disponibles

Todas las variables de color se definen en `design-system/tokens/colors.css` y tienen equivalentes para modo dark:

#### Colores de Fondo
- `--color-surface-regular` - Fondo principal (blanco en light, dark blue en dark)
- `--color-surface-especial` - Fondo especial (light blue en light, dark blue variante en dark)
- `--color-surface-light` - Fondo claro (light gray en light, dark blue variante en dark)

#### Colores de Texto
- `--color-text-primary` - Texto principal (dark blue en light, white en dark)
- `--color-text-secondary` - Texto secundario (mid blue en light, mid blue claro en dark)

#### Colores de Borde
- `--color-border-default` - Borde por defecto (gray en light, dark gray en dark)
- `--color-border-light` - Borde claro (light gray en light, dark gray en dark)
- `--color-basics-mid-blue` - Borde mid blue (se adapta automáticamente)

#### Colores Básicos
- `--color-basics-white` - Blanco (siempre #ffffff)
- `--color-basics-dark-blue` - Dark blue (siempre #0a243f)

### Ejemplo de Uso

```css
.card {
    background-color: var(--color-surface-regular);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-default);
}

/* En modo dark, las variables se actualizan automáticamente */
/* No necesitas estilos específicos a menos que necesites un comportamiento especial */
```

---

## 🖼️ Iconos

### Principio General
Los iconos oscuros (`#0A243F`) deben volverse blancos (`#ffffff`) en modo dark.

### Filtro CSS para Iconos

**Patrón estándar** para iconos SVG oscuros:

```css
.icon img {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

/* Dark mode - convertir iconos oscuros a blancos */
[data-theme="dark"] .icon img {
    filter: brightness(0) saturate(100%) invert(1);
    transition: filter 0.3s ease;
}
```

### Excepciones

#### 1. Iconos en Botones Primarios (verde)
Los iconos en botones primarios deben mantenerse oscuros porque el fondo es verde claro:

```css
/* Dark mode - mantener icono oscuro en botón primario */
[data-theme="dark"] .dsu-button--primary .dsu-button__icon img {
    filter: none; /* Mantener icono oscuro para contraste en fondo verde */
}
```

#### 2. Iconos que ya son Blancos
Si el icono ya es blanco, no necesita el filtro.

### Transición para Iconos
**Siempre** agregar transición al filtro:

```css
.icon img {
    transition: filter 0.3s ease;
}
```

---

## 📝 Inputs y Bordes

### Regla Crítica: Bordes Visibles en Focus

**Los bordes de inputs DEBEN estar siempre visibles, especialmente en modo dark cuando están en focus.**

### Patrón Correcto

```css
.input {
    border: 1px solid var(--color-basics-mid-blue);
}

.input:focus {
    outline: none;
    border: 1px solid var(--color-basics-dark-blue); /* En light mode */
    color: var(--color-text-primary);
}

/* Dark mode - borde blanco para visibilidad */
[data-theme="dark"] .input:focus {
    border: 1px solid var(--color-basics-white); /* ⚠️ IMPORTANTE: Blanco en dark mode */
    color: var(--color-basics-white);
}
```

### ❌ Error Común

```css
/* ❌ MAL - Solo cambia border-color, puede desaparecer */
.input:focus {
    border-color: var(--color-basics-dark-blue);
}

/* ✅ BIEN - Define border completo */
.input:focus {
    border: 1px solid var(--color-basics-dark-blue);
}
```

### Estados de Error

```css
.input-group--error .input {
    border: 1px solid var(--color-status-strong-red);
}

[data-theme="dark"] .input-group--error .input {
    border: 1px solid var(--color-status-strong-red); /* Se mantiene igual */
}
```

### Rich Text Input

```css
.rich-text-input {
    border: 1px solid var(--color-basics-mid-blue);
}

.rich-text-input:focus-within {
    border: 1px solid var(--color-basics-dark-blue);
}

[data-theme="dark"] .rich-text-input:focus-within {
    border: 1px solid var(--color-basics-white); /* Blanco en dark mode */
}
```

---

## 🎭 Transiciones

### Principio
**Todos los elementos que cambian de color en modo dark deben tener transiciones suaves.**

### Patrón Estándar

```css
.element {
    background-color: var(--color-surface-regular);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-default);
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

### Elementos que Necesitan Transiciones

1. **Body y contenedores principales**:
```css
body {
    transition: background-color 0.3s ease, color 0.3s ease;
}

.container {
    transition: background-color 0.3s ease;
}
```

2. **Elementos de texto**:
```css
.text {
    color: var(--color-text-primary);
    transition: color 0.3s ease;
}
```

3. **Elementos con fondo**:
```css
.card {
    background-color: var(--color-surface-regular);
    transition: background-color 0.3s ease;
}
```

4. **Bordes**:
```css
.section {
    border-bottom: 1px solid var(--color-border-default);
    transition: border-color 0.3s ease;
}
```

5. **Iconos**:
```css
.icon img {
    transition: filter 0.3s ease;
}
```

---

## 🧩 Componentes Específicos

### Botones

#### Botón Secundario
```css
.dsu-button--secondary {
    border: 1px solid var(--color-basics-dark-blue);
}

[data-theme="dark"] .dsu-button--secondary {
    border-color: var(--color-basics-white); /* Borde blanco en dark mode */
}

[data-theme="dark"] .dsu-button--secondary .dsu-button__icon img {
    filter: brightness(0) saturate(100%) invert(1); /* Icono blanco */
}
```

#### Botón Terciario
```css
[data-theme="dark"] .dsu-button--tertiary:hover:not(:disabled) {
    background-color: var(--color-surface-light);
}
```

### Chips

```css
.chip {
    background-color: var(--color-surface-light);
    color: var(--color-text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
}

/* En modo dark, las variables se actualizan automáticamente */
[data-theme="dark"] .chip {
    background-color: var(--color-surface-light); /* Se actualiza automáticamente */
    color: var(--color-text-primary); /* Se actualiza automáticamente */
}
```

### Modales

```css
.modal {
    background: var(--color-basics-white);
    border: 1px solid var(--color-basics-mid-blue);
}

[data-theme="dark"] .modal {
    background: var(--color-surface-regular);
    border-color: var(--color-basics-mid-blue);
}

.modal-title {
    color: var(--color-basics-dark-blue);
}

[data-theme="dark"] .modal-title {
    color: var(--color-basics-white);
}

[data-theme="dark"] .modal-close-btn img {
    filter: brightness(0) saturate(100%) invert(1);
}
```

### Status Tags

```css
.status-tag--to-start {
    color: var(--color-text-primary);
}

[data-theme="dark"] .status-tag--to-start {
    color: var(--color-basics-white);
}

[data-theme="dark"] .status-tag--to-start .status-tag__icon img {
    filter: brightness(0) saturate(100%) invert(1);
}
```

### Sidebar

```css
[data-theme="dark"] .dsu-sidebar {
    background-color: var(--color-surface-regular);
    border-color: var(--color-border-default);
}

[data-theme="dark"] .dsu-sidebar__logo img,
[data-theme="dark"] .dsu-nav-button__icon img,
[data-theme="dark"] .dsu-teams-button__icon img,
[data-theme="dark"] .dsu-projects-button__icon img {
    filter: brightness(0) saturate(100%) invert(1);
    transition: filter 0.3s ease;
}
```

---

## ✅ Checklist para Nuevos Elementos

Al crear un nuevo elemento o layout, asegúrate de:

### 1. Colores
- [ ] Usar variables CSS en lugar de colores hardcodeados
- [ ] Verificar que las variables tengan equivalentes en modo dark
- [ ] Agregar estilos específicos solo si es necesario (la mayoría se ajustan automáticamente)

### 2. Iconos
- [ ] Agregar filtro `brightness(0) saturate(100%) invert(1)` para iconos oscuros en modo dark
- [ ] Agregar transición `transition: filter 0.3s ease` a los iconos
- [ ] Verificar excepciones (iconos en botones primarios, iconos ya blancos)

### 3. Inputs y Bordes
- [ ] Usar `border: 1px solid` en lugar de solo `border-color`
- [ ] En focus, usar `border: 1px solid var(--color-basics-white)` en modo dark
- [ ] Asegurar que el borde sea siempre visible

### 4. Transiciones
- [ ] Agregar `transition` a propiedades que cambian (background-color, color, border-color, filter)
- [ ] Duración estándar: `0.3s ease`

### 5. Inicialización
- [ ] Incluir función `loadTheme()` antes de `DOMContentLoaded`
- [ ] El atributo `data-theme` se establece en `<html>`

### 6. Testing
- [ ] Probar en modo light
- [ ] Probar en modo dark
- [ ] Verificar que las transiciones sean suaves
- [ ] Verificar que todos los iconos sean visibles
- [ ] Verificar que los bordes de inputs sean visibles en focus

---

## 📚 Archivos de Referencia

- **Tokens de Color**: `design-system/tokens/colors.css`
- **Componentes**: `design-system/components/*.css`
- **Ejemplos de implementación**:
  - `create_team.html`
  - `member_profile.html`
  - `project_empty.html`
  - `team_filled.html`

---

## 🔍 Patrones Comunes

### Elemento con Fondo y Texto

```css
.my-element {
    background-color: var(--color-surface-regular);
    color: var(--color-text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
}

/* Las variables se actualizan automáticamente en modo dark */
/* Solo agregar estilos específicos si necesitas comportamiento especial */
```

### Elemento con Borde

```css
.my-element {
    border: 1px solid var(--color-border-default);
    transition: border-color 0.3s ease;
}

[data-theme="dark"] .my-element {
    border-color: var(--color-border-default); /* Se actualiza automáticamente */
}
```

### Elemento con Icono

```css
.my-element-icon img {
    width: 20px;
    height: 20px;
    transition: filter 0.3s ease;
}

[data-theme="dark"] .my-element-icon img {
    filter: brightness(0) saturate(100%) invert(1);
}
```

### Input con Focus

```css
.my-input {
    border: 1px solid var(--color-basics-mid-blue);
}

.my-input:focus {
    outline: none;
    border: 1px solid var(--color-basics-dark-blue);
}

[data-theme="dark"] .my-input:focus {
    border: 1px solid var(--color-basics-white); /* ⚠️ CRÍTICO: Blanco en dark */
    color: var(--color-basics-white);
}
```

---

## ⚠️ Errores Comunes a Evitar

1. **❌ Colores hardcodeados**: Siempre usar variables CSS
2. **❌ Solo `border-color` en focus**: Usar `border: 1px solid` completo
3. **❌ Borde oscuro en dark mode focus**: Debe ser blanco para visibilidad
4. **❌ Falta de transiciones**: Siempre agregar transiciones suaves
5. **❌ Olvidar filtro de iconos**: Iconos oscuros deben volverse blancos
6. **❌ Faltar inicialización del tema**: Incluir `loadTheme()` en todos los archivos

---

## 📝 Notas Finales

- **Siempre** consulta esta guía al crear nuevos elementos
- **Siempre** prueba en ambos modos (light y dark)
- **Siempre** usa las variables CSS del design system
- **Siempre** agrega transiciones para una mejor experiencia de usuario

**Última actualización**: Diciembre 2024

