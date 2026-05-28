// Проверяем что данные корректно приходят от Датчиков Aqara
import { AqaraSensors } from '#wbm/global-devices'
import { objectValues, checkAvailability, formatTimestampES5 } from '#wbm/helpers'

defineRule('CHECK_AQARA_SENSORS', {
  when: cron('@hourly'),
  then: function () {
    objectValues(AqaraSensors).forEach((aqara_sensor) => {
      // convert to sec, check last 3 hours
      const lastSeen = lastSeenDateToTimestamp(aqara_sensor.lastSeen)
      const isAvailable = checkAvailability(lastSeen / 1000, 3600 * 3)
      if (!isAvailable) {
        aqara_sensor.setLinkquality(0)
        log.error('Aqara sensor: {} offline, last seen {}'.format(JSON.stringify(aqara_sensor), formatTimestampES5(lastSeen)))
      }
    })
  },
})

function lastSeenDateToTimestamp(lastSeen: string): number {
  return new Date(lastSeen).getTime()
}
