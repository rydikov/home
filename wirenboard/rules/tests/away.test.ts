import { useSimulator } from '@mirta/testing'
import { vi, type Mock } from 'vitest'
import { MTDX62MB } from '#wbm/classes/mtdx62-mb'
import { makeAwayRule } from '#wbm/rule_makers/away'

interface CapturedRule {
  whenChanged?: string | string[]
  then: (newValue: WbRules.MqttValue) => void
}

const simulator = useSimulator()
const doorTopic = 'test-door/closed'
const secondDoorTopic = 'test-second-door/closed'
const timeoutMs = 5 * 60 * 1000
const firstPresenceSensor = new MTDX62MB('test-presence-1')
const secondPresenceSensor = new MTDX62MB('test-presence-2')

let capturedRules: CapturedRule[] = []
let away = false
let onAwayConfirmed: Mock<() => void>
let onHomeDetected: Mock<() => void>

/** Подменяет defineRule и сохраняет созданные правила для ручного вызова. */
function installDefineRuleCapture() {
  capturedRules = []

  globalThis.defineRule = ((variantA: string | CapturedRule, variantB?: CapturedRule) => {
    const rule = typeof variantA === 'string' ? variantB : variantA

    if (rule !== undefined) {
      capturedRules.push(rule)
    }

    return 0
  }) as typeof defineRule
}

/** Создаёт в симуляторе датчик присутствия с указанным начальным значением. */
function definePresenceSensor(sensor: MTDX62MB, initialValue = false) {
  defineVirtualDevice(sensor.name, {
    title: sensor.name,
    cells: {
      presence_status: {
        type: 'switch',
        value: initialValue,
      },
    },
  })
}

/** Устанавливает тестируемое правило с заданным набором топиков присутствия. */
function installAwayRule(presenceTopics: string[]) {
  installDefineRuleCapture()

  makeAwayRule({
    ruleName: 'TEST_AWAY_FROM_HOME',
    doorTopics: [
      doorTopic,
      secondDoorTopic,
    ],
    presenceTopics,
    timeoutMs,
    isAway: function () {
      return away
    },
    onAwayConfirmed,
    onHomeDetected,
  })
}

/** Изменяет значение контрола и вызывает подписанные на него правила. */
function emitChange(topic: string, value: WbRules.MqttValue) {
  dev[topic] = value

  capturedRules
    .filter(function (rule) {
      if (Array.isArray(rule.whenChanged)) {
        return rule.whenChanged.includes(topic)
      }

      return rule.whenChanged === topic
    })
    .forEach(function (rule) {
      rule.then(value)
    })
}

describe('makeAwayRule', () => {
  beforeEach(() => {
    simulator.reset()
    vi.useFakeTimers()
    away = false

    onAwayConfirmed = vi.fn(function () {
      away = true
    })
    onHomeDetected = vi.fn(function () {
      away = false
    })

    definePresenceSensor(firstPresenceSensor)
    definePresenceSensor(secondPresenceSensor)
    installAwayRule([
      firstPresenceSensor.presenceStatusTopic,
      secondPresenceSensor.presenceStatusTopic,
    ])
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('confirms away status after the timeout without presence', () => {
    emitChange(doorTopic, true)

    vi.advanceTimersByTime(timeoutMs - 1)
    expect(onAwayConfirmed).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onAwayConfirmed).toHaveBeenCalledTimes(1)
    expect(away).toBe(true)
  })

  it('starts the timeout when any configured door closes', () => {
    emitChange(secondDoorTopic, true)
    vi.advanceTimersByTime(timeoutMs)

    expect(onAwayConfirmed).toHaveBeenCalledTimes(1)
  })

  it('cancels pending confirmation when the door opens', () => {
    emitChange(doorTopic, true)
    emitChange(doorTopic, false)
    vi.advanceTimersByTime(timeoutMs)

    expect(onAwayConfirmed).not.toHaveBeenCalled()
  })

  it('restarts the timeout when the door closes again', () => {
    emitChange(doorTopic, true)
    vi.advanceTimersByTime(timeoutMs - 1)
    emitChange(doorTopic, true)
    vi.advanceTimersByTime(timeoutMs - 1)

    expect(onAwayConfirmed).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onAwayConfirmed).toHaveBeenCalledTimes(1)
  })

  it('cancels pending confirmation when any sensor detects presence', () => {
    emitChange(doorTopic, true)
    emitChange(secondPresenceSensor.presenceStatusTopic, true)
    vi.advanceTimersByTime(timeoutMs)

    expect(onAwayConfirmed).not.toHaveBeenCalled()
  })

  it('does not cancel pending confirmation when presence becomes false', () => {
    emitChange(doorTopic, true)
    emitChange(firstPresenceSensor.presenceStatusTopic, false)
    vi.advanceTimersByTime(timeoutMs)

    expect(onAwayConfirmed).toHaveBeenCalledTimes(1)
  })

  it('does not confirm away status while a sensor is active at the deadline', () => {
    emitChange(doorTopic, true)
    dev[firstPresenceSensor.presenceStatusTopic] = true
    vi.advanceTimersByTime(timeoutMs)

    expect(onAwayConfirmed).not.toHaveBeenCalled()
  })

  it('does not confirm away status when a sensor is unavailable', () => {
    installAwayRule([
      firstPresenceSensor.presenceStatusTopic,
      'missing-presence/presence_status',
    ])
    emitChange(doorTopic, true)
    vi.advanceTimersByTime(timeoutMs)

    expect(onAwayConfirmed).not.toHaveBeenCalled()
  })

  it('returns home on the first presence event while away', () => {
    away = true

    emitChange(firstPresenceSensor.presenceStatusTopic, true)
    emitChange(secondPresenceSensor.presenceStatusTopic, true)

    expect(onHomeDetected).toHaveBeenCalledTimes(1)
    expect(away).toBe(false)
  })

  it('does not confirm away status repeatedly when it is already active', () => {
    away = true

    emitChange(doorTopic, true)
    vi.advanceTimersByTime(timeoutMs)

    expect(onAwayConfirmed).not.toHaveBeenCalled()
  })
})
