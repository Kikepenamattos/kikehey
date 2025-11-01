# 📚 Docu - Sistema de Gestión de Proyectos

Sistema web para la gestión de proyectos y equipos, con autenticación de usuarios y persistencia de datos local.

## ✨ Características

- **🔐 Autenticación de Usuarios**: Sistema completo de login y registro
- **💾 Persistencia Local**: Almacenamiento de datos en localStorage
- **👥 Gestión de Equipos**: Creación y gestión de equipos de trabajo
- **🎨 Design System**: Sistema de diseño completo con componentes reutilizables
- **📱 Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- **🎯 Componentes Modulares**: Arquitectura basada en componentes

## 🚀 Inicio Rápido

### Opción 1: Abrir directamente
1. Abre `index.html` en tu navegador
2. Crea una cuenta o inicia sesión

### Opción 2: Servidor local
```bash
# Python
python3 -m http.server 8000

# Node.js (con http-server)
npx http-server -p 8000
```

Luego accede a `http://localhost:8000`

## 📁 Estructura del Proyecto

```
Docu/
├── index.html              # Página de login
├── sign_up.html           # Página de registro
├── styles.css             # Estilos principales
├── js/
│   ├── auth.js           # Sistema de autenticación
│   └── project-data.js    # Gestión de datos del proyecto
├── images/                # Imágenes y iconos
├── Fonts/                 # Fuentes personalizadas (Lato, Crimson Pro)
└── design-system/         # Sistema de diseño
    ├── components/        # Componentes reutilizables
    ├── tokens/            # Design tokens (colores, tipografía, espaciado)
    └── docs/              # Documentación del design system
```

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos y diseño responsive
- **JavaScript Vanilla**: Funcionalidad sin frameworks
- **localStorage**: Persistencia de datos del lado del cliente

## 📋 Funcionalidades Implementadas

### Autenticación
- ✅ Registro de usuarios con validación
- ✅ Login con email y password
- ✅ Gestión de sesiones (duración: 7 días)
- ✅ Toggle de visibilidad de contraseña
- ✅ Recordar email de login (30 días)

### Gestión de Datos
- ✅ Persistencia de usuarios en localStorage
- ✅ Gestión de proyectos por usuario
- ✅ Gestión de equipos (teams)
- ✅ Configuraciones y preferencias del usuario

### UI/UX
- ✅ Diseño responsive
- ✅ Componentes reutilizables del design system
- ✅ Upload de avatar de perfil
- ✅ Validación de formularios

## 🎨 Design System

El proyecto incluye un sistema de diseño completo con:

- **Design Tokens**: Colores, tipografía, espaciado, radios, elevación
- **Componentes**: Botones, inputs, cards, navigation, modals, chips
- **Utilidades**: Grid system, helpers

Documentación completa en: `design-system/docs/index.html`

## 🔐 Sistema de Autenticación

El sistema de autenticación (`js/auth.js`) proporciona:

- `createUser()`: Crear nuevo usuario
- `authenticate()`: Autenticar con email/password
- `createSession()`: Crear sesión de usuario
- `getCurrentSession()`: Obtener sesión activa
- `logout()`: Cerrar sesión

## 💾 Persistencia de Datos

Los datos se almacenan en `localStorage` con las siguientes claves:

- `docu_users`: Lista de usuarios registrados
- `docu_user_session`: Sesión del usuario actual
- `docu_project_data`: Datos del proyecto por usuario
- `docu_signup_form_data`: Datos temporales del formulario de registro
- `docu_login_form_data`: Email guardado del login

## 📝 Páginas Disponibles

- **index.html**: Página de login
- **sign_up.html**: Página de registro

## 🛠️ Desarrollo

### Agregar Nueva Página
1. Crear archivo HTML en la raíz del proyecto
2. Incluir los scripts necesarios:
   ```html
   <script src="js/auth.js"></script>
   <script src="js/project-data.js"></script>
   ```
3. Verificar sesión si es necesario:
   ```javascript
   const session = DocuAuth.getCurrentSession();
   ```

### Agregar Nuevo Componente
1. Crear archivo en `design-system/components/`
2. Incluir CSS correspondiente
3. Documentar en `design-system/docs/index.html`

## 📱 Responsive Design

- **Desktop**: > 768px
- **Tablet**: 768px - 481px
- **Mobile**: ≤ 480px

## 🔄 Próximas Funcionalidades

- [ ] Dashboard principal
- [ ] Gestión completa de proyectos
- [ ] Vista de equipos con detalles
- [ ] Exportación de datos
- [ ] Integración con API backend

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autor

Desarrollado para UBITS.

---

**Versión**: 1.0.0  
**Última actualización**: 2024
