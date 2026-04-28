import { DeviceBasedClass } from '#wbm/classes/base'

// Класс для WB-DALI
export class WBDALI extends DeviceBasedClass {

  runScene(bus: number, scene: number, address = 'FF'): void {
    if (address === 'FF') {
      const sceneControlTopic = '{}_bus_{}_broadcast/go_to_scene'.format(this.name, bus)
      log.debug(sceneControlTopic)
      const sceneControl = getControl(sceneControlTopic)
      sceneControl?.setValue(scene)
    }
  }

  offGroup(bus: number, groupNumber: string): void {
    const groupControlTopic = '{}_bus_{}_group_{}/off'.format(this.name, bus, groupNumber)
    log.debug(groupControlTopic)
    const groupControl = getControl(groupControlTopic)
    groupControl?.setValue(false)
  }

}
