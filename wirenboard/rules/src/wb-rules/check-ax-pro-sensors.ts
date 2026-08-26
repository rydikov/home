// Проверяем что данные корректно приходят от Ax-Pro, если нет или датчик offline, то принудительно ставим все контролы в ошибку
const { AxProSensors } = require('global-devices') as typeof import('#wbm/global-devices')
const { checkAvailability, objectValues } = require('helpers') as typeof import('#wbm/helpers')

defineRule('CHECK_AXPRO_SENSORS', {
  when: cron('@hourly'),
  then: function () {
    objectValues(AxProSensors).forEach((ax_pro_sensor) => {
      const device_is_available = checkAvailability(ax_pro_sensor.lastSeenTimestamp)
      ax_pro_sensor.setIsUpdated(device_is_available)

      const err_msg = ax_pro_sensor.status === 'offline' || !device_is_available ? 'r' : ''
      ax_pro_sensor.setError(err_msg)
    })
  },
})
