# 🚀 Push Rápido a GitHub

## ⚠️ Importante

GitHub **ya no acepta passwords** para autenticación HTTPS. Necesitas un **Personal Access Token**.

## 🔑 Crear Token (2 minutos)

1. **Ve a GitHub y crea un token:**
   https://github.com/settings/tokens/new

2. **Configuración del token:**
   - **Note**: "Docu Project Push"
   - **Expiration**: 90 days (o el que prefieras)
   - **Select scopes**: ✅ Marca `repo` (Full control of private repositories)

3. **Click en "Generate token"**

4. **Copia el token** (empieza con `ghp_` y es largo, algo como: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## 🚀 Hacer Push (1 comando)

Una vez tengas el token, ejecuta este comando en la terminal:

```bash
cd /Users/ubits/Desktop/Cursor/Docu
git push https://ghp_TU_TOKEN_AQUI@github.com/Kikepenamattos/kikehey.git main
```

**Ejemplo real** (reemplaza con tu token):
```bash
git push https://ghp_abc123def456ghi789@github.com/Kikepenamattos/kikehey.git main
```

## ✅ Verificar

Después del push, visita:
https://github.com/Kikepenamattos/kikehey

Deberías ver todos los archivos del proyecto.

---

**¿Necesitas ayuda creando el token?** Puedo guiarte paso a paso.

