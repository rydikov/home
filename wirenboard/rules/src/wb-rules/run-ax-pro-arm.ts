const { AxProAreas, axProStatesEnum } = require('global-devices') as typeof import('#wbm/global-devices')

type AxProState = (typeof axProStatesEnum)[keyof typeof axProStatesEnum]

// Отключаем свет в кабинете, когда подвал встает на охрану
defineRule('ArmGroundFloor', {
  whenChanged: AxProAreas.GroundFloor.name,
  then: function (newValue: AxProState) {
    if (newValue === axProStatesEnum.Armed) {
      log.info('Подвал поставлен на охрану')
    }
  },
})
