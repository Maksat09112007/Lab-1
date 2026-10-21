import math

a = float(input("Введите длину прямоугольника: "))
b = float(input("Введите ширину прямоугольника: "))


S = a * b             
P = 2 * (a + b)         
d = math.sqrt(a**2 + b**2) 


print(f"Площадь: {S}")
print(f"Периметр: {P}")
print(f"Длина диагонали: {d}")
