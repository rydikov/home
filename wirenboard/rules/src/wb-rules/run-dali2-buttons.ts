import { type Dali2Button } from '#wbm/classes/wb-dali'
import { WbDali } from '#wbm/global-devices'

const dali2Buttons: Record<string, Dali2Button> = {
  'button1': { deviceAddress: 1, intanceNumber: 5 },
  'button2': { deviceAddress: 1, intanceNumber: 3 },
  'button3': { deviceAddress: 1, intanceNumber: 2 },
  'button4': { deviceAddress: 1, intanceNumber: 1 },
  'button5': { deviceAddress: 1, intanceNumber: 4 },
  'button6': { deviceAddress: 1, intanceNumber: 0 },
}

// Check
defineRule('CheckInstance', {
  whenChanged: [
    WbDali.getShortPressInstanceTopic(3, dali2Buttons.button1),
    WbDali.getShortPressInstanceTopic(3, dali2Buttons.button2),
    WbDali.getShortPressInstanceTopic(3, dali2Buttons.button3),
    WbDali.getShortPressInstanceTopic(3, dali2Buttons.button4),
    WbDali.getShortPressInstanceTopic(3, dali2Buttons.button5),
    WbDali.getShortPressInstanceTopic(3, dali2Buttons.button6),
  ],
  then: function (newValue, deviceId, controlId) {
    log.debug('Value: {}, Device {}, Control {}'.format(newValue, String(deviceId), String(controlId)))
  },
})

// Device 0
defineRule('Button1ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2Buttons.button1)],
  then: function (newValue) {
    log.debug('ShortPress test 1 Value: {}'.format(newValue))
    WbDali.setDeviceDapc(3, 0, 180)
  },
})

defineRule('Button1LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2Buttons.button1)] == 1
  },
  then: function (newValue) {
    log.debug('LongPress test 1 Value: {}'.format(newValue))
    WbDali.stepUpDevice(3, 0)
  },
})

defineRule('Button1DoublePress', {
  whenChanged: [WbDali.getDoublePressInstanceTopic(3, dali2Buttons.button1)],
  then: function (newValue) {
    log.debug('DoublePress test 1 Value: {}'.format(newValue))
    WbDali.offDevice(3, 0)
  },
})

// Device 1
defineRule('Button2ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2Buttons.button2)],
  then: function (newValue) {
    log.debug('ShortPress test 1 Value: {}'.format(newValue))
    WbDali.setDeviceDapc(3, 1, 180)
  },
})

defineRule('Button2LongPress', {
  whenChanged: [WbDali.getLongPressInstanceTopic(3, dali2Buttons.button2)],
  then: function (newValue) {
    log.debug('LongPress test 1 Value: {}'.format(newValue))
    WbDali.offDevice(3, 1)
  },
})

defineRule('Button2DoublePress', {
  whenChanged: [WbDali.getDoublePressInstanceTopic(3, dali2Buttons.button2)],
  then: function (newValue) {
    log.debug('DoublePress test 1 Value: {}'.format(newValue))
    WbDali.offDevice(3, 1)
  },
})
