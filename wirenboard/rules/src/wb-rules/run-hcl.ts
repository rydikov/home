import { SunCalc } from '#wbm/suncalc'
import { Location, WbDali } from '#wbm/global-devices'

const MIN_TEMP_K = 2700
const MAX_TEMP_K = 6500

const CIVIL_TWILIGHT_ANGLE = -6
const MAX_SUN_ANGLE = 55

// Нелинейное сглаживание
function smoothstep(x: number): number {
  return x * x * (3 - 2 * x)
}

// sunAltitudeToTemperature(altitudeDeg): number
// Преобразует угол Солнца над горизонтом в цветовую температуру (K).
// altitudeDeg:
//   Угол Солнца над горизонтом в градусах.
//   -6° и ниже -> MIN_TEMP_K
//   55° и выше -> MAX_TEMP_K
function sunAltitudeToTemperature(altitudeDeg: number): number {
  let normalized = (altitudeDeg - CIVIL_TWILIGHT_ANGLE) / (MAX_SUN_ANGLE - CIVIL_TWILIGHT_ANGLE)

  normalized = Math.max(0, Math.min(1, normalized))

  normalized = smoothstep(normalized)

  return Math.round(
    MIN_TEMP_K + (MAX_TEMP_K - MIN_TEMP_K) * normalized
  )
}

function calculateHCLTemperature(lat: number, lon: number): number {
  const now = new Date()
  const position = SunCalc.getPosition(now, lat, lon)

  const altitudeDeg = position.altitude * 180 / Math.PI

  log.debug('Угол Солнца: {} °'.format(Math.round(altitudeDeg * 100) / 100))

  return sunAltitudeToTemperature(altitudeDeg)
}

let prevTemp = -1
const MIN_TEMP_DELTA_K = 20

// HCL применяется ко всем устройствам в группе 00
// Важно чтобы в настройках балластво были установлены FADE TIME 3-5 сек
// Температура пишется в устройство независимо от того включено оно или нет
defineRule('HCL_DALI_GROUP_00_TEMPERATURE', {
  when: cron('@every 60s'),
  then: function () {
    const colorTempK = calculateHCLTemperature(Location.latitude, Location.longitude)

    // Не отправляем DALI команду, если разница в 20K
    if (Math.abs(colorTempK - prevTemp) >= MIN_TEMP_DELTA_K) {
      prevTemp = colorTempK
      log.debug('Set HCL Temperature: {} K'.format(colorTempK))
      WbDali.setColourTemperature(3, '00', colorTempK)
    }
    else {
      log.debug('Skip HCL Temperature: {} K, previous: {} K'.format(colorTempK, prevTemp))
    }
  },
})
