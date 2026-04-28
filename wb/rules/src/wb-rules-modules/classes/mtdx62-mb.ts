import { DeviceBasedClass } from '#wbm/classes/base'

// Класс для датчика присутствия mtdx62-mb
export class MTDX62MB extends DeviceBasedClass {

  get presenceStatusTopic(): string {
    return '{}/presence_status'.format(this.name)
  }

  get presenceStatus(): boolean {
    return Boolean(this.device?.getControl('presence_status').getValue())
  }

  get illuminanceTopic(): string {
    return '{}/illuminance'.format(this.name)
  }

  get illuminance(): number {
    return Number(this.device?.getControl('illuminance').getValue())
  }

  get targetDistanceTopic(): string {
    return '{}/target_distance'.format(this.name)
  }

  get targetDistance(): number {
    return Number(this.device?.getControl('target_distance').getValue())
  }

}
