# 🔍 Diagnóstico: Teams se eliminan al recargar la página

## 📊 PROBLEMA REPORTADO
Cuando se tiene un team seleccionado en el sidebar y se recarga la página, el team se elimina.

## 🔎 DIAGNÓSTICO DETALLADO

### Posibles Causas Identificadas:

1. **❌ AutoSave interfiriendo con teams publicados**
   - `autoSave()` se ejecuta cada 30 segundos
   - También se ejecuta en `beforeunload`
   - Puede estar guardando un draft que sobrescribe datos
   - Si `currentProjectId` está configurado y el team es publicado, podría estar creando conflictos

2. **❌ getFormData() con datos incompletos**
   - Cuando se carga un team publicado, `getFormData()` podría devolver datos vacíos
   - Si `autoSave()` se ejecuta con datos vacíos o incompletos, podría estar sobrescribiendo el team

3. **❌ saveProjectToStorage() actualizando team incorrecto**
   - Si `currentProjectId` está configurado para un team publicado pero `autoSave()` guarda un draft, podría estar mezclando estados

4. **❌ Inicialización limpiando datos**
   - `initializeIfNeeded()` podría estar inicializando arrays vacíos si detecta algún problema

### Hipótesis Principal:
El problema más probable es que `autoSave()` se está ejecutando cuando hay un team publicado cargado, y al guardar con `status: 'draft'`, está sobrescribiendo o confundiendo los datos del team publicado.

