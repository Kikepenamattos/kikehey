# 🔄 Flujo de Trabajo: Push y Actualización del Changelog

## 📋 Proceso Estándar

Cuando se solicite hacer **push al repositorio**, seguir este proceso:

### 1. Verificar cambios pendientes
```bash
git status
```

### 2. Agregar archivos modificados
```bash
git add [archivos]
```

### 3. Hacer commit con mensaje descriptivo
```bash
git commit -m "Tipo: Descripción del cambio"
```

### 4. Hacer push y actualizar changelog automáticamente
```bash
./git-push-with-changelog.sh
```

Este script:
- ✅ Hace push de los commits al repositorio
- ✅ Actualiza automáticamente `git_history.txt` con los commits nuevos
- ✅ Crea un commit para el changelog actualizado
- ✅ Hace push del changelog actualizado

## 🎯 Resultado

Después de este proceso:
- Los cambios están en GitHub
- El `changelog.html` se actualiza automáticamente
- Se crean cards `changelog-item` por cada commit nuevo
- El historial está sincronizado

## 📝 Notas Importantes

- **Siempre usar** `./git-push-with-changelog.sh` en lugar de `git push` directo
- El changelog carga desde GitHub si falla la carga local
- Las cards se generan automáticamente con el diseño actualizado
- El hook `post-commit` actualiza el historial localmente después de cada commit

## 🔍 Verificación

Después del push, verificar:
1. Que los commits estén en GitHub
2. Que `git_history.txt` tenga los commits nuevos
3. Que `changelog.html` muestre las cards correctamente (abrir en navegador y revisar consola)

---

**Última actualización**: 2025-11-22
**Mantenido por**: Sistema de automatización del changelog

