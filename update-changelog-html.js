#!/usr/bin/env node
// Script Node.js para actualizar los datos embebidos en changelog.html
const fs = require('fs');

try {
    // Leer git_history.txt
    const gitHistory = fs.readFileSync('git_history.txt', 'utf8');
    const lines = gitHistory.trim().split('\n').filter(l => l.trim());
    
    if (lines.length === 0) {
        console.log('⚠️  No hay commits en git_history.txt');
        process.exit(0);
    }
    
    // Parsear commits
    // git log ya devuelve commits de más reciente a más antiguo
    // Mantener ese orden (más reciente primero, más antiguo último)
    const commits = lines.map(line => {
        const parts = line.split('|');
        if (parts.length < 5) return null;
        const [hash, author, email, date, ...messageParts] = parts;
        return {
            hash: hash.substring(0, 7),
            fullHash: hash,
            author: author || 'Ubits',
            email: email || 'ubits@macbookpro.lan',
            date: date || new Date().toISOString(),
            message: messageParts.join('|')
        };
    }).filter(c => c !== null);
    // No hacer reverse - git log ya ordena de más reciente a más antiguo
    
    // Leer changelog.html
    let changelogHtml = fs.readFileSync('changelog.html', 'utf8');
    
    // Crear el array de commits en formato JavaScript
    const commitsArray = commits.map(c => {
        // Escapar comillas simples en el mensaje
        const escapedMessage = c.message.replace(/'/g, "\\'").replace(/"/g, '\\"');
        return `            {
                hash: '${c.hash}',
                fullHash: '${c.fullHash}',
                author: '${c.author}',
                email: '${c.email}',
                date: '${c.date}',
                message: '${escapedMessage}'
            }`;
    }).join(',\n');
    
    // Reemplazar el array realCommits
    const newCommitsBlock = `        // Datos reales del historial de git (fallback si no se puede cargar git_history.txt)
        const realCommits = [
${commitsArray}
        ];`;
    
    // Buscar y reemplazar - patrón más simple
    const regex = /(\s+\/\/ Datos reales del historial de git[\s\S]*?const realCommits = \[[\s\S]*?\]\s*;)/;
    if (regex.test(changelogHtml)) {
        changelogHtml = changelogHtml.replace(regex, newCommitsBlock);
        fs.writeFileSync('changelog.html', changelogHtml);
        console.log(`✅ changelog.html actualizado con ${commits.length} commits`);
    } else {
        // Intentar con patrón alternativo sin el comentario completo
        const altRegex = /(const realCommits = \[[\s\S]*?\]\s*;)/;
        if (altRegex.test(changelogHtml)) {
            const newCommitsBlockAlt = `        const realCommits = [
${commitsArray}
        ];`;
            changelogHtml = changelogHtml.replace(altRegex, newCommitsBlockAlt);
            fs.writeFileSync('changelog.html', changelogHtml);
            console.log('✅ changelog.html actualizado con patrón alternativo');
        } else {
            console.log('⚠️  No se encontró el bloque realCommits en changelog.html');
        }
    }
} catch (error) {
    console.error('❌ Error actualizando changelog.html:', error.message);
    process.exit(1);
}

