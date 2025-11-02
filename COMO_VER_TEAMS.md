# Cómo Ver los HTMLs Generados de Teams Publicados

## Ubicación de los Archivos

Los archivos HTML se encuentran en la carpeta:
```
Docu/teams/
```

## Formato de Nombres

Los archivos siguen el formato:
```
team_{ID}_{nombre-del-team}.html
```

Ejemplo:
- `team_1762052551329_proyecto-4.html`

## Cómo Verlos

### Opción 1: Abrir directamente en el navegador
1. Navega a la carpeta `teams/` del proyecto
2. Haz doble clic en cualquier archivo `.html`
3. Se abrirá en tu navegador predeterminado

### Opción 2: Desde el navegador con URL relativa
Si tienes un servidor local ejecutándose, puedes acceder mediante:
```
http://localhost:puerto/teams/team_XXX_nombre.html
```

### Opción 3: Desde el código (VS Code)
1. Clic derecho en el archivo HTML dentro de VS Code
2. Selecciona "Open with Live Server" o "Open in Browser"

## Flujo de Generación

1. **Publica un team** desde `create_team.html`
2. El navegador **descargará automáticamente** el archivo HTML
3. **Mueve el archivo** descargado a la carpeta `teams/`
4. **Abre el archivo** desde la carpeta `teams/` en tu navegador

## Estructura del HTML Generado

Cada HTML incluye:
- ✅ Sidebar con navegación (visual)
- ✅ Project name con estilos de Figma (Crimson Pro, 32px, ExtraBold)
- ✅ Team cost
- ✅ Associated projects (chips)
- ✅ Team members (cards con información completa)

## Nota Importante

⚠️ El archivo existente (`team_1762052551329_proyecto-4.html`) tiene la estructura **antigua**. Los nuevos teams publicados tendrán la **nueva estructura** con el sidebar y los estilos de Figma para el Project name.

