import { AstroTimer, backlightControls } from '#wbm/global-devices'

// Если подсветки выключали ночью, но их состояние сбрасывается при наступлении дня
defineRule('ENABLE_ALL_BACKLIGHTS_ON_DAY', {
  asSoonAs: function () {
    return AstroTimer.isDay
  },
  then: function () {
    const backlightsDevice = getDevice('Backlights')
    if (backlightsDevice === undefined) {
      log.error('Устройство Backlights не найдено')
      return
    }

    for (const controlName in backlightControls) {
      backlightsDevice.getControl(controlName).setValue(true)
    }

    log.info('Все подсветки включены: наступил день по астротаймеру')
  },
})
