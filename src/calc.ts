export type BinaryOp = '+' | '-' | '*' | '/';

export function applyBinaryOp(a: number, b: number, op: BinaryOp): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) return 0;
      return a / b;
  }
}

export type UnaryOp = '1/x' | 'x²' | 'x³' | '√x';

export function applyUnaryOp(x: number, op: UnaryOp): number {
  switch (op) {
    case '1/x':
      return x !== 0 ? 1 / x : 0;
    case 'x²':
      return x * x;
    case 'x³':
      return x * x * x;
    case '√x':
      return x >= 0 ? Math.sqrt(x) : 0;
  }
}

export function safeParse(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

