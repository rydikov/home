const { AstroTimer, PresenceSensors, WbDali, Location } = require('global-devices') as typeof import('#wbm/global-devices')
const { makeBacklightRule } = require('rule_makers/backlight') as typeof import('#wbm/rule_makers/backlight')
const { calculateHCLBrightness } = require('hcl') as typeof import('#wbm/hcl')

const onFunc = (): void => {
  // RelayLights.Cabinet_01.on()
  // WbDali.runScene(3, 0)
  // dlc02.runScene('01', 2)
  const brightness = calculateHCLBrightness(Location.latitude, Location.longitude)
  log.debug('Set HCL Brightness for backlight: {}%'.format(brightness))
  WbDali.setGroupBrightness(3, '00', brightness)
}

const offFunc = (): void => {
  // RelayLights.Cabinet_01.off()
  // dlc02.offGroup('01', 0)
  WbDali.setGroupDapc(3, '00', 0)
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
