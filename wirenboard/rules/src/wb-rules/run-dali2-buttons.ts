import { type Dali2Button } from '#wbm/classes/wb-dali'
import { WbDali } from '#wbm/global-devices'

const dali2Buttons: Record<string, Dali2Button> = {
  'test1': { deviceAddress: 1, intanceNumber: 0 },
  'test2': { deviceAddress: 1, intanceNumber: 1 },
  'test3': { deviceAddress: 1, intanceNumber: 2 },
  'test4': { deviceAddress: 1, intanceNumber: 3 },
  'test5': { deviceAddress: 1, intanceNumber: 4 },
  'test6': { deviceAddress: 1, intanceNumber: 5 },
}

// Device 0
defineRule('Test1ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2Buttons.test1)],
  then: function (newValue) {
    log.debug('ShortPress test 1 Value: {}'.format(newValue))
    WbDali.setDeviceDapc(3, 0, 30)
  },
})

defineRule('Test1LongPress', {
  asSoonAs: function () {
    return WbDali.getLongPressInstanceTopic(3, dali2Buttons.test1)
  },
  then: function (newValue) {
    log.debug('LongPress test 1 Value: {}'.format(newValue))
    WbDali.stepUpDevice(3, 0)
  },
})

defineRule('Test1DoublePress', {
  whenChanged: [WbDali.getDoublePressInstanceTopic(3, dali2Buttons.test1)],
  then: function (newValue) {
    log.debug('DoublePress test 1 Value: {}'.format(newValue))
    WbDali.setDeviceDapc(3, 0, 0)
  },
})

// Device 1
defineRule('Test5ShortPress', {
  whenChanged: [WbDali.getShortPressInstanceTopic(3, dali2Buttons.test5)],
  then: function (newValue) {
    log.debug('ShortPress test 1 Value: {}'.format(newValue))
    WbDali.setDeviceDapc(3, 1, 30)
  },
})

defineRule('Test5LongPress', {
  whenChanged: [WbDali.getLongPressInstanceTopic(3, dali2Buttons.test5)],
  then: function (newValue) {
    log.debug('LongPress test 1 Value: {}'.format(newValue))
    WbDali.stepUpDevice(3, 1)
  },
})

defineRule('Test5DoublePress', {
  whenChanged: [WbDali.getDoublePressInstanceTopic(3, dali2Buttons.test5)],
  then: function (newValue) {
    log.debug('DoublePress test 1 Value: {}'.format(newValue))
    WbDali.setDeviceDapc(3, 1, 0)
  },
})
