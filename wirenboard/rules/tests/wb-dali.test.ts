import { useSimulator } from '@mirta/testing'
import { vi } from 'vitest'
import { WBDALI } from '#wbm/classes/wb-dali'

const simulator = useSimulator()
const wbDali = new WBDALI('wb-dali_87')
const feedbackButton = { deviceAddress: 1, intanceNumber: 0 }

describe('WBDALI', () => {
  beforeEach(() => {
    simulator.reset()
  })

  it('builds group actual level topic', () => {
    expect(wbDali.getGroupActualLevelTopic(3, '00')).toBe('wb-dali_87_bus_3_group_00/actual_level')
  })

  it('builds bus id from instance name', () => {
    expect(wbDali.getBusId(3)).toBe('wb-dali_87_bus_3')
  })

  it('publishes activate feedback command', () => {
    const publishMock = vi.fn()
    globalThis.publish = publishMock as unknown as typeof publish

    wbDali.activateFeedback(3, feedbackButton)

    expect(publishMock).toHaveBeenCalledWith(
      '/rpc/v1/wb-mqtt-dali/Bus/SendCommand/dali2-feedback',
      JSON.stringify({
        id: 1,
        params: {
          busId: 'wb-dali_87_bus_3',
          commands: ['FF24.F32.ActivateFeedback(A1, I0)'],
        },
      })
    )
  })

  it('publishes stop feedback command', () => {
    const publishMock = vi.fn()
    globalThis.publish = publishMock as unknown as typeof publish

    wbDali.stopFeedback(3, feedbackButton)

    expect(publishMock).toHaveBeenCalledWith(
      '/rpc/v1/wb-mqtt-dali/Bus/SendCommand/dali2-feedback',
      JSON.stringify({
        id: 1,
        params: {
          busId: 'wb-dali_87_bus_3',
          commands: ['FF24.F32.StopFeedback(A1, I0)'],
        },
      })
    )
  })
})
