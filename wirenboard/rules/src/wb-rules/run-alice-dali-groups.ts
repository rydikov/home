const { WbDali } = require('global-devices') as typeof import('#wbm/global-devices')

const DALI_BUS = 3
const DALI_GROUP_COUNT = 16
const GROUP_ON_BRIGHTNESS = 70
const ALICE_DALI_GROUPS_DEVICE_ID = 'alice_dali_groups'
const MIN_COLOUR_TEMPERATURE_K = 2700
const MAX_COLOUR_TEMPERATURE_K = 6500

function getGroupAddress(group: number): string {
  return group < 10 ? '0' + String(group) : String(group)
}

function getGroupControlId(groupAddress: string): string {
  return 'group_' + groupAddress
}

function getGroupColourTemperatureControlId(groupAddress: string): string {
  return getGroupControlId(groupAddress) + '_colour_temperature'
}

// wb-mqtt-alice преобразует полученную от Яндекса цветовую температуру
// из диапазона 2700–6500 K в 0–100% перед публикацией в MQTT-контрол.
// DALI ожидает значение в кельвинах, поэтому перед записью в
// set_colour_temperature выполняем обратное преобразование процентов в K.
function colourTemperaturePercentToKelvin(percent: number): number {
  const clampedPercent = Math.max(0, Math.min(100, percent))
  return Math.round(
    MIN_COLOUR_TEMPERATURE_K
    + (MAX_COLOUR_TEMPERATURE_K - MIN_COLOUR_TEMPERATURE_K) * clampedPercent / 100
  )
}

const groupControls: WbRules.ControlOptionsTree = {}
const groupAddressByActualLevelTopic: Record<string, string | undefined> = {}
const actualLevelTopics: string[] = []

for (let group = 0; group < DALI_GROUP_COUNT; group++) {
  const groupAddress = getGroupAddress(group)
  const actualLevelTopic = WbDali.getGroupActualLevelTopic(DALI_BUS, groupAddress)

  groupControls[getGroupControlId(groupAddress)] = {
    title: 'Группа {}'.format(groupAddress),
    type: 'switch',
    value: false,
  }

  groupAddressByActualLevelTopic[actualLevelTopic] = groupAddress
  actualLevelTopics.push(actualLevelTopic)
}

groupControls[getGroupColourTemperatureControlId('00')] = {
  title: 'Цветовая температура группы 00',
  type: 'range',
  min: 0,
  max: 100,
  precision: 1,
  value: 0,
}

defineVirtualDevice(ALICE_DALI_GROUPS_DEVICE_ID, {
  title: 'DALI: шина {}'.format(DALI_BUS),
  cells: groupControls,
})

defineRule('ALICE_DALI_GROUP_00_TOGGLE', {
  whenChanged: ALICE_DALI_GROUPS_DEVICE_ID + '/' + getGroupControlId('00'),
  then: function (newValue) {
    if (newValue === true) {
      WbDali.setGroupBrightness(DALI_BUS, '00', GROUP_ON_BRIGHTNESS)
    }
    else if (newValue === false) {
      WbDali.setGroupDapc(DALI_BUS, '00', 0)
    }
  },
})

defineRule('ALICE_DALI_GROUP_00_COLOUR_TEMPERATURE', {
  whenChanged: ALICE_DALI_GROUPS_DEVICE_ID + '/' + getGroupColourTemperatureControlId('00'),
  then: function (newValue) {
    const percent = Number(newValue)

    if (!isFinite(percent)) {
      log.error('Некорректная цветовая температура в процентах: {}', newValue)
      return
    }

    WbDali.setGroupColourTemperature(
      DALI_BUS,
      '00',
      colourTemperaturePercentToKelvin(percent)
    )
  },
})

defineRule('ALICE_DALI_GROUPS_ACTUAL_LEVEL_SYNC', {
  whenChanged: actualLevelTopics,
  then: function (newValue, deviceId, controlId) {
    const actualLevelTopic = String(deviceId) + '/' + String(controlId)
    const groupAddress = groupAddressByActualLevelTopic[actualLevelTopic]

    if (groupAddress === undefined) {
      return
    }

    const groupControlTopic = ALICE_DALI_GROUPS_DEVICE_ID + '/' + getGroupControlId(groupAddress)
    const groupControl = getControl(groupControlTopic)

    if (groupControl === undefined) {
      log.error('Виртуальный контрол {} не найден', groupControlTopic)
      return
    }

    const isGroupOn = Number(newValue) > 0

    if (Boolean(groupControl.getValue()) === isGroupOn) {
      return
    }

    groupControl.setValue({
      value: isGroupOn,
      notify: false,
    })
  },
})
