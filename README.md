# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). 

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

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
- Home page displays all shortened URLS created by user; giving access to edit, delete, or to create new links.
- Edit page allows for easy editing of the long URL associated with its shortened link as well as showing analytical visitor information.
- Password information and cookies are encrypted!
- Your created URLs' index, deletion function, and edit and analytical data pages are protected and can only be accessed by you!