# Docu - Proyecto Limpio

## 📁 Estructura del Proyecto

### Archivos Principales

#### HTML
- **index.html** (559 líneas)
  - Página de login/inicio de sesión
  - Sidebar antiguo (96px) 
  - Usa: styles.css

- **signup.html** (713 líneas)
  - Página de registro
  - Estilos propios integrados

- **project_empty.html** (6,973 líneas)
  - Página principal con sidebar nuevo (260px)
  - **Componente sidebar completo integrado**
  - Incluye:
    - Logo
    - Navegación (Teams, Projects, Profile, Feedback)
    - Botón "Invite others to Docu"
    - Modo oscuro
    - Logout
  - Dark mode funcional
  - Responsive design

### Estilos (CSS)

- **styles.css** (713 líneas)
  - Estilos legacy para sidebar antiguo (96px)
  - Usado únicamente por index.html
  - Marcado como código legacy

### JavaScript

- **script.js** (19KB)
  - Lógica JavaScript del proyecto

---

## 🎨 Componente Sidebar

El sidebar está completamente integrado en **project_empty.html** con:

### Estructura HTML
```html
<div class="sidebar">
    <div class="sidebar-main">
        <!-- Logo -->
        <!-- Navigation Main -->
        <!-- Settings Section -->
    </div>
    <div class="sidebar-footer">
        <!-- Dark Mode -->
        <!-- Logout -->
    </div>
</div>
```

### Estilos CSS

Ubicación: Dentro de `<style>` en `project_empty.html`

Principales clases:
- `.sidebar`: Container principal
  - Padding: `64px 24px 24px 24px`
  - Width: `260px`

- `.sidebar-main`: Sección principal
  - Gap: `24px`

- `.navigation-main`: Botones de navegación
  - Gap: `16px`

- `.sidebar-footer`: Footer del sidebar
  - Gap: `24px`

- `.nav-button`: Botones
  - Padding: `8px 16px`
  - Border-radius: `40px`

### Características

✅ **Responsive**: Adapta a mobile
✅ **Dark Mode**: Toggle funcional
✅ **Animaciones**: Transiciones suaves
✅ **Navegación activa**: Estado visual
✅ **Dropdown Projects**: Expandible/colapsable

---

## 📝 Notas

- El sidebar nuevo (260px) está integrado en `project_empty.html`
- El sidebar antiguo (96px) está en `index.html` y usa `styles.css`
- No hay código duplicado
- Cada HTML tiene sus propios estilos integrados
- Estructura limpia y organizada

---

## 🚀 Uso

1. **Login**: `index.html`
2. **Registro**: `signup.html`
3. **Dashboard**: `project_empty.html` (con sidebar completo)

---

Última actualización: Octubre 2024

