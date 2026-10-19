num = int(input("Введите трехзначное число: "))
units = num % 10         
tens = (num // 10) % 10   
hundreds = num // 100     
reversed_num = units * 100 + tens * 10 + hundreds
print(reversed_num)
