import math
import re
import sys

from pyscript import document


class Calculator:
    def __init__(self):
        self.eval_str = None
        self.num_str = None
        self.memory = None
        self.finished_num = None
        self.finished_eval = None
        self.sq_push = None
        self.expression = document.getElementById('expression')
        self.clear_all()
        self.m = document.querySelector('.memory')

    def append_to_number(self, value):
        if len(self.num_str) + len(value) > 12:
            return
        if value == "." and "." in self.num_str:
            return

        if self.finished_num or self.sq_push:
            self.finished_num = False
            self.num_str = ""
        if self.finished_eval:
            self.finished_eval = False
            self.eval_str = ""

        self.num_str += value

        if self.num_str.startswith("."):
            self.num_str = f"0{self.num_str}"

        if re.match(r"(0{1,2})(\d.*)", self.num_str):
            self.num_str = re.sub(r"(0{1,2})(\d.*)", r"\2", self.num_str)

        self.expression.value = self.num_str

    def clear_all(self):
        self.eval_str = ""
        self.num_str = ""
        self.memory = "0"
        self.finished_num = False
        self.finished_eval = False
        self.sq_push = False
        self.expression.value = "0"

    def clear_entry(self):
        self.num_str = ""
        self.expression.value = "0"

    def memory_recall(self):
        if self.m.style.display != "block":
            return
        self.num_str = self.memory
        self.expression.value = self.num_str

    def memory_clear(self):
        self.memory = "0"
        self.m.style.display = "none"

    def memory_add(self):
        if self.num_str:
            self.memory = str(float(self.memory) + float(self.num_str))
            self.m.style.display = "block"

    def add_operator(self, value):
        self.finished_eval = False
        self.sq_push = False

        if self.num_str:
            if not self.finished_num:
                self.eval_str += self.num_str
            if re.match(r"[\d.]+[-+*/][\d.]+", self.eval_str):
                self.eval_str = str(eval(self.eval_str))
                self.num_str = self.eval_str
            self.eval_str += value
            self.num_str = ""
        else:
            self.eval_str = self.eval_str[:-1] + value

        self.finished_num = True
        self.expression.value = self.eval_str + self.num_str

    def calculate_result(self, value):
        result = ""
        if re.findall(r"[-+*/]", self.eval_str):
            self.eval_str += self.num_str

        try:
            result = eval(self.eval_str)
            digits = int(math.log10(result)) + 1
            result = round(result, 11 - digits)
        except ZeroDivisionError:
            result = "E"
        except Exception as e:
            print(e, file=sys.stderr)
        self.eval_str = f"{result}"
        self.num_str = f"{result}"
        self.finished_num = True
        self.finished_eval = True

    def check_clicked(self, value):
        if value.isnumeric() or value == ".":
            self.append_to_number(value)
        elif value in "+-/*":
            self.add_operator(value)
        elif value == "%":
            self.num_str = f"{float(self.num_str) / 100}"
        elif value == "=":
            self.calculate_result(value)
        elif value == "√":
            self.sq_push = True
            if "-" in self.num_str:
                self.num_str = "E"
            else:
                self.num_str = str(math.sqrt(float(self.num_str)))
        elif value == "±":
            n = float(self.num_str) if "." in self.num_str else int(self.num_str)
            self.num_str = str(-n)
        elif value == "CE":
            self.clear_entry()
        elif value == "AC":
            self.clear_all()
        elif value == "MR":
            self.memory_recall()
        elif value == "M+":
            self.memory_add()
        elif value == "MC":
            self.memory_clear()

    def clicked_button(self, event):
        value = event.target.getAttribute('sent')
        if "E" not in self.num_str or value == "AC":
            self.check_clicked(value)
            if "E" in self.num_str:
                self.expression.value = "ERROR"
                return
            self.expression.value = float(self.num_str) if self.num_str else "0"
        else:
            self.expression.value = "ERROR"


CALCULATOR = Calculator()
