class Board {
  constructor(size) {
    this.size = size;
    this.gameData = [];
    this.weaponStorage = [{name: 'Red Saber', damage: 20, src: 'img/weapon/red-saber.png'},
                          {name: 'Sword', damage: 30, src: 'img/weapon/sword.png'},
                          {name: 'Shotgun', damage: 40, src: 'img/weapon/shotgun.png'},
                          {name: 'Rifle', damage: 50, src: 'img/weapon/rifle.png'}];
    this.players = [new Player(1,'Yoda'), new Player(2,'Vader')];
    this.spawnFlag = true;
    this.stoppedOnWeapon = ['',''];
    this.initializeGameData();
    this.addBlockedLocations(17);
    this.addWeapons(4);
    this.addPlayers(this.players);
    // as a final step
    this.createGameNode();
  }

  // populate gameData array with Location objects
  initializeGameData() {
    for (let i = 0; i < this.size; i++) {
      this.gameData[i] = [];
      for (let j = 0; j < this.size; j++) {
        this.gameData[i][j] = new Location(i, j);
      }
    }
  }

  addBlockedLocations(quantity) {
    let i = 0;
    while (i < quantity) {
      let randomLocation = this.randomLocation();
      if (!randomLocation.isBlocked) {
        randomLocation.isBlocked = true;
        i++;
      }
      randomLocation = null;
    }
  }

  addWeapons(quantity) {
    let i = 0;
    while (i < quantity) {
      let randomLocation = this.randomLocation();
      if (!randomLocation.isBlocked && randomLocation.weapon === null) {
        randomLocation.weapon = this.weaponStorage[i];
        // print distribution of weapons to console for testing
        console.log('y'+randomLocation._locationY + ',' + 'x'+randomLocation._locationX + ' = ' + randomLocation.weapon.name + " - " + randomLocation.weapon.damage);
        i++;
      }
    }
  }

  addPlayers(array) {
    let flag = true;

    for (let i = 0; i < array.length; i++) {
      let randomLocation = this.randomStartLocation();
      array[i]._playerLocationY = randomLocation._locationY;
      array[i]._playerLocationX = randomLocation._locationX;
      randomLocation.player = array[i];
      if (flag) {
        this.drawPlayersPath(randomLocation,true);
        flag = !flag;
      }
    }
  }

  drawPlayersPath(squareObject, value, playerNumber) {
    for (let i = 0; i < 4; i++) {
       start: for (let j = 1; j < 4; j++) {

        // create imgNode with halp-opacity player img
        const imgNode = document.createElement('img');
        imgNode.classList.add('half-opacity');

        switch (i) {
          case 0: // moving up
            if ((squareObject._locationY - j) < 0) {
              // console.log('squareObject: ' + (squareObject._locationY - j) + ':' + squareObject._locationX + ' does no exist. Skipping direction');
              break start;
            } else {
              if(!(this.gameData[squareObject._locationY - j][squareObject._locationX].isBlocked)) {
                // change data
                this.gameData[squareObject._locationY - j][squareObject._locationX].isAvailable = value;
                // change display
                let idString = '#loc_' + (squareObject._locationY - j) + '_' + squareObject._locationX;
                $(idString).toggleClass('available');
                this.modifySquareImg(idString, playerNumber, value, imgNode);
              } else {
                break start;
              }
            }
            break;
          case 1: // moving down
            if ((squareObject._locationY + j) > (this.size - 1)) {
              // console.log('squareObject: ' + (squareObject._locationY + j) + ':' + squareObject._locationX + ' does no exist. Skipping direction');
              break start;
            } else {
              if(!(this.gameData[squareObject._locationY + j][squareObject._locationX].isBlocked)) {
                // change data
                this.gameData[squareObject._locationY + j][squareObject._locationX].isAvailable = value;
                // change display
                let idString = '#loc_' + (squareObject._locationY + j) + '_' + squareObject._locationX;
                $(idString).toggleClass('available');
                this.modifySquareImg(idString, playerNumber, value, imgNode);
              } else {
                break start;
              }
            }
            break;
          case 2: // moving left
            if ((squareObject._locationX - j) < 0) {
              // console.log('squareObject: ' + squareObject._locationY + ':' + (squareObject._locationX - j) + ' does no exist. Skipping direction');
              break start;
            } else {
              if(!(this.gameData[squareObject._locationY][squareObject._locationX - j].isBlocked)) {
                // change data
                this.gameData[squareObject._locationY][squareObject._locationX - j].isAvailable = value;
                // change display
                let idString = '#loc_' + (squareObject._locationY) + '_' + (squareObject._locationX  - j);
                $(idString).toggleClass('available');
                this.modifySquareImg(idString, playerNumber, value, imgNode);
              } else {
                break start;
              }
            }
            break;
          case 3: // moving right
            if ((squareObject._locationX + j) > (this.size - 1)) {
              // console.log('squareObject: ' + squareObject._locationY + ':' + (squareObject._locationX + j) + ' does no exist. Skipping direction');
              break start;
            } else {
              if(!(this.gameData[squareObject._locationY][squareObject._locationX + j].isBlocked)) {
                // change data
                this.gameData[squareObject._locationY][squareObject._locationX + j].isAvailable = value;
                // change display
                let idString = '#loc_' + (squareObject._locationY) + '_' + (squareObject._locationX + j);
                $(idString).toggleClass('available');
                this.modifySquareImg(idString, playerNumber, value, imgNode);
              } else {
                break start;
              }
            }
        }
      }
    }
  }

  // draw board based on array and return html NODE to inject to index
  createGameNode() {
    let gameNode = document.createElement('table');
    gameNode.setAttribute('id','gameTable');

    for (let i = 0; i < this.size; i++) {
      let tr = document.createElement('tr');
      for (let j = 0; j < this.size; j++) {
        tr.appendChild(this.gameData[i][j].addLocationNode());
      }
      gameNode.appendChild(tr);
    }
    return gameNode;
  }

  movePlayer(playerNumber, e) {
    let startLocationID;
    let endLocationID;

    // making sure we capture endY and endX even if you click on child node of 'TD' element
    if ((e.target.nodeName === 'P') || (e.target.nodeName === 'IMG')) {
      endLocationID = e.target.parentNode.id;
    } else if (e.target.nodeName === 'TD') {
      endLocationID = e.target.id;
    }

    // creating endLocation and endLocationID (jQuery selector)
    let endX = parseInt(endLocationID[6]);
    let endY = parseInt(endLocationID[4]);
    let endLocation = this.gameData[endY][endX];

    endLocationID = '#' + endLocationID;

    // creating startLocation and startLocationID (jQuery selector)
    let startX = this.players[playerNumber]._playerLocationX;
    let startY = this.players[playerNumber]._playerLocationY;
    let startLocation = this.gameData[startY][startX];

    startLocationID = '#loc_' + startY + '_' + startX;

    // if user clicked on a "good" square..
    if (endLocation.isAvailable) {

      // swap weapon if there is any on players way

      // empty weaponImgNode to swap weapons
      let weaponImgNode = document.createElement('img');
      weaponImgNode.classList.add('weapon');

      let movingUp = ((endX === startX) && (endY < startY));
      let movingDown = (endX === startX) && (endY > startY);
      let movingRight = ((endY === startY) && (endX > startX));
      let movingLeft = ((endY === startY) && (endX < startX));

      let loopSize = 1;
      if (movingUp) {
        loopSize += (startY - endY);
      } else if(movingDown) {
        loopSize += (endY - startY);
      } else if(movingRight) {
        loopSize += (endX - startX);
      } else if(movingLeft) {
        loopSize += (startX - endX);
      }


      // checking players direction
      if(movingUp) {
        console.log('going up');
        // if player is to reveal weapon which he stands on, show it
        if (this.stoppedOnWeapon[playerNumber] !== '') {
          let locationID = this.stoppedOnWeapon[playerNumber];
          setTimeout( () => {
            $(locationID + ' .weapon').show(300);
          }, 500);
          this.stoppedOnWeapon[playerNumber] = '';
        }

        for (let i = 1; i < loopSize; i++) {
          if(this.gameData[startY - i][endX].weapon !== null) {
            console.log('location: y' + (startY - i) + ', x' + endX + ' contains weapon');

            // swap weapons
            let tempWeapon = this.players[playerNumber]._weapon; // temporarily storing players weapon
            this.players[playerNumber]._weapon = this.gameData[startY - i][endX].weapon; // moving field weapon to player
            this.gameData[startY - i][endX].weapon = tempWeapon; // asigning temporary weapon to field

            // re-draw nodes
            let weaponLocationID = '#loc_'+ (startY - i) + '_' + endX;
            weaponImgNode.setAttribute('src', tempWeapon.src);
            $(weaponLocationID + ' .weapon').replaceWith(weaponImgNode);

            // if player lands on a weapon field, hide weapon
            if (weaponLocationID === endLocationID) {
              $(weaponLocationID + ' .weapon').hide();
              this.stoppedOnWeapon[playerNumber] = weaponLocationID;
            }
          }
        }
      } else if(movingDown) {
        console.log('going down');
        // if player is to reveal weapon which he stands on, show it
        if (this.stoppedOnWeapon[playerNumber] !== '') {
          let locationID = this.stoppedOnWeapon[playerNumber];
          setTimeout( () => {
            $(locationID + ' .weapon').show(300);
          }, 500);
          this.stoppedOnWeapon[playerNumber] = '';
        }

        for (let i = 1; i < loopSize; i++) {
          if(this.gameData[startY + i][endX].weapon !== null) {
            console.log('location: y' + (startY + i) + ', x' + endX + ' contains weapon');

            //swap weapons
            let tempWeapon = this.players[playerNumber]._weapon;
            this.players[playerNumber]._weapon = this.gameData[startY + i][endX].weapon;
            this.gameData[startY + i][endX].weapon= tempWeapon;

            //re-draw nodes
            let weaponLocationID = '#loc_' + (startY + i) + '_' + endX;
            weaponImgNode.setAttribute('src', tempWeapon.src);
            $(weaponLocationID + ' .weapon').replaceWith(weaponImgNode);

            // if player lands on a weapon field, hide weapon
            if (weaponLocationID === endLocationID) {
              $(weaponLocationID + ' .weapon').hide();
              this.stoppedOnWeapon[playerNumber] = weaponLocationID;
            }
          }
        }
      } else if(movingLeft) {
        console.log('going left');
        // if player is to reveal weapon which he stands on, show it
        if (this.stoppedOnWeapon[playerNumber] !== '') {
          let locationID = this.stoppedOnWeapon[playerNumber];
          setTimeout( () => {
            $(locationID + ' .weapon').show(300);
          }, 500);
          this.stoppedOnWeapon[playerNumber] = '';
        }

        for (let i = 1; i < loopSize; i++) {
          if(this.gameData[endY][startX - i].weapon !== null) {
            console.log('location: y' + (endY) + ', x' + (startX - i) + ' contains weapon');

            //swap weapons
            let tempWeapon = this.players[playerNumber]._weapon;
            this.players[playerNumber]._weapon = this.gameData[endY][startX - i].weapon;
            this.gameData[endY][startX - i].weapon= tempWeapon;

            //re-draw nodes
            let weaponLocationID = '#loc_' + endY + '_' + (startX - i);
            weaponImgNode.setAttribute('src', tempWeapon.src);
            $(weaponLocationID + ' .weapon').replaceWith(weaponImgNode);

            // if player lands on a weapon field, hide weapon
            if (weaponLocationID === endLocationID) {
              $(weaponLocationID + ' .weapon').hide();
              this.stoppedOnWeapon[playerNumber] = weaponLocationID;
            }
          }
        }
      } else if(movingRight) {
        console.log('going right');
        // if player is to reveal weapon which he stands on, show it
        if (this.stoppedOnWeapon[playerNumber] !== '') {
          let locationID = this.stoppedOnWeapon[playerNumber];
          setTimeout( () => {
            $(locationID + ' .weapon').show(300);
          }, 500);
          this.stoppedOnWeapon[playerNumber] = '';
        }

        for (let i = 1; i < loopSize; i++) {
          if(this.gameData[endY][startX + i].weapon !== null) {
            console.log('location: y' + (endY) + ', x' + (startX + i) + ' contains weapon');

            //swap weapons
            let tempWeapon = this.players[playerNumber]._weapon;
            this.players[playerNumber]._weapon = this.gameData[endY][startX + i].weapon;
            this.gameData[endY][startX + i].weapon= tempWeapon;

            //re-draw nodes
            let weaponLocationID = '#loc_' + endY + '_' + (startX + i);
            weaponImgNode.setAttribute('src', tempWeapon.src);
            $(weaponLocationID + ' .weapon').replaceWith(weaponImgNode);

            // if player lands on a weapon field, hide weapon
            if (weaponLocationID === endLocationID) {
              $(weaponLocationID + ' .weapon').hide();
              this.stoppedOnWeapon[playerNumber] = weaponLocationID;
            }
          }
        }

      }

      // clean data in start location
      startLocation.player = null;
      this.drawPlayersPath(startLocation, false, playerNumber);

      // change players location fields
      this.players[playerNumber]._playerLocationY = endY;
      this.players[playerNumber]._playerLocationX = endX;

      // move player object to new location
      endLocation.player = this.players[playerNumber];

      // disapaer player in start location and appear in end location
      $(startLocationID + ' .player').fadeOut(250, () => {
        $(endLocationID).prepend($(startLocationID + ' .player'));
        $(endLocationID + ' .player').fadeIn(250);
      });

      // enable movement for next player
      if (playerNumber === 0) {
        let nextPlayerLocation = this.getCurrentPlayerLocation(1);
        this.drawPlayersPath(nextPlayerLocation, true, playerNumber);
      } else {
        let nextPlayerLocation = this.getCurrentPlayerLocation(0);
        this.drawPlayersPath(nextPlayerLocation,true, playerNumber);
      }

    }
  }

  movePlayerOneField(howManyTimes, direction) {


    // creates loop to move player x-many times
    // iterates over loop checking..
    // if next location has weapon
    // - assign new weapon to player
    // - assing players weapon to location
    // - draw player with new weapon (add relevant pictures together)
    // - update player stats
    // - if last itearation - hide swapped weapon
    // - blink out old player + weapon
    // - blink in player icon + new weapon

    // if player keep on switching weapons through squares animations
    // happen as he 'goes'
  }

  // Helper Methods

  randomStartLocation() {
    if (this.spawnFlag) {
      let min = this.size - this.size;
      let max = this.size - (0.7 * this.size);
      this.spawnFlag = !this.spawnFlag;
      while (true) {
        let randomLocation = this.gameData[Math.floor(Math.random() * (max - min + 1)) + min][Math.floor(Math.random() * (max - min + 1)) + min];
        if (randomLocation.isBlocked === false && randomLocation.weapon === null) {
          return randomLocation;
        }
      }
    } else {
      let min = (0.6 * this.size);
      let max = this.size - 1;
      this.spawnFlag = !this.spawnFlag;
      while (true) {
        let randomLocation = this.gameData[Math.floor(Math.random() * (max - min + 1)) + min][Math.floor(Math.random() * (max - min + 1)) + min];
        if (randomLocation.isBlocked === false && randomLocation.weapon === null) {
          return randomLocation;
        }
      }
    }
  }

  randomLocation() {
      return this.gameData[Math.floor((Math.random() * this.size))][Math.floor((Math.random() * this.size))];
  }

  /* TODO mofity square erases all instances of 'half-opacity' the first time it goes over. It's not needed to do it
   * so many times.. how about you change this?
  */

  modifySquareImg(idString, playerNumber, value, imgNode) {
    if (playerNumber === 1) {
      // modifies player one - (checks current player and modifies second for next round)
      if (value) {
        imgNode.setAttribute('src','img/yoda-sm.jpg');
        $(idString).prepend(imgNode);
      } else {
        $('.half-opacity').remove();
      }
    } else {
      // modifies player two
      if (value) {
        imgNode.setAttribute('src','img/vader-sm.jpg');
        $(idString).prepend(imgNode);
      } else {
        $('.half-opacity').remove();
      }
    }
  }

  getCurrentPlayerLocation(playerNumber) {
    const y = this.players[playerNumber]._playerLocationY;
    const x = this.players[playerNumber]._playerLocationX;
    return this.gameData[y][x];
  }

}