import eel
from models import Tables
import base64
import os
from fpdf import FPDF
import tkinter
from tkinter import filedialog
import requests
import zipfile


version_url = "https://github.com/Shenge-1234/library-manager/raw/refs/heads/main/latest_version"

def check_for_updates():
  
  """ on version (1.0.0.0) format first deals with functionalities of software, second deals with UI update
  , third is conserned with back-end developmant, and last is specific to database migrations."""

  try:
    response = requests.get(version_url)
    if response.status_code == 200:
      latest_version = response.text.strip()
      with open("version", "r") as file:
        current_version = file.read().strip()
      if latest_version > current_version:
        latest_version = latest_version.split('.')
        current_version = current_version.split('.')
        return {"latest": latest_version, "current": current_version, "update": True}
      else:
        return {"update": False, "msg": "no update availble"}
    else:
      return {"msg": "Failed to check for updates. Status code: {}".format(response.status_code),
              "update": False}
  except Exception as e:
    return {"msg": f"An error occurred: {e}", "update": False}
  

def update():
    
  update_files_url = "https://github.com/Shenge-1234/library-manager/archive/refs/heads/main.zip"

  try:
    check = check_for_updates()
    update_available = check.update

    if update_available:
      response = requests.get(update_files_url)
      if response.status_code == 200:
        with open("update.zip", "wb") as file: # download the update files
          file.write(response.content)

        with zipfile.ZipFile("update.zip", "r") as zip_ref: # extract files
          zip_ref.extractall("update_temp")
    
    else:
      return update_available.msg
  except Exception as e:
    pass

    
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

  data1 = book.read(entity="User.Name, User.Category, User.id", where="Service.Return_time IS NULL", join="User")
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
def upload_img(base64_str, img_name, book_name):
  books = Tables('Book')
  is_available = books.exist(Name=book_name)

  if is_available: 

    ancient_covers = books.read(entity="Book.Cover", where=f"Name = '{book_name}'")
    if base64_str != None and ancient_covers[-1][0] == "media/OIP.webp":
      img_path = os.path.join(os.path.dirname(__file__), "frontend", "media", img_name)
      header, encoded = base64_str.split(",", 1)
      decoded = base64.b64decode(encoded)
      with open(img_path, "wb") as img_file: # upload img into system
        img_file.write(decoded)
      return f"media/{img_name}"
    
    else: # take already contained img when user inserted none
      return f"{ancient_covers[-1][0]}"
    
  else: 
    if base64_str == None: # use default img if user insert none(for first time)
      return f"media/OIP.webp"
    else:
      header, encoded = base64_str.split(",", 1)
      decoded = base64.b64decode(encoded)
      save_path = os.path.join(os.path.dirname(__file__), "frontend", "media", img_name)
      with open(save_path, "wb") as img_file: # upload img into system
        img_file.write(decoded)
      return f"media/{img_name}"

# report path
@eel.expose
def report_path():
  root = tkinter.Tk()
  root.withdraw()  # Hide the root window
  root.attributes('-topmost', True)  # Bring dialog to front
  file_path = filedialog.askdirectory(title="Choose folder to Save Report", parent=root)
  root.destroy()
  return file_path

# make a pdf report
@eel.expose
def generate_pdf( query_table:str = None, directory: str = None):
  data = {}
  book = Tables("Book")
  service = Tables("Service")
  data["books_by_genre"] = book.read(entity="Genre.Name", count_by="*", groupby="Book.Genre", count=True, join="Genre")
  data['remained'] = book.read(entity='Book.Name', count_by="Book.id", where = 'Available="true"', groupby="Book.Name", count=True)
  data['lended'] = book.read(entity="Book.Name", count_by="Book.Available", where='Book.Available = "false"', groupby="Book.Name" ,count=True)
  data['borrowe_data'] = service.read(entity="User.Name, User.Category", join="User", where="Service.Return_time is NULL",count=True, groupby="Service.User")

  pdf = FPDF()
  pdf.set_auto_page_break(auto=True, margin=15)
  pdf.add_page(orientation="P", format="Letter")
  pdf.set_font(family="helvetica", size=12, style="BU")
  pdf.cell(center=True, text="Books library reports on date")

  # table books by genre
  if query_table == 'Whole Report' or query_table == 'table books_by_genre':

    pdf.set_xy(0,20)
    with pdf.table() as table:
      data["books_by_genre"].insert(0, ["Genre", "Number of Books"])
      for i, row_data in enumerate(data["books_by_genre"]):
        row = table.row()
        if i == 0:
          pdf.set_font(family="helvetica", size=10, style="B")
        else:
          pdf.set_font(family="helvetica", size=10, style="")
        for cell_data in row_data:
          row.cell(str(cell_data))
  else:
    pass
  end_y1 = pdf.get_y()
      
  # table books status
  if query_table == 'Whole Report' or query_table == 'table books status':
    pdf.set_xy(0, end_y1 + 20)
    pdf.set_font(family="helvetica", size=12, style="BU")
    pdf.cell(center=True, text="Books Status")

    pdf.set_xy(0, end_y1 + 30)
    with pdf.table() as table:
      data['remained'].insert(0, ["Book Name", "Current number in the room"]) # make table header
      for i, row_data in enumerate(data['remained']):
        row = table.row()
        if i == 0:
          pdf.set_font(family="helvetica", size=10, style="B")
        else:
          pdf.set_font(family="helvetica", size=10, style="")
        for cell_data in row_data:
          row.cell(str(cell_data))
  else:
    pass
  end_y2 = pdf.get_y()

  # table borrowers
  if query_table == 'Whole Report' or query_table == 'table borrowers':
    pdf.set_xy(0, end_y2 + 20)
    pdf.set_font(family="helvetica", size=12, style="BU")
    pdf.cell(center=True, text="Borrowers")

    pdf.set_xy(0, end_y2 + 30)
    with pdf.table() as table:
      data['borrowe_data'].insert(0, ["User Name", "Category", "Number of Borrowed Books"]) # make table header
      for i, row_data in enumerate(data['borrowe_data']):
        row = table.row()
        if i == 0:
          pdf.set_font(family="helvetica", size=10, style="B")
        else:
          pdf.set_font(family="helvetica", size=10, style="")
        for cell_data in row_data:
          row.cell(str(cell_data))
  else:
    pass

  full_path = os.path.join(directory, "library_report on date.pdf")
  pdf.output(full_path)
  
eel.start("hypertext.html")
