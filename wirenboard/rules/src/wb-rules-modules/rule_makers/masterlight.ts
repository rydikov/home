const { RelayLight } = require('classes/wb') as typeof import('#wbm/classes/wb')

type RelayLight = InstanceType<typeof RelayLight>

export function makeMasterControlRule(options: {
  ruleName: string
  control: string
  loads: RelayLight[]
}) {
  const { ruleName, control, loads } = options

  defineRule(ruleName, {
    whenChanged: control,
    then: function (newValue) {
      if (!newValue)
        return

      loads.forEach((load) => {
        load.off()
      })

      log.debug('Весь свет выключен')
    },
  })
}
