import asyncio
from datetime import datetime, timedelta

import numpy as np
from pyscript import when, document

from board import Board
from helper import A, B, C


class Timer:
    def __init__(self, time_up_action:callable = None):
        self.running = False
        self.end_time = None
        self.display = document.getElementById("timer")
        self.task = None
        self.time_up = time_up_action

    async def start(self, minutes: int = 1) -> None:
        if not self.running:
            self.running = True
            self.end_time = datetime.now() + timedelta(minutes=minutes)
            self.task = asyncio.ensure_future(self.update())

    async def update(self) -> None:
        while self.running and datetime.now() < self.end_time:
            remaining = self.end_time - datetime.now()
            minutes, seconds = divmod(remaining.seconds, 60)
            self.display.innerHTML = f"{minutes:02d}:{seconds:02d}"
            await asyncio.sleep(1)
        if self.running:
            self.running = False
            self.task.cancel()
            clear()
            display_board()
            print_to_html(
                f'<div style="{WHITE2}{BOLD}background-{RED}">Time\'s Up!</div>'
                f'<span style="{WHITE}">Your final score was </span>'
                f'<span style="{WHITE2}{BOLD}background-{RED}"> {BOARD.score} </span>'
            )
            GAME_STATE[0] = "quit"
            game_over()


TIMER = Timer()
LIMIT = 3
GAME_STATE = ["start"]
BOARD = Board()
USER_INPUT = document.querySelector("#userInput")
OUTPUT = document.getElementById("output")

BOLD = "font-weight:900;"
WHITE = "color:navajoWhite;"
WHITE2 = "color:white;"
RED = "color:darkRed;"
PINK = "color:magenta;"


def clear() -> None:
    OUTPUT.innerHTML = ""


def game_over() -> None:
    USER_INPUT.parentElement.style.display = "none"
    USER_INPUT.style.display = "none"


def print_to_html(message: str) -> None:
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
    OUTPUT.innerHTML += f'<p>{"".join(new_message)}</p>'


def display_board() -> None:
    html = (
        '<table class="gamePlay"><tr><th><h3>BOGGLE</h3></th><th><h3>Words Found:</h3>'
        '</th></tr><tr><td><table class="boggleLetters">'
    )
    for row in np.where(BOARD.letters == "Q", "Qu", BOARD.letters):
        html += (
            "<tr>"
            + "".join(f'<td class="boggleCell">{letter}</td>' for letter in row)
            + "</tr>"
        )
    html += '</table></td><td><div class="words-found"><div class="word-grid">'
    for word in BOARD.word_list:
        html += f'<div class="word-item"><span style="{BOLD}">{word[0]}</span>{word[1:]}</div>'
    html += f'</div><div class="score">Score: {BOARD.score}</div></div></td></tr></table>'
    print_to_html(html)


@when("change", USER_INPUT)
async def input_refresh() -> None:
    user_input, USER_INPUT.value = USER_INPUT.value.lower().strip(), ""
    if GAME_STATE[0] == "start":
        if user_input == "start":
            GAME_STATE[0] = "play"
            TIMER.display.style.display = "inline"
            await TIMER.start(LIMIT)
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


async def timed_round(guess: str = "") -> None:
    msg = f"You have {LIMIT} minutes..."
    if guess:
        msg = BOARD.guess(guess.upper().replace("QU", "Q"))
    clear()
    display_board()
    print_to_html(
        f'<div style="{WHITE2}{BOLD}background-{RED}">{msg}</div>'
        f'<span style="color:orange;{BOLD}">Guess a word: </span>'
    )


async def main() -> None:
    print_to_html("".join(
        f'<span style="color:{c};{BOLD}">{x}</span>\n'
        for c, x in zip(("navajoWhite", "orange", "red"), (A, B, C))
    ))
    print_to_html(
        f'\n<span style="{WHITE}{BOLD}">What do you want to do?'
        f' </span><span style="{PINK}{BOLD}">(start/quit)</span>\n'
    )


asyncio.ensure_future(main())
