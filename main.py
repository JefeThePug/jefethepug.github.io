###################
#  Initial Setup  #
###################
import asyncio
import sys
import types

import pyodide_js
import requests

await pyodide_js.loadPackage("requests")
await pyodide_js.loadPackage("lxml")
await pyodide_js.loadPackage("numpy")
await pyodide_js.loadPackage("rich")


def load_module(module_name: str, url: str) -> types.ModuleType:
    response = requests.get(url)
    response.raise_for_status()
    module = types.ModuleType(module_name)
    exec(response.text, module.__dict__)
    sys.modules[module_name] = module
    return module


helper_url = (
    "https://raw.githubusercontent.com/JefeThePug/Boggle/refs/heads/main/helper.py"
)
board_url = (
    "https://raw.githubusercontent.com/JefeThePug/Boggle/refs/heads/main/board.py"
)
helper = load_module("helper", helper_url)
board = load_module("board", board_url)


#################
#  Actual Code  #
#################
import numpy as np

from pyscript import when
from js import document
from datetime import datetime, timedelta


class Timer:
    def __init__(self, time_up):
        self.running = False
        self.end_time = None
        self.display = document.getElementById("timer")
        self.task = None
        self.time_up = time_up

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
            self.task.cancel()
            await self.time_up()


async def time_up():
    print_to_html(
        f'<span style="{WHITE}">Your final score was </span>'
        f'<span style="{WHITE2}{BOLD}background-{RED}"> {BOARD.score} </span>'
    )
    GAME_STATE[0] = "quit"
    game_over()


TIMER = Timer(time_up)
USER_INPUT = document.querySelector("#userInput")
GAME_STATE = ["start"]
MSG = [""]
BOARD = board.Board()

BOLD = "font-weight:900;"
WHITE = "color:navajoWhite;"
WHITE2 = "color:white;"
RED = "color:darkRed;"
PINK = "color:magenta;"


def clear() -> None:
    output_element = document.getElementById("output")
    output_element.innerHTML = ""


def game_over() -> None:
    USER_INPUT.parentElement.style.display = "none"
    USER_INPUT.style.display = "none"


def print_to_html(message: str) -> None:
    output_element = document.getElementById("output")
    message = message.replace("\n", "<br>")

    new_message = []
    for i, c in enumerate(message):
        if c == " ":
            if "".join(message[i - 1 : i + 2]) in ("e c", "d c", "n s", "v c", "v s"):
                new_message.append(c)
            else:
                new_message.append("&nbsp;")
        else:
            new_message.append(c)

    output_element.innerHTML += f'<p>{"".join(new_message)}</p>'


@when("change", USER_INPUT)
async def input_refresh():
    user_input, USER_INPUT.value = USER_INPUT.value.lower().strip(), ""
    if GAME_STATE[0] == "start":
        if user_input == "start":
            BOARD = board.Board()
            GAME_STATE[0] = "play"
            TIMER.display.style.display = "inline"
            await TIMER.start(1)
            await timed_round()
        elif user_input == "quit":
            print_to_html(f'<span style="{PINK}{BOLD}">Goodbye!</span>')
            game_over()
        else:
            print_to_html(
                f'<span style="{PINK}{BOLD}">Select only start or quit.</span>'
            )
    elif GAME_STATE[0] == "play":
        await timed_round(user_input)


def display_board():
    board_html = '<table class="boggleLetters">'
    for row in np.where(BOARD.letters == "Q", "Qu", BOARD.letters):
        board_html += (
            "<tr>"
            + "".join(f'<td class="boggleCell">{letter}</td>' for letter in row)
            + "</tr>"
        )
    board_html += "</table>"

    words_html = '<div class="words-found"><div class="word-grid">'
    for word in BOARD.word_list:
        words_html += f'<div class="word-item">{word}</div>'
    words_html += f'</div><div class="score">Score: {BOARD.score}</div></div>'

    html = (
        '<table class="gamePlay"><tr><th><h3>BOGGLE</h3></th><th><h3>Words Found:</h3>'
        f"</th></tr><tr><td>{board_html}</td><td>{words_html}</td></tr></table>"
    )
    print_to_html(html)


async def timed_round(guess: str = ""):
    if guess:
        MSG[0] = BOARD.guess(guess.upper())
    clear()
    display_board()
    if MSG[0]:
        print_to_html(f'<div style="{WHITE2}{BOLD}background-{RED}">{MSG[0]}</div>')
    print_to_html(f'<span style="color:orange;{BOLD}">Guess a word: </span>')


async def main():
    text = "".join(
        f'<span style="color:{c};{BOLD}">{helper.__dict__[x]}</span>\n'
        for c, x in zip(("navajoWhite", "orange", "red"), "ABC")
    )
    print_to_html(text)
    text = (
        f'\n<span style="{WHITE}{BOLD}">What do you want to do?'
        f' </span><span style="{PINK}{BOLD}">(start/quit)</span>\n'
    )
    print_to_html(text)


asyncio.ensure_future(main())
