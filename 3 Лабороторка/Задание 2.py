class Temperature: 
    def __init__(self, celsius):
        self.celsius = celsius 

    def show(self):
        fahrenheit = (self.celsius * 9 / 5) + 32
        kelvin = self.celsius + 273.15
        
        print(f"Цельсии: {self.celsius}°C")
        print(f"Фаренгейты: {fahrenheit}°F")
        print(f"Кельвины: {kelvin}K")

current_temp = Temperature(25) 
current_temp.show()
