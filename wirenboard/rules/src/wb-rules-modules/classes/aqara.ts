const { DeviceBasedClass } = require('classes/base') as typeof import('./base')

// Класс для датчика температуры и влажности Aqara
export class AqaraSensor extends DeviceBasedClass {

  get lastSeenTopic(): string {
    return '{}/last_seen'.format(this.name)
  }

  get lastSeen(): string {
    return String(this.device?.getControl('last_seen')?.getValue())
  }

  get humidityTopic(): string {
    return '{}/humidity'.format(this.name)
  }

  get humidity(): number {
    return Number(this.device?.getControl('humidity')?.getValue())
  }

  get temperatureTopic(): string {
    return '{}/temperature'.format(this.name)
  }

  get temperature(): number {
    return Number(this.device?.getControl('temperature')?.getValue())
  }

  setLinkquality(value: number) {
    this.device?.getControl('linkquality')?.setValue(value)
  }

  setError(errMsg: string) {
    this.device?.controlsList().forEach(function (ctrl) {
      ctrl.setError(errMsg)
    })
  }

}
