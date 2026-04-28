// Базовый класс для устройств
export class DeviceBasedClass {

  name: string

  constructor(
    name: string
  ) {
    this.name = name
  }

  get device() {
    return getDevice(this.name)
  }

}

// Базовый класс для устройств с равнозначными контролами, реле на несколько выходов и т.д.
// Для каждого контрола создается отдельный управляющий класс
export class ControlBasedClass {

  name: string

  constructor(
    name: string
  ) {
    this.name = name
  }

  get control() {
    return getControl(this.name)
  }

  get topic() {
    return this.name
  }

  value() {
    return this.control?.getValue()
  }

  setValue(value: string | number | boolean) {
    this.control?.setValue(value)
  }

}
