/**
 * Sistema de Autenticación y Persistencia de Datos - Docu
 * Gestión de usuarios, sesiones y datos del proyecto
 */

const DocuAuth = {
    // Claves de almacenamiento
    STORAGE_KEYS: {
        USERS: 'docu_users',
        SESSION: 'docu_user_session',
        SIGNUP_FORM: 'docu_signup_form_data',
        LOGIN_FORM: 'docu_login_form_data',
        PROJECT_DATA: 'docu_project_data'
    },

    // Configuración
    CONFIG: {
        SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 días
        FORM_DATA_DURATION: 24 * 60 * 60 * 1000, // 24 horas
        LOGIN_EMAIL_DURATION: 30 * 24 * 60 * 60 * 1000 // 30 días
    },

    /**
     * Guardar datos en localStorage
     */
    saveToStorage(key, data) {
        try {
            const jsonString = JSON.stringify(data);
            const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
            console.log(`💾 Tamaño de datos a guardar (${key}): ${sizeInMB.toFixed(2)} MB`);
            
            if (sizeInMB > 5) {
                console.warn(`⚠️ Advertencia: Los datos son mayores a 5MB (${sizeInMB.toFixed(2)} MB). Puede causar problemas en localStorage.`);
            }
            
            localStorage.setItem(key, jsonString);
            
            // Verificar que se guardó correctamente
            const saved = localStorage.getItem(key);
            if (!saved) {
                console.error(`❌ Error: Los datos no se guardaron correctamente en ${key}`);
                return false;
            }
            
            return true;
        } catch (e) {
            console.error(`❌ Error saving to ${key}:`, e);
            if (e.name === 'QuotaExceededError') {
                console.error('❌ QuotaExceededError: El almacenamiento local está lleno. Considera eliminar datos o reducir el tamaño de las imágenes.');
            }
            return false;
        }
    },

    /**
     * Cargar datos de localStorage
     */
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Error loading from ${key}:`, e);
            return null;
        }
    },

    /**
     * Eliminar datos de localStorage
     */
    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Error removing ${key}:`, e);
            return false;
        }
    },

    /**
     * Guardar datos del formulario de signup
     */
    saveSignupFormData(formData) {
        const data = {
            ...formData,
            timestamp: Date.now()
        };
        return this.saveToStorage(this.STORAGE_KEYS.SIGNUP_FORM, data);
    },

    /**
     * Cargar datos del formulario de signup
     */
    loadSignupFormData() {
        const data = this.loadFromStorage(this.STORAGE_KEYS.SIGNUP_FORM);
        if (data && Date.now() - data.timestamp < this.CONFIG.FORM_DATA_DURATION) {
            return data;
        }
        if (data) {
            this.removeFromStorage(this.STORAGE_KEYS.SIGNUP_FORM);
        }
        return null;
    },

    /**
     * Guardar email del login
     */
    saveLoginEmail(email) {
        const data = {
            email: email,
            timestamp: Date.now()
        };
        return this.saveToStorage(this.STORAGE_KEYS.LOGIN_FORM, data);
    },

    /**
     * Cargar email guardado del login
     */
    loadLoginEmail() {
        const data = this.loadFromStorage(this.STORAGE_KEYS.LOGIN_FORM);
        if (data && Date.now() - data.timestamp < this.CONFIG.LOGIN_EMAIL_DURATION) {
            return data.email;
        }
        if (data) {
            this.removeFromStorage(this.STORAGE_KEYS.LOGIN_FORM);
        }
        return null;
    },

    /**
     * Obtener todos los usuarios
     */
    getAllUsers() {
        return this.loadFromStorage(this.STORAGE_KEYS.USERS) || [];
    },

    /**
     * Guardar usuarios
     */
    saveUsers(users) {
        return this.saveToStorage(this.STORAGE_KEYS.USERS, users);
    },

    /**
     * Buscar usuario por email
     */
    findUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(u => u.email === email) || null;
    },

    /**
     * Crear nuevo usuario
     */
    createUser(userData) {
        const users = this.getAllUsers();
        const existingUserIndex = users.findIndex(u => u.email === userData.email);
        
        const user = {
            ...userData,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        if (existingUserIndex >= 0) {
            // Actualizar usuario existente
            users[existingUserIndex] = { ...users[existingUserIndex], ...user, updatedAt: Date.now() };
        } else {
            // Agregar nuevo usuario
            users.push(user);
        }

        this.saveUsers(users);
        return user;
    },

    /**
     * Actualizar datos de usuario
     */
    updateUser(email, updates) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex >= 0) {
            users[userIndex] = { ...users[userIndex], ...updates, updatedAt: Date.now() };
            this.saveUsers(users);
            return users[userIndex];
        }
        return null;
    },

    /**
     * Crear sesión de usuario
     */
    createSession(userData) {
        const session = {
            userId: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            jobPosition: userData.jobPosition,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            isActive: true
        };
        
        this.saveToStorage(this.STORAGE_KEYS.SESSION, session);
        return session;
    },

    /**
     * Obtener sesión actual
     */
    getCurrentSession() {
        const sessionData = this.loadFromStorage(this.STORAGE_KEYS.SESSION);
        
        if (sessionData) {
            // Verificar si la sesión sigue siendo válida
            if (Date.now() - sessionData.createdAt < this.CONFIG.SESSION_DURATION && sessionData.isActive) {
                // Actualizar última actividad
                sessionData.lastActivity = Date.now();
                this.saveToStorage(this.STORAGE_KEYS.SESSION, sessionData);
                return sessionData;
            } else {
                // Sesión expirada
                this.removeFromStorage(this.STORAGE_KEYS.SESSION);
                return null;
            }
        }
        
        return null;
    },

    /**
     * Cerrar sesión
     */
    logout() {
        this.removeFromStorage(this.STORAGE_KEYS.SESSION);
        return true;
    },

    /**
     * Autenticar usuario (login)
     */
    authenticate(email, password) {
        const user = this.findUserByEmail(email);
        
        if (user && user.password === password) {
            return this.createSession(user);
        }
        
        return null;
    },

    /**
     * Verificar si hay sesión activa
     */
    isAuthenticated() {
        return this.getCurrentSession() !== null;
    },

    /**
     * Guardar datos del proyecto asociados al usuario
     */
    saveProjectData(userId, projectData) {
        try {
            if (!userId) {
                console.error('userId no proporcionado para saveProjectData');
                return false;
            }
            
            if (!projectData) {
                console.error('projectData no proporcionado');
                return false;
            }
            
            const allProjects = this.loadFromStorage(this.STORAGE_KEYS.PROJECT_DATA) || {};
            allProjects[userId] = {
                ...projectData,
                updatedAt: Date.now()
            };
            
            const result = this.saveToStorage(this.STORAGE_KEYS.PROJECT_DATA, allProjects);
            if (!result) {
                console.error('Error al guardar en localStorage');
                return false;
            }
            
            console.log('ProjectData guardado exitosamente para usuario:', userId);
            return true;
        } catch (error) {
            console.error('Excepción en saveProjectData:', error);
            return false;
        }
    },

    /**
     * Cargar datos del proyecto del usuario
     */
    loadProjectData(userId) {
        const allProjects = this.loadFromStorage(this.STORAGE_KEYS.PROJECT_DATA) || {};
        return allProjects[userId] || null;
    },

    /**
     * Limpiar datos temporales (formularios)
     */
    clearTemporaryData() {
        this.removeFromStorage(this.STORAGE_KEYS.SIGNUP_FORM);
        this.removeFromStorage(this.STORAGE_KEYS.LOGIN_FORM);
    },

    /**
     * Obtener información completa del usuario actual
     */
    getCurrentUser() {
        const session = this.getCurrentSession();
        if (session) {
            const user = this.findUserByEmail(session.email);
            return { ...session, ...user };
        }
        return null;
    },

    /**
     * Inicializar sistema - verificar y limpiar datos expirados
     */
    init() {
        // Verificar sesión
        this.getCurrentSession();
        
        // Limpiar datos temporales expirados
        const signupData = this.loadSignupFormData();
        if (!signupData) {
            this.removeFromStorage(this.STORAGE_KEYS.SIGNUP_FORM);
        }
        
        console.log('DocuAuth inicializado');
        return true;
    }
};

// Inicializar al cargar
if (typeof window !== 'undefined') {
    window.DocuAuth = DocuAuth;
    DocuAuth.init();
}

// Exportar para módulos (si se usa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocuAuth;
}

