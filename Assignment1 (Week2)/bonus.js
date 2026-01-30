function createCounter(num) {
  let value = num;

  return {
    increment: function () {
      return ++value;
    },

    decrement: function () {
      return --value;
    },

    reset: function () {
      value = num;
      return value;
    },
  };
}

 console.log(createCounter(5).increment()); // 6
 console.log(createCounter(5).reset()); // 5
 console.log(createCounter(5).decrement()); // 4