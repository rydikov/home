import { WbDali, dali2MW1Buttons } from '#wbm/global-devices'

const DALI_BUS = 3
const DALI_GROUP = '00'
const feedbackButton = dali2MW1Buttons.button6

let isGroup0Active = WbDali.getGroupActualLevel(DALI_BUS, DALI_GROUP) > 0

defineRule('Dali2Group0Feedback', {
  whenChanged: WbDali.getGroupActualLevelTopic(DALI_BUS, DALI_GROUP),
  then: function (newValue) {
    const nextIsActive = Number(newValue) > 0

    if (nextIsActive === isGroup0Active) {
      return
    }

    isGroup0Active = nextIsActive

    if (nextIsActive) {
      WbDali.activateFeedback(DALI_BUS, feedbackButton)
    }
    else {
      WbDali.stopFeedback(DALI_BUS, feedbackButton)
    }
  },
})
