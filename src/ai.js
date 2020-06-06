var AI = {
    state:{
        aiMode:false,
    },
    clean() {
        this.alreadyTrackingFleets = {};
    },
    init() {
        
        this.timer = setInterval(() => {
            if (!NeptunesPride.universe.galaxy) return;
           if(this.state.aiMode) this.checkStarUnderAttack();
            //anticipate an attack and setup defence
            //look for potential attack targets
            this.allPlayerStats();
            this.starsInfo();
            if(window.GameUI)GameUI.update();
        }, 50);

    },
    toggle(){
        this.state.aiMode = !this.state.aiMode; 
    },
    stop(){
        clearInterval(this.timer);
    },
    allPlayerStats() {
        const collection = [];
        const toNextTechLevel = [];
        const nextTechLevel = 1;
        Object.keys(NeptunesPride.universe.galaxy.players).forEach(key => {
            const player = NeptunesPride.universe.galaxy.players[key];
            const economyPerProdFromStars = player.total_economy * 10;
            const bankingBonus = player.tech.banking.level * 75;

            collection.push({
                player: player.alias,
                bankingPerProd: economyPerProdFromStars + bankingBonus,
                shipsPer30Mins: Math.round((player.total_industry * (player.tech.manufacturing.level + 5)) / 24),
                experimentationPoints: player.tech.research.level * 72,
                experimentationPointsTime:NeptunesPride.universe.timeToTick(player.tech.research.level * 72),
                hyperspaceRange: player.tech.propulsion.level + 3 + ' ly',
                scanning: player.tech.scanning.level + 2 + ' ly',
            });
            const tech = {
                player: player.alias,
            };
            Object.keys(player.tech).forEach(k => {
                tech[k] = {
                 currentLevel: player.tech[k].level,
                 timeToNext:NeptunesPride.universe.timeToTick(((player.tech[k].level - (nextTechLevel - 1)) * 144) - (player.tech[k].research !== undefined ? player.tech[k].research : 0)),

                }
            })

            toNextTechLevel.push(tech);

        });
        // console.table(collection);
        // console.table(toNextTechLevel);
        return {
            players:collection,
            toNextTechLevel,
        }
    },
    starsInfo(){
        const info = {};
        const enemyRange = [];
        const myId = NeptunesPride.universe.galaxy.player_uid;
        const myPlayer = NeptunesPride.universe.galaxy.players[myId];
        Object.keys(NeptunesPride.universe.galaxy.stars).forEach(key => {
            const star = NeptunesPride.universe.galaxy.stars[key];
            if(star.puid >= 0) {
                //which are hig resourced planets 
                const player = NeptunesPride.universe.galaxy.players[star.puid];
                info[player.uid] = info[player.uid] ? info[player.uid] : {
                    player:player.alias,
                    topStars:[],
                    inRangeForAttack:[]
                }
                if(star.nr >= 40 || star.n >= 40)info[player.uid].topStars.push({
                    name:star.n,
                    NaturalResource: star.r,
                    Terraformed: star.nr,
                });
                if(star.puid !== NeptunesPride.universe.galaxy.player_uid) {
                    Object.keys(NeptunesPride.universe.galaxy.stars).forEach(k => {
                        const rangeStar = NeptunesPride.universe.galaxy.stars[k];
                        if(rangeStar.puid == NeptunesPride.universe.galaxy.player_uid) {
                          if(this.isInRange(star, rangeStar, player.tech.propulsion.value)){
                            info[player.uid].inRangeForAttack.push({
                                enemyStar:{
                                    owner: NeptunesPride.universe.galaxy.players[star.puid].alias,
                                    starName: star.n,
                                    NaturalResource: star.r,
                                    Terraformed: star.nr,
                                    ships: this.getShipsOnOrbitingFleets(star).totalShips + star.st,
                                    myStar: rangeStar.n,
                                },
                                myStar:{
                                    owner: NeptunesPride.universe.galaxy.players[rangeStar.puid].alias,
                                    starName: rangeStar.n,
                                    NaturalResource: rangeStar.r,
                                    Terraformed: rangeStar.nr,
                                    ships:  this.getShipsOnOrbitingFleets(rangeStar).totalShips + rangeStar.st
                                }
                            })
                          }

                        }
                    });
                }else{
                    Object.keys(NeptunesPride.universe.galaxy.stars).forEach(k => {
                        const rangeStar = NeptunesPride.universe.galaxy.stars[k];
                        if(rangeStar.puid !== NeptunesPride.universe.galaxy.player_uid) {
                          if(this.isInRange(star, rangeStar, player.tech.propulsion.value)){
                            info[player.uid].inRangeForAttack.push({
                                myStar:{
                                    owner: NeptunesPride.universe.galaxy.players[star.puid].alias,
                                    starName: star.n,
                                    NaturalResource: star.r,
                                    Terraformed: star.nr,
                                    ships: this.getShipsOnOrbitingFleets(star).totalShips + star.st,
                                },
                                enemyStar:{
                                    myStar: star.n,
                                    owner: NeptunesPride.universe.galaxy.players[rangeStar.puid].alias,
                                    starName: rangeStar.n,
                                    NaturalResource: rangeStar.r,
                                    Terraformed: rangeStar.nr,
                                    ships:  this.getShipsOnOrbitingFleets(rangeStar).totalShips + rangeStar.st
                                }
                            })
                          }

                        }
                    });
                }
            }

        });
        // console.table(info);
        return info;
    },
    isInRange(e, t, r) {
        var n, o, a;
        return n = Math.abs(e.x - t.x),
        o = Math.abs(e.y - t.y),
        a = Math.sqrt(n * n + o * o),
        r >= a ? !0 : !1
    },
    getShipsOnOrbitingFleets(star) {
        let info = {
            totalShips: 0,
            fleets: [],
        }
        Object.keys(NeptunesPride.universe.galaxy.fleets).forEach(fk => {
            const fleet = NeptunesPride.universe.galaxy.fleets[fk];
            if (fleet.ouid !== undefined && fleet.ouid == star.uid && star.puid == fleet.puid) {
                info.totalShips += fleet.st;
                info.fleets.push(fleet);
            }
        });
        return info;
    },
    checkTravelCapability(starId, toStarId){
        const ruler  = this.initRuler();
        const star = NeptunesPride.universe.galaxy.stars[starId] || NeptunesPride.universe.galaxy.fleets[starId];
        const toStar= NeptunesPride.universe.galaxy.stars[toStarId];
        ruler.stars.push(toStar)
       const updatedRuler = (this.updateRuler(star, ruler));
        const info =  {
            time: this.timeToTick(updatedRuler.eta),
            techLevel: updatedRuler.hsRequired,
            distance: updatedRuler.ly + ' light years',
            ly:updatedRuler.ly,
            eta:updatedRuler.eta,
        }
        //console.log(info);
        return info;
    },
    initRuler() {
       const ruler = {};
        ruler.stars = [],
        ruler.eta = 0,
        ruler.baseEta = 0,
        ruler.gateEta = 0,
        ruler.gate = !0,
        ruler.totalDist = 0,
        ruler.ly = "0.0",
        ruler.hsRequired = 0;
        return ruler;
    },
    updateRuler(starOrFleet, ruler) {
        t = starOrFleet;
        if (t !== ruler.stars[ruler.stars.length - 1]) {
            "fleet" === t.kind && t.orbiting ? ruler.stars.push(t.orbiting) : ruler.stars.push(t);
            var r = ruler.stars.length;
            if (!(2 > r)) {
                var n = ruler.stars[r - 2]
                  , o = ruler.stars[r - 1]
                  , a = this.distance(n.x, n.y, o.x, o.y)
                  , i = NeptunesPride.universe.galaxy.fleet_speed
                  , s = Math.floor(a / i) + 1
                  , l = Math.floor(a / (3 * i)) + 1;
                ruler.baseEta += s;
                var c = s
                  , u = !1;
                // (e.starsGated(n, o) || e.isGatedFlight(n, o) || e.isGatedFlight(o, n)) && (u = !0,
                // c = l),
                ruler.eta += c,
                ruler.gateEta += u || "fleet" !== n.kind && "fleet" !== o.kind ? l : c,
                ruler.totalDist += a;
                var d = 8 * ruler.totalDist;
                ruler.ly = (Math.round(1e3 * d) / 1e3).toFixed(3),
                ruler.hsRequired = Math.max(ruler.hsRequired, Math.floor(8 * a) - 2, 1)
            }
        }
        return ruler;
    },
    shipsPerTickByindustry(star, industryLevel, playerId){
        return this.calcShipsPerTick(star, playerId ? playerId : this.playerId, industryLevel);
    },
    addFleetWaypointByStar(fleetId, starId, fleet){
        let selectedFleet = fleet ? fleet : this.getFleetById(fleetId);
        this.clearFleetWaypoints(selectedFleet);
        selectedFleet.orders.push([0,starId,0,0]);
        selectedFleet.path.push(this.galaxy.stars[starId]);
        return selectedFleet;
    },
    clearFleetWaypoints(selectedFleet) {
        var r = selectedFleet;
        r.orders = [];
        r.path = [];
        return r;
    },
    battle(starId, defending){
        const star = NeptunesPride.universe.galaxy.stars[starId];
        let attackers = [];
        const defenderInfo = {
            starName: star.n,
            playerName:  NeptunesPride.universe.galaxy.players[star.puid] ? NeptunesPride.universe.galaxy.players[star.puid].alias : 'unknown',
            playerWeaponsLevel: NeptunesPride.universe.galaxy.players[star.puid] && NeptunesPride.universe.galaxy.players[star.puid].tech.weapons.level,
            numberOfShips: star.st,
            shipsPer30Mins: NeptunesPride.universe.galaxy.players[star.puid] !== undefined && Number(this.shipsPerTickByindustry(NeptunesPride.universe.galaxy.stars[starId] ,undefined, star.puid)),
            defenderWeaponTech: NeptunesPride.universe.galaxy.players[star.puid] !== undefined && NeptunesPride.universe.galaxy.players[star.puid].tech.weapons.level + 1,
        }
        if(defending) {
           
            let shipsCount = defenderInfo.numberOfShips;
            Object.keys(NeptunesPride.universe.galaxy.fleets).forEach(key =>{
                const fleet = NeptunesPride.universe.galaxy.fleets[key];
                fleet.o.forEach(waypoint => {
                    const destinationStarId = waypoint[1];
                    if(destinationStarId == star.uid && fleet.puid !== star.puid) {
                        this.addFleetWaypointByStar(fleet.uid,star.uid);
                        const etaParts = this.timeToTick(fleet.etaFirst).split('');
                        const hours = Number(etaParts[0].replace('h',''));
                        const minuteShips = Number(etaParts[1].replace('m','')) >= 30 ? 1 : 0;
                        const numberOfShipsOnArrival = shipsCount ? shipsCount + ((defenderInfo.shipsPer30Mins * 2) * hours) + minuteShips : 0;
                       const playerWeaponsLevel = NeptunesPride.universe.galaxy.players[fleet.puid] && NeptunesPride.universe.galaxy.players[fleet.puid].tech.weapons.level;
                       const battleInfo = this.fight(defenderInfo.defenderWeaponTech,playerWeaponsLevel,numberOfShipsOnArrival,  fleet.st);
                       shipsCount = battleInfo.defendersShips;
                       let shipsToWin = numberOfShipsOnArrival;
                       if(!battleInfo.defendersShips ) {
                           let increment = 1;
                           let potentialDefendersShips = 0;
                           while(!potentialDefendersShips) {
                            potentialBattleInfo = this.fight(defenderInfo.defenderWeaponTech,shipsToWin, playerWeaponsLevel, fleet.st);
                            shipsToWin += increment;
                            potentialDefendersShips = Math.floor(potentialBattleInfo.defendersShips);
                           }
                       }
                       //get playerid and weapons level
                        attackers.push({
                            playerId: NeptunesPride.universe.galaxy.players[fleet.puid].alias,
                            playerWeaponsLevel:playerWeaponsLevel,
                            carrier: fleet.n,
                            numberOfShips: fleet.st,
                            arrivalTime: this.timeToTick(fleet.etaFirst),
                            eta: fleet.etaFirst,
                            defenderShipsOnArrival: numberOfShipsOnArrival ,
                            // battleInfo:battleInfo,
                            totalShipsNeeded: shipsToWin,
                            minimumExtraShipsRequired: Math.floor(shipsToWin - numberOfShipsOnArrival), 
                        }); 
                       
                    }
                })
            });
        }
        attackers = attackers.sort((a,b) => a.eta - b.eta).map(item => {
            const {eta, ...rest} = item;
            return rest;
        });

        return attackers;
    },
    fight(defenderWeaponsTech, defendersShips, attackersWeaponsTech, attackersShips){
        for (var a = ""; !a; ) {
            if (attackersShips -= defenderWeaponsTech,
            0 >= attackersShips) {
                a = "defender";
                break
            }
            if (defendersShips -= attackersWeaponsTech,
            0 >= defendersShips) {
                a = "attacker";
                break
            }
        }
        return {
            attackersShips: attackersShips < 0 ? 0 : attackersShips ,
            defendersShips: defendersShips < 0 ? 0 : defendersShips,
        }
    },
    getMyStars(){
        const collection = {};
        Object.keys(NeptunesPride.universe.galaxy.stars).forEach(key => { 
            const star = NeptunesPride.universe.galaxy.stars[key];
         if(star.puid === NeptunesPride.universe.galaxy.player_uid) collection[key] = NeptunesPride.universe.galaxy.stars[key];
        });
        return collection;
    },
    timeToTick(t){
           return  NeptunesPride.universe.timeToTick(t)
    },
    distance(e, t, r, n) {
        var o = Math.sqrt((e - r) * (e - r) + (t - n) * (t - n));
        return o
    },
    calcShipsPerTick (starId, playerId, industryLevel) {
        const star = NeptunesPride.universe.galaxy.stars[starId];
        const player = NeptunesPride.universe.galaxy.players[playerId];
        var r = (industryLevel ? industryLevel : star.i) * (5 + player.tech.manufacturing.level)
          , n = r / NeptunesPride.universe.galaxy.production_rate;
        return n !== Math.round(n) && (n = n.toFixed(2)),
        n
    },
    alreadyTrackingFleets: {},
    calculatePotentialShipsByTime(time, star) {
        const shipsPerTick = this.calcShipsPerTick(star.uid, NeptunesPride.universe.galaxy.player_uid);
        const hourMatch = time.match(/([0-9])+h /);
        const minsMatch = time.match(/ ([0-9])+m /);
        const hours = hourMatch && hourMatch[1] ? Number(hourMatch[1]) : undefined;
        const mins = minsMatch && minsMatch[1] ? Number(minsMatch[1]) : undefined;
        let ships = 0;
        if (!isNaN(hours)) {
            ships = (hours * 2) * shipsPerTick;
        }
        if (!isNaN(mins)) {
            ships += mins / 30;
        }
        return ships;
    },
    talk(message) {
        console.log(`AI - ${message.toUpperCase()}`);
    },
    canFleetGetThereInTime(fleet) {

    },
    areFleetsOnRouteForDefence(star, enemyTravelInfo, shipsRequired) {
        let totalShips = 0;
        Object.keys(NeptunesPride.universe.galaxy.fleets).forEach(k => {
            const fleet = NeptunesPride.universe.galaxy.fleets[k];
            if (fleet.ouid == star.uid || fleet.o && fleet.o[0] && fleet.o[0][1] == star.uid && fleet.puid == star.puid) {
                const travel = this.checkTravelCapability(fleet.uid, star.uid);
                if (travel.ly <= enemyTravelInfo.ly) {
                    totalShips += fleet.st;
                }
            }
        });
        return (totalShips >= shipsRequired)

    },
    closetStars(star) {
        const collection = [];
        const myStarsList = this.getMyStars();
        Object.keys(myStarsList).forEach(key => {
            const myStar = NeptunesPride.universe.galaxy.stars[myStarsList[key]];
            if (myStar.uid === star.uid) return;
            const travel = this.checkTravelCapability(myStar.uid, myStarsList[key]);
            if (travel.techLevel <= NeptunesPride.universe.galaxy.players[myStar.puid].tech.propulsion.level) {
                collection.push({
                    star: myStar,
                    eta: travel.eta,
                    travel,
                });
            }

        });
        return collection;
    },
    checkStarUnderAttack() {
        if (!NeptunesPride.universe.galaxy) return;
        //TODO - rewrite this so we store incoming enemy fleets per star so we can calculate multiple attacks and how to manage it.
        //this.talk('Is any of my stars under an attack?')
        Object.keys(NeptunesPride.universe.galaxy.fleets).forEach(key => {
            const enemeyFleet = NeptunesPride.universe.galaxy.fleets[key];
            if (enemeyFleet.puid == NeptunesPride.universe.galaxy.player_uid) return;
            if (enemeyFleet.o && enemeyFleet.o.length) {
                enemeyFleet.o.forEach(o => {
                    const myStarId = o[1];
                    const enemyTravel = this.checkTravelCapability(enemeyFleet.uid, myStarId);
                    const defendingStar = NeptunesPride.universe.galaxy.stars[myStarId];
                    //defending star info
                    if (this.alreadyTrackingFleets[enemeyFleet.uid] && this.alreadyTrackingFleets[enemeyFleet.uid].destination == myStarId) return;

                    const potentialShips = this.calculatePotentialShipsByTime(enemyTravel.time, defendingStar);
                    const totalStarShipsOnArrival = defendingStar.st + potentialShips;
                    // Is this fleet coming to my star?
                    if (defendingStar && defendingStar.puid ==  NeptunesPride.universe.galaxy.player_uid) {
                        this.talk(`Detected a fleet (${enemeyFleet.n}) coming t0 ${defendingStar.n} star`);
                        this.talk(`${enemeyFleet.n} will take ${enemyTravel.time}`)
                        this.alreadyTrackingFleets[enemeyFleet.uid] = {
                            destination: defendingStar.uid,
                        };
                        //TODO - what if enemy upgrades weapons
                        const battleStats = GameStats.battle(defendingStar.uid, true);
                        // console.log('battleStats', battleStats)
                        const fleetOnRoute = this.areFleetsOnRouteForDefence(defendingStar, enemyTravel, battleStats[0].minimumExtraShipsRequired);
                        if (fleetOnRoute) return;
                        if (battleStats[0].minimumExtraShipsRequired) {
                            this.talk(`Looks like we don't have enough ships to defend this star!`)
                            this.talk(`Let me look around our nearest stars for help`)

                            //check closet star
                            //checkTravelCapability
                            // stars that can help
                            let availableHelp = [];
                            // find
                            const myStarList = this.getMyStars();
                            Object.keys(myStarList).forEach(key => {
                                const myStar = NeptunesPride.universe.galaxy.stars[key];
                                if (myStar.uid === myStarId) return;
                                const travel = this.checkTravelCapability(myStarId, key);
                                if (travel.techLevel <= NeptunesPride.universe.galaxy.players[myStar.puid].tech.propulsion.level && travel.ly < enemyTravel.ly) {
                                    availableHelp.push({
                                        star: myStar,
                                        eta: travel.eta,
                                        travel,
                                    });
                                }

                            });
                            if (availableHelp.length) {
                                this.talk(`We have a few stars that can help and get there in time!`)
                                this.talk(`Let me see if we have enough ships to send as backup`)
                                let helpInfo = {
                                    totalShips: totalStarShipsOnArrival,
                                    star: [],
                                }
                                let shipsSent = false;
                                availableHelp.forEach((closeStar) => {
                                    if (closeStar.travel.ly < enemyTravel.ly) {
                                        // Do this star have enough ships?
                                        // console.log(closeStar)
                                        const shipsOnClosetStar = closeStar.star.st;
                                        const orbitingInfo = this.getShipsOnOrbitingFleets(closeStar.star);
                                        //store star info for a group attack
                                        helpInfo.totalShips += shipsOnClosetStar + orbitingInfo.totalShips;
                                        helpInfo.star.push({
                                            star: closeStar,
                                            totalShips: shipsOnClosetStar + orbitingInfo.totalShips,
                                        })
                                        if (totalStarShipsOnArrival + shipsOnClosetStar + orbitingInfo.totalShips >= battleStats[0].minimumExtraShipsRequired) {
                                            // I can send fleets to help
                                            const shipsNeededFromFleet = battleStats[0].minimumExtraShipsRequired - shipsOnClosetStar;
                                            //add ships to fleet
                                            const fleetWithEnoughShips = orbitingInfo.fleets.find(f => {
                                                return f.st >= shipsNeededFromFleet;
                                            });
                                            //transfer 
                                            if (fleetWithEnoughShips) {
                                                this.talk(`We have enough ships on ${closeStar.star.n} so I'll dispatch a fleet`);
                                                Api.transferShips(closeStar.star, fleetWithEnoughShips, closeStar.star.st);
                                                Api.sendShip(fleetWithEnoughShips, defendingStar);
                                                this.talk(`Dispatched ${fleetWithEnoughShips.n} with ${fleetWithEnoughShips.st} and will take ${this.timeToTick(closeStar.eta)}`)
                                                shipsSent = true;
                                            } else {

                                                //TODO
                                                //no fleets with enough ships
                                                // console.log('no fleets', helpInfo)
                                            }

                                        } else {
                                            //not enough ships to defend
                                            // do i have help from other stars.
                                        }

                                    }
                                    // console.log(enemyTravel,lowestETAStar.travel)
                                })
                                if (!shipsSent) {
                                    this.talk('need to see if we can bring ships from more than one place or if it\'s worth defending');
                                    if (availableHelp.length == 1) {
                                        this.talk('we dont have any help need to consider saving fleets');
                                        if (defendingStar.nr < 30 || defendingStar.r < 30) {
                                            const orbitingFleets = this.getShipsOnOrbitingFleets(defendingStar);
                                            if (orbitingFleets.fleets.length) {
                                                Api.transferShips(defendingStar, orbitingFleets.fleets[0], defendingStar.st);
                                                const closetStars = this.closetStars(defendingStar);
                                                if (closetStars) {
                                                    orbitingFleets.fleets.forEach(f => {
                                                        Api.sendShip(f, closetStars[0].star)
                                                    })
                                                } else {
                                                    this.talk('Damn no stars to travel too!\nWe\'re sitting ducks!')
                                                }
                                            } else {
                                                //buy carrier

                                            }
                                            //create a fleet and send ships to near by star
                                            //does the star have a fllet
                                            //do i need to create a fleet
                                            //do i have money for a fleet
                                            this.talk(`Star isnt worth the fight.`);
                                        }
                                    } else {
                                        let sendingShips = 0;
                                        this.talk(`We have ships around to help. Will gather them`)
                                        availableHelp.forEach((closeStar) => {
                                            // console.log(sendingShips, closeStar.travel.ly < enemyTravel.ly)
                                            if (sendingShips >= battleStats[0].minimumExtraShipsRequired) return;
                                            if (closeStar.travel.ly < enemyTravel.ly) {
                                                const orbitingFleets = this.getShipsOnOrbitingFleets(closeStar.star);
                                                if (orbitingFleets.fleets.length) {
                                                    const shipsToTransfer = closeStar.star.st - 10 ? closeStar.star.st - 10 : 0;
                                                    if (shipsToTransfer) {
                                                        Api.transferShips(closeStar.star, orbitingFleets.fleets[0], shipsToTransfer);
                                                        sendingShips += orbitingFleets.fleets[0].st;
                                                    }
                                                    Api.sendShip(orbitingFleets.fleets[0], defendingStar);
                                                } else {
                                                    //buy one
                                                }

                                            }
                                        });
                                    }
                                }

                            }

                        } else {
                            this.talk(`Let them come! we're ready!`)
                        }
                    }
                })
            }
        });
    }
}
