import SistemaBancario from './models/SistemaBancario.js';

window.sistemaBancario = new SistemaBancario();

window.verificarSesion = function() {
    const usuarioActual = window.sistemaBancario.usuarioActual;
    const paginaActual = window.location.pathname.split('/').pop();

    const paginasPublicas = ['landingPage.html', 'login.html', 'register.html'];
    
    if (!usuarioActual && !paginasPublicas.includes(paginaActual)) {
        window.location.href = '../Login/login.html';
        return false;
    }
    return true;
};

window.cerrarSesionGlobal = function() {
    window.sistemaBancario.logout();
    window.location.href = '../LandingPage/landingPage.html';
};

window.getUsuarioActual = function() {
    return window.sistemaBancario.usuarioActual;
};
window.getCuentaActual = function() {
    return window.sistemaBancario.cuentaActual;
};

console.log('Sistema Bancario Inicializado');