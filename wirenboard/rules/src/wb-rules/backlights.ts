const { backlightControls } = require('global-devices') as typeof import('#wbm/global-devices')

defineVirtualDevice('Backlights', {
  title: 'Подсветки',
  cells: backlightControls,
})
