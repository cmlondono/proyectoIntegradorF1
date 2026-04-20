import SistemaBancario from './models/SistemaBancario.js';

// Instancia global del sistema
window.sistemaBancario = new SistemaBancario();

// Función para verificar sesión activa
window.verificarSesion = function() {
    const usuarioActual = window.sistemaBancario.usuarioActual;
    const paginaActual = window.location.pathname.split('/').pop();
    
    // Páginas que no requieren sesión
    const paginasPublicas = ['landingPage.html', 'login.html', 'register.html'];
    
    if (!usuarioActual && !paginasPublicas.includes(paginaActual)) {
        window.location.href = '../Login/login.html';
        return false;
    }
    return true;
};

// Función para cerrar sesión
window.cerrarSesionGlobal = function() {
    window.sistemaBancario.logout();
    window.location.href = '../LandingPage/landingPage.html';
};

// Función para obtener usuario actual
window.getUsuarioActual = function() {
    return window.sistemaBancario.usuarioActual;
};

// Función para obtener cuenta actual
window.getCuentaActual = function() {
    return window.sistemaBancario.cuentaActual;
};

console.log('✅ Sistema Bancario Inicializado');