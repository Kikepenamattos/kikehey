#!/bin/bash

# Script wrapper para hacer push y actualizar el changelog automáticamente
# Uso: ./git-push-with-changelog.sh [argumentos de git push]

echo "🚀 Haciendo push al repositorio..."
git push "$@"

PUSH_EXIT_CODE=$?

if [ $PUSH_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "📝 Actualizando changelog..."
    
    # Obtener los commits que se acaban de hacer push
    REMOTE_BRANCH="origin/$(git branch --show-current)"
    LOCAL_BRANCH="HEAD"
    
    # Obtener commits que están en el remoto pero no en git_history.txt
    HISTORY_FILE="git_history.txt"
    UPDATED=false
    
    # Obtener todos los commits del remoto
    git fetch origin 2>/dev/null
    
    # Obtener commits en orden normal (más reciente primero) y almacenarlos temporalmente
    TEMP_COMMITS=$(mktemp)
    git log --format="%H|%an|%ae|%ai|%s" "$REMOTE_BRANCH" 2>/dev/null | while IFS= read -r line; do
        if [ -z "$line" ]; then
            continue
        fi
        
        COMMIT_HASH=$(echo "$line" | cut -d'|' -f1)
        
        # Verificar si el commit ya está en el historial
        if [ -f "$HISTORY_FILE" ]; then
            if grep -q "^${COMMIT_HASH}|" "$HISTORY_FILE" 2>/dev/null; then
                continue
            fi
        fi
        
        # Agregar el commit al archivo temporal (orden: más reciente primero)
        echo "$line" >> "$TEMP_COMMITS"
        COMMIT_MSG=$(echo "$line" | cut -d'|' -f5)
        echo "  ✓ Agregado: ${COMMIT_HASH:0:7} - ${COMMIT_MSG}"
        UPDATED=true
    done
    
    # Si hay commits nuevos, agregarlos al inicio del historial manteniendo el orden (más reciente primero)
    if [ -f "$TEMP_COMMITS" ] && [ -s "$TEMP_COMMITS" ]; then
        if [ -f "$HISTORY_FILE" ]; then
            cat "$TEMP_COMMITS" "$HISTORY_FILE" > "${HISTORY_FILE}.tmp"
            mv "${HISTORY_FILE}.tmp" "$HISTORY_FILE"
        else
            mv "$TEMP_COMMITS" "$HISTORY_FILE"
        fi
    fi
    
    # Limpiar archivo temporal si existe
    [ -f "$TEMP_COMMITS" ] && rm -f "$TEMP_COMMITS"
    
    # Si se actualizó el historial, actualizar también los datos embebidos en changelog.html
    if [ -f "$HISTORY_FILE" ] && [ -n "$(git diff --name-only HEAD "$HISTORY_FILE" 2>/dev/null)" ]; then
        echo ""
        echo "📄 Actualizando datos embebidos en changelog.html..."
        if [ -f "./update-changelog-html.js" ]; then
            node update-changelog-html.js || echo "⚠️  Error ejecutando update-changelog-html.js"
        else
            echo "⚠️  Script update-changelog-html.js no encontrado"
        fi
        
        echo ""
        echo "💾 Guardando cambios en git_history.txt y changelog.html..."
        git add "$HISTORY_FILE"
        git add changelog.html
        git commit -m "Update: Actualizar changelog con últimos cambios" --no-verify
        echo "🚀 Haciendo push del changelog actualizado..."
        git push "$@" --no-verify
        echo ""
        echo "✅ Changelog actualizado y sincronizado con el repositorio"
        echo "📊 Los commits ahora se reflejarán en changelog.html (tanto desde GitHub como desde datos embebidos)"
    else
        echo ""
        echo "ℹ️  El changelog ya está actualizado"
    fi
else
    echo ""
    echo "❌ Error al hacer push. El changelog no se actualizará."
    exit $PUSH_EXIT_CODE
fi

