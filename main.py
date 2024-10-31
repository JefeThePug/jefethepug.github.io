import pyodide_js

await pyodide_js.loadPackage('requests')
await pyodide_js.loadPackage('lxml')
await pyodide_js.loadPackage('numpy')
await pyodide_js.loadPackage('rich')

import requests
import os
import sys
import types
import asyncio

from pyscript import when
from js import document
from datetime import datetime, timedelta


class Timer:
    def __init__(self):
        self.running = False
        self.end_time = None
        self.display = document.getElementById("timer")
        self.task = None

    async def start(self, minutes: int = 1):
        if not self.running:
            self.running = True
            self.end_time = datetime.now() + timedelta(minutes=minutes)
            self.task = asyncio.ensure_future(self.update())

    async def update(self):
        while self.running and datetime.now() < self.end_time:
            remaining = self.end_time - datetime.now()
            minutes, seconds = divmod(remaining.seconds, 60)
            self.display.innerHTML = f"{minutes:02d}:{seconds:02d}"
            await asyncio.sleep(1)

        if self.running:
            self.display.innerHTML = "Time's up!"
            self.running = False

    def stop(self):
        self.running = False
        if self.task:
            self.task.cancel()


def load_module(module_name: str, url: str) -> types.ModuleType:
    response = requests.get(url)
    response.raise_for_status()
    module = types.ModuleType(module_name)
    exec(response.text, module.__dict__)
    sys.modules[module_name] = module
    return module


helper_url = "https://raw.githubusercontent.com/JefeThePug/Boggle/refs/heads/main/helper.py"
board_url = "https://raw.githubusercontent.com/JefeThePug/Boggle/refs/heads/main/board.py"
helper = load_module("helper", helper_url)
board = load_module("board", board_url)


def clear() -> None:
    output_element = document.getElementById("output")
    output_element.innerHTML = ""


def print_to_html(message: str) -> None:
    output_element = document.getElementById("output")
    message = (
        message.replace("\n", "<br>")
        .replace(" ", "&nbsp;")
        .replace("n&nbsp;s", "n s")
    )
    output_element.innerHTML += f"<p>{message}</p>"


timer = Timer()

@when("click", "#start-button")
async def start_timer():
    await timer.start(1)
    # asyncio.ensure_future(timer.start(1))
@when("click", "#stop-button")
def stop_timer():
    timer.stop()


user_input = document.querySelector("#userInput")


@when("change", user_input)
async def input_refresh():
    await refresh()


async def refresh():
    print(user_input.value, file=sys.stderr)
    user_input.value = ""

async def main():
    text = "".join(
        f'<span style="color:{c};font-weight:900;">{helper.__dict__[x]}</span>\n'
        for c, x in zip(("navajoWhite", "orange", "red"), "ABC")
    )
    print_to_html(text)
    text = (
        '\n<span style="color:antiqueWhite;font-weight:900;">What do you want to do?'
        ' </span><span style="color:magenta;font-weight:900;">(start/quit)</span>\n'
    )
    print_to_html(text)
    await asyncio.gather(refresh())


asyncio.ensure_future(main())

