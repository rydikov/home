// Синхронизация статуса охранной системы с виртуальным устройством ВБ
// AxPro пишет своё состояние в корневой топик ax-pr
// При изменении топика, значения из него присваиваются значениям виртуального устройства AxPro
import { AxProAreas, axProStatesEnum } from '#wbm/global-devices'
import { AxProArea } from '#wbm/classes/ax-pro'
import { objectValues } from '#wbm/helpers'

const axProStates = {
  [axProStatesEnum.Armed]: { en: 'Armed', ru: 'Под охраной' },
  [axProStatesEnum.StayArmed]: { en: 'Stay armed', ru: 'Ночной режим' },
  [axProStatesEnum.Disarmed]: { en: 'Disarmed', ru: 'Снято с охраны' },
  4: { en: 'Status unknown', ru: 'Состояние неизвестно' },
}

const ciaToState: Record<string, number> = {
  '3401': axProStatesEnum.Armed,
  '3403': axProStatesEnum.Armed, // Auto Armed
  '3441': axProStatesEnum.StayArmed,
  '1401': axProStatesEnum.Disarmed,
}

const partitionsWithDevices: Record<string, AxProArea> = {
  '01': AxProAreas.GroundFloor,
  '02': AxProAreas.Outdoor,
  '03': AxProAreas.Bar,
}

const cells: WbRules.ControlOptionsTree = {}

// Генерация контролов из областей охранной системы
objectValues(AxProAreas).forEach((area) => {
  // 'AxPro/state_01' -> 'state_01'
  const key = area.name.split('/')[1]
  cells[key] = {
    title: area.title,
    type: 'value',
    value: 4,
    enum: axProStates,
  }
})

defineVirtualDevice('AxPro', {
  title: 'Ax Pro',
  cells: cells,
})

// Тип данных из MQTT
interface PartitionMessage {
  cia_code: string
  group_or_partition_number: string
}

// Sync with virtual device
trackMqtt('ax-pro/partitions/#', (message: { topic: string, value: string }) => {
  log.debug('name: {}, value: {}'.format(message.topic, message.value))

  const value = JSON.parse(message.value) as PartitionMessage

  const state = ciaToState[value.cia_code]
  const partition = partitionsWithDevices[value.group_or_partition_number]

  if (state) {
    partition.setValue(state)
  }
})
