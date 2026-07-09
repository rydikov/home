import { useSimulator } from '@mirta/testing'
import { vi } from 'vitest'
import { WBDALI } from '#wbm/classes/wb-dali'

const simulator = useSimulator()
const actualLevelTopic = 'wb-dali_87_bus_3_group_00/actual_level'

interface CapturedRule {
  whenChanged?: string | string[]
  then: (newValue: WbRules.MqttValue, devName?: string, cellName?: string) => void
}

let capturedRules: CapturedRule[] = []
let publishMock: ReturnType<typeof vi.fn>

function installDefineRuleCapture() {
  capturedRules = []

  globalThis.defineRule = ((variantA: string | CapturedRule, variantB?: CapturedRule) => {
    const rule = typeof variantA === 'string' ? variantB : variantA

    if (rule) {
      capturedRules.push(rule)
    }

    return 0
  }) as typeof defineRule
}

function emitChange(topic: string, value: WbRules.MqttValue) {
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

function expectLastCommand(command: string) {
  expect(publishMock).toHaveBeenLastCalledWith(
    '/rpc/v1/wb-mqtt-dali/Bus/SendCommand/dali2-feedback',
    JSON.stringify({
      id: 1,
      params: {
        busId: 'wb-dali_87_bus_3',
        commands: [command],
      },
    })
  )
}

describe('Dali2Group0Feedback rule', () => {
  beforeEach(async () => {
    simulator.reset()
    vi.resetModules()
    installDefineRuleCapture()

    publishMock = vi.fn()
    globalThis.publish = publishMock as unknown as typeof publish

    vi.doMock('#wbm/global-devices', () => {
      return {
        WbDali: new WBDALI('wb-dali_87'),
        dali2MW1Buttons: {
          button6: { deviceAddress: 1, intanceNumber: 0 },
        },
      }
    })

    await import('#wb/run-dali2-feedback')
  })

  afterEach(() => {
    vi.doUnmock('#wbm/global-devices')
  })

  it('publishes activate feedback only when group becomes active', () => {
    emitChange(actualLevelTopic, 10)

    expect(publishMock).toHaveBeenCalledTimes(1)
    expectLastCommand('FF24.F32.ActivateFeedback(A1, I0)')

    emitChange(actualLevelTopic, 20)

    expect(publishMock).toHaveBeenCalledTimes(1)
  })

  it('publishes stop feedback only when group becomes inactive', () => {
    emitChange(actualLevelTopic, 10)
    emitChange(actualLevelTopic, 20)
    emitChange(actualLevelTopic, 0)

    expect(publishMock).toHaveBeenCalledTimes(2)
    expectLastCommand('FF24.F32.StopFeedback(A1, I0)')

    emitChange(actualLevelTopic, 0)

    expect(publishMock).toHaveBeenCalledTimes(2)
  })
})
