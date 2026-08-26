const { PresenceSensors, WallSwitches } = require('global-devices') as typeof import('#wbm/global-devices')
const { makeAwayRule } = require('rule_makers/away') as typeof import('#wbm/rule_makers/away')

const homeStatusTopic = 'HomeStatus/away'
const awayTimeoutMs = 5 * 60 * 1000

defineVirtualDevice('HomeStatus', {
  title: 'Статус дома',
  cells: {
    away: {
      title: 'Ушли из дома',
      type: 'switch',
      readonly: true,
      value: false,
    },
  },
})

/** Возвращает текущий статус из виртуального устройства. */
function isAway(): boolean {
  return Boolean(getControl(homeStatusTopic)?.getValue())
}

/**
 * Записывает статус дома в виртуальный контрол.
 *
 * @returns true, если значение статуса действительно изменилось.
 */
function setAwayStatus(value: boolean): boolean {
  if (Boolean(getControl(homeStatusTopic)?.getValue()) === value) {
    return false
  }

  getControl(homeStatusTopic)?.setValue(value)
  return true
}

/** Выполняет действия, запланированные после подтверждения ухода из дома. */
function runAwayAutomation() {
  log.info('Автоматизация «Ушёл из дома» выполнена')
}

/** Выполняет действия, запланированные после возвращения домой. */
function runOnHomeAutomation() {
  log.info('Автоматизация «Вернулся домой» выполнена')
}

makeAwayRule({
  ruleName: 'AWAY_FROM_HOME',
  doorTopics: [
    WallSwitches.Room1_1,
  ],
  presenceTopics: [
    PresenceSensors.Cabinet.presenceStatusTopic,
  ],
  timeoutMs: awayTimeoutMs,
  isAway,
  onAwayConfirmed: function () {
    if (!setAwayStatus(true)) {
      return
    }

    runAwayAutomation()
  },
  onHomeDetected: function () {
    if (!setAwayStatus(false)) {
      return
    }

    log.info('Статус дома изменён на «Дома»')
    runOnHomeAutomation()
  },
})
