export default class Tuple {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.map = this.map.bind(this);
  }

  map(f) {
    return new Tuple(this.a, f(this.b));
  }
}

export const tuple = (a, b) => new Tuple(a, b);
