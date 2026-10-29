from flask import Flask, request
from flask_cors import CORS
import sqlite3
import database as db 
 
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

@app.route("/")
def home():
    return {"message": "Book Discovery API is running!"}

@app.route("/api/books", methods=["POST"])
def add_book():
    book = request.get_json()
    try:
        db.save_book(book)
    except sqlite3.IntegrityError:
        return {"error": "This book is already saved."}, 409
    
    return {"message": "Book saved successfully!"}, 201

@app.route("/api/books", methods=["GET"])
def books():
    return db.get_saved_books()

@app.route("/api/books/<int:book_id>", methods=["DELETE"])
def remove_book(book_id):
    db.delete_book(book_id)
    return {"message": "Book deleted successfully!"}, 200

if __name__ == "__main__":
    db.init_db()
    app.run(debug=True, port=5001)
    
    
