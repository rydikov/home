import { useSimulator } from '@mirta/testing'
import { PresenceSensors, RelayLights } from '#wbm/global-devices'
import { makeBacklightRule } from '#wbm/rule_makers/backlight'

const simulator = useSimulator()

beforeEach(() => {
  simulator.reset()
})

const onFunc = (): void => {
  RelayLights.Cabinet_01.on()
}

const offFunc = (): void => {
  RelayLights.Cabinet_01.off()
}

const valueFunc = (): boolean => {
  return RelayLights.Cabinet_01.isOn()
}

describe('useBacklight', () => {
  beforeEach(() => {
    RelayLights.Cabinet_01.setValue(false)
    makeBacklightRule(
      'TEST_BACKLIGHT',
      PresenceSensors.Cabinet,
      'Backlights/cabinet',
      onFunc,
      offFunc,
      valueFunc,
      120000
    )
  })

  //   it('starts with cabinet relay off in test setup', () => {
  //     const isTrue = true
  //     expect(isTrue).toBe(true)
  //   })

  // it('presence emulate', () => {
  //   simulator.defineRule.run({ topic: PresenceSensors.Cabinet.presenceStatusTopic, value: 1 })
  //   expect(RelayLights.Cabinet_01.value()).toBe(true)
  // })

  // it('turns off heater when temperature above target', () => {
  //   dev[heaterTopic] = true

  //   simulator.defineRule.run({ topic: sensorTopic, value: 23 })
  //   expect(dev[heaterTopic]).toBe(false)
  // })

  // it('handles invalid temperature values', () => {
  //   dev[heaterTopic] = true

  //   simulator.defineRule.run({ topic: sensorTopic, value: 'invalid_value' })
  //   expect(dev[heaterTopic]).toBe(false)
  // })

  // it('does not toggle heater inside hysteresis band', () => {
  //   dev[heaterTopic] = true

  //   simulator.defineRule.run({ topic: sensorTopic, value: 22.4 })
  //   expect(dev[heaterTopic]).toBe(true)
  // })

  // it('does not toggle heater inside hysteresis band (heater off)', () => {
  //   dev[heaterTopic] = false

  //   simulator.defineRule.run({ topic: sensorTopic, value: 21.6 })
  //   expect(dev[heaterTopic]).toBe(false)
  // })
})
