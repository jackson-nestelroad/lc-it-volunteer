# Life.Church
## IT Volunteer Tracking Application

This is an application for the Information Technology team at Life.Church. It is developed to assist with easy volunteer tracking in terms of hours, location, and engagement.

## How it Works

This application is built using **Express** and **Node.js**. It is deployed through **Kubernetes**.

*HTML* - Web Interface

*CSS* - Web Styling

*Javascript* - Form Validation, Web Events, and Database Communication

*Google Cloud PostgreSQL* - Database

### How it Connects

User → http GET request → main.js (routing) → index.html, index.js (display) → http POST request → main.js (handle) → data.js (communicate) → PostgreSQL (query) → data.js → main.js → index.html, index.js (display)

## Layout
### Volunteering Form

*link here*

The volunteering form is used to log when and why someone was volunteering for IT. 

Active volunteers only need to use their name along with the date, team, and number of hours worked to log hours. If a name is found more than once in the database, the user will be asked for email validation.

### New Volunteer Form

*link here*

The new volunteer form is used to register a volunteer in the database. A volunteer must exist in the database before having hours logged by the volunteering form.

New volunteers must accurately give their first name, last name, phone number, and email. They must also give a designated team, but this team does not bind them to where they must volunteer at. They also must give the their campus for easier tracking.

### Search Database

*link here*

The database display page features a search tool to search through the database of volunteers. Click on any volunteer's name to receive their campus, designated team (chosen on registration), email, and phone number.

There are several ways to search the database. You may search specifically by a certain attribute attached to the volunteer, or you may see who has been active during a certain range of time.

By clicking on a volunteer's name, a volunteer can also be marked as inactive. Marking a volunteer as inactive will remove them from all search results except for the inactivity list.

Volunteer results will come up in several different colors.

White -- actively volunteering.
Green -- never volunteered, but ready to go.
Yellow -- no activity for 30 days.
Orange -- no activity for 60 days.
Red -- no activity for 90 days.
Gray -- marked as inactive.

### TV Display

*link here*

The TV display page is used for the TVs in the IT room at the Life.Church Central Offices. This page showcases a graph with the number of volunteers month to month and a doughnut chart that distributes the current month's volunteer hours per team.

### Notebook

*link here*

The IT Volunteer Notebook is used to further track volunteer engagement across the team. All log entries can be accessed here.

Staff members access this page with a password in order to delete or manage volunteer entries. Red entries have not been assigned, while white entries have been and their assignment can be viewed by simply hovering over the entry or clicking the edit button.

By clicking on the edit button for a specific entry, staff members may connect a logged entry to their full name along with any notes they may have for the day. 

Staff members must connect their volunteer entries to their name so their engagement appears in the "Staff" section of this page's search tool. Staff members will be connected with the number of volunteers, total hours, team, and last date for the current month.

## PostgreSQL Documentation

This application's PostgreSQL database is found within Google Cloud SQL.

### Tables
#### volunteers

vol_id, first_name, last_name, email, phone, team, campus, active

#### teams

team_id, name

#### logs

date, vol_id, team_id, hours, staff, notes

### Extra Queries

These queries are not featured within the application; they are for the use of staff members who need to alter information within the database.

#### Update Campus

```
UPDATE volunteers
SET campus = 'OKC'
WHERE first_name = 'First'
AND last_name = 'Last'
AND email = 'my@email.com'
RETURNING campus, email, first_name, last_name;
```
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
