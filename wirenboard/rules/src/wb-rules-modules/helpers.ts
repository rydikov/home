// Переводим timestamp в формат DD.MM.YYYY HH:MM:SS
export function formatTimestampES5(last_seen: number) {
  const date = new Date(last_seen)

  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  // Дополняем нулями для красоты
  function pad(n: number) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return n < 10 ? '0' + n : n
  }

  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  return pad(day) + '.' + pad(month) + '.' + year + ' ' + pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
};

// Object.values(obj) for ES5
export function objectValues<T extends Record<string, unknown>>(obj: T): T[keyof T][] {
  const arr: T[keyof T][] = []
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      arr.push(obj[key])
    }
  }
  return arr
}

// return true if available
export function checkAvailability(
  last_seen: number,
  ttlSeconds = 3600 // 1 hour
): boolean {
  const tsNow = Date.now() / 1000 // convert to sec
  return tsNow - last_seen < ttlSeconds
}

/**
 * Переводит число в hex-строку в верхнем регистре.
 * Примеры:
 * - `toHex(10)` -> `0A`
 * - `toHex(255)` -> `FF`
 */
export function toHex(value: number): string {
  return leftPad(value.toString(16).toUpperCase(), 2, '0')
}

/**
 * Переводит число в двоичную строку.
 * Примеры:
 * - `toBinary(5)` -> `101`
 * - `toBinary(5, 8)` -> `00000101`
 */
export function toBinary(value: number, minLength = 0): string {
  const binary = value.toString(2)
  return minLength > 0 ? leftPad(binary, minLength, '0') : binary
}

/**
 * Переводит двоичную строку в hex-строку в верхнем регистре.
 * Примеры:
 * - `binaryToHex('1010')` -> `A`
 * - `binaryToHex('1010', 2)` -> `0A`
 */
export function binaryToHex(binary: string, minLength = 0): string {
  const hex = parseInt(binary, 2).toString(16).toUpperCase()
  return minLength > 0 ? leftPad(hex, minLength, '0') : hex
}

/**
 * Дополняет строку слева символом `fillChar`, пока длина не достигнет `minLength`.
 * Используется вместо `String.prototype.padStart` для совместимости с ES5/Duktape.
 */
function leftPad(value: string, minLength: number, fillChar: string): string {
  let result = value

  while (result.length < minLength) {
    result = fillChar + result
  }

  return result
}
