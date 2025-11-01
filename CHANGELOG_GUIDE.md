# 📝 Guía de Documentación de Cambios

Este proyecto incluye un sistema de changelog para documentar todos los cambios realizados en el proyecto.

## 🎯 ¿Cómo funciona?

El sistema de changelog documenta automáticamente todos los commits de Git con:
- **Fecha y hora** exacta del cambio
- **Autor** del cambio
- **Descripción** del commit
- **Hash** del commit para referencia

## 📋 Cómo documentar cambios

### Opción 1: Usar el helper script (Recomendado)

El script `changelog-helper.sh` facilita el proceso:

```bash
./changelog-helper.sh "Descripción del cambio"
```

**Ejemplos:**
```bash
./changelog-helper.sh "Add funcionalidad de búsqueda en equipo"
./changelog-helper.sh "Fix bug en formulario de login"
./changelog-helper.sh "Update diseño del sidebar"
```

### Opción 2: Proceso manual

1. **Hacer tus cambios** en el código
2. **Commitear los cambios** con un mensaje descriptivo:
   ```bash
   git add .
   git commit -m "Descripción clara del cambio"
   ```
3. **Actualizar el historial**:
   ```bash
   ./update-changelog.sh
   ```

### Opción 3: Git Hook (Automático)

Puedes configurar un git hook para actualizar automáticamente el changelog después de cada commit:

```bash
# Crear el hook
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
cd "$(git rev-parse --show-toplevel)"
./update-changelog.sh
EOF

chmod +x .git/hooks/post-commit
```

## 📖 Ver el historial

Abre `changelog.html` en tu navegador para ver el historial completo de cambios con:
- ✅ Lista completa de commits
- 🔍 Búsqueda y filtrado
- 📅 Fechas formateadas
- ⏱️ Tiempo relativo (hace X días/horas)
- 👤 Información del autor

## 📝 Buenas prácticas para mensajes de commit

### Estructura recomendada:

```
Tipo: Descripción breve

Descripción detallada (opcional):
- Cambio 1
- Cambio 2
- Cambio 3
```

### Tipos comunes:
- **Add**: Nueva funcionalidad
- **Fix**: Corrección de bug
- **Update**: Actualización de funcionalidad existente
- **Remove**: Eliminación de código/funcionalidad
- **Refactor**: Refactorización sin cambio de funcionalidad
- **Style**: Cambios de formato/estilo
- **Docs**: Cambios en documentación

### Ejemplos:

```
Add: Sistema de autenticación con Google OAuth

Fix: Error al guardar datos del equipo en localStorage

Update: Mejorar diseño responsive del sidebar

Refactor: Separar lógica de autenticación en módulo independiente
```

## 🔄 Actualizar manualmente

Si necesitas actualizar el historial sin hacer commit:

```bash
./update-changelog.sh
```

## 📊 Archivos relacionados

- **changelog.html**: Página web con el historial visual
- **git_history.txt**: Archivo de texto con historial en formato parseable
- **update-changelog.sh**: Script para actualizar el historial
- **changelog-helper.sh**: Helper para facilitar la documentación

## 💡 Tips

1. **Sé descriptivo**: Los mensajes de commit deben explicar claramente qué cambió y por qué
2. **Actualiza regularmente**: Ejecuta `update-changelog.sh` después de commits importantes
3. **Usa el helper**: `changelog-helper.sh` hace el proceso más fácil
4. **Revisa el changelog**: Abre `changelog.html` periódicamente para ver el progreso

