document.addEventListener('DOMContentLoaded', () => {
    const linkDatos = document.getElementById('linkDatos');
    const linkPassword = document.getElementById('linkPassword');
    const seccionDatos = document.getElementById('seccionDatos');
    const seccionPassword = document.getElementById('seccionPassword');
    
    const formPerfil = document.getElementById('formPerfil');
    const formPassword = document.getElementById('formPassword');
    
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserHandle = document.getElementById('sidebarUserHandle');
    
    const btnEditAvatar = document.getElementById('btnEditAvatar');
    const avatarModal = document.getElementById('avatarModal');
    const closeAvatarModal = document.getElementById('closeAvatarModal');
    const btnCancelarAvatar = document.getElementById('btnCancelarAvatar');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const userAvatarImg = document.getElementById('userAvatar');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    let currentUser = JSON.parse(localStorage.getItem('sesionActual')) || {
        id: null,
        identificacion: "",
        nombreCompleto: "",
        celular: "",
        usuario: "",
        contrasena: "",
        intentosFallidos: 0,
        bloqueado: false,
        avatar: null,
        cuentas: [],
        tarjetas: []
    };

    const cargarDatos = () => {
        document.getElementById('nombreCompleto').value = currentUser.nombreCompleto;
        document.getElementById('numIdentificacion').value = currentUser.identificacion;
        document.getElementById('numCelular').value = currentUser.celular;
        document.getElementById('nombreUsuario').value = currentUser.usuario;
        
        sidebarUserName.textContent = currentUser.nombreCompleto;
        sidebarUserHandle.textContent = `@${currentUser.usuario}`;
        
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

    formPerfil.addEventListener('submit', (e) => {
        e.preventDefault();
        
        currentUser.nombre = document.getElementById('nombreCompleto').value;
        currentUser.celular = document.getElementById('numCelular').value;
        currentUser.correo = document.getElementById('correoElectronico').value;
        currentUser.contraseña = document.getElementById('passwordActual').value;
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
        
        if (actual !== currentUser.contrasena) {
            showToast("La contraseña actual es incorrecta", "error", "toast-error");
            return;
        }
        
        if (nueva !== confirmar) {
            showToast("Las contraseñas no coinciden", "error", "toast-error");
            return;
        }
        
        if (nueva.length < 4) {
            showToast("La contraseña debe tener al menos 4 caracteres", "error", "toast-error");
            return;
        }
        
        currentUser.contrasena = nueva;
        guardarEnStorage();
        
        showToast("Contraseña actualizada correctamente", "check_circle");
        formPassword.reset();
    });

    const guardarEnStorage = () => {
        localStorage.setItem('sesionActual', JSON.stringify(currentUser));
        
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const userIndex = usuarios.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            usuarios[userIndex] = currentUser;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }
    };

    const showToast = (message, icon = "check_circle", typeClass = "toast-success") => {
        toastMessage.textContent = message;
        toastIcon.textContent = icon;
        
        toast.className = "toast-notification";
        toast.classList.add(typeClass, "toast-visible");
        
        setTimeout(() => {
            toast.classList.remove("toast-visible");
        }, 3000);
    };

    cargarDatos();
});
