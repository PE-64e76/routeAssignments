const path = require('node:path');
const fs = require('node:fs');
const { createGzip } = require('node:zlib');
const http = require("node:http");


//Part 1: Core Modules

// 1
// const filePath = path.resolve("./big.txt")
// const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
// readStream.on('data', (chunk) => {
//     console.log('_______________________________________________');
//     console.log(chunk);
//     console.log('_______________________________________________');
// });


// 2
// const filePath = path.resolve("./source.txt")
// const destPath = path.resolve("./dest.txt")
// const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
// const writeStream = fs.createWriteStream(destPath);
// readStream.on('data', (chunk) => {
//     console.log('_______________________________________________');
//     console.log(chunk);
//     writeStream.write(chunk);
//     console.log('_______________________________________________');
// });


// 3
// const filePath = path.resolve("./source.txt")
// const dataPath = path.resolve("./data.txt.gz")
// const readStream = fs.createReadStream(filePath);
// const writeStream = fs.createWriteStream(dataPath);

// const gzip = createGzip();
// readStream.pipe(gzip).pipe(writeStream);






// Part 2: Simple CRUD Operations Using HTTP 

// 1
// let port = 3000;

// const httpServer = http.createServer((req, res) => {
//     const { url, method } = req;

//     // Post /user
//     if (method === "POST" && url === "/user") {
//         let body = "";

//         req.on("data", (chunk) => {
//             body += chunk.toString();
//         });

//         req.on("end", () => {
//             const newUser = JSON.parse(body);


//             fs.readFile("users.json", "utf-8", (err, data) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Server error." }));
//                 }

//                 const users = JSON.parse(data || "[]");


//                 const exists = users.find((u) => u.email === newUser.email);

//                 if (exists) {
//                     res.writeHead(400, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Email already exists." }));
//                 }


//                 users.push(newUser);

//                 fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                     if (err) {
//                         res.writeHead(500, { "content-type": "application/json" });
//                         return res.end(JSON.stringify({ message: "Failed to save user." }));
//                     }

//                     res.writeHead(201, { "content-type": "application/json" });
//                     res.end(JSON.stringify({ message: "User added successfully." }));
//                 });
//             });
//         });

//     }

//     else {
//         res.writeHead(404, { "content-type": "text/plain" });
//         res.end("404 page not found");
//     }
// });


// function listen() {
//     httpServer.listen(port, "127.0.0.1", () => {
//         console.log(`Server is running on port ${port} 🚀`);
//     });
// }


// httpServer.on("error", (error) => {
//     if (error.code === "EADDRINUSE") {
//         ++port;
//         listen();
//     } else {
//         httpServer.close();
//     }
// });

// httpServer.on("close", () => {
//     console.log("Server is offline ❌");
// });
// listen();


// 2
// let port = 3000;

// const httpServer = http.createServer((req, res) => {
//     const { url, method } = req;

//     // POST /user
//     if (method === "POST" && url === "/user") {
//         let body = "";

//         req.on("data", (chunk) => {
//             body += chunk.toString();
//         });

//         req.on("end", () => {
//             const newUser = JSON.parse(body);

//             fs.readFile("users.json", "utf-8", (err, data) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Server error." }));
//                 }

//                 const users = JSON.parse(data || "[]");

//                 const exists = users.find((u) => u.email === newUser.email);

//                 if (exists) {
//                     res.writeHead(400, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Email already exists." }));
//                 }

//                 users.push(newUser);

//                 fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                     if (err) {
//                         res.writeHead(500, { "content-type": "application/json" });
//                         return res.end(JSON.stringify({ message: "Failed to save user." }));
//                     }

//                     res.writeHead(201, { "content-type": "application/json" });
//                     res.end(JSON.stringify({ message: "User added successfully." }));
//                 });
//             });
//         });
//     }

//     //  PATCH /user/id 
//     else if (method === "PATCH" && url.startsWith("/user/")) {
//         const id = Number(url.split("/")[2]);
//         let body = "";

//         req.on("data", chunk => body += chunk.toString());
//         req.on("end", () => {
//             const updates = JSON.parse(body);

//             fs.readFile("users.json", "utf-8", (err, data) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Server error." }));
//                 }

//                 let users = JSON.parse(data || "[]");

//                 const userIndex = users.findIndex(u => u.id === id);

//                 if (userIndex === -1) {
//                     res.writeHead(404, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "User ID not found." }));
//                 }

//                 users[userIndex] = { ...users[userIndex], ...updates };

//                 fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                     if (err) {
//                         res.writeHead(500, { "content-type": "application/json" });
//                         return res.end(JSON.stringify({ message: "Failed to update user." }));
//                     }

//                     res.writeHead(200, { "content-type": "application/json" });
//                     res.end(JSON.stringify({ message: "User updated successfully." }));
//                 });
//             });
//         });
//     }


//     else {
//         res.writeHead(404, { "content-type": "text/plain" });
//         res.end("404 page not found");
//     }
// });


// function listen() {
//     httpServer.listen(port, "127.0.0.1", () => {
//         console.log(`Server is running on port ${port} 🚀`);
//     });
// }


// httpServer.on("error", (error) => {
//     if (error.code === "EADDRINUSE") {
//         ++port;
//         listen();
//     } else {
//         httpServer.close();
//     }
// });

// httpServer.on("close", () => {
//     console.log("Server is offline ❌");
// });
// listen();


// 3
// let port = 3000;

// const httpServer = http.createServer((req, res) => {
//     const { url, method } = req;

//     // POST /user
//     if (method === "POST" && url === "/user") {
//         let body = "";

//         req.on("data", (chunk) => {
//             body += chunk.toString();
//         });

//         req.on("end", () => {
//             const newUser = JSON.parse(body);

//             fs.readFile("users.json", "utf-8", (err, data) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Server error." }));
//                 }

//                 const users = JSON.parse(data || "[]");

//                 const exists = users.find((u) => u.email === newUser.email);

//                 if (exists) {
//                     res.writeHead(400, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Email already exists." }));
//                 }

//                 users.push(newUser);

//                 fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                     if (err) {
//                         res.writeHead(500, { "content-type": "application/json" });
//                         return res.end(JSON.stringify({ message: "Failed to save user." }));
//                     }

//                     res.writeHead(201, { "content-type": "application/json" });
//                     res.end(JSON.stringify({ message: "User added successfully." }));
//                 });
//             });
//         });
//     }

//     // PATCH /user/:id
//     else if (method === "PATCH" && url.startsWith("/user/")) {
//         const id = Number(url.split("/")[2]);
//         let body = "";

//         req.on("data", chunk => body += chunk.toString());
//         req.on("end", () => {
//             const updates = JSON.parse(body);

//             fs.readFile("users.json", "utf-8", (err, data) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Server error." }));
//                 }

//                 let users = JSON.parse(data || "[]");

//                 const userIndex = users.findIndex(u => u.id === id);

//                 if (userIndex === -1) {
//                     res.writeHead(404, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "User ID not found." }));
//                 }

//                 users[userIndex] = { ...users[userIndex], ...updates };

//                 fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                     if (err) {
//                         res.writeHead(500, { "content-type": "application/json" });
//                         return res.end(JSON.stringify({ message: "Failed to update user." }));
//                     }

//                     res.writeHead(200, { "content-type": "application/json" });
//                     res.end(JSON.stringify({ message: "User updated successfully." }));
//                 });
//             });
//         });
//     }

//     // DELETE /user/:id
//     else if (method === "DELETE" && url.startsWith("/user/")) {
//         const id = Number(url.split("/")[2]);

//         fs.readFile("users.json", "utf-8", (err, data) => {
//             if (err) {
//                 res.writeHead(500, { "content-type": "application/json" });
//                 return res.end(JSON.stringify({ message: "Server error." }));
//             }

//             let users = JSON.parse(data || "[]");

//             const userIndex = users.findIndex(u => u.id === id);

//             if (userIndex === -1) {
//                 res.writeHead(404, { "content-type": "application/json" });
//                 return res.end(JSON.stringify({ message: "User ID not found." }));
//             }

//             users.splice(userIndex, 1);

//             fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Failed to delete user." }));
//                 }

//                 res.writeHead(200, { "content-type": "application/json" });
//                 res.end(JSON.stringify({ message: "User deleted successfully." }));
//             });
//         });
//     }


//     else {
//         res.writeHead(404, { "content-type": "text/plain" });
//         res.end("404 page not found");
//     }
// });


// function listen() {
//     httpServer.listen(port, "127.0.0.1", () => {
//         console.log(`Server is running on port ${port} 🚀`);
//     });
// }


// httpServer.on("error", (error) => {
//     if (error.code === "EADDRINUSE") {
//         ++port;
//         listen();
//     } else {
//         httpServer.close();
//     }
// });

// httpServer.on("close", () => {
//     console.log("Server is offline ❌");
// });
// listen();


// 4
// let port = 3000;

// const httpServer = http.createServer((req, res) => {
//     const { url, method } = req;

//     // POST /user
//     if (method === "POST" && url === "/user") {
//         let body = "";

//         req.on("data", (chunk) => {
//             body += chunk.toString();
//         });

//         req.on("end", () => {
//             const newUser = JSON.parse(body);

//             fs.readFile("users.json", "utf-8", (err, data) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Server error." }));
//                 }

//                 const users = JSON.parse(data || "[]");

//                 const exists = users.find((u) => u.email === newUser.email);

//                 if (exists) {
//                     res.writeHead(400, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Email already exists." }));
//                 }

//                 users.push(newUser);

//                 fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                     if (err) {
//                         res.writeHead(500, { "content-type": "application/json" });
//                         return res.end(JSON.stringify({ message: "Failed to save user." }));
//                     }

//                     res.writeHead(201, { "content-type": "application/json" });
//                     res.end(JSON.stringify({ message: "User added successfully." }));
//                 });
//             });
//         });
//     }

//     // PATCH /user/:id
//     else if (method === "PATCH" && url.startsWith("/user/")) {
//         const id = Number(url.split("/")[2]);
//         let body = "";

//         req.on("data", chunk => body += chunk.toString());
//         req.on("end", () => {
//             const updates = JSON.parse(body);

//             fs.readFile("users.json", "utf-8", (err, data) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Server error." }));
//                 }

//                 let users = JSON.parse(data || "[]");

//                 const userIndex = users.findIndex(u => u.id === id);

//                 if (userIndex === -1) {
//                     res.writeHead(404, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "User ID not found." }));
//                 }


//                 users[userIndex] = { ...users[userIndex], ...updates };

//                 fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                     if (err) {
//                         res.writeHead(500, { "content-type": "application/json" });
//                         return res.end(JSON.stringify({ message: "Failed to update user." }));
//                     }

//                     res.writeHead(200, { "content-type": "application/json" });
//                     res.end(JSON.stringify({ message: "User updated successfully." }));
//                 });
//             });
//         });
//     }


//     // DELETE /user/:id
//     else if (method === "DELETE" && url.startsWith("/user/")) {
//     const id = Number(url.split("/")[2]);

//     fs.readFile("users.json", "utf-8", (err, data) => {
//         if (err) {
//             res.writeHead(500, { "content-type": "application/json" });
//             return res.end(JSON.stringify({ message: "Server error." }));
//         }

//         let users = JSON.parse(data || "[]");

//         const userIndex = users.findIndex(u => u.id === id);

//         if (userIndex === -1) {
//             res.writeHead(404, { "content-type": "application/json" });
//             return res.end(JSON.stringify({ message: "User ID not found." }));
//         }

//         users.splice(userIndex, 1);

//         fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//             if (err) {
//                 res.writeHead(500, { "content-type": "application/json" });
//                 return res.end(JSON.stringify({ message: "Failed to delete user." }));
//             }

//             res.writeHead(200, { "content-type": "application/json" });
//             res.end(JSON.stringify({ message: "User deleted successfully." }));
//         });
//     });
// }

//     // GET /user
//     else if (method === "GET" && url === "/user") {

//         fs.readFile("users.json", "utf-8", (err, data) => {
//             if (err) {
//                 res.writeHead(500, { "content-type": "application/json" });
//                 return res.end(JSON.stringify({ message: "Server error." }));
//             }

//             const users = JSON.parse(data || "[]");

//             res.writeHead(200, { "content-type": "application/json" });
//             res.end(JSON.stringify(users));
//         });
//     }


//     else {
//         res.writeHead(404, { "content-type": "text/plain" });
//         res.end("404 page not found");
//     }
// });

// function listen() {
//     httpServer.listen(port, "127.0.0.1", () => {
//         console.log(`Server is running on port ${port} 🚀`);
//     });
// }

// httpServer.on("error", (error) => {
//     if (error.code === "EADDRINUSE") {
//         ++port;
//         listen();
//     } else {
//         httpServer.close();
//     }
// });

// httpServer.on("close", () => {
//     console.log("Server is offline ❌");
// });
// listen();


// 5
// let port = 3000;

// const httpServer = http.createServer((req, res) => {
//     const { url, method } = req;

//     // POST /user
//     if (method === "POST" && url === "/user") {
//         let body = "";

//         req.on("data", (chunk) => {
//             body += chunk.toString();
//         });

//         req.on("end", () => {
//             const newUser = JSON.parse(body);

//             fs.readFile("users.json", "utf-8", (err, data) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Server error." }));
//                 }

//                 const users = JSON.parse(data || "[]");

//                 const exists = users.find((u) => u.email === newUser.email);

//                 if (exists) {
//                     res.writeHead(400, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Email already exists." }));
//                 }

//                 users.push(newUser);

//                 fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                     if (err) {
//                         res.writeHead(500, { "content-type": "application/json" });
//                         return res.end(JSON.stringify({ message: "Failed to save user." }));
//                     }

//                     res.writeHead(201, { "content-type": "application/json" });
//                     res.end(JSON.stringify({ message: "User added successfully." }));
//                 });
//             });
//         });
//     }

//     // PATCH /user/:id
//     else if (method === "PATCH" && url.startsWith("/user/")) {
//         const id = Number(url.split("/")[2]);
//         let body = "";

//         req.on("data", chunk => body += chunk.toString());
//         req.on("end", () => {
//             const updates = JSON.parse(body);

//             fs.readFile("users.json", "utf-8", (err, data) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Server error." }));
//                 }

//                 let users = JSON.parse(data || "[]");

//                 const userIndex = users.findIndex(u => u.id === id);

//                 if (userIndex === -1) {
//                     res.writeHead(404, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "User ID not found." }));
//                 }

//                 users[userIndex] = { ...users[userIndex], ...updates };

//                 fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                     if (err) {
//                         res.writeHead(500, { "content-type": "application/json" });
//                         return res.end(JSON.stringify({ message: "Failed to update user." }));
//                     }

//                     res.writeHead(200, { "content-type": "application/json" });
//                     res.end(JSON.stringify({ message: "User updated successfully." }));
//                 });
//             });
//         });
//     }


//     // DELETE /user/:id
//     else if (method === "DELETE" && url.startsWith("/user/")) {
//         const id = Number(url.split("/")[2]);

//         fs.readFile("users.json", "utf-8", (err, data) => {
//             if (err) {
//                 res.writeHead(500, { "content-type": "application/json" });
//                 return res.end(JSON.stringify({ message: "Server error." }));
//             }

//             let users = JSON.parse(data || "[]");

//             const userIndex = users.findIndex(u => u.id === id);

//             if (userIndex === -1) {
//                 res.writeHead(404, { "content-type": "application/json" });
//                 return res.end(JSON.stringify({ message: "User ID not found." }));
//             }

//             users.splice(userIndex, 1);

//             fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
//                 if (err) {
//                     res.writeHead(500, { "content-type": "application/json" });
//                     return res.end(JSON.stringify({ message: "Failed to delete user." }));
//                 }

//                 res.writeHead(200, { "content-type": "application/json" });
//                 res.end(JSON.stringify({ message: "User deleted successfully." }));
//             });
//         });
//     }

//     // GET /user
//     else if (method === "GET" && url === "/user") {

//         fs.readFile("users.json", "utf-8", (err, data) => {
//             if (err) {
//                 res.writeHead(500, { "content-type": "application/json" });
//                 return res.end(JSON.stringify({ message: "Server error." }));
//             }

//             const users = JSON.parse(data || "[]");

//             res.writeHead(200, { "content-type": "application/json" });
//             res.end(JSON.stringify(users));
//         });
//     }
//     // GET /user/:id
//     else if (method === "GET" && url.startsWith("/user/")) {
//         const id = Number(url.split("/")[2]);

//         fs.readFile("users.json", "utf-8", (err, data) => {
//             if (err) {
//                 res.writeHead(500, { "content-type": "application/json" });
//                 return res.end(JSON.stringify({ message: "Server error." }));
//             }

//             const users = JSON.parse(data || "[]");

//             const user = users.find(u => u.id === id);

//             if (!user) {
//                 res.writeHead(404, { "content-type": "application/json" });
//                 return res.end(JSON.stringify({ message: "User not found." }));
//             }

//             res.writeHead(200, { "content-type": "application/json" });
//             res.end(JSON.stringify(user));
//         });
//     }


//     else {
//         res.writeHead(404, { "content-type": "text/plain" });
//         res.end("404 page not found");
//     }
// });

// function listen() {
//     httpServer.listen(port, "127.0.0.1", () => {
//         console.log(`Server is running on port ${port} 🚀`);
//     });
// }

// httpServer.on("error", (error) => {
//     if (error.code === "EADDRINUSE") {
//         ++port;
//         listen();
//     } else {
//         httpServer.close();
//     }
// });

// httpServer.on("close", () => {
//     console.log("Server is offline ❌");
// });
// listen();