#Musiz Quiz App
This is an web app that asks the user to identify the artist and album a set of lyrics are from.

![image](<./github/Screenshot.png>)

###Background
This is basically a quiz application that asks the user to identify a music using the songs lyrics and 30 second clips of music.

###Use Case
This application tests the users knowledge of various music genre. When a person first starts, he or she can click on a specific music genre and it will load up a randomized list of music to test the user on. Then the user is asked to identify the artist and album a songs lyrics are from. If the user knows the song he or she can click on a specific artist and album or click on the play button to play a 30 second click on the song.

###Initial UX
The initial web and mobile wireframes are shown below:
![image](<./github/Title Page.png>)
![image](<./github/Main Screen.png>)
![image](<./github/artist.png>)

###Prototype
You can see the application in action at the following link:
http://musicquizapp.jayzamazing.com/

###Technical
This project uses Html, CSS, Bootstrap, Handlebars, Run-Auto, Request, Jquery, Javascript, Json, Node, Express, and Npm. To get the name of the artist, song, and 30 second clip of the song the Spotify Api was used through a third party library called spotify-web-api-node. Once the application has the artist and song names lyrics are retrieved using the MusixMatch Api.

###Development Roadmap
This is v2.0.0 of the app. Future enhancements can be seen below:
* Improve UI/UX.
* Use a play bar instead of just a volume bar and play button.
* Add better handling for when an entire playlist does not match what the MusixMatch api has available in terms of lyrics.
