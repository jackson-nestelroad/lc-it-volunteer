CREATE TABLE volunteers(
    vol_id serial PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) NOT NULL,
    team integer NOT NULL,
    campus VARCHAR(255) NOT NULL,
    active boolean NOT NULL
);