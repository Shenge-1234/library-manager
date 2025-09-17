import eel
from models import Tables
import base64
import os
from fpdf import FPDF
import tkinter
from tkinter import filedialog
import requests
import shutil
import sys
import datetime

eel.init("frontend")

#retrieve status data
@eel.expose
def status():
  try:
    data = {}
    book = Tables("Book")
    data['all_table'] = book.read(entity="*", join="Genre")
    data['total'] = book.read(entity="Book.Name", count_by='*', groupby='Book.Name', count=True)
    data['available_N'] = book.read(entity='Book.Name', count_by="Book.id", where = 'Available="true"', groupby="Book.Name", count=True)
    data['inservice'] = book.read(entity="Book.Name", count_by="Book.Available", where='Book.Available = "false"', groupby="Book.Name" ,count=True)
    book.close()
    return data
  except Exception as e:
    return {"Error": str(e)}

# save a book
@eel.expose
def save_data(data):
  try:
    book = Tables('Book')
    book.create(**data)
    book.close()
    return "Book saved Sucessfully"
  except Exception as e:
    return f"Error saving book: {e}"

# save a lend and make available = false
@eel.expose
def save_lend(lendFormData):
  try:
    service = Tables('Service')
    service.create(**lendFormData)
    service.close()

    book = Tables('Book')
    ref = {'Id': lendFormData['Book']}
    book.update(where=ref, new_values={'Available': 'false'})
    book.close()
    return "Book lended Successfully."
  except Exception as e:
    return f"Error saving lend: {e}"

# save a return and make available = true
@eel.expose
def save_return(returnFormData):
  try:
    service = Tables('Service')
    service.update(where={'Book': returnFormData['Book']}, new_values=returnFormData)
    service.close()

    book = Tables('Book')
    ref = {'Id': returnFormData['Book']}
    book.update(where=ref, new_values={'Available': 'true'})
    book.close()
    return "Book returned Successfully."
  except Exception as e:
    return f"Error saving return: {e}"

# save a user
@eel.expose
def save_user(userFormData):
  try:
    user = Tables('User')
    user.create(**userFormData)
    user.close()
    return "User saved Successfully."
  except Exception as e:
    return f"Error saving user: {e}"

# book record
@eel.expose
def book_record():
  try:
    book = Tables("Service")
    data = book.read(entity="Book.Name, Book.Sn, Service.Lend_time, Service.Estimated_Return_time, Book.id", where="Service.Return_time IS NULL", join="Book")
    data1 = book.read(entity="User.Name, User.Category, User.id, User.Gender", where="Service.Return_time IS NULL", join="User")
    data2 = []
    for i in data:
      data2.append(data1[data.index(i)] + i)
    book.close()
    return data2
  except Exception as e:
    return f"Error retrieving book record: {e}"

# retrieve all users
@eel.expose
def get_users():
  # it returns a list of tuples e.g: [(5, '3', 'bonte', 'Male', '0785378133', 3, 'Staff')]
  try:
    user = Tables("User")
    data = user.read(entity="*", join="Category")
    user.close()
    return data
  except Exception as e:
    return f"Error retrieving users: {e}"

# retrieve categories
@eel.expose
def get_categories():
  try:
    category = Tables('Category')
    data = category.read()
    category.close()
    return data
  except Exception as e:
    return f"Error retrieving categories: {e}"

# edit users
@eel.expose
def edit_user(beforedit, edited):
  try:
    user = Tables("User")
    user.update(where=beforedit, new_values=edited)
    user.close()
  except Exception as e:
    return f"Error editing user: {e}"

# delete user
@eel.expose
def delete_user(arr: list=None):
  try:
    user = Tables("User")
    details = {}
    details['Name'] = arr[0]
    '''details['Category'] = arr[1]
    details['Gender'] = arr[2]
    details['Phone'] = arr[3]'''
    user.delete(**details)
    user.close()
  except Exception as e:
    return f"Error deleting user: {e}"

# delete book
@eel.expose
def remove_book(name):
  try:
    books = Tables('Book')
    books.delete(Name= name)
    books.close()
    return f'Book deleted'
  except Exception as e:
    return f"Error deleting book: {e}"

# upload cover into system
@eel.expose
def upload_img(base64_str, img_name, book_name):
  try:
    books = Tables('Book')
    is_available = books.exist(Name=book_name)
    if is_available: 
      ancient_covers = books.read(entity="Book.Cover", where=f"Name = '{book_name}'")
      if base64_str != None:
        img_path = os.path.join(os.path.dirname(__file__), "frontend", "media", img_name)
        header, encoded = base64_str.split(",", 1)
        decoded = base64.b64decode(encoded)
        with open(img_path, "wb") as img_file:
          img_file.write(decoded)
        return f"media/{img_name}"
      else:
          return f"{ancient_covers[-1][0]}"
    else: 
      if base64_str == None:
        return f"media/OIP.webp"
      else:
        header, encoded = base64_str.split(",", 1)
        decoded = base64.b64decode(encoded)
        save_path = os.path.join(os.path.dirname(__file__), "frontend", "media", img_name)
        with open(save_path, "wb") as img_file:
          img_file.write(decoded)
        return f"media/{img_name}"
  except Exception as e:
    return f"Error uploading image: {e}"

# report path
@eel.expose
def report_path():
  try:
    root = tkinter.Tk()
    root.withdraw()
    root.attributes('-topmost', True)
    file_path = filedialog.askdirectory(title="Choose folder to Save Report", parent=root)
    root.destroy()
    return file_path
  except Exception as e:
    return f"Error selecting report path: {e}"

# make a pdf report
@eel.expose
def generate_pdf(query_table:str = None, directory: str = None):
  try:
    data = {}
    book = Tables("Book")
    service = Tables("Service")
    data["books_by_genre"] = book.read(entity="Genre.Name", count_by="*", groupby="Book.Genre", count=True, join="Genre")
    data['remained'] = book.read(entity='Book.Name', count_by="Book.id", where = 'Available="true"', groupby="Book.Name", count=True)
    data['lended'] = book.read(entity="Book.Name", count_by="Book.Available", where='Book.Available = "false"', groupby="Book.Name" ,count=True)
    data['borrowe_data'] = service.read(entity="User.Name, User.Category", join="User", where="Service.Return_time is NULL",count=True, groupby="Service.User")
    val_cat = {'1':"Student", '2':"Teacher", '3':"Staff", '4':"Other"}
    if data["borrowe_data"]:
      bor_dt = []
      for b in data["borrowe_data"]:
        l = list(b)
        try:
            l[1] = val_cat[l[1]]
        except KeyError:
            pass
        print(tuple(l))
        bor_dt.append(tuple(l))
      data["borrowe_data"] = bor_dt

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page(orientation="P", format="Letter")
    pdf.set_font(family="helvetica", size=12, style="BU")
    pdf.cell(center=True, text="Books library reports on " + str(datetime.datetime.now().date().strftime('%d-%B-%Y')))

    # table books by genre
    if query_table == 'Whole Report' or query_table == 'table books_by_genre':
      pdf.set_xy(0,20)
      with pdf.table() as table:
        data["books_by_genre"].insert(0, ["Genre", "Number of Books"])
        for i, row_data in enumerate(data["books_by_genre"]):
          if len(data["books_by_genre"]) > 1:
            row = table.row()
            if i == 0:
              pdf.set_font(family="helvetica", size=10, style="B")
            else:
              pdf.set_font(family="helvetica", size=10, style="")
            for cell_data in row_data:
              row.cell(str(cell_data))
          else:
            pdf.cell(text="No Books registered yet")
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
        data['remained'].insert(0, ["Book Name", "Current number in the room"])
        for i, row_data in enumerate(data['remained']):
          if len(data["remained"]) > 1:
            row = table.row()
            if i == 0:
              pdf.set_font(family="helvetica", size=10, style="B")
            else:
              pdf.set_font(family="helvetica", size=10, style="")
            for cell_data in row_data:
              row.cell(str(cell_data))
          else:
            pdf.cell(text="No Books found")
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
        data['borrowe_data'].insert(0, ["User Name", "Category", "Number of Borrowed Books"])
        for i, row_data in enumerate(data['borrowe_data']):
          if len(data["borrowe_data"]) > 1:
              row = table.row()
              if i == 0:
                pdf.set_font(family="helvetica", size=10, style="B")
              else:
                pdf.set_font(family="helvetica", size=10, style="")
              for cell_data in row_data:
                row.cell(str(cell_data))
          else:
            pdf.cell(text="No Borrow record Found")
    else:
        pass

    full_path = os.path.join(directory, "library_report on "+ str(datetime.datetime.now().date().strftime('%d-%B-%Y'))+".pdf")
    pdf.output(full_path)
    return "PDF generated successfully."
  except Exception as e:
    return f"Error generating PDF: {e}"

@eel.expose
def has_borrowed(user_id):
  try:
    service = Tables('Service')
    borrowers = service.read(entity="Service.User", where="Service.Return_time is NULL")
    all_user_ids = [user[0] for user in borrowers]
    return str(user_id) in all_user_ids
  except Exception as e:
    return f"Error checking borrowed status: {e}"

@eel.expose
def update_book(nameOfBook, new_cover_path):
  try:
    books = Tables('Book')
    books.update(where={'name': f'{nameOfBook}'}, new_values={'Cover': f'{new_cover_path}'})
  except Exception as e:
    return f"Error updating book cover: {e}"

def check_for_updates():
  version_url = "https://github.com/Shenge-1234/library-manager/raw/refs/heads/main/latest_version"
  try:
    response = requests.get(version_url)
    if response.status_code == 200:
      latest_version = response.text.strip()
      with open("version", "r") as file:
        current_version = file.read().strip()
      if latest_version > current_version:
        return {"latest": latest_version, "current": current_version, "update": True, 'msg': "Update available"}
      else:
        return {"update": False, "msg": "no update availble"}
    else:
      return {"msg": "Failed to check for updates. Status code: {}".format(response.status_code),"update": False}
  except NameResolutionError:
    pass
  except Exception as e:
    print({"msg": f"An error occurred: {e}", "update": False})

def update():
  update_files_url = "https://github.com/Shenge-1234/library-manager/archive/refs/heads/main.zip"
  try:
    response = requests.get(update_files_url)
    if response.status_code == 200:
      with open("update.zip", "wb") as file:
        file.write(response.content)
      shutil.unpack_archive(filename = "update.zip", extract_dir="update_temp", format="zip")
      update_files_lst = [fl for fl in os.listdir("update_temp") if not fl.endswith(".db")]
      for update in update_files_lst:
        new = os.path.join("update_temp", update)
        old = os.path.join(".", update) 
        if os.path.isdir(new):
          if os.path.exists(old):
            shutil.rmtree(old)
        else:
          shutil.copy2(src=new, dst=old)
        os.remove("update.zip")
        shutil.rmtree("update_temp")
        os.execv(sys.executable, ["python"] + sys.argv)
    else:
      return "Failed to download update files. Status code: {}".format(response.status_code)
  except Exception as e:
    print(f"An error occurred while updating: {e}")

def main():
  try:
    check = check_for_updates()
    if check.get("update"):
        update()
    else:
        eel.start("hypertext.html")
  except Exception as e:
    print("Error occured: ", e)

if __name__ == "__main__":
  main()



