// 1
// let string = "123";
// let convString = Number(string);
// let result = convString + 7;
// console.log(result);

//___________________________________________________________________________

// 2
// let number = 0;
// if (!number) {
//   console.log("Invalid");
// } else {
//   console.log("Valid");
// }

//_____________________________________________________________________________

// 3
// for (let i = 1; i <= 10; i++) {
//   if (i % 2 == 0) {
//     continue;
//   } else {
//     console.log(i);
//   }
// }

//_____________________________________________________________________________

// 4
// let arr = [1, 2, 3, 4, 5];
// let result = data.filter((element, index, array) => {
//   return element % 2 == 0;
// });
// console.log(result);

//_____________________________________________________________________________

// 5
// let arr1 = [1, 2, 3];
// let arr2 = [...arr1, 4, 5, 6];
// console.log(arr2);

// Another Solution
// let arr3 = [1, 2, 3];
// let arr4 = [4, 5, 6];
// let arr5 = [...arr3, ...arr4];
// console.log(arr5);

//_____________________________________________________________________________

// 6
// let dayNumber = 2;
// switch (dayNumber) {
//   case 1:
//     console.log("Sunday");
//     break;

//   case 2:
//     console.log("Monday");
//     break;

//   case 3:
//     console.log("Tuesday");
//     break;

//   case 4:
//     console.log("Wednesday");
//     break;

//   case 5:
//     console.log("Thursday");
//     break;

//   case 6:
//     console.log("Friday");
//     break;

//   case 7:
//     console.log("Saturday");
//     break;

//   default:
//     console.log("Enter a day number from 1 to 7");
//     break;
// }

//_____________________________________________________________________________

//7
// let arr = ["a", "ab", "abc"];
// let result = arr.map((element, index, array) => {
//   return element.length;
// });
// console.log(result);

//_____________________________________________________________________________

// 8

// function division(num) {
//   if (num % 3 == 0 && num % 5 == 0) {
//     console.log("Divisible by both");
//   } else if (num % 3 == 0) {
//     console.log("Divisible by 3");
//   } else if (num % 5 == 0) {
//     console.log("Divisible by 5");
//   } else {
//     console.log("Non d");
//   }
// }
// division(15);

//_____________________________________________________________________________

// 9
// let power = (num) => {
//   return num ** 2;
// };
// console.log(power(5));

//_____________________________________________________________________________

// 10
// function presentData(data) {
//   let {name, age} = data;
//   return `${name} is ${age} years old`
// }
// console.log(presentData({name:"John", age:25}));

//_____________________________________________________________________________

// 11
// function calc(...numbers) {
//   let result = 0;
//   for (let i = 0; i < numbers.length; i++) {
//     result += numbers[i];
//   }
//   return `The result is ${result}`;
// }
// console.log(calc(1, 2, 3, 4, 5));

//_____________________________________________________________________________

// 12
// function printWord() {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve("Success");
//     }, 3000);
//   });
// }
// printWord().then(console.log);

//_____________________________________________________________________________

// 13
// function LargestNum(arr) {
//   let max = arr[0];

//   for (let i = 1; i < arr.length; i++) {
//     if (arr[i] > max) {
//       max = arr[i];
//     }
//   }

//   return max;
// }
// console.log(LargestNum([1, 3, 7, 2, 4]));

//_____________________________________________________________________________

// 14
// function ObjectKeys(data){
//     return Object.keys(data);
// }
// console.log(ObjectKeys({name:"John", age: 25}));

//_____________________________________________________________________________

// 15
// function splitString(str) {
//   return str.split(" ");
// }
// console.log(splitString("The quick brown fox"));
