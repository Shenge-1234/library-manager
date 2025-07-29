import sqlite3

connection = sqlite3.connect("libman-db.db") # initiate db
cur = connection.cursor() # make cursor to assign db code

# table genre
cur.execute("CREATE TABLE IF NOT EXISTS Genre(" \
"Id INTEGER PRIMARY KEY AUTOINCREMENT," \
"Name VARCHAR(50) UNIQUE)")
# inserting data into genre
cur.execute("INSERT OR IGNORE INTO Genre(Name) VALUES('Science')")
cur.execute("INSERT OR IGNORE INTO Genre(Name) VALUES('Language')")
cur.execute("INSERT OR IGNORE INTO Genre(Name) VALUES('Novel')")
cur.execute("INSERT OR IGNORE INTO Genre(Name) VALUES('History')")

# table book
cur.execute("CREATE TABLE IF NOT EXISTS Book(" \
"Id INTEGER PRIMARY KEY AUTOINCREMENT," \
"Sn VARCHAR(100) UNIQUE," \
"Name VARCHAR(50) NOT NULL," \
"Author VARCHAR(50) NOT NULL," \
"Published_date DATETIME," \
"Available BOOLEAN DEFAULT FALSE," \
"Genre VARCHAR," \
"Entry_date DATETIME DEFAULT CURRENT_TIMESTAMP," \
"Cover TEXT DEFAULT 'media/OIP.webp'," \
"FOREIGN KEY(Genre) REFERENCES Genre(Id) ON DELETE CASCADE)")

# table category
cur.execute("CREATE TABLE IF NOT EXISTS Category(" \
"Id INTEGER PRIMARY KEY AUTOINCREMENT," \
"Name VARCHAR(50) UNIQUE)") 
# inserting data into category
cur.execute("INSERT OR IGNORE INTO Category(Name) VALUES('Student')")
cur.execute("INSERT OR IGNORE INTO Category(Name) VALUES('Teacher')")
cur.execute("INSERT OR IGNORE INTO Category(Name) VALUES('Staff')")

# table users
cur.execute("CREATE TABLE IF NOT EXISTS User(" \
"Id INTEGER PRIMARY KEY AUTOINCREMENT," \
"Category VARCHAR(50)," \
"Name VARCHAR(50) NOT NULL," \
"Gender VARCHAR(50)," \
"FOREIGN KEY(Category) REFERENCES Category(Id) ON DELETE CASCADE)") 

# service table
cur.execute("CREATE TABLE IF NOT EXISTS Service(" \
"Book VARCHAR(100)," \
"User VARCHAR(50)," \
"Lend_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL," \
"Estimated_return_time DATETIME," \
"Return_time DATETIME," \
"Comment TEXT," \
"FOREIGN KEY(Book) REFERENCES Book(Id) ON DELETE CASCADE," \
"FOREIGN KEY(User) REFERENCES User(Id) ON DELETE CASCADE)")

connection.commit()
connection.close()

# table objects

class Tables:
  def __init__(self, table_name):
    self.table = table_name
    self.connection = sqlite3.connect("libman-db.db")
    self.connection.execute("PRAGMA foreign_keys = ON")
    self.cur = self.connection.cursor()

  def create(self,**kwargs):
    keys = ", ".join(kwargs.keys())
    placeholder = ", ".join(['?'] * len(kwargs))
    values = tuple(kwargs.values())  
    self.cur.execute(f"INSERT INTO {self.table} ({keys}) VALUES ({placeholder})", values )
    self.connection.commit()
  
  def read(self, entity: str = "*", count_by: str = "*", groupby: str = None, where: str = None, join: str = None, count: bool = False, having: int = None, **kwargs):
    query = f"SELECT {entity} FROM {self.table}"
    
    if join:
        query += f" JOIN {join} ON {self.table}.{join} = {join}.id"
    
    if where:
        query += f" WHERE {where}"

    if groupby:
        query += f" GROUP BY {groupby}"
    
    if having:
       query = f"SELECT * FROM {self.table} WHERE {entity} IN (SELECT {entity} FROM {self.table} GROUP BY {entity} HAVING COUNT(*)= {having})"       

    if count:
        query = f"SELECT {entity}, COUNT({count_by}) FROM {self.table}"
        if join:
            query += f" JOIN {join} ON {self.table}.{join} = {join}.id"
        if where:
            query += f" WHERE {where}"
        if groupby:
            query += f" GROUP BY {groupby}"
    
    self.cur.execute(query)

    return self.cur.fetchall()

  def update(self, where: dict, new_values: dict):
    set_clause = ", ".join(f'{k}= ?' for k in new_values)
    where_clause = " AND ".join(f'{k}= ?' for k in where)
    values = tuple(new_values.values()) + tuple(where.values())
    self.cur.execute(f"UPDATE {self.table} SET {set_clause} WHERE {where_clause}", values)
    self.connection.commit()

  def delete(self, **kwargs):
    ref = " AND ".join(f'{k}= ?' for k in kwargs)
    values = tuple(kwargs.values())
    self.cur.execute(f"DELETE FROM {self.table} WHERE {ref}", values)
    self.connection.commit()

  def close(self):
    self.connection.close()

  def exist(self, **kwarg):
     where_clause = ", ".join(f"{k}= ?" for k in kwarg.keys())
     values = tuple(kwarg.values())
     self.cur.execute(f"SELECT EXISTS(SELECT 1 FROM {self.table} WHERE {where_clause})", values)
     self.connection.commit()
     result = self.cur.fetchone()[0]
     return True if result == 1 else False
