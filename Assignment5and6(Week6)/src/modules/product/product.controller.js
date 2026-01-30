import { db } from "../../DB/connection.db.js";

export const getAllProducts = (req, res) => {
  const query = `SELECT * FROM Products`;

  db.execute(query, (error, result) => {
    if (error) {
      return res.status(500).json({ message: "Query error" });
    }

    return res.status(200).json({ message: "Done", result });
  });
};
