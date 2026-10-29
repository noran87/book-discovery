import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parent / "books.db"

def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def init_db():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS saved_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_key TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            author TEXT,
            first_publish_year INTEGER
        )
    """)

    connection.commit()
    connection.close()
    
def save_book(book):
    connection = get_db_connection()

    connection.execute("""
        INSERT INTO saved_books (
            book_key,
            title,
            author,
            first_publish_year)
        VALUES (?, ?, ?, ?)
        """, (
            book["key"],
            book["title"],
            book.get("author_name", ["Unknown author"])[0],
            book.get("first_publish_year")
    ))

    connection.commit()
    connection.close()    
    
def get_saved_books():
    connection = get_db_connection()

    books = connection.execute(
        "SELECT * FROM saved_books"
    ).fetchall()

    connection.close()

    return [dict(book) for book in books]   

def delete_book(book_id):
    connection = get_db_connection()

    connection.execute(
        "DELETE FROM saved_books WHERE id = ?",
        (book_id,)
    )

    connection.commit()
    connection.close()
    
    