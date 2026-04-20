document.addEventListener('DOMContentLoaded', function() {
    const sesionActual = localStorage.getItem('sesionActual');
    
    if (!sesionActual) {
        window.location.href = '../Login/login.html';
        return;
    }
    
    let usuario = JSON.parse(sesionActual);
    let productoAEliminar = null;
    let tipoProductoAEliminar = null;
    
    function obtenerUsuarios() {
        const usuarios = localStorage.getItem('usuarios');
        return usuarios ? JSON.parse(usuarios) : [];
    }
    
    function guardarUsuarios(usuarios) {
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    
    function actualizarSesion(usuarioActualizado) {
        localStorage.setItem('sesionActual', JSON.stringify(usuarioActualizado));
        usuario = usuarioActualizado;
    }
    
    function generarNumeroProducto(tipo) {
        const numero = Math.floor(Math.random() * 10000);
        if (tipo === 'ahorros') return 'AHO-' + numero;
        if (tipo === 'corriente') return 'COR-' + numero;
        return 'TC-' + numero;
    }
    
    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }
    
    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const diaSemana = dias[fecha.getDay()];
        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${diaSemana} ${dia} ${mes}, ${hora}:${minutos}`;
    }
    
    // Mostrar popup de crear
    function mostrarPopupCrear() {
        document.getElementById('crearPopup').style.display = 'flex';
        document.getElementById('tipoProducto').value = 'ahorros';
        document.getElementById('saldoInicial').value = '0';
    }
    
    function ocultarPopupCrear() {
        document.getElementById('crearPopup').style.display = 'none';
    }
    
    function mostrarPopupEliminar(producto, tipo, nombre) {
        productoAEliminar = producto;
        tipoProductoAEliminar = tipo;
        document.getElementById('eliminarMensaje').innerHTML = '¿Estás seguro de eliminar ' + nombre + ' ' + producto.numeroCuenta + '?';
        document.getElementById('eliminarPopup').style.display = 'flex';
    }
    
    function ocultarPopupEliminar() {
        document.getElementById('eliminarPopup').style.display = 'none';
        productoAEliminar = null;
        tipoProductoAEliminar = null;
    }
    
    function crearProducto() {
        const tipo = document.getElementById('tipoProducto').value;
        const saldoInicial = parseFloat(document.getElementById('saldoInicial').value) || 0;
        
        if (saldoInicial < 0) {
            alert('El saldo inicial no puede ser negativo');
            return;
        }
        
        if (tipo === 'ahorros') {
            const nuevaCuenta = {
                tipo: 'ahorros',
                numeroCuenta: generarNumeroProducto('ahorros'),
                saldo: saldoInicial,
                movimientos: [],
                tasaInteres: 1.5
            };
            usuario.cuentas.push(nuevaCuenta);
            alert('Cuenta de ahorros creada: ' + nuevaCuenta.numeroCuenta + ' con saldo $' + saldoInicial.toLocaleString());
            
        } else if (tipo === 'corriente') {
            const nuevaCuenta = {
                tipo: 'corriente',
                numeroCuenta: generarNumeroProducto('corriente'),
                saldo: saldoInicial,
                movimientos: [],
                sobregiro: 20
            };
            usuario.cuentas.push(nuevaCuenta);
            alert('Cuenta corriente creada: ' + nuevaCuenta.numeroCuenta + ' con saldo $' + saldoInicial.toLocaleString());
            
        } else if (tipo === 'tarjeta') {
            const nuevaTarjeta = {
                numeroTarjeta: generarNumeroProducto('tarjeta'),
                cupo: saldoInicial > 0 ? saldoInicial : 1000000,
                deuda: 0,
                movimientos: []
            };
            usuario.tarjetas.push(nuevaTarjeta);
            alert('Tarjeta de crédito creada: ' + nuevaTarjeta.numeroTarjeta + ' con cupo $' + nuevaTarjeta.cupo.toLocaleString());
        }
        
        const usuarios = obtenerUsuarios();
        const index = usuarios.findIndex(u => u.id === usuario.id);
        usuarios[index] = usuario;
        guardarUsuarios(usuarios);
        actualizarSesion(usuario);
        
        ocultarPopupCrear();
        cargarCuentas();
        cargarActividadReciente();
    }
    
    function eliminarProducto() {
        if (!productoAEliminar) return;
        
        if (tipoProductoAEliminar === 'cuenta') {
            const nuevasCuentas = usuario.cuentas.filter(function(cuenta) {
                return cuenta.numeroCuenta !== productoAEliminar.numeroCuenta;
            });
            usuario.cuentas = nuevasCuentas;
            alert('Cuenta eliminada correctamente');
        } else if (tipoProductoAEliminar === 'tarjeta') {
            const nuevasTarjetas = usuario.tarjetas.filter(function(tarjeta) {
                return tarjeta.numeroTarjeta !== productoAEliminar.numeroTarjeta;
            });
            usuario.tarjetas = nuevasTarjetas;
            alert('Tarjeta eliminada correctamente');
        }
        
        const usuarios = obtenerUsuarios();
        const index = usuarios.findIndex(u => u.id === usuario.id);
        usuarios[index] = usuario;
        guardarUsuarios(usuarios);
        actualizarSesion(usuario);
        
        ocultarPopupEliminar();
        cargarCuentas();
        cargarActividadReciente();
    }
    
    const nombreSpan = document.getElementById('nombreUsuario');
    if (nombreSpan) {
        nombreSpan.textContent = usuario.nombreCompleto.split(' ')[0];
    }
    
    function cargarCuentas() {
        const cardsContainer = document.getElementById('cardsContainer');
        if (!cardsContainer) return;
        
        cardsContainer.innerHTML = '';
        
        if (usuario.cuentas.length === 0 && usuario.tarjetas.length === 0) {
            cardsContainer.innerHTML = '<div style="text-align: center; padding: 40px; background: #f5f5f5; border-radius: 16px;">No tienes productos bancarios. Crea uno nuevo.</div>';
            return;
        }
        
        usuario.cuentas.forEach(function(cuenta) {
            const tipoTexto = cuenta.tipo === 'ahorros' ? '🏦 Cuenta de Ahorros' : '💳 Cuenta Corriente';
            const numeroOculto = '****' + cuenta.numeroCuenta.slice(-4);
            const saldoFormateado = formatearMoneda(cuenta.saldo);
            
            const card = document.createElement('div');
            card.className = 'card';
            card.style.cursor = 'pointer';
            card.setAttribute('data-numero', cuenta.numeroCuenta);
            
            card.innerHTML = `
                <div>
                    <small>${tipoTexto}</small>
                    <div class="number">${numeroOculto}</div>
                </div>
                <div>
                    <small>Saldo Disponible</small>
                    <div class="balance">${saldoFormateado}</div>
                </div>
                <div style="margin-top: 10px; text-align: right;">
                    <span class="eliminar-btn" style="color: #c62828; font-size: 12px; cursor: pointer;">🗑 Eliminar</span>
                </div>
            `;
            
            card.addEventListener('click', function(e) {
                if (e.target.classList.contains('eliminar-btn')) return;
                localStorage.setItem('cuentaSeleccionada', JSON.stringify(cuenta));
                alert('Cuenta seleccionada: ' + cuenta.numeroCuenta);
            });
            
            const eliminarBtn = card.querySelector('.eliminar-btn');
            eliminarBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                mostrarPopupEliminar(cuenta, 'cuenta', tipoTexto);
            });
            
            cardsContainer.appendChild(card);
        });
        
        usuario.tarjetas.forEach(function(tarjeta) {
            const numeroOculto = '****' + tarjeta.numeroTarjeta.slice(-4);
            const disponible = tarjeta.cupo - tarjeta.deuda;
            const disponibleFormateado = formatearMoneda(disponible);
            
            const card = document.createElement('div');
            card.className = 'card';
            card.style.cursor = 'pointer';
            card.style.background = 'linear-gradient(135deg, #2C6E9E, #0A2540)';
            card.style.color = 'white';
            card.setAttribute('data-numero', tarjeta.numeroTarjeta);
            
            card.innerHTML = `
                <div>
                    <small>💳 Tarjeta de Crédito</small>
                    <div class="number">${numeroOculto}</div>
                </div>
                <div>
                    <small>Crédito Disponible</small>
                    <div class="balance">${disponibleFormateado}</div>
                </div>
                <div style="margin-top: 10px; text-align: right;">
                    <span class="eliminar-btn" style="color: #ffaaaa; font-size: 12px; cursor: pointer;">🗑 Eliminar</span>
                </div>
            `;
            
            card.addEventListener('click', function(e) {
                if (e.target.classList.contains('eliminar-btn')) return;
                localStorage.setItem('tarjetaSeleccionada', JSON.stringify(tarjeta));
                alert('Tarjeta seleccionada: ' + tarjeta.numeroTarjeta);
            });
            
            const eliminarBtn = card.querySelector('.eliminar-btn');
            eliminarBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                mostrarPopupEliminar(tarjeta, 'tarjeta', 'Tarjeta');
            });
            
            cardsContainer.appendChild(card);
        });
    }
    
    function cargarActividadReciente() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        let todosMovimientos = [];
        
        usuario.cuentas.forEach(function(cuenta) {
            if (cuenta.movimientos && cuenta.movimientos.length > 0) {
                cuenta.movimientos.forEach(function(mov) {
                    todosMovimientos.push({
                        ...mov,
                        numeroCuenta: cuenta.numeroCuenta,
                        tipoCuenta: cuenta.tipo === 'ahorros' ? 'Ahorros' : 'Corriente'
                    });
                });
            }
        });
        
        todosMovimientos.sort(function(a, b) {
            return new Date(b.fechaHora) - new Date(a.fechaHora);
        });
        
        const ultimosMovimientos = todosMovimientos.slice(0, 5);
        
        if (ultimosMovimientos.length === 0) {
            activityList.innerHTML = '<div class="activity-item">No hay movimientos recientes</div>';
        } else {
            activityList.innerHTML = '';
            ultimosMovimientos.forEach(function(movimiento) {
                const esIngreso = movimiento.tipo === 'CONSIGNACION' || movimiento.tipo === 'INTERES';
                const claseColor = esIngreso ? 'green' : 'red';
                const signo = esIngreso ? '+' : '-';
                
                let icono = 'TRANSFERENCIA.png';
                if (movimiento.tipo === 'CONSIGNACION') icono = 'CONSIGNACION.png';
                if (movimiento.tipo === 'RETIRO') icono = 'RETIRO.png';
                if (movimiento.tipo === 'INTERES') icono = 'INTERES.png';
                
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <div class="activity-icon"><img src="../IMAGENES/${icono}" alt=""></div>
                    <div class="activity-details">
                        <div class="activity-name">${movimiento.tipo === 'CONSIGNACION' ? 'Consignación' : movimiento.tipo === 'RETIRO' ? 'Retiro' : movimiento.tipo === 'INTERES' ? 'Interés Aplicado' : movimiento.tipo}</div>
                        <div class="activity-date">${formatearFecha(movimiento.fechaHora)}</div>
                    </div>
                    <div class="activity-amount ${claseColor}">${signo} ${formatearMoneda(movimiento.valor)}</div>
                `;
                activityList.appendChild(item);
            });
        }
    }
    
    // Eventos de los popups
    document.getElementById('crearProductoBtn').addEventListener('click', mostrarPopupCrear);
    document.getElementById('confirmarCrear').addEventListener('click', crearProducto);
    document.getElementById('cancelarCrear').addEventListener('click', ocultarPopupCrear);
    document.getElementById('confirmarEliminar').addEventListener('click', eliminarProducto);
    document.getElementById('cancelarEliminar').addEventListener('click', ocultarPopupEliminar);
    
    window.addEventListener('click', function(e) {
        const crearPopup = document.getElementById('crearPopup');
        const eliminarPopup = document.getElementById('eliminarPopup');
        if (e.target === crearPopup) ocultarPopupCrear();
        if (e.target === eliminarPopup) ocultarPopupEliminar();
    });
    
    // Navegación
    document.getElementById('btnConsultarSaldo')?.addEventListener('click', () => window.location.href = '../SaldoActual/saldoActual.html');
    document.getElementById('btnConsignar')?.addEventListener('click', () => window.location.href = '../ConsignarDinero/consignarDinero.html');
    document.getElementById('btnRetirar')?.addEventListener('click', () => window.location.href = '../RetirarDinero/retirarDinero.html');
    document.getElementById('btnMovimientos')?.addEventListener('click', () => window.location.href = '../VerMovimientos/movimientos.html');
    document.getElementById('btnTransferir')?.addEventListener('click', () => window.location.href = '../Transferir/transferir.html');
    document.getElementById('btnTarjeta')?.addEventListener('click', () => window.location.href = '../TarjetaCredito/tarjetaCredito.html');
    
    document.getElementById('logoutLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('sesionActual');
        window.location.href = '../LandingPage/landingPage.html';
    });
    
    document.getElementById('perfilLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '../Perfil/perfil.html';
    });
    
    cargarCuentas();
    cargarActividadReciente();
});


function crearTarjetaCredito() {
    const saldoInicial = parseFloat(document.getElementById('saldoInicial').value) || 0;
    
    const nuevaTarjeta = {
        numeroTarjeta: generarNumeroProducto('tarjeta'),
        cupo: saldoInicial > 0 ? saldoInicial : 1000000,
        deuda: 0,
        movimientos: []
    };
    
    usuario.tarjetas.push(nuevaTarjeta);
    
    const usuarios = obtenerUsuarios();
    const index = usuarios.findIndex(u => u.id === usuario.id);
    usuarios[index] = usuario;
    guardarUsuarios(usuarios);
    actualizarSesion(usuario);
    
    alert('Tarjeta de crédito creada. Número: ' + nuevaTarjeta.numeroTarjeta + ' - Cupo: ' + formatearMoneda(nuevaTarjeta.cupo));
    cargarCuentas();
    ocultarPopupCrear();
}