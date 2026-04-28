import { CPUs } from '#wbm/global-devices'

defineRule('CPU_TEMPERATURE_CONTROL', {
  whenChanged: CPUs['CPU'],

  then: function (newValue: number) {
    if (newValue > 55) {
      log.debug('CPU Temperature: {}', newValue)
    }
  },
})
