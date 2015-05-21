# Jeopardy Readme

## Outline
- Quick Start
- Developers
  - Overview
  - Design
    - Architecture
    - Object Description
    - Discrete Game States
    - Game Initialization
  - Final Word

## Quick Start

Hello, and welcome! Info and User's Guide are included in the application itself.

This is an offline web-based application. That means that you can run this application in your web browser.

Once all files have been downloaded to your computer, double click the file `Jeopardy.html`. If it does not open in your default browser, right click the file and select `Open With...`. Then select your preferred browser from the list.

Once the application has been opened in your browser, select `About` or `User's Guide` for more information.

Also, please note the section `Recommended Browsers` in the About section.

## Developers

### Overview

This was my first actual design project that actually relied heavily on object-oriented patterns. So, as you may surmise, you'll find plenty of amateur mistakes in the design of this application. When I began writing it, I was putting too much grunt-level code together. This resulted in poor separation and legibility. As I wrote it, I began to see how those mistakes were negatively affecting the performance, readability, manageability, scalability, and stability of the design.

As a result, I began breaking the objects out and assigning even the smallest tasks to separate object methods. Obviously, I should have been doing this from the beginning, but you'll likely find remnants of that in my code. I also had every object other than the controller dependent on the controller and keep a reference to the controller as a property. This became a problem once I tried to create deep copies of objects. I had circular references that made deep copies impossible. I rewrote the GameTeam object to be dependent on the controller, but not store it as a public property. This turned out to be a good way of implementing it, but I was far too lazy to do that to my other objects as well. Feel free to continue in that if you wish to clean up and modify my code.

Also, I apologize for the haphazard way I have of writing extremely detailed comments in some sections and leaving them out of most other areas.

### Design

#### Architecture

The user interface elements of this app lie in what I call "overlays". Every screen of the app is a separate overlay. Each overlay is created at startup and hidden. Then, as they become needed, they are shown to the user. But because they are all part of the DOM at the same time, element IDs must be carefully considered.

Every object in the app pulls from the same prototype (superclass). There, I put some common tasks, like hiding / unhiding itself, appending its element to the DOM, creating new sub-elements, and console logging. Because every object shares the same prototype, they all follow some similar patterns. The most notable of these is that every element holds it top-level DOM element as `this.domElement`. In this way, every object is solely responsible for its own element and the information displayed within that element.

The heart is the controller. The main controller is responsible for:
- creating and managing overlays
- managing and tracking the discrete game states
- creating and managing sub-objects
- keeping records of all data

#### Object Description

Other objects and their main responsibilities include:
- Overlay
  - provides a container for each game screen
- Game Board
  - provides a container for the table that makes up the game board
  - stores and manages the DOM elements of the game board
- Game Team
  - provides a listable container for game teams
  - manages team information (name, points, and color)
  - manages information displayed within itself
  - provides methods for manipulating team information as appropriate
  - manages its own `localStorage` data
- Data Set
  - provides a listable container for Data Sets
  - stores information belonging to a single game board (categories, rows, and questions)
  - provides methods for editing that data
  - manages its own `localStorage` data
- Game Color
  - stores color values
  - provides methods for obtaining color in different forms and related colors, such as the inverse
- Game Button
  - provides a container for itself
  - provides convenience methods for configuration

(There is also the Checkbox object. I never did much with it. It was more to see if I could and if it would be worth the effort. Turns out I could, but I'm unsure it was worth the effort. I've mostly left it alone, as I haven't added more than one instance.)

#### Discrete Game States

There are 10 game states:
1. Start Screen
  - main screen
  - everything starts here
2. Info
  - AKA "About"
  - simply displays basic info
3. Options
  - AKA "Setup"
  - where options are changed and teams are managed
4. Import Data
  - where exported data can be imported
5. Export Data
  - where data can be exported for permanent storage
6. Data Management
  - where Data Sets are managed
7. Make Board
  - where a Data Set and its Game Board are customized
8. Choose Data
  - the screen immediately before the game starts
  - where the user chooses which Data Set to use
9. Select Question
  - the main game screen
  - where the user chooses which question to answer
10. AnswerQuestion
  - where questions are displayed
  - if in edit mode, where questions can be previewed and edited
  - if in play mode, where teams and the current question are displayed

(As previously mentioned, each state corresponds to its own overlay.)

#### Game Initialization

When the game is initialized, there 3 (not well-defined) stages during startup:
1. Overlay Creation
  - all game screens are created, hidden, and stored
2. Game State Kickstart
  - the initial game state is initiated
3. Data Retrieval
  - retrieves data from `localStorage` to recreate all stored Teams and Data Sets
    - Teams and Data Sets are initialized with defaults
    - each retrieves its own data and restores itself once initialized

### Final Word

Seriously, if you wish to build upon my foundation, I do wish you luck. I, myself, find the code difficult to navigate and the game flow hard to track.

I really hope you can improve upon what I started with, add some features, fix some bugs, and just make it better!