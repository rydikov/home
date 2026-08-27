// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { RelayLight, DimmableLight, MSW } = require('classes/wb') as typeof import('#wbm/classes/wb')
const { AqaraSensor } = require('classes/aqara') as typeof import('#wbm/classes/aqara')
const { MTDX62MB } = require('classes/mtdx62-mb') as typeof import('#wbm/classes/mtdx62-mb')
const { AstroTimerCls } = require('classes/other') as typeof import('#wbm/classes/other')
const { AxProSensor, AxProArea } = require('classes/ax-pro') as typeof import('#wbm/classes/ax-pro')
const { DLC02 } = require('classes/dlc-02') as typeof import('#wbm/classes/dlc-02')
const { WBDALI } = require('classes/wb-dali') as typeof import('#wbm/classes/wb-dali')

type RelayLight = InstanceType<typeof RelayLight>
type MSW = InstanceType<typeof MSW>
type AqaraSensor = InstanceType<typeof AqaraSensor>
type MTDX62MB = InstanceType<typeof MTDX62MB>
type AxProSensor = InstanceType<typeof AxProSensor>
type AxProArea = InstanceType<typeof AxProArea>
type Dali2Button = import('#wbm/classes/wb-dali').Dali2Button

export const Location = readConfig('/mnt/data/supervisor/wb-rules-conf/location.conf') as {
  latitude: number
  longitude: number
}

export const CPUs: Record<string, string> = {
  CPU: 'hwmon/CPU Temperature',
}

// Выключатели по группам в комнатах см. docs
export const WallSwitches: Record<string, string> = {
  Room1_1: 'wb-mcm8_138/Input 1',
  Room1_2: 'wb-mcm8_138/Input 2',
  Room1_3: 'wb-mcm8_138/Input 3',
  Room1_4: 'wb-mcm8_138/Input 4',
  Room1_5: 'wb-mcm8_138/Input 5',
  Room1_6: 'wb-mcm8_138/Input 6',
  Room1_7: 'wb-mcm8_138/Input 7',
}

// Обычный свет у которого есть on/off
export const RelayLights: Record<string, RelayLight> = {
  Room1_1: new RelayLight('wb-mr6cv3_217/K1'),
  Room1_2: new RelayLight('wb-mr6cv3_217/K2'),
  Room1_3: new RelayLight('wb-mr6cv3_217/K3'),
  Room1_4: new RelayLight('wb-mr6cv3_217/K4'),
  Room1_5: new RelayLight('wb-mr6cv3_217/K5'),
  Cabinet_01: new RelayLight('wb-mr6cv3_217/K6'),
}

export const MSWs: Record<string, MSW> = {
  Cabinet: new MSW('wb-msw-v4_126'),
}

export const backlightControls: WbRules.ControlOptionsTree = {
  cabinet: {
    title: 'Подсветка в кабинете',
    type: 'switch',
    value: true,
  },
  main_staircase: {
    title: 'Подсветка основной лестницы',
    type: 'switch',
    value: true,
  },
  first_floor: {
    title: 'Подсветка первого этажа',
    type: 'switch',
    value: true,
  },
  second_floor: {
    title: 'Подсветка второго этажа',
    type: 'switch',
    value: true,
  },
  bathroom_first_floor: {
    title: 'Подсветка санузла на первом этаже',
    type: 'switch',
    value: true,
  },
  bathroom_second_floor: {
    title: 'Подсветка ванной комнаты на втором этаже',
    type: 'switch',
    value: true,
  },
  toilet_second_floor: {
    title: 'Подсветка в туалете на втором этаже',
    type: 'switch',
    value: true,
  },
}

// Диммируемый свет на MDM3, в настройках модуля должны быть установки для лампы
// export const DimmableLights: Record<string, DimmableLight> = {
//   Cabinet: new DimmableLight('wb-mdm3_77/K1'),
// }

// Датчики температуры/влажности Aqara
export const AqaraSensors: Record<string, AqaraSensor> = {
  Cabinet_01: new AqaraSensor('AqaraTS01'),
  DimasRoom_01: new AqaraSensor('WSDCGQ11LM_0x00158d0008f2ff00'),
}

// Датчики присутствия
export const PresenceSensors: Record<string, MTDX62MB> = {
  Cabinet: new MTDX62MB('mtdx62-mb_7'),
}

export enum axProStatesEnum {
  Armed = 1,
  StayArmed = 2,
  Disarmed = 3
}

export const AxProAreas: Record<string, AxProArea> = {
  GroundFloor: new AxProArea('AxPro/state_01', 'Подвал'),
  Bar: new AxProArea('AxPro/state_02', 'Улица'),
  Outdoor: new AxProArea('AxPro/state_03', 'Бар'),
}

// Астрономический таймер
export const AstroTimer = new AstroTimerCls('AstroTimer')

// DLC-02
export const dlc02 = new DLC02('192.168.1.81')

// WB-DALI
export const WbDali = new WBDALI('wb-dali_87')

export const dali2MW1Buttons: Record<string, Dali2Button> = {
  'button1': { deviceAddress: 1, instanceNumber: 5 },
  'button2': { deviceAddress: 1, instanceNumber: 3 },
  'button3': { deviceAddress: 1, instanceNumber: 1 },
  'button4': { deviceAddress: 1, instanceNumber: 4 },
  'button5': { deviceAddress: 1, instanceNumber: 2 },
  'button6': { deviceAddress: 1, instanceNumber: 0 },
}

export const dali2PK8Buttons: Record<string, Dali2Button> = {
  'button1': { deviceAddress: 2, instanceNumber: 7 },
  'button2': { deviceAddress: 2, instanceNumber: 6 },
  'button3': { deviceAddress: 2, instanceNumber: 5 },
  'button4': { deviceAddress: 2, instanceNumber: 4 },
  'button5': { deviceAddress: 2, instanceNumber: 3 },
  'button6': { deviceAddress: 2, instanceNumber: 2 },
  'button7': { deviceAddress: 2, instanceNumber: 1 },
  'button8': { deviceAddress: 2, instanceNumber: 0 },
}

// Датчики AxPro
export const AxProSensors: Record<string, AxProSensor> = {
  'ax-pro-1': new AxProSensor('ax-pro-1', 'ДТ Улица', true),
  'ax-pro-2': new AxProSensor('ax-pro-2', 'ДТ Погреб', true),
  'ax-pro-3': new AxProSensor('ax-pro-3', 'ДД Бар'),
  'ax-pro-4': new AxProSensor('ax-pro-4', 'ДД Склад'),
  'ax-pro-6': new AxProSensor('ax-pro-6', 'ДО Спортзал'),
  'ax-pro-8': new AxProSensor('ax-pro-8', 'ДД Спортзал'),
  'ax-pro-10': new AxProSensor('ax-pro-10', 'ДО Бар'),
  'ax-pro-12': new AxProSensor('ax-pro-12', 'Датчик дыма отключен'),
  'ax-pro-13': new AxProSensor('ax-pro-13', 'Датчик дыма отключен'),
  'ax-pro-11': new AxProSensor('ax-pro-11', 'Уличная сирена'),
}
