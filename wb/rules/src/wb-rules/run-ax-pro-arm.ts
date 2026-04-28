import { AxProAreas, axProStatesEnum } from '#wbm/global-devices'

// Отключаем свет в кабинете, когда подвал встает на охрану
defineRule('ArmGroundFloor', {
  whenChanged: AxProAreas.GroundFloor.name,
  then: function (newValue: axProStatesEnum) {
    if (newValue === axProStatesEnum.Armed) {
      log.info('Подвал поставлен на охрану')
    }
  },
})
