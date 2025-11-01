#!/bin/bash
# Script completo para actualizar changelog: git_history.txt y changelog.html
# Uso: ./update-changelog-full.sh

cd "$(dirname "$0")"

echo "📝 Actualizando historial de Git en git_history.txt..."
git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso > git_history.txt

echo "📄 Actualizando datos embebidos en changelog.html..."

# Ejecutar script Node.js para actualizar changelog.html
if [ -f "./update-changelog-html.js" ]; then
    node update-changelog-html.js || echo "⚠️  Error ejecutando update-changelog-html.js"
else
    echo "⚠️  Script update-changelog-html.js no encontrado"
fi

echo "✅ Historial actualizado"
echo "📊 Total de commits: $(wc -l < git_history.txt)"

