const BITS_PER_BYTE = 8;
const MAX_BYTES_PER_NUMBER = 4;  // supporting up to long, but not long long
const MAX_NUMBER = (() => {
  let max = 1;
  for (let i = 0; i < MAX_BYTES_PER_NUMBER * BITS_PER_BYTE; i++) {
    max <<= 1;
    max += 1;
  }
  return max >>> 0;
})();

export function toUint8Array(value: number): Uint8Array {
  if (value > MAX_NUMBER) {
    throw Error(`Only 4 bytes per number are supported. The biggest number is ${MAX_NUMBER}, ${value} was given.`);
  }

  let upperBound = MAX_BYTES_PER_NUMBER;
  for (let i = 1; i < MAX_BYTES_PER_NUMBER; i++) {
    const bitValue = value >>> (MAX_BYTES_PER_NUMBER * BITS_PER_BYTE - (i * BITS_PER_BYTE));
    if (bitValue > 0) {
      break;
    }
    upperBound -= 1;
  }

  const data = new Uint8Array(upperBound);
  for (let i = upperBound - 1; i >= 0; i--) {
    data.set([value % (0xFF + 1)], i);
    value = Math.floor(value / (0xFF + 1));
  }
  return data;
}