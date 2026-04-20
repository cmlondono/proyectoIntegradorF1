import Movimiento from './Movimiento.js';
import { TipoMovimiento, EstadoCuenta } from './enums/Tipos.js';

class TarjetaCredito {
    constructor(numeroTarjeta, cupoCredito, usuarioId) {
        this.numeroTarjeta = numeroTarjeta;
        this.cupo = cupoCredito;
        this.deuda = 0;
        this.usuarioId = usuarioId;
        this.estado = EstadoCuenta.ACTIVA;
        this.fechaApertura = new Date();
        this.movimientos = [];
    }

    // Consultar saldo disponible
    consultarSaldoDisponible() {
        if (this.estado !== EstadoCuenta.ACTIVA) {
            throw new Error('❌ Tarjeta no está activa');
        }
        return this.cupo - this.deuda;
    }

    // Consultar deuda actual
    consultarDeuda() {
        return this.deuda;
    }

    // Realizar compra a cuotas
    comprar(monto, cuotas = 1) {
        if (this.estado !== EstadoCuenta.ACTIVA) {
            throw new Error('❌ Tarjeta no está activa');
        }
        if (monto <= 0) {
            throw new Error('❌ El monto de compra debe ser mayor a 0');
        }
        if (cuotas < 1) {
            throw new Error('❌ El número de cuotas debe ser al menos 1');
        }
        if (monto > this.consultarSaldoDisponible()) {
            throw new Error(`❌ Cupo insuficiente. Disponible: ${this.getSaldoDisponibleFormateado()}`);
        }

        // Calcular tasa de interés según número de cuotas
        const tasaMensual = this.calcularTasaInteres(cuotas);
        
        // Calcular cuota mensual
        const cuotaMensual = this.calcularCuotaMensual(monto, tasaMensual, cuotas);
        
        // Calcular interés total
        const interesTotal = (cuotaMensual * cuotas) - monto;
        
        // Actualizar deuda
        this.deuda += monto + interesTotal;

        // Registrar movimiento
        this.registrarMovimiento(
            TipoMovimiento.COMPRA_TC,
            monto,
            `Compra de $${monto.toLocaleString()} en ${cuotas} cuotas - Cuota mensual: ${this.formatearMoneda(cuotaMensual)}`
        );

        return {
            exito: true,
            monto: monto,
            cuotas: cuotas,
            tasaMensual: tasaMensual * 100,
            cuotaMensual: cuotaMensual,
            interesTotal: interesTotal,
            deudaTotal: this.deuda,
            saldoDisponible: this.consultarSaldoDisponible()
        };
    }

    // Calcular tasa de interés según número de cuotas
    calcularTasaInteres(cuotas) {
        if (cuotas <= 2) {
            return 0; // 0% interés
        } else if (cuotas >= 3 && cuotas <= 6) {
            return 0.019; // 1.9% mensual
        } else {
            return 0.023; // 2.3% mensual
        }
    }

    // Calcular cuota mensual usando fórmula de interés compuesto
    calcularCuotaMensual(capital, tasaMensual, cuotas) {
        if (tasaMensual === 0) {
            return capital / cuotas;
        }
        
        // Fórmula: Cuota = (Capital × tasa) / (1 − (1 + tasa)^(-n))
        const cuota = (capital * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -cuotas));
        return Math.round(cuota * 100) / 100;
    }

    // Pagar deuda
    pagar(monto) {
        if (this.estado !== EstadoCuenta.ACTIVA) {
            throw new Error('❌ Tarjeta no está activa');
        }
        if (monto <= 0) {
            throw new Error('❌ El monto de pago debe ser mayor a 0');
        }
        if (monto > this.deuda) {
            throw new Error(`❌ El pago excede la deuda actual. Deuda: ${this.getDeudaFormateado()}`);
        }

        this.deuda -= monto;

        this.registrarMovimiento(
            TipoMovimiento.PAGO_TC,
            monto,
            `Pago a tarjeta de crédito por $${monto.toLocaleString()}`
        );

        return {
            exito: true,
            mensaje: `✅ Pago exitoso. Deuda restante: ${this.getDeudaFormateado()}`,
            nuevaDeuda: this.deuda
        };
    }

    // Registrar movimiento
    registrarMovimiento(tipo, valor, descripcion = '') {
        const movimiento = new Movimiento(tipo, valor, this.consultarSaldoDisponible(), descripcion);
        this.movimientos.push(movimiento);
    }

    // Obtener movimientos
    obtenerMovimientos() {
        return this.movimientos.sort((a, b) => b.fechaHora - a.fechaHora);
    }

    // Métodos de formato
    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }

    getSaldoDisponibleFormateado() {
        return this.formatearMoneda(this.consultarSaldoDisponible());
    }

    getDeudaFormateado() {
        return this.formatearMoneda(this.deuda);
    }

    getCupoFormateado() {
        return this.formatearMoneda(this.cupo);
    }

    // Obtener información de la tarjeta
    getInfo() {
        return {
            tipo: 'Tarjeta de Crédito',
            numero: this.numeroTarjeta,
            cupo: this.cupo,
            deuda: this.deuda,
            disponible: this.consultarSaldoDisponible()
        };
    }
}

export default TarjetaCredito;