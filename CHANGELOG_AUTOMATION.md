# 📝 Automatización del Changelog

Este proyecto incluye automatización para mantener el changelog actualizado automáticamente después de cada push.

## 🚀 Uso Rápido

### Opción 1: Script Automático (Recomendado)

Usa el script wrapper en lugar de `git push`:

```bash
./git-push-with-changelog.sh
```

Este script:
1. ✅ Hace push de tus commits
2. ✅ Actualiza automáticamente `git_history.txt` con los commits nuevos
3. ✅ Crea un commit con el changelog actualizado
4. ✅ Hace push del changelog actualizado

### Opción 2: Actualización Manual

Si prefieres hacer push manualmente y luego actualizar el changelog:

```bash
git push
./update-changelog.sh
git add git_history.txt
git commit -m "Update: Actualizar changelog con últimos cambios"
git push
```

## 🔧 Hooks de Git

### Hook post-commit

El hook `post-commit` se ejecuta automáticamente después de cada commit y actualiza `git_history.txt` localmente. Esto asegura que el historial esté siempre actualizado en tu repositorio local.

**Nota:** El hook no hace commit automático del `git_history.txt` para evitar commits no deseados. Usa el script wrapper para sincronizar con el remoto.

## 📋 Formato del Historial

El archivo `git_history.txt` sigue este formato:

```
hash_completo|autor|email|fecha|mensaje
```

Ejemplo:
```
e4d4f581c708b9daf3e36511c8df22679866f554|Ubits|ubits@macbookpro.lan|2025-11-22 11:58:14 -0500|Update: Actualizar changelog con últimos cambios
```

## 🎨 Visualización

El changelog se visualiza automáticamente en `changelog.html` que:
- Carga los datos desde `git_history.txt`
- Muestra cards con el diseño actualizado
- Incluye información del commit: hash, autor, email, fecha y mensaje

## ⚙️ Configuración

Los scripts están listos para usar. Solo asegúrate de que tengan permisos de ejecución:

```bash
chmod +x git-push-with-changelog.sh
chmod +x update-changelog.sh
```

## 🔄 Flujo de Trabajo Recomendado

1. Haz tus cambios y commits normalmente
2. Usa `./git-push-with-changelog.sh` en lugar de `git push`
3. El changelog se actualiza automáticamente
4. Abre `changelog.html` para ver las cards actualizadas

## 📝 Notas

- El hook `post-commit` actualiza el historial localmente después de cada commit
- El script `git-push-with-changelog.sh` sincroniza el historial con el repositorio remoto
- Los commits duplicados se evitan automáticamente
- El historial mantiene el orden cronológico (más recientes primero)

