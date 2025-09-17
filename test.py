from models import Tables

def get_users():
  try:
    user = Tables("User")
    data = user.read(entity="*", join="Category")
    user.close()
    return data
  except Exception as e:
    return f"Error retrieving users: {e}"

print(get_users())