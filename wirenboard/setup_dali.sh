#!/bin/sh

set -eu

# Usage example:
#   ./setup_dali.sh

readonly GATEWAY="wb-dali_22"
readonly BUS="3"
readonly GROUP="0"
readonly ADDRESSES="0 1"
readonly FADE_TIME_SECONDS="1.4"
readonly FADE_TIME_DTR0="3"
readonly FADE_RATE_STEPS_PER_SECOND="179"
readonly FADE_RATE_DTR0="3"
readonly DALI_COMMAND_DELAY_SECONDS="1"

if ! command -v wb-mqtt-dali >/dev/null 2>&1; then
  echo "Error: wb-mqtt-dali command not found" >&2
  exit 1
fi

start_wb_mqtt_dali() {
  echo "Starting wb-mqtt-dali service"
  service wb-mqtt-dali start
}

run_dali_command() {
  wb-mqtt-dali "$@"
  sleep "${DALI_COMMAND_DELAY_SECONDS}"
}

set_dtr0() {
  value="$1"

  run_dali_command \
    --send-command "${GATEWAY}" \
    --bus "${BUS}" \
    --command DTR0 \
    --data "${value}"
}

send_address_command() {
  address="$1"
  command="$2"

  run_dali_command \
    --send-command "${GATEWAY}" \
    --bus "${BUS}" \
    --address "${address}" \
    --command "${command}"
}

echo "Stopping wb-mqtt-dali service"
service wb-mqtt-dali stop
trap start_wb_mqtt_dali EXIT

echo "Configuring DALI devices ${ADDRESSES} on gateway ${GATEWAY}, bus ${BUS}"

for address in ${ADDRESSES}; do
  echo "Adding short address ${address} to group ${GROUP}"
  run_dali_command \
    --send-command "${GATEWAY}" \
    --bus "${BUS}" \
    --address "${address}" \
    --command AddToGroup \
    --data "${GROUP}"

  echo "Setting fade time ${FADE_TIME_SECONDS}s for short address ${address}"
  set_dtr0 "${FADE_TIME_DTR0}"
  send_address_command "${address}" SetFadeTime

  echo "Setting fade rate ${FADE_RATE_STEPS_PER_SECOND} steps/s for short address ${address}"
  set_dtr0 "${FADE_RATE_DTR0}"
  send_address_command "${address}" SetFadeRate
done

echo "Done"
