import { DeviceBasedClass } from '#wbm/classes/base'

// Класс для WB-DALI
export class WBDALI extends DeviceBasedClass {

  runScene(bus: number, scene: number, address = 'FF'): void {
    if (address === 'FF') {
      const sceneControlTopic = '{}_bus_{}_broadcast/go_to_scene/on'.format(this.name, bus)
      log.debug(sceneControlTopic)
      const sceneControl = getControl(sceneControlTopic)
      sceneControl?.setValue(scene)
    }
  }

  offGroup(bus: number, groupAddress: string): void {
    const groupControlTopic = '{}_bus_{}_group_{}/off/on'.format(this.name, bus, groupAddress)
    log.debug(groupControlTopic)
    const groupControl = getControl(groupControlTopic)
    groupControl?.setValue(1)
  }

  setGroupBrightness(bus: number, groupAddress: string, brightness: number): void {
    const groupControlTopic = '{}_bus_{}_group_{}/wanted_level/on'.format(this.name, bus, groupAddress)
    log.debug(groupControlTopic)
    const groupControl = getControl(groupControlTopic)
    groupControl?.setValue(brightness)
  }

  setGroupColourTemperature(bus: number, groupAddress: string, colourTemperature: number): void {
    const groupControlTopic = '{}_bus_{}_group_{}/set_colour_temperature/on'.format(this.name, bus, groupAddress)
    log.debug(groupControlTopic)
    const groupControl = getControl(groupControlTopic)
    groupControl?.setValue(colourTemperature)
  }

}
