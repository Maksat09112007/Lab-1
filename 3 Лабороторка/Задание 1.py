class Book:
    def __init__(self, title, author, year, pages):
        self.title = title       
        self.author = author     
        self.year = year         
        self.pages = pages       

    def display_info(self):
        print(f"Книга: {self.title}")
        print(f"Автор: {self.author}")
        print(f"Год издания: {self.year}")
        print(f"Количество страниц: {self.pages}")
my_book = Book("Перси Джексон", "Рик Риордан", 2000, 368)
my_book.display_info()
