import { TipoMovimiento } from './enums/Tipos.js';

class Movimiento {
    constructor(tipo, valor, saldoPosterior, descripcion = '') {
        this.id = Date.now() + Math.random();
        this.fechaHora = new Date();
        this.tipo = tipo;
        this.valor = valor;
        this.saldoPosterior = saldoPosterior;
        this.descripcion = descripcion;
    }

    // Método para obtener fecha formateada
    getFechaFormateada() {
        return this.fechaHora.toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    // Método para obtener tipo 
    getTipoLegible() {
        const tipos = {
            [TipoMovimiento.CONSIGNACION]: 'Consignación',
            [TipoMovimiento.RETIRO]: 'Retiro',
            [TipoMovimiento.TRANSFERENCIA_OUT]: 'Transferencia enviada',
            [TipoMovimiento.TRANSFERENCIA_IN]: 'Transferencia recibida',
            [TipoMovimiento.COMPRA_TC]: 'Compra con Tarjeta',
            [TipoMovimiento.PAGO_TC]: 'Pago Tarjeta'
        };
        return tipos[this.tipo] || this.tipo;
    }

    // Método para obtener valor con formato
    getValorFormateado() {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(this.valor);
    }

    // Método para obtener saldo posterior formateado
    getSaldoPosteriorFormateado() {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(this.saldoPosterior);
    }
}

export default Movimiento;