/**
 * Sistema de Persistencia de Datos del Proyecto - Docu
 * Funciones para guardar, cargar y gestionar datos del proyecto del usuario
 */

const DocuProjectData = {
    /**
     * Obtener datos del proyecto del usuario actual
     */
    getProjectData() {
        if (typeof window.DocuAuth === 'undefined') {
            console.error('[DocuProjectData] DocuAuth no está disponible');
            return null;
        }

        const session = DocuAuth.getCurrentSession();
        if (!session) {
            console.warn('[DocuProjectData] No hay sesión activa');
            return null;
        }

        const data = DocuAuth.loadProjectData(session.email);
        
        // IMPORTANTE: Si no hay datos, retornar estructura vacía con teams array
        if (!data) {
            return {
                projects: [],
                teams: [],
                settings: {},
                preferences: {}
            };
        }
        
        // Asegurar que teams sea un array
        if (!data.teams || !Array.isArray(data.teams)) {
            data.teams = [];
        }
        
        // Asegurar que los otros campos existan
        if (!data.projects) data.projects = [];
        if (!data.settings) data.settings = {};
        if (!data.preferences) data.preferences = {};
        
        return data;
    },

    /**
     * Guardar datos del proyecto del usuario actual
     */
    saveProjectData(projectData) {
        if (typeof window.DocuAuth === 'undefined') {
            console.error('DocuAuth no está disponible');
            return false;
        }

        const session = DocuAuth.getCurrentSession();
        if (!session) {
            console.warn('No hay sesión activa');
            // Intentar usar una sesión de respaldo o crear una temporal
            // Por ahora retornamos false pero podríamos mejorar esto
            return false;
        }

        try {
            const result = DocuAuth.saveProjectData(session.email, projectData);
            if (!result) {
                console.error('Error al guardar en DocuAuth.saveProjectData');
            }
            return result;
        } catch (error) {
            console.error('Excepción al guardar projectData:', error);
            return false;
        }
    },

    /**
     * Agregar un proyecto
     */
    addProject(project) {
        const data = this.getProjectData() || { projects: [], settings: {}, preferences: {} };
        
        if (!data.projects) {
            data.projects = [];
        }

        const newProject = {
            id: Date.now().toString(),
            ...project,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        data.projects.push(newProject);
        this.saveProjectData(data);
        
        return newProject;
    },

    /**
     * Obtener todos los proyectos
     */
    getProjects() {
        const data = this.getProjectData();
        return data ? (data.projects || []) : [];
    },

    /**
     * Obtener un proyecto por ID
     */
    getProjectById(projectId) {
        const projects = this.getProjects();
        return projects.find(p => p.id === projectId) || null;
    },

    /**
     * Actualizar un proyecto
     */
    updateProject(projectId, updates) {
        const data = this.getProjectData();
        if (!data || !data.projects) return null;

        const projectIndex = data.projects.findIndex(p => p.id === projectId);
        if (projectIndex >= 0) {
            data.projects[projectIndex] = {
                ...data.projects[projectIndex],
                ...updates,
                updatedAt: Date.now()
            };
            this.saveProjectData(data);
            return data.projects[projectIndex];
        }

        return null;
    },

    /**
     * Eliminar un proyecto
     */
    deleteProject(projectId) {
        const data = this.getProjectData();
        if (!data || !data.projects) return false;

        const projectIndex = data.projects.findIndex(p => p.id === projectId);
        if (projectIndex >= 0) {
            data.projects.splice(projectIndex, 1);
            this.saveProjectData(data);
            return true;
        }

        return false;
    },

    /**
     * Obtener configuración del usuario
     */
    getSettings() {
        const data = this.getProjectData();
        return data ? (data.settings || {}) : {};
    },

    /**
     * Guardar configuración
     */
    saveSettings(settings) {
        const data = this.getProjectData() || { projects: [], settings: {}, preferences: {} };
        data.settings = { ...data.settings, ...settings };
        this.saveProjectData(data);
        return data.settings;
    },

    /**
     * Obtener preferencias del usuario
     */
    getPreferences() {
        const data = this.getProjectData();
        return data ? (data.preferences || {}) : {};
    },

    /**
     * Guardar preferencias
     */
    savePreferences(preferences) {
        const data = this.getProjectData() || { projects: [], settings: {}, preferences: {} };
        data.preferences = { ...data.preferences, ...preferences };
        this.saveProjectData(data);
        return data.preferences;
    },

    /**
     * Exportar todos los datos del proyecto (para backup)
     */
    exportData() {
        const data = this.getProjectData();
        const session = DocuAuth.getCurrentSession();
        
        return {
            user: session,
            projectData: data,
            exportedAt: Date.now()
        };
    },

    /**
     * Importar datos del proyecto (restaurar backup)
     */
    importData(importedData) {
        if (!importedData || !importedData.projectData) {
            console.error('Datos de importación inválidos');
            return false;
        }

        const session = DocuAuth.getCurrentSession();
        if (!session) {
            console.warn('No hay sesión activa');
            return false;
        }

        return DocuAuth.saveProjectData(session.email, importedData.projectData);
    },

    /**
     * Limpiar todos los datos del proyecto (reset)
     */
    clearAllData() {
        const session = DocuAuth.getCurrentSession();
        if (!session) return false;

        const emptyData = {
            projects: [],
            settings: {},
            preferences: {}
        };

        return DocuAuth.saveProjectData(session.email, emptyData);
    },

    /**
     * Inicializar datos del proyecto si no existen
     */
    initializeIfNeeded() {
        const data = this.getProjectData();
        if (!data) {
            const emptyData = {
                projects: [],
                settings: {},
                preferences: {}
            };
            this.saveProjectData(emptyData);
            return true;
        }
        return false;
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DocuProjectData = DocuProjectData;
}

// Inicializar datos si es necesario
if (typeof window !== 'undefined' && typeof window.DocuAuth !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        if (DocuAuth.isAuthenticated()) {
            DocuProjectData.initializeIfNeeded();
        }
    });
}

// Exportar para módulos (si se usa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocuProjectData;
}

