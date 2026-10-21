num = int(input("Введите четырехзначное число: "))


digit4 = num % 10        
digit3 = (num // 10) % 10 
digit2 = (num // 100) % 10 
digit1 = num // 1000       


reversed_num = digit4 * 1000 + digit3 * 100 + digit2 * 10 + digit1

print("Число в обратном порядке:", reversed_num)
