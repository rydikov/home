import { SunCalc } from '#wbm/suncalc'
import { WbDali } from '#wbm/global-devices'

// Глобальная переменная для хранения предыдущей температуры
let prevTempK = 3500 // начальное значение (нейтральный свет)

// Расчёт цветовой температуры (K) для HCL с плавной регулировкой
// latitude - широта
// longitude - долгота
// smoothFactor – коэффициент плавности (чем меньше, тем плавнее)
// precision – шаг округления в Кельвинах (например, 10 для кратных 10)

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

  // Плавный переход: взвешенное среднее между текущей и целевой температурой
  const newTemp = prevTempK * (1 - smoothFactor) + targetTemp * smoothFactor

  // Обновляем предыдущее значение
  prevTempK = Math.round(newTemp)

  // Округляем до ближайшего кратного precision
  prevTempK = Math.round(prevTempK / precision) * precision

  // Ограничиваем диапазон
  return Math.max(2200, Math.min(6500, prevTempK))
}

// Настройки
const latitude = 53.11
const longitude = 45.05

defineRule('HCL_DALI_GROUP_00_TEMPERATURE', {
  when: cron('@every 300s'),
  then: function () {
    const colorTempK = calculateHCLTemperature(latitude, longitude, 0.15, 10)
    log.debug('Set HCL Temperature: {} K'.format(colorTempK))
    WbDali.setColourTemperature(3, '00', colorTempK)
  },
})
