import { DeviceBasedClass, ControlBasedClass } from '#wbm/classes/base'

// Класс для датчика температуры и влажности Aqara
export class AxProSensor extends DeviceBasedClass {

  title: string
  has_humidity: boolean

  constructor(
    name: string,
    title: string,
    has_humidity = false
  ) {
    super(name)
    this.title = title
    this.has_humidity = has_humidity
  }

  get lastSeenTimestamp(): number {
    return Number(this.device?.getControl('last_seen_timestamp').getValue())
  }

  get status(): string {
    return String(this.device?.getControl('last_seen_timestamp').getValue())
  }

  get humidityTopic(): string {
    return '{}/humidity'.format(this.name)
  }

  get humidity(): number {
    if (this.has_humidity) {
      return Number(this.device?.getControl('humidity').getValue())
    }
    else {
      return 0
    }
  }

  get temperatureTopic(): string {
    return '{}/temperature'.format(this.name)
  }

  get temperature(): number {
    return Number(this.device?.getControl('temperature').getValue())
  }

  setIsUpdated(isUpdated: boolean) {
    log.debug('AxPro sensor: {} isUpdated {}'.format(JSON.stringify(this.device), isUpdated))
    this.device?.getControl('is_updated').setValue(isUpdated)
  }

  setError(errMsg: string) {
    this.device?.controlsList().forEach(function (ctrl) {
      ctrl.setError(errMsg)
    })
  }

}

export class AxProArea extends ControlBasedClass {

  title: string

  constructor(
    name: string,
    title: string
  ) {
    super(name)
    this.title = title
  }

}
