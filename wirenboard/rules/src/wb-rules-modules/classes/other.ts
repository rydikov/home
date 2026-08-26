const { DeviceBasedClass } = require('classes/base') as typeof import('./base')

// Класс Астрономического таймера
export class AstroTimerCls extends DeviceBasedClass {

  get isDayTopic(): string {
    return '{}/is_day'.format(this.name)
  }

  get isDay(): boolean {
    return Boolean(this.device?.getControl('is_day')?.getValue())
  }

}
