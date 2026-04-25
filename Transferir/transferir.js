
import { TipoMovimiento } from '../models/enums/Tipos.js';
document.addEventListener('DOMContentLoaded', function () {
    const sesionActual = localStorage.getItem('sesionActual');

    if (!sesionActual) {
        window.location.href = '../Login/login.html';
        return;
    }

    let usuario = JSON.parse(sesionActual);
    let cuentaOrigen = null;
    let cuentaDestino = null;
    let tipoTransferencia = 'mismas';
    let otroUsuarioSeleccionado = null;

    const origenGrid = document.getElementById('origenGrid');
    const destinoContainer = document.getElementById('destinoContainer');
    const montoInput = document.getElementById('montoInput');
    const transferirBtn = document.getElementById('transferirBtn');
    const mensajeDiv = document.getElementById('mensaje');
    const inputHint = document.getElementById('inputHint');
    const infoText = document.getElementById('infoText');

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

        setTimeout(function () {
            mensajeDiv.style.display = 'none';
        }, 3000);
    }

    function actualizarHint() {
        if (cuentaOrigen) {
            if (cuentaOrigen.tipo === 'corriente') {
                const limite = cuentaOrigen.saldo + (cuentaOrigen.saldo * 0.2);
                inputHint.innerHTML = 'Máximo disponible: ' + formatearMoneda(limite) + ' (incluye sobregiro)';
            } else {
                inputHint.innerHTML = 'Máximo disponible: ' + formatearMoneda(cuentaOrigen.saldo);
            }
        } else {
            inputHint.innerHTML = 'Máximo disponible: $0';
        }
    }

    function getLimiteTransferencia(cuenta) {
        if (cuenta.tipo === 'corriente') {
            return cuenta.saldo + (cuenta.saldo * 0.2);
        } else {
            return cuenta.saldo;
        }
    }

    function cargarCuentasOrigen() {
        if (!origenGrid) return;

        origenGrid.innerHTML = '';

        const cuentasBancarias = usuario.cuentas;

        if (cuentasBancarias.length === 0) {
            origenGrid.innerHTML = '<div class="account-card">No tienes cuentas disponibles. Crea una desde el panel principal.</div>';
            transferirBtn.disabled = true;
            transferirBtn.style.opacity = '0.5';
            return;
        }

        transferirBtn.disabled = false;
        transferirBtn.style.opacity = '1';

        cuentasBancarias.forEach(function (cuenta, index) {
            const tipoTexto = cuenta.tipo === 'ahorros' ? 'Cuenta de Ahorros' : 'Cuenta Corriente';
            const numeroOculto = '****' + cuenta.numeroCuenta.slice(-4);

            const accountCard = document.createElement('div');
            accountCard.className = 'account-card';
            if (index === 0) {
                accountCard.classList.add('active');
                cuentaOrigen = cuenta;
                actualizarHint();
            }

            accountCard.innerHTML = `
                <div class="account-info">
                    <div class="account-name">${tipoTexto}</div>
                    <div class="account-number">${numeroOculto}</div>
                    <div class="account-balance">Saldo: ${formatearMoneda(cuenta.saldo)}</div>
                </div>
            `;

            accountCard.addEventListener('click', function () {
                document.querySelectorAll('#origenGrid .account-card').forEach(function (card) {
                    card.classList.remove('active');
                });
                accountCard.classList.add('active');
                cuentaOrigen = cuenta;
                actualizarHint();
                cargarDestinos();
            });

            origenGrid.appendChild(accountCard);
        });
    }

    function cargarDestinos() {
        if (!destinoContainer) return;

        destinoContainer.innerHTML = '';
        cuentaDestino = null;

        if (tipoTransferencia === 'mismas') {
            infoText.innerHTML = 'Seleccione una cuenta de destino diferente a la de origen y de tipo diferente.';

            const otrasCuentas = usuario.cuentas.filter(function (cuenta) {
                return cuenta.numeroCuenta !== cuentaOrigen.numeroCuenta;
            });

            if (otrasCuentas.length === 0) {
                destinoContainer.innerHTML = '<div class="account-card disabled">No hay otras cuentas disponibles</div>';
                return;
            }

            otrasCuentas.forEach(function (cuenta) {
                const tipoTexto = cuenta.tipo === 'ahorros' ? 'Cuenta de Ahorros' : 'Cuenta Corriente';
                const numeroOculto = '****' + cuenta.numeroCuenta.slice(-4);
                const mismoTipo = cuentaOrigen.tipo === cuenta.tipo;

                const accountCard = document.createElement('div');
                accountCard.className = 'account-card';
                if (mismoTipo) {
                    accountCard.classList.add('disabled');
                }

                accountCard.innerHTML = `
                    <div class="account-info">
                        <div class="account-name">${tipoTexto}</div>
                        <div class="account-number">${numeroOculto}</div>
                        <div class="account-balance">Saldo: ${formatearMoneda(cuenta.saldo)}</div>
                    </div>
                `;

                if (!mismoTipo) {
                    accountCard.style.cursor = 'pointer';
                    accountCard.addEventListener('click', function () {
                        document.querySelectorAll('#destinoContainer .account-card').forEach(function (card) {
                            card.classList.remove('active');
                        });
                        accountCard.classList.add('active');
                        cuentaDestino = cuenta;
                        infoText.innerHTML = 'Destino seleccionado: ' + tipoTexto + ' ' + numeroOculto;
                    });
                } else {
                    accountCard.style.opacity = '0.5';
                    const tooltip = document.createElement('div');
                    tooltip.style.fontSize = '11px';
                    tooltip.style.color = '#c62828';
                    tooltip.style.marginTop = '5px';
                    tooltip.textContent = 'No se puede transferir al mismo tipo';
                    accountCard.appendChild(tooltip);
                }

                destinoContainer.appendChild(accountCard);
            });

        } else {
            infoText.innerHTML = 'Ingrese el número de cuenta destino de otro usuario.';

            const inputDiv = document.createElement('div');
            inputDiv.style.marginTop = '10px';
            inputDiv.innerHTML = `
                <input type="text" id="cuentaDestinoInput" class="amount-input" placeholder="Ej: AHO-1234 o COR-5678" style="width:100%; padding: 12px;">
                <div style="font-size: 12px; color: #666; margin-top: 5px;">Ingrese el número exacto de la cuenta destino</div>
                <div id="validacionDestino" style="font-size: 12px; margin-top: 5px;"></div>
            `;
            destinoContainer.appendChild(inputDiv);

            const inputDestino = document.getElementById('cuentaDestinoInput');
            const validacionDiv = document.getElementById('validacionDestino');

            if (inputDestino) {
                inputDestino.addEventListener('input', function () {
                    const numero = this.value.trim();
                    cuentaDestino = null;

                    if (numero === '') {
                        validacionDiv.innerHTML = '';
                        return;
                    }

                    const usuarios = obtenerUsuarios();
                    let encontrada = false;

                    for (let i = 0; i < usuarios.length; i++) {
                        const user = usuarios[i];
                        const cuentaEncontrada = user.cuentas.find(function (c) {
                            return c.numeroCuenta === numero;
                        });
                        if (cuentaEncontrada) {

                            if (user.id === usuario.id && cuentaEncontrada.numeroCuenta === cuentaOrigen.numeroCuenta) {
                                validacionDiv.innerHTML = '<span style="color:#c62828;">No puedes transferir a tu misma cuenta</span>';
                                cuentaDestino = null;
                            } else {
                                validacionDiv.innerHTML = '<span style="color:#2e7d32;">✓ Cuenta válida: ' + (user.id === usuario.id ? 'Tus cuentas' : user.nombreCompleto) + '</span>';
                                cuentaDestino = cuentaEncontrada;
                                encontrada = true;
                            }
                            break;
                        }
                    }

                    if (!encontrada && numero !== '') {
                        validacionDiv.innerHTML = '<span style="color:#c62828;">✗ Cuenta no encontrada</span>';
                    }
                });
            }
        }
    }

    const tipoOptions = document.querySelectorAll('.transfer-option');
    tipoOptions.forEach(function (opt) {
        opt.addEventListener('click', function () {
            tipoOptions.forEach(function (o) {
                o.classList.remove('active');
            });
            opt.classList.add('active');
            tipoTransferencia = opt.getAttribute('data-tipo');
            cargarDestinos();
        });
    });

    transferirBtn.addEventListener('click', function () {
        if (!cuentaOrigen) {
            mostrarMensaje('Seleccione una cuenta de origen', true);
            return;
        }

        if (!cuentaDestino) {
            mostrarMensaje('Seleccione una cuenta de destino válida', true);
            return;
        }

        const monto = parseFloat(montoInput.value);

        if (isNaN(monto) || monto <= 0) {
            mostrarMensaje('Ingrese un monto válido mayor a 0', true);
            return;
        }

        const limite = getLimiteTransferencia(cuentaOrigen);

        if (monto > limite) {
            mostrarMensaje('Saldo insuficiente. Máximo disponible: ' + formatearMoneda(limite), true);
            return;
        }

        if (cuentaOrigen.numeroCuenta === cuentaDestino.numeroCuenta) {
            mostrarMensaje('No se puede transferir a la misma cuenta', true);
            return;
        }

        if (tipoTransferencia === 'mismas' && cuentaOrigen.tipo === cuentaDestino.tipo) {
            mostrarMensaje('No se puede transferir entre cuentas del mismo tipo (Ahorros a Ahorros o Corriente a Corriente)', true);
            return;
        }

        const nuevoSaldoOrigen = cuentaOrigen.saldo - monto;
        const nuevoSaldoDestino = cuentaDestino.saldo + monto;

        const movimientoOrigen = {
            tipo: TipoMovimiento.TRANSFERENCIA_OUT,
            valor: monto,
            saldoPosterior: nuevoSaldoOrigen,
            fechaHora: new Date().toISOString(),
            descripcion: 'Transferencia a cuenta ' + cuentaDestino.numeroCuenta
        };

        const movimientoDestino = {
            tipo: TipoMovimiento.TRANSFERENCIA_IN,
            valor: monto,
            saldoPosterior: nuevoSaldoDestino,
            fechaHora: new Date().toISOString(),
            descripcion: 'Transferencia de cuenta ' + cuentaOrigen.numeroCuenta
        };

        cuentaOrigen.saldo = nuevoSaldoOrigen;
        cuentaDestino.saldo = nuevoSaldoDestino;

        if (!cuentaOrigen.movimientos) cuentaOrigen.movimientos = [];
        if (!cuentaDestino.movimientos) cuentaDestino.movimientos = [];

        cuentaOrigen.movimientos.unshift(movimientoOrigen);
        cuentaDestino.movimientos.unshift(movimientoDestino);

        const usuarios = obtenerUsuarios();

        const userOrigenIndex = usuarios.findIndex(u => u.id === usuario.id);
        const cuentaOrigenIndex = usuarios[userOrigenIndex].cuentas.findIndex(c => c.numeroCuenta === cuentaOrigen.numeroCuenta);
        usuarios[userOrigenIndex].cuentas[cuentaOrigenIndex] = cuentaOrigen;

        if (tipoTransferencia === 'mismas') {
     
            const cuentaDestinoIndex = usuarios[userOrigenIndex].cuentas.findIndex(c => c.numeroCuenta === cuentaDestino.numeroCuenta);
            usuarios[userOrigenIndex].cuentas[cuentaDestinoIndex] = cuentaDestino;
        } else {
          
            const userDestinoIndex = usuarios.findIndex(u => {
                return u.cuentas.some(c => c.numeroCuenta === cuentaDestino.numeroCuenta);
            });
            if (userDestinoIndex !== -1) {
                const cuentaDestinoIndex = usuarios[userDestinoIndex].cuentas.findIndex(c => c.numeroCuenta === cuentaDestino.numeroCuenta);
                usuarios[userDestinoIndex].cuentas[cuentaDestinoIndex] = cuentaDestino;
            }
        }

        guardarUsuarios(usuarios);
        actualizarSesion(usuarios[userOrigenIndex]);

        const origenCards = document.querySelectorAll('#origenGrid .account-card');
        usuario.cuentas.forEach(function (cuenta, idx) {
            if (cuenta.numeroCuenta === cuentaOrigen.numeroCuenta) {
                const balanceSpan = origenCards[idx].querySelector('.account-balance');
                if (balanceSpan) {
                    balanceSpan.textContent = 'Saldo: ' + formatearMoneda(cuentaOrigen.saldo);
                }
            }
        });

        mostrarMensaje('Transferencia exitosa. Nuevo saldo: ' + formatearMoneda(cuentaOrigen.saldo), false);
        montoInput.value = '0';
        actualizarHint();

        cargarDestinos();
    });

    const backLink = document.getElementById('backLink');
    if (backLink) {
        backLink.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '../Principal/principal.html';
        });
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('sesionActual');
            window.location.href = '../LandingPage/landingPage.html';
        });
    }

    const perfilLink = document.getElementById('perfilLink');
    if (perfilLink) {
        perfilLink.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '../Perfil/perfil.html';
        });
    }

    cargarCuentasOrigen();
    cargarDestinos();
});