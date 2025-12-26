# ⚡ Checklist Rápido - Prevención de Fallos

## 🚨 ANTES de Hacer CUALQUIER Cambio

### ✅ Checklist Mínimo (5 minutos)

- [ ] **¿Afecta almacenamiento de datos?** → Seguir protocolo completo
- [ ] **¿Cambia estructura de datos?** → Planificar migración
- [ ] **¿Modifica funciones async?** → Verificar await en todas las llamadas
- [ ] **¿Elimina datos?** → **DETENER** y revisar protocolo
- [ ] **¿Cambia función a async?** → Buscar TODAS las llamadas y agregar await
- [ ] **¿Sidebar o UI no muestra datos?** → Verificar async/await en funciones de carga

### 🔒 Reglas de Oro (NUNCA Violar)

1. ❌ **NUNCA** marcar migración como completada sin validar datos
2. ❌ **NUNCA** eliminar datos originales hasta verificar migración
3. ✅ **SIEMPRE** mantener fallback a método original
4. ✅ **SIEMPRE** validar datos después de cambios

### 🧪 Pruebas Mínimas (10 minutos)

```javascript
// 1. Verificar datos existentes
const data = await loadData();
console.assert(data !== null, '❌ Datos no accesibles');

// 2. Aplicar cambios
await applyChanges();

// 3. Verificar que datos siguen accesibles
const newData = await loadData();
console.assert(newData !== null, '❌ Datos perdidos después de cambios');
```

### 📋 Script de Validación Automática

```javascript
// En consola del navegador:
QualityCheck.runAll()
```

---

## 🚨 Señales de Alerta (DETENER si ves esto)

```javascript
// ❌ PELIGROSO - DETENER
markAsCompleted(); // Sin validación
localStorage.removeItem('old_key'); // Eliminar datos
const data = asyncFunction(); // Sin await
function load() { const data = asyncFunction(); } // Función NO async llamando async sin await
setTimeout(() => { asyncFunction(); }, 200); // setTimeout sin await ni .catch()
```

---

## 📞 Si Algo Sale Mal

1. **DETENER** cambios inmediatamente
2. **REVERTIR** a versión anterior
3. **VERIFICAR** datos en localStorage/IndexedDB
4. **REVISAR** PROTOCOLO_CALIDAD.md

---

**Ver protocolo completo**: `PROTOCOLO_CALIDAD.md`
**Script de validación**: `js/quality-check.js`

