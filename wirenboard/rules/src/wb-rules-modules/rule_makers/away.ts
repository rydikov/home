export interface AwayRuleOptions {
  ruleName: string
  doorTopics: string[]
  presenceTopics: string[]
  timeoutMs: number
  isAway: () => boolean
  onAwayConfirmed: () => void
  onHomeDetected: () => void
}

/**
 * Определяет уход из дома после закрытия одной из дверей и периода без присутствия.
 *
 * Открытие двери или обнаружение присутствия отменяет незавершённую проверку.
 * Когда дом уже находится в статусе «Ушли», первое присутствие возвращает
 * статус «Дома».
 */
export function makeAwayRule(options: AwayRuleOptions) {
  const {
    ruleName,
    doorTopics,
    presenceTopics,
    timeoutMs,
    isAway,
    onAwayConfirmed,
    onHomeDetected,
  } = options

  let awayTimer: number | null = null

  /**
   * Отменяет активный таймер проверки ухода.
   *
   * @returns true, если таймер был запущен и отменён.
   */
  function resetAwayTimer(): boolean {
    if (awayTimer === null) {
      return false
    }

    clearTimeout(awayTimer)
    awayTimer = null
    return true
  }

  /**
   * Проверяет, что все датчики доступны и ни один из них не фиксирует
   * присутствие в момент окончания таймера.
   */
  function canConfirmAway(): boolean {
    /** Возвращает true для недоступного или активного датчика. */
    const hasBlockingSensor = presenceTopics.some(function (presenceTopic) {
      const presenceControl = getControl(presenceTopic)

      if (presenceControl === undefined) {
        log.error(
          'Сценарий ухода: датчик присутствия {} недоступен',
          presenceTopic
        )
        return true
      }

      if (presenceControl.getValue()) {
        log.info(
          'Сценарий ухода отменён: датчик {} фиксирует присутствие',
          presenceTopic
        )
        return true
      }

      return false
    })

    return !hasBlockingSensor
  }

  /** Перезапускает таймер, после которого можно подтвердить уход. */
  function startAwayTimer() {
    resetAwayTimer()

    log.info(
      'Сценарий ухода: дверь закрыта, проверка запущена на {} мс',
      timeoutMs
    )

    /** Завершает проверку и подтверждает уход при отсутствии людей. */
    awayTimer = setTimeout(function () {
      awayTimer = null

      if (!canConfirmAway()) {
        return
      }

      if (isAway()) {
        return
      }

      log.info('Сценарий ухода: присутствие не обнаружено')
      onAwayConfirmed()
    }, timeoutMs) as unknown as number
  }

  defineRule('{}_DOOR'.format(ruleName), {
    whenChanged: doorTopics,
    /** Запускает проверку при закрытии любой двери и отменяет при открытии. */
    then: function (newValue) {
      if (newValue === true) {
        startAwayTimer()
        return
      }

      resetAwayTimer()
      log.info('Сценарий ухода отменён: дверь открыта')
    },
  })

  defineRule('{}_PRESENCE'.format(ruleName), {
    whenChanged: presenceTopics,
    /** Отменяет проверку ухода или сообщает о возвращении домой. */
    then: function (newValue) {
      if (!newValue) {
        return
      }

      const wasAwayTimerActive = resetAwayTimer()

      if (isAway()) {
        log.info('Сценарий ухода: обнаружено возвращение домой')
        onHomeDetected()
        return
      }

      if (wasAwayTimerActive) {
        log.info('Сценарий ухода отменён: обнаружено присутствие')
      }
    },
  })
}
