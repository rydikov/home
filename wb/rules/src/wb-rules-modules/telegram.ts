// Отправка сообщения в свой чат
export function sendTgMessage(message: string) {
  const tgConf = readConfig('/mnt/data/supervisor/wb-rules-conf/tg.conf') as {
    token: string
    chatId: string
  }

  Notify.sendTelegramMessage(tgConf.token, tgConf.chatId, message)
};
