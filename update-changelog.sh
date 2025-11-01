#!/bin/bash
# Script para actualizar el historial de Git en git_history.txt
# Ejecutar manualmente o agregar como git hook post-commit

cd "$(dirname "$0")"

# Generar archivo con historial de git
git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso > git_history.txt

echo "✅ Historial de Git actualizado en git_history.txt"
echo "📊 Total de commits: $(wc -l < git_history.txt)"

# También actualizar changelog.html si existe update-changelog-full.sh
if [ -f "./update-changelog-full.sh" ]; then
    ./update-changelog-full.sh
fi

