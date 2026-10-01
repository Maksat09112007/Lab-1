class ElectronicWallet:

    def __init__(self, initial_balance=0.0, pin="1234"):
        self.__balance = float(initial_balance)
        self.__pin = str(pin)
        self.__history = []
        self._add_to_history(f"Кошелек создан. Баланс: {self.__balance}")

    def _add_to_history(self, action):
        self.__history.append(action)

    def get_balance(self, pin):
        if str(pin) != self.__pin:
            return "Ошибка: Неверный PIN-код."
        return self.__balance

    def deposit(self, amount):
        if amount <= 0:
            return "Ошибка: Сумма пополнения должна быть больше нуля."
        self.__balance += amount
        self._add_to_history(f"Пополнение: +{amount}. Баланс: {self.__balance}")
        return True

    def pay(self, amount, pin, description="Оплата"):
        if str(pin) != self.__pin:
            return "Ошибка: Неверный PIN-код."
        if amount <= 0:
            return "Ошибка: Сумма оплаты должна быть больше нуля."
        if self.__balance < amount:
            return "Ошибка: Недостаточно средств."

        self.__balance -= amount
        self._add_to_history(
            f"{description}: -{amount}. Баланс: {self.__balance}"
        )
        return True

    def transfer(self, target_wallet, amount, pin):
        if not isinstance(target_wallet, ElectronicWallet):
            return "Ошибка: Некорректный кошелек для перевода."
        if str(pin) != self.__pin:
            return "Ошибка: Неверный PIN-код."
        if amount <= 0:
            return "Ошибка: Сумма перевода должна быть больше нуля."
        if self.__balance < amount:
            return "Ошибка: Недостаточно средств."

        self.__balance -= amount
        self._add_to_history(
            f"Перевод на другой кошелек: -{amount}. Баланс: {self.__balance}"
        )

        target_wallet.deposit(amount)
        return True

    def get_history(self, pin):
        if str(pin) != self.__pin:
            return "Ошибка: Неверный PIN-код."
        return self.__history.copy()
wallet1 = ElectronicWallet(initial_balance=1000, pin="4321")
wallet2 = ElectronicWallet(initial_balance=100, pin="1111")
wallet1.deposit(500)
wallet1.pay(200, pin="4321", description="Покупка книг")
wallet1.transfer(wallet2, amount=300, pin="4321")
print("Баланс wallet1:", wallet1.get_balance("4321"))
print("\nИстория wallet1:")
for record in wallet1.get_history("4321"):
    print(record)
print("\nБаланс wallet2:", wallet2.get_balance("1111"))
