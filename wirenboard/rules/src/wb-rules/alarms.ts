const tgConf = readConfig('/mnt/data/supervisor/wb-rules-conf/tg.conf') as {
  token: string
  chatId: string
}

const recipients: WbRules.Alarms.TelegramRecipient = {
  'type': 'telegram',
  'token': tgConf.token,
  'chatId': tgConf.chatId,
}

// Импортируем данные датчиков
import { AqaraSensors, AxProSensors, MSWs } from '#wbm/global-devices'
import { objectValues } from '#wbm/helpers'

// Список алармов Zigbee устройств.
const zigbeeAlarms: WbRules.Alarms.Config = {
  'deviceName': 'Zigbee Alarms',
  'deviceTitle': 'Zigbee Alarms',

  'recipients': [recipients],

  'alarms': objectValues(AqaraSensors).map(sensor => ({
    'name': sensor.name,
    'cell': `${sensor.name}/available`,
    'expectedValue': true,
  })),
}

Alarms.load(zigbeeAlarms)

// Список алармов сенсоров сигнализации Ax-Pro.
// Как только у устройства флаг is_updated становится false - приходит оповещение
const axProAlarms: WbRules.Alarms.Config = {
  'deviceName': 'Ax Pro Alarms',
  'deviceTitle': 'Ax Pro Alarms',

  'recipients': [recipients],

  'alarms': Object.keys(AxProSensors).map(sensorId => ({
    'name': sensorId,
    'cell': `${sensorId}/is_updated`,
    'expectedValue': true,
  })),
}

Alarms.load(axProAlarms)

// Список алармов CO2
// Как только уровень становится больше 1000, приходит оповещение
const Co2Alarms: WbRules.Alarms.Config = {
  'deviceName': 'CO2 Alarms',
  'deviceTitle': 'CO2 Alarms',

  'recipients': [recipients],

  'alarms': objectValues(MSWs).map(sensor => ({
    'name': sensor.name,
    'cell': sensor.co2Topic,
    'maxValue': 1000,
  })),
}

Alarms.load(Co2Alarms)
