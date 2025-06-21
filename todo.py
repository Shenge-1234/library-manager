import eel
from models import Tables

eel.init("frontend")

#retrieve status data
@eel.expose
def status():    
  data = {}
  book = Tables("Book")
  data['all_table'] =book.read(entity="*", join="Genre")
  data['total'] = book.read(entity="Book.Name", count_by='*', groupby='Book.Name', count=True)
  data['available_N'] = book.read(entity='Book.Name', count_by="Book.id", where = 'Available="true"', groupby="Book.Name", count=True)
  data['inservice'] = book.read(entity="Book.Name", count_by="Book.Available", where='Book.Available = "false"', groupby="Book.Name" ,count=True)
  return data

# save a book
@eel.expose
def save_data(data):
  book = Tables('Book')
  book.create(**data)
  return "Book saved Sucessfully"

# save a lend and make available = false
@eel.expose
def save_lend(lendFormData):
  # saving a lend
  service = Tables('Service')
  service.create(**lendFormData)

  #updating Book table
  book = Tables('Book')
  ref = {'Id': lendFormData['Book']}
  book.update(where=ref, new_values={'Available': 'false'})
  return "Book lended Successfully."

# save a return and make available = true
@eel.expose
def save_return(returnFormData):
  # saving a return
  service = Tables('Service')
  service.update(where={'Book': returnFormData['Book']}, new_values=returnFormData)

  #updating Book table
  book = Tables('Book')
  ref = {'Id': returnFormData['Book']}
  book.update(where=ref, new_values={'Available': 'true'})
  return "Book returned Successfully."

# save a user
@eel.expose
def save_user(userFormData):
  user = Tables('User')
  user.create(**userFormData)
  return "User saved Successfully."

# book record
@eel.expose
def book_record():

  book = Tables("Service")
  data = book.read(entity="Book.Name, Book.Sn, Service.Lend_time, Service.Estimated_Return_time", where="Service.Return_time IS NULL", join="Book")

  data1 = book.read(entity="User.Name, User.Category", where="Service.Return_time IS NULL", join="User")
  j = 0
  data2 = []
  for i in data:
     data2.append(data1[j] + i)
     j += 1
  return data2

# retrieve all users
@eel.expose
def get_users():
  user = Tables("User")
  data = user.read(entity="*", join="Category")
  return data

#retrieve lent books
@eel.expose
def get_lent_books():
  book = Tables("Book")
  data = book.read(entity="*", where="Available = 'false'")
  return data

# retrieve users
@eel.expose
def get_users_data():
  user = Tables("User")
  data = user.read(entity="User.Name, Category.Name, User.Gender", join="Category")
  return data

# retrieve categories
@eel.expose
def get_categories():
  category = Tables('Category')
  return category.read()

# edit users
@eel.expose
def edit_user(beforedit, edited):
  user = Tables("User")
  user.update(where=beforedit, new_values=edited)

eel.start("hypertext.html")


    