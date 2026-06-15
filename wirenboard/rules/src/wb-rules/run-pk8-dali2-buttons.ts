import { type Dali2Button } from '#wbm/classes/wb-dali'
import { WbDali } from '#wbm/global-devices'

const dali2PK8Buttons: Record<string, Dali2Button> = {
  'button1': { deviceAddress: 2, intanceNumber: 7 },
  'button2': { deviceAddress: 2, intanceNumber: 6 },
  'button3': { deviceAddress: 2, intanceNumber: 5 },
  'button4': { deviceAddress: 2, intanceNumber: 4 },
  'button5': { deviceAddress: 2, intanceNumber: 3 },
  'button6': { deviceAddress: 2, intanceNumber: 2 },
  'button7': { deviceAddress: 2, intanceNumber: 1 },
  'button8': { deviceAddress: 2, intanceNumber: 0 },
}

// Check
defineRule('CheckInstance', {
  whenChanged: [
    WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button1),
    WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button2),
    WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button3),
    WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button4),
    WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button5),
    WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button6),
    WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button7),
    WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button8),
  ],
  then: function (newValue, deviceId, controlId) {
    log.debug('Value: {}, Device {}, Control {}'.format(newValue, String(deviceId), String(controlId)))
  },
})

// Device 0
defineRule('Button2ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button2)],
  then: function () {
    WbDali.setDeviceDapc(3, 0, 180)
  },
})

defineRule('Button1ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button1)],
  then: function () {
    WbDali.offDevice(3, 0)
  },
})

defineRule('Button2LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button2)] == 1
  },
  then: function () {
    WbDali.upDevice(3, 0)
  },
})

defineRule('Button1LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button1)] == 1
  },
  then: function () {
    WbDali.downDevice(3, 0)
  },
})

// Device 1
defineRule('Button4ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button4)],
  then: function () {
    WbDali.setDeviceDapc(3, 1, 180)
  },
})

defineRule('Button3ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button3)],
  then: function () {
    WbDali.offDevice(3, 1)
  },
})

defineRule('Button4LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button4)] == 1
  },
  then: function () {
    WbDali.upDevice(3, 1)
  },
})

defineRule('Button3LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button3)] == 1
  },
  then: function () {
    WbDali.downDevice(3, 1)
  },
})

defineRule('Button7LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button7)] == 1
  },
  then: function () {
    WbDali.downDevice(3, 2)
  },
})

defineRule('Button8LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button8)] == 1
  },
  then: function () {
    WbDali.upDevice(3, 2)
  },
})
