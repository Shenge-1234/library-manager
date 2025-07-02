import eel
from models import Tables
import base64
import os

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
  book.close()
  return data

# save a book
@eel.expose
def save_data(data):
  book = Tables('Book')
  book.create(**data)
  book.close()
  return "Book saved Sucessfully"

# save a lend and make available = false
@eel.expose
def save_lend(lendFormData):
  # saving a lend
  service = Tables('Service')
  service.create(**lendFormData)
  service.close()

  #updating Book table
  book = Tables('Book')
  ref = {'Id': lendFormData['Book']}
  book.update(where=ref, new_values={'Available': 'false'})
  book.close()
  return "Book lended Successfully."

# save a return and make available = true
@eel.expose
def save_return(returnFormData):
  # saving a return
  service = Tables('Service')
  service.update(where={'Book': returnFormData['Book']}, new_values=returnFormData)
  service.close()

  #updating Book table
  book = Tables('Book')
  ref = {'Id': returnFormData['Book']}
  book.update(where=ref, new_values={'Available': 'true'})
  book.close()
  return "Book returned Successfully."

# save a user
@eel.expose
def save_user(userFormData):
  user = Tables('User')
  user.create(**userFormData)
  user.close()
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
  book.close()
  return data2

# retrieve all users
@eel.expose
def get_users():
  user = Tables("User")
  data = user.read(entity="*", join="Category")
  user.close()
  return data

#retrieve lent books
@eel.expose
def get_lent_books():
  book = Tables("Book")
  data = book.read(entity="*", where="Available = 'false'")
  book.close()
  return data

# retrieve users
@eel.expose
def get_users_data():
  user = Tables("User")
  data = user.read(entity="User.Name, Category.Name, User.Gender", join="Category")
  user.close()
  return data

# retrieve categories
@eel.expose
def get_categories():
  category = Tables('Category')
  data = category.read()
  category.close()
  return data

# edit users
@eel.expose
def edit_user(beforedit, edited):
  user = Tables("User")
  user.update(where=beforedit, new_values=edited)
  user.close()

# delete user
@eel.expose
def delete_user(arr: list=None):
  user = Tables("User")
  category_value = {'Student': 1, 'Teacher': 2, 'Staff': 3}
  details = {}
  details['Name'] = arr[0]
  details['Category'] = category_value[arr[1]]
  details['Gender'] = arr[2]
  user.delete(**details)
  user.close()

# delete book
@eel.expose
def remove_book(name):
  books = Tables('Book')
  books.delete(Name= name)
  books.close()
  return f'Book deleted'

# upload cover into system
@eel.expose
def upload_img(base64_str, img_name):

  #separate img data with headers like: data:image/jepg, wejhfkhakhaqgdahgdh...
  header, encoded = base64_str.split(',')
  data = base64.b64decode(encoded) # decode bs64 from js into binary
  destined_path = os.path.join(os.path.dirname(__file__), 'frontend', 'media', img_name)# C:\Users\cedric\OneDrive\Desktop\GS MUNYINYA LIB\library\frontend\media\img_name
  if os.path.exists(destined_path):
    return f'media/{img_name}'
  else:
    with open(destined_path, 'wb') as f:   # write decoded data into new file.
      f.write(data)
    return f'media/{img_name}'

eel.start("hypertext.html")


    