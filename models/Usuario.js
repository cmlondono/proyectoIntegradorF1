class Usuario {
    constructor(id, identificacion, nombreCompleto, celular, usuario, contrasena) {
        this.id = id;
        this.identificacion = identificacion;
        this.nombreCompleto = nombreCompleto;
        this.celular = celular;
        this.usuario = usuario;
        this.contrasena = contrasena;
        this.intentosFallidos = 0;
        this.bloqueado = false;
        this.cuentas = [];        // Lista de cuentas del usuario
        this.tarjetas = [];       // Lista de tarjetas de crédito
    }

    // Autenticar usuario
    autenticar(usuario, contrasena) {
        if (this.bloqueado) {
            throw new Error(' Cuenta bloqueada. Contacte al administrador.');
        }
        
        if (this.usuario === usuario && this.contrasena === contrasena) {
            this.resetearIntentos();
            return true;
        } else {
            this.incrementarIntentos();
            return false;
        }
    }

    // Incrementar intentos fallidos
    incrementarIntentos() {
        this.intentosFallidos++;
        if (this.intentosFallidos >= 3) {
            this.bloqueado = true;
        }
    }

    // Resetear intentos fallidos
    resetearIntentos() {
        this.intentosFallidos = 0;
    }

    // Cambiar contraseña
    cambiarContrasena(contrasenaActual, nuevaContrasena, confirmarContrasena) {
        if (this.contrasena !== contrasenaActual) {
            throw new Error(' Contraseña actual incorrecta');
        }
        if (nuevaContrasena !== confirmarContrasena) {
            throw new Error('Las contraseñas nuevas no coinciden');
        }
        if (nuevaContrasena.length < 4) {
            throw new Error('La contraseña debe tener al menos 4 caracteres');
        }
        this.contrasena = nuevaContrasena;
        return true;
    }

    // Editar perfil
    editarPerfil(datos) {
        if (datos.nombreCompleto) this.nombreCompleto = datos.nombreCompleto;
        if (datos.celular) this.celular = datos.celular;
        if (datos.usuario) this.usuario = datos.usuario;
    }

    // Agregar cuenta al usuario
    agregarCuenta(cuenta) {
        this.cuentas.push(cuenta);
    }

    // Agregar tarjeta al usuario
    agregarTarjeta(tarjeta) {
        this.tarjetas.push(tarjeta);
    }

    // Obtener intentos restantes
    getIntentosRestantes() {
        return 3 - this.intentosFallidos;
    }

    // Cerrar sesión
    cerrarSesion() {
        // Limpiar datos de sesión
        console.log(`Sesión cerrada para: ${this.usuario}`);
    }
}

export default Usuario;