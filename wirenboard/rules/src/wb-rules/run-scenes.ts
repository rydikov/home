import { WbDali } from '#wbm/global-devices'

defineVirtualDevice('scenes', {
  title: 'Сценарии',
  cells: {
    'relax_evening': { type: 'pushbutton' },
    'movie_night': { type: 'pushbutton' },
    'morning_routine': { type: 'pushbutton' },
  },
})

defineRule('Scene_Control', {
  whenChanged: ['scenes/relax_evening', 'scenes/movie_night', 'scenes/morning_routine'],
  then: function (newValue, devName, cellName) {
    log.debug(newValue)
    log.debug(devName)
    log.debug(cellName)

    if (cellName == 'relax_evening') {
      log.debug('Сцена Расслабляющий вечер активирована')
      WbDali.runScene(3, 0)
    }
    if (cellName == 'movie_night') {
      log.debug('Сцена Киновечер активирована')
      WbDali.offGroup(3, '01')
    }
    if (cellName == 'morning_routine') {
      log.debug('Сцена Утро активирована')
    }
  },
})
