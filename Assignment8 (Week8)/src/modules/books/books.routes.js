import { Router } from 'express';
import * as controller from './books.controller.js';


const router = Router();


router.post('/collection/books', controller.createBooksCollection);
router.post('/collection/authors', controller.createAuthorsCollection);
router.post('/collection/logs/capped', controller.createLogsCollection);
router.post('/collection/books/index', controller.createBooksIndex);


router.post('/books', controller.insertOneBook);
router.post('/books/batch', controller.insertManyBooks);
router.post('/logs', controller.insertLog);


router.patch('/books/:title', controller.updateBookByTitle);


router.get('/books/title', controller.findBookByTitle);
router.get('/books/year', controller.findBooksByYear);
router.get('/books/genre', controller.findBooksByGenre);
router.get('/books/skip-limit', controller.skipLimitBooks);


router.get('/books/year-integer', controller.yearIsInteger);
router.get('/books/exclude-genres', controller.excludeGenres);
router.delete('/books/before-year', controller.deleteBeforeYear);


router.get('/books/aggregate1', controller.aggregate1);
router.get('/books/aggregate2', controller.aggregate2);
router.get('/books/aggregate3', controller.aggregate3);
router.get('/books/aggregate4', controller.aggregate4);


export default router;