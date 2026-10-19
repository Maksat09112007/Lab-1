num = int(input("Введите четырехзначное число: "))
thousands = num // 1000
hundreds = (num // 100) % 10
tens = (num // 10) % 10
ones = num % 10
print(f"Тысячи: {thousands}")
print(f"Сотни: {hundreds}")
print(f"Десятки: {tens}")
print(f"Единицы: {ones}")
