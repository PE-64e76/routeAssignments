import { redisClient } from "../../DB/index.js";

export const set = async ({ key, value, ttl, parse = false } = {}) => {
  try {
    if (parse) {
      value = JSON.stringify(value);
    }
    if (ttl) {
      return await redisClient.set(key, value, {EX:ttl});
    }
    await redisClient.set(key, value);
  } catch (error) {
    console.log(`Fail to add`);
  }
};


export const get = async ({ key, parse = false } = {}) => {
  try {
    return parse? JSON.parse(await redisClient.get(key) ?? '') : await redisClient.get(key)
  } catch (error) {
    console.log(`Fail to add`);
  }
};