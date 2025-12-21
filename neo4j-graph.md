# Neo4j Graph Model

## Purpose
Map and query complex social relationships and the Trust graph.

## Node Labels

### User
Represents a registered user.
- Properties: id (UUID), email, displayName, rank

### Community
Represents a community or group.
- Properties: id, name, description

### Skill
Represents a skill or tag.
- Properties: id, name, category

### Listing
Represents a marketplace listing.
- Properties: id, type, title, status

## Relationship Types

- `[:FOLLOWS]->`
  - User follows another User or Community
  - Directional

- `[:RELATED_TO]->`
  - Generic relationship between entities
  - Can connect any nodes

- `[:TRUSTS]->`
  - Trust relationship with a weight property
  - Example: `(a:User)-[:TRUSTS {weight: 0.8}]->(b:User)`

- `[:CONTRIBUTED_TO]->`
  - User contributed to a Community or Listing
  - Directional

## Example Queries

### Get a user's trust network
```cypher
MATCH (u:User {id: $userId})-[:TRUSTS]->(trusted:User)
RETURN trusted, relationship.weight AS weight
ORDER BY weight DESC
```

### Find users by shared skills
```cypher
MATCH (u1:User {id: $userId})-[:RELATED_TO]->(s:Skill)<-[:RELATED_TO]-(u2:User)
RETURN u2, COLLECT(s.name) AS sharedSkills
```

### Community followers cascade
```cypher
MATCH (c:Community {id: $communityId})<-[:FOLLOWS]-(u:User)
RETURN u.displayName AS follower
ORDER BY u.createdAt
```

## Integration Notes
- Use Neo4j driver in Node.js to run queries.
- Keep user IDs consistent with Supabase UUIDs.
- Sync key relationships from PostgreSQL events or API calls.
