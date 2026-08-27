const { WbDali, dali2PK8Buttons } = require('global-devices') as typeof import('#wbm/global-devices')

// Check
defineRule('PK8_CheckInstance', {
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
defineRule('PK8_Button2ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button2)],
  then: function (newValue) {
    if (newValue) {
      WbDali.setDeviceDapc(3, 0, 180)
    }
  },
})

defineRule('PK8_Button1ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button1)],
  then: function (newValue) {
    if (newValue) {
      WbDali.offDevice(3, 0)
    }
  },
})

defineRule('PK8_Button2LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button2)] == 1
  },
  then: function () {
    WbDali.upDevice(3, 0)
  },
})

defineRule('PK8_Button1LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button1)] == 1
  },
  then: function () {
    WbDali.downDevice(3, 0)
  },
})

// Device 1
defineRule('PK8_Button4ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button4)],
  then: function (newValue) {
    if (newValue) {
      WbDali.setDeviceDapc(3, 1, 180)
    }
  },
})

defineRule('PK8_Button3ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button3)],
  then: function (newValue) {
    if (newValue) {
      WbDali.offDevice(3, 1)
    }
  },
})

defineRule('PK8_Button4LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button4)] == 1
  },
  then: function () {
    WbDali.upDevice(3, 1)
  },
})

defineRule('PK8_Button3LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button3)] == 1
  },
  then: function () {
    WbDali.downDevice(3, 1)
  },
})

// Device 2
defineRule('PK8_Button6ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button6)],
  then: function (newValue) {
    if (newValue) {
      WbDali.setDeviceDapc(3, 2, 100)
    }
  },
})

defineRule('PK8_Button5ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button5)],
  then: function (newValue) {
    if (newValue) {
      WbDali.setDeviceDapc(3, 2, 0)
    }
  },
})

defineRule('PK8_Button6LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button6)] == 1
  },
  then: function () {
    WbDali.upDevice(3, 2)
  },
})

defineRule('PK8_Button5LongPress', {
  when: function () {
    return dev[WbDali.getLongPressInstanceTopic(3, dali2PK8Buttons.button5)] == 1
  },
  then: function () {
    WbDali.downDevice(3, 2)
  },
})

// Backlight control
defineRule('PK8_Button8ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button8)],
  then: function (newValue) {
    if (newValue) {
      dev['Backlights/cabinet'] = false
      WbDali.stopFeedback(3, dali2PK8Buttons.button7)
      WbDali.stopFeedback(3, dali2PK8Buttons.button8)
    }
  },
})

defineRule('PK8_Button7ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2PK8Buttons.button7)],
  then: function (newValue) {
    if (newValue) {
      dev['Backlights/cabinet'] = true
      WbDali.activateFeedback(3, dali2PK8Buttons.button7)
      WbDali.activateFeedback(3, dali2PK8Buttons.button8)
    }
  },
})
