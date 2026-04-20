import { EstadoCuenta } from './enums/Tipos.js';
import Movimiento from './Movimiento.js';
import { TipoMovimiento } from './enums/Tipos.js';

class Cuenta {
    constructor(numeroCuenta, saldoInicial = 0) {
        if (this.constructor === Cuenta) {
            throw new Error('Cuenta es una clase abstracta, no se puede instanciar');
        }
        this.numeroCuenta = numeroCuenta;
        this.saldo = saldoInicial;
        this.fechaApertura = new Date();
        this.estado = EstadoCuenta.ACTIVA;
        this.movimientos = [];
    }

    // Consultar saldo
    consultarSaldo() {
        if (this.estado !== EstadoCuenta.ACTIVA) {
            throw new Error('❌ Cuenta no está activa');
        }
        return this.saldo;
    }

    // Consignar dinero
    consignar(monto) {
        if (this.estado !== EstadoCuenta.ACTIVA) {
            throw new Error('❌ Cuenta no está activa');
        }
        if (monto <= 0) {
            throw new Error('❌ El monto a consignar debe ser mayor a 0');
        }
        
        this.saldo += monto;
        this.registrarMovimiento(
            TipoMovimiento.CONSIGNACION,
            monto,
            `Consignación por $${monto.toLocaleString()}`
        );
    }

    // Retirar dinero (método abstracto - será implementado por las hijas)
    retirar(monto) {
        throw new Error('Método retirar debe ser implementado por la clase hija');
    }

    // Registrar movimiento (polimorfismo)
    registrarMovimiento(tipo, valor, descripcion = '') {
        const movimiento = new Movimiento(tipo, valor, this.saldo, descripcion);
        this.movimientos.push(movimiento);
    }

    // Obtener todos los movimientos
    obtenerMovimientos() {
        return this.movimientos.sort((a, b) => b.fechaHora - a.fechaHora);
    }

    // Obtener saldo formateado
    getSaldoFormateado() {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(this.saldo);
    }

    // Cambiar estado de la cuenta
    cambiarEstado(nuevoEstado) {
        this.estado = nuevoEstado;
    }
}

export default Cuenta;