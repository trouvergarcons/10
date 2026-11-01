const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'books.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Default seed data for reset functionality
const DEFAULT_BOOKS = [
  {
    id: "1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    year: 1960,
    status: "Read",
    rating: 5,
    description: "A novel about racial injustice and the loss of innocence in the American South."
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    year: 1949,
    status: "Read",
    rating: 5,
    description: "A cautionary tale about the dangers of totalitarianism, mass surveillance, and censorship."
  },
  {
    id: "3",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic",
    year: 1925,
    status: "Read",
    rating: 4,
    description: "A portrait of the Jazz Age exploring themes of decadence, idealism, and social upheaval."
  },
  {
    id: "4",
    title: "Dune",
    author: "Frank Herbert",
    genre: "Sci-Fi",
    year: 1965,
    status: "Currently Reading",
    rating: 5,
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides and the destiny of a planet."
  },
  {
    id: "5",
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Technology",
    year: 2008,
    status: "Read",
    rating: 4,
    description: "A handbook of agile software craftsmanship with best practices and refactoring techniques."
  },
  {
    id: "6",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    year: 1937,
    status: "Want to Read",
    rating: 5,
    description: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life until Gandalf and dwarves arrive."
  },
  {
    id: "7",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "Non-Fiction",
    year: 2011,
    status: "Want to Read",
    rating: 4,
    description: "A survey of humankind from the evolutionary emergence of Homo sapiens to the 21st century."
  }
];

// Helper: Read books from disk
function readBooks() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeBooks(DEFAULT_BOOKS);
      return DEFAULT_BOOKS;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading books file:', err);
    return [];
  }
}

// Helper: Write books to disk
function writeBooks(books) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving books file:', err);
    return false;
  }
}

// API Routes

/**
 * GET /api/books
 * Retrieves all books with optional filtering by search query, genre, and reading status.
 */
app.get('/api/books', (req, res) => {
  let books = readBooks();
  const { search, genre, status } = req.query;

  if (search) {
    const q = search.trim().toLowerCase();
    books = books.filter(b => 
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q))
    );
  }

  if (genre && genre !== 'All') {
    books = books.filter(b => b.genre && b.genre.toLowerCase() === genre.toLowerCase());
  }

  if (status && status !== 'All') {
    books = books.filter(b => b.status && b.status.toLowerCase() === status.toLowerCase());
  }

  res.json(books);
});

/**
 * GET /api/books/:id
 * Retrieves a single book by ID.
 */
app.get('/api/books/:id', (req, res) => {
  const books = readBooks();
  const book = books.find(b => String(b.id) === String(req.params.id));
  if (!book) {
    return res.status(404).json({ error: `Book with id "${req.params.id}" not found.` });
  }
  res.json(book);
});

/**
 * POST /api/books
 * Creates a new book entry.
 */
app.post('/api/books', (req, res) => {
  const { title, author, genre, year, status, rating, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Book title is required.' });
  }
  if (!author || !author.trim()) {
    return res.status(400).json({ error: 'Book author is required.' });
  }

  const books = readBooks();
  const newBook = {
    id: String(Date.now()),
    title: title.trim(),
    author: author.trim(),
    genre: genre ? genre.trim() : 'General',
    year: year ? parseInt(year, 10) : new Date().getFullYear(),
    status: status || 'Want to Read',
    rating: rating ? Math.min(5, Math.max(1, parseInt(rating, 10))) : 5,
    description: description ? description.trim() : ''
  };

  books.unshift(newBook);
  writeBooks(books);

  res.status(201).json(newBook);
});

/**
 * PUT /api/books/:id
 * Updates an existing book.
 */
app.put('/api/books/:id', (req, res) => {
  const books = readBooks();
  const index = books.findIndex(b => String(b.id) === String(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: `Book with id "${req.params.id}" not found.` });
  }

  const { title, author, genre, year, status, rating, description } = req.body;

  if (title !== undefined && !title.trim()) {
    return res.status(400).json({ error: 'Title cannot be empty.' });
  }
  if (author !== undefined && !author.trim()) {
    return res.status(400).json({ error: 'Author cannot be empty.' });
  }

  books[index] = {
    ...books[index],
    ...(title && { title: title.trim() }),
    ...(author && { author: author.trim() }),
    ...(genre && { genre: genre.trim() }),
    ...(year && { year: parseInt(year, 10) }),
    ...(status && { status }),
    ...(rating !== undefined && { rating: Math.min(5, Math.max(1, parseInt(rating, 10))) }),
    ...(description !== undefined && { description: description.trim() })
  };

  writeBooks(books);
  res.json(books[index]);
});

/**
 * DELETE /api/books/:id
 * Deletes a book by ID.
 */
app.delete('/api/books/:id', (req, res) => {
  const books = readBooks();
  const index = books.findIndex(b => String(b.id) === String(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: `Book with id "${req.params.id}" not found.` });
  }

  const [deletedBook] = books.splice(index, 1);
  writeBooks(books);

  res.json({ message: 'Book deleted successfully', book: deletedBook });
});

/**
 * POST /api/books/reset
 * Resets database back to default seed books.
 */
app.post('/api/books/reset', (req, res) => {
  writeBooks(DEFAULT_BOOKS);
  res.json({ message: 'Books database reset to default seed.', books: DEFAULT_BOOKS });
});

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Book Catalog Server is running!`);
  console.log(` Web UI:   http://localhost:${PORT}`);
  console.log(` REST API: http://localhost:${PORT}/api/books`);
  console.log(`===============================================`);
});
