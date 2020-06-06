var GameStats = {
    Stars:{

    },
    MyStars:{},
    Fleets:{},
    MyFleets:{},
    StarProperties:{
        Ships: 'st',
        NaturalResource: 'nr',
        TerraformedResource: 'r',
        Industry: 'i',
    },
    Colors:{
        Grey:'#e4e4e4',
        Black:'#222'
    },
    FleetObject:{
        uid:0,
        l:0,
        o:[],
        n:'',
        puid:0,
        w:0,
        y:"0",
        x:"0",
        st:12,
        lx:"-0.70103891",
        ly:"0.64907724"
    },
    Tech:{},
    canvas: null,
    context:null,
    galaxy:null,
    playerId:null,
    notifications:[],
    version:'0.1',
    init(){
        if(this.isProd()) {
              this.getData();
        }else{
            document.addEventListener('DOMContentLoaded', this.onLocalLoad.bind(this));

        }
    
    },
    isProd(){
        return location.hostname.includes('np.');
    },
    getData(){
        jQuery.ajax({
            url: '/trequest/order',
            type:'POST',
            dataType:'json',
            data: {
              type: 'order',
              order: 'full_universe_report',
              version:'',
              game_number: '4959642116161536'
            },
            success: (e) => {this.onLoaded(e)},
          }) 
    },
    onLocalLoad(){

        this.canvas = document.querySelector('#game');
        this.context = this.canvas.getContext('2d');
        
       // this.addImage();
        this.onLoaded();
    },
    onLoaded(data){
        if(localStorage.getItem('version') !== this.version) {
            localStorage.clear();
            localStorage.setItem('version', this.version);
        }
        // console.log('full data report', data ? data.report : Data.universe.report);
        this.galaxy = data ? data.report : Data.universe.report;
        this.playerId = this.galaxy.player_uid;
        this.timeToProduction();
        this.populateTechCollection();
        this.populateStarCollection();
        this.populateFleetCollection();
        this.title('Your Information');
        this.getPlayerInfo(this.playerId);
        this.allTechInfo(this.playerId)
        this.myStarInfo();
        this.notes();

       
        

        if(this.isProd()) {
            setTimeout(()=> this.getData(), (1000 * 60) * 10);
            setTimeout(()=>  this.storeStarInfo(), (1000 * 60) * 10);
        }else{
            if(Simulation)Simulation.simulateGame();
        }

        this.ai();
        
        AI.init();
    },
    ai(){
        //compare stars
        let starInfo = localStorage.getItem('starInfo');
        if(starInfo)
        {
            starInfo = JSON.parse(starInfo);
            var diff = Math.abs(new Date(starInfo.timestamp) - new Date());
            var minutes = Math.floor((diff/1000)/60);
            if(minutes < 20) {
               const notifications = {};
                //compare 
                const currentVisibleStars = this.getVisibleStarInfo().visibleStars;
                //compare ship and industry and economy
                starInfo.visibleStars.forEach(star =>{
                    const current = currentVisibleStars.find(item => item.uid == star.uid);
                    notifications[star.puid] = notifications[star.puid] || {};
                    notifications[star.puid].star = notifications[star.puid].star || [];
                    const playerName = this.galaxy.players[star.puid] ? this.galaxy.players[star.puid].alias : 'unknown';
                    let starDetails;
                    let type = '';
                    if(star.e < current.e)
                    {
                        type = 'economy';
                        starDetails =
                            {
                                starId:star.uid, 
                                type:'economy',  
                                economy: star.e, 
                                current_economy:current.e
                            };
                            this.addNotification(playerName,star.puid,starDetails,   `star ${star.n} has increased its ${type} from $prevously to $current`, type);
                           
                    }
                    if(star.i < current.i)
                    {
                        type = 'industry';
                        starDetails =
                            {
                            starId:star.uid, 
                            type:'industry',  
                            industry: star.i, 
                            current_industry:current.i
                        };
                        this.addNotification(playerName,star.puid,starDetails,   `star ${star.n} has increased its ${type} from $prevously to $current`, type);
                    }
                    if(star.s < current.s)
                    {
                        type = 'science';
                        starDetails =
                            {
                            starId:star.uid, 
                            type:'science',  
                            science: star.s, 
                            current_science:current.s
                        };
                        this.addNotification(playerName,star.puid,starDetails,   `star ${star.n} has increased its ${type} from $prevously to $current`, type);
                    }
                    if(star.st + 10 < current.st)
                    {
                        type = 'ships';
                        starDetails =
                            {
                            starId:star.uid, 
                            type:'ships',  
                            ships: star.st, 
                            current_ships:current.st
                        };
                        this.addNotification(playerName,star.puid,starDetails,   `star ${star.n} has increased its ${type} from $prevously to $current`, type);
                    }
                    

                   
                });

            }
        }
    },
    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
      clearAllNotifications(){
        this.notifications = [];
      },
      removedNotification(uid){
        for(let a=0; a < this.notifications.length; ++a) {
            if(uid == this.notifications[a].uid) {
                this.notifications.splice(a, 1);
                break;
            }
        }
      },
    addNotification(playerName,playerId, starInfo, message, type){
        const findNotification = this.notifications.find(item => item.star.starId == starInfo.starId);
        if(findNotification){
            findNotification.playerName = playerName;
            findNotification.playerId = playerId;
            findNotification.star = {
                ...findNotification.star,
                [starInfo.type]:{
                    prevously: findNotification.star[starInfo.type] ? findNotification.star[starInfo.type].prevously : starInfo[starInfo.type],
                    current: starInfo[`current_${starInfo.type}`]
                }
            }
            
        }else{
            this.notifications.push({
                uid: this.uuidv4(),
                playerName,
                playerId,
                star: {
                    starId: starInfo.starId,
                    [starInfo.type]:{
                        prevously: starInfo[starInfo.type],
                        current: starInfo[`current_${starInfo.type}`]
                    }
                },
                message,
                type,
            }) ;
        }
      //console.log('notifications', this.notifications);
    },
    getMyStars(){
        const collection = {};
        Object.keys(this.MyStars).forEach(key => { 
          collection[key] = (this.galaxy.stars[this.MyStars[key]]);
        });
        return collection;
    },
    comparePlayers(){
        return Object.keys(this.galaxy.players).map(key => {
            const player = this.galaxy.players[key];
            const techLevels = {};
            Object.keys(player.tech).forEach(key => {
                techLevels[key] = player.tech[key].level;
            })
            return {
                name: player.alias,
                economy: player.total_economy,
                fleets: player.total_fleets,
                industry: player.total_industry,
                science: player.total_science,
                stars: player.total_stars,
                ships: player.total_strength,
                ...techLevels,
            }
        })
    },
    getPlayerInfo(playerId){
        const player = this.galaxy.players[playerId];
        const info = {
            totalScience: player.total_science,
            totalIndustry: player.total_industry,
            totalShips: player.total_strength,
            numberOfStars: player.total_stars,
        }
        //console.table(info);
        return info;
    },
    getStarDetailsById(starId){
        return this.galaxy.stars[starId];
    },
    battle(starId, defending){
        const star = this.galaxy.stars[starId];
        let attackers = [];
        const defenderInfo = {
            starName: star.n,
            playerName:  this.galaxy.players[star.puid] ? this.galaxy.players[star.puid].alias : 'unknown',
            playerWeaponsLevel: this.galaxy.players[star.puid] && this.galaxy.players[star.puid].tech.weapons.level,
            numberOfShips: star[this.StarProperties.Ships],
            shipsPer30Mins: this.galaxy.players[star.puid] !== undefined && Number(this.shipsPerTickByindustry(this.getStarNameById(starId),undefined, star.puid)),
            defenderWeaponTech: this.galaxy.players[star.puid] !== undefined && this.galaxy.players[star.puid].tech.weapons.level + 1,
        }
        if(defending) {
           
            let shipsCount = defenderInfo.numberOfShips;
            Object.keys(this.galaxy.fleets).forEach(key =>{
                const fleet = this.galaxy.fleets[key];
                fleet.o.forEach(waypoint => {
                    const destinationStarId = waypoint[1];
                    if(destinationStarId == star.uid && fleet.puid !== star.puid) {
                        this.addFleetWaypointByStar(fleet.uid,star.uid);
                        const etaParts = this.timeToTick(fleet.etaFirst).split('');
                        const hours = Number(etaParts[0].replace('h',''));
                        const minuteShips = Number(etaParts[1].replace('m','')) >= 30 ? 1 : 0;
                        const numberOfShipsOnArrival = shipsCount ? shipsCount + ((defenderInfo.shipsPer30Mins * 2) * hours) + minuteShips : 0;
                       const playerWeaponsLevel = this.galaxy.players[fleet.puid] && this.galaxy.players[fleet.puid].tech.weapons.level;
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
                            playerId: this.galaxy.players[fleet.puid].alias,
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
        this.title('BATTLE CALCULATOR')
        this.subtitle('DEFENDER INFO')
        //console.table(defenderInfo)
        this.subtitle('COMBAT INFO')
        //console.log('ships arriving for battle');
        //console.table(attackers)
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
    title(title){
        //console.log(`%c ${title.toUpperCase()} `, `background:#000; color: #fff; font-size:22px;`);
    }, 
    subtitle(title){
        //console.log(`%c ${title.toUpperCase()} `, `background:#333; color: #fff; font-size:16px;`);
    }, 
    log(message, bg, color){
        //console.log(`%c ${message.toUpperCase()} `, `background: ${ bg ? bg : '#222'}; color: ${color ? color :'#bada55'}`);
    },
    allTechInfo(playerId){
        //console.group();
        this.subtitle('TECH TO PRODUCTION')
        const techToProd = {};
        const player = this.getPlayerById(playerId ? playerId : this.playerId);
       Object.keys(this.Tech).forEach(key => {
            const techId = this.Tech[key];
            const tech = player.tech[techId];
            techToProd[key] = { ...this.techCalculator(techId, playerId, true) , progress: tech.research + " of " + Number(tech.level) * Number(tech.brr)}
       });
       //console.table(techToProd);
       //console.groupEnd();
       return techToProd;
    },
    shipsPerTickByindustry(star, industryLevel, playerId){
        return this.calcShipsPerTick(star, playerId ? playerId : this.playerId, industryLevel);
    },
    myIndustryUpgrade(industryLevel){
        const collection = [] ;
        Object.keys(this.MyStars).forEach(key => {
            const star = this.getStarById(key);
            const currentShipsPerTick =  this.calcShipsPerTick(key, this.playerId);
            const upgradeShipsPerTick = this.calcShipsPerTick(key, this.playerId, industryLevel ?  star.i + industryLevel : star.i + 1);
            const potentialShipCountIn3Hours =  (star[this.StarProperties.Ships] + (Number(upgradeShipsPerTick) * 6)).toFixed(2);
            const currentShipCountIn3Hours = (star[this.StarProperties.Ships] + (Number(currentShipsPerTick) * 6)).toFixed(2)
            collection.push({
              star: key,
              currentlyShipsPer30Mins:currentShipsPerTick,
              potentialShipsPer30Mins:upgradeShipsPerTick,
              increasePer30Mins:   (Number(upgradeShipsPerTick) - Number(currentShipsPerTick)).toFixed(2),
              currentShipCountIn3Hours: currentShipCountIn3Hours,
              potentialShipCountIn3Hours: potentialShipCountIn3Hours,
              increaseIn3Hours: (Number(potentialShipCountIn3Hours) - Number(currentShipCountIn3Hours)).toFixed(2),
            //   potentialShipCount: this.calcShipsPerTickTotal(this.playerId, Number(upgradeShipsPerTick)) * 6

            });
        });
        this.title('Industry Upgrade');
        //console.group();
        //console.log(`Total number of ships produced per 30 mins ${this.calcShipsPerTickTotal(this.playerId)} and  ${this.calcShipsPerTickTotal(this.playerId) * 6} for every 3 hours`);
        //console.table(collection.sort((a,b) => b.increaseIn3Hours - a.increaseIn3Hours));
        //console.groupEnd()
    },
    myStarInfo(){
        this.title('Star Information');
        const myStars = this.getMyStars();
        let topDogs;
        const highResource = Object.keys(myStars).filter(key => {
            const star = myStars[key];
            if(star.r >= 35 || star.nr >= 30) return true;
        }).map(key => {
            const star = myStars[key];
            return {
                name: key,
                TerraformedResource: star.r,
                NaturalResource: star.nr,
                IndustryLevel: star.i,
                shipsPer_30Mins: this.calcShipsPerTick(key, this.playerId),
                topDog: star.r >= 50 && star.nr >= 50,
            }
        }).sort((a,b) => b.NaturalResource - a.NaturalResource);

         topDogs = Object.keys(myStars).filter(key => {
            const star = myStars[key];
            if(star.r >= 50 || star.nr >= 50) return true;
        }).map(key => {
            const star = myStars[key];
            return {
                name: key,
                TerraformedResource: star.r,
                NaturalResource: star.nr,
                shipsPer30Mins: this.calcShipsPerTick(key, this.playerId)
            }
        });
        //console.group();
        this.subtitle('PLANETS TO PROTECT');
       if(Object.keys(topDogs).length){
        //console.table(topDogs);
       }else{
           //console.log('You dont have valuable stars')
       }
        //console.groupEnd();
        //console.group();
        this.subtitle('HIGHLY RESOURCED PLANETS');
        //console.table(highResource);
        //console.groupEnd();
        
        return {
            topDogs,
            highResource,
        }

    },
    enemyIntel(){
        Object.keys(this.galaxy.players).forEach(player => {

        })
    },
    techCalculator(techId, playerId, ignoreLog){
        const player = this.getPlayerById(playerId ? playerId : this.playerId);
        const tech = player.tech[techId];
        if(player.total_science) {
           let a = Number(tech.level) * Number(tech.brr);
           let i = a - Number(tech.research);
           const time = (i / player.total_science);
           const prodDays = this.daysToProductionTime(time, ignoreLog);
          return {
            prodDays,
            timeToTick:  this.timeToTick(time),
          };
        }else{
            //console.log('You have no science');
            return 0;
        }
       
    },
    getPlayerById(id){
       return this.galaxy.players[id];
    },
    getStarNameById(id){
        return this.galaxy.stars[id].n;
     },
    getStarById(id){
        return this.galaxy.stars[this.Stars[id]] || this.galaxy.stars[id];
     },
    getFleetById(id){
        return this.galaxy.fleets[id];
    },
    populateTechCollection(){
        const player = this.getPlayerById(this.playerId);
        Object.keys(player.tech).forEach(key => { 
            const techName = this.capitalizeFirstLetter(key);
            this.Tech[techName] = key;
        });
        window.Tech = this.Tech;
    },
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },
    populateStarCollection(){
        Object.keys(this.galaxy.stars).forEach(key => { 
            const star = this.galaxy.stars[key];
            this.Stars[star.n] = star.uid;
            if(star.puid === this.playerId)
            this.MyStars[star.n] = star.uid;
        });
        window.Stars = this.Stars;
        window.MyStars = this.MyStars;
    },
    timeToProduction(ignoreLog) {
        var t = this.galaxy.production_rate - this.galaxy.production_counter;
        if(ignoreLog) return this.timeToTick(t);
        //console.log('time to production',this.timeToTick(t));
    },
    daysToProductionTime(time, ignoreLog){
      //  const day = this.galaxy.production_rate == 24 ? 48.442 :  this.galaxy.production_rate;
      if(ignoreLog) return (time/ this.galaxy.production_rate).toFixed(2);
        //console.log((time/ this.galaxy.production_rate).toFixed(2), 'production cycles to complete')
    },
    populateFleetCollection(){
        Object.keys(this.galaxy.fleets).forEach(key => { 
            const fleet = this.galaxy.fleets[key];
            const fleetName = fleet.n.replace(/ /g,'_');
            this.Fleets[fleetName] = fleet.uid;
            if(fleet.puid == this.playerId)
            this.MyFleets[fleetName] = fleet.uid;
        });
        window.Fleets = this.Fleets;
        window.MyFleets = this.MyFleets;
    },
    addImage(){
          base_image = new Image();
          base_image.src = 'img/canvas.PNG';
          base_image.onload = () =>{
            this.context.drawImage(base_image, 0, 0);
          }
    },
    distance(e, t, r, n) {
        var o = Math.sqrt((e - r) * (e - r) + (t - n) * (t - n));
        return o
    },
    starDistance(t, r) {
        return e.distance(t.x, t.y, r.x, r.y)
    },
    starsGated(e, t) {
        return 1 !== e.ga || 1 !== t.ga ? !1 : !0
    },
    clearFleetWaypoints(selectedFleet) {
        var r = selectedFleet;
        r.orders = [];
        r.path = [];
        return r;
    },
    distanceBetweemStars(fromStarId, toStarId){
        const fromStar = this.galaxy.stars[fromStarId];
        const toStar =  this.galaxy.stars[toStarId];
        const fleet = {
            ...this.FleetObject, 
            x: fromStar.x, 
            y: fromStar.y, 
            lx: fromStar.x, 
            ly: fromStar.y, 
            id:2382884857485748, 
            n:'Fake Fleet'
        };
        const info = this.addFleetWaypointByStar(2382884857485748,toStarId,fleet);
        //console.log(info);
        return this.timeToTick(info.eta);
    },
    addFleetWaypoints(fleetId, starId) {
        let selectedFleet = this.getFleetById(fleetId);
        selectedFleet.orders.push([0,starId,0,0]);
        selectedFleet.path.push(this.galaxy.stars[starId]);
        return selectedFleet;
    },
    addFleetWaypointByStar(fleetId, starId, fleet, ignoreLogs){
        let selectedFleet = fleet ? fleet : this.getFleetById(fleetId);
        this.clearFleetWaypoints(selectedFleet);
        selectedFleet.orders.push([0,starId,0,0]);
        selectedFleet.path.push(this.galaxy.stars[starId]);
        if(!ignoreLogs) {
            //console.log(this.calcFleetEta(selectedFleet));
            //console.log(this.timeToTick(selectedFleet.etaFirst))
        }
        return selectedFleet;
    },
    calcFleetEta(t) {
        var r, n, o, a, i = this.galaxy.fleet_speed, s = 3 * this.galaxy.fleet_speed;
        if (t.eta = 0,
        t.etaFirst = 0,
        t.path.length > 0 && (t.eta += 1,
        o = t,
        a = !1,
        t.orbiting && (o = t.orbiting,
        t.eta += t.orders[0][0]),
        r = this.distance(o.x, o.y, t.path[0].x, t.path[0].y),
        "star" === o.kind && this.starsGated(o, t.path[0]) && (a = !0),
        t.eta += t.warpSpeed || a ? Math.floor(r / s) : Math.floor(r / i),
        t.etaFirst = t.eta,
        t.orders[0][4] = t.eta,
        t.path.length > 1))
            for (n = 0; n < t.path.length - 1; n += 1)
                r = this.distance(t.path[n].x, t.path[n].y, t.path[n + 1].x, t.path[n + 1].y),
                t.eta += this.starsGated(t.path[n], t.path[n + 1]) ? Math.floor(r / s) : Math.floor(r / i),
                t.eta += 1,
                t.eta += t.orders[n + 1][0],
                t.orders[n + 1][4] = t.eta
    return t;
    },
    calcShipsPerTick (starId, playerId, industryLevel) {
        const star = this.getStarById(starId);
        const player = this.getPlayerById(playerId);
        var r = (industryLevel ? industryLevel : star.i) * (5 + player.tech.manufacturing.level)
          , n = r / this.galaxy.production_rate;
        return n !== Math.round(n) && (n = n.toFixed(2)),
        n
    },
    calcShipsPerTickTotal (playerId, industryIncrement) {
        const player = this.getPlayerById(playerId);
        var r = (industryIncrement ? player.total_industry + industryIncrement : player.total_industry) * (5 + player.tech.manufacturing.level)
          , n = r / this.galaxy.production_rate;
        return n !== Math.round(n) && (n = n.toFixed(2)),
        n
    },
    timeToTick(t, r) {
        const now = new Date(this.galaxy.now);
        var n = 0
          , o =this.galaxy.tick_fragment
          , a = now.valueOf() - (new Date).valueOf();
          this.galaxy.paused || (n = (new Date).valueOf() - now.valueOf()),
        (r || this.galaxy.turn_based) && (n = 0,
        o = 0,
        a = 0);
        var i = 1e3 * t * 60 * this.galaxy.tick_rate - 1e3 * o * 60 *this.galaxy.tick_rate - n - a;
        return 0 > i ? "0s" : this.formatTime(i, !0, !0)
    },
    checkTravelCapability(starId, toStarId){
        const ruler  = this.initRuler();
        const star = this.galaxy.stars[starId] || this.galaxy.fleets[starId];
        const toStar= this.galaxy.stars[toStarId];
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
    getVisibleStarInfo(){
        const visibleStars = this.visibleStars();
        const starInfo = {
            production: this.galaxy.production,
            visibleStars,
            timestamp: new Date().getTime(),
        }
        return starInfo;
    },
    storeStarInfo(){
        localStorage.setItem('starInfo', JSON.stringify(this.getVisibleStarInfo()));
    },
    visibleStars(){
        const collection = [];
        Object.keys(this.galaxy.stars).forEach(key =>{
            const star = this.galaxy.stars[key];
            if(star.hasOwnProperty('st'))collection.push(star);
        });
        return collection;
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
                  , i = this.galaxy.fleet_speed
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
    formatTime(e, t, r) {
        var n = e / 1e3
          , o = ""
          , a = 0
          , i = 0
          , s = 0;
        return n >= 86400 && (s = n / 86400,
        n %= 86400,
        o += parseInt(s, 10) + "d "),
        n >= 3600 && (i = n / 3600,
        n %= 3600,
        o += parseInt(i, 10) + "h "),
        n >= 60 && (a = n / 60,
        n %= 60,
        t && (o += parseInt(a, 10) + "m ")),
        n > 0 && t && r && (o += parseInt(n, 10) + "s"),
        o.trim()
    },
    notes(){
        this.title('NOTES');
        //console.log('ships are produced based on a stars industry * manufacturing level');
        //console.log('Upgrade Industry and Science striaght after production starts');
        //console.log('Develop Economy right before the next cycle');
        //console.log('Keep fleets outside scanning range. keep one star in scanning range and one out.');
        //console.log('Use open space as a wall between enemies. Use outter stars as scouts and dont build economy or science on them');
        //console.log('Build factories closer to home and circle fleets');
        //console.log('Keep a 7 hour gap between enemies');
        //console.log('better to attack stars with carriers');
        //console.log('middle of board then start on weapons');
        //console.log('banking or experimentation early on');
        // console.log(`6 Econ, 5 Industry, 4 Research = the Research Specialist or
 
        // 16-17 Econ, 5 Industry, 1 Research = the Econ Specialist
        
        // or
        
        // 6 Econ, 11-12 Industry, 1 Research = the Industry Specialist`);
        //console.log(` two turns industry + 1 economy is almost strictly worse than two turns economy + 1 turn industry`);
        //console.log('prod 1: explore first day, then spend on economy, prod 2: then economy 5 above all and one science')
    }
}

