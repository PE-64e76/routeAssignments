import * as service from "./books.service.js";

export const createBooksCollection = async (req, res) =>
  res.json(await service.createBooksCollection());
export const createAuthorsCollection = async (req, res) =>
  res.json(await service.createAuthorsCollection());
export const createLogsCollection = async (req, res) =>
  res.json(await service.createLogsCollection());
export const createBooksIndex = async (req, res) =>
  res.json(await service.createBooksIndex());

export const insertOneBook = async (req, res) =>
  res.json(await service.insertOneBook(req.body));
export const insertManyBooks = async (req, res) =>
  res.json(await service.insertManyBooks(req.body));
export const insertLog = async (req, res) =>
  res.json(await service.insertLog(req.body));

export const updateBookByTitle = async (req, res) =>
  res.json(await service.updateBookByTitle(req.params.title));

export const findBookByTitle = async (req, res) =>
  res.json(await service.findBookByTitle(req.query.title));
export const findBooksByYear = async (req, res) =>
  res.json(await service.findBooksByYear(+req.query.from, +req.query.to));
export const findBooksByGenre = async (req, res) =>
  res.json(await service.findBooksByGenre(req.query.genre));
export const skipLimitBooks = async (req, res) =>
  res.json(await service.skipLimitBooks());

export const yearIsInteger = async (req, res) =>
  res.json(await service.yearIsInteger());
export const excludeGenres = async (req, res) =>
  res.json(await service.excludeGenres());
export const deleteBeforeYear = async (req, res) =>
  res.json(await service.deleteBeforeYear(+req.query.year));

export const aggregate1 = async (req, res) =>
  res.json(await service.aggregate1());
export const aggregate2 = async (req, res) =>
  res.json(await service.aggregate2());
export const aggregate3 = async (req, res) =>
  res.json(await service.aggregate3());
export const aggregate4 = async (req, res) =>
  res.json(await service.aggregate4());

