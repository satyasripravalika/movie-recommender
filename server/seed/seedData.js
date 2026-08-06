const driver = require('../config/db');

async function seed() {
  const session = driver.session();

  try {
    await session.run(`MATCH (n) DETACH DELETE n`);
    console.log('⏳ Waiting for delete to settle...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    await session.run(`
      // Genres
      CREATE (g1:Genre {name:'Action'})
      CREATE (g2:Genre {name:'Drama'})

      // Movies
      CREATE (m1:Movie {id:1, title:'RRR', release_year:2022})
      CREATE (m2:Movie {id:2, title:'Baahubali', release_year:2015})
      CREATE (m3:Movie {id:3, title:'Hi Nanna', release_year:2023})

      // Actors
      CREATE (a1:Actor {id:1, name:'NTR'})
      CREATE (a2:Actor {id:2, name:'Prabhas'})

      // Users
      CREATE (u1:User {id:1, name:'Ravi'})
      CREATE (u2:User {id:2, name:'Sravani'})

      // Movie -> Genre
      CREATE (m1)-[:BELONGS_TO]->(g1)
      CREATE (m2)-[:BELONGS_TO]->(g1)
      CREATE (m3)-[:BELONGS_TO]->(g2)

      // Movie -> Actor
      CREATE (m1)-[:ACTED_IN]->(a1)
      CREATE (m2)-[:ACTED_IN]->(a2)

      // User -> WATCHED -> Movie
      CREATE (u1)-[:WATCHED {rating:5}]->(m1)
      CREATE (u2)-[:WATCHED {rating:5}]->(m2)

      // User -> FRIENDS_WITH -> User
      CREATE (u1)-[:FRIENDS_WITH]->(u2)
    `);

    console.log('✅ Seed data created successfully (3 movies)!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();