import { DeviceBasedClass } from '#wbm/classes/base'

export interface Dali2Button {
  deviceAddress: number
  intanceNumber: number
}

type FeedbackCommand = 'ActivateFeedback' | 'StopFeedback'

// Класс для WB-DALI
export class WBDALI extends DeviceBasedClass {

  private getGroupControlTopic(bus: number, groupAddress: string, control: string): string {
    return '{}_bus_{}_group_{}/{}'.format(this.name, bus, groupAddress, control)
  }

  private getDeviceControlTopic(bus: number, deviceAddress: number, control: string): string {
    return '{}_bus_{}_{}/{}'.format(this.name, bus, deviceAddress, control)
  }

  private setGroupControlValue(bus: number, groupAddress: string, control: string, value: number | boolean): void {
    const groupControlTopic = this.getGroupControlTopic(bus, groupAddress, control)
    log.debug(groupControlTopic)
    const groupControl = getControl(groupControlTopic)
    groupControl?.setValue(value)
  }

  private setDeviceControlValue(bus: number, deviceAddress: number, control: string, value: number | boolean): void {
    const deviceControlTopic = this.getDeviceControlTopic(bus, deviceAddress, control)
    log.debug(deviceControlTopic)
    const deviceControl = getControl(deviceControlTopic)
    deviceControl?.setValue(value)
  }

  private getGroupControlValue(bus: number, groupAddress: string, control: string): number {
    const groupControlTopic = this.getGroupControlTopic(bus, groupAddress, control)
    log.debug(groupControlTopic)
    const groupControl = getControl(groupControlTopic)
    return Number(groupControl?.getValue())
  }

  private getDeviceControlValue(bus: number, deviceAddress: number, control: string): number {
    const deviceControlTopic = this.getDeviceControlTopic(bus, deviceAddress, control)
    log.debug(deviceControlTopic)
    const deviceControl = getControl(deviceControlTopic)
    return Number(deviceControl?.getValue())
  }

  private publishSendCommand(bus: number, clientId: string, command: string): void {
    publish('/rpc/v1/wb-mqtt-dali/Bus/SendCommand/{}'.format(clientId), JSON.stringify({
      id: 1,
      params: {
        busId: this.getBusId(bus),
        commands: [command],
      },
    }))
  }

  private getFeedbackCommand(command: FeedbackCommand, dali2Button: Dali2Button): string {
    return 'FF24.F32.{}(A{}, I{})'.format(command, dali2Button.deviceAddress, dali2Button.intanceNumber)
  }

  runScene(bus: number, scene: number, address = 'FF'): void {
    if (address === 'FF') {
      const sceneControlTopic = '{}_bus_{}_broadcast/go_to_scene'.format(this.name, bus)
      log.debug(sceneControlTopic)
      const sceneControl = getControl(sceneControlTopic)
      sceneControl?.setValue(scene)
    }
  }

  // Groups

  getBusId(bus: number): string {
    return '{}_bus_{}'.format(this.name, bus)
  }

  getGroupActualLevelTopic(bus: number, groupAddress: string): string {
    return this.getGroupControlTopic(bus, groupAddress, 'actual_level')
  }

  offGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'off', true)
  }

  upGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'up', 1)
  }

  downGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'down', 1)
  }

  stepUpGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'step_up', 1)
  }

  stepDownGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'step_down', 1)
  }

  stepDownAndOffGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'step_down_and_off', 1)
  }

  onAndStepUpGroup(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'on_and_step_up', 1)
  }

  recallGroupMaxLevel(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'recall_max_level', 1)
  }

  recallGroupMinLevel(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'recall_min_level', 1)
  }

  goToGroupLastActiveLevel(bus: number, groupAddress: string): void {
    this.setGroupControlValue(bus, groupAddress, 'go_to_last_active_level', 1)
  }

  setGroupBrightness(bus: number, groupAddress: string, brightness: number): void {
    this.setGroupControlValue(bus, groupAddress, 'wanted_level', brightness)
  }

  setGroupDapc(bus: number, groupAddress: string, value: number): void {
    this.setGroupControlValue(bus, groupAddress, 'dapc', value)
  }

  runGroupScene(bus: number, groupAddress: string, scene: number): void {
    this.setGroupControlValue(bus, groupAddress, 'go_to_scene', scene)
  }

  setGroupColourTemperature(bus: number, groupAddress: string, colourTemperature: number): void {
    this.setGroupControlValue(bus, groupAddress, 'set_colour_temperature', colourTemperature)
  }

  getGroupActualLevel(bus: number, groupAddress: string): number {
    return this.getGroupControlValue(bus, groupAddress, 'actual_level')
  }

  getGroupCurrentColourTemperature(bus: number, groupAddress: string): number {
    return this.getGroupControlValue(bus, groupAddress, 'current_colour_temperature')
  }

  // Devices

  offDevice(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'off', true)
  }

  upDevice(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'up', true)
  }

  downDevice(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'down', true)
  }

  stepUpDevice(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'step_up', true)
  }

  stepDownDevice(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'step_down', true)
  }

  stepDownAndOffDevice(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'step_down_and_off', true)
  }

  onAndStepUpDevice(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'on_and_step_up', true)
  }

  recallDeviceMaxLevel(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'recall_max_level', true)
  }

  recallDeviceMinLevel(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'recall_min_level', true)
  }

  goToDeviceLastActiveLevel(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'go_to_last_active_level', true)
  }

  setDeviceBrightness(bus: number, deviceAddress: number, brightness: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'wanted_level', brightness)
  }

  setDeviceDapc(bus: number, deviceAddress: number, value: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'dapc', value)
  }

  runDeviceScene(bus: number, deviceAddress: number, scene: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'go_to_scene', scene)
  }

  setDeviceColourTemperature(bus: number, deviceAddress: number, colourTemperature: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'set_colour_temperature', colourTemperature)
  }

  stepDeviceColourTemperatureWarmer(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'colour_temperature_step_warmer', true)
  }

  stepDeviceColourTemperatureCooler(bus: number, deviceAddress: number): void {
    this.setDeviceControlValue(bus, deviceAddress, 'colour_temperature_step_cooler', true)
  }

  getDeviceActualLevel(bus: number, deviceAddress: number): number {
    return this.getDeviceControlValue(bus, deviceAddress, 'actual_level')
  }

  getDeviceWantedLevel(bus: number, deviceAddress: number): number {
    return this.getDeviceControlValue(bus, deviceAddress, 'wanted_level')
  }

  getDeviceDapc(bus: number, deviceAddress: number): number {
    return this.getDeviceControlValue(bus, deviceAddress, 'dapc')
  }

  getDeviceErrorStatus(bus: number, deviceAddress: number): number {
    return this.getDeviceControlValue(bus, deviceAddress, 'error_status')
  }

  getDeviceCurrentColourTemperature(bus: number, deviceAddress: number): number {
    return this.getDeviceControlValue(bus, deviceAddress, 'current_colour_temperature')
  }

  getDeviceColourTemperatureStepWarmer(bus: number, deviceAddress: number): number {
    return this.getDeviceControlValue(bus, deviceAddress, 'colour_temperature_step_warmer')
  }

  getDeviceColourTemperatureStepCooler(bus: number, deviceAddress: number): number {
    return this.getDeviceControlValue(bus, deviceAddress, 'colour_temperature_step_cooler')
  }

  // Dali 2

  getShortPressInstanceTopic(bus: number, dali2Button: Dali2Button): string {
    return '{}_bus_{}_dali2_{}/short_press{}'.format(this.name, bus, dali2Button.deviceAddress, dali2Button.intanceNumber)
  }

  getLongPressInstanceTopic(bus: number, dali2Button: Dali2Button): string {
    return '{}_bus_{}_dali2_{}/long_press{}'.format(this.name, bus, dali2Button.deviceAddress, dali2Button.intanceNumber)
  }

  getDoublePressInstanceTopic(bus: number, dali2Button: Dali2Button): string {
    return '{}_bus_{}_dali2_{}/double_press{}'.format(this.name, bus, dali2Button.deviceAddress, dali2Button.intanceNumber)
  }

  activateFeedback(bus: number, dali2Button: Dali2Button): void {
    this.publishSendCommand(bus, 'dali2-feedback', this.getFeedbackCommand('ActivateFeedback', dali2Button))
  }

  stopFeedback(bus: number, dali2Button: Dali2Button): void {
    this.publishSendCommand(bus, 'dali2-feedback', this.getFeedbackCommand('StopFeedback', dali2Button))
  }

}
