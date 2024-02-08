# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). 

## Final Product

![This is the login screen](/screenshots/Login.png)
![This page allows you to create an account.](/screenshots/Register.png)
![This is the page to create shortened URLs.](/screenshots/CreateTinyURL.png)
![This page lists all created URLs by the logged in user and gives access to details and delete buttons](/screenshots/URLIndex.png)
![This page allows editing the long URL referenced by a short URL link and also shows analytical visitor information](/screenshots/Details.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Navigate to http://localhost/8080/ in your web browser.
- That's it!

## Features

- Simple account registration (just supply email and create a password).
- Header displays login email when logged in, otherwise displays login and register buttons.
- Home page displays all shortened URLs created by user; giving access to edit, delete, or to create new links.
- Edit page allows for easy editing of the long URL associated with its shortened link as well as showing analytical visitor information.
- Password information is hashed and cookies are encrypted!
- Your created URLs' index, deletion function, and edit and analytical data pages are protected and can only be accessed by you!