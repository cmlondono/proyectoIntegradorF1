import Cuenta from './Cuenta.js';
import { TipoMovimiento } from './enums/Tipos.js';

class CuentaCorriente extends Cuenta {
    constructor(numeroCuenta, saldoInicial = 0) {
        super(numeroCuenta, saldoInicial);
        this.porcentajeSobregiro = 0.20; // 20% de sobregiro
    }

    // Calcular límite de retiro (saldo + 20%)
    getLimiteRetiro() {
        return this.saldo + (this.saldo * this.porcentajeSobregiro);
    }

    //retirar en cuenta corriente
    retirar(monto) {
        if (this.estado !== 'ACTIVA') {
            throw new Error('Cuenta no está activa');
        }
        if (monto <= 0) {
            throw new Error('El monto a retirar debe ser mayor a 0');
        }

        const limite = this.getLimiteRetiro();
        
        if (monto > limite) {
            throw new Error(`Límite excedido. Puede retirar hasta: ${this.getLimiteFormateado()}`);
        }

        const usoSobregiro = monto > this.saldo;
        const montoSobregiro = usoSobregiro ? monto - this.saldo : 0;

        this.saldo -= monto;
        
        let descripcion = `Retiro por $${monto.toLocaleString()}`;
        if (usoSobregiro) {
            descripcion += ` (incluye sobregiro de $${montoSobregiro.toLocaleString()})`;
        }

        this.registrarMovimiento(
            TipoMovimiento.RETIRO,
            monto,
            descripcion
        );

        return {
            exito: true,
            mensaje: `Retiro exitoso. Nuevo saldo: ${this.getSaldoFormateado()}`,
            usoSobregiro: usoSobregiro,
            montoSobregiro: montoSobregiro
        };
    }

    // Transferir dinero a otra cuenta
    transferir(cuentaDestino, monto) {
        if (this.estado !== 'ACTIVA') {
            throw new Error('Cuenta origen no está activa');
        }
        if (cuentaDestino.estado !== 'ACTIVA') {
            throw new Error('Cuenta destino no está activa');
        }
        if (monto <= 0) {
            throw new Error('El monto a transferir debe ser mayor a 0');
        }

        const limite = this.getLimiteRetiro();
        
        if (monto > limite) {
            throw new Error(`aldo insuficiente. Límite disponible: ${this.getLimiteFormateado()}`);
        }

        // Realizar transferencia
        this.saldo -= monto;
        cuentaDestino.saldo += monto;

        // Registrar movimiento de salida
        this.registrarMovimiento(
            TipoMovimiento.TRANSFERENCIA_OUT,
            monto,
            `Transferencia a cuenta ${cuentaDestino.numeroCuenta} por $${monto.toLocaleString()}`
        );

        // Registrar movimiento de entrada en destino
        cuentaDestino.registrarMovimiento(
            TipoMovimiento.TRANSFERENCIA_IN,
            monto,
            `Transferencia de cuenta ${this.numeroCuenta} por $${monto.toLocaleString()}`
        );

        return {
            exito: true,
            mensaje: `Transferencia exitosa a ${cuentaDestino.numeroCuenta}. Nuevo saldo: ${this.getSaldoFormateado()}`
        };
    }

    // Obtener límite formateado
    getLimiteFormateado() {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(this.getLimiteRetiro());
    }

    // Obtener información de la cuenta
    getInfo() {
        return {
            tipo: 'Cuenta Corriente',
            numero: this.numeroCuenta,
            saldo: this.saldo,
            sobregiro: '20% del saldo',
            limiteRetiro: this.getLimiteRetiro()
        };
    }
}

export default CuentaCorriente;