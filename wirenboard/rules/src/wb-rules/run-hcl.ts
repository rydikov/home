import { SunCalc } from '#wbm/suncalc'
import { Location, WbDali } from '#wbm/global-devices'

// Глобальная переменная для хранения предыдущей температуры.
// До первого расчёта значение не задано, чтобы при старте/перезапуске правила
// сразу выставить текущую целевую температуру без сглаживания от фиксированного значения.
let prevTempK: number | undefined

// calculateHCLTemperature(lat, lon, smoothFactor, precision): number
// Расчёт цветовой температуры (K) для HCL с плавной регулировкой.
// lat - широта.
// lon - долгота.
// smoothFactor - коэффициент плавности (чем меньше, тем плавнее).
// precision - шаг округления в Кельвинах (например, 10 для кратных 10).
// Первый расчёт после старта выполняется без сглаживания, последующие расчёты
// плавно двигаются от предыдущей температуры к текущей целевой температуре.
function calculateHCLTemperature(lat: number, lon: number, smoothFactor: number, precision: number): number {
  const now = new Date()
  const position = SunCalc.getPosition(now, lat, lon)

  // Угол высоты Солнца в градусах
  const altitudeDeg = Math.round(position.altitude * (180 / Math.PI) * 100) / 100

  log.debug('Угол Солнца: {} °'.format(altitudeDeg))

  // Границы углов
  const dawnDuskAngle = -6 // начало рассвета/заката
  const sunriseSunsetAngle = 0 // горизонт
  const middayAngle = 60 // максимум угла (полдень)

  let targetTemp: number // целевая температура (без плавности)

  // Логика расчёта целевой температуры
  if (altitudeDeg < dawnDuskAngle) {
    targetTemp = 2200 // ночь
  }
  else if (altitudeDeg < sunriseSunsetAngle) {
    // рассвет/закат: 2200 → 3500 K
    targetTemp = 2200 + (3500 - 2200)
    * (altitudeDeg - dawnDuskAngle) / (sunriseSunsetAngle - dawnDuskAngle)
  }
  else if (altitudeDeg < middayAngle) {
    // утро/день: 3500 → 6500 K
    targetTemp = 3500 + (6500 - 3500)
    * (altitudeDeg - sunriseSunsetAngle) / (middayAngle - sunriseSunsetAngle)
  }
  else {
    targetTemp = 6500 // полдень и выше
  }

  log.debug('HCL target temperature: {} K'.format(Math.round(targetTemp / precision) * precision))

  const newTemp = prevTempK === undefined
    ? targetTemp
    // Плавный переход: взвешенное среднее между текущей и целевой температурой
    // чтобы не было заметного глазу скачка, и желательно не ставить время синхронизации больше 5 минут
    : prevTempK * (1 - smoothFactor) + targetTemp * smoothFactor

  // Обновляем предыдущее значение
  prevTempK = Math.round(newTemp)

  // Округляем до ближайшего кратного precision
  prevTempK = Math.round(prevTempK / precision) * precision

  // Ограничиваем диапазон
  return Math.max(2200, Math.min(6500, prevTempK))
}

defineRule('HCL_DALI_GROUP_00_TEMPERATURE', {
  when: cron('@every 300s'),
  then: function () {
    const colorTempK = calculateHCLTemperature(Location.latitude, Location.longitude, 0.15, 10)
    log.debug('Set HCL Temperature: {} K'.format(colorTempK))
    WbDali.setColourTemperature(3, '00', colorTempK)
  },
})
