import {
  getDeviceAddress,
  getGroupAddress,
  getReplyFrame,
  parseColourTemperature,
  parseBrightness,
  parseStatus
} from '#wbm/classes/dlc-02'

import { dlc02 } from '#wbm/global-devices'
import { formatTimestampES5 } from '#wbm/helpers'

defineVirtualDevice('dali_groups', {
  title: 'Dali Groups Tester',
  cells: {
    buss_id: {
      order: 0,
      title: 'Шина',
      type: 'text',
      value: '01',
      readonly: false,
      enum: {
        '01': { en: 'A', ru: 'A' },
        '02': { en: 'B', ru: 'B' },
      },
    },
    group_id: {
      order: 10,
      title: 'ID Группы',
      type: 'value',
      value: 0,
      readonly: false,
      enum: {
        0: { en: '0', ru: '0' },
        1: { en: '1', ru: '1' },
        2: { en: '2', ru: '2' },
        3: { en: '3', ru: '3' },
        4: { en: '4', ru: '4' },
        5: { en: '5', ru: '5' },
        6: { en: '6', ru: '6' },
        7: { en: '7', ru: '7' },
        8: { en: '8', ru: '8' },
        9: { en: '9', ru: '9' },
        10: { en: '10', ru: '10' },
        11: { en: '11', ru: '11' },
        12: { en: '12', ru: '12' },
        13: { en: '13', ru: '13' },
        14: { en: '14', ru: '14' },
        15: { en: '15', ru: '15' },
      },
    },
    brightness: {
      order: 20,
      title: 'Яркость',
      type: 'range',
      min: 0,
      max: 254,
      value: 0,
      readonly: false,
    },
    color_temperature: {
      order: 30,
      title: 'Цветовая температура',
      type: 'range',
      min: 2700,
      max: 6500,
      value: 2700,
      readonly: false,
    },

    device_id: {
      order: 40,
      title: 'ID устройства для синхронизации',
      type: 'value',
      value: 0,
      readonly: false,
      min: 0,
      max: 63,
    },
    update: {
      order: 50,
      title: 'Синхронизировать',
      type: 'pushbutton',
    },
    updated: {
      order: 60,
      title: 'Обновлено',
      type: 'text',
      value: '',
    },
    status_updated: {
      order: 70,
      title: 'Статус',
      type: 'text',
      value: '',
    },
    color_temperature_updated: {
      order: 80,
      title: 'Цветовая температура',
      type: 'text',
      value: '',
    },
    brightness_updated: {
      order: 90,
      title: 'Яркость',
      type: 'text',
      value: '',
    },
  },
})

defineRule('DALI_GROUP_SET_BRIGHTNESS', {
  whenChanged: 'dali_groups/brightness',
  then: function (newValue: number) {
    const daliGroupsDevice = getDevice('dali_groups')

    if (daliGroupsDevice === undefined) {
      return
    }

    const groupAddress = Number(daliGroupsDevice.getControl('group_id')?.getValue())
    const bussID = String(daliGroupsDevice.getControl('buss_id')?.getValue())

    dlc02.setBrightness(bussID, getGroupAddress(groupAddress), newValue)
  },
})

defineRule('DALI_GROUP_SET_COLOR_TEMPERATURE', {
  whenChanged: 'dali_groups/color_temperature',
  then: function (newValue: number) {
    const daliGroupsDevice = getDevice('dali_groups')

    if (daliGroupsDevice === undefined) {
      return
    }

    const groupAddress = Number(daliGroupsDevice.getControl('group_id')?.getValue())
    const bussID = String(daliGroupsDevice.getControl('buss_id')?.getValue())

    dlc02.setColorTemperature(bussID, getGroupAddress(groupAddress), newValue)
  },
})

defineRule('CHECK_DALI_LAMP', {
  whenChanged: 'dali_groups/update',
  then: function () {
    const lampAddress = getDevice('dali_groups')?.getControl('device_id')?.getValue()
    const deviceLampAddress = getDeviceAddress(Number(lampAddress))

    const bussID = String(getDevice('dali_groups')?.getControl('buss_id')?.getValue())

    log.info('get-ct request for lamp {} on buss {}'.format(deviceLampAddress, bussID))
    dlc02.sendColorTemperatureRequest(bussID, deviceLampAddress)
    log.info('get-brightness request for lamp {} on buss {}'.format(deviceLampAddress, bussID))
    dlc02.sendBrightnessRequest(bussID, deviceLampAddress)
    log.info('get-status request for lamp {} on buss {}'.format(deviceLampAddress, bussID))
    dlc02.sendStatusRequest(bussID, deviceLampAddress)

    const now = new Date()
    getDevice('dali_groups')?.getControl('updated')?.setValue(formatTimestampES5(now.getTime()))
  },
})

// Подписчики на изменения в RPC
//
// Обновляем цветовую температуру
trackMqtt('/rpc/v1/wb-mqtt-serial/port/Load/ct-request/reply', (message) => {
  let controlValue = ''
  try {
    const frame = getReplyFrame('ct-request', String(message.value))
    controlValue = parseColourTemperature(frame[4], frame[5])
  }
  catch (error) {
    controlValue = error instanceof Error ? error.message : String(error)
  }
  finally {
    getDevice('dali_groups')?.getControl('color_temperature_updated')?.setValue(controlValue)
  }
})

// Обновляем яркость
trackMqtt('/rpc/v1/wb-mqtt-serial/port/Load/brightness-request/reply', (message) => {
  let controlValue = ''
  try {
    const frame = getReplyFrame('brightness-request', String(message.value))
    controlValue = parseBrightness(frame[4])
  }
  catch (error) {
    controlValue = error instanceof Error ? error.message : String(error)
  }
  finally {
    getDevice('dali_groups')?.getControl('brightness_updated')?.setValue(controlValue)
  }
})

// Обновляем статус
trackMqtt('/rpc/v1/wb-mqtt-serial/port/Load/status-request/reply', (message) => {
  let controlValue = ''
  try {
    const frame = getReplyFrame('status-request', String(message.value))
    controlValue = parseStatus(frame[4])
  }
  catch (error) {
    controlValue = error instanceof Error ? error.message : String(error)
  }
  finally {
    getDevice('dali_groups')?.getControl('status_updated')?.setValue(controlValue)
  }
})
