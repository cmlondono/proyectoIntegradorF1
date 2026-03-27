class CuentaAhorros extends Cuenta {
  constructor(numeroCuenta, saldo, tasaInteres) {
    super(numeroCuenta, saldo);
    this.tasaInteres = tasaInteres;
  }

  retirar(monto) {
    if (monto > this.saldo) {
      throw new Error("Fondos insuficientes");
    }
    this.saldo -= monto;
    this.registrarMovimiento("RETIRO", monto);
  }

  aplicarIntereses() {
    const interes = this.calcularIntereses();
    this.saldo += interes;
  }

  calcularIntereses() {
    return this.saldo * this.tasaInteres;
  }
}