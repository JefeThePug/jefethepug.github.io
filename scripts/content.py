import nltk

nltk.download()
from nltk.corpus import words
from random import choice

# Globals
COLOR_RESET = '\x1b[0m'

COLOR_BLU_BG = '\x1b[7;34;48m'
COLOR_YEL_BG = '\x1b[7;33;48m'
COLOR_GRN_BG = '\x1b[7;32;48m'
COLOR_RED_BG = '\x1b[7;31;48m'
COLOR_PUR_BG = '\x1b[7;35;48m'
COLOR_GRY_BG = '\x1b[7;37;48m'
COLOR_RED = '\x1b[0;31;48m'
COLOR_GRY = '\x1b[0;37;48m'


class Board:
    def __init__(self, word_len: int, guesses: int, secret: str):
        print(COLOR_GRY + secret + COLOR_RESET)
        self.board = [(COLOR_GRY_BG + "   " + COLOR_RESET + " ") * word_len] * guesses
        self.guesses = []
        self.secret_word = secret
        self.index = 0
        self.limit = guesses - 1

    def add_row(self, row: str):
        self.guesses.append(row)
        self.board[self.index] = self.decorate_letters(row)
        self.index += 1
        if self.index > self.limit:
            if not self.check_win():
                raise Exception("You lose.")

    def decorate_letters(self, letters: str) -> str:
        output = [""] * len(self.secret_word)
        correct = []
        secret_copy = list(self.secret_word)
        for i, char in enumerate(letters):
            if char == secret_copy[i]:
                output[i] = COLOR_GRN_BG + " " + char + " " + COLOR_RESET
                secret_copy[i] = " "
                correct.append(i)
        for i, char in enumerate(letters):
            if i in correct: continue
            if char in secret_copy:
                output[i] = COLOR_YEL_BG + " " + char + " " + COLOR_RESET
                secret_copy[secret_copy.index(char)] = " "
            else:
                output[i] = COLOR_GRY_BG + " " + char + " " + COLOR_RESET
        return " ".join(output)

    def check_win(self) -> bool:
        return self.guesses[-1] == self.secret_word

    def __str__(self) -> str:
        return COLOR_RED + "WORDLE".center(19) + COLOR_RESET + "\n" + \
            "\n\n".join(["_" * 19] + [row for row in self.board]) + "\n" + "_" * 19


# functions
def set_secret(word_len: int) -> str:
    return choice(list(filter(lambda x: len(x) == word_len, words.words()))).upper()


def get_word(word_len: int, attempts: int) -> str:
    while True:
        word = input(f"Enter your attempt #{attempts}\n").upper()
        if check_word(word):
            if len(word) == word_len:
                break
            else:
                print(f"You have entered a {len(word)}-letter word, but a {word_len}-letter word is needed. Try again.")
    return word


def check_word(w: str) -> bool:
    if w not in map(lambda x: x.upper(), words.words()):
        print("Not a valid word. Try again.")
        return False
    return True


if __name__ == "__main__":
    word_len = 5
    guesses = 5
    game = Board(word_len, guesses, set_secret(word_len))

    while True:
        print(game)
        guess = get_word(word_len, game.index + 1)
        try:
            game.add_row(guess)
        except Exception:
            print(game, COLOR_RED_BG + "You lose! Try again next time!" + COLOR_RESET)
            break
        else:
            if game.check_win():
                print(
                    game,
                    COLOR_PUR_BG + f"You won! You guessed the word in {(l := len(game.guesses))}",
                    ["tries!", "try!"][l < 2] + COLOR_RESET
                )
                break