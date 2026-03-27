class Movimiento {
  constructor(id, fechaHora, tipo, valor, saldoPosterior, descripcion = "") {
    this.id = id;
    this.fechaHora = fechaHora;
    this.tipo = tipo;
    this.valor = valor;
    this.saldoPosterior = saldoPosterior;
    this.descripcion = descripcion;
  }
}