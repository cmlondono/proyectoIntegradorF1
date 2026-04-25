import { TipoMovimiento } from '../models/enums/Tipos.js';

document.addEventListener('DOMContentLoaded', function () {
    const sesionActual = localStorage.getItem('sesionActual');

    if (!sesionActual) {
        window.location.href = '../Login/login.html';
        return;
    }

    let usuario = JSON.parse(sesionActual);
    let tarjetaSeleccionada = null;
    let cuotasSeleccionadas = 1;

    const selectTarjeta = document.getElementById('selectTarjeta');
    const cardSection = document.getElementById('cardSection');
    const montoCompra = document.getElementById('montoCompra');
    const maxHint = document.getElementById('maxHint');
    const calcularBtn = document.getElementById('calcularBtn');
    const resultadoSimulacion = document.getElementById('resultadoSimulacion');
    const mensajeDiv = document.getElementById('mensaje');
    const quotasGrid = document.getElementById('quotasGrid');

    const opcionesCuotas = [1, 2, 3, 6, 9, 12, 18, 24, 36];

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

    function calcularTasaInteres(cuotas) {
        if (cuotas <= 2) {
            return 0;
        } else if (cuotas <= 6) {
            return 0.019;
        } else {
            return 0.023;
        }
    }

    function calcularCuotaMensual(capital, tasaMensual, cuotas) {
        if (tasaMensual === 0) {
            return capital / cuotas;
        }
        const cuota = (capital * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -cuotas));
        return Math.round(cuota);
    }

    function cargarTarjetas() {
        if (!selectTarjeta) return;

        selectTarjeta.innerHTML = '<option value="">Seleccione una tarjeta</option>';

        if (usuario.tarjetas.length === 0) {
            selectTarjeta.innerHTML = '<option value="">No tienes tarjetas de crédito. Crea una desde el panel principal.</option>';
            cardSection.innerHTML = '<div class="credit-card">No tienes tarjetas de crédito</div>';
            calcularBtn.disabled = true;
            calcularBtn.style.opacity = '0.5';
            return;
        }

        calcularBtn.disabled = false;
        calcularBtn.style.opacity = '1';

        usuario.tarjetas.forEach(function (tarjeta, index) {
            const option = document.createElement('option');
            option.value = index;
            const numeroOculto = '**** **** **** ' + tarjeta.numeroTarjeta.slice(-4);
            const disponible = tarjeta.cupo - tarjeta.deuda;
            option.textContent = 'Tarjeta ' + numeroOculto + ' - Disponible: ' + formatearMoneda(disponible);
            selectTarjeta.appendChild(option);
        });

        if (usuario.tarjetas.length > 0) {
            selectTarjeta.selectedIndex = 1;
            selectTarjeta.dispatchEvent(new Event('change'));
        }
    }

    function mostrarInfoTarjeta() {
        if (!tarjetaSeleccionada) {
            cardSection.innerHTML = '<div class="credit-card">Seleccione una tarjeta</div>';
            return;
        }

        const disponible = tarjetaSeleccionada.cupo - tarjetaSeleccionada.deuda;
        const deuda = tarjetaSeleccionada.deuda;
        const cupo = tarjetaSeleccionada.cupo;
        const porcentajeUsado = (deuda / cupo) * 100;
        const numeroOculto = '**** **** **** ' + tarjetaSeleccionada.numeroTarjeta.slice(-4);

        let tasaTexto = '';
        if (cuotasSeleccionadas <= 2) {
            tasaTexto = '0% (hasta 2 cuotas sin interés)';
        } else if (cuotasSeleccionadas <= 6) {
            tasaTexto = '1.9% mensual';
        } else {
            tasaTexto = '2.3% mensual';
        }

        cardSection.innerHTML = `
            <div class="credit-card">
                <div class="card-logo"></div>
                <div class="card-chip"></div>
                <div class="card-number">${numeroOculto}</div>
                <div class="card-footer">
                    <div class="card-holder">
                        <div class="label">Titular</div>
                        <div class="name">${usuario.nombreCompleto.toUpperCase()}</div>
                    </div>
                    <div class="card-expiry">
                        <div class="label">Vence</div>
                        <div class="date">${new Date().getMonth() + 1}/${new Date().getFullYear() + 4}</div>
                    </div>
                </div>
            </div>
            <div class="credit-info">
                <div class="info-title">Información de Crédito</div>
                <div class="info-item">
                    <div class="item-label">Crédito disponible</div>
                    <div class="item-value available">${formatearMoneda(disponible)}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${porcentajeUsado}%;"></div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="item-label">Límite total</div>
                    <div class="item-value">${formatearMoneda(cupo)}</div>
                </div>
                <div class="info-item">
                    <div class="item-label">Deuda actual</div>
                    <div class="item-value red">${formatearMoneda(deuda)}</div>
                </div>
                <div class="info-item">
                    <div class="item-label">Tasa de interés</div>
                    <div class="item-value">${tasaTexto}</div>
                </div>
            </div>
        `;

        maxHint.innerHTML = 'Máximo disponible: ' + formatearMoneda(disponible);
    }

    function cargarBotonesCuotas() {
        if (!quotasGrid) return;

        quotasGrid.innerHTML = '';

        opcionesCuotas.forEach(function (cuota) {
            const btn = document.createElement('button');
            btn.className = 'quota-btn';
            if (cuota === cuotasSeleccionadas) {
                btn.classList.add('active');
            }
            btn.textContent = cuota;
            btn.setAttribute('data-cuota', cuota);

            btn.addEventListener('click', function () {
                document.querySelectorAll('.quota-btn').forEach(function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                cuotasSeleccionadas = cuota;
                mostrarInfoTarjeta();
            });

            quotasGrid.appendChild(btn);
        });
    }

    function realizarCompra() {
        if (!tarjetaSeleccionada) {
            mostrarMensaje('Seleccione una tarjeta primero', true);
            return;
        }

        const monto = parseFloat(montoCompra.value);

        if (isNaN(monto) || monto <= 0) {
            mostrarMensaje('Ingrese un monto válido mayor a 0', true);
            return;
        }

        const disponible = tarjetaSeleccionada.cupo - tarjetaSeleccionada.deuda;

        if (monto > disponible) {
            mostrarMensaje('El monto excede el crédito disponible: ' + formatearMoneda(disponible), true);
            return;
        }

        const tasaMensual = calcularTasaInteres(cuotasSeleccionadas);
        const cuotaMensual = calcularCuotaMensual(monto, tasaMensual, cuotasSeleccionadas);
        const totalPagar = cuotaMensual * cuotasSeleccionadas;
        const interesTotal = totalPagar - monto;

        let tasaTexto = '';
        if (cuotasSeleccionadas <= 2) {
            tasaTexto = '0% (sin interés)';
        } else if (cuotasSeleccionadas <= 6) {
            tasaTexto = '1.9% mensual';
        } else {
            tasaTexto = '2.3% mensual';
        }

        resultadoSimulacion.style.display = 'block';
        resultadoSimulacion.innerHTML = `
            <div class="simulacion-resultado" style="background: #f5f5f5; padding: 20px; border-radius: 16px;">
                <div class="resultado-title" style="font-weight: bold; margin-bottom: 15px;">Resumen de la compra</div>
                <div class="resultado-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="font-size: 12px; color: #666;">Valor de la compra</div>
                        <div style="font-weight: bold;">${formatearMoneda(monto)}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666;">Número de cuotas</div>
                        <div style="font-weight: bold;">${cuotasSeleccionadas}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666;">Tasa de interés</div>
                        <div style="font-weight: bold;">${tasaTexto}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666;">Valor cuota mensual</div>
                        <div style="font-weight: bold; color: #0A2540; font-size: 18px;">${formatearMoneda(cuotaMensual)}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666;">Total a pagar</div>
                        <div style="font-weight: bold;">${formatearMoneda(totalPagar)}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666;">Interés total</div>
                        <div style="font-weight: bold; ${interesTotal > 0 ? 'color: #c62828;' : 'color: #2e7d32;'}">${interesTotal > 0 ? '+' : ''}${formatearMoneda(interesTotal)}</div>
                    </div>
                </div>
                <button id="confirmarCompraBtn" style="margin-top: 20px; width: 100%; background: #0A2540; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">✅ Confirmar Compra</button>
            </div>
        `;

        const confirmarBtn = document.getElementById('confirmarCompraBtn');
        if (confirmarBtn) {
            confirmarBtn.addEventListener('click', function () {
                try {
                    const nuevaDeuda = tarjetaSeleccionada.deuda + totalPagar;
                    tarjetaSeleccionada.deuda = nuevaDeuda;

                    const movimiento = {
                        tipo: TipoMovimiento.COMPRA_TC,
                        valor: monto,
                        saldoPosterior: tarjetaSeleccionada.cupo - nuevaDeuda,
                        fechaHora: new Date().toISOString(),
                        descripcion: 'Compra de ' + formatearMoneda(monto) + ' en ' + cuotasSeleccionadas + ' cuotas - Cuota mensual: ' + formatearMoneda(cuotaMensual)
                    };
                    console.log('Movimiento registrado:', movimiento);
                    if (!tarjetaSeleccionada.movimientos) {
                        tarjetaSeleccionada.movimientos = [];
                    }
                    tarjetaSeleccionada.movimientos.unshift(movimiento);

                    const usuarios = obtenerUsuarios();
                    const userIndex = usuarios.findIndex(u => u.id === usuario.id);
                    const tarjetaIndex = usuarios[userIndex].tarjetas.findIndex(t => t.numeroTarjeta === tarjetaSeleccionada.numeroTarjeta);
                    usuarios[userIndex].tarjetas[tarjetaIndex] = tarjetaSeleccionada;

                    guardarUsuarios(usuarios);
                    actualizarSesion(usuarios[userIndex]);

                    mostrarMensaje('Compra realizada con éxito. Cuota mensual: ' + formatearMoneda(cuotaMensual), false);

                    montoCompra.value = '0';
                    resultadoSimulacion.style.display = 'none';

                    cargarTarjetas();
                    mostrarInfoTarjeta();

                } catch (error) {
                    mostrarMensaje(error.message, true);
                }
            });
        }
    }

    selectTarjeta.addEventListener('change', function () {
        const index = parseInt(this.value);
        if (isNaN(index)) {
            tarjetaSeleccionada = null;
        } else {
            tarjetaSeleccionada = usuario.tarjetas[index];
        }
        mostrarInfoTarjeta();
    });

    calcularBtn.addEventListener('click', function () {
        realizarCompra();
    });

    montoCompra.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            realizarCompra();
        }
    });

    document.getElementById('backLink')?.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '../Principal/principal.html';
    });

    document.getElementById('logoutLink')?.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('sesionActual');
        window.location.href = '../LandingPage/landingPage.html';
    });

    document.getElementById('perfilLink')?.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '../Perfil/perfil.html';
    });

    cargarTarjetas();
    cargarBotonesCuotas();
});