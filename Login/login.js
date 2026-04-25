document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const mensajeError = document.createElement('div');
    
    mensajeError.style.cssText = 'background: #ffebee; color: #c62828; padding: 10px; border-radius: 8px; margin: 10px 0; font-size: 13px; display: none;';
    
    // Insertar mensaje de error antes del botón
    const btnLogin = document.querySelector('.btn');
    if (btnLogin) {
        btnLogin.parentNode.insertBefore(mensajeError, btnLogin);
    }
    
    // Crear contador de intentos
    const contadorIntentos = document.createElement('div');
    contadorIntentos.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px; text-align: right;';
    if (btnLogin) {
        btnLogin.parentNode.insertBefore(contadorIntentos, btnLogin);
    }
    
    let intentos = 0;
    
    // Función para obtener usuarios del localStorage
    function obtenerUsuarios() {
        const usuarios = localStorage.getItem('usuarios');
        if (usuarios) {
            return JSON.parse(usuarios);
        }
        return [];
    }
    
    // Función para guardar usuarios
    function guardarUsuarios(usuarios) {
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    
    // Función para actualizar contador
    function actualizarContador() {
        const restantes = 3 - intentos;
        contadorIntentos.textContent = 'Intentos restantes: ' + restantes;
        if (restantes <= 1) {
            contadorIntentos.style.color = '#c00';
        } else {
            contadorIntentos.style.color = '#666';
        }
    }
    
    // Función para mostrar error
    function mostrarError(mensaje) {
        mensajeError.textContent = mensaje;
        mensajeError.style.display = 'block';
        setTimeout(function() {
            mensajeError.style.display = 'none';
        }, 3000);
    }
    
    
    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const usuarioInput = document.getElementById('usuario');
        const passInput = document.getElementById('contrasena');
        const recordarme = document.getElementById('recordarme');
        
        const usuario = usuarioInput ? usuarioInput.value.trim() : '';
        const contrasena = passInput ? passInput.value : '';
        
        if (!usuario || !contrasena) {
            mostrarError('Complete todos los campos');
            return;
        }
        
        const usuarios = obtenerUsuarios();
        const usuarioEncontrado = usuarios.find(u => u.usuario === usuario);
        
        if (!usuarioEncontrado) {
            intentos++;
            actualizarContador();
            mostrarError('Usuario no encontrado. Intento ' + intentos + '/3');
            
            if (intentos >= 3) {
                const btn = form.querySelector('.btn');
                btn.disabled = true;
                btn.style.opacity = '0.5';
                mostrarError('Demasiados intentos. Recarga la página para intentar de nuevo.');
            }
            return;
        }

        if (usuarioEncontrado.bloqueado) {
            mostrarError('Cuenta bloqueada. Contacte al administrador.');
            return;
        }

        if (usuarioEncontrado.contrasena === contrasena) {
         
            intentos = 0;
            actualizarContador();
            
            localStorage.setItem('sesionActual', JSON.stringify(usuarioEncontrado));
          
            if (recordarme && recordarme.checked) {
                localStorage.setItem('usuarioRecordado', usuario);
            } else {
                localStorage.removeItem('usuarioRecordado');
            }
            
            window.location.href = '../Principal/principal.html';
        } else {
            intentos++;
            actualizarContador();
            
            usuarioEncontrado.intentosFallidos = intentos;
            if (intentos >= 3) {
                usuarioEncontrado.bloqueado = true;
                mostrarError('Cuenta bloqueada por 3 intentos fallidos');
                const btn = form.querySelector('.btn');
                btn.disabled = true;
                btn.style.opacity = '0.5';
            } else {
                mostrarError('Contraseña incorrecta. Intento ' + intentos + '/3');
            }
            
            const index = usuarios.findIndex(u => u.id === usuarioEncontrado.id);
            usuarios[index] = usuarioEncontrado;
            guardarUsuarios(usuarios);
        }
    });
    
    const usuarioRecordado = localStorage.getItem('usuarioRecordado');
    if (usuarioRecordado) {
        const usuarioInput = document.getElementById('usuario');
        const recordarme = document.getElementById('recordarme');
        if (usuarioInput) {
            usuarioInput.value = usuarioRecordado;
        }
        if (recordarme) {
            recordarme.checked = true;
        }
    }
    const backLink = document.querySelector('.back');
    if (backLink) {
        backLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../LandingPage/landingPage.html';
        });
    }
    
    const registerLink = document.querySelector('.links a');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../Register/register.html';
        });
    }
});