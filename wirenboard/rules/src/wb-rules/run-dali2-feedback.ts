import { type Dali2Button } from '#wbm/classes/wb-dali'
import { WbDali, dali2MW1Buttons } from '#wbm/global-devices'

const DALI_BUS = 3
const GROUP_00_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '00')
const GROUP_01_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '01')
const GROUP_02_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '02')
const GROUP_03_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '03')
const GROUP_04_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '04')
const GROUP_05_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '05')
const GROUP_06_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '06')
const GROUP_07_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '07')
const GROUP_08_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '08')
const GROUP_09_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '09')
const GROUP_10_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '10')
const GROUP_11_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '11')
const GROUP_12_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '12')
const GROUP_13_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '13')
const GROUP_14_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '14')
const GROUP_15_ACTUAL_LEVEL_TOPIC = WbDali.getGroupActualLevelTopic(DALI_BUS, '15')

let isGroup00Active = WbDali.getGroupActualLevel(DALI_BUS, '00') > 0
let isGroup10Active = WbDali.getGroupActualLevel(DALI_BUS, '10') > 0

// Обновляет feedback только при реальном изменении состояния группы.
// Возвращает актуальное состояние, чтобы вызывающий код сохранил его для следующего события.
function useFeedback(currentIsActive: boolean, prevIsActive: boolean, button: Dali2Button): boolean {
  if (currentIsActive === prevIsActive) {
    return currentIsActive
  }

  if (currentIsActive) {
    WbDali.activateFeedback(DALI_BUS, button)
  }
  else {
    WbDali.stopFeedback(DALI_BUS, button)
  }

  return currentIsActive
}

defineRule('Dali2GroupsFeedback', {
  whenChanged: [
    GROUP_00_ACTUAL_LEVEL_TOPIC,
    GROUP_01_ACTUAL_LEVEL_TOPIC,
    GROUP_02_ACTUAL_LEVEL_TOPIC,
    GROUP_03_ACTUAL_LEVEL_TOPIC,
    GROUP_04_ACTUAL_LEVEL_TOPIC,
    GROUP_05_ACTUAL_LEVEL_TOPIC,
    GROUP_06_ACTUAL_LEVEL_TOPIC,
    GROUP_07_ACTUAL_LEVEL_TOPIC,
    GROUP_08_ACTUAL_LEVEL_TOPIC,
    GROUP_09_ACTUAL_LEVEL_TOPIC,
    GROUP_10_ACTUAL_LEVEL_TOPIC,
    GROUP_11_ACTUAL_LEVEL_TOPIC,
    GROUP_12_ACTUAL_LEVEL_TOPIC,
    GROUP_13_ACTUAL_LEVEL_TOPIC,
    GROUP_14_ACTUAL_LEVEL_TOPIC,
    GROUP_15_ACTUAL_LEVEL_TOPIC,
  ],
  then: function (newValue, deviceId, controlId) {
    const changedTopic = String(deviceId) + '/' + String(controlId)
    const currentIsActive = Number(newValue) > 0

    switch (changedTopic) {

      case GROUP_00_ACTUAL_LEVEL_TOPIC:
        isGroup00Active = useFeedback(currentIsActive, isGroup00Active, dali2MW1Buttons.button6)
        break
      case GROUP_01_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_02_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_03_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_04_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_05_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_06_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_07_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_08_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_09_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_10_ACTUAL_LEVEL_TOPIC:
        isGroup10Active = useFeedback(currentIsActive, isGroup10Active, dali2MW1Buttons.button5)
        break
      case GROUP_11_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_12_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_13_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_14_ACTUAL_LEVEL_TOPIC:
        break
      case GROUP_15_ACTUAL_LEVEL_TOPIC:
        break

    }
  },
})
