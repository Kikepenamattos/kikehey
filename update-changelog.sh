#!/bin/bash

# Script para actualizar el changelog después de un push
# Uso: ./update-changelog.sh

HISTORY_FILE="git_history.txt"

# Obtener el último commit del remoto (si existe)
REMOTE_HEAD=$(git ls-remote origin HEAD 2>/dev/null | cut -f1)

if [ -z "$REMOTE_HEAD" ]; then
    echo "No se puede conectar al remoto. Actualizando con commits locales..."
    # Obtener todos los commits que no están en git_history.txt
    if [ -f "$HISTORY_FILE" ]; then
        # Obtener el hash más reciente del historial
        LATEST_HASH=$(head -n 1 "$HISTORY_FILE" | cut -d'|' -f1)
        # Obtener commits desde ese hash hasta HEAD
        git log --format="%H|%an|%ae|%ai|%s" "$LATEST_HASH"..HEAD --reverse | while IFS= read -r line; do
            COMMIT_HASH=$(echo "$line" | cut -d'|' -f1)
            if ! grep -q "^${COMMIT_HASH}|" "$HISTORY_FILE" 2>/dev/null; then
                echo "$line" > "${HISTORY_FILE}.tmp"
                cat "$HISTORY_FILE" >> "${HISTORY_FILE}.tmp"
                mv "${HISTORY_FILE}.tmp" "$HISTORY_FILE"
                echo "✓ Agregado: ${COMMIT_HASH:0:7}"
            fi
        done
    fi
else
    # Obtener commits que están en el remoto pero no en el historial local
    git fetch origin 2>/dev/null
    
    # Obtener todos los commits del remoto que no están en el historial
    git log --format="%H|%an|%ae|%ai|%s" origin/main --reverse | while IFS= read -r line; do
        COMMIT_HASH=$(echo "$line" | cut -d'|' -f1)
        if [ -f "$HISTORY_FILE" ]; then
            if ! grep -q "^${COMMIT_HASH}|" "$HISTORY_FILE" 2>/dev/null; then
                echo "$line" > "${HISTORY_FILE}.tmp"
                cat "$HISTORY_FILE" >> "${HISTORY_FILE}.tmp"
                mv "${HISTORY_FILE}.tmp" "$HISTORY_FILE"
                echo "✓ Agregado al historial: ${COMMIT_HASH:0:7}"
            fi
        else
            echo "$line" > "$HISTORY_FILE"
            echo "✓ Creado historial con: ${COMMIT_HASH:0:7}"
        fi
    done
fi

# Si hay cambios, agregarlos al staging
if [ -f "$HISTORY_FILE" ] && [ -n "$(git diff --name-only HEAD "$HISTORY_FILE")" ]; then
    git add "$HISTORY_FILE"
    echo "✓ git_history.txt actualizado y agregado al staging"
    echo "  Ejecuta 'git commit' para guardar los cambios"
fi

echo "✓ Changelog actualizado"
