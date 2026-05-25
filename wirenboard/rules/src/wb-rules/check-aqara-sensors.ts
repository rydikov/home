// Проверяем что данные корректно приходят от Датчиков Aqara
import { AqaraSensors } from '#wbm/global-devices'
import { objectValues, checkAvailability, formatTimestampES5 } from '#wbm/helpers'

defineRule('CHECK_AQARA_SENSORS', {
  when: cron('@hourly'),
  then: function () {
    objectValues(AqaraSensors).forEach((aqara_sernsor) => {
      // convert to sec, check last 3 hours
      const isAvailable = checkAvailability(aqara_sernsor.lastSeen / 1000, 3600 * 3)
      if (!isAvailable) {
        aqara_sernsor.setLinkquality(0)
        log.error('Aqara sensor: {} offline, last seen {}'.format(JSON.stringify(aqara_sernsor), formatTimestampES5(aqara_sernsor.lastSeen / 1000)))
      }
    })
  },
})
