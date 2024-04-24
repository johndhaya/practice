const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'cricketTeam.db')
const app = express()
app.use(express.json())

let db = null

const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('The Server is running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB error: ${error.message}`)
    process.exit(1)
  }
}
initDbAndServer()

const convertToRespObj = dbObj => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  }
}

//GET All Players
app.get('/players/', async (request, response) => {
  const query = `SELECT * FROM 
  cricket_team;`
  const player = await db.all(query)
  response.send(player.map(each => convertToRespObj(each)))
})

//Add a Player
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addQuery = `INSERT INTO 
  cricket_team(player_id, jersey_number, role) 
  VALUES
  ('${playerName}', ${jerseyNumber}, '${role}');`
  const player = await db.run(addQuery)
  response.send('Player Added to Team')
})

//GET Given Player
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getQuery = `SELECT *FROM 
  cricket_team 
  WHERE 
  player_id=${playerId};`
  const player = await db.get(getQuery)
  response.send(convertToRespObj(player))
})

//Update a Player
app.put('/players/:playerId/', async (request, response) => {
  const details = request.body
  const {playerName, jerseyNumber, role} = details
  const {playerId} = request.params
  const uptQuery = `UPDATE 
  cricket_team 
  SET 
  player_name='${playerName}', 
  jersey_number=${jerseyNumber}, 
  role='${role}'
  WHERE 
  player_id=${playerId};`
  await db.run(uptQuery)
  response.send('Player Details Updated')
})

//DELETE a Player
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const delQuery = `DELETE FROM 
  cricket_team 
  WHERE 
  player_id=${playerId};`
  await db.run(delQuery)
  response.send('Player Removed')
})

module.exports = app
