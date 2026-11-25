import { WbDali } from '#wbm/global-devices'

const DALI_BUS = 3
const ALICE_DALI_GROUPS_DEVICE_ID = 'alice_dali_groups'
const MIN_COLOUR_TEMPERATURE_K = 2700
const MAX_COLOUR_TEMPERATURE_K = 6500

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

defineRule('ALICE_DALI_GROUP_00_COLOUR_TEMPERATURE_SYNC', {
  whenChanged: 'wb-dali_87_bus_3_group_00/current_colour_temperature',
  then: function (newValue) {
    const kelvin = Number(newValue)

    if (!isFinite(kelvin) || kelvin <= 0) {
      return
    }

    const clampedKelvin = Math.max(MIN_COLOUR_TEMPERATURE_K, Math.min(MAX_COLOUR_TEMPERATURE_K, kelvin))
    const percent = Math.round(
      (clampedKelvin - MIN_COLOUR_TEMPERATURE_K)
      / (MAX_COLOUR_TEMPERATURE_K - MIN_COLOUR_TEMPERATURE_K) * 1000
    ) / 10
    const control = getControl(ALICE_DALI_GROUPS_DEVICE_ID + '/' + getGroupColourTemperatureControlId('00'))

    if (control && Number(control.getValue()) !== percent) {
      // Обновляем показание Алисы без повторной отправки команды в DALI.
      control.setValue({ value: percent, notify: false })
    }
  },
})
