# Life.Church
## IT Volunteer Application

This is an application for the Information Technology team at Life.Church.

## How it Works

This application is built using **Express** and **Node.js**. It is deployed through **Heroku**.

*HTML* - Web Interface

*CSS* - Web Styling

*Javascript* - Form Validation, Web Events, and Database Communication

*PostgreSQL* - Database

### How it Connects

User → http GET request → main.js (routing) → index.html, index.js (display) → http POST request → main.js (handle) → data.js (communicate) → PostgreSQL (query) → data.js → main.js → index.html, index.js (display)

## Layout
### Volunteering Form

*link here*

The volunteering form is used to log when and why someone was volunteering for IT. 

Active volunteers only use their name along with the date, team, and number of hours worked to log hours. If a name is found twice in the database, the user will be asked for email validation.

### New Volunteer Form

*link here*

The new volunteer form is used to register a volunteer in the database. A volunteer must exist in the database before having hours logged by the volunteering form.

New volunteers must accurately give their first name, last name, phone number, and email. They must also give a designated team, but this team does not bind them to where they must volunteer at.

### Database Display

*link here*

The database display page features a search tool to search through the database of volunteers. Click on a volunteer's name to receive their designated team (chosen on registration), email, and phone number.

The leaderboard option displays the current month's leaderboard ranked by the number of hours volunteered in the respective month.

The first name option searches the database by first name.

The last name option searches the database by last name.

The team option searches the database by team. Volunteers will be displayed by their chosen team on registration AND the team they volunteer most often with. If these two happen to conflict, they will show up in both lists.

The date option returns who volunteered on a specific day, for how long, and for what team.

The inactive option displays the inactivity list. Any volunteer who has not been active for 60 days or has never been active at all will appear on this list.

### TV Display

*link here*

The TV display page is used for the TVs in the IT room at the Life.Church Central Offices. This page showcases a graph with the number of volunteers month to month and a doughnut chart that distributes the current month's volunteer hours per team.

## PostgreSQL Documentation

This application's PostgreSQL database is found within **Heroku**.

### Tables
#### volunteers

vol_id, first_name, last_name, email, phone, team

#### teams

team_id, name

#### logs

date, vol_id, team_id, hours

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
