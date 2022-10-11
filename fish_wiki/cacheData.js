import { redisClient } from "./server.js";

export const cacheData = async (req, res, next) => {
  const species = req.params.species;
  let results;

  try {
    const cacheResults = await redisClient.get(species);
    if (cacheResults) {
      results = JSON.parse(cacheResults);
      res.send({
        fromCache: true,
        data: results,
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(404);
  }
};
