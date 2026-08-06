const express = require('express');
const router = express.Router();
const driver = require('../config/db');

router.get('/', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (m:Movie) RETURN m LIMIT 20');
    const movies = result.records.map(function (r) {
      const props = r.get('m').properties;
      return {
        id: props.id.low,
        title: props.title,
        release_year: props.release_year.low
      };
    });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Database unreachable' });
  } finally {
    await session.close();
  }
});

router.get('/recommendations/:userId', async (req, res) => {
  const session = driver.session();
  try {
    const userIdNum = parseInt(req.params.userId);

    const watchedResult = await session.run(
      'MATCH (u:User {id: $userId})-[:WATCHED]->(m:Movie) RETURN m.id AS id',
      { userId: userIdNum }
    );
    const watchedIds = watchedResult.records.map(function (r) {
      return r.get('id').low;
    });

    const allMoviesResult = await session.run(
      'MATCH (m:Movie) RETURN m.id AS id, m.title AS title'
    );

    const recs = [];
    allMoviesResult.records.forEach(function (r) {
      const id = r.get('id').low;
      const title = r.get('title');
      if (watchedIds.indexOf(id) === -1) {
        recs.push({ id: id, title: title });
      }
    });

    res.json(recs.slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: 'Database unreachable' });
  } finally {
    await session.close();
  }
});

module.exports = router;