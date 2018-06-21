# Life.Church
## IT Volunteer Application

This is an application for the Information Technology team at Life.Church.

## How it Works

This application is built using **Express** and **Node.js**. It is deployed through **Heroku**.

*HTML* - Web Interface

*CSS* - Web Styling

*Javascript* - Form Validation and Web Events

*PostgreSQL* - Database

## Layout
### Volunteering Form

*link here*

The volunteering form is used to log when and why someone was volunteering for IT. 

### New Volunteer Form

*link here*

The new volunteer form is used to register a volunteer in the database. A volunteer must exist in the database before having hours logged by the volunteering form.

### Database Display

*link here*

The database display page features a leaderboard with the top volunteers (per hour) of each month. This display page also allows one to search for a volunteer by name, date, or team. Furthermore, the database display page offers an inactivity list for an easier way to keep track of volunteers.

### TV Display

*link here*

The TV display page is used for the TVs in the IT room at the Life.Church Central Offices. This page showcases a graph with the number of volunteers month to month. This page will also showcase recent volunteer activity.

## PostgreSQL Documentation

This application's PostgreSQL database is found within **Heroku**.

### Tables
#### volunteers

vol_id

first_name

last_name

email

phone

#### teams

team_id

name

#### logs

date

vol_id

team_id

hours

### Extra Queries

These queries are not featured within the application; they are for the use of staff members who need to alter information within the database.

#### Update Email

```
UPDATE volunteers
SET email = 'new@email.com'
WHERE first_name = 'First'
AND last_name = 'Last'
AND email = 'old@email.com'
RETURNING email, first_name, last_name;
```
#### Update Last Name

```
UPDATE volunteers
SET last_name = 'New Last'
WHERE first_name = 'First'
AND email = 'email@email.com';
RETURNING first_name, last_name, email;
```
