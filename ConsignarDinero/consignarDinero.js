document.addEventListener('DOMContentLoaded', function() {
    const sesionActual = localStorage.getItem('sesionActual');
    
    if (!sesionActual) {
        window.location.href = '../Login/login.html';
        return;
    }
    
    let usuario = JSON.parse(sesionActual);
    let cuentaSeleccionada = null;
    
    const accountsGrid = document.getElementById('accountsGrid');
    const montoInput = document.getElementById('montoInput');
    const consignarBtn = document.getElementById('consignarBtn');
    const mensajeDiv = document.getElementById('mensaje');
    const inputHint = document.getElementById('inputHint');
    
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
    
    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }
    
    function mostrarMensaje(texto, esError) {
        mensajeDiv.textContent = texto;
        if (esError) {
            mensajeDiv.style.background = '#ffebee';
            mensajeDiv.style.color = '#c62828';
        } else {
            mensajeDiv.style.background = '#e8f5e9';
            mensajeDiv.style.color = '#2e7d32';
        }
        mensajeDiv.style.display = 'block';
        
        setTimeout(function() {
            mensajeDiv.style.display = 'none';
        }, 3000);
    }
    
    function actualizarHint() {
        if (cuentaSeleccionada) {
            inputHint.innerHTML = 'Saldo actual: ' + formatearMoneda(cuentaSeleccionada.saldo);
        } else {
            inputHint.innerHTML = 'Selecciona una cuenta';
        }
    }
    
    function cargarCuentas() {
        if (!accountsGrid) return;
        
        accountsGrid.innerHTML = '';
        
        const cuentasBancarias = usuario.cuentas;
        
        if (cuentasBancarias.length === 0) {
            accountsGrid.innerHTML = '<div class="account-card">No tienes cuentas disponibles. Crea una desde el panel principal.</div>';
            consignarBtn.disabled = true;
            consignarBtn.style.opacity = '0.5';
            return;
        }
        
        consignarBtn.disabled = false;
        consignarBtn.style.opacity = '1';
        
        cuentasBancarias.forEach(function(cuenta, index) {
            const tipoTexto = cuenta.tipo === 'ahorros' ? 'Cuenta de Ahorros' : 'Cuenta Corriente';
            const numeroOculto = '****' + cuenta.numeroCuenta.slice(-4);
            
            const accountCard = document.createElement('div');
            accountCard.className = 'account-card';
            if (index === 0) {
                accountCard.classList.add('active');
                cuentaSeleccionada = cuenta;
                actualizarHint();
            }
            
            accountCard.innerHTML = `
                <div class="account-info">
                    <div class="account-name">${tipoTexto}</div>
                    <div class="account-number">${numeroOculto}</div>
                    <div class="account-balance">Saldo: ${formatearMoneda(cuenta.saldo)}</div>
                </div>
                <div class="account-radio">${index === 0 ? '●' : '○'}</div>
            `;
            
            accountCard.addEventListener('click', function() {
                document.querySelectorAll('.account-card').forEach(function(card) {
                    card.classList.remove('active');
                    const radio = card.querySelector('.account-radio');
                    if (radio) radio.textContent = '○';
                });
                
                accountCard.classList.add('active');
                const radio = accountCard.querySelector('.account-radio');
                if (radio) radio.textContent = '●';
                
                cuentaSeleccionada = cuenta;
                actualizarHint();
            });
            
            accountsGrid.appendChild(accountCard);
        });
    }
    
    const quickBtns = document.querySelectorAll('.quick-btn');
    quickBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const monto = parseInt(btn.getAttribute('data-monto'));
            if (montoInput) {
                montoInput.value = monto;
            }
        });
    });
    
    consignarBtn.addEventListener('click', function() {
        if (!cuentaSeleccionada) {
            mostrarMensaje('Seleccione una cuenta primero', true);
            return;
        }
        
        const monto = parseFloat(montoInput.value);
        
        if (isNaN(monto) || monto <= 0) {
            mostrarMensaje('Ingrese un monto válido mayor a 0', true);
            return;
        }
        
        const nuevoSaldo = cuentaSeleccionada.saldo + monto;
        
        const movimiento = {
            tipo: 'CONSIGNACION',
            valor: monto,
            saldoPosterior: nuevoSaldo,
            fechaHora: new Date().toISOString(),
            descripcion: 'Consignación por ' + formatearMoneda(monto)
        };
        
        cuentaSeleccionada.saldo = nuevoSaldo;
        
        if (!cuentaSeleccionada.movimientos) {
            cuentaSeleccionada.movimientos = [];
        }
        cuentaSeleccionada.movimientos.unshift(movimiento);
        
        const usuarios = obtenerUsuarios();
        const userIndex = usuarios.findIndex(u => u.id === usuario.id);
        const cuentaIndex = usuarios[userIndex].cuentas.findIndex(c => c.numeroCuenta === cuentaSeleccionada.numeroCuenta);
        usuarios[userIndex].cuentas[cuentaIndex] = cuentaSeleccionada;
        
        guardarUsuarios(usuarios);
        actualizarSesion(usuarios[userIndex]);
        
        const cards = document.querySelectorAll('.account-card');
        usuario.cuentas.forEach(function(cuenta, idx) {
            if (cuenta.numeroCuenta === cuentaSeleccionada.numeroCuenta) {
                const balanceSpan = cards[idx].querySelector('.account-balance');
                if (balanceSpan) {
                    balanceSpan.textContent = 'Saldo: ' + formatearMoneda(cuentaSeleccionada.saldo);
                }
            }
        });
        
        mostrarMensaje('Consignación exitosa. Nuevo saldo: ' + formatearMoneda(cuentaSeleccionada.saldo), false);
        montoInput.value = '0';
        actualizarHint();
    });
    
    const backLink = document.getElementById('backLink');
    if (backLink) {
        backLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../Principal/principal.html';
        });
    }
    
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('sesionActual');
            window.location.href = '../LandingPage/landingPage.html';
        });
    }
    
    const perfilLink = document.getElementById('perfilLink');
    if (perfilLink) {
        perfilLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../Perfil/perfil.html';
        });
    }
    
    cargarCuentas();
});