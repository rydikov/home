// Проверяем что данные корректно приходят от Датчиков Aqara
import { AqaraSensors } from '#wbm/global-devices'
import { objectValues, checkAvailability, formatTimestampES5 } from '#wbm/helpers'

defineRule('CHECK_AQARA_SENSORS', {
  when: cron('@hourly'),
  then: function () {
    objectValues(AqaraSensors).forEach((aqara_sernsor) => {
      // convert to sec, check 3 hours
      const err_msg = checkAvailability(aqara_sernsor.lastSeen / 1000, 3600 * 3) ? '' : 'r'
      // FIXME: Возникает ошибка при попытке установить ошибку
      // aqara_sernsor.setError(err_msg)
      if (err_msg === 'r') {
        log.error('Aqara sensor: {} offline, last seen {}'.format(JSON.stringify(aqara_sernsor), formatTimestampES5(aqara_sernsor.lastSeen / 1000)))
      }
    })
  },
})
