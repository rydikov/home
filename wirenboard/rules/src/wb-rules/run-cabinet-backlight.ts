import { AstroTimer, PresenceSensors, WbDali } from '#wbm/global-devices'
import { makeBacklightRule } from '#wbm/rule_makers/backlight'

const onFunc = (): void => {
  // RelayLights.Cabinet_01.on()
  WbDali.runScene(3, 0)
  // dlc02.runScene('01', 2)
}

const offFunc = (): void => {
  // RelayLights.Cabinet_01.off()
  // dlc02.offGroup('01', 0)
  // WbDali.offGroup(3, '00')
  WbDali.runScene(3, 15)
}

const valueFunc = (): boolean => {
  // return RelayLights.Cabinet_01.isOn()
  return false
}

const shouldTurnOnBacklightFunc = (): boolean => {
  return !AstroTimer.isDay
}

makeBacklightRule(
  'CABINET_BACKLIGHT',
  PresenceSensors.Cabinet,
  'Backlights/cabinet',
  onFunc,
  offFunc,
  valueFunc,
  AstroTimer.isDayTopic,
  shouldTurnOnBacklightFunc,
  120000
)
