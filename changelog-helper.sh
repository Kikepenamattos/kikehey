#!/bin/bash
# Helper script para documentar cambios en el changelog
# Uso: ./changelog-helper.sh "Descripción del cambio"

cd "$(dirname "$0")"

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar una descripción del cambio"
    echo ""
    echo "Uso: ./changelog-helper.sh \"Descripción del cambio\""
    echo ""
    echo "Ejemplo:"
    echo "  ./changelog-helper.sh \"Add nueva funcionalidad de búsqueda\""
    exit 1
fi

CHANGE_DESCRIPTION="$1"

# Actualizar el historial de git
echo "📝 Actualizando historial de Git..."
./update-changelog.sh

# Agregar cambios al git si hay cambios sin commitear
if [ -n "$(git status --porcelain)" ]; then
    echo "📦 Agregando cambios al staging area..."
    git add -A
    
    echo "💾 Creando commit con descripción: $CHANGE_DESCRIPTION"
    git commit -m "$CHANGE_DESCRIPTION"
    
    echo "✅ Cambio documentado en Git"
else
    echo "ℹ️  No hay cambios sin commitear"
fi

# Actualizar el historial nuevamente para incluir el nuevo commit
echo "🔄 Actualizando historial final..."
./update-changelog.sh

# Actualizar changelog.html con los datos embebidos
echo "📄 Actualizando datos embebidos en changelog.html..."
if [ -f "./update-changelog-html.js" ]; then
    node update-changelog-html.js || echo "⚠️  Error ejecutando update-changelog-html.js"
else
    echo "⚠️  Script update-changelog-html.js no encontrado"
fi

echo ""
echo "✅ ¡Cambio documentado exitosamente!"
echo "📊 Ver historial en: changelog.html"
echo "📈 Total de commits: $(wc -l < git_history.txt)"

