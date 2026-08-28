import { createRequire } from 'node:module'
import { vi } from 'vitest'

const commonJsRequire = createRequire(import.meta.url)
const globalDevicesModulePath = commonJsRequire.resolve('global-devices')
const requireCache = commonJsRequire.cache as unknown as Record<string, { exports: unknown } | undefined>

interface CapturedVirtualDevice {
  deviceId: string
  options: WbRules.DeviceOptions
}

interface CapturedRule {
  name: string
  options: WbRules.RuleOptions
}

let virtualDevices: CapturedVirtualDevice[] = []
let capturedRules: CapturedRule[] = []
let setGroupBrightnessMock: ReturnType<typeof vi.fn>
let setGroupDapcMock: ReturnType<typeof vi.fn>
let setGroupColourTemperatureMock: ReturnType<typeof vi.fn>
let groupControlGetValueMock: ReturnType<typeof vi.fn>
let groupControlSetValueMock: ReturnType<typeof vi.fn>

function installRuntimeCaptures() {
  virtualDevices = []
  capturedRules = []

  globalThis.defineVirtualDevice = (deviceId: string, options: WbRules.DeviceOptions) => {
    virtualDevices.push({ deviceId, options })
    return {} as WbRules.Device
  }

  globalThis.defineRule = ((name: string, options: WbRules.RuleOptions) => {
    capturedRules.push({ name, options })
    return 0
  }) as typeof defineRule
}

function getCapturedRule(name: string): CapturedRule {
  const rule = capturedRules.find(capturedRule => capturedRule.name === name)

  if (rule === undefined) {
    throw new Error(`Rule ${name} was not defined`)
  }

  return rule
}

describe('Alice DALI groups', () => {
  beforeEach(async () => {
    vi.resetModules()
    installRuntimeCaptures()

    setGroupBrightnessMock = vi.fn()
    setGroupDapcMock = vi.fn()
    setGroupColourTemperatureMock = vi.fn()
    groupControlGetValueMock = vi.fn()
    groupControlSetValueMock = vi.fn()

    globalThis.getControl = vi.fn(() => ({
      getValue: groupControlGetValueMock,
      setValue: groupControlSetValueMock,
    } as unknown as WbRules.Control))

    requireCache[globalDevicesModulePath] = {
      exports: {
        WbDali: {
          getGroupActualLevelTopic: (_bus: number, groupAddress: string) =>
            `wb-dali_87_bus_3_group_${groupAddress}/actual_level`,
          setGroupBrightness: setGroupBrightnessMock,
          setGroupDapc: setGroupDapcMock,
          setGroupColourTemperature: setGroupColourTemperatureMock,
        },
      },
    }

    await import('#wb/run-alice-dali-groups')
  })

  afterEach(() => {
    Reflect.deleteProperty(requireCache, globalDevicesModulePath)
  })

  it('creates one virtual device with a toggle for every DALI group on bus 3', () => {
    expect(virtualDevices).toHaveLength(1)

    const virtualDevice = virtualDevices[0]
    expect(virtualDevice.deviceId).toBe('alice_dali_groups')
    expect(virtualDevice.options.title).toBe('DALI: шина 3')
    expect(virtualDevice.options.cells).toEqual({
      ...Object.fromEntries(
        Array.from({ length: 16 }, (_, group) => {
          const groupAddress = String(group).padStart(2, '0')
          return [
            `group_${groupAddress}`,
            {
              title: `Группа ${groupAddress}`,
              type: 'switch',
              value: false,
            },
          ]
        })
      ),
      group_00_colour_temperature: {
        title: 'Цветовая температура группы 00',
        type: 'range',
        min: 0,
        max: 100,
        precision: 1,
        value: 0,
      },
    })
  })

  it('turns group 00 on with brightness 70', () => {
    const rule = getCapturedRule('ALICE_DALI_GROUP_00_TOGGLE')
    expect(rule.options.whenChanged).toBe('alice_dali_groups/group_00')

    rule.options.then(true)

    expect(setGroupBrightnessMock).toHaveBeenCalledWith(3, '00', 70)
    expect(setGroupDapcMock).not.toHaveBeenCalled()
  })

  it('turns group 00 off with DAPC 0', () => {
    const rule = getCapturedRule('ALICE_DALI_GROUP_00_TOGGLE')
    rule.options.then(false)

    expect(setGroupDapcMock).toHaveBeenCalledWith(3, '00', 0)
    expect(setGroupBrightnessMock).not.toHaveBeenCalled()
  })

  it.each([
    [0, 2700],
    [35, 4030],
    [100, 6500],
  ])('converts colour temperature %s%% to %sK for group 00', (percent, kelvin) => {
    const rule = getCapturedRule('ALICE_DALI_GROUP_00_COLOUR_TEMPERATURE')
    expect(rule.options.whenChanged).toBe('alice_dali_groups/group_00_colour_temperature')

    rule.options.then(percent)

    expect(setGroupColourTemperatureMock).toHaveBeenCalledWith(3, '00', kelvin)
  })

  it('subscribes to actual level of every group on bus 3', () => {
    const rule = getCapturedRule('ALICE_DALI_GROUPS_ACTUAL_LEVEL_SYNC')

    expect(rule.options.whenChanged).toEqual(
      Array.from(
        { length: 16 },
        (_, group) => `wb-dali_87_bus_3_group_${String(group).padStart(2, '0')}/actual_level`
      )
    )
  })

  it('updates the group toggle without triggering command rules', () => {
    groupControlGetValueMock.mockReturnValue(false)
    const rule = getCapturedRule('ALICE_DALI_GROUPS_ACTUAL_LEVEL_SYNC')

    rule.options.then(42, 'wb-dali_87_bus_3_group_00', 'actual_level')

    expect(globalThis.getControl).toHaveBeenCalledWith('alice_dali_groups/group_00')
    expect(groupControlSetValueMock).toHaveBeenCalledWith({
      value: true,
      notify: false,
    })
  })

  it('marks the group as off when its actual level becomes zero', () => {
    groupControlGetValueMock.mockReturnValue(true)
    const rule = getCapturedRule('ALICE_DALI_GROUPS_ACTUAL_LEVEL_SYNC')

    rule.options.then(0, 'wb-dali_87_bus_3_group_15', 'actual_level')

    expect(globalThis.getControl).toHaveBeenCalledWith('alice_dali_groups/group_15')
    expect(groupControlSetValueMock).toHaveBeenCalledWith({
      value: false,
      notify: false,
    })
  })

  it('does not rewrite an unchanged group toggle', () => {
    groupControlGetValueMock.mockReturnValue(true)
    const rule = getCapturedRule('ALICE_DALI_GROUPS_ACTUAL_LEVEL_SYNC')

    rule.options.then(42, 'wb-dali_87_bus_3_group_00', 'actual_level')

    expect(groupControlSetValueMock).not.toHaveBeenCalled()
  })
})
