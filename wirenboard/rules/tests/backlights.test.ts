import { useSimulator } from '@mirta/testing'
import { vi } from 'vitest'
import { MTDX62MB } from '#wbm/classes/mtdx62-mb'
import { RelayLight } from '#wbm/classes/wb'
import { makeBacklightRule } from '#wbm/rule_makers/backlight'

const simulator = useSimulator()
const cabinetPresenceSensor = new MTDX62MB('mtdx62-mb_7')
const cabinetRelayLight = new RelayLight('wb-mr6cv3_217/K6')

const onFunc = (): void => {
  cabinetRelayLight.on()
}

const offFunc = (): void => {
  cabinetRelayLight.off()
}

const valueFunc = (): boolean => {
  return cabinetRelayLight.isOn()
}

interface CapturedRule {
  whenChanged?: string | string[]
  then: (newValue: WbRules.MqttValue, devName?: string, cellName?: string) => void
}

const relayTopic = cabinetRelayLight.topic
const presenceTopic = cabinetPresenceSensor.presenceStatusTopic
const backlightControl = 'Backlights/cabinet'
const conditionTopic = 'TestBacklightCondition/enabled'
const timeoutMs = 120000

let capturedRules: CapturedRule[] = []
let shouldTurnOnBacklight = true

function installArrayAwareDefineRuleCapture() {
  capturedRules = []

  // Текущий runner defineRule из @mirta/testing обрабатывает только строковый whenChanged.
  // Этот перехват позволяет тестировать правила, которые подписаны на несколько топиков.
  globalThis.defineRule = ((variantA: string | CapturedRule, variantB?: CapturedRule) => {
    const rule = typeof variantA === 'string' ? variantB : variantA

    if (rule) {
      capturedRules.push(rule)
    }

    return 0
  }) as typeof defineRule
}

function emitChange(topic: string, value: WbRules.MqttValue) {
  // Сначала сохраняем новое значение, чтобы геттеры внутри правила видели состояние
  // как в wb-rules после обновления MQTT/контрола.
  dev[topic] = value

  capturedRules
    .filter((rule) => {
      const whenChanged = rule.whenChanged

      return Array.isArray(whenChanged)
        ? whenChanged.includes(topic)
        : whenChanged === topic
    })
    .forEach((rule) => {
      rule.then(value, topic, topic)
    })
}

describe('useBacklight', () => {
  beforeEach(() => {
    simulator.reset()
    vi.useFakeTimers()
    shouldTurnOnBacklight = true

    // Минимальная модель runtime-контролов, к которым обращается makeBacklightRule.
    defineVirtualDevice('Backlights', {
      title: 'Подсветки',
      cells: {
        cabinet: {
          title: 'Подсветка в кабинете',
          type: 'switch',
          value: true,
        },
      },
    })
    defineVirtualDevice('TestBacklightCondition', {
      title: 'Условия тестовой подсветки',
      cells: {
        enabled: {
          title: 'Условие включения подсветки',
          type: 'switch',
          value: true,
        },
      },
    })
    defineVirtualDevice(cabinetPresenceSensor.name, {
      title: 'Датчик присутствия',
      cells: {
        presence_status: {
          title: 'Присутствие',
          type: 'switch',
          value: false,
        },
      },
    })
    simulator.getControl.defineValue('wb-mr6cv3_217', 'K6', false)

    // Устанавливаем перехват defineRule после simulator.reset(), потому что reset
    // возвращает стандартную реализацию Mirta.
    installArrayAwareDefineRuleCapture()

    makeBacklightRule(
      'TEST_BACKLIGHT',
      cabinetPresenceSensor,
      backlightControl,
      onFunc,
      offFunc,
      valueFunc,
      conditionTopic,
      function () {
        return shouldTurnOnBacklight
      },
      timeoutMs
    )
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  // При появлении присутствия правило должно включить физический выход подсветки.
  it('turns on backlight when presence appears', () => {
    emitChange(presenceTopic, true)

    expect(dev[relayTopic]).toBe(true)
  })

  // Отключенный виртуальный контрол Backlights/cabinet запрещает автоматическое включение.
  it('does not turn on backlight when backlight control is disabled', () => {
    emitChange(backlightControl, false)
    emitChange(presenceTopic, true)

    expect(dev[relayTopic]).toBe(false)
  })

  // Внешнее условие, например день/ночь или освещенность, тоже должно блокировать включение.
  it('does not turn on backlight when condition forbids it', () => {
    shouldTurnOnBacklight = false

    emitChange(conditionTopic, false)
    emitChange(presenceTopic, true)

    expect(dev[relayTopic]).toBe(false)
  })

  // После пропадания присутствия подсветка выключается только по истечении таймаута.
  it('turns off backlight after presence timeout', () => {
    emitChange(presenceTopic, true)
    emitChange(presenceTopic, false)

    // До полного истечения таймаута свет должен оставаться включенным.
    vi.advanceTimersByTime(timeoutMs - 1)
    expect(dev[relayTopic]).toBe(true)

    vi.advanceTimersByTime(1)
    expect(dev[relayTopic]).toBe(false)
  })

  // Новое присутствие до истечения таймаута отменяет отложенное выключение.
  it('keeps backlight on when presence returns before timeout', () => {
    emitChange(presenceTopic, true)
    emitChange(presenceTopic, false)
    vi.advanceTimersByTime(timeoutMs - 1)

    // Повторное присутствие должно сбросить ожидающий таймер выключения.
    emitChange(presenceTopic, true)
    vi.advanceTimersByTime(1)

    expect(dev[relayTopic]).toBe(true)
  })

  // Если условие включения стало ложным, уже включенная подсветка должна погаснуть.
  it('turns off active backlight when condition becomes false', () => {
    emitChange(presenceTopic, true)

    shouldTurnOnBacklight = false
    emitChange(conditionTopic, false)

    expect(dev[relayTopic]).toBe(false)
  })
})
