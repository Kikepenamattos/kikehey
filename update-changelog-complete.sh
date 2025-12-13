#!/bin/bash

# Script completo para actualizar changelog - SIEMPRE sincroniza git_history.txt primero
# Uso: ./update-changelog-complete.sh

set -e  # Detener en caso de error

HISTORY_FILE="git_history.txt"
CHANGELOG_FILE="changelog.html"

echo "🔄 Iniciando actualización completa del changelog..."

# Paso 1: Sincronizar git_history.txt con todos los commits del repositorio
echo ""
echo "📝 Paso 1: Sincronizando git_history.txt con commits del repositorio..."

# Obtener todos los commits del remoto (más confiable)
git fetch origin 2>/dev/null || echo "⚠️  No se pudo hacer fetch, usando commits locales"

# Crear archivo temporal para commits nuevos (orden: más reciente primero)
TEMP_COMMITS=$(mktemp)

# Obtener la rama actual
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo 'main')
REMOTE_BRANCH="origin/$CURRENT_BRANCH"

# Estrategia mejorada: Obtener TODOS los commits posibles (remoto + local)
echo "🔍 Obteniendo commits del repositorio..."

# Primero intentar obtener del remoto si existe
if git rev-parse --verify "$REMOTE_BRANCH" >/dev/null 2>&1; then
    echo "📡 Obteniendo commits del remoto ($REMOTE_BRANCH)..."
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
        
        # Agregar el commit al archivo temporal
        echo "$line" >> "$TEMP_COMMITS"
    done
fi

# Luego obtener commits locales que no estén en el remoto
echo "💻 Obteniendo commits locales adicionales..."
if git rev-parse --verify "HEAD" >/dev/null 2>&1; then
    # Si hay remoto, obtener solo commits que no están en el remoto
    if git rev-parse --verify "$REMOTE_BRANCH" >/dev/null 2>&1; then
        # Obtener commits en HEAD que no están en origin/main
        git log --format="%H|%an|%ae|%ai|%s" "$REMOTE_BRANCH..HEAD" 2>/dev/null | while IFS= read -r line; do
            if [ -z "$line" ]; then
                continue
            fi
            
            COMMIT_HASH=$(echo "$line" | cut -d'|' -f1)
            
            # Verificar si el commit ya está en el historial o en el temp file
            if [ -f "$HISTORY_FILE" ]; then
                if grep -q "^${COMMIT_HASH}|" "$HISTORY_FILE" 2>/dev/null; then
                    continue
                fi
            fi
            if [ -f "$TEMP_COMMITS" ]; then
                if grep -q "^${COMMIT_HASH}|" "$TEMP_COMMITS" 2>/dev/null; then
                    continue
                fi
            fi
            
            # Agregar el commit al archivo temporal
            echo "$line" >> "$TEMP_COMMITS"
        done
    else
        # Si no hay remoto, obtener todos los commits de HEAD
        git log --format="%H|%an|%ae|%ai|%s" "HEAD" 2>/dev/null | while IFS= read -r line; do
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
            
            # Agregar el commit al archivo temporal
            echo "$line" >> "$TEMP_COMMITS"
        done
    fi
fi

# Si hay commits nuevos, agregarlos al inicio del historial
COMMITS_ADDED=0
if [ -f "$TEMP_COMMITS" ] && [ -s "$TEMP_COMMITS" ]; then
    COMMITS_ADDED=$(wc -l < "$TEMP_COMMITS" | tr -d ' ')
    if [ -f "$HISTORY_FILE" ]; then
        cat "$TEMP_COMMITS" "$HISTORY_FILE" > "${HISTORY_FILE}.tmp"
        mv "${HISTORY_FILE}.tmp" "$HISTORY_FILE"
    else
        mv "$TEMP_COMMITS" "$HISTORY_FILE"
    fi
    echo "✅ Agregados $COMMITS_ADDED commits nuevos a git_history.txt"
else
    echo "ℹ️  git_history.txt ya está actualizado (no hay commits nuevos)"
    rm -f "$TEMP_COMMITS"
fi

# Limpiar archivo temporal
[ -f "$TEMP_COMMITS" ] && rm -f "$TEMP_COMMITS"

# Verificar que git_history.txt existe y tiene contenido
if [ ! -f "$HISTORY_FILE" ] || [ ! -s "$HISTORY_FILE" ]; then
    echo "❌ Error: git_history.txt no existe o está vacío"
    exit 1
fi

TOTAL_COMMITS=$(wc -l < "$HISTORY_FILE" | tr -d ' ')
echo "📊 Total de commits en git_history.txt: $TOTAL_COMMITS"

# Paso 2: Actualizar datos embebidos en changelog.html
echo ""
echo "📄 Paso 2: Actualizando datos embebidos en changelog.html..."

if [ ! -f "./update-changelog-html.js" ]; then
    echo "❌ Error: Script update-changelog-html.js no encontrado"
    exit 1
fi

if node update-changelog-html.js; then
    echo "✅ changelog.html actualizado exitosamente"
else
    echo "❌ Error al actualizar changelog.html"
    exit 1
fi

# Paso 3: Verificar que los cambios se reflejaron
echo ""
echo "🔍 Paso 3: Verificando cambios..."

if git diff --quiet "$CHANGELOG_FILE" 2>/dev/null && git diff --quiet "$HISTORY_FILE" 2>/dev/null; then
    echo "ℹ️  No hay cambios pendientes (todo está actualizado)"
else
    echo "✅ Cambios detectados:"
    if [ -n "$(git diff --name-only "$HISTORY_FILE" 2>/dev/null)" ]; then
        echo "   • git_history.txt modificado"
    fi
    if [ -n "$(git diff --name-only "$CHANGELOG_FILE" 2>/dev/null)" ]; then
        echo "   • changelog.html modificado"
    fi
fi

echo ""
echo "✅ Actualización completa del changelog finalizada"
echo "📝 Para commitear los cambios, ejecuta:"
echo "   git add git_history.txt changelog.html"
echo "   git commit -m 'Update: Changelog actualizado'"
echo "   git push"

