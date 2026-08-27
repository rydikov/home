const { WbDali, dali2MW1Buttons } = require('global-devices') as typeof import('#wbm/global-devices')

// Check
defineRule('MW1_CheckInstance', {
  whenChanged: [
    WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button1),
    WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button2),
    WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button3),
    WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button4),
    WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button5),
    WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button6),
  ],
  then: function (newValue, deviceId, controlId) {
    log.debug('Value: {}, Device {}, Control {}'.format(newValue, String(deviceId), String(controlId)))
  },
})

defineRule('MW1_Button1ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button1)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 0)
    }
  },
})

defineRule('MW1_Button2ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button2)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 1)
    }
  },
})

defineRule('MW1_Button3ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button3)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 2)
    }
  },
})

defineRule('MW1_Button4ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button4)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 3)
    }
  },
})

defineRule('MW1_Button5ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button5)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 4)
    }
  },
})

defineRule('MW1_Button6ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button6)],
  then: function (newValue) {
    if (newValue) {
      WbDali.toggleGroup(3, '10', 127)
    }
  },
})
