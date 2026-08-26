const { SunCalc } = require('suncalc') as typeof import('#wbm/suncalc')

const MIN_TEMP_K = 2700
const MAX_TEMP_K = 6500

const MIN_BRIGHTNESS = 1
const MAX_BRIGHTNESS = 70

const CIVIL_TWILIGHT_ANGLE = -6
const MAX_SUN_ANGLE = 55

// Нелинейное сглаживание
function smoothstep(x: number): number {
  return x * x * (3 - 2 * x)
}

function normalizeSunAltitude(altitudeDeg: number): number {
  let normalized = (altitudeDeg - CIVIL_TWILIGHT_ANGLE) / (MAX_SUN_ANGLE - CIVIL_TWILIGHT_ANGLE)

  normalized = Math.max(0, Math.min(1, normalized))

  return smoothstep(normalized)
}

// Преобразует угол Солнца над горизонтом в цветовую температуру (K).
// -6° и ниже -> MIN_TEMP_K
// 55° и выше -> MAX_TEMP_K
function sunAltitudeToTemperature(altitudeDeg: number): number {
  const normalized = normalizeSunAltitude(altitudeDeg)

  return Math.round(
    MIN_TEMP_K + (MAX_TEMP_K - MIN_TEMP_K) * normalized
  )
}

// Преобразует угол Солнца над горизонтом в яркость (%).
// -6° и ниже -> MIN_BRIGHTNESS
// 55° и выше -> MAX_BRIGHTNESS
function sunAltitudeToBrightness(altitudeDeg: number): number {
  const normalized = normalizeSunAltitude(altitudeDeg)

  return Math.round(
    MIN_BRIGHTNESS + (MAX_BRIGHTNESS - MIN_BRIGHTNESS) * normalized
  )
}

function getSunAltitudeDeg(lat: number, lon: number): number {
  const now = new Date()
  const position = SunCalc.getPosition(now, lat, lon)

  return position.altitude * 180 / Math.PI
}

export function calculateHCLTemperature(lat: number, lon: number): number {
  const altitudeDeg = getSunAltitudeDeg(lat, lon)

  log.debug('Угол Солнца: {} °'.format(Math.round(altitudeDeg * 100) / 100))

  return sunAltitudeToTemperature(altitudeDeg)
}

export function calculateHCLBrightness(lat: number, lon: number): number {
  const altitudeDeg = getSunAltitudeDeg(lat, lon)

  log.debug('Угол Солнца: {} °'.format(Math.round(altitudeDeg * 100) / 100))

  return sunAltitudeToBrightness(altitudeDeg)
}
