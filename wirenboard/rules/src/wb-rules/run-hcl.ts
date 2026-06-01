import { calculateHCLTemperature } from '#wbm/hcl'
import { Location, WbDali } from '#wbm/global-devices'

let prevTemp = -1
const MIN_TEMP_DELTA_K = 20

// HCL применяется ко всем устройствам в группе 00
// Важно чтобы в настройках балластво были установлены FADE TIME 3-5 сек
// Температура пишется в устройство независимо от того включено оно или нет
defineRule('HCL_DALI_GROUP_00_TEMPERATURE', {
  when: cron('@every 600s'),
  then: function () {
    const colorTempK = calculateHCLTemperature(Location.latitude, Location.longitude)

    // Не отправляем DALI команду, если разница в 20K
    if (Math.abs(colorTempK - prevTemp) >= MIN_TEMP_DELTA_K) {
      prevTemp = colorTempK
      log.debug('Set HCL Temperature: {} K'.format(colorTempK))
      WbDali.setGroupColourTemperature(3, '00', colorTempK)
    }
    else {
      log.debug('Skip HCL Temperature: {} K, previous: {} K'.format(colorTempK, prevTemp))
    }
  },
})
