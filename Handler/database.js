const Database = require('better-sqlite3');
const db = new Database('./Utils/DataBase/database.db');

module.exports = () => {
    db.exec(`CREATE TABLE IF NOT EXISTS guild (
        id TEXT DEFAULT NULL,
        lbMessage TEXT DEFAULT '{ "messages": 0, "contributor": [] }', 
        pic TEXT DEFAULT '0',
        joins TEXT DEFAULT '{ "join": 0, "leave": 0 }'
    )`);
    return db;
}