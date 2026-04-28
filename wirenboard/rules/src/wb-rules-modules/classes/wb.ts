import { ControlBasedClass, DeviceBasedClass } from '#wbm/classes/base'

// Свет включающийся через реле
export class RelayLight extends ControlBasedClass {

  isOn(): boolean {
    log.debug('Control {} is on'.format(this.name))
    return Boolean(this.control?.getValue())
  }

  on() {
    this.setValue(true)
    log.debug('Control {} is on'.format(this.name))
  }

  off() {
    this.setValue(false)
    log.debug('Control {} is off'.format(this.name))
  }

}

// Диммируемые лампы на основе модуля WB-MDM3
export class DimmableLight extends RelayLight {

  setBrightness(percent: number) {
    // device/K1 => device/channel1
    const brightnessControlName = this.name.replace('/K', '/channel')
    const brightnessControl = getControl(brightnessControlName)
    brightnessControl?.setValue(percent)
  }

}

export class RGBLight extends DimmableLight {

  setColor(red: number, green: number, blue: number) {
    const r = this.normalizeColorValue(red)
    const g = this.normalizeColorValue(green)
    const b = this.normalizeColorValue(blue)

    // WbLed color control expects value in "R;G;B" format.
    this.setValue('{0};{1};{2}'.format(r, g, b))

    // For some WbLed controls color is applied via paired "<control>/on" topic.
    const colorOnControl = getControl('{}/on'.format(this.name))
    colorOnControl?.setValue(true)
  }

  private normalizeColorValue(value: number): number {
    if (Number.isNaN(value)) {
      return 0
    }

    return Math.max(0, Math.min(255, Math.round(value)))
  }

}

export class LedLight extends ControlBasedClass {

}

export class MSW extends DeviceBasedClass {

  get temperatureTopic(): string {
    return '{}/Temperature'.format(this.name)
  }

  get temperature(): number {
    return Number(this.device?.getControl('Temperature').getValue())
  }

  get humidityTopic(): string {
    return '{}/Humidity'.format(this.name)
  }

  get humidity(): number {
    return Number(this.device?.getControl('Humidity').getValue())
  }

  get co2Topic(): string {
    return '{}/CO2'.format(this.name)
  }

  get co2(): number {
    return Number(this.device?.getControl('CO2').getValue())
  }

  get airQualityVocTopic(): string {
    return '{}/Air Quality (VOC)'.format(this.name)
  }

  get airQualityVoc(): number {
    return Number(this.device?.getControl('Air Quality (VOC)').getValue())
  }

  get soundLevelTopic(): string {
    return '{}/Sound Level'.format(this.name)
  }

  get soundLevel(): number {
    return Number(this.device?.getControl('Sound Level').getValue())
  }

  get illuminanceTopic(): string {
    return '{}/Illuminance'.format(this.name)
  }

  get illuminance(): number {
    return Number(this.device?.getControl('Illuminance').getValue())
  }

  get maxMotionTopic(): string {
    return '{}/Max Motion'.format(this.name)
  }

  get maxMotion(): number {
    return Number(this.device?.getControl('Max Motion').getValue())
  }

  get currentMotionTopic(): string {
    return '{}/Current Motion'.format(this.name)
  }

  get currentMotion(): number {
    return Number(this.device?.getControl('Current Motion').getValue())
  }

}
