const BITS_PER_BYTE = 8;
const MAX_BYTES_PER_NUMBER = 4;  // supporting up to long, but not long long
const MAX_NUMBER = determineMaxNumber(MAX_BYTES_PER_NUMBER);

export function toUint8Array(value: number, fixLengthBytes?: number): Uint8Array {
  if (value > MAX_NUMBER) {
    throw Error(`Only 4 bytes per number are supported. The biggest number is ${MAX_NUMBER}, ${value} was given.`);
  }

  const upperBound = determineUpperBound(value);
  const paddingDiff = fixLengthBytes ? fixLengthBytes - upperBound : 0;

  if (paddingDiff < 0) {
    throw Error(`Cannot fix byte length. Given number too big. For given length of ${fixLengthBytes} bytes the biggest number is ${determineMaxNumber(fixLengthBytes)}, ${value} was given.`);  // TODO more detail in output
  }

  const data = new Uint8Array(fixLengthBytes ? fixLengthBytes : upperBound);
  for (let i = upperBound - 1; i >= 0; i--) {
    data.set([value % (0xFF + 1)], i + paddingDiff);
    value = Math.floor(value / (0xFF + 1));
  }
  return data;
}

function determineUpperBound(value: number) {
  let upperBound = MAX_BYTES_PER_NUMBER;
  for (let i = 1; i < MAX_BYTES_PER_NUMBER; i++) {
    const bitValue = value >>> (MAX_BYTES_PER_NUMBER * BITS_PER_BYTE - (i * BITS_PER_BYTE));
    if (bitValue > 0) {
      break;
    }
    upperBound -= 1;
  }
  return upperBound;
}

function determineMaxNumber(bytes: number) {
  let max = 1;
  for (let i = 0; i < bytes * BITS_PER_BYTE; i++) {
    max <<= 1;
    max += 1;
  }
  return max >>> 0;
}
