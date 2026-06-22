const express = require('express');
const app = express();
const fs = require("node:fs")
const path = require("node:path")
const filePath = path.resolve("./users.json");
app.use(express.json())
let port = 3000;


// 1
//POST /user (Adding new user)
// app.post("/user", (req, res) => {
//     const { name, age, email } = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        
//         const exists = users.find(u => u.email === email);
//         if (exists) {
//             return res.status(400).json({ message: "Email already exists." });
//         }

//         const newUser = { id: newId, name, age, email };
//         users.push(newUser);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to save user." });
//             }

//             return res.status(201).json({ message: "User added successfully." });
//         });
//     });
// });

// app.listen(port, (req, res, next) => {
//     return console.log(`Server is runinng on port ${port} 🚀`);
// })


//2 
// //POST /user (Adding new user)
// app.post("/user", (req, res) => {
//     const { name, age, email } = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        
//         const exists = users.find(u => u.email === email);
//         if (exists) {
//             return res.status(400).json({ message: "Email already exists." });
//         }

//         const newUser = { id: newId, name, age, email };
//         users.push(newUser);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to save user." });
//             }

//             return res.status(201).json({ message: "User added successfully." });
//         });
//     });
// });

// // PATCH /user/:id
// app.patch("/user/:id", (req, res) => {
//     const id = Number(req.params.id);
//     const updates = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users[userIndex] = { ...users[userIndex], ...updates };

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to update user." });
//             }

//             return res.status(200).json({ message: "User updated successfully." });
//         });
//     });
// });

// app.listen(port, (req, res, next) => {
//     return console.log(`Server is runinng on port ${port} 🚀`);
// })


//3
// //POST /user (Adding new user)
// app.post("/user", (req, res) => {
//     const { name, age, email } = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        
//         const exists = users.find(u => u.email === email);
//         if (exists) {
//             return res.status(400).json({ message: "Email already exists." });
//         }

//         const newUser = { id: newId, name, age, email };
//         users.push(newUser);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to save user." });
//             }

//             return res.status(201).json({ message: "User added successfully." });
//         });
//     });
// });

// // PATCH /user/:id
// app.patch("/user/:id", (req, res) => {
//     const id = Number(req.params.id);
//     const updates = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users[userIndex] = { ...users[userIndex], ...updates };

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to update user." });
//             }

//             return res.status(200).json({ message: "User updated successfully." });
//         });
//     });
// });

// // DELETE /user/:id
// app.delete("/user/:id", (req, res) => {
//     const id = Number(req.params.id);

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users.splice(userIndex, 1);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to delete user." });
//             }

//             return res.status(200).json({ message: "User deleted successfully." });
//         });
//     });
// });

// app.listen(port, (req, res, next) => {
//     return console.log(`Server is runinng on port ${port} 🚀`);
// })


//4 
// //POST /user (Adding new user)
// app.post("/user", (req, res) => {
//     const { name, age, email } = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        
//         const exists = users.find(u => u.email === email);
//         if (exists) {
//             return res.status(400).json({ message: "Email already exists." });
//         }

//         const newUser = { id: newId, name, age, email };
//         users.push(newUser);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to save user." });
//             }

//             return res.status(201).json({ message: "User added successfully." });
//         });
//     });
// });

// // PATCH /user/:id
// app.patch("/user/:id", (req, res) => {
//     const id = Number(req.params.id);
//     const updates = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users[userIndex] = { ...users[userIndex], ...updates };

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to update user." });
//             }

//             return res.status(200).json({ message: "User updated successfully." });
//         });
//     });
// });

// // DELETE /user/:id
// app.delete("/user/:id", (req, res) => {
//     const id = Number(req.params.id);

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users.splice(userIndex, 1);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to delete user." });
//             }

//             return res.status(200).json({ message: "User deleted successfully." });
//         });
//     });
// });

// // GET /user/getByName?name=....
// app.get("/user/getByName", (req, res) => {
//     const { name } = req.query;

//     if (!name) {
//         return res.status(400).json({ message: "Name query is required." });
//     }

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         return res.status(200).json(user);
//     });
// });

// app.listen(port, (req, res, next) => {
//     return console.log(`Server is runinng on port ${port} 🚀`);
// })


//5
// //POST /user (Adding new user)
// app.post("/user", (req, res) => {
//     const { name, age, email } = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        
//         const exists = users.find(u => u.email === email);
//         if (exists) {
//             return res.status(400).json({ message: "Email already exists." });
//         }

//         const newUser = { id: newId, name, age, email };
//         users.push(newUser);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to save user." });
//             }

//             return res.status(201).json({ message: "User added successfully." });
//         });
//     });
// });

// // PATCH /user/:id
// app.patch("/user/:id", (req, res) => {
//     const id = Number(req.params.id);
//     const updates = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users[userIndex] = { ...users[userIndex], ...updates };

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to update user." });
//             }

//             return res.status(200).json({ message: "User updated successfully." });
//         });
//     });
// });

// // DELETE /user/:id
// app.delete("/user/:id", (req, res) => {
//     const id = Number(req.params.id);

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users.splice(userIndex, 1);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to delete user." });
//             }

//             return res.status(200).json({ message: "User deleted successfully." });
//         });
//     });
// });

// // GET /user/getByName?name=....
// app.get("/user/getByName", (req, res) => {
//     const { name } = req.query;

//     if (!name) {
//         return res.status(400).json({ message: "Name query is required." });
//     }

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         return res.status(200).json(user);
//     });
// });

// // GET /user
// app.get("/user", (req, res) => {

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         return res.status(200).json({users});
//     });
// });

// app.listen(port, (req, res, next) => {
//     return console.log(`Server is runinng on port ${port} 🚀`);
// })


//6
// //POST /user (Adding new user)
// app.post("/user", (req, res) => {
//     const { name, age, email } = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        
//         const exists = users.find(u => u.email === email);
//         if (exists) {
//             return res.status(400).json({ message: "Email already exists." });
//         }

//         const newUser = { id: newId, name, age, email };
//         users.push(newUser);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to save user." });
//             }

//             return res.status(201).json({ message: "User added successfully." });
//         });
//     });
// });

// // PATCH /user/:id
// app.patch("/user/:id", (req, res) => {
//     const id = Number(req.params.id);
//     const updates = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users[userIndex] = { ...users[userIndex], ...updates };

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to update user." });
//             }

//             return res.status(200).json({ message: "User updated successfully." });
//         });
//     });
// });

// // DELETE /user/:id
// app.delete("/user/:id", (req, res) => {
//     const id = Number(req.params.id);

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users.splice(userIndex, 1);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to delete user." });
//             }

//             return res.status(200).json({ message: "User deleted successfully." });
//         });
//     });
// });

// // GET /user/byName?name=....
// app.get("/user/byName", (req, res) => {
//     const { name } = req.query;

//     if (!name) {
//         return res.status(400).json({ message: "Name query is required." });
//     }

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         return res.status(200).json(user);
//     });
// });

// // GET /user
// app.get("/user", (req, res) => {

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         return res.status(200).json({users});
//     });
// });

// //  GET /user/filter?minAge=...
// app.get("/user/filter", (req, res) => {
//     const { minAge } = req.query;

//     if (!minAge) {
//         return res.status(400).json({ message: "minAge query is required." });
//     }

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const filtered = users.filter(u => u.age >= Number(minAge));

//         return res.status(200).json(filtered);
//     });
// });

// app.listen(port, (req, res, next) => {
//     return console.log(`Server is runinng on port ${port} 🚀`);
// })


//7
// //POST /user (Adding new user)
// app.post("/user", (req, res) => {
//     const { name, age, email } = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        
//         const exists = users.find(u => u.email === email);
//         if (exists) {
//             return res.status(400).json({ message: "Email already exists." });
//         }

//         const newUser = { id: newId, name, age, email };
//         users.push(newUser);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to save user." });
//             }

//             return res.status(201).json({ message: "User added successfully." });
//         });
//     });
// });

// // PATCH /user/:id
// app.patch("/user/:id", (req, res) => {
//     const id = Number(req.params.id);
//     const updates = req.body;

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users[userIndex] = { ...users[userIndex], ...updates };

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to update user." });
//             }

//             return res.status(200).json({ message: "User updated successfully." });
//         });
//     });
// });

// // DELETE /user/:id
// app.delete("/user/:id", (req, res) => {
//     const id = Number(req.params.id);

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User ID not found." });
//         }

//         users.splice(userIndex, 1);

//         fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
//             if (err) {
//                 return res.status(500).json({ message: "Failed to delete user." });
//             }

//             return res.status(200).json({ message: "User deleted successfully." });
//         });
//     });
// });

// // GET /user/byName?name=....
// app.get("/user/byName", (req, res) => {
//     const { name } = req.query;

//     if (!name) {
//         return res.status(400).json({ message: "Name query is required." });
//     }

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         return res.status(200).json(user);
//     });
// });

// // GET /user
// app.get("/user", (req, res) => {

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         return res.status(200).json({users});
//     });
// });

// //  GET /user/filter?minAge=...
// app.get("/user/filter", (req, res) => {
//     const { minAge } = req.query;

//     if (!minAge) {
//         return res.status(400).json({ message: "minAge query is required." });
//     }

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");

//         const filtered = users.filter(u => u.age >= Number(minAge));

//         return res.status(200).json(filtered);
//     });
// });

// // GET /user/:id
// app.get("/user/:id", (req, res) => {
//     const id = Number(req.params.id);

//     fs.readFile(filePath, "utf-8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Server error." });
//         }

//         const users = JSON.parse(data || "[]");
//         const user = users.find(u => u.id === id);

//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         return res.status(200).json(user);
//     });
// });

// app.listen(port, (req, res, next) => {
//     return console.log(`Server is runinng on port ${port} 🚀`);
// })