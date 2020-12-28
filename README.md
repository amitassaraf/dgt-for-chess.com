
<!-- PROJECT SHIELDS -->

[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/amitassaraf/dgt-for-chess.com">
    <img src="https://i.imgur.com/j0f54ys.png" alt="Logo" height="150">
  </a>

  <h3 align="center">♟️ DGT for Chess.com (Beta)</h3>

  <p align="center">
    A cool desktop app that allows the use of DGT eboards to play on Chess.com
    <br />
    <a href="https://gum.co/dgtforchessdotcom"><strong>Get the Beta App »</strong></a>
    <br />
    <br />
    <a href="https://gum.co/dgtforchessdotcom">Download (Beta)</a>
    ·
    <a href="https://github.com/amitassaraf/dgt-for-chess.com/issues">Report Bug</a>
    ·
    <a href="https://github.com/amitassaraf/dgt-for-chess.com/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![A live game using DGT Bluetooth eboard firmware 3.1][product-screenshot-game]](https://gum.co/dgtforchessdotcom)

Lately I got into chess after years of not playing, and I just fell in love with it again. I really like Chess.com yet I wanted to improve OTB (over the board) games. Being a programmer I instantly looked for some good options and found DGT Board to be a popular choice for electronic powered boards. I then got one and noticed the Chess.com's implementation of DGT eBoards as input for games is super flakey, most of the times it straight out does not work.

So I decided to develop a proper implmentation allow the use of DGT eboards on Chess.com, not only on **Online** play, but also on **Computer** play and even **Explorer** for analyzing your games!

🤩 Features:
* 🗣️ Move announcements - When your opponent / you make a move, they are announced by voice AI. 
* 🖥️ Online play - Use your DGT eboard to play aganst online opponents on Chess.com.
* 🤖 Computer play - Use your DGT eboard to play against all computer bots on Chess.com.
* 📈 Explorer play - Use your DGT eboard in this mode to physically analyze your games or positions while getting validation and announcement for moves made.
* 🔌 Multiple Connection Engines - Choose between using DGT LiveChess 2.0 and our Embedded connection engine which is much faster *(Embedded highly recommended on MacOS)*.
* 🟢 Board Status Dialog - See the status of your board during the game, including battery life, connection status, and sync status.

This is a **BETA** version of the app, it might break or have some bugs *(Yet it is still far better than the Chess.com integration)*. Currently I only packaged the app for MacOS but can package it for Windows in about a day of work so if I'll get requests I'll do it. I mainly tested it on DGT USB + Bluetooth eBoard Firmware 3.1 *(I do recommend updating to ensure full compatabilty)*.


### Built With
* [Electron](https://www.electronjs.org/)
* [Puppeteer](https://pptr.dev/)
* [ReactJS](https://reactjs.org/)



<!-- USAGE -->
## Usage

[![Product Name Screen Shot][product-screenshot]](https://gum.co/dgtforchessdotcom)
In order to use the app, make sure your DGT eboard is powered, updated to the latest firmware, and connected to the computer either via USB or Bluetooth.

Then enter the app and follow the instructions, once you enter a game, whether it is Online, Computer or Explorer you will see the Board's heads-up display.


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/amitassaraf/dgt-for-chess.com/issues) for a list of proposed features (and known issues).

 - [ ] Windows Support
 - [ ] Support switching between game-modes without reopenning the app
 - [ ] Settings
	 - [ ] Turn off voice announcements
	 - [ ] Save login credentials
 - [ ] DGT Clock Support
	 - [ ] Allow pre-move confirmation by gitting the clock
	 - [ ] Auto update clock with moves and time from Chess.com
 - [ ] Release Production Version
 

<!-- LICENSE -->
## License

Distributed under the GNU GPLv3 License. See `LICENSE.md` for more information.


<!-- CONTACT -->
## Contact

Amit Assaraf - amit.assaraf@gmail.com

Project Link: [https://github.com/amitassaraf/dgt-for-chess.com](https://github.com/amitassaraf/dgt-for-chess.com)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[stars-shield]: https://img.shields.io/github/stars/amitassaraf/dgt-for-chess.com.svg?style=for-the-badge
[stars-url]: https://github.com/amitassaraf/dgt-for-chess.com/stargazers
[issues-shield]: https://img.shields.io/github/issues/amitassaraf/dgt-for-chess.com.svg?style=for-the-badge
[issues-url]: https://github.com/amitassaraf/dgt-for-chess.com/issues
[license-shield]: https://img.shields.io/github/license/amitassaraf/dgt-for-chess.com.svg?style=for-the-badge
[license-url]: https://github.com/amitassaraf/dgt-for-chess.com/blob/master/LICENSE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/amitassaraf/
[product-screenshot]: https://i.imgur.com/4JqzZIx.png
[product-screenshot-game]: https://i.imgur.com/gBTkw5C.png
