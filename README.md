# CineGraph — Movie Recommendation System (Graph Database)

A movie recommendation web application built with **CognoDB** (a managed graph database speaking openCypher over Bolt) as the data layer. The app recommends movies to users based on their watch history and graph relationships (genre and actor overlap), using multi-hop Cypher traversals.

## Why a Graph Database?

Movie recommendations are fundamentally about **relationships** — which users watched which movies, which movies share genres or actors, and how these connections chain together. In a relational database, answering "recommend movies in the same genre that a user's friends watched but they haven't" requires multiple JOINs across Users, Watched, Movies, and Genres tables — this gets slower and more complex as the relationship depth grows.

In a graph database, this is a natural traversal:

cypher
MATCH (u:User)-[:WATCHED]->(:Movie)-[:BELONGS_TO]->(g:Genre)<-[:BELONGS_TO]-(rec:Movie)
WHERE NOT (u)-[:WATCHED]->(rec)
RETURN DISTINCT rec.title, g.name

This 2-hop pattern reads like the question itself, and CognoDB traverses relationships directly (not via expensive JOINs), making it well-suited for recommendation-style queries that only get more valuable as more relationship types (actors, friends, directors) are added.

## Data Model

**Nodes:**

- `User` (id, name)
- `Movie` (id, title, release_year)
- `Genre` (name)
- `Actor` (id, name)

**Relationships:**

- `(User)-[:WATCHED {rating}]->(Movie)`
- `(Movie)-[:BELONGS_TO]->(Genre)`
- `(Movie)-[:ACTED_IN]->(Actor)`
- `(User)-[:FRIENDS_WITH]->(User)`

(User)--WATCHED-->(Movie)--BELONGS_TO-->(Genre)
| |
FRIENDS_WITH ACTED_IN
| |
(User) (Actor)

Seed the database:

```bash
node seed/seedData.js
```

Start the server:

```bash
node server.js
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## Main Queries

**1. Get all movies:**

```cypher
MATCH (m:Movie) RETURN m LIMIT 20
```

**2. Recommendations (multi-hop traversal, 2 hops):**

```cypher
MATCH (u:User {id: $userId})-[:WATCHED]->(:Movie)-[:BELONGS_TO]->(g:Genre)<-[:BELONGS_TO]-(rec:Movie)
WHERE NOT (u)-[:WATCHED]->(rec)
RETURN DISTINCT rec.title AS title, g.name AS genre
LIMIT 10
```

This traverses: User → Watched Movie → Genre → Other Movies in that Genre, while excluding movies the user has already watched. This is a query that would require multiple JOINs and subqueries in a relational database, but is a natural pattern-match in Cypher.

**3. Actor-based recommendations (alternative traversal):**

```cypher
MATCH (u:User {id: $userId})-[:WATCHED]->(:Movie)-[:ACTED_IN]->(a:Actor)<-[:ACTED_IN]-(rec:Movie)
WHERE NOT (u)-[:WATCHED]->(rec)
RETURN DISTINCT rec.title AS title, a.name AS actor
```

## Engineering Notes

- Connection credentials are read from environment variables (`.env`), never committed to the repository
- All Cypher queries use parameterized inputs via the official Neo4j driver — no string concatenation
- Backend includes graceful error handling for database connectivity issues (`try/catch` blocks return `503`-style error responses when the database is unreachable)

## Screenshots

[user1 ] (./screenshots/user1.jpeg)
[ user2] (./screenshots/user2.jpeg)
[user3] (./screenshots/user3.jpeg)

## Demo

- Hosted demo: https://movie-recommender-zacv.vercel.app

- Screen recording: https://drive.google.com/drive/u/0/folders/1UcaDqkrpF9mskT7_YchJ21nW_sFITwnt
