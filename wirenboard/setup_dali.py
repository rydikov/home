#!/usr/bin/env python3

from __future__ import annotations

import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from typing import Iterable, List, Optional, Tuple


# Пример запуска:
#   ./setup_dali.py

# Базовые параметры DALI-шлюза, шины, группы и коротких адресов светильников.
GATEWAY = "wb-dali_87"
BUS = "3"
GROUP = "0"
ADDRESSES = ("0", "1")

# Пауза между командами, чтобы DALI-устройства успевали обработать настройки.
DALI_COMMAND_DELAY_SECONDS = 1.0


@dataclass(frozen=True)
class DaliValue:
    label: str
    dtr0: str


@dataclass(frozen=True)
class Scene:
    number: str
    brightness_percent: str
    brightness_dtr0: str
    color_temperature_k: str
    color_temperature_dtr0: str
    color_temperature_dtr1: str


@dataclass(frozen=True)
class RgbwScene:
    number: str
    brightness_percent: str
    brightness_dtr0: str
    rgb_dtr: Tuple[str, str, str]
    waf_dtr: Tuple[str, str, str]


# Параметры плавного изменения яркости.
# В label хранится человекочитаемое значение, а в dtr0 — код DALI.
FADE_TIME = DaliValue(label="1.4s", dtr0="3")
FADE_RATE = DaliValue(label="179 steps/s", dtr0="3")

# Уровни яркости при подаче питания и при системной ошибке.
POWER_ON_LEVEL = DaliValue(label="Off", dtr0="0")
SYSTEM_FAILURE_LEVEL = DaliValue(label="Off", dtr0="0")

# Настройки сцен: яркость и цветовая температура.
SCENES = (
    Scene(
        number="0",
        brightness_percent="30",
        brightness_dtr0="210",
        color_temperature_k="3000",
        color_temperature_dtr0="77",
        color_temperature_dtr1="1",
    ),
    Scene(
        number="1",
        brightness_percent="50",
        brightness_dtr0="229",
        color_temperature_k="4000",
        color_temperature_dtr0="250",
        color_temperature_dtr1="0",
    ),
)

# Короткие адреса RGBW-балластов.
RGBW_ADDRESSES = ("2",)

# Настройки сцен для RGBW-балластов.
RGBW_SCENES = (
    RgbwScene(
        number="0",
        brightness_percent="40",
        brightness_dtr0="221",
        rgb_dtr=("0", "153", "204"),
        waf_dtr=("0", "0", "0"),
    ),
    RgbwScene(
        number="1",
        brightness_percent="40",
        brightness_dtr0="221",
        rgb_dtr=("0", "109", "119"),
        waf_dtr=("0", "0", "0"),
    ),
)


class DaliClient:
    def __init__(self, gateway: str, bus: str, delay_seconds: float) -> None:
        self.gateway = gateway
        self.bus = bus
        self.delay_seconds = delay_seconds

    def run(self, args: Iterable[str]) -> None:
        command = ["wb-mqtt-dali"] + list(args)
        subprocess.run(command, check=True)
        time.sleep(self.delay_seconds)

    def send(
        self,
        command: str,
        *,
        address: Optional[str] = None,
        group: Optional[str] = None,
        data: Optional[str] = None,
    ) -> None:
        args: List[str] = [
            "--send-command",
            self.gateway,
            "--bus",
            self.bus,
        ]

        if address is not None:
            args.extend(["--address", address])

        if group is not None:
            args.extend(["--group", group])

        args.extend(["--command", command])

        if data is not None:
            args.extend(["--data", data])

        self.run(args)

    def set_dtr0(self, value: str) -> None:
        self.send("DTR0", data=value)

    def set_dtr1(self, value: str) -> None:
        self.send("DTR1", data=value)

    def set_dtr2(self, value: str) -> None:
        self.send("DTR2", data=value)

    def set_dtr_values(self, dtr_values: Tuple[str, str, str]) -> None:
        dtr0, dtr1, dtr2 = dtr_values
        self.set_dtr0(dtr0)
        self.set_dtr1(dtr1)
        self.set_dtr2(dtr2)

    def enable_device_type(self, device_type: str) -> None:
        self.send("EnableDeviceType", data=device_type)


def require_wb_mqtt_dali() -> None:
    if shutil.which("wb-mqtt-dali") is None:
        print("Error: wb-mqtt-dali command not found", file=sys.stderr)
        sys.exit(1)


def run_service_action(action: str) -> None:
    subprocess.run(["service", "wb-mqtt-dali", action], check=True)


def set_address_level_setting(
    client: DaliClient,
    address: str,
    label: str,
    value: DaliValue,
    command: str,
) -> None:
    print("Setting {} level for short address {}".format(label, address))
    client.set_dtr0(value.dtr0)
    client.send(command, address=address)


def add_address_to_group(client: DaliClient, address: str, group: str) -> None:
    print("Adding short address {} to group {}".format(address, group))
    client.send("AddToGroup", address=address, data=group)


def add_addresses_to_group(
    client: DaliClient,
    addresses: Iterable[str],
    group: str,
) -> None:
    for address in addresses:
        add_address_to_group(client, address, group)


def set_address_fade_settings(client: DaliClient, address: str) -> None:
    print("Setting fade time {} for short address {}".format(FADE_TIME.label, address))
    client.set_dtr0(FADE_TIME.dtr0)
    client.send("SetFadeTime", address=address)

    print("Setting fade rate {} for short address {}".format(FADE_RATE.label, address))
    client.set_dtr0(FADE_RATE.dtr0)
    client.send("SetFadeRate", address=address)


def set_addresses_fade_settings(client: DaliClient, addresses: Iterable[str]) -> None:
    for address in addresses:
        set_address_fade_settings(client, address)


def set_address_failure_settings(client: DaliClient, address: str) -> None:
    set_address_level_setting(
        client,
        address,
        "power-on {}".format(POWER_ON_LEVEL.label),
        POWER_ON_LEVEL,
        "SetPowerOnLevel",
    )
    set_address_level_setting(
        client,
        address,
        "system failure {}".format(SYSTEM_FAILURE_LEVEL.label),
        SYSTEM_FAILURE_LEVEL,
        "SetSystemFailureLevel",
    )


def set_addresses_failure_settings(client: DaliClient, addresses: Iterable[str]) -> None:
    for address in addresses:
        set_address_failure_settings(client, address)


def set_group_scene(client: DaliClient, scene: Scene) -> None:
    print(
        "Setting scene {} for group {}: brightness {}%, color temperature {}K".format(
            scene.number,
            GROUP,
            scene.brightness_percent,
            scene.color_temperature_k,
        )
    )

    client.set_dtr0(scene.color_temperature_dtr0)
    client.set_dtr1(scene.color_temperature_dtr1)
    client.send("DT8.SetTemporaryColourTemperature", group=GROUP)

    client.set_dtr0(scene.brightness_dtr0)
    client.send("SetScene", group=GROUP, data=scene.number)


def set_rgbw_scene(client: DaliClient, address: str, scene: RgbwScene) -> None:
    print(
        "Setting RGBW scene {} for short address {}: brightness {}%".format(
            scene.number,
            address,
            scene.brightness_percent,
        )
    )

    client.set_dtr_values(scene.rgb_dtr)
    client.enable_device_type("8")
    client.send("SetTemporaryRGBDimLevel", address=address)

    client.set_dtr_values(scene.waf_dtr)
    client.enable_device_type("8")
    client.send("SetTemporaryWAFDimLevel", address=address)

    client.enable_device_type("8")
    client.send("Activate", address=address)

    client.set_dtr0(scene.brightness_dtr0)
    client.send("SetScene", address=address, data=scene.number)


def set_rgbw_scenes(
    client: DaliClient,
    addresses: Iterable[str],
    scenes: Iterable[RgbwScene],
) -> None:
    for address in addresses:
        for scene in scenes:
            set_rgbw_scene(client, address, scene)


def main() -> None:
    require_wb_mqtt_dali()

    client = DaliClient(
        gateway=GATEWAY,
        bus=BUS,
        delay_seconds=DALI_COMMAND_DELAY_SECONDS,
    )

    print("Stopping wb-mqtt-dali service")
    run_service_action("stop")

    try:
        print(
            "Configuring DALI devices {} on gateway {}, bus {}".format(
                " ".join(ADDRESSES),
                GATEWAY,
                BUS,
            )
        )

        add_addresses_to_group(client, ADDRESSES, GROUP)
        set_addresses_fade_settings(client, ADDRESSES)
        set_addresses_failure_settings(client, ADDRESSES)

        for scene in SCENES:
            set_group_scene(client, scene)

        set_rgbw_scenes(client, RGBW_ADDRESSES, RGBW_SCENES)

        print("Done")
    finally:
        print("Starting wb-mqtt-dali service")
        run_service_action("start")


if __name__ == "__main__":
    main()
