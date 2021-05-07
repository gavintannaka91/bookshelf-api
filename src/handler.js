const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
    const { 
        name, 
        year, 
        author, 
        summary, 
        publisher, 
        pageCount,
        readPage,
        reading
    } = request.payload;

    const id = nanoid(16);
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {
        name, 
        year, 
        author, 
        summary, 
        publisher, 
        pageCount,
        readPage,
        reading,
        id,
        finished,
        insertedAt,
        updatedAt
    };

    const checkName = newBook.name === undefined;
    const checkReadPage = newBook.pageCount < newBook.readPage;
    
    if (checkName) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    if (checkReadPage) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }

    books.push(newBook);

    const isSuccess = books.filter((book) => book.id === id).length > 0;

    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        });
        response.code(201);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
};

const getAllBooksHandler = () => ({
    status: 'success',
    data: 
    {
        books: books.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
        })),
    }
});

const getBookByIdHandler = (request, h) => {
    const { id } = request.params;
    const book = books.filter((b) => b.id === id)[0];

    if (book !== undefined) {
        const response = h.response({
            status: 'success',
            data: {
                book,
            },
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
}

const editBookByIdHandler = (request, h) => {
    const { id } = request.params;
    const { 
        name, 
        year, 
        author, 
        summary, 
        publisher, 
        pageCount,
        readPage,
        reading
    } = request.payload;

    if (name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }
    const index = books.findIndex((book) => book.id === id);
    const updatedAt = new Date().toISOString();

    if (index === -1) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
        });
        response.code(404);
        return response;
    }

    books[index] = {
        ...books[index],
        name, 
        year, 
        author, 
        summary, 
        publisher, 
        pageCount,
        readPage,
        reading,
        updatedAt,
    };

    const response = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;

}

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler
};