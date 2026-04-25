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
    const retirarBtn = document.getElementById('retirarBtn');
    const mensajeDiv = document.getElementById('mensaje');
    const infoText = document.getElementById('infoText');
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
    
    function getLimiteRetiro(cuenta) {
        if (cuenta.tipo === 'ahorros') {
            // Para ahorros: el interés se aplica ANTES del retiro
            const interes = cuenta.saldo * 0.015;
            const saldoConInteres = cuenta.saldo + interes;
            return saldoConInteres;
        } else {
            // Corriente: saldo + 20% sobregiro
            return cuenta.saldo + (cuenta.saldo * 0.2);
        }
    }
    
    function actualizarInfoCuenta(cuenta) {
        const esAhorros = cuenta.tipo === 'ahorros';
        const limite = getLimiteRetiro(cuenta);
        
        if (esAhorros) {
            const interes = cuenta.saldo * 0.015;
            infoText.innerHTML = '<strong>Cuenta de Ahorros:</strong> Se aplicará un interés del 1.5% sobre tu saldo actual (+' + formatearMoneda(interes) + '). Luego podrás retirar hasta el nuevo saldo total.';
            inputHint.innerHTML = 'Saldo actual: ' + formatearMoneda(cuenta.saldo) + ' + interés: ' + formatearMoneda(interes) + ' = Límite: ' + formatearMoneda(limite);
        } else {
            inputHint.innerHTML = 'Máximo disponible: ' + formatearMoneda(limite) + ' (incluye sobregiro del 20%)';
            infoText.innerHTML = '<strong>Cuenta Corriente:</strong> Puedes retirar hasta un 20% adicional sobre tu saldo (sobregiro). No genera intereses.';
        }
    }
    
    function cargarCuentas() {
        if (!accountsGrid) return;
        
        accountsGrid.innerHTML = '';
        
        const cuentasBancarias = usuario.cuentas;
        
        if (cuentasBancarias.length === 0) {
            accountsGrid.innerHTML = '<div class="account-card">No tienes cuentas disponibles. Crea una desde el panel principal.</div>';
            retirarBtn.disabled = true;
            retirarBtn.style.opacity = '0.5';
            return;
        }
        
        retirarBtn.disabled = false;
        retirarBtn.style.opacity = '1';
        
        cuentasBancarias.forEach(function(cuenta, index) {
            const tipoTexto = cuenta.tipo === 'ahorros' ? 'Cuenta de Ahorros' : 'Cuenta Corriente';
            const numeroOculto = '****' + cuenta.numeroCuenta.slice(-4);
            
            const accountCard = document.createElement('div');
            accountCard.className = 'account-card';
            if (index === 0) {
                accountCard.classList.add('active');
                cuentaSeleccionada = cuenta;
                actualizarInfoCuenta(cuenta);
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
                actualizarInfoCuenta(cuenta);
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
    
    retirarBtn.addEventListener('click', function() {
        if (!cuentaSeleccionada) {
            mostrarMensaje('Seleccione una cuenta primero', true);
            return;
        }
        
        const monto = parseFloat(montoInput.value);
        
        if (isNaN(monto) || monto <= 0) {
            mostrarMensaje('Ingrese un monto válido mayor a 0', true);
            return;
        }
        
        const limite = getLimiteRetiro(cuentaSeleccionada);
        
        if (monto > limite) {
            mostrarMensaje('El monto excede el límite disponible. Límite: ' + formatearMoneda(limite), true);
            return;
        }
        
        let interesAplicado = 0;
        let usoSobregiro = false;
        let montoSobregiro = 0;
        let nuevoSaldo = cuentaSeleccionada.saldo;
        let saldoAntesDelRetiro = cuentaSeleccionada.saldo;
        
        if (cuentaSeleccionada.tipo === 'ahorros') {
            // PASO 1: Calcular interés del 1.5% sobre el saldo actual
            interesAplicado = cuentaSeleccionada.saldo * 0.015;
            
            // PASO 2: Agregar interés al saldo (el banco te paga)
            nuevoSaldo = cuentaSeleccionada.saldo + interesAplicado;
            saldoAntesDelRetiro = nuevoSaldo;
            
            // PASO 3: Registrar el interés como un movimiento
            const movimientoInteres = {
                tipo: 'INTERES',
                valor: interesAplicado,
                saldoPosterior: nuevoSaldo,
                fechaHora: new Date().toISOString(),
                descripcion: 'Interés del 1.5% aplicado sobre saldo de ' + formatearMoneda(cuentaSeleccionada.saldo)
            };
            
            if (!cuentaSeleccionada.movimientos) {
                cuentaSeleccionada.movimientos = [];
            }
            cuentaSeleccionada.movimientos.unshift(movimientoInteres);
            
            // PASO 4: Realizar el retiro
            nuevoSaldo = nuevoSaldo - monto;
            
        } else {
            // Cuenta corriente: verificar sobregiro
            if (monto > cuentaSeleccionada.saldo) {
                usoSobregiro = true;
                montoSobregiro = monto - cuentaSeleccionada.saldo;
            }
            nuevoSaldo = cuentaSeleccionada.saldo - monto;
        }
        
        // Registrar movimiento de retiro
        const movimientoRetiro = {
            tipo: 'RETIRO',
            valor: monto,
            saldoPosterior: nuevoSaldo,
            fechaHora: new Date().toISOString(),
            descripcion: 'Retiro por ' + formatearMoneda(monto)
        };
        
        if (!cuentaSeleccionada.movimientos) {
            cuentaSeleccionada.movimientos = [];
        }
        cuentaSeleccionada.movimientos.unshift(movimientoRetiro);
        
        // Actualizar saldo final
        cuentaSeleccionada.saldo = nuevoSaldo;
        
        const usuarios = obtenerUsuarios();
        const userIndex = usuarios.findIndex(u => u.id === usuario.id);
        const cuentaIndex = usuarios[userIndex].cuentas.findIndex(c => c.numeroCuenta === cuentaSeleccionada.numeroCuenta);
        usuarios[userIndex].cuentas[cuentaIndex] = cuentaSeleccionada;
        
        guardarUsuarios(usuarios);
        actualizarSesion(usuarios[userIndex]);
        
        // Actualizar saldo mostrado en la tarjeta
        const cards = document.querySelectorAll('.account-card');
        usuario.cuentas.forEach(function(cuenta, idx) {
            if (cuenta.numeroCuenta === cuentaSeleccionada.numeroCuenta) {
                const balanceSpan = cards[idx].querySelector('.account-balance');
                if (balanceSpan) {
                    balanceSpan.textContent = 'Saldo: ' + formatearMoneda(cuentaSeleccionada.saldo);
                }
            }
        });
        
        let mensajeExito = '';
        if (cuentaSeleccionada.tipo === 'ahorros') {
            mensajeExito = 'Interés aplicado: +' + formatearMoneda(interesAplicado) + '. ';
            mensajeExito += 'Saldo con interés: ' + formatearMoneda(saldoAntesDelRetiro) + '. ';
            mensajeExito += 'Retiro: -' + formatearMoneda(monto) + '. ';
            mensajeExito += 'Nuevo saldo: ' + formatearMoneda(cuentaSeleccionada.saldo);
        } else {
            mensajeExito = 'Retiro exitoso. ';
            if (usoSobregiro) {
                mensajeExito += 'Usaste sobregiro de ' + formatearMoneda(montoSobregiro) + '. ';
            }
            mensajeExito += 'Nuevo saldo: ' + formatearMoneda(cuentaSeleccionada.saldo);
        }
        
        mostrarMensaje(mensajeExito, false);
        montoInput.value = '0';
        actualizarInfoCuenta(cuentaSeleccionada);
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