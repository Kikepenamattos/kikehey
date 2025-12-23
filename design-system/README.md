# Design System Docu

Biblioteca de componentes y tokens de diseño basada en el archivo Figma del proyecto.

## 📁 Estructura

```
design-system/
├── tokens/          # Tokens de diseño (colores, tipografías, espaciados, etc.)
├── components/      # Componentes reutilizables
├── docs/            # Documentación visual
└── README.md        # Este archivo
```

## 🎨 Tokens

Los tokens se organizan en archivos CSS modulares:

- **colors.css** - Paleta de colores completa
- **typography.css** - Tipografías y estilos de texto
- **spacing.css** - Espaciados del sistema
- **radius.css** - Radios de borde

Todos los tokens se importan desde `tokens/index.css`.

## 🧩 Componentes

Cada componente incluye:

- Archivo CSS con estilos del componente
- Archivo HTML con documentación y ejemplos visuales de todas las variaciones
- Todas las variaciones visuales según el diseño de Figma

### Componentes Disponibles

#### ✅ Implementados

1. **Button** - Sistema completo de botones con todas las variaciones
2. **Logo** - Tres variantes de tamaño
3. **Input** - Campos de entrada con label y estados de error

#### 🚧 Pendientes

4. Status Button
5. Navigation (Sidebar)
6. Cards
7. Tabs/Chips
8. Progress Bar
9. Add Members
10. Profile
11. Modal
12. Sticky Bar
13. Deliverables
14. Agreements
15. Rich Text Input
16. Icons (Set completo)

## 📖 Uso

### 1. Importar tokens

```html
<link rel="stylesheet" href="design-system/tokens/index.css">
```

### 2. Importar componente

```html
<link rel="stylesheet" href="design-system/components/button.css">
```

### 3. Usar componente

```html
<button class="dsu-button dsu-button--primary dsu-button--medium">
  Click me
</button>
```

## 🎯 Convenciones de Nomenclatura

- **Clases de componentes**: `dsu-{component-name}`
- **Modificadores**: `dsu-{component-name}--{variant}`
- **Tokens**: `--{category}-{name}`

## 📚 Documentación

Ver la documentación visual completa en: `docs/index.html`

Cada componente tiene su propia página de documentación que muestra todas sus variaciones visuales.

## 🌙 Modo Dark

El design system incluye soporte completo para modo dark. Todos los tokens de color tienen equivalentes para modo dark y se actualizan automáticamente.

**📖 Guía completa de implementación**: Ver [DARK_MODE_GUIDE.md](../DARK_MODE_GUIDE.md)

**Importante**: Al crear nuevos componentes, consulta la guía de modo dark para asegurar compatibilidad y consistencia visual.

## 🔄 Actualización desde Figma

Los componentes están basados en el archivo Figma:
`https://www.figma.com/design/zrXgzPa4Ne7FgmVhp5Nym8/Docu?node-id=1-3`

Cuando se actualicen los diseños en Figma, los componentes deben actualizarse para mantener la coherencia.

