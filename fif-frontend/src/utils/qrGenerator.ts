interface VersionSpec {
  version: number;
  size: number;
  dataCodewords: number;
  ecCodewords: number;
  alignment: number[];
}

const VERSIONES_QR: VersionSpec[] = [
  { version: 1, size: 21, dataCodewords: 19, ecCodewords: 7, alignment: [] },
  { version: 2, size: 25, dataCodewords: 34, ecCodewords: 10, alignment: [6, 18] },
  { version: 3, size: 29, dataCodewords: 55, ecCodewords: 15, alignment: [6, 22] },
  { version: 4, size: 33, dataCodewords: 80, ecCodewords: 20, alignment: [6, 26] },
  { version: 5, size: 37, dataCodewords: 108, ecCodewords: 26, alignment: [6, 30] },
];

// Formato precalculado (BCH + XOR 0x5412) para ECC Nivel L (01) y Mascara 0 (000): 0x77c4
const FORMAT_BITS_L_MASK0 = 0x77c4;

function gfMul(a: number, b: number, exp: Uint8Array, log: Uint8Array): number {
  if (a === 0 || b === 0) return 0;
  return exp[(log[a] + log[b]) % 255];
}

function crearTablasGf(): { exp: Uint8Array; log: Uint8Array } {
  const exp = new Uint8Array(512);
  const log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    exp[i] = exp[i - 255];
  }
  return { exp, log };
}

function calcularReedSolomon(datos: number[], ecLen: number): number[] {
  const { exp, log } = crearTablasGf();
  let gen = [1];
  for (let i = 0; i < ecLen; i++) {
    const next = new Array(gen.length + 1).fill(0);
    const factor = exp[i];
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], factor, exp, log);
    }
    gen = next;
  }

  const res = new Array(ecLen).fill(0);
  for (const byte of datos) {
    const factor = byte ^ res[0];
    res.shift();
    res.push(0);
    for (let i = 0; i < ecLen; i++) {
      res[i] ^= gfMul(gen[i + 1], factor, exp, log);
    }
  }
  return res;
}

function codificarDatos(bytes: Uint8Array, dataCodewords: number): number[] {
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };

  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  const maxBits = dataCodewords * 8;
  const term = Math.min(4, maxBits - bits.length);
  pushBits(0, term);
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }

  const pads = [0xec, 0x11];
  let padIdx = 0;
  while (codewords.length < dataCodewords) {
    codewords.push(pads[padIdx % 2]);
    padIdx++;
  }
  return codewords;
}

function colocarFinder(matriz: (boolean | null)[][], reservado: boolean[][], r: number, c: number) {
  const size = matriz.length;
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const y = r + dy;
      const x = c + dx;
      if (y < 0 || y >= size || x < 0 || x >= size) continue;
      const enBorde = dy === -1 || dy === 7 || dx === -1 || dx === 7;
      const enMarco = dy === 0 || dy === 6 || dx === 0 || dx === 6;
      const enCentro = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
      matriz[y][x] = !enBorde && (enMarco || enCentro);
      reservado[y][x] = true;
    }
  }
}

function colocarAlignment(matriz: (boolean | null)[][], reservado: boolean[][], cy: number, cx: number) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const dist = Math.max(Math.abs(dy), Math.abs(dx));
      matriz[cy + dy][cx + dx] = dist !== 1;
      reservado[cy + dy][cx + dx] = true;
    }
  }
}

export function generarMatrizQr(texto: string): boolean[][] {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(texto);
  const spec =
    VERSIONES_QR.find((v) => rawBytes.length + 2 <= v.dataCodewords) ??
    VERSIONES_QR[VERSIONES_QR.length - 1];
  const bytes = rawBytes.slice(0, spec.dataCodewords - 2);

  const dataCw = codificarDatos(bytes, spec.dataCodewords);
  const ecCw = calcularReedSolomon(dataCw, spec.ecCodewords);
  const todosCw = [...dataCw, ...ecCw];

  const { size, alignment } = spec;
  const matriz: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const reservado: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  colocarFinder(matriz, reservado, 0, 0);
  colocarFinder(matriz, reservado, 0, size - 7);
  colocarFinder(matriz, reservado, size - 7, 0);

  if (alignment.length > 0) {
    for (const r of alignment) {
      for (const c of alignment) {
        if (!reservado[r][c]) colocarAlignment(matriz, reservado, r, c);
      }
    }
  }

  for (let i = 8; i < size - 8; i++) {
    if (!reservado[6][i]) {
      matriz[6][i] = i % 2 === 0;
      reservado[6][i] = true;
    }
    if (!reservado[i][6]) {
      matriz[i][6] = i % 2 === 0;
      reservado[i][6] = true;
    }
  }

  for (let i = 0; i < 9; i++) {
    if (i < size) {
      reservado[8][i] = true;
      reservado[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    reservado[8][size - 1 - i] = true;
    reservado[size - 1 - i][8] = true;
  }
  matriz[size - 8][8] = true;
  reservado[size - 8][8] = true;

  const bits: number[] = [];
  for (const cw of todosCw) {
    for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);
  }

  let bitIdx = 0;
  let arriba = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col--;
    for (let step = 0; step < size; step++) {
      const row = arriba ? size - 1 - step : step;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (!reservado[row][c]) {
          const bit = bitIdx < bits.length ? bits[bitIdx++] === 1 : false;
          const mascara = (row + c) % 2 === 0;
          matriz[row][c] = mascara ? !bit : bit;
        }
      }
    }
    arriba = !arriba;
  }

  for (let i = 0; i < 15; i++) {
    const bit = ((FORMAT_BITS_L_MASK0 >> i) & 1) === 1;
    if (i < 6) matriz[i][8] = bit;
    else if (i < 8) matriz[i + 1][8] = bit;
    else matriz[size - 15 + i][8] = bit;

    if (i < 8) matriz[8][size - 1 - i] = bit;
    else if (i < 9) matriz[8][15 - i] = bit;
    else matriz[8][15 - i - 1] = bit;
  }

  return matriz.map((fila) => fila.map((celda) => Boolean(celda)));
}
