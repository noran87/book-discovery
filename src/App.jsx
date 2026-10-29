import { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [search, setSearch] = useState("");
    const [books, setBooks] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);
    const [savedBooks, setSavedBooks] = useState([]);
    const [savedBooksLoading, setSavedBooksLoading] = useState(true);
    const [savedBooksError, setSavedBooksError] = useState("");

   function loadSavedBooks() {
        return fetch("http://127.0.0.1:5001/api/books")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load saved books");
                }

                return response.json();
            })
            .then((data) => {
                setSavedBooks(data.map((book) => ({
                    id: book.id,
                    key: book.book_key,
                    title: book.title,
                    author_name: [book.author],
                    first_publish_year: book.first_publish_year
                })));
            })
            .catch((error) => {
                console.error(error);
                setSavedBooksError("Could not load your reading list.");
            })
            .finally(() => {
                setSavedBooksLoading(false);
            });
    }
    useEffect(() => {
        loadSavedBooks();
    }, []);

    const languageNames = {
        eng: "English",
        fre: "French",
        spa: "Spanish",
        ger: "German",
        ita: "Italian",
        ara: "Arabic",
        };

    async function handleSearch(event) {
        event.preventDefault();
        if (search.trim() === "") {
            return;
            }

        setHasSearched(true);
        setSelectedBook(null);
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(search)}`);

            if (!response.ok) {
            throw new Error("Could not fetch books");}

            const data = await response.json();
            setBooks(data.docs.slice(0, 10));}

            catch (error) {
                console.log(error);
                setError("Something went wrong. Please try again.");
                setBooks([]);}

            finally {
                setLoading(false);}
        
    }

    async function handleSaveBook(book) {
    setError("");
    try {
        const response = await fetch(
            "http://127.0.0.1:5001/api/books",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(book)
            }
        );

        if (!response.ok) {
            throw new Error("Could not save book");
        }
        setSavedBooksLoading(true);
        setSavedBooksError("");
        await loadSavedBooks();
    } catch (error) {
        console.error(error);
        setError(error.message);
    }
    }

    async function handleRemoveBook(bookId) {
        setError("");
        try {
            const response = await fetch(
                `http://127.0.0.1:5001/api/books/${bookId}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error("Could not remove book");
            }

            setSavedBooks((previousBooks) =>
                previousBooks.filter((book) => book.id !== bookId)
            );
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    }

    return (
        <div>
            <h1>Book Discovery</h1>
            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search for a book"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <button className="search-button" type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {hasSearched && !loading && !error && books.length === 0 && (
               <p>No books found. Try another search.</p>)}

            {error && <p>{error}</p>}

            {loading && <p>Loading books...</p>}

            {!hasSearched && <p>Search for a book to get started!</p>}

            <p>Books displayed: {books.length}</p>

            <div className="book-grid">
                {books.map((book) => (
                <div key={book.key} className="book-card">
                    {book.cover_i ? (
                    <img
                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                        alt={book.title}
                        width="120"
                        height="180"/>) : (<p>No cover available</p>)}
                    <h3>{book.title}</h3>
                    <p>{book.author_name?.[0] || "Unknown author"}</p>
                    <p>First published: {book.first_publish_year || "Unknown"}</p>
                    <button 
                    onClick={() => setSelectedBook(selectedBook?.key === book.key ? null : book)}>
                    {selectedBook?.key === book.key ? "Hide Details" : "View Details"} </button>
                    <button
                        onClick={() => handleSaveBook(book)}
                        disabled={savedBooks.some(
                            (savedBook) => savedBook.key === book.key
                        )}>
                        {savedBooks.some((savedBook) => savedBook.key === book.key)
                            ? "Saved"
                            : "Save Book"}
                    </button>
                    
                    {selectedBook?.key === book.key && (
                    <div className="book-details">
                        <h3>Book Details</h3>
                        <p>Title: {book.title}</p>
                        <p>Author: {book.author_name?.[0] || "Unknown author"}</p>
                        <p>First published: {book.first_publish_year || "Unknown"}</p>
                        <p>Number of editions: {book.edition_count ?? "Unknown"}</p>
                        <p>Languages: {book.language?.map((code) => 
                            languageNames[code] || code).join(", ") || "Unknown"}</p>
                        <a href={`https://openlibrary.org${book.key}`}
                        target="_blank"
                        rel="noopener noreferrer">View on Open Library</a>
                    </div>
                    )}
                </div>))}
                   
            </div>

            <h2>My Reading List</h2>
            {savedBooksLoading && <p>Loading your reading list...</p>}

            {savedBooksError && <p>{savedBooksError}</p>}

            {!savedBooksLoading && !savedBooksError && savedBooks.length === 0 && (
                <p>Your reading list is empty. Save a book to get started!</p>
            )}

            {savedBooks.map((book) => (
            <div key={book.key}>
                <p>{book.title}</p>

            <button onClick={() => handleRemoveBook(book.id)}>
                Remove
            </button>

            </div>
            ))}
            
        </div>  
    );
   
}


export default App;
