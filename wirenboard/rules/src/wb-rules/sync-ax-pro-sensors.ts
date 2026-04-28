// Синхронизация температуры датчиков охранной системы с виртуальным устройством ВБ
// AxPro пишет своё состояние в корневой топик ax-pro-xx где xx это номер датчика
// При изменении топика, значения из него присваиваются значению виртуального устройства AxPro
import { AxProSensors } from '#wbm/global-devices'
import { formatTimestampES5, objectValues } from '#wbm/helpers'

const cells: WbRules.ControlOptionsTree = {
  temperature: {
    title: 'Температура',
    type: 'value',
    units: 'deg C',
    value: 0,
    order: 0,
  },
  charge_value: {
    title: 'Процент заряда',
    type: 'value',
    units: '%',
    value: 0,
  },
  status: {
    title: 'Статус',
    type: 'text',
    value: '',
  },
  last_seen: {
    title: 'Последний раз в сети',
    type: 'text',
    value: '',
  },
  is_updated: {
    title: 'Данные актуальны',
    type: 'switch',
    readonly: true,
    value: true,
  },
  last_seen_timestamp: {
    title: 'Последний раз в сети',
    type: 'value',
    value: 0,
    precision: 1,
  },
}

objectValues(AxProSensors).forEach((d) => {
  const v_dev = defineVirtualDevice(d.name, {
    title: d.title,
    cells: cells,
  })
  if (d.has_humidity) {
    v_dev.addControl('humidity', {
      title: 'Влажность',
      type: 'value',
      units: '%, RH',
      value: 0,
      max: 100,
      min: 1,
    })
  }
})

interface SensorMessage {
  temperature: string
  chargeValue: string
  status: string
  last_seen: number
  humidity: string
}

// Sync with virtual device
trackMqtt('ax-pro/sensors/#', (message: { topic: string, value: string }) => {
  const value = JSON.parse(message.value) as SensorMessage

  const parts = message.topic.split('/')
  const sensorId = parts[2] // sensor_id
  const devName = 'ax-pro-' + sensorId

  const device = getDevice(devName)

  if (device !== undefined) {
    device.getControl('temperature').setValue(value.temperature)
    device.getControl('charge_value').setValue('chargeValue' in value ? value.chargeValue : 0)
    device.getControl('status').setValue(value.status)
    device.getControl('is_updated').setValue(true)
    device.getControl('last_seen_timestamp').setValue(value.last_seen)
    device.getControl('last_seen').setValue(formatTimestampES5(value.last_seen * 1000)) // s to ms

    if (device.isControlExists('humidity')) {
      device.getControl('humidity').setValue('humidity' in value ? value.humidity : 0)
    };
  }
})
