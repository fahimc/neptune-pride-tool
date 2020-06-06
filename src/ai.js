var AI = {
    clean(){
        this.alreadyTrackingFleets = {};
    },
    init() {
        this.checkStarUnderAttack();
    },
    alreadyTrackingFleets: {},
    calculatePotentialShipsByTime(time, star) {
        const shipsPerTick = GameStats.calcShipsPerTick(star.uid, GameStats.playerId);
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
    getShipsOnOrbitingFleets(star) {
        let info = {
            totalShips: 0,
            fleets: [],
        }
        Object.keys(GameStats.galaxy.fleets).forEach(fk => {
            const fleet = GameStats.galaxy.fleets[fk];
            if (fleet.ouid !== undefined && fleet.ouid == star.uid && star.puid == fleet.puid) {
                info.totalShips += fleet.st;
                info.fleets.push(fleet);
            }
        });
        return info;
    },
    talk(message) {
        console.log(`AI - ${message.toUpperCase()}`);
    },
    canFleetGetThereInTime(fleet) {

    },
    areFleetsOnRouteForDefence(star, enemyTravelInfo, shipsRequired) {
        let totalShips = 0;
        Object.keys(GameStats.galaxy.fleets).forEach(k => {
            const fleet = GameStats.galaxy.fleets[k];
            if (fleet.ouid == star.uid || fleet.o && fleet.o[0] && fleet.o[0][1] == star.uid && fleet.puid == star.puid) {
                const travel = GameStats.checkTravelCapability(fleet.uid, star.uid);
                if (travel.ly <= enemyTravelInfo.ly) {
                    totalShips += fleet.st;
                }
            }
        });
        return (totalShips >= shipsRequired)

    },
    closetStars(star) {
        const collection = [];
        Object.keys(GameStats.MyStars).forEach(key => {
            const myStar = GameStats.galaxy.stars[GameStats.MyStars[key]];
            if (myStar.uid === star.uid) return;
            const travel = GameStats.checkTravelCapability(myStar.uid, GameStats.MyStars[key]);
            if (travel.techLevel <= GameStats.galaxy.players[myStar.puid].tech.propulsion.level) {
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
        //TODO - rewrite this so we store incoming enemy fleets per star so we can calculate multiple attacks and how to manage it.
        //this.talk('Is any of my stars under an attack?')
        Object.keys(GameStats.galaxy.fleets).forEach(key => {
            const enemeyFleet = GameStats.galaxy.fleets[key];
            if (enemeyFleet.puid == GameStats.playerId) return;
            if (enemeyFleet.o && enemeyFleet.o.length) {
                enemeyFleet.o.forEach(o => {
                    const myStarId = o[1];
                    const enemyTravel = GameStats.checkTravelCapability(enemeyFleet.uid, myStarId);
                    const defendingStar = GameStats.galaxy.stars[myStarId];
                    //defending star info
                    if (this.alreadyTrackingFleets[enemeyFleet.uid] && this.alreadyTrackingFleets[enemeyFleet.uid].destination == myStarId) return;

                    const potentialShips = this.calculatePotentialShipsByTime(enemyTravel.time, defendingStar);
                    const totalStarShipsOnArrival = defendingStar.st + potentialShips;
                    // Is this fleet coming to my star?
                    if (defendingStar && defendingStar.puid == GameStats.playerId) {
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
                            Object.keys(GameStats.MyStars).forEach(key => {
                                const myStar = GameStats.galaxy.stars[GameStats.MyStars[key]];
                                if (myStar.uid === myStarId) return;
                                const travel = GameStats.checkTravelCapability(myStarId, GameStats.MyStars[key]);
                                if (travel.techLevel <= GameStats.galaxy.players[myStar.puid].tech.propulsion.level && travel.ly < enemyTravel.ly) {
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
                                                this.talk(`Dispatched ${fleetWithEnoughShips.n} with ${fleetWithEnoughShips.st} and will take ${GameStats.timeToTick(closeStar.eta)}`)
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
                        // console.log('shit im under attack!');
                        //check if star has enough to fight with now and when ship arrives
                        //do I have a near by star to with a carrier to help
                        //do i need to retreat?
                    }
                })
            }
        });
    }
}