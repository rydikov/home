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
readonly POWER_ON_LEVEL_NAME="Off"
readonly POWER_ON_LEVEL_DTR0="0"
readonly SYSTEM_FAILURE_LEVEL_NAME="Off"
readonly SYSTEM_FAILURE_LEVEL_DTR0="0"
readonly SCENE_0="0"
readonly SCENE_0_BRIGHTNESS_PERCENT="30"
readonly SCENE_0_BRIGHTNESS_DTR0="210"
readonly SCENE_0_COLOR_TEMPERATURE_K="3000"
readonly SCENE_0_COLOR_TEMPERATURE_DTR0="77"
readonly SCENE_0_COLOR_TEMPERATURE_DTR1="1"
readonly SCENE_1="1"
readonly SCENE_1_BRIGHTNESS_PERCENT="50"
readonly SCENE_1_BRIGHTNESS_DTR0="229"
readonly SCENE_1_COLOR_TEMPERATURE_K="4000"
readonly SCENE_1_COLOR_TEMPERATURE_DTR0="250"
readonly SCENE_1_COLOR_TEMPERATURE_DTR1="0"
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

set_dtr1() {
  value="$1"

  run_dali_command \
    --send-command "${GATEWAY}" \
    --bus "${BUS}" \
    --command DTR1 \
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

send_address_command_with_data() {
  address="$1"
  command="$2"
  data="$3"

  run_dali_command \
    --send-command "${GATEWAY}" \
    --bus "${BUS}" \
    --address "${address}" \
    --command "${command}" \
    --data "${data}"
}

send_group_command() {
  group="$1"
  command="$2"

  run_dali_command \
    --send-command "${GATEWAY}" \
    --bus "${BUS}" \
    --group "${group}" \
    --command "${command}"
}

send_group_command_with_data() {
  group="$1"
  command="$2"
  data="$3"

  run_dali_command \
    --send-command "${GATEWAY}" \
    --bus "${BUS}" \
    --group "${group}" \
    --command "${command}" \
    --data "${data}"
}

set_address_level_setting() {
  address="$1"
  label="$2"
  dtr0_value="$3"
  command="$4"

  echo "Setting ${label} level for short address ${address}"
  set_dtr0 "${dtr0_value}"
  send_address_command "${address}" "${command}"
}

set_group_scene() {
  scene="$1"
  brightness_percent="$2"
  brightness_dtr0="$3"
  color_temperature_k="$4"
  color_temperature_dtr0="$5"
  color_temperature_dtr1="$6"

  echo "Setting scene ${scene} for group ${GROUP}: brightness ${brightness_percent}%, color temperature ${color_temperature_k}K"

  set_dtr0 "${color_temperature_dtr0}"
  set_dtr1 "${color_temperature_dtr1}"
  send_group_command "${GROUP}" DT8.SetTemporaryColourTemperature
  set_dtr0 "${brightness_dtr0}"
  send_group_command_with_data "${GROUP}" SetScene "${scene}"
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

  set_address_level_setting "${address}" "power-on ${POWER_ON_LEVEL_NAME}" "${POWER_ON_LEVEL_DTR0}" SetPowerOnLevel
  set_address_level_setting "${address}" "system failure ${SYSTEM_FAILURE_LEVEL_NAME}" "${SYSTEM_FAILURE_LEVEL_DTR0}" SetSystemFailureLevel
done

# Set scene 0: brightness 30%, color temperature 3000K.
set_group_scene \
  "${SCENE_0}" \
  "${SCENE_0_BRIGHTNESS_PERCENT}" \
  "${SCENE_0_BRIGHTNESS_DTR0}" \
  "${SCENE_0_COLOR_TEMPERATURE_K}" \
  "${SCENE_0_COLOR_TEMPERATURE_DTR0}" \
  "${SCENE_0_COLOR_TEMPERATURE_DTR1}"

# Set scene 1: brightness 50%, color temperature 4000K.
set_group_scene \
  "${SCENE_1}" \
  "${SCENE_1_BRIGHTNESS_PERCENT}" \
  "${SCENE_1_BRIGHTNESS_DTR0}" \
  "${SCENE_1_COLOR_TEMPERATURE_K}" \
  "${SCENE_1_COLOR_TEMPERATURE_DTR0}" \
  "${SCENE_1_COLOR_TEMPERATURE_DTR1}"

echo "Done"
