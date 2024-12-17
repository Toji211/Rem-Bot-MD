import sqlite3 from 'sqlite3';

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE lorem (info TEXT)");

  let stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  stmt.run("Hello World");
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
    console.log(row.id + ": " + row.info);
  });
});

db.close();
