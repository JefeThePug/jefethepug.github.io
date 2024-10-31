###################
#  Initial Setup  #
###################
import pyodide_js
import types
import requests
import sys
import asyncio

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


TIMER = Timer()
USER_INPUT = document.querySelector("#userInput")
GAME_STATE = ["start"]
MSG = [""]


def clear() -> None:
    output_element = document.getElementById("output")
    output_element.innerHTML = ""


def print_to_html(message: str) -> None:
    output_element = document.getElementById("output")
    message = message.replace("\n", "<br>")

    new_message = []
    for i, c in enumerate(message):
        if c == " ":
            if "".join(message[i - 1 : i + 2]) in ("e c", "d c", "n s", "v c"):
                new_message.append(c)
            else:
                new_message.append("&nbsp;")
        else:
            new_message.append(c)

    output_element.innerHTML += f'<p>{"".join(new_message)}</p>'


@when("click", "#start-button")
async def start_timer():
    await TIMER.start(1)


@when("click", "#stop-button")
def stop_timer():
    TIMER.stop()


@when("change", USER_INPUT)
async def input_refresh():
    if GAME_STATE[0] == "start":
        if USER_INPUT.value.lower().strip() == "start":
            GAME_STATE[0] = "play"
            await timed_round()
        elif USER_INPUT.value.lower().strip() == "quit":
            print_to_html(
                '<span style="color:magenta;font-weight:900;">Goodbye!</span>'
            )
            USER_INPUT.parentElement.style.display = "none"
            USER_INPUT.style.display = "none"
        else:
            print_to_html(
                '<span style="color:magenta;font-weight:900;">Select only start or quit.</span>'
            )
    elif GAME_STATE[0] == "play":
        await timed_round()

    USER_INPUT.value = ""


def display_board(game_board):
    letters = np.where(game_board.letters == "Q", "Qu", game_board.letters)

    board_html = '<table class="boggleLetters">'
    for row in letters:
        board_html += "<tr>"
        for letter in row:
            board_html += f'<td class="boggleCell">{letter}</td>'
        board_html += "</tr>"
    board_html += "</table>"

    # Create the words list
    words_html = '<div class="words-found">'
    words_html += '<div class="word-grid">'
    for word in game_board.word_list:
        words_html += f'<div class="word-item">{word}</div>'
    words_html += "</div>"
    words_html += f'<div class="score">Score: {game_board.score}</div>'
    words_html += "</div>"

    # Combine both sections
    html = (
        '<table class="gamePlay"><tr><th><h3>BOGGLE</h3></th><th><h3>Words Found:</h3>'
        f"</th></tr><tr><td>{board_html}</td><td>{words_html}</td></tr></table>"
    )
    print_to_html(html)


async def timed_round():
    game_board = board.Board()

    if GAME_STATE[0] == "play":
        clear()
        display_board(game_board)

        if MSG[0]:
            print_to_html(
                f'<div style="color:white;font-weight:900;background-color:darkRed;">{MSG[0]}</div>'
            )
        print_to_html(
            '<span style="color:orange;font-weight:900;">Guess a word: </span>'
        )
        # guess = input().upper().strip().replace("QU", "Q")
        # return board.guess(guess)
    else:
        print_to_html(
            (
                '<div style="color:white;font-weight:900;background-color:darkRed;">Times Up!</div>'
                '<div><span style="color:antiqueWhite;font-weight:900;">Your final score was)'
                f'<span style="color:white;font-weight:900;background-color:darkRed;">{board.score}</span></div>'
            )
        )


async def main():
    text = "".join(
        f'<span style="color:{c};font-weight:900;">{helper.__dict__[x]}</span>\n'
        for c, x in zip(("navajoWhite", "orange", "red"), "ABC")
    )
    print_to_html(text)
    text = (
        '\n<span style="color:navajoWhite;font-weight:900;">What do you want to do?'
        ' </span><span style="color:magenta;font-weight:900;">(start/quit)</span>\n'
    )
    print_to_html(text)


asyncio.ensure_future(main())
