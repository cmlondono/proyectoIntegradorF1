import { TipoMovimiento } from '../models/enums/Tipos.js';

document.addEventListener('DOMContentLoaded', function() {
    const sesionActual = localStorage.getItem('sesionActual');
    
    if (!sesionActual) {
        window.location.href = '../Login/login.html';
        return;
    }
    
    let usuario = JSON.parse(sesionActual);
    let filtroActual = 'todos';
    
    const transactionList = document.getElementById('transactionList');
    const transactionsCount = document.getElementById('transactionsCount');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const exportBtn = document.getElementById('exportBtn');
    
    function obtenerUsuarioActualizado() {
        const usuarios = localStorage.getItem('usuarios');
        if (usuarios) {
            const todosUsuarios = JSON.parse(usuarios);
            const usuarioActualizado = todosUsuarios.find(u => u.id === usuario.id);
            if (usuarioActualizado) {
                usuario = usuarioActualizado;
                localStorage.setItem('sesionActual', JSON.stringify(usuario));
            }
        }
        return usuario;
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
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaSemana = dias[fecha.getDay()];
        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];
        const año = fecha.getFullYear();
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${diaSemana} ${dia} de ${mes} de ${año} • ${hora}:${minutos}`;
    }
    
    function getTipoLegible(tipo) {
        const tipos = {
            [TipoMovimiento.CONSIGNACION]: 'Consignación',
            [TipoMovimiento.RETIRO]: 'Retiro',
            [TipoMovimiento.TRANSFERENCIA_OUT]: 'Transferencia enviada',
            [TipoMovimiento.TRANSFERENCIA_IN]: 'Transferencia recibida',
            [TipoMovimiento.COMPRA_TC]: 'Compra con tarjeta',
            [TipoMovimiento.PAGO_TC]: 'Pago tarjeta'
        };
        return tipos[tipo] || tipo;
    }
    
    function getIconoYColor(movimiento) {
        if (movimiento.tipo === TipoMovimiento.CONSIGNACION) {
            return { icono: '⬇', clase: 'green' };
        }
        if (movimiento.tipo === TipoMovimiento.RETIRO) {
            return { icono: '⬆', clase: 'orange' };
        }
        if (movimiento.tipo === TipoMovimiento.TRANSFERENCIA_OUT) {
            return { icono: '⇄', clase: 'purple' };
        }
        if (movimiento.tipo === TipoMovimiento.TRANSFERENCIA_IN) {
            return { icono: '⇄', clase: 'green' };
        }
        if (movimiento.tipo === TipoMovimiento.COMPRA_TC) {
            return { icono: '💳', clase: 'pink' };
        }
        if (movimiento.tipo === TipoMovimiento.PAGO_TC) {
            return { icono: '💳', clase: 'green' };
        }
        if (movimiento.tipo === TipoMovimiento.INTERES) {
            return { icono: '../IMAGENES/INTERES.png', clase: 'blue', esImagen: true };
        }
        return { icono: '•', clase: 'gray' };
    }
    
    function obtenerTodosMovimientos() {
        const usuarioActual = obtenerUsuarioActualizado();
        let todosMovimientos = [];
        
        if (usuarioActual.cuentas && usuarioActual.cuentas.length > 0) {
            usuarioActual.cuentas.forEach(function(cuenta) {
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
        }
        
        if (usuarioActual.tarjetas && usuarioActual.tarjetas.length > 0) {
            usuarioActual.tarjetas.forEach(function(tarjeta) {
                if (tarjeta.movimientos && tarjeta.movimientos.length > 0) {
                    tarjeta.movimientos.forEach(function(mov) {
                        todosMovimientos.push({
                            ...mov,
                            numeroTarjeta: tarjeta.numeroTarjeta,
                            tipoCuenta: 'Tarjeta Crédito'
                        });
                    });
                }
            });
        }
        
        todosMovimientos.sort(function(a, b) {
            return new Date(b.fechaHora) - new Date(a.fechaHora);
        });
        
        return todosMovimientos;
    }
    
    function filtrarMovimientos(movimientos, filtro) {
        if (filtro === 'todos') return movimientos;
        
        if (filtro === 'CONSIGNACION') {
            return movimientos.filter(function(mov) {
                return mov.tipo === TipoMovimiento.CONSIGNACION;
            });
        }
        if (filtro === 'RETIRO') {
            return movimientos.filter(function(mov) {
                return mov.tipo === TipoMovimiento.RETIRO;
            });
        }
        if (filtro === 'TRANSFERENCIA') {
            return movimientos.filter(function(mov) {
                return mov.tipo === TipoMovimiento.TRANSFERENCIA_OUT || mov.tipo === TipoMovimiento.TRANSFERENCIA_IN;
            });
        }
        if (filtro === 'TARJETA') {
            return movimientos.filter(function(mov) {
                return mov.tipo === TipoMovimiento.COMPRA_TC || mov.tipo === TipoMovimiento.PAGO_TC;
            });
        }
        
        return movimientos;
    }
    
    function renderizarMovimientos() {
        const todosMovimientos = obtenerTodosMovimientos();
        const movimientosFiltrados = filtrarMovimientos(todosMovimientos, filtroActual);
        
        transactionsCount.textContent = movimientosFiltrados.length + ' transacciones encontradas';
        
        if (movimientosFiltrados.length === 0) {
            transactionList.innerHTML = '<div class="transaction-item">No hay movimientos para mostrar. Realiza una consignación o retiro primero.</div>';
            return;
        }
        
        transactionList.innerHTML = '';
        
        movimientosFiltrados.forEach(function(movimiento) {
            const { icono, clase, esImagen } = getIconoYColor(movimiento);
            const esIngreso = movimiento.tipo === TipoMovimiento.CONSIGNACION || 
                             movimiento.tipo === TipoMovimiento.TRANSFERENCIA_IN ||
                             movimiento.tipo === TipoMovimiento.PAGO_TC;
            const signo = esIngreso ? '+' : '-';
            const claseAmount = esIngreso ? 'green' : 'red';
            const fechaFormateada = formatearFecha(movimiento.fechaHora);
            
            let infoCuenta = '';
            if (movimiento.numeroCuenta) {
                const numeroOculto = '****' + movimiento.numeroCuenta.slice(-4);
                infoCuenta = movimiento.tipoCuenta + ' ' + numeroOculto;
            } else if (movimiento.numeroTarjeta) {
                const numeroOculto = '****' + movimiento.numeroTarjeta.slice(-4);
                infoCuenta = 'Tarjeta ' + numeroOculto;
            }
            
            const item = document.createElement('div');
            item.className = 'transaction-item';
            item.innerHTML = `
                <div class="transaction-icon ${clase}">
                    ${esImagen ? `<img src="${icono}" alt="Interés" style="width:50px;height:50px;object-fit:contain;">` : icono}
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${getTipoLegible(movimiento.tipo)}</div>
                    <div class="transaction-meta">${fechaFormateada} • ${infoCuenta}</div>
                    ${movimiento.descripcion ? '<div style="font-size: 12px; color: #666; margin-top: 5px;">' + movimiento.descripcion + '</div>' : ''}
                </div>
                <div class="transaction-amount">
                    <div class="amount ${claseAmount}">${signo} ${formatearMoneda(movimiento.valor)}</div>
                    <div class="balance">Saldo: ${formatearMoneda(movimiento.saldoPosterior)}</div>
                </div>
            `;
            transactionList.appendChild(item);
        });
    }
    
    filterButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterButtons.forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            filtroActual = btn.getAttribute('data-filtro');
            renderizarMovimientos();
        });
    });
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const todosMovimientos = obtenerTodosMovimientos();
            if (todosMovimientos.length === 0) {
                alert('No hay movimientos para exportar');
                return;
            }
            
            let csv = 'Fecha,Tipo,Valor,Saldo Posterior,Descripcion,Cuenta\n';
            todosMovimientos.forEach(function(mov) {
                const fecha = new Date(mov.fechaHora).toLocaleString('es-CO');
                const tipo = getTipoLegible(mov.tipo);
                csv += '"' + fecha + '","' + tipo + '",' + mov.valor + ',' + mov.saldoPosterior + ',"' + (mov.descripcion || '') + '","' + (mov.numeroCuenta || mov.numeroTarjeta || '') + '"\n';
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'movimientos_' + new Date().toISOString().slice(0,10) + '.csv';
            a.click();
            URL.revokeObjectURL(url);
            
            alert('Exportación completada');
        });
    }

    document.getElementById('backLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '../Principal/principal.html';
    });
    
    document.getElementById('logoutLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('sesionActual');
        window.location.href = '../LandingPage/landingPage.html';
    });
    
    document.getElementById('perfilLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '../Perfil/perfil.html';
    });
    
    renderizarMovimientos();
});