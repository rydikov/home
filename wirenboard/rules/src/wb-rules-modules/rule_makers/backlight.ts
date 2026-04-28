import { AstroTimer } from '#wbm/global-devices'
import { MTDX62MB } from '#wbm/classes/mtdx62-mb'

type onFuncType = () => void
type offFuncType = () => void
type valueFuncType = () => boolean

export function makeBacklightRule(
  ruleName: string,
  presenceDevice: MTDX62MB,
  backlightControl: string,
  backlightOnFunc: onFuncType,
  backlightOffFunc: offFuncType,
  backlightValueFunc: valueFuncType,
  timeoutMs = 120000,
  doorSensorTopic?: string
) {
  let motionTimer: number | null = null

  function resetMotionTimer() {
    if (motionTimer) {
      clearTimeout(motionTimer)
      motionTimer = null
    }
  }

  // Формируем массив топиков для отслеживания изменений динамически, т.к. геркона может не быть
  const whenChanged = [
    presenceDevice.presenceStatusTopic,
    backlightControl,
    AstroTimer.isDayTopic,
  ]
  if (doorSensorTopic) {
    whenChanged.push(doorSensorTopic)
  }

  defineRule(ruleName, {
    whenChanged,
    then: function (newValue, devName) {
      const isNight = !AstroTimer.isDay
      const isBacklightEnabled = Boolean(getControl(backlightControl)?.getValue())
      const isBacklightOn = backlightValueFunc()

      // Проверяем, событие ли это движения
      const isMotionEvent = devName === presenceDevice.name
      // Проверяем, событие ли это от геркона
      const isDoorEvent = doorSensorTopic && devName === doorSensorTopic

      log.info('Подсветка: движение={}, дверь={}, подсветка включена={}, ночь={}, состояние освещения={}',
        isMotionEvent, isDoorEvent, isBacklightEnabled, isNight, isBacklightOn)
      log.info('Новое значение: {} от устройства: {}', newValue, devName)

      // Обработка изменения условий (ручное включение подсветки или день/ночь)
      if (!isMotionEvent && !isDoorEvent) {
        resetMotionTimer()
        // Выключаем свет, если подсветка отключена или сейчас день
        if ((!isBacklightEnabled || !isNight) && isBacklightOn) {
          backlightOffFunc()
          log.info('Подсветка выключена')
        }
      }

      // Если подсветка отключена или сейчас день, ничего не делаем
      if (!isBacklightEnabled || !isNight) {
        return
      }

      // Явно определяем состояние датчика присутствия - newValue может быть от датчика, Backlights или AstroTimer
      const presenceStatus = isMotionEvent ? newValue : presenceDevice.presenceStatus

      if (presenceStatus || isDoorEvent) {
        log.info('Подсветка включена (обнаружено движение или открытие двери)')
        backlightOnFunc()
        resetMotionTimer()
      }
      else {
        resetMotionTimer()
        motionTimer = setTimeout(function () {
          backlightOffFunc()
          log.info('Подсветка выключена (таймаут движения)')
          motionTimer = null
        }, timeoutMs) as unknown as number
      }
    },
  })
}
