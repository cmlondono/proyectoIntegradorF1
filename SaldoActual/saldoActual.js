document.addEventListener('DOMContentLoaded', function() {
    // Obtener sesión actual
    const sesionActual = localStorage.getItem('sesionActual');
    
    if (!sesionActual) {
        window.location.href = '../Login/login.html';
        return;
    }
    
    const usuario = JSON.parse(sesionActual);
    let cuentaSeleccionada = null;
    let ocultarSaldo = false;
    
    const optsContainer = document.getElementById('optsContainer');
    const saldoCard = document.getElementById('saldoCard');
    const accType = document.getElementById('accType');
    const accNum = document.getElementById('accNum');
    const amount = document.getElementById('amount');
    const date = document.getElementById('date');
    const infoGrid = document.getElementById('infoGrid');
    const eyeBtn = document.getElementById('eyeBtn');
    const mensajeDiv = document.getElementById('mensaje');
    
    function getFechaActual() {
        const ahora = new Date();
        return ahora.toLocaleDateString('es-CO') + ', ' + ahora.toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'});
    }
    
    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }
    
    function actualizarInfoCuenta() {
        if (!cuentaSeleccionada) return;
        
        const esAhorros = cuentaSeleccionada.tipo === 'ahorros';
        const numeroOculto = '****' + cuentaSeleccionada.numeroCuenta.slice(-4);
        
        accType.textContent = esAhorros ? '📋 Cuenta de Ahorros' : '📋 Cuenta Corriente';
        accNum.textContent = numeroOculto;
        
        if (ocultarSaldo) {
            amount.textContent = '••••••';
        } else {
            amount.textContent = formatearMoneda(cuentaSeleccionada.saldo);
        }
        
       
        saldoCard.style.display = 'block';
        
        // Actualizar info grid
        if (esAhorros) {
            const interesMensual = cuentaSeleccionada.saldo * 0.015;
            const saldoProyectado = cuentaSeleccionada.saldo + interesMensual;
            
            infoGrid.innerHTML = `
                <div class="info">
                    <div class="info-title">
                        <div class="icon">📄</div>
                        Información de la Cuenta
                    </div>
                    <div class="row">
                        <span class="key">Tipo de cuenta:</span>
                        <span class="val">Cuenta de Ahorros</span>
                    </div>
                    <div class="row">
                        <span class="key">Número:</span>
                        <span class="val">${numeroOculto}</span>
                    </div>
                    <div class="row">
                        <span class="key">Tasa de interés:</span>
                        <span class="val green">1.5% mensual</span>
                    </div>
                </div>
                <div class="info">
                    <div class="info-title">
                        <div class="icon green">📈</div>
                        Proyección de Intereses
                    </div>
                    <div class="row">
                        <span class="key">Interés este mes:</span>
                        <span class="val green">+${formatearMoneda(interesMensual)}</span>
                    </div>
                    <div class="row">
                        <span class="key">Saldo proyectado:</span>
                        <span class="val">${formatearMoneda(saldoProyectado)}</span>
                    </div>
                </div>
            `;
        } else {
            const limiteRetiro = cuentaSeleccionada.saldo + (cuentaSeleccionada.saldo * 0.2);
            infoGrid.innerHTML = `
                <div class="info">
                    <div class="info-title">
                        <div class="icon">📄</div>
                        Información de la Cuenta
                    </div>
                    <div class="row">
                        <span class="key">Tipo de cuenta:</span>
                        <span class="val">Cuenta Corriente</span>
                    </div>
                    <div class="row">
                        <span class="key">Número:</span>
                        <span class="val">${numeroOculto}</span>
                    </div>
                    <div class="row">
                        <span class="key">Sobregiro:</span>
                        <span class="val">20% del saldo</span>
                    </div>
                </div>
                <div class="info">
                    <div class="info-title">
                        <div class="icon green">💳</div>
                        Límite de Retiro
                    </div>
                    <div class="row">
                        <span class="key">Límite disponible:</span>
                        <span class="val">${formatearMoneda(limiteRetiro)}</span>
                    </div>
                    <div class="row">
                        <span class="key">Sobregiro máximo:</span>
                        <span class="val">${formatearMoneda(cuentaSeleccionada.saldo * 0.2)}</span>
                    </div>
                </div>
            `;
        }
    }
    
    function cargarCuentas() {
        if (!optsContainer) return;
        
        optsContainer.innerHTML = '';
        
        const cuentasBancarias = usuario.cuentas;
        
        if (cuentasBancarias.length === 0) {
            mensajeDiv.style.display = 'block';
            mensajeDiv.innerHTML = 'No tienes cuentas bancarias. Crea una desde el panel principal.';
            saldoCard.style.display = 'none';
            infoGrid.innerHTML = '';
            return;
        }
        
        mensajeDiv.style.display = 'none';
        
        cuentasBancarias.forEach(function(cuenta, index) {
            const esAhorros = cuenta.tipo === 'ahorros';
            const tipoTexto = esAhorros ? 'Cuenta de Ahorros' : 'Cuenta Corriente';
            const numeroOculto = '****' + cuenta.numeroCuenta.slice(-4);
            
            const opt = document.createElement('div');
            opt.className = 'opt';
            if (index === 0) {
                opt.classList.add('active');
                cuentaSeleccionada = cuenta;
                actualizarInfoCuenta();
            }
            
            opt.innerHTML = `
                <div class="opt-name">${tipoTexto}</div>
                <div class="opt-num">${numeroOculto}</div>
            `;
            
            opt.addEventListener('click', function() {
                document.querySelectorAll('.opt').forEach(function(o) {
                    o.classList.remove('active');
                });
                opt.classList.add('active');
                cuentaSeleccionada = cuenta;
                actualizarInfoCuenta();
            });
            
            optsContainer.appendChild(opt);
        });
    }
    
    if (eyeBtn) {
        eyeBtn.addEventListener('click', function() {
            ocultarSaldo = !ocultarSaldo;
            actualizarInfoCuenta();
        });
    }
    
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