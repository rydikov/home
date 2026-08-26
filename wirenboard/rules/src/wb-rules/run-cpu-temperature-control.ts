const { CPUs } = require('global-devices') as typeof import('#wbm/global-devices')

defineRule('CPU_TEMPERATURE_CONTROL', {
  whenChanged: CPUs['CPU'],

  then: (newValue: number) => {
    if (newValue > 55) {
      log.debug('CPU Temperature: {}', newValue)
    }
  },
})
