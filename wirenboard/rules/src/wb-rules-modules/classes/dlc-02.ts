import { toHex, toBinary, binaryToHex } from '#wbm/helpers'

// Modbus function codes used by DLC-02
const FUNCTION_16 = 16 // Write Multiple Registers
const FUNCTION_23 = 23 // Read Write Multiple Registers

// DLC-02 RPC reply payload
export interface RpcReplyPayload {
  result: {
    response: string
  }
}

// DALI address helpers
/**
* Принцип формирования адреса устройства
* | Bit7 | Bit6 | Bit5 | Bit4 | Bit3 | Bit2 | Bit1 | Bit0 |
* | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
* | 0    | 0    | Short address 0–63                      |
*
* И группы
* | Bit7 | Bit6 | Bit5 | Bit4 | Bit3 | Bit2 | Bit1 | Bit0 |
* | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
* | 1    | 0    | 0    | 0    | Group address 0–15        |
*
**/
export function getGroupAddress(address: number): string {
  return binaryToHex('1000' + toBinary(address, 4), 2)
}

export function getDeviceAddress(address: number): string {
  return binaryToHex('00' + toBinary(address, 6), 2)
}

// DLC-02 reply/frame helpers
// Парсим ответ во фрейм "0101010119870000" -> [1, 1, 1, 1, 25, 135, 0, 0]
export function hexToFrame(hex: string): number[] {
  const frame: number[] = []

  for (let i = 0; i < hex.length; i += 2) {
    frame.push(parseInt(hex.substring(i, i + 2), 16))
  }

  return frame
}

/**
 * По спецификации Definition of colour temperature Byte 4 - Byte 7: colour temperature value 0(high/low):
 * - Byte 4 = старший байт (High byte)
 * - Byte 5 = младший байт (Low byte)
 */
export function parseColourTemperature(
  byte4: number,
  byte5: number
): string {
  const kelvin = (byte4 << 8) | byte5
  return '{} K'.format(kelvin)
}

/**
 * По спецификации Definition of brightness value (Byte 4, Byte 5-7 is 0): 0-254:
 * - значение яркости находится в Byte 4
 * - Byte 5-7 должны быть равны 0
 * - значение яркости находится в диапазоне 0..254
 */
export function parseBrightness(byte4: number): string {
  return byte4.toString()
}

/**
 * По спецификации Status value definition (Byte 4, Byte 5-7 are 0): Bit 0: Drive failure, Bit 1: Lamp failure, Bit 2: The light is on:
 * - status value находится в Byte 4
 * - Bit 2 (byte4 & 0x04) = The light is on
 */
export function parseStatus(byte4: number): string {
  return (byte4 & 0x04) !== 0 ? 'Включено' : 'Выключено'
}

/**
 * Проверяет, является ли ответ error frame, и возвращает детализацию ошибки.
 *
 * По спецификации:
 * - Byte 3 = 7 -> Error message
 * - Byte 7 = код ошибки:
 *   - 1 -> DALI line short circuit
 *   - 2 -> DALI receive error
 *
 * Если ошибки нет, возвращает `null`.
 */
export function checkErrorFrame(frame: number[]): string | null {
  if (frame[3] !== 7) {
    return null
  }

  const errorCode = frame[7]
  let errorDetails = 'Unknown error'

  if (errorCode === 1) {
    errorDetails = 'DALI line short circuit'
  }
  else if (errorCode === 2) {
    errorDetails = 'DALI receive error'
  }

  return 'Error: {} ({})'.format(errorCode, errorDetails)
}

/**
 * Разбирает MQTT reply и выбрасывает исключение, если ответ содержит error frame.
 *
 * Возвращает frame как массив байт, если ответ успешный.
 * Если DLC-02 вернул ошибку, выбрасывает `Error` с детализацией.
 */
export function getReplyFrame(
  requestName: string,
  messageValue: string
): number[] {
  log.info('MQTT replay {} topic value: {}'.format(requestName, messageValue))

  const payload = JSON.parse(messageValue) as RpcReplyPayload
  const frame = hexToFrame(payload.result.response)
  const errorDetails = checkErrorFrame(frame)

  if (errorDetails !== null) {
    log.error('{} failed: {}'.format(requestName, errorDetails))
    throw new Error(errorDetails)
  }

  return frame
}

// DLC-02 client
export class DLC02 {

  ip: string
  port: number
  slaveId: number

  constructor(
    ip: string,
    port = 502,
    slaveID = 255
  ) {
    this.ip = ip
    this.port = port
    this.slaveId = slaveID
  }

  publishRpcMessage(
    client: string,
    msg: string,
    fnc: number,
    address: number,
    count: number,
    write_address: number | null,
    write_count: number | null

  ): void {
    const topic = '/rpc/v1/wb-mqtt-serial/port/Load/' + client
    const params: Record<string, number | string> = {
      protocol: 'modbus-tcp',
      ip: this.ip,
      port: this.port,
      slave_id: this.slaveId,
      function: fnc,
      address: address,
      count: count,
      format: 'HEX',
      msg: msg,
      response_size: 12,
      total_timeout: 10000,
    }

    if (write_address !== null) {
      params.write_address = write_address
    }

    if (write_count !== null) {
      params.write_count = write_count
    }

    // Publish to Mqtt
    publish(topic, JSON.stringify({ params: params }))
  }

  /**
   * Запускает сцену через записью 8-байтной команды в holding-регистры,
   * начиная с 41001, через Modbus function 16 (Write Multiple Registers).
   *
   * Формат payload:
   * - `bus`      : 1 байт, номер DALI-шины в hex (`01` или `02`)
   * - `address`  : 1 байт, адрес назначения в hex. No address broadcast: 253(0xFD) roadcast with address: 255(0xFF)
   * - `03`       : DALI-команда Recall Scene
   * - `scene`    : 1 байт, номер сцены в hex (`00`..`0F`)
   * - `00000000` : заполнение до 8 байт / 4 регистров
   *
   * Итого в регистр 41001 записывается сообщение вида:
   * `bus + address + 03 + scene + 00000000`
   *
   * Примеры на шине А:
   * - `runScene('01', 0, '18')` -> устройство 12, сцена 0
   * - `runScene('01', 0)` -> сцена 0
   * - `runScene('01', 0, '80')` -> группа 0, сцена 0
   * - `runScene('01', 10, '82')` -> группа 1, сцена 10
   *
   * Номер сцены передается от 0 до 15, в hex переводится автоматически
  **/
  runScene(bus: string, scene: number, address = 'FF'): void {
    const msg = bus + address + '03' + toHex(scene) + '00000000'
    this.publishRpcMessage('scene-runner', msg, FUNCTION_16, 41001, 4, null, null)
  }

  // Выключаем все лампы в группе
  offGroup(bus: string, groupNumber: number): void {
    const msg = bus + getGroupAddress(groupNumber) + '01' + '00' + '00000000'
    this.publishRpcMessage('group-off', msg, FUNCTION_16, 41001, 4, null, null)
  }

  // Включаем все лампы в группе
  onGroup(bus: string, groupNumber: number): void {
    const msg = bus + getGroupAddress(groupNumber) + '01' + '01' + '00000000'
    this.publishRpcMessage('group-off', msg, FUNCTION_16, 41001, 4, null, null)
  }

  // Установка яркости для группы или одиничного устройства
  setBrightness(bus: string, address: string, value: number): void {
    const msg = bus + address + '02' + toHex(value) + '00000000'
    this.publishRpcMessage('brightness-set', msg, FUNCTION_16, 41001, 4, null, null)
  }

  // Установка цветовой температуры для группы или одиничного устройства (TC)
  setColorTemperature(bus: string, address: string, value: number): void {
    const highByte = toHex((value >> 8) & 0xFF)
    const lowByte = toHex(value & 0xFF)
    const msg = bus + address + '05' + '01' + highByte + lowByte + '0000'
    this.publishRpcMessage('color-temperature-set', msg, FUNCTION_16, 41001, 4, null, null)
  }

  /** Описание последнего байта в msg
  Query selection:
  1: Current brightness value
  2: Status value
  3: current colour type
  4: Current colour temperature value
  5: Warmest colour temperature value
  6: Coolest colour temperature value
  7: Current RGB colour value
  8: Current RGBW colour value
  */
  sendBrightnessRequest(bus: string, address: string): void {
    const msg = '01' + bus + address + '01'
    this.publishRpcMessage('brightness-request', msg, FUNCTION_23, 32001, 4, 42001, 2)
  }

  sendStatusRequest(bus: string, address: string): void {
    const msg = '01' + bus + address + '02'
    this.publishRpcMessage('status-request', msg, FUNCTION_23, 32001, 4, 42001, 2)
  }

  sendColorTemperatureRequest(bus: string, address: string): void {
    const msg = '01' + bus + address + '04'
    this.publishRpcMessage('ct-request', msg, FUNCTION_23, 32001, 4, 42001, 2)
  }

}
