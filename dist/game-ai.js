var Api = {
    isProd(){
        return location.hostname.includes('np.');
    },
    reload(){
       // this.request('full_universe_report');
       console.log('reload')
       if(window.$)$('.widget').click();
    },
    transferRequest(fleet,ships){
        console.log(fleet);
        this.request("ship_transfer," + fleet.uid + "," + ships); 
    },
    fleetOrders(fleet){
        let isLooping = 0; //1 for looping;
        let o = [];
        let a = [];
        let i = [];
        let s = [];
        fleet.o.forEach(order =>{
            o.push(order[0]);
            a.push(order[1]);
            i.push(order[2]);
            s.push(order[3]);
        });
        if(o.length) {
            this.request( "add_fleet_orders," + fleet.uid + "," + o.join("_") + "," + a.join("_") + "," + i.join("_") + "," + s.join("_") + "," + isLooping);
        }
        if(fleet.loop != 1)
        {
            this.request("clear_fleet_orders," + fleet.uid);
        }
    },
    request(order){
        console.log(order)
        jQuery.ajax({
            url: '/trequest/order',
            type:'POST',
            dataType:'json',
            data: {
              type: 'order',
              order: order,
              version:'',
              game_number: NeptunesPride.gameNumber
            },
            success: (e) => {(e)=>{ this.reload(); return 'success ' + e}},
            error: (e) => {(e)=> 'error ' + e},
          }) 
    },
    sendShip(fleet, star){
       if(!this.isProd()) {
          if(window.Simulation)Simulation.sendShip(fleet,star); 
       }else{
           this.fleetOrders(fleet);
       }
    },
    transferShips(star,fleet, ships){
        if(!this.isProd()) {
            if(window.Simulation)Simulation.transferShips(star,fleet,ships); 
         }else{
             this.transferRequest(fleet,ships);
         }
    }
}

var AI = {
    version:0.1,
    state: {
        aiMode: false,
        transcript: [],
    },
    clean() {
        this.alreadyTrackingFleets = {};
    },
    init() {
        console.log(`version: ${this.version}`)
        localStorage.clear();
        setInterval(Api.reload, (1000 * 60) * 5);
        this.timer = setInterval(() => {
        if (!NeptunesPride.universe.galaxy) return;
        if (this.state.aiMode) this.checkStarUnderAttack();
        this.allPlayerStats();
        this.starsInfo();
        if (window.GameUI) GameUI.update();
        }, 1000);

    },
    toggle() {
        this.state.aiMode = !this.state.aiMode;
        console.log('ai mode is', this.state.aiMode)
    },
    stop() {
        clearInterval(this.timer);
    },
    calcUCEUpgrade(total, r) {
        return Math.floor(2.5 * NeptunesPride.gameConfig.developmentCostEconomy * (total + 1) / (r / 100))
    },
    calcUCE(t, r) {
        return Math.floor(2.5 * NeptunesPride.gameConfig.developmentCostEconomy * (t.e + 1) / ((r !== undefined ? r : t.r) / 100))
    }
    ,
    calcUCI(t, r) {
        return Math.floor(5 * NeptunesPride.gameConfig.developmentCostIndustry * (t.i + 1) / ((r !== undefined ? r : t.r) / 100))
    }
    ,
    calcUCS(t, r) {
        return Math.floor(20 * NeptunesPride.gameConfig.developmentCostScience * (t.s + 1) / ((r !== undefined ? r : t.r) / 100))
    }
    ,
    calcUCG(t, r) {
        return 0 === NeptunesPride.gameConfig.buildGates ? 0 : Math.floor(100 * NeptunesPride.gameConfig.buildGates / ((r !== undefined ? r : t.r) / 100))
    },
    getMyStars() {
        const collection = [];
        Object.keys(NeptunesPride.universe.galaxy.stars).forEach(key => {
            const star = NeptunesPride.universe.galaxy.stars[key];
            if (star.puid == NeptunesPride.universe.galaxy.player_uid) collection.push(stars);
        });
        return collection;
    },
    comparePlayers(){
        const info = [];
        let numberOfPlayers = 0;
        const counts = {
            weapons:0,
            ships:0,
            cash:0,
        };
        Object.keys(NeptunesPride.universe.galaxy.players).forEach(key => {
            const player = NeptunesPride.universe.galaxy.players[key];
            if(player.uid === NeptunesPride.universe.galaxy.player_uid) return;
            const economyPerProdFromStars = player.total_economy * 10;
            const bankingBonus = player.tech.banking.level * 75;
            const me = NeptunesPride.universe.galaxy.players[NeptunesPride.universe.galaxy.player_uid];
            const weapons = me.tech.weapons.level - player.tech.weapons.level;
            const ships=  me.total_strength - player.total_strength;
            const cash = ((me.total_economy * 10) + (me.tech.banking.level * 75)) - (economyPerProdFromStars + bankingBonus);
           info.push({
               playerName: player.alias,
               cash,
               economy: me.total_economy - player.total_economy,
               fleets: me.total_fleets - player.total_fleets,
               industry: me.total_industry - player.total_industry,
               science: me.total_science - player.total_science,
               stars: me.total_stars - player.total_stars,
               ships,
               weapons,
               range: me.tech.propulsion.level - player.tech.propulsion.level,
               scanning: me.tech.scanning.level - player.tech.scanning.level,
               manufacturing: me.tech.manufacturing.level - player.tech.manufacturing.level,
           });
           if(weapons < 0)counts.weapons++;
           if(ships < 0)counts.ships++;
           if(cash < 0)counts.cash++;
           numberOfPlayers++;
        });
        const recommendations = [];
        
        if(counts.weapons && counts.ships){
            recommendations.push('At least one of our enemies has more ships and weapons. Need to increase production as our enemies are getting stronger than us.')
        }
        if(counts.weapons){
            recommendations.push(
                counts.weapons == numberOfPlayers ?
                `We should focus reasearch on weapons or trade for it. We're behind all players in this tech` :
                `We're falling behind on weapons tech. We need to consider researching weapons in the next few cycles`
            );
        }
        if(counts.cash){
            recommendations.push(
                counts.cash == numberOfPlayers ?
                `We need to invest in economy and banking as all other players have more cash than us.` :
                `We're falling behind on cash. We need to consider researching banking in the next few cycles or increase economy`
            );
        }
        if(counts.ships){
            recommendations.push(
                counts.ships == numberOfPlayers ?
                `We need to invest in manufactoring and industry as all other players have more ships than us.` :
                `We're falling behind on ships. We need to consider researching manufactoring in the next few cycles or increase industry`
            );
        }

       return {
           compare: info,
           recommendations,
        };
    },
    upgradeData() {
        const collection = [];
        const toNextTechLevel = [];
        const nextTechLevel = 1;
        let totalTerraFormedResources = 0;
        let totalNaturlResources = 0;
        let totalCostForEconomy = 0;

        let totalCostForIndustry = 0;
        let totalCostForScience = 0;
        let totalCostForGate = 0;
        let totalCostForEconomyAfterUpgrade = 0;
        let totalCostForIndustryAfterUpgrade = 0;
        let totalCostForScienceAfterUpgrade = 0;
        let totalCostForGateAfterUpgrade = 0;
        const player = NeptunesPride.universe.galaxy.players[NeptunesPride.universe.galaxy.player_uid];
        Object.keys(NeptunesPride.universe.galaxy.stars).forEach(key => {
            const star = NeptunesPride.universe.galaxy.stars[key];
            if (star.puid !== NeptunesPride.universe.galaxy.player_uid) return;

            totalTerraFormedResources += star.r;
            totalNaturlResources += star.nr;
            totalCostForEconomy += this.calcUCE(star);
            totalCostForEconomyAfterUpgrade += this.calcUCE(star, ((player.tech.terraforming.level + 1) * 5) + star.nr);
            totalCostForIndustryAfterUpgrade += this.calcUCI(star, ((player.tech.terraforming.level + 1) * 5) + star.nr);
            totalCostForScienceAfterUpgrade += this.calcUCS(star, ((player.tech.terraforming.level + 1) * 5) + star.nr);
            totalCostForGateAfterUpgrade += this.calcUCG(star, ((player.tech.terraforming.level + 1) * 5) + star.nr);
            totalCostForIndustry += this.calcUCI(star);
            totalCostForScience += this.calcUCS(star);
            totalCostForGate += this.calcUCG(star);

        });
       return {
            economy:{
                currentTotalCost: `$${totalCostForEconomy}`,
                upgrade: `$${totalCostForEconomyAfterUpgrade}`,
                saving: `${((1 - (totalCostForEconomyAfterUpgrade/ totalCostForEconomy)) * 100).toFixed(1)}%`,
            },
            industry:{
                currentTotalCost: `$${totalCostForIndustry}`,
                upgrade: `$${totalCostForIndustryAfterUpgrade}`,
                saving: `${((1 - (totalCostForIndustryAfterUpgrade/ totalCostForIndustry)) * 100).toFixed(1)}%`,
            },
            science:{
                currentTotalCost: `$${totalCostForScience}`,
                upgrade: `$${totalCostForScienceAfterUpgrade}`,
                saving: `${((1 - (totalCostForScienceAfterUpgrade/ totalCostForScience)) * 100).toFixed(1)}%`,
            },
            gate:{
                currentTotalCost: `$${totalCostForGate}`,
                upgrade: `$${totalCostForGateAfterUpgrade}`,
                saving: `${((1 - (totalCostForGateAfterUpgrade/ totalCostForGate)) * 100).toFixed(1)}%`,
            },
            manufactoring: {
                level: player.tech.manufacturing.level,
                currentShipsPerHour: Math.round((player.total_industry * (player.tech.manufacturing.level + 5)) / 24),
                upgradeShipsPerHour: Math.round((player.total_industry * ((player.tech.manufacturing.level + 1) + 5)) / 24),
            },
            banking: {
                level: player.tech.banking.level,
               currentPerProd: (player.total_economy * 10) + ( player.tech.banking.level * 75),
                upgradePerProd:  (player.total_economy * 10) + ( (player.tech.banking.level + 1) * 75),
            },
        };
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
                uid: player.uid,
                player: player.alias,
                bankingPerProd: economyPerProdFromStars + bankingBonus,
                shipsPer30Mins: Math.round((player.total_industry * (player.tech.manufacturing.level + 5)) / 24),
                experimentationPoints: player.tech.research.level * 72,
                experimentationPointsTime: NeptunesPride.universe.timeToTick(player.tech.research.level * 72),
                hyperspaceRange: player.tech.propulsion.level + 3 + ' ly',
                scanning: player.tech.scanning.level + 2 + ' ly',
            });

            const tech = {
                player: player.alias,
            };
            Object.keys(player.tech).forEach(k => {
                tech[k] = {
                    currentLevel: player.tech[k].level,
                    timeToNext: NeptunesPride.universe.timeToTick(((player.tech[k].level - (nextTechLevel - 1)) * 144) - (player.tech[k].research !== undefined ? player.tech[k].research : 0)),

                }
            })

            toNextTechLevel.push(tech);

        });
        // console.table(collection);
        // console.table(toNextTechLevel);
        return {
            players: collection,
            toNextTechLevel,
        }
    },
    starsInfo() {
        const info = {};
        const enemyRange = [];
        const myId = NeptunesPride.universe.galaxy.player_uid;
        const myPlayer = NeptunesPride.universe.galaxy.players[myId];
        Object.keys(NeptunesPride.universe.galaxy.stars).forEach(key => {
            const star = NeptunesPride.universe.galaxy.stars[key];
            if (star.puid >= 0) {
                //which are hig resourced planets 
                const player = NeptunesPride.universe.galaxy.players[star.puid];
                info[player.uid] = info[player.uid] ? info[player.uid] : {
                    player: player.alias,
                    topStars: [],
                    inRangeForAttack: []
                }
                if (star.nr >= 40 || star.n >= 40) info[player.uid].topStars.push({
                    name: star.n,
                    NaturalResource: star.nr,
                    Terraformed: star.r,
                });
                if (star.puid !== NeptunesPride.universe.galaxy.player_uid) {
                    Object.keys(NeptunesPride.universe.galaxy.stars).forEach(k => {
                        const rangeStar = NeptunesPride.universe.galaxy.stars[k];
                        if (rangeStar.puid == NeptunesPride.universe.galaxy.player_uid) {
                            if (this.isInRange(star, rangeStar, player.tech.propulsion.value)) {
                                info[player.uid].inRangeForAttack.push({
                                    enemyStar: {
                                        owner: NeptunesPride.universe.galaxy.players[star.puid].alias,
                                        starName: star.n,
                                        NaturalResource: star.nr,
                                        Terraformed: star.r,
                                        ships: this.getShipsOnOrbitingFleets(star).totalShips + star.st,
                                        myStar: rangeStar.n,
                                    },
                                    myStar: {
                                        owner: NeptunesPride.universe.galaxy.players[rangeStar.puid] ? NeptunesPride.universe.galaxy.players[rangeStar.puid].alias : 'unknown',
                                        starName: rangeStar.n,
                                        NaturalResource: rangeStar.nr,
                                        Terraformed: rangeStar.r,
                                        ships: this.getShipsOnOrbitingFleets(rangeStar).totalShips + rangeStar.st
                                    }
                                })
                            }

                        }
                    });
                } else {
                    Object.keys(NeptunesPride.universe.galaxy.stars).forEach(k => {
                        const rangeStar = NeptunesPride.universe.galaxy.stars[k];
                        if (rangeStar.puid !== NeptunesPride.universe.galaxy.player_uid) {
                            if (this.isInRange(star, rangeStar, player.tech.propulsion.value)) {
                                info[player.uid].inRangeForAttack.push({
                                    myStar: {
                                        owner: NeptunesPride.universe.galaxy.players[star.puid].alias,
                                        starName: star.n,
                                        NaturalResource: star.nr,
                                        Terraformed: star.r,
                                        ships: this.getShipsOnOrbitingFleets(star).totalShips + star.st,
                                    },
                                    enemyStar: {
                                        myStar: star.n,
                                        owner: NeptunesPride.universe.galaxy.players[rangeStar.puid] ? NeptunesPride.universe.galaxy.players[rangeStar.puid].alias : 'unknown',
                                        starName: rangeStar.n,
                                        NaturalResource: rangeStar.nr,
                                        Terraformed: rangeStar.r,
                                        ships: this.getShipsOnOrbitingFleets(rangeStar).totalShips + rangeStar.st
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
    checkTravelCapability(starId, toStarId) {
        const ruler = this.initRuler();
        const star = NeptunesPride.universe.galaxy.stars[starId] || NeptunesPride.universe.galaxy.fleets[starId];
        const toStar = NeptunesPride.universe.galaxy.stars[toStarId];
        ruler.stars.push(toStar)
        const updatedRuler = (this.updateRuler(star, ruler));
        const info = {
            time: this.timeToTick(updatedRuler.eta),
            techLevel: updatedRuler.hsRequired,
            distance: updatedRuler.ly + ' light years',
            ly: updatedRuler.ly,
            eta: updatedRuler.eta,
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
    shipsPerTickByindustry(star, industryLevel, playerId) {
        return this.calcShipsPerTick(star, playerId ? playerId : this.playerId, industryLevel);
    },
    addFleetWaypointByStar(fleetId, starId, fleet) {
        let selectedFleet = fleet ? fleet : this.getFleetById(fleetId);
        this.clearFleetWaypoints(selectedFleet);
        selectedFleet.orders.push([0, starId, 0, 0]);
        selectedFleet.path.push(this.galaxy.stars[starId]);
        return selectedFleet;
    },
    clearFleetWaypoints(selectedFleet) {
        var r = selectedFleet;
        r.orders = [];
        r.path = [];
        return r;
    },
    battle(starId, defending) {
        const star = NeptunesPride.universe.galaxy.stars[starId];
        let attackers = [];
        const defenderInfo = {
            starName: star.n,
            playerName: NeptunesPride.universe.galaxy.players[star.puid] ? NeptunesPride.universe.galaxy.players[star.puid].alias : 'unknown',
            playerWeaponsLevel: NeptunesPride.universe.galaxy.players[star.puid] && NeptunesPride.universe.galaxy.players[star.puid].tech.weapons.level,
            numberOfShips: star.st,
            shipsPer30Mins: NeptunesPride.universe.galaxy.players[star.puid] !== undefined && Number(this.shipsPerTickByindustry(NeptunesPride.universe.galaxy.stars[starId], undefined, star.puid)),
            defenderWeaponTech: NeptunesPride.universe.galaxy.players[star.puid] !== undefined && NeptunesPride.universe.galaxy.players[star.puid].tech.weapons.level + 1,
        }
        if (defending) {

            let shipsCount = defenderInfo.numberOfShips;
            Object.keys(NeptunesPride.universe.galaxy.fleets).forEach(key => {
                const fleet = NeptunesPride.universe.galaxy.fleets[key];
                fleet.o.forEach(waypoint => {
                    const destinationStarId = waypoint[1];
                    if (destinationStarId == star.uid && fleet.puid !== star.puid) {
                        this.addFleetWaypointByStar(fleet.uid, star.uid);
                        const etaParts = this.timeToTick(fleet.etaFirst).split('');
                        const hours = Number(etaParts[0].replace('h', ''));
                        const minuteShips = Number(etaParts[1].replace('m', '')) >= 30 ? 1 : 0;
                        const numberOfShipsOnArrival = shipsCount ? shipsCount + ((defenderInfo.shipsPer30Mins * 2) * hours) + minuteShips : 0;
                        const playerWeaponsLevel = NeptunesPride.universe.galaxy.players[fleet.puid] && NeptunesPride.universe.galaxy.players[fleet.puid].tech.weapons.level;
                        const battleInfo = this.fight(defenderInfo.defenderWeaponTech, playerWeaponsLevel, numberOfShipsOnArrival, fleet.st);
                        shipsCount = battleInfo.defendersShips;
                        let shipsToWin = numberOfShipsOnArrival;
                        if (!battleInfo.defendersShips) {
                            let increment = 1;
                            let potentialDefendersShips = 0;
                            while (!potentialDefendersShips) {
                                potentialBattleInfo = this.fight(defenderInfo.defenderWeaponTech, shipsToWin, playerWeaponsLevel, fleet.st);
                                shipsToWin += increment;
                                potentialDefendersShips = Math.floor(potentialBattleInfo.defendersShips);
                            }
                        }
                        //get playerid and weapons level
                        attackers.push({
                            playerId: NeptunesPride.universe.galaxy.players[fleet.puid].alias,
                            playerWeaponsLevel: playerWeaponsLevel,
                            carrier: fleet.n,
                            numberOfShips: fleet.st,
                            arrivalTime: this.timeToTick(fleet.etaFirst),
                            eta: fleet.etaFirst,
                            defenderShipsOnArrival: numberOfShipsOnArrival,
                            // battleInfo:battleInfo,
                            totalShipsNeeded: shipsToWin,
                            minimumExtraShipsRequired: Math.floor(shipsToWin - numberOfShipsOnArrival),
                        });

                    }
                })
            });
        }
        attackers = attackers.sort((a, b) => a.eta - b.eta).map(item => {
            const { eta, ...rest } = item;
            return rest;
        });

        return attackers;
    },
    fight(defenderWeaponsTech, defendersShips, attackersWeaponsTech, attackersShips) {
        for (var a = ""; !a;) {
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
            attackersShips: attackersShips < 0 ? 0 : attackersShips,
            defendersShips: defendersShips < 0 ? 0 : defendersShips,
        }
    },
    getMyStars() {
        const collection = {};
        Object.keys(NeptunesPride.universe.galaxy.stars).forEach(key => {
            const star = NeptunesPride.universe.galaxy.stars[key];
            if (star.puid === NeptunesPride.universe.galaxy.player_uid) collection[key] = NeptunesPride.universe.galaxy.stars[key];
        });
        return collection;
    },
    timeToTick(t) {
        return NeptunesPride.universe.timeToTick(t)
    },
    distance(e, t, r, n) {
        var o = Math.sqrt((e - r) * (e - r) + (t - n) * (t - n));
        return o
    },
    calcShipsPerTick(starId, playerId, industryLevel) {
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
        this.state.transcript.push(message.toUpperCase());
        if (this.state.transcript.length > 10) this.state.transcript.shift();
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
            const myStar = NeptunesPride.universe.galaxy.stars[key];
            if (myStar.uid === star.uid) return;
            const travel = this.checkTravelCapability(myStar.uid, key);
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
    checkPlayerNotifications() {
        const storedInfo = localStorage.getItem('player-intel');
        const previousData = storedInfo ? JSON.parse(storedInfo) : undefined;
        const currentData = {};
        const notifications = [];
        Object.keys(NeptunesPride.universe.galaxy.players).forEach(key => {
            const player = NeptunesPride.universe.galaxy.players[key];
            if (previousData) {
                Object.keys(player.tech).forEach(t => {
                    if (player.tech[t].level > previousData[key].tech[t]) {
                        notifications.push(`<span class="orange-color">${player.alias}</span> has increased <span class="orange-color">${t}</span> to <span class="orange-color">${player.tech[t].level}</span>`)
                    }
                });

            }
            currentData[key] = {
                tech: {
                    banking: player.tech.banking.level,
                    manufacturing: player.tech.manufacturing.level,
                    propulsion: player.tech.propulsion.level,
                    research: player.tech.research.level,
                    weapons: player.tech.weapons.level,
                    scanning: player.tech.scanning.level,
                    terraforming: player.tech.terraforming.level,
                },
                total_economy: player.total_economy,
                total_fleets: player.total_fleets,
                total_industry: player.total_industry,
                total_science: player.total_science,
                total_stars: player.total_stars,
                total_strength: player.total_strength,
            }
        });
        if (!previousData) localStorage.setItem('player-intel', JSON.stringify(currentData));
        return notifications;
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
                    if (defendingStar && defendingStar.puid == NeptunesPride.universe.galaxy.player_uid) {
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
    },
    strategy: {
        beginning: [
            'beginning is the first 2-3 cycles',
            'build and spend on fleets. explore and capture planets with resources higher than 10',
            'ships are not important at this stage',
            'Protest the borders',
            'invest in economy and science',
            'research terraforming and banking then weapons',
        ],
        midGame: [
            'mid game is the next 2-3 cycles',
            'catchup on ships',
            'manufactoring is better than terraforming when planets get captured so switch to manufactoring',
            'research on weapons and manufactoring',
        ],
    }
}


var GameUI = {
  colors: {
    darkBlue: "#1A1D44",
    black: "#000000",
    yellow: "#FF9000",
  },
  container: null,
  css: `
    :root{
        --blue:rgba(0, 159, 223, 1);
    }
    .orange-color {
            color: orange;
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
      }
      
      .switch input { 
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
      }
      
      .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
      }
      
      input:checked + .slider {
        background-color:var(--blue);
      }
      
      input:focus + .slider {
        box-shadow: 0 0 1pxvar(--blue);
      }
      
      input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
      }
      
      /* Rounded sliders */
      .slider.round {
        border-radius: 34px;
      }
      
      .slider.round:before {
        border-radius: 50%;
      }
    #gamestats-button {
        position:absolute;
        right: 20px;
        top:20px;
        z-index:9999;
        background: #5961bb;
        border-radius: 4px;
        width:32px;
        height:32px;
        cursor:pointer;
    }
    #gamestats-button:hover{
        background: #ff9000;
    }
    .navigate-solid.icon {
        color: #fff;
        position: absolute;
        margin-left: 12px;
        margin-top: 3px;
        width: 14px;
        height: 18px;
        -webkit-transform: rotate(45deg);
                transform: rotate(45deg);
      }
      
      .navigate-solid.icon:before {
        content: '';
        position: absolute;
        left: 0;
        top: -17px;
        width: 0;
        height: 0;
        border-top: solid 18px transparent;
        border-bottom: solid 18px currentColor;
        border-left: solid 7px transparent;
        border-right: solid 7px transparent;
      }
      
      .navigate-solid.icon:after {
        content: '';
        position: absolute;
        left: 0;
        top: 9px;
        width: 0;
        height: 0;
        color: white;
        border-top: solid 5px transparent;
        border-bottom: solid 5px currentColor;
        border-left: solid 7px transparent;
        border-right: solid 7px transparent;
      }

      #game-stats-ui {
        display:flex;
      }
     .hide {
          display:none !important;
      }
      
      #gs-content-container {
          width:100%;
      }
      .subtitle{
        padding-left: 20px;
        font-size: 22px;
      }
      .section label {
          margin-left:20px;
          margin-right: 20px;
      }
      .select-holder 
      {
        padding: 20px;
      }
      .gs-details{
          padding:20px;
      }
      td{
        padding: 5px 15px;
      }
      #StarTravel-section .select-holder {
          display:inline-block;
      }
      .gs-close {
          position:relative;
        width: 20px;
        height: 20px;
        opacity: 0.3;
      }
      .gs-close:hover {
        opacity: 1;
      }
      .gs-close:before, .gs-close:after {
        position: absolute;
        left: 15px;
        content: ' ';
        height: 20px;
        width: 2px;
        background-color: white;
      }
      .gs-close:before {
        transform: rotate(45deg);
      }
      .gs-close:after {
        transform: rotate(-45deg);
      }
      .tab-holder {
          display:flex;
          margin-right: 25px;
      }
      .ai-button{
        // border: 2px solid;
       
        // margin-top: 20px;
        // margin-left: 20px;
        // background: rgba(84,186,217);
        // color: white;
        // TEXT-ALIGN: center;
        // vertical-align: middle;
        // padding: 5px 10px;
      }
      .ai-button{
        position: relative;
          display:block;
          background: transparent;
          width:200px;
          height:30px;
          line-height:60px;
          text-align:center;
          font-size:15px;
          text-decoration:none;
          text-transform:uppercase;
          margin:40px auto;
          margin-left: 25px;
          z-index: 1;
          margin-top: -10px;
          background: rgba(0,0,0,0.5);
      }
      .ai-button:before, .ai-button:after {
          width:200px;
        left: 0px;
          height:27px;
          z-index: -1;
      }
    .selected:before,.selected:after {
        border: 3px solid orange;
    }
    .orange:before,.orange:after {
        border: 3px solid orange;
    }
    .orange:hover:before, .orange:hover:after {
        background: orange;
    }
    .blue:before,.blue:after {
        border: 3px solid  var(--blue);
    }
    .blue:hover:before, .blue:hover:after {
        background:  var(--blue);
    }
        .ai-button:before{
            position: absolute;
            content: '';
            border-bottom: none;
            -webkit-transform: perspective(15px) rotateX(5deg);
            -moz-transform: perspective(15px) rotateX(5deg);
            transform: perspective(15px) rotateX(5deg);  
          }
          .ai-button:after{
            position: absolute;
            top: 32px;
            content: '';
            border-top: none;
            -webkit-transform: perspective(15px) rotateX(-5deg);
            -moz-transform: perspective(15px) rotateX(-5deg);
            transform: perspective(15px) rotateX(-5deg);
          }
    .section-title {
        font-size:23px;
    }
    .box-section {
        border: 3px solid var(--blue);
        min-height: 100px;
        background: rgba(0, 159, 223, 0.3);
    }
    ::-webkit-scrollbar {
        width: 10px;
    }
      
      /* Track */
      ::-webkit-scrollbar-track {
        background:  rgba(0, 159, 223, 0.3);; 
      }
       
      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: var(--blue); 
      }
      
      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        background:var(--blue); 
      }
      .player-info,.star-info, .ai-info, .finance-info {
          display:none;
      }
      .show {
          display:block;
      }
      .ai-toggle-holder {
        display: flex;
        justify-content: flex-end;
        padding: 20px;
        align-items: center;
      }
      .notify-item, .trans-item {
        padding: 10px;
        border-bottom: 2px solid var(--blue);
        display:flex;
      }
      .notify-item .title{
          flex:1
      }
      .notif-section .box-section, .trans-section .box-section {
        height: 200px;
        overflow: auto;
      }
      .notification-close {
          cursor:pointer;
      }
      .avatar {
        position: absolute;
        right: 30px;
        top: -20px;
        width: 85px;
        border: 3px solid var(--blue);
      }
      .player-holder {
        position: relative;
        padding: 20px;
        margin-top: 20px;
      }
      .player-holder .box-section {
          padding-top:20px;
      }
      .rec-section {
        position: relative;
        margin-top: 20px;
      }
      .rec-section .box-section {
        margin-top: 10px;
      }

      #game-stats-ui::after {
          content :$version;
          position:absolute;
          font-size: 11px;
        color: white;
        left: 20px;
        bottom: 0;
      }
    `,
  state: {
    show: false,
    showPlayer: false,
    showStar: false,
    showAi: false,
    showFinance: true,
    triggerPlayerInfo: false,
  },
  previousPlayerInfo: {},
  previousFinanceInfo: {},
  previousStarInfo: {},
  previousNotificationInfo: {},
  previousTranscript: [],
  previousRecommendations: [],
  showButton: null,
  isProd() {
    return location.hostname.includes("np.");
  },
  init() {
    if (document.querySelector("#game-stats-ui")) this.update();
    if (this.isProd()) {
      this.create();
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        this.onLocalLoad.bind(this)
      );
    }
  },
  onLocalLoad() {
    this.create();
  },
  create() {
    this.createContainer();
    // this.createNotificationInfo();
    this.createPlayerInfo();
    // this.createPlayersInfo();
    // this.createTechInfo();
    this.createStarInfo();
    this.createAiInfo();
    this.createFinanceInfo();
    // this.createStarDetail();
    // this.createStarBattle();
    // this.createStarTravel();
  },
  clean() {
    if (!document.querySelector("#gamestats-style")) return;
    document.body.removeChild(document.querySelector("#game-stats-ui"));
    document.body.removeChild(document.querySelector("#gamestats-button"));
  },
  update() {
    // this.createNotificationInfo();
    this.createPlayerInfo();
    this.createStarInfo();
    this.createAiInfo();
    this.createFinanceInfo();
    // this.createPlayersInfo();
    // this.createTechInfo();
    // this.createStarInfo();
  },
  createContainer() {
    this.container = document.createElement("div");
    this.container.id = "game-stats-ui";
    this.container.className = this.state.show ? "" : "hide";
    this.container.style = `
        min-width: 50vw;
        height: 60vh;
        position: absolute;
        top: 10vh;
        right: 20px;
        background: rgba(0,0,0,0.7);
        font-family: OpenSansRegular, sans-serif;
        font-size: 16px;
        color: white;
        
        align-items:flex-start;
        align-content:flex-start;
        flex-direction: column;
        border: 3px solid var(--blue);
        padding-bottom: 20px;
        `;
    const style = document.createElement("style");
    style.innerHTML = this.css.replace("$version", `"version:${AI.version}"`);
    style.id = "gamestats-style";
    this.container.appendChild(style);
    this.container.appendChild(this.createSectionTitle("Game AI"));
    const tabHolder = this.createElement(
      "div",
      `
       
        `,
      `
        <div class=" ai-button selected" data-target="finance">FINANACE</div>
        <div class=" ai-button blue" data-target="player">PLAYER INFO</div>
        <div class=" ai-button blue" data-target="stars">STAR INFO</div>
        <div class=" ai-button blue" data-target="ai">AI</div>
        
        `,
      undefined,
      "tab-holder"
    );
    tabHolder.onclick = (event) => {
      this.contentContainer.scrollTop = 0;
      document
        .querySelector('[data-target="stars"]')
        .classList.remove("selected");
      document
        .querySelector('[data-target="player"]')
        .classList.remove("selected");
      document.querySelector('[data-target="ai"]').classList.remove("selected");
      document
        .querySelector('[data-target="finance"]')
        .classList.remove("selected");

      document.querySelector('[data-target="stars"]').classList.add("blue");
      document.querySelector('[data-target="player"]').classList.add("blue");
      document.querySelector('[data-target="ai"]').classList.add("blue");
      document.querySelector('[data-target="finance"]').classList.add("blue");

      document.querySelector(".player-info").classList.remove("show");
      document.querySelector(".star-info").classList.remove("show");
      document.querySelector(".ai-info").classList.remove("show");
      document.querySelector(".finance-info").classList.remove("show");

      switch (event.srcElement.getAttribute("data-target")) {
        case "player":
          document.querySelector(".player-info").classList.add("show");
          document
            .querySelector('[data-target="player"]')
            .classList.remove("blue");
          document
            .querySelector('[data-target="player"]')
            .classList.add("selected");
          this.state.triggerPlayerInfo = true;
          break;
        case "stars":
          document.querySelector(".star-info").classList.add("show");
          document
            .querySelector('[data-target="stars"]')
            .classList.remove("blue");
          document
            .querySelector('[data-target="stars"]')
            .classList.add("selected");
          break;
        case "ai":
          document.querySelector(".ai-info").classList.add("show");
          document.querySelector('[data-target="ai"]').classList.remove("blue");
          document
            .querySelector('[data-target="ai"]')
            .classList.add("selected");
          break;
        case "finance":
          document.querySelector(".finance-info").classList.add("show");
          document
            .querySelector('[data-target="finance"]')
            .classList.remove("blue");
          document
            .querySelector('[data-target="finance"]')
            .classList.add("selected");
          break;
      }
    };
    this.container.appendChild(tabHolder);
    this.contentContainer = this.createElement(
      "div",
      `
        flex: 1;
        overflow:auto;
        `,
      ``,
      "gs-content-container"
    );
    this.container.appendChild(this.contentContainer);
    const button = document.createElement("div");
    button.innerHTML = '<div class="navigate-solid icon"></div>';
    button.id = "gamestats-button";
    button.onclick = this.onToggleShow.bind(this);
    this.showButton = button;
    document.body.appendChild(button);
    document.body.appendChild(this.container);
    document.querySelector(
      "#gamestats-close-button"
    ).onclick = this.onToggleShow.bind(this);
  },
  onToggleShow() {
    this.state.show = !this.state.show;
    this.showButton.classList.toggle("hide");
    this.container.classList.toggle("hide");
  },
  createPlayerInfo() {
    const playerInfo = AI.allPlayerStats();
    if (
      !this.state.triggerPlayerInfo &&
      this.previousPlayerInfo &&
      this.previousPlayerInfo.players &&
      playerInfo
    ) {
      let p = this.previousPlayerInfo.players.map((t) => {
        const { experimentationPointsTime, ...all } = t;
        return all;
      });
      let c = playerInfo.players.map((t) => {
        const { experimentationPointsTime, ...all } = t;
        return all;
      });

      if (JSON.stringify(p) == JSON.stringify(c)) return;
    }
    this.state.triggerPlayerInfo = false;
    const current = document.querySelector(".player-info");
    if (current) current.innerHTML = "";
    const section = current || document.createElement("div");

    if (!current) {
      if (this.state.showPlayer) section.classList.add("show");
      section.classList.add("player-info");
      this.contentContainer.appendChild(section);
    }

    playerInfo.players.forEach((item) => {
      const { uid, ...other } = item;
      const playerSection = this.createBoxSection(
        item.player,
        this.createTableFromObject(other).innerHTML
      );
      playerSection.classList.add("player-holder");
      const avatar = document.createElement("img");
      avatar.src = Helper.getPlayerAvatar(item.uid);
      avatar.className = "avatar";
      playerSection.appendChild(avatar);
      section.appendChild(playerSection);
    });
    playerInfo.toNextTechLevel.forEach((item) => {
      section.appendChild(
        this.createBoxSection(
          `${item.player} Potential Tech`,
          this.createTableFromObject(item).innerHTML
        )
      );
    });
    this.previousPlayerInfo = playerInfo;
  },
  createStarInfo() {
    const starInfo = AI.starsInfo();
    if (JSON.stringify(starInfo) == JSON.stringify(this.previousStarInfo))
      return;
    const current = document.querySelector(".star-info");
    if (current) current.innerHTML = "";
    const section = current || document.createElement("div");

    if (!current) {
      section.classList.add("star-info");
      this.contentContainer.appendChild(section);
    }

    Object.keys(starInfo).forEach((key) => {
      const info = starInfo[key];
      section.appendChild(
        this.createBoxSection(
          `${info.player}'s Top Stars`,
          this.createTableFromObject(
            info.topStars,
            this.getTableRowsFromArray.bind(this)
          ).innerHTML
        )
      );

      let inRangeHtml = "";
      inRange = {};
      info.inRangeForAttack.forEach((ir) => {
        inRange[ir.myStar.starName] = inRange[ir.myStar.starName] || [];
        inRange[ir.myStar.starName].push(ir.enemyStar);
      });
      Object.keys(inRange).forEach((k) => {
        inRangeHtml += this.createTableFromObject(
          inRange[k],
          this.getTableRowsFromArray.bind(this)
        ).innerHTML;
      });
      section.appendChild(
        this.createBoxSection(
          `${info.player}'s Stars In Range for Attack`,
          inRangeHtml
        )
      );
    });
    this.previousStarInfo = starInfo;
  },
  createAiInfo() {
    const notifications = AI.checkPlayerNotifications();
    const transcript = [...AI.state.transcript];
    const recommendations = AI.comparePlayers().recommendations;

    if (
      this.previousRecommendations.length &&
      JSON.stringify(this.previousRecommendations) ==
        JSON.stringify(recommendations) &&
      this.previousTranscript.length &&
      JSON.stringify(this.previousTranscript) == JSON.stringify(transcript) &&
      JSON.stringify(notifications) ==
        JSON.stringify(this.previousNotificationInfo)
    )
      return;

    const current = document.querySelector(".ai-info");
    const section = current || document.createElement("div");

    if (!current) {
      if (this.state.showAi) section.classList.add("show");
      section.classList.add("ai-info");
      section.innerHTML = `
            <div class="ai-toggle-holder">
            <span style="margin-right:20px;">turn on</span>
            <label class="switch">
            <input type="checkbox" ${AI.state.aiMode ? "checked" : ""}>
            <span class="slider round"></span>
            </label>
            </div>
            `;
      section.querySelector("input").onchange = (e) => {
        AI.toggle();
        section.querySelector("input").checked = AI.state.aiMode;
      };
      this.contentContainer.appendChild(section);
    }

    //recommendations
    let recHTML = "";
    recommendations.forEach((item, index) => {
      recHTML += `
            <div class="trans-item"><span class="title">${item}</span></div>
            `;
    });
    const currentRecSection = section.querySelector(".rec-section");
    if (!currentRecSection) {
      const recSection = this.createBoxSection("RECOMMENDATIONS", recHTML);
      recSection.classList.add("rec-section");
      section.appendChild(recSection);
      const img = new Image();
      img.classList.add("avatar");
      img.src =
        "https://lh5.googleusercontent.com/iOPRLD48c3SqrWdlqQy5WjHWXob-fWaW28U_afLxGWHvMkaOONtYh1-A8qSiOtAf_1yytVcRbu7J4Y2d9jhE=w1920-h969";
      recSection.appendChild(img);
    } else {
      currentRecSection.querySelector(".box-section").innerHTML = recHTML;
    }

    //
    const currentNotificationSection = section.querySelector(".notif-section");

    notificationHTML = "";
    notifications.forEach((item, index) => {
      notificationHTML += `
           <div class="notify-item"><span class="title">${item}</span></div>
           `;
    });
    if (!currentNotificationSection) {
      const notificationSection = this.createBoxSection(
        "INBOX",
        notificationHTML
      );
      notificationSection.classList.add("notif-section");
      section.appendChild(notificationSection);
    } else {
      currentNotificationSection.querySelector(
        ".box-section"
      ).innerHTML = notificationHTML;
    }

    Array.prototype.forEach.call(
      section.querySelectorAll(".notification-close"),
      (item) => {
        item.onclick = () => {
          // const index =item.getAttribute('data-index');
        };
      }
    );
    let transHTML = "";
    transcript.forEach((item, index) => {
      transHTML += `
            <div class="trans-item"><span class="title">${item}</span></div>
            `;
    });
    const currentTranscriptSection = section.querySelector(".trans-section");
    if (!currentTranscriptSection) {
      const transSection = this.createBoxSection("TRANSCRIPT", transHTML);
      transSection.classList.add("trans-section");
      section.appendChild(transSection);
    } else {
      currentTranscriptSection.querySelector(
        ".box-section"
      ).innerHTML = transHTML;
    }

    this.previousNotificationInfo = notifications;
    this.previousTranscript = transcript;
    this.previousRecommendations = recommendations;
  },
  createFinanceInfo() {
    const info = AI.upgradeData();
    if (JSON.stringify(this.previousFinanceInfo) == JSON.stringify(info))
      return;
    const current = document.querySelector(".finance-info");
    if (current) current.innerHTML = "";
    const section = current || document.createElement("div");

    if (!current) {
      section.classList.add("show");
      section.classList.add("finance-info");
      this.contentContainer.appendChild(section);
    }
    section.appendChild(
      this.createBoxSection(
        "Banking Income After Upgrade",
        this.createTableFromObject({
          currentPerProd: `$${info.banking.currentPerProd}`,
          currentLevel: `${info.banking.level}`,
          onUpgradePerProd: `$${info.banking.upgradePerProd}`,
        }).innerHTML
      )
    );
    section.appendChild(
      this.createBoxSection(
        "Manufactoring After Upgrade",
        this.createTableFromObject({
          currentShipsPerHour: `${info.manufactoring.currentShipsPerHour} ships`,
          currentLevel: `${info.manufactoring.level}`,
          onUpgradeShipsPerHour: `${info.manufactoring.upgradeShipsPerHour} ships`,
        }).innerHTML
      )
    );
    section.appendChild(
      this.createBoxSection(
        "Economy After Terraforming Upgrade",
        this.createTableFromObject({
          currentTotalCost: `${info.economy.currentTotalCost}`,
          onUpgradeTotalCost: `${info.economy.upgrade}`,
          saving: `<span class="orange-color">${info.economy.saving}</span>`,
        }).innerHTML
      )
    );
    section.appendChild(
      this.createBoxSection(
        "Industry After Terraforming Upgrade",
        this.createTableFromObject({
          currentTotalCost: `${info.industry.currentTotalCost}`,
          onUpgradeTotalCost: `${info.industry.upgrade}`,
          saving: `<span class="orange-color">${info.industry.saving}</span>`,
        }).innerHTML
      )
    );
    section.appendChild(
      this.createBoxSection(
        "Science After Terraforming Upgrade",
        this.createTableFromObject({
          currentTotalCost: `${info.science.currentTotalCost}`,
          onUpgradeTotalCost: `${info.science.upgrade}`,
          saving: `<span class="orange-color">${info.science.saving}</span>`,
        }).innerHTML
      )
    );
    section.appendChild(
      this.createBoxSection(
        "Gate After Terraforming Upgrade",
        this.createTableFromObject({
          currentTotalCost: `${info.gate.currentTotalCost}`,
          onUpgradeTotalCost: `${info.gate.upgrade}`,
          saving: `<span class="orange-color">${info.gate.saving}</span>`,
        }).innerHTML
      )
    );
    // playerInfo.players.forEach(item => {
    //
    // })
    // playerInfo.toNextTechLevel.forEach(item => {
    //     section.appendChild(this.createBoxSection(`${item.player} Potential Tech`, this.createTableFromObject(item).innerHTML))
    // })
    this.previousFinanceInfo = info;
  },
  createBoxSection(title, content) {
    return this.createElement(
      "div",
      `
        padding:20px;
        `,
      `
            <span class="section-title">${title}</span>
            <div class="box-section">
            ${content}
            </div>
        `,
      ``,
      ``
    );
  },
  createNotificationInfo() {
    const section = this.createSection("Notification");
    section.style = ` max-height:50vh;
        overflow:auto;`;
    this.updateSection("Notification", section);
    section.querySelector(".gs-subtitle").appendChild(
      this.createElement(
        "button",
        `
            background: #5961bb;
            border-radius: 4px;
            align-self: flex-start;
            margin-top: 20px;
            color:white;
            border:none;
            cursor:pointer;

        `,
        `clear all`,
        `clear-notifications-button`,
        ``
      )
    );
    section.querySelector("#clear-notifications-button").onclick = () => {
      GameStats.clearAllNotifications();
      Array.prototype.forEach.call(
        section.querySelectorAll(".gs-alert"),
        (item) => {
          item.parentNode.removeChild(item);
        }
      );
    };
    const info = {};
    GameStats.notifications.forEach((notification) => {
      if (GameStats.playerId == notification.playerId) return;
      const { playerName, ...n } = notification;
      info[playerName] = info[playerName] || [];
      //console.log('n',n)
      info[playerName].push(n);
    });
    //console.log('createNotificationInfo',info)
    if (!Object.keys(info).length) return;
    Object.keys(info).forEach((key) => {
      section.appendChild(this.createElement("h1", ``, `Player ${key}`));
      info[key].forEach((notification) => {
        Object.keys(notification.star)
          .filter((k) => k !== "starId" && k !== "type")
          .forEach((type) => {
            const star = GameStats.galaxy.stars[notification.star.starId];
            section.appendChild(
              this.createNotificaton(
                `star ${star.n} has increased its ${type} from ${notification.star[type].prevously} to ${notification.star[type].current}`,
                notification.uid
              )
            );
          });
      });
    });
  },
  createNotificaton(message, uid) {
    const alert = this.createElement(
      "div",
      `
        padding: 20px;
        background: red;
        border-bottom:1px solid black;
        display:flex;
        position:relative;
        `,
      `
        <span style="flex:1">${message}</span>
        <div class="gs-close"></div>
        `,
      uid,
      `gs-alert`
    );
    alert.querySelector(".gs-close").onclick = () => {
      GameStats.removedNotification(uid);
      alert.parentNode.removeChild(alert);
    };
    return alert;
  },
  createTechInfo() {
    const section = this.createSection("Tech Production Days");
    this.updateSection("Tech Production Days", section);
    this.contentContainer.appendChild(section);
    const info = GameStats.allTechInfo(GameStats.playerId);
    section.appendChild(this.createTableFromObject(info));
  },
  createPlayersInfo() {
    const section = this.createSection("Players Info");
    this.updateSection("Players Info", section);
    this.contentContainer.appendChild(section);
    const info = GameStats.comparePlayers();
    section.appendChild(
      this.createTableFromObject(info, this.getTableRowsFromArray.bind(this))
    );
  },
  createStarDetail() {
    const section = this.createSection("Star Details");
    const select = this.createElement("select");
    const details = this.createElement(
      "div",
      ``,
      ``,
      "gs-star-details",
      "gs-details"
    );
    const stars = Object.keys(GameStats.Stars).filter((key) => {
      return GameStats.galaxy.stars[GameStats.Stars[key]].st !== undefined;
    });
    let optionsHtml = "<option value=-1></option>";
    stars.forEach((key) => {
      const s = GameStats.getStarById(key);
      optionsHtml += `<option value=${s.uid}>${s.n}</option>`;
    });
    select.innerHTML = optionsHtml;
    select.onchange = this.onStarDetailChange.bind(this);
    const selectHolder = document.createElement("div");
    selectHolder.className = "select-holder";

    const label = document.createElement("label");
    label.innerHTML = "select a star";
    selectHolder.appendChild(label);
    selectHolder.appendChild(select);
    section.appendChild(selectHolder);
    section.appendChild(details);
    this.contentContainer.appendChild(section);
  },
  createStarTravel() {
    const section = this.createSection("Star Travel");
    const options = Object.keys(GameStats.galaxy.stars).map((key) => {
      const star = GameStats.galaxy.stars[key];
      return {
        value: key,
        label: star.n,
      };
    });
    const details = this.createElement(
      "div",
      ``,
      ``,
      "gs-star-travel-details",
      "gs-details"
    );
    section.appendChild(
      this.createSelect(
        "from star",
        options,
        this.onTravelStarSelect.bind(this)
      )
    );
    section.appendChild(
      this.createSelect("to star", options, this.onTravelStarSelect.bind(this))
    );
    section.appendChild(details);
    this.contentContainer.appendChild(section);
  },
  onTravelStarSelect() {
    const section = document.querySelector("#StarTravel-section");
    const selects = section.querySelectorAll("select");
    if (selects[0].value != -1 && selects[1].value != -1) {
      const info = GameStats.checkTravelCapability(
        selects[0].value,
        selects[1].value
      );
      document.querySelector("#gs-star-travel-details").innerHTML = `
                <p>Time: <span style="color:${this.colors.yellow} ">${info.time}</span></p>
                <p>Distance: <span style="color:${this.colors.yellow}">${info.distance}</span></p>
                <p>Tech Level Required: <span style="color:${this.colors.yellow}">${info.techLevel}</span></p>
            `;
    } else {
      document.querySelector("#gs-star-travel-details").innerHTML = ``;
    }
  },
  createStarBattle() {
    const section = this.createSection("Star Battle");
    const options = Object.keys(GameStats.galaxy.stars).map((key) => {
      const star = GameStats.galaxy.stars[key];
      return {
        value: key,
        label: star.n,
      };
    });
    const details = this.createElement(
      "div",
      ``,
      ``,
      "gs-star-battle-details",
      "gs-details"
    );
    section.appendChild(
      this.createSelect(
        "select a star",
        options,
        this.onBattleSelect.bind(this)
      )
    );
    section.appendChild(details);
    this.contentContainer.appendChild(section);
  },
  onBattleSelect(event) {
    const details = document.querySelector("#gs-star-battle-details");
    if (event.target.value == -1) {
      details.innerHTML = "";
      return;
    }
    const info = GameStats.battle(event.target.value, true);
    const innerHTML = this.createTableFromObject(
      info,
      this.getTableRowsFromArray.bind(this)
    ).innerHTML;
    //console.log(info);
    details.innerHTML = info.length ? innerHTML : "No battles found";
  },
  createSelect(text, obj, callback) {
    const selectHolder = document.createElement("div");
    const label = document.createElement("label");
    const select = this.createElement("select");
    selectHolder.className = "select-holder";
    let optionsHtml = "<option value=-1></option>";
    obj.forEach((item) => {
      optionsHtml += `<option value=${item.value}>${item.label}</option>`;
    });
    select.innerHTML = optionsHtml;
    select.onchange = callback;
    label.innerHTML = text;
    selectHolder.appendChild(label);
    selectHolder.appendChild(select);
    return selectHolder;
  },
  onStarDetailChange(event) {
    const details = document.querySelector("#gs-star-details");
    if (event.target.value == -1) {
      details.innerHTML = "";
      return;
    }
    let info = GameStats.galaxy.stars[event.target.value];
    info = {
      Name: info.n,
      Ships: info.st,
      NaturalResource: info.nr,
      TerraformedResource: info.r,
      player: GameStats.getPlayerById(info.puid).alias,
    };
    details.innerHTML = this.createTableFromObject(info).innerHTML;
  },
  updateSection(title, section) {
    const sectionId = `${title.replace(/ /g, "")}-section`;
    const existing = this.contentContainer.querySelector(`#${sectionId}`);
    if (existing) {
      existing.parentNode.replaceChild(section, existing);
    } else {
      this.contentContainer.appendChild(section);
    }
  },
  createSection(title) {
    const sectionId = `${title.replace(/ /g, "")}-section`;
    const section = this.createElement(
      "div",
      `width: 100%; background:${this.colors.darkBlue}`,
      ``,
      sectionId,
      "section"
    );
    const titleElement = this.createSectionSubTitle(title);
    section.appendChild(titleElement);
    return section;
  },
  createSectionTitle(title) {
    return this.createElement(
      "div",
      `
            
            font-size: 28px;
            font-weight: normal;
            line-height: 125%;
            padding: 12px;
            padding-top: 4px;
            padding-bottom: 4px;
            display: flex;
            width:100%;
            box-sizing: border-box;
            justify-content: flex-end
            `,
      `
            <div id="gamestats-close-button" class=" " style="position:relative; margin-top:0; cursor:pointer;
            margin-bottom: 5px;">x</div>
            `
    );
  },
  createSectionSubTitle(title) {
    return this.createElement(
      "div",
      `
            background: ${this.colors.black};
            font-size: 22px;
            color:#FF9000; 
            font-weight: normal;
            line-height: 125%;
            padding: 12px;
            padding-top: 4px;
            padding-bottom: 4px;
            display: flex;
            width:100%;
            box-sizing: border-box;
            `,
      `
            <h1 style="flex:1">${title}</h1>
            `,
      ``,
      `gs-subtitle`
    );
  },
  createElement(tag, style, content, id, className) {
    const element = document.createElement(tag);
    element.className = className ? className : "";
    element.style = style;
    element.id = id || "";
    element.innerHTML = content || "";
    return element;
  },
  createTableFromObject(data, func) {
    const holder = this.createElement(
      "div",
      `
        padding: 20px;
        overflow: auto;
        box-sizing: border-box;
        `
    );
    const table = this.createElement(
      "table",
      `
        color:white;
        width:100%;
       
        `
    );
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);
    let innerHTML = func
      ? func(data, "", thead)
      : `
        `;
    if (!func)
      Object.keys(data).forEach((key) => {
        innerHTML += `
                <tr><td>${this.camelToSpace(key)}</td><td align="right">
                ${
                  typeof data[key] == "object"
                    ? this.createInnerTableString(data[key])
                    : data[key]
                }
                
                </td></tr>
            `;
      });
    tbody.innerHTML = innerHTML;
    holder.appendChild(table);
    return holder;
  },
  getTableRowsFromArray(data, html, thead) {
    if (!data.length) return "";
    let theadHtml = `<tr style="color:${this.colors.yellow}">`;
    Object.keys(data[0]).forEach((key) => {
      theadHtml += `
            <td>${this.camelToSpace(key).replace(/ /g, "<br>")}</td>
        `;
    });
    theadHtml += "</tr>";
    thead.innerHTML = theadHtml;
    data.forEach((item) => {
      html += "<tr>";
      Object.keys(item).forEach((key) => {
        html += `
                    <td>${item[key]}</td>
                `;
      });
      html += "</tr>";
    });
    return html;
  },
  camelToSpace(key) {
    return String(key)
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, function (str) {
        return str.toUpperCase();
      });
  },
  createInnerTableString(data) {
    let thead =
      '<table style="width: 100%; color: white;text-align: center;"><thead><tr>';
    let tbody = "<tbody><tr>";
    Object.keys(data).forEach((key) => {
      thead += `<td style="color:${this.colors.yellow};">${this.camelToSpace(
        key
      )}</td>`;

      tbody += `<td>${this.camelToSpace(data[key])}</td>`;
    });
    thead += "</tr></thead>";
    tbody += "</tr></tbody></table>";
    return thead + tbody;
  },
};


var Helper = {
    Stars:{},
    Fleets:{},
    Players:{},
    isProd() {
        return location.hostname.includes('np.');
    },
    init(){
        Object.keys(NeptunesPride.universe.galaxy.stars).forEach(key => {
            this.Stars[NeptunesPride.universe.galaxy.stars[key].n.replace(/ /g, '_')] = NeptunesPride.universe.galaxy.stars[key].uid;
        });
        Object.keys(NeptunesPride.universe.galaxy.fleets).forEach(key => {
            this.Fleets[NeptunesPride.universe.galaxy.fleets[key].n.replace(/ /g, '_')] = NeptunesPride.universe.galaxy.fleets[key].uid;
        });
        Object.keys(NeptunesPride.universe.galaxy.players).forEach(key => {
            this.Players[NeptunesPride.universe.galaxy.players[key].alias.replace(/ /g, '_')] = NeptunesPride.universe.galaxy.players[key].uid;
        });
    },
    getStarByName(uid){
        return Object.keys(NeptunesPride.universe.galaxy.stars).map(key =>{
            return NeptunesPride.universe.galaxy.stars[key];
        }).find(item => {
            return item.uid == Number(uid);
         });
    },
    getFleetByName(uid){
        return Object.keys(NeptunesPride.universe.galaxy.fleets).map(key =>{
            return NeptunesPride.universe.galaxy.fleets[key];
        }).find(item => {
            return item.uid == Number(uid);
         });
    },
    getPlayerByName(uid){
        return Object.keys(NeptunesPride.universe.galaxy.players).map(key =>{
            return NeptunesPride.universe.galaxy.players[key];
        }).find(item => {
            return item.uid == Number(uid);
         });
    },
    getPlayerAvatar(playerId){
        const imagePrefix = this.isProd() ? '../images/avatars/160/' : 'img/';
        const player = NeptunesPride.universe.galaxy.players[playerId];
        return player ? `${imagePrefix}${player.avatar}.jpg` : ''; 
    }
};

AI.init();
GameUI.init();
Helper.init();