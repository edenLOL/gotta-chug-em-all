
// pass vars to each function as they are called
// var pokemon = playerArray[turnCounter].pokemon
// var name = playerArray[turnCounter].name
// gameStart(pokemon, name)
// will pass the pokemon of the current turn, and the name between functions


var map;
var oms;
var numPlayers = 0;
var playerArray = [];
var playerNames = new Array();
var gameSettings = {};
var pokeMarker = null; 
var pokemonSelected;
var markerRail = [[-232, 44], [-207, 44]]
var turnCounter = 0;
var movesRemaining = 0;
//**clusters** var markers = L.markerClusterGroup({ disableClusteringAtZoom: 4, maxClusterRadius: 5, spiderfyDistanceMultiplier: 3 });

$( document ).ready(function() {
// game init     

var gameboardOriginalUrl = 'img/board-original.png',
    gameboardGoldSilverUrl = 'img/board-gold-silver.png'

var gameVariant = gameboardOriginalUrl;

$('#selectBoard-original').on('click', function() {
   gameVariant = gameboardOriginalUrl; 
   $('.board-container').slideUp('slow');
   $('.forms-container').slideDown('slow');
   L.imageOverlay(gameVariant, bounds).addTo(map);
   return false;
   
});

$('#selectBoard-goldsilver').on('click', function() {
   gameVariant = gameboardGoldSilverUrl; 
   $('.board-container').slideUp('slow');
   $('.forms-container').slideDown('slow');
   L.imageOverlay(gameVariant, bounds).addTo(map);
   return false;      
});

//configuration

$('#playerSetup').on('submit', function(i) {
    var playerNamesInput = $(this).find("input[name^='playerNames']");
    var playerNamesVal = playerNamesInput.val();
    if (playerNamesVal.length > 1) {
        var playerNamesString = playerNamesVal.toString();

        playerNames.push( ''+playerNamesString+'' );
        numPlayers = playerNames.length;
        playerArray.push(
            player = {
                name: playerNamesString,  //  Name entered from title screen
                pokemon: '',              //  Pokemon selected from title screen
                status: '',               //  Current status effects (stunned, immune etc)
                coords: [-230, 45],       //  Location on the gameboard
                square: 0,                //  Which square are you on
                drinks: 0,                //  How many drinks have been allocated to this player (display in console/scoreboard)
                marker: null,             //  Leaflet marker object
                gender: null,             //  Which gender is the player
                effect: null,             //  Determine status effects on player
                missedTurns: 0,           //  Current amount of turns to miss
            });
        watch(player, 'drinks', function(){
            $('#drinks-' + player.pokemon).text(player.drinks)
        });
        $('.nameList').append("<tr><td width='40%'><span>"+ playerNamesString +"</span></td></tr>");
        
        playerNamesInput.val('');
        playerNamesInput.attr('placeholder', 'Type another one!')
        
        //shortcodes for current player properties
        window._player = playerArray[turnCounter]
        window._square = playerArray[turnCounter].square
        window._pokemon = playerArray[turnCounter].pokemon
        window._name = playerArray[turnCounter].name
        window._coords = playerArray[turnCounter].coords
        window._marker = playerArray[turnCounter].marker
        window._drinks = playerArray[turnCounter].drinks

        return false;
    }
    else {
        return false
    }
});

//avatar selection
var pokeCounter = 0;

$('#namesEntered').on('click', function() {
    $('#playerSetup').slideUp('slow');
    $('#playerNamePickPokemon').html(''+ playerArray[0].name + ', pick your favourite Pokemon!');
    $('#playerIcons').slideDown('slow')
    return false;
});

$('#playerIcons > table > tbody > tr > td').on('click', function(){

    pokemonSelected = $(this).attr('class');
    if ( !$(this).hasClass('pokemonSelected') ){

        playerArray[pokeCounter].pokemon = ''+ pokemonSelected +'';
        playerArray[pokeCounter].marker = L.Marker.movingMarker(markerRail, [2000], {
                                                    icon: window[pokemonSelected]
                                                });
        //**clusters** markers.addLayer(playerArray[pokeCounter].marker);
        oms.addMarker(playerArray[pokeCounter].marker)  //**spiderfier
        playerArray[pokeCounter].marker.addTo(map);
        
        $('.drinksTable').append("<tr><td width='40%'><span>"+ playerArray[pokeCounter].name +"</span></td><td><span id='drinks-"+ playerArray[pokeCounter].pokemon +"'>0</span></td></tr>");
        
        
        $(this).addClass('pokemonSelected');
        pokeCounter += 1;        
        $('#playerIcons').fadeOut();

        if ( pokeCounter < numPlayers ) { 
            $('#playerIcons').promise().done(function(){
                $('#playerNamePickPokemon').html(''+ playerArray[pokeCounter].name + ', pick your favourite Pokemon!')
                $('#playerIcons').fadeIn();
            });             
        } else {
            $('#playerIcons').slideUp('slow');
            $('#gameConfig').slideDown('slow')
        };

    } else {
        return false;
    };


});




// Game config screen
$('#gameConfig').on('submit', function(i) {

    
    trainerBattles = $(this).find("input[name^='trainerBattles']").val();
    offTheTable = $(this).find("input[name^='offTable']").val();
    missTurnsMax = $(this).find("input[name^='capTurns']").val();
    pokemonEvolve = $(this).find("input[name^='evolve']").val();
    fullDrink = $(this).find("input[name^='fullDrink']").val();
    
    $('#log ul#gameConfigReport').append('<li>Trainer Battles: <strong>' + trainerBattles + '</strong></li><li>Off the Table chance: <strong>' + offTheTable + '%</strong></li><li>Max missed turns: <strong>' + missTurnsMax + '</strong></li><li>Pokemon evolve: <strong>' + pokemonEvolve + '</strong></li><li>Drinks in a full beverage: <strong>' + fullDrink + '</strong></li>');
    
    //close final dialog
    $('.intro-container').slideUp('slow');
    $('#map').slideDown('slow');
    $('#game-controls').slideDown('slow');
    map.invalidateSize();
    $('#ytplayer').remove()
    gameStart();
    return false;
});



//map init
    
map = new L.Map('map', {
    minZoom: 2,
    maxZoom: 4,
    center: [0, 0],
    zoom: 2,
    crs: L.CRS.Simple //coord system (required)
});


// dimensions of the image
var w = 2216,
    h = 2216,
    url = gameVariant;
    
// calculate the edges of the image, in coordinate space
var southWest = map.unproject([0, h], map.getMaxZoom()-1);
var northEast = map.unproject([w, 0], map.getMaxZoom()-1);
var bounds = new L.LatLngBounds(southWest, northEast);

// add the image overlay, 
// so that it covers the entire map
//L.imageOverlay(gameVariant, bounds).addTo(map);

// tell leaflet that the map is exactly as big as the image
map.setMaxBounds(bounds);
        
//var fullscreenControl = new L.control.fullscreen().addTo(map); // fullscreen control    
L.polyline(markerRail).addTo(map);

var options = {  //**spiderfier
    keepSpiderfied: true,
    nearbyDistance: 120
};
oms = new OverlappingMarkerSpiderfier(map, options); //**spiderfier


// Grid for marker placement
var gridOptions = {interval: 20,
               showOriginLabel: true,
               redraw: 'move',
               zoomIntervals: [
                {start: 0, end: 1, interval: 25},
                {start: 2, end: 3, interval: 20},
                {start: 4, end: 20, interval: 5}
            ]};

//L.simpleGraticule(gridOptions).addTo(map);

// Resize markers on zoom 
map.on('zoomend', function() {
  var currentZoom = map.getZoom();

  var zoomStyles = [ 'null', 'null', '48px', '64px', '128px'];

  $('.marker').css({
      'width': zoomStyles[currentZoom],
      'height': zoomStyles[currentZoom]
  });
});


//function runs at the beginning of the game
function gameStart(){
    setTimeout(function () {
        map.invalidateSize();
        //**clusters** map.addLayer(markers);
     
        //**clusters** var bounds = markers.getBounds(); // [1]
        //**clusters** map.fitBounds(bounds); // [2] 
        //update log
        $('#log').append( '<hr><div>Your turn, <strong>'+ playerArray[turnCounter].name +'</strong>!</div>' );
        updateLog();          
    }, 500);
};


//Roll the dice
$('.dice-container').on('click', function(){  
        $('.dice-container').hide(); //hide so timing doesnt get messed up if someone clicks mid turn
        
        rollDice();

        map.setView(playerArray[turnCounter].coords, 4, {animate: true});
       
        //use the function to show it
        show_modal('diceWindow');  
         
        setTimeout(function () {
            $("<div class='diceAnimation'></div>").appendTo('#diceWindow');
            $(".diceAnimation").css('background-image', 'url(img/throw.gif)');
            setTimeout(function () {
                $(".diceAnimation").css('background-image', 'url(img/result.gif)');
            }, 2400);
            setTimeout(function () {
                $(".diceAnimation").css('background-image', 'url(img/diceresult.png)');
            }, 3600);
            setTimeout(function () {
                $("<div class='diceResults'></div>").appendTo('.diceAnimation');
                $('.diceResults').html('<span>' + diceRoll + '</span>');
                $('.die').html( '<span>' + diceRoll + '</span>' );
                $('.diceResults').fadeIn(1500);
            }, 3700);
            setTimeout(function () {
                movesRemaining = diceRoll;
                moveMarker();
            }, 6000);

            setTimeout(function () {
                 
                close_modal();
                $(".diceAnimation").remove();
                $('.diceResults').remove();
                $(".diceAnimation").css('background-img', 'none');
                
               //update log
                $('#log').append( '<div>'+ playerArray[turnCounter].name +' rolled ' + diceRoll + '</div>' );
                updateLog();
            }, 7000);
        }, 1000);         
});  

$('#squareContinue').on('click', function (){
   close_modal();
   resolveTurn();     
});

        

});




function moveMarker() {
    //zoom to marker
    setTimeout(function () {            
        //move marker

        
         var marker = playerArray[turnCounter].marker;
         var loc = playerArray[turnCounter].square;
         var moveToSquare = loc + 1;
         
         marker.moveTo(gameSquares[moveToSquare].latlng, 800)
 
         playerArray[turnCounter].square = moveToSquare;
         playerArray[turnCounter].coords = gameSquares[moveToSquare].latlng;
         
        try{
            playerArray[turnCounter].marker.fire('click')
        }
        catch (e) {
            console.log(e);
        };
         
        map.panTo(playerArray[turnCounter].coords, {animate: true, duration: 1.0});
        
        if (gameSquares[moveToSquare].gymGold) {
            movesRemaining = 0;
            //do gym things
            goldGym(this);            
        } else {
            movesRemaining -= 1;
            if (movesRemaining > 0) {
                moveMarker();
                map.fire('click');                                
            }
            else {
                squareInfo();
                map.fire('click');                
            }
        }
    }, 1200);    
    
};

//function TEST(){
//    setTimeout(function () {
//        map.invalidateSize();
//        geojson = L.geoJson(playerArray, {
//            pointToLayer: function (player) {
//                return L.marker(player.coords, {icon: player.pokemon})
//           }
//        })
//        markers.addLayer(geojson);
//        map.addLayer(markers);
//        console.log(markers + 'added to map');
//        
//        var bounds = markers.getBounds(); // [1]
//        map.fitBounds(bounds); // [2]  
//    }, 500);
//}


// dice roll
function rollDice() {
    diceRoll = Math.floor(Math.random() * 6) + 1
};

function squareInfo () {
    var square = gameSquares[playerArray[turnCounter].square];
    setTimeout(function () {
        $('.squareDesc').html('<div><h2>' + square.text  + '</h2></div>');
        $('.squareAction').html('<div><p>' + square.action  + '</p></div>');
        show_modal('squareInfo');
        
        if (square.give) {
            //giveDrinks(square);
            //$('#squareContinue').hide();
        }
    }, 1000);
};

//give other people drinks
//currently gamebreaking
function giveDrinks (square) {
            var giveValue = square.give;
            var giveDrinks;
            var givePlayers;
            
            function giveDrinksFn () {
                if ($.isArray(giveValue)) {
                    giveDrinks = giveValue[0];
                } else {
                    giveDrinks = giveValue;
                }
            }
            function givePlayersFn () {
                if (giveValue[1]) { 
                    givePlayers = giveValue[1];
                } else {
                    givePlayers = 1
                }
            };
                        
            var playerToDrink;

            $('.squareGive').append('<p>Pick someone to drink - you have <span class="giveDrinks">' + giveDrinks + '</span> to give to <span class="givePlayers">' + givePlayers + '</span>.</p>');
            $('.squareGive').append('<table id="giveTable"><tr id="giveTableRow"></tr></table>');
      
            for (var i = 0; i < playerArray.length; ++i) {
               // keep a reference to an individual president object
                var player = playerArray[i];
                // properties of the array elements
                var properties = ['name', 'pokemon']; //not used?
                $('#giveTableRow').append("<td id=" + player['name'] + " class=" + player['pokemon'] + "><span class='giveName'>"+ player['name'] +"</span><span class='numToDrink'>0</span></td>");
            }

            $('.squareGive > table > tbody > tr > td').on('click', function(){
                console.log('clicked on table');
                if (giveDrinks > 0) { 
                    var playerSelectedName = $(this).attr('id');
                    
                    playerToDrink = function() {
                        for (var i = 0, len = playerArray.length; i < len; i++) {
                        if (playerArray[i].name === playerSelectedName)
                            return playerArray[i]; // Return as soon as the object is found
                        }
                    }
                    
                    $(this).fadeOut().promise();
                    $(this).fadeIn().promise();

                    if (givePlayers !== 1) {
                        giveDrinks = giveDrinks - 1;
                        var drinksGiven = $('#' + playerSelectedName + ' > .numToDrink').text();
                        var drinksGivenNum = parseInt(drinksGiven, 10);
                        var amountToDrink = drinksGivenNum + 1;
                        $('#' + playerSelectedName + ' > .numToDrink').text(amountToDrink);
                        $('.giveDrinks').text(giveDrinks);
                        playerToDrink.drink = playerToDrink.drink + 1;
                        checkDrinks();
                        
                    } else if (givePlayers == 1) {
                        $('#' + playerSelectedName + ' > .numToDrink').text(giveDrinks);
                        playerToDrink.drink = giveDrinks;
                        giveDrinks = 0;
                        $('.giveDrinks').text(giveDrinks);
                        checkDrinks();
                    };
                }
            })
        
        function checkDrinks () {
            if (giveDrinks == 0) {
                $('.squareGive > p').text("You've given out all your drinks, now make them drink!");
                $('#squareContinue').fadeIn('fast');
            } else return false;
        } 
    
}

//Check squares and finish turn
function resolveTurn() {

    var square = gameSquares[playerArray[turnCounter].square];
    
    var drinkVal = getDrinks(square);
    var drinkNum = parseInt(drinkVal, 10);
    
    var missTurns = parseInt(square.missTurn, 10);
    var specialEffect = square.specialEffect;
    
    setTimeout(function () {    
        if (square.fn) {            
            square.fn();
        };
      
        setTimeout(function () {                
            if (drinkVal > 0) {
                playerArray[turnCounter].drinks = playerArray[turnCounter].drinks + drinkNum;
                
               //update log
                $('#log').append( '<div><strong>'+ playerArray[turnCounter].name +'</strong> must have ' + drinkNum + ' drinks.</div>' );
                updateLog();                
            }
            if (missTurns > 0) {
               if (missTurns > missTurnsMax){
                   missTurns = missTurnsMax
               }
               playerArray[turnCounter].missedTurns = missTurns; //add missed turns

               //update log
                $('#log').append( '<div><strong>'+ playerArray[turnCounter].name +'</strong> misses ' + missTurns + ' turns.</div>' );
                updateLog();                
            }       
            
            if (specialEffect) {
               

               //update log
                $('#log').append( '<div><strong>'+ playerArray[turnCounter].name +'</strong> misses ' + missTurns + ' turns.</div>' );
                updateLog();                
            }                      
            setTimeout(function () {   
                endTurn(square);
            }, 1000);             
        }, 1500);
    }, 500);     
       
};

//finalise turn, and progress to next player
function endTurn(square) {
    $('.' + playerArray[turnCounter].pokemon).css('background-image', '');
    $('.' + playerArray[turnCounter].pokemon).css('background-size', '');
    $('.' + playerArray[turnCounter].pokemon).css('background-position', '');
    
    //update drink values
    for (i = 0; i < playerArray.length; i++) {
        var player = playerArray[i];
        $('#drinks-' + player.pokemon).text(player.drinks);
    };
    
    if (square.extraTurn) {
        $('.dice-container').show();     
        $('#log').append( '<div>Have another turn, <strong>'+ playerArray[turnCounter].name +'</strong>!</div>' );    
        updateLog();                           
        return false;

    } else {
        turnCounter += 1;
        if (turnCounter >= numPlayers) {
            turnCounter = 0; 
        }
        //update log
        $('#log').append( '<hr><div>Your turn, <strong>'+ playerArray[turnCounter].name +'</strong>!</div>' );
        updateLog();
        
        checkStatus(); //check for status effects on next player
    };
    
    $('.dice-container').show();            
     
    setTimeout(function () {                
        var currentBkgd = $('.' + playerArray[turnCounter].pokemon).css('background-image');
        var animatedPath = currentBkgd.replace("''", "").replace("/sprites/", "/sprites/animated/").replace(".png", ".gif");
        
        $('.' + playerArray[turnCounter].pokemon).css('background-image', animatedPath);
        $('.' + playerArray[turnCounter].pokemon).css('background-size', '150%');
        $('.' + playerArray[turnCounter].pokemon).css('background-position', 'center');
        
        map.setView(playerArray[turnCounter].coords, 4, {animate: true});
    }, 500);        
}

function reRoll() {
        rollDice();
        //use the function to show it
        show_modal('diceWindow');  
         
        setTimeout(function () {
            $("<div class='diceAnimation'></div>").appendTo('#diceWindow');
            $(".diceAnimation").css('background-image', 'url(img/throw.gif)');
            setTimeout(function () {
                $(".diceAnimation").css('background-image', 'url(img/result.gif)');
            }, 2400);
            setTimeout(function () {
                $(".diceAnimation").css('background-image', 'url(img/diceresult.png)');
            }, 3600);
            setTimeout(function () {
                $("<div class='diceResults'></div>").appendTo('.diceAnimation');
                $('.diceResults').html('<span>' + diceRoll + '</span>');
                $('.die').html( '<span>' + diceRoll + '</span>' );
                $('.diceResults').fadeIn(1500);
            }, 3700);
            setTimeout(function () {
                close_modal();
                $(".diceAnimation").remove();
                $('.diceResults').remove();
                $(".diceAnimation").css('background-img', 'none');
               
               //update log
                $('#log').append( '<div>'+ playerArray[turnCounter].name +' re-rolled and got a ' + diceRoll + '</div>' );
                updateLog();                
            }, 7000);
        }, 300);      
};

function clearModal(modal_id){
    $(modal_id).html('');
    close_modal();
};

function getDrinks(square){
    var drinkFn = $.isFunction(square.drink);
    if (drinkFn == true) {
        return square.drink();
    } else {
        return square.drink;
    }   
};

function goldGym (gym) {
    setTimeout(function () {
        var square = gameSquares[playerArray[turnCounter].square];  
        if (square.gym) {            
            square.gym();
        };        
    squareInfo();
    }, 1000);
    //resolveTurn(); // not required as clicking continue resolves turn anyway
};


//log controls
function updateLog() {
    // allow 1px inaccuracy by adding 1
    var isScrolledToBottom = $('#log').scrollHeight - $('#log').clientHeight <= $('#log').scrollTop + 1;

    // scroll to bottom if isScrolledToBottom
    if(isScrolledToBottom)
      $('#log').scrollTop = $('#log').scrollHeight - $('#log').clientHeight;
      
    $('#log').scrollTop(9999999999999999999999999999999999);
};

//notification animation
function notify() {
    $('.notification-container').animate({right: "0"});
}

//check for status at start of turn
function checkStatus() {
    var player = playerArray[turnCounter];
    var effect = player.effect;
    var missed = player.missedTurns;
    
    //miss turn
    if (missed > 0) {
        missTurn();
    };
    
    //check status 
    
}


// player misses his turn
function missTurn () {
    //update log
    $('#log').append( '<div>'+ playerArray[turnCounter].name +' misses a turn!</div>' );
    updateLog();  
    
    playerArray[turnCounter].missedTurns = playerArray[turnCounter].missedTurns - 1; //remove a missed turn
    // progress to next player
    turnCounter += 1;
        if (turnCounter >= numPlayers) {
            turnCounter = 0; 
        }
    //update log
    $('#log').append( '<hr><div>Your turn, <strong>'+ playerArray[turnCounter].name +'</strong>!</div>' );
    updateLog(); 
    
    setTimeout(function () {                
        map.setView(playerArray[turnCounter].coords, 4, {animate: true});
    }, 500);       
    
    return false;   
};