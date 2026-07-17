import { WbDali, dali2MW1Buttons } from '#wbm/global-devices'

// Check
defineRule('CheckInstance', {
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

defineRule('Button1ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button1)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 0)
    }
  },
})

defineRule('Button2ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button2)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 1)
    }
  },
})

defineRule('Button3ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button3)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 2)
    }
  },
})

defineRule('Button4ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button4)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 3)
    }
  },
})

defineRule('Button5ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button5)],
  then: function (newValue) {
    if (newValue) {
      WbDali.runGroupScene(3, '10', 4)
    }
  },
})

defineRule('Button6ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2MW1Buttons.button6)],
  then: function (newValue) {
    if (newValue) {
      WbDali.toggleGroup(3, '10', 127)
    }
  },
})
