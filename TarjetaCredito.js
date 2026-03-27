class TarjetaCredito extends Cuenta {
  constructor(numeroCuenta, cupo) {
    super(numeroCuenta, 0);
    this.cupo = cupo;
    this.deuda = 0;
    this.numeroCuotas = 0;
  }

  retirar(monto) {
    return this.comprar(monto, 1);
  }

  comprar(monto, cuotas) {
    if (this.deuda + monto > this.cupo) {
      throw new Error("Cupo insuficiente");
    }
    this.deuda += monto;
    this.numeroCuotas = cuotas;
    this.registrarMovimiento("COMPRA", monto);
  }

  pagar(monto) {
    this.deuda -= monto;
    this.registrarMovimiento("PAGO", monto);
  }

  calcularTasa(cuotas) {
    return 0.02 * cuotas; // ejemplo
  }

  calcularCuotaMensual() {
    return this.deuda / this.numeroCuotas;
  }
}