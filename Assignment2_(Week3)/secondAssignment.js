const path = require("node:path");
const fs = require("node:fs");
const EventEmitter = require("node:events");
const os = require("node:os");

// 1  
// function paths() {
//     let filePath = __filename;     
//     let dirPath = __dirname;  
//     console.log({File: filePath, Dir: dirPath});
// }
// paths();

//___________________________________________________________________________

//2 
// function fileName(filePath) {
//     let file = path.basename(filePath);  
//     return file;
// }
// let result = fileName("/user/files/report.pdf");
// console.log(result);

//___________________________________________________________________________

//3
// function buildPath(pathObject){
//     let thePath = path.posix.format(pathObject);
//     return thePath;
// }

// let result = buildPath({
//     dir: "/folder", 
//     name: "app", 
//     ext: ".js"
// })
// console.log(result);

//___________________________________________________________________________

//4
// function fileExtension(filePath) {
//     let file = path.extname(filePath);  
//     return file;
// }
// let result = fileExtension(" /docs/readme.md");
// console.log(result);

//___________________________________________________________________________

//5
// function parsePath(filePath){
//     let thePath = path.parse(filePath);
//     return { Name: thePath.name , Ext: thePath.ext };
// }
// let result = parsePath("/home/app/main.js");
// console.log(result);

//___________________________________________________________________________

//6
// function absolute (filePath){
//     let isAbs = path.isAbsolute(filePath);
//     return isAbs;
// }
// let result = absolute("/home/user/file.txt");
// console.log(result);

//___________________________________________________________________________

//7
// function joiningSegments(...segments){
//     let thePath = path.posix.join(...segments);
//     return thePath;
// }
// let result = joiningSegments("src","components", "App.js");
// console.log(result);

//___________________________________________________________________________

//8
// function convertPath(filePath){
//     let thePath = path.resolve(filePath);
//     return thePath;
// }
// let result = convertPath("./secondAssignment.js");
// console.log(result);

//___________________________________________________________________________

//9
// function joinPaths(...paths){
//     let thePaths = path.posix.join(...paths);
//     return thePaths;
// }
// let result = joinPaths("/folder1","folder2/file.txt");
// console.log(result);

//___________________________________________________________________________

//10
// function deleteFile(filePath) {
//     fs.unlink(filePath, (error) => {
//         if (error) {
//             console.log("Error deleting the file:", error.message);
//         } else {
//             console.log(`The ${path.basename(filePath)} is deleted.`);
//         }
//     });
// }
// deleteFile("./file.txt"); 

//___________________________________________________________________________

//11
// function createFolder(folderPath) {
//     try {
//         fs.mkdirSync(folderPath); 
//         console.log("Success");
//     } catch (error) {
//         console.log("Error creating folder:", error.message);
//     }
// }
// createFolder("./AssignmentTwo");

//___________________________________________________________________________

//12
// function startEvent() {
//     let emitter = new EventEmitter(); 
    
//     emitter.on("start", () => {         
//         console.log("Welcome event triggered!");
//     });

//     emitter.emit("start");              
// }
// startEvent();

//___________________________________________________________________________

//13
// function loginEvent(username) {
//     let emitter = new EventEmitter(); 

//     emitter.on("login", (user) => {    
//         console.log(`User logged in: ${user}`);
//     });

//     emitter.emit("login", username);   
// }
// loginEvent("Ahmed");

//___________________________________________________________________________

//14
// function readFile(filePath) {
//     try {
//         let content = fs.readFileSync(filePath, "utf-8"); 
//         console.log("The file content =>", content);
//     } catch (error) {
//         console.log("Error in reading file:", error.message);
//     }
// }
// readFile("./notes.txt");

//___________________________________________________________________________

//15
// function writeFile(filePath, content) {
//     fs.writeFile(filePath, content, (error) => {
//         if (error) {
//             console.log("Error writing file:", error.message);
//         } else {
//             console.log("File saved successfully");
//         }
//     });
// }
// writeFile("./async.txt", "Async save");

//___________________________________________________________________________

//16
// function checkExistense(dirPath) {
//     let exists = fs.existsSync(dirPath);
//     return exists;
// }
// let result = checkExistense("./notes.txt");
// console.log(result);

//___________________________________________________________________________

// 17
// function getOSInfo() {
//     return { Platform: os.platform(), Arch: os.arch() };
// }
// let result = getOSInfo();
// console.log(result);