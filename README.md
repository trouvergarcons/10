# 📚 Book Catalog & Management System

A full-stack web application demonstrating **jQuery AJAX** data fetching, dynamic DOM manipulation, and CRUD operations connected to a **Node.js / Express REST API** backend.

---

## 🚀 Features

- **jQuery AJAX Integration**:
  - `$.ajax` `GET` to retrieve book data from `/api/books` (fulfilling the "Load Books" button and real-time search/filters).
  - `$.ajax` `POST` to add new books to the catalog.
  - `$.ajax` `PUT` to update existing book records.
  - `$.ajax` `DELETE` to remove books with modal confirmation.
- **Interactive UI**:
  - **Live Search**: Instant keyword filtering across titles, authors, and descriptions.
  - **Category Filters**: Filter by genre (Fiction, Sci-Fi, Technology, etc.) and reading status (Read, Reading, Want to Read).
  - **Reading Statistics**: Live counters summarizing library metrics.
  - **Modal Dialogs**: Accessible modals for adding, editing, and deleting books.
  - **Toast Notifications**: Non-intrusive feedback on network events.
- **RESTful Express Backend**:
  - File-backed JSON database (`data/books.json`) for persistence across server restarts.
  - Seed reset endpoint (`POST /api/books/reset`) to restore sample books at any time.

---

## 📁 Project Structure

```
.
├── server.js               # Express server and REST API routes
├── package.json            # Project dependencies and npm scripts
├── data/
│   └── books.json          # File-backed JSON data storage
├── public/                 # Static frontend files
│   ├── index.html          # HTML5 layout, modals, and control panel
│   ├── css/
│   │   └── style.css       # Clean, modern, responsive styles
│   └── js/
│       └── app.js          # jQuery AJAX logic and UI handlers
└── README.md               # Documentation
```

---

## 🛠️ Getting Started

### 1. Start the Server

```bash
npm start
```
Or with auto-restart on code changes (Node 18+):
```bash
npm run dev
```

The server will launch at:
- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **REST API Endpoint**: [http://localhost:3000/api/books](http://localhost:3000/api/books)

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Query / Body Parameters |
|---|---|---|---|
| `GET` | `/api/books` | Retrieve list of books | `?search=query`, `?genre=name`, `?status=val` |
| `GET` | `/api/books/:id` | Retrieve single book | — |
| `POST` | `/api/books` | Create a new book | JSON: `{ title, author, genre, year, status, rating, description }` |
| `PUT` | `/api/books/:id` | Update an existing book | JSON: updated fields |
| `DELETE` | `/api/books/:id` | Delete a book | — |
| `POST` | `/api/books/reset` | Reset sample database | — |

---

## 💡 jQuery AJAX Example Snippet

The core requirement from the prompt is implemented inside `public/js/app.js`:

```javascript
$('#load-books-btn').on('click', function () {
  $.ajax({
    url: '/api/books',
    method: 'GET',
    dataType: 'json',
    beforeSend: function () {
      $('#loading-state').show();
      $('#books-grid').empty();
    },
    success: function (books) {
      $.each(books, function (index, book) {
        const $card = $('<div></div>').addClass('book-card');
        const $title = $('<h3></h3>').text(book.title);
        const $author = $('<p></p>').text('by ' + book.author);
        $card.append($title, $author);
        $('#books-grid').append($card);
      });
    },
    error: function (xhr, status, error) {
      console.error('Failed to load books:', error);
    },
    complete: function () {
      $('#loading-state').hide();
    }
  });
});
```
