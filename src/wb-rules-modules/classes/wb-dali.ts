import { DeviceBasedClass } from '#wbm/classes/base'

// Класс для WB-DALI
export class WBDALI extends DeviceBasedClass {

  runScene(bus: number, scene: number, address = 'FF'): void {
    if (address === 'FF') {
      const sceneControlTopic = '{}_bus_{}_broadcast/controls/go_to_scene'.format(this.name, bus)
      const sceneControl = getControl(sceneControlTopic)
      sceneControl?.setValue(scene)
    }
  }

  offGroup(bus: number, groupNumber: string): void {
    const groupControlTopic = '{}_bus_{}_group_/controls/off'.format(this.name, bus, groupNumber)
    const groupControl = getControl(groupControlTopic)
    groupControl?.setValue(false)
  }

}
