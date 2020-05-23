# Project 2

Web Programming with Python and JavaScript

## The Files

1. application.py
  1. This file runs our website. It's main function is keeping the "channels" data structure up to date. I'm not positive if it's a smart design or overly complicated but it's layers look like this:
    * A dictionary who's keys are the names of channels. Each channel maps to a tuple.
      * The first index is a list which contains the names of current members of that channel
      * The second index is a dictionary of messages. The keys are timestamps which map to a tuple.
        * The first index is a string with the name of the user who wrote the msg.
        * The second index is a string with the actual message text.
  2. It also contains all the routes and sockets we use to keep the information up to date on the client side

2. static folder
  1. style.css/scss
    * I'm pretty proud of how the styling turned out.
    * It looks good on all size screens
    * The messages have unique styling depending on if the message was sent by the user or someone else.
    * The messages and error messages also animate in nicely to give the user some noticable feedback.
    * **NOTE** I am partially colorblind so the colors look good to me. lol
  2. chatapp.js
    * All the client side code
    * On DOM load we set up all our interactibles and turn on our socket listeners.
    * There are a few helper functions such as addToChat, repopChannelList, and repopMemberList which are called from several locations. Abstracting those made the code much more readable.
    * Functions like createChannel and loadChat make POST calls to the server to update or fetch data.
    * sendChat is the main function that interacts with the server from the client side.

3. templates folder
  1. layout.html
    * Pretty simple. Mostly just sets up the head of our page.
  2. index.html
    * Sets up the body of our pages. Layout using bootstrap rows and column divs.