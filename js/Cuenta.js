class Cuenta {
  constructor(numeroCuenta, saldo = 0, fechaApertura = new Date(), estado = "ACTIVA") {
    this.numeroCuenta = numeroCuenta;
    this.saldo = saldo;
    this.fechaApertura = fechaApertura;
    this.estado = estado;
    this.movimientos = [];
  }

  consultarSaldo() {
    return this.saldo;
  }

  consignar(monto) {
    this.saldo += monto;
    this.registrarMovimiento("CONSIGNACION", monto);
  }

  retirar(monto) {
    throw new Error("Método abstracto: implementar en subclases");
  }

  obtenerMovimientos() {
    return this.movimientos;
  }

  registrarMovimiento(tipo, valor) {
    const movimiento = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      tipo,
      valor,
      this.saldo
    );
    this.movimientos.push(movimiento);
  }
}