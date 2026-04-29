import { MTDX62MB } from '#wbm/classes/mtdx62-mb'

type onFuncType = () => void
type offFuncType = () => void
type valueFuncType = () => boolean
type shouldTurnOnBacklightFuncType = () => boolean

export function makeBacklightRule(
  ruleName: string,
  presenceDevice: MTDX62MB,
  backlightControl: string,
  backlightOnFunc: onFuncType,
  backlightOffFunc: offFuncType,
  backlightValueFunc: valueFuncType,
  conditionTopic: string,
  shouldTurnOnBacklightFunc: shouldTurnOnBacklightFuncType,
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
    conditionTopic,
  ]
  if (doorSensorTopic) {
    whenChanged.push(doorSensorTopic)
  }

  defineRule(ruleName, {
    whenChanged,
    then: function (newValue, devName, cellName) {
      const shouldTurnOnBacklight = shouldTurnOnBacklightFunc()
      const isBacklightEnabled = Boolean(getControl(backlightControl)?.getValue())
      const isBacklightOn = backlightValueFunc()

      // Проверяем, событие ли это движения
      const isMotionEvent = cellName === presenceDevice.presenceStatusTopic
      // Проверяем, событие ли это от геркона
      const isDoorEvent = doorSensorTopic && devName === doorSensorTopic

      log.info('Подсветка: движение={}, дверь={}, подсветка включена={}, условие включения={}, состояние освещения={}',
        isMotionEvent, isDoorEvent, isBacklightEnabled, shouldTurnOnBacklight, isBacklightOn)
      log.info('Новое значение: {} от устройства: {}', newValue, devName)

      // Обработка изменения условий (ручное включение подсветки или абстрактное условие включения)
      if (!isMotionEvent && !isDoorEvent) {
        resetMotionTimer()
        // Выключаем свет, если подсветка отключена или условие включения больше не выполняется
        if ((!isBacklightEnabled || !shouldTurnOnBacklight) && isBacklightOn) {
          backlightOffFunc()
          log.info('Подсветка выключена')
        }
      }

      // Если подсветка отключена или условие включения не выполняется, ничего не делаем
      if (!isBacklightEnabled || !shouldTurnOnBacklight) {
        return
      }

      // Явно определяем состояние датчика присутствия - newValue может быть от датчика, Backlights или conditionTopic
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
