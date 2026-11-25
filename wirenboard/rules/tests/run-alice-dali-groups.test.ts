import { vi } from 'vitest'

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

    setGroupColourTemperatureMock = vi.fn()
    groupControlGetValueMock = vi.fn()
    groupControlSetValueMock = vi.fn()

    globalThis.getControl = vi.fn(() => ({
      getValue: groupControlGetValueMock,
      setValue: groupControlSetValueMock,
    } as unknown as WbRules.Control))

    vi.doMock('#wbm/global-devices', () => {
      return {
        WbDali: {
          setGroupColourTemperature: setGroupColourTemperatureMock,
        },
      }
    })

    await import('#wb/run-alice-dali-groups')
  })

  afterEach(() => {
    vi.doUnmock('#wbm/global-devices')
  })

  it('creates one virtual device with colour temperature for group 00 only', () => {
    expect(virtualDevices).toHaveLength(1)

    const virtualDevice = virtualDevices[0]
    expect(virtualDevice.deviceId).toBe('alice_dali_groups')
    expect(virtualDevice.options.title).toBe('DALI: шина 3')
    expect(virtualDevice.options.cells).toEqual({
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

  it('subscribes only to current colour temperature of group 00 on bus 3', () => {
    const rule = getCapturedRule('ALICE_DALI_GROUP_00_COLOUR_TEMPERATURE_SYNC')

    expect(rule.options.whenChanged).toBe('wb-dali_87_bus_3_group_00/current_colour_temperature')
  })

  it.each([
    [2700, 0],
    [4030, 35],
    [4000, 34.2],
    [6500, 100],
    [2500, 0],
    [7000, 100],
    ['4600', 50],
  ])('syncs %sK as %s%% without sending a DALI command', (kelvin, percent) => {
    groupControlGetValueMock.mockReturnValue(75)
    const rule = getCapturedRule('ALICE_DALI_GROUP_00_COLOUR_TEMPERATURE_SYNC')

    rule.options.then(kelvin)

    expect(globalThis.getControl).toHaveBeenCalledWith('alice_dali_groups/group_00_colour_temperature')
    expect(groupControlSetValueMock).toHaveBeenCalledExactlyOnceWith({
      value: percent,
      notify: false,
    })
    expect(setGroupColourTemperatureMock).not.toHaveBeenCalled()
  })

  it.each([35, '35'])('does not rewrite unchanged colour temperature %s', (currentValue) => {
    groupControlGetValueMock.mockReturnValue(currentValue)
    const rule = getCapturedRule('ALICE_DALI_GROUP_00_COLOUR_TEMPERATURE_SYNC')

    rule.options.then(4030)

    expect(groupControlSetValueMock).not.toHaveBeenCalled()
  })

  it.each([0, -1, '', 'invalid', NaN, Infinity])('ignores invalid device colour temperature %s', (kelvin) => {
    const rule = getCapturedRule('ALICE_DALI_GROUP_00_COLOUR_TEMPERATURE_SYNC')

    rule.options.then(kelvin)

    expect(groupControlSetValueMock).not.toHaveBeenCalled()
    expect(setGroupColourTemperatureMock).not.toHaveBeenCalled()
  })
})
