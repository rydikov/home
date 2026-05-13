import { SunCalc } from '#wbm/suncalc'
import { Location, WbDali } from '#wbm/global-devices'

const MIN_TEMP_K = 2000
const MAX_TEMP_K = 6500

const CIVIL_TWILIGHT_ANGLE = -6
const MAX_SUN_ANGLE = 55

function smoothstep(x: number): number {
  return x * x * (3 - 2 * x)
}

// calculateHCLTemperature(lat, lon): number
// Расчёт цветовой температуры (K) для HCL по углу высоты Солнца.
// lat - широта.
// lon - долгота.
// Значение нормализуется между гражданскими сумерками и максимальным углом Солнца,
// затем сглаживается S-кривой smoothstep.
function calculateHCLTemperature(lat: number, lon: number): number {
  const now = new Date()
  const position = SunCalc.getPosition(now, lat, lon)

  // Угол высоты Солнца в градусах
  const altitudeDeg = position.altitude * 180 / Math.PI

  log.debug('Угол Солнца: {} °'.format(Math.round(altitudeDeg * 100) / 100))

  // Нормализуем угол Солнца в диапазон 0..1:
  // 0 соответствует гражданским сумеркам и ниже, 1 соответствует максимальному углу Солнца и выше.
  let normalized = (altitudeDeg - CIVIL_TWILIGHT_ANGLE) / (MAX_SUN_ANGLE - CIVIL_TWILIGHT_ANGLE)

  normalized = Math.max(0, Math.min(1, normalized))

  // Плавная S-кривая
  normalized = smoothstep(normalized)

  return Math.round(
    MIN_TEMP_K + (MAX_TEMP_K - MIN_TEMP_K) * normalized
  )
}

defineRule('HCL_DALI_GROUP_00_TEMPERATURE', {
  when: cron('@every 300s'),
  then: function () {
    const colorTempK = calculateHCLTemperature(Location.latitude, Location.longitude)
    log.debug('Set HCL Temperature: {} K'.format(colorTempK))
    WbDali.setColourTemperature(3, '00', colorTempK)
  },
})
