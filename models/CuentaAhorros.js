import Cuenta from './Cuenta.js';
import { TipoMovimiento } from './enums/Tipos.js';

class CuentaAhorros extends Cuenta {
    constructor(numeroCuenta, saldoInicial = 0) {
        super(numeroCuenta, saldoInicial);
        this.tasaInteresMensual = 0.015; // 1.5% mensual
    }

    // Implementación específica para retirar en cuenta de ahorros
    retirar(monto) {
        if (this.estado !== 'ACTIVA') {
            throw new Error('❌ Cuenta no está activa');
        }
        if (monto <= 0) {
            throw new Error('❌ El monto a retirar debe ser mayor a 0');
        }

        // Aplicar interés antes del retiro
        const interes = this.calcularInteres();
        if (interes > 0) {
            this.saldo += interes;
            this.registrarMovimiento(
                TipoMovimiento.CONSIGNACION,
                interes,
                `Interés mensual aplicado: $${interes.toLocaleString()} (1.5%)`
            );
        }

        // Validar saldo suficiente después del interés
        if (monto > this.saldo) {
            throw new Error(`❌ Saldo insuficiente. Saldo actual: ${this.getSaldoFormateado()}`);
        }

        // Realizar retiro
        this.saldo -= monto;
        this.registrarMovimiento(
            TipoMovimiento.RETIRO,
            monto,
            `Retiro por $${monto.toLocaleString()}`
        );

        return {
            exito: true,
            mensaje: `✅ Retiro exitoso. Nuevo saldo: ${this.getSaldoFormateado()}`,
            interesAplicado: interes
        };
    }

    // Calcular interés mensual (1.5%)
    calcularInteres() {
        return this.saldo * this.tasaInteresMensual;
    }

    // Obtener información de la cuenta
    getInfo() {
        return {
            tipo: 'Cuenta de Ahorros',
            numero: this.numeroCuenta,
            saldo: this.saldo,
            tasaInteres: '1.5% mensual'
        };
    }
}

export default CuentaAhorros;