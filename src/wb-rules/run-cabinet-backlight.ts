import { PresenceSensors } from '#wbm/global-devices'
import { makeBacklightRule } from '#wbm/rule_makers/backlight'
import { WbDali } from '#wbm/global-devices'

const onFunc = (): void => {
  // RelayLights.Cabinet_01.on()
  WbDali.runScene(3, 0)
  // dlc02.runScene('01', 2)
}

const offFunc = (): void => {
  // RelayLights.Cabinet_01.off()
  // dlc02.offGroup('01', 0)
  WbDali.offGroup(3, '01')
}

const valueFunc = (): boolean => {
  // return RelayLights.Cabinet_01.isOn()
  return false
}

makeBacklightRule(
  'CABINET_BACKLIGHT',
  PresenceSensors.Cabinet,
  'Backlights/cabinet',
  onFunc,
  offFunc,
  valueFunc,
  120000
)
