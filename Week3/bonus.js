function findKthMissing(arr, k) {
    let missingCount = 0;   
    let current = 1;        
    let i = 0;              

    while (true) {
        if (i < arr.length && arr[i] === current) {
            i++;
        } else {
            
            missingCount++;
            if (missingCount === k) {
                return current; 
            }
        }
        current++;
    }
}
let result1 = findKthMissing([2,3,4,7,11], 5);
console.log(result1); 

let result2 = findKthMissing([1,2,3,4], 2);
console.log(result2); 
