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


# ИНТЕРАКТИВНОЕ МЕНЮ ДЛЯ РАБОТЫ ЧЕРЕЗ КОНСОЛЬ

wallet1 = ElectronicWallet(initial_balance=1000, pin="4321")
wallet2 = ElectronicWallet(initial_balance=100, pin="1111")

print("Добро пожаловать в симулятор кошелька!")
print("Создан Кошелек №1 (ПИН: 4321) и Кошелек №2 (ПИН: 1111)")

while True:
    print("\n--- ДОСТУПНЫЕ ДЕЙСТВИЯ ---")
    print("1. Посмотреть баланс Кошелька №1")
    print("2. Пополнить Кошелек №1")
    print("3. Оплатить покупку с Кошелька №1")
    print("4. Перевести деньги с Кошелька №1 на Кошелек №2")
    print("5. Посмотреть историю операций Кошелька №1")
    print("6. Выйти из программы")
    
    choice = input("\nВыберите номер действия (1-6): ")
    
    if choice == "1":
        user_pin = input("Введите PIN-код: ")
        print("Баланс:", wallet1.get_balance(user_pin))
        
    elif choice == "2":
        summa = float(input("Введите сумму пополнения: "))
        result = wallet1.deposit(summa)
        if result == True:
            print("Успешно пополнено!")
        else:
            print(result)
            
    elif choice == "3":
        summa = float(input("Введите сумму оплаты: "))
        user_pin = input("Введите PIN-код: ")
        descr = input("Введите название покупки: ")
        result = wallet1.pay(summa, user_pin, descr)
        if result == True:
            print("Оплата прошла успешно!")
        else:
            print(result)
            
    elif choice == "4":
        summa = float(input("Введите сумму перевода: "))
        user_pin = input("Введите PIN-код: ")
        result = wallet1.transfer(wallet2, summa, user_pin)
        if result == True:
            print("Перевод на Кошелек №2 выполнен!")
        else:
            print(result)
            
    elif choice == "5":
        user_pin = input("Введите PIN-код: ")
        history = wallet1.get_history(user_pin)
        if isinstance(history, list):
            print("\n--- История операций ---")
            for record in history:
                print(record)
        else:
            print(history)
            
    elif choice == "6":
        print("Программа завершена.")
        break
    else:
        print("Неверный ввод. Выберите число от 1 до 6.")

