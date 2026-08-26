const { WbDali, dali2PK8Buttons } = require('global-devices') as typeof import('#wbm/global-devices')

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
  then: function (newValue) {
    if (newValue) {
      WbDali.setDeviceDapc(3, 0, 180)
    }
  },
})

defineRule('Button1ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button1)],
  then: function (newValue) {
    if (newValue) {
      WbDali.offDevice(3, 0)
    }
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
  then: function (newValue) {
    if (newValue) {
      WbDali.setDeviceDapc(3, 1, 180)
    }
  },
})

defineRule('Button3ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button3)],
  then: function (newValue) {
    if (newValue) {
      WbDali.offDevice(3, 1)
    }
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

// Device 2
defineRule('Button6ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button6)],
  then: function (newValue) {
    if (newValue) {
      WbDali.setDeviceDapc(3, 2, 100)
    }
  },
})

defineRule('Button5ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button5)],
  then: function (newValue) {
    if (newValue) {
      WbDali.setDeviceDapc(3, 2, 0)
    }
  },
})

defineRule('Button6LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button6)] == 1
  },
  then: function () {
    WbDali.upDevice(3, 2)
  },
})

defineRule('Button5LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button5)] == 1
  },
  then: function () {
    WbDali.downDevice(3, 2)
  },
})
