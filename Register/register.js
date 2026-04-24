document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const mensaje = document.createElement('div');
    
    mensaje.style.cssText = 'background: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 8px; margin: 10px 0; font-size: 13px; display: none;';
    
    const linksDiv = document.querySelector('.links');
    if (linksDiv) {
        form.parentNode.insertBefore(mensaje, linksDiv);
    }
    
    function mostrarMensaje(texto, esError) {
        mensaje.textContent = texto;
        if (esError) {
            mensaje.style.background = '#ffebee';
            mensaje.style.color = '#c62828';
        } else {
            mensaje.style.background = '#e8f5e9';
            mensaje.style.color = '#2e7d32';
        }
        mensaje.style.display = 'block';
        
        setTimeout(function() {
            mensaje.style.display = 'none';
        }, 3000);
    }
    
    function obtenerUsuarios() {
        const usuarios = localStorage.getItem('usuarios');
        return usuarios ? JSON.parse(usuarios) : [];
    }
    
    function guardarUsuarios(usuarios) {
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const identificacion = document.getElementById('identificacion').value.trim();
        const nombreCompleto = document.getElementById('nombreCompleto').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const usuario = document.getElementById('usuario').value.trim();
        const contrasena = document.getElementById('contrasena').value;
        const confirmar = document.getElementById('confirmarContrasena').value;
        
        if (!identificacion || !nombreCompleto || !celular || !usuario || !contrasena) {
            mostrarMensaje('Todos los campos son obligatorios', true);
            return;
        }
        
        if (contrasena !== confirmar) {
            mostrarMensaje('Las contraseñas no coinciden', true);
            return;
        }
        
        if (contrasena.length < 4) {
            mostrarMensaje('La contraseña debe tener al menos 4 caracteres', true);
            return;
        }
        
        let usuarios = obtenerUsuarios();
        
        const usuarioExistente = usuarios.find(u => u.usuario === usuario);
        if (usuarioExistente) {
            mostrarMensaje('El nombre de usuario ya existe', true);
            return;
        }
        
        const idExistente = usuarios.find(u => u.identificacion === identificacion);
        if (idExistente) {
            mostrarMensaje('La identificación ya está registrada', true);
            return;
        }
        
        // Crear usuario sin cuentas
        const nuevoUsuario = {
            id: Date.now(),
            identificacion: identificacion,
            nombreCompleto: nombreCompleto,
            celular: celular,
            usuario: usuario,
            contrasena: contrasena,
            intentosFallidos: 0,
            bloqueado: false,
            cuentas: [],      // Lista vacía de cuentas
            tarjetas: []      // Lista vacía de tarjetas
        };
        
        usuarios.push(nuevoUsuario);
        guardarUsuarios(usuarios);
        
        mostrarMensaje('Registro exitoso. Redirigiendo al login...', false);
        
        setTimeout(function() {
            window.location.href = '../Login/login.html';
        }, 2000);
    });
    
    const loginLink = document.querySelector('.links a');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../Login/login.html';
        });
    }
    
    const backLink = document.querySelector('.back');
    if (backLink) {
        backLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../LandingPage/landingPage.html';
        });
    }
});