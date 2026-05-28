import { DeviceBasedClass } from '#wbm/classes/base'

// Класс для WB-DALI
export class WBDALI extends DeviceBasedClass {

  private getGroupControlTopic(bus: number, groupAddress: string, control: string): string {
    return '{}_bus_{}_group_{}/{}'.format(this.name, bus, groupAddress, control)
  }

  private setGroupControlValue(bus: number, groupAddress: string, control: string, value: number): void {
    const groupControlTopic = this.getGroupControlTopic(bus, groupAddress, control)
    log.debug(groupControlTopic)
    const groupControl = getControl(groupControlTopic)
    groupControl?.setValue(value)
  }

  private getGroupControlValue(bus: number, groupAddress: string, control: string): number {
    const groupControlTopic = this.getGroupControlTopic(bus, groupAddress, control)
    log.debug(groupControlTopic)
    const groupControl = getControl(groupControlTopic)
    return Number(groupControl?.getValue())
  }

  runScene(bus: number, scene: number, address = 'FF'): void {
    if (address === 'FF') {
      const sceneControlTopic = '{}_bus_{}_broadcast/go_to_scene/on'.format(this.name, bus)
      log.debug(sceneControlTopic)
      const sceneControl = getControl(sceneControlTopic)
      sceneControl?.setValue(scene)
    }
  }

  offGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'off/on', 1)
  }

  upGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'up/on', 1)
  }

  downGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'down/on', 1)
  }

  stepUpGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'step_up/on', 1)
  }

  stepDownGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'step_down/on', 1)
  }

  stepDownAndOffGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'step_down_and_off/on', 1)
  }

  onAndStepUpGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'on_and_step_up/on', 1)
  }

  recallGroupMaxLevel(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'recall_max_level/on', 1)
  }

  recallGroupMinLevel(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'recall_min_level/on', 1)
  }

  goToGroupLastActiveLevel(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'go_to_last_active_level/on', 1)
  }

  setGroupBrightness(bus: number, groupAddress: string, brightness: number): void {
    this.setGroupControlValue(bus, groupAddress, 'wanted_level/on', brightness)
  }

  setGroupDapc(bus: number, groupAddress: string, value: number): void {
    this.setGroupControlValue(bus, groupAddress, 'dapc/on', value)
  }

  runGroupScene(bus: number, groupAddress: string, scene: number): void {
    this.setGroupControlValue(bus, groupAddress, 'go_to_scene/on', scene)
  }

  setGroupColourTemperature(bus: number, groupAddress: string, colourTemperature: number): void {
    this.setGroupControlValue(bus, groupAddress, 'set_colour_temperature/on', colourTemperature)
  }

  getGroupActualLevel(bus: number, groupAddress: string): number {
    return this.getGroupControlValue(bus, groupAddress, 'actual_level')
  }

  getGroupCurrentColourTemperature(bus: number, groupAddress: string): number {
    return this.getGroupControlValue(bus, groupAddress, 'current_colour_temperature')
  }

}
