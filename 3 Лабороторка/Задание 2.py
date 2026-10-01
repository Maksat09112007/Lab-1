class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius 
    def to_fahrenheit(self):
        return (self.celsius * 9 / 5) + 32
    def to_kelvin(self):
        return self.celsius + 273.15
    def display_conversions(self):
        print(f"Температура: {self.celsius}°C")
        print(f"В Фаренгейтах: {self.to_fahrenheit():.2f}°F")
        print(f"В Кельвинах: {self.to_kelvin():.2f} K")
current_temp = Temperature(25) 
current_temp.display_conversions()
