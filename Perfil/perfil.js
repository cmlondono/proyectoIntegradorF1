document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const linkDatos = document.getElementById('linkDatos');
    const linkPassword = document.getElementById('linkPassword');
    const seccionDatos = document.getElementById('seccionDatos');
    const seccionPassword = document.getElementById('seccionPassword');
    
    const formPerfil = document.getElementById('formPerfil');
    const formPassword = document.getElementById('formPassword');
    
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserHandle = document.getElementById('sidebarUserHandle');
    
    // Elementos del Avatar
    const btnEditAvatar = document.getElementById('btnEditAvatar');
    const avatarModal = document.getElementById('avatarModal');
    const closeAvatarModal = document.getElementById('closeAvatarModal');
    const btnCancelarAvatar = document.getElementById('btnCancelarAvatar');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const userAvatarImg = document.getElementById('userAvatar');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    
    // Toast
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    //ESTADO INICIAL 
    let currentUser = JSON.parse(localStorage.getItem('usuarioLogueado')) || {
        nombre: "Juan Pérez García",
        usuario: "juanperez",
        identificacion: "1234567890",
        celular: "3001234567",
        correo: "juan.perez@email.com",
        avatar: null //icn por defecto
    };

    const cargarDatos = () => {
        // Llenar campos del formulario
        document.getElementById('nombreCompleto').value = currentUser.nombre;
        document.getElementById('numIdentificacion').value = currentUser.identificacion;
        document.getElementById('numCelular').value = currentUser.celular;
        document.getElementById('correoElectronico').value = currentUser.correo;
        document.getElementById('nombreUsuario').value = currentUser.usuario;
        
        // Actualizar Sidebar
        sidebarUserName.textContent = currentUser.nombre;
        sidebarUserHandle.textContent = `@${currentUser.usuario}`;
        
        // Actualizar Avatar
        actualizarAvatarUI(currentUser.avatar);
    };

    const actualizarAvatarUI = (avatarData) => {
        if (avatarData) {
            userAvatarImg.src = avatarData;
            userAvatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        } else {
            userAvatarImg.style.display = 'none';
            avatarPlaceholder.style.display = 'block';
        }
    };

    //NAVEGACIÓN ENTRE SECCIONES
    const mostrarSeccion = (seccion) => {
        if (seccion === 'datos') {
            seccionDatos.classList.remove('hidden');
            seccionPassword.classList.add('hidden');
            linkDatos.classList.add('active');
            linkPassword.classList.remove('active');
        } else {
            seccionDatos.classList.add('hidden');
            seccionPassword.classList.remove('hidden');
            linkDatos.classList.remove('active');
            linkPassword.classList.add('active');
        }
    };

    linkDatos.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarSeccion('datos');
    });

    linkPassword.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarSeccion('password');
    });

    //GESTIÓN DEL AVATAR
    btnEditAvatar.addEventListener('click', () => {
        avatarModal.classList.add('active');
    });

    const cerrarModalAvatar = () => {
        avatarModal.classList.remove('active');
    };

    closeAvatarModal.addEventListener('click', cerrarModalAvatar);
    btnCancelarAvatar.addEventListener('click', cerrarModalAvatar);

    window.addEventListener('click', (e) => {
        if (e.target === avatarModal) cerrarModalAvatar();
    });

    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Quitamos selección previa
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            const avatarPath = option.getAttribute('data-avatar');
            
            if (avatarPath === 'default') {
                currentUser.avatar = null;
            } else {
                currentUser.avatar = avatarPath;
            }
            
            actualizarAvatarUI(currentUser.avatar);
            showToast("Avatar actualizado correctamente", "check_circle");
            cerrarModalAvatar();
            guardarEnStorage();
        });
    });

    // FORMULARIOS 
    formPerfil.addEventListener('submit', (e) => {
        e.preventDefault();
        
        currentUser.nombre = document.getElementById('nombreCompleto').value;
        currentUser.celular = document.getElementById('numCelular').value;
        currentUser.correo = document.getElementById('correoElectronico').value;
        
        sidebarUserName.textContent = currentUser.nombre;
        
        guardarEnStorage();
        showToast("Información actualizada con éxito");
    });

    formPassword.addEventListener('submit', (e) => {
        e.preventDefault();
        const actual = document.getElementById('passwordActual').value;
        const nueva = document.getElementById('passwordNueva').value;
        const confirmar = document.getElementById('passwordConfirmar').value;
        
        if (!actual || !nueva || !confirmar) {
            showToast("Por favor completa todos los campos", "error", "toast-error");
            return;
        }
        
        if (nueva !== confirmar) {
            showToast("Las contraseñas no coinciden", "error", "toast-error");
            return;
        }
        
        showToast("Contraseña actualizada correctamente");
        formPassword.reset();
    });

    // UTILIDADES 
    const guardarEnStorage = () => {
        localStorage.setItem('usuarioLogueado', JSON.stringify(currentUser));
    };

    const showToast = (message, icon = "check_circle", typeClass = "toast-success") => {
        toastMessage.textContent = message;
        toastIcon.textContent = icon;
        
        // Limpiar clases previas
        toast.className = "toast-notification";
        toast.classList.add(typeClass, "toast-visible");
        
        setTimeout(() => {
            toast.classList.remove("toast-visible");
        }, 3000);
    };

    cargarDatos();
});
