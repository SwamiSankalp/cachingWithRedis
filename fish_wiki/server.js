import express from "express";
import axios from "axios";
import redis from "redis";
import { cacheData } from "./cacheData.js";

const app = express();
const port = process.env.PORT || 3000;

export let redisClient;

(async () => {
  redisClient = redis.createClient({
    password:
      process.env.REDIS_PASSWORD ||
      "WYq8komzxoTOFrti111fhN8gW1NSXBTaYu247mzcEE25/ZX7aSf8rghPdVaxYSGlu+lFV/0KlkXts5Zw",
  });

  redisClient.on("error", (error) => {
    console.log(error);
  });

  await redisClient.connect();
})();

const fetchApiData = async (species) => {
  const apiResponse = await axios.get(
    `https://www.fishwatch.gov/api/species/${species}`
  );
  console.log(`Request sent to the API`);
  return apiResponse.data;
};

const getSpeciesData = async (req, res) => {
  const species = req.params.species;
  let results;

  try {
    results = await fetchApiData(species);
    if (results.length === 0) {
      throw "API returned an empty array";
    }
    await redisClient.set(species, JSON.stringify(results), {
      EX: 10,
      NX: true, // sets keys only when that key doesnt already exist
    });
    res.send({
      fromCache: false,
      data: results,
    });
  } catch (err) {
    console.log(err);
    res.status(404).send("Data unavilable");
  }
};

app.get("/fish/:species", cacheData, getSpeciesData);

app.listen(port, () => {
  console.log(`App listening on PORT ${port}`);
});
