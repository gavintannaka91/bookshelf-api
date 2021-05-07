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

const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;

    // reading param exist
    if (reading && Number(reading) === 1 || Number(reading) === 0) {
        let readingParam = Number(reading);
        if (readingParam === 1) {
            readingParam = true;
        }
        else {
            readingParam = false;
        }
        const filteredBooks = books.filter((book) => book.reading === readingParam).map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
            // reading: book.reading,
        }));

        if (filteredBooks === undefined) {
            const response = h.response({
                status: 'fail',
                message: 'Buku tidak ditemukan',
            });
            response.code(404);
            return response;
        }
        
        const response = h.response({
            status: 'success',
            data: {
                books: filteredBooks,
            },
        });
        response.code(200);
        return response;
    }

    // finished param exist
    else if (finished && Number(finished) === 1 || Number(finished) === 0) {
        let finishedParam = Number(finished);
        if (finishedParam === 1) {
            finishedParam = true;
        }
        else {
            finishedParam = false;
        }
        const filteredBooks = books.filter((book) => book.finished === finishedParam).map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
            // finished: book.finished,
        }));

        if (filteredBooks === undefined) {
            const response = h.response({
                status: 'fail',
                message: 'Buku tidak ditemukan',
            });
            response.code(404);
            return response;
        }
        
        const response = h.response({
            status: 'success',
            data: {
                books: filteredBooks,
            },
        });
        response.code(200);
        return response;
    }

    else if (name) {
        /* 
            cause book lists to disappear after running GET request and query of name
            require further troubleshooting
        */
        const pattern = new RegExp(name, 'gi');

        const filteredBooks = books.filter((book) => pattern.test(book.name)).map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
        }));

        if (filteredBooks === undefined) {
            const response = h.response({
                status: 'fail',
                message: 'Buku tidak ditemukan',
            });
            response.code(404);
            return response;
        }
        
        const response = h.response({
            status: 'success',
            data: {
                books: filteredBooks,
            },
        });
        response.code(200);
        return response;
    }

    // otherwise
    else {
        const response = h.response({
            status: 'success',
            data: {
                books: books.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        });
        response.code(200);
        return response;
    }
};

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

    if (index === -1) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
        });
        response.code(404);
        return response;
    }

    const updatedAt = new Date().toISOString();

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

const deleteBookByIdHandler = (request, h) => {
    const { id } = request.params;
    const index = books.findIndex((book) => book.id === id);

    if (index === -1) {
        const response = h.response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan',
        });
        response.code(404);
        return response;
    }

    books.splice(index, 1);
    const response = h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
}

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler
};