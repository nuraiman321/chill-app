CREATE DATABASE chillplaces;

CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name TEXT,
    image_url text,
    typeOfPlace text,
    country text,
    season text,
    thingsToDo text,
    recomendation integer,
    user_id integer
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    email TEXT,
    password_digest text,
    username TEXT,
    profile TEXT
);

INSERT INTO places (name, image_url, typeOfPlace, country, season, thingsToDo, recomendation, user_id) VALUES ('Langkawi', 'https://apicms.thestar.com.my/uploads/images/2021/08/15/1257071.jpg', 'Island', 'Malaysia', '2 season','Island hoping', 10, 1);
INSERT INTO places (name, image_url, typeOfPlace, country, season, thingsToDo, recomendation, user_id) VALUES ('Redang', 'https://upload.wikimedia.org/wikipedia/commons/5/53/Redang_Sea_Beach.jpg', 'Island', 'Malaysia', '2 season','Snorkeling, Scuba Diving', 9, 1);

