function majorityElement(nums) {
    let count = 0;
    let value = null;

    for (let i = 0; i < nums.length; i++) {
        if (count === 0) {
            value = nums[i];
            count = 1;
        } else if (nums[i] === value) {
            count++;
        } else {
            count--;
        }
    }

    return value;
}

console.log(majorityElement([3, 2, 3]));
console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); 
