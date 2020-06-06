
var Simulation = {
    initialData:null,
    frameRate:1000,
    currentScenario:0,
    generateData(){
        const visibleStars =  GameStats.visibleStars().filter(star => star.puid !== GameStats.playerId);
        const randomIndex = Math.floor(Math.random() * ((visibleStars.length - 1) - 0 + 1) + 0);
        const star = visibleStars[randomIndex];
        const upgrades = ['i', 'st', 'e', 's'];
        const randomUpgradeIndex = Math.floor(Math.random() * ((upgrades.length - 1) - 0 + 1) + 0);
        star[upgrades[randomUpgradeIndex]] += 1; 
        NeptunesPride.universe.galaxy.stars[star.uid] = star;

        if(TestCanvas)TestCanvas.draw();
    },
    reset(){
        NeptunesPride.universe.galaxy = this.initialData;
    },
    clean(){
        // console.log('clean');
        NeptunesPride.universe.galaxy.fleets = {};
        Object.keys(NeptunesPride.universe.galaxy.players).forEach(k => {
            const player = NeptunesPride.universe.galaxy.players[k];
            if(!player.tech) player.tech = {...NeptunesPride.universe.galaxy.players[1].tech};
            NeptunesPride.universe.galaxy.players[k] = player;
        })
    },
    updateStar(starId, data){
        NeptunesPride.universe.galaxy.stars[starId] = {
            ...NeptunesPride.universe.galaxy.stars[starId],
            ...data,
        }
        TestCanvas.draw();
    },
    addFleet(starId, ships, destinationStarId){
        const id = GameStats.uuidv4();
        const star = NeptunesPride.universe.galaxy.stars[starId];
        let fleet = {
            ...this.FleetObject, 
            x: Number(star.x), 
            y: Number(star.y), 
            lx: Number(star.x), 
            ly: Number(star.y),
            currentStar: star,
            puid: star.puid, 
            ouid: star.uid,
            o:destinationStarId ?[
                [0,destinationStarId,0,0]
            ]: [],
            st:ships||0,
            uid:id, 
           orders:[[0,destinationStarId,0,0]],
           path:[star],
            n: star.n + ' Fleet'
        };
        fleet = GameStats.calcFleetEta(fleet);
        NeptunesPride.universe.galaxy.fleets[id] = fleet;
        TestCanvas.draw();
    },
    init(){
            document.addEventListener('DOMContentLoaded', this.onLocalLoad.bind(this));
       
    },
    onLocalLoad(){
        this.simulateGame();
        this.runEachSimulation(true)
    },
    simulateGame(){
        if(!this.initialData){
            this.initialData = {...NeptunesPride.universe.galaxy};
        }else{
            return;
        }
       
        document.body.appendChild(GameUI.createElement('div', `
        color: white;
        position: absolute;
        z-index: 999999;
        top: 150px;
        left: 20px;
        font-family: sans-serif;
        font-size: 20px;
        text-transform: uppercase;
        `,`Scenario:`,`sim-title`))
        this.clean();
        TestCanvas.draw();
       // this.generateData();
        setInterval(()=> {
          //this.generateData();
        }, (100 * 60) * 1)
        setInterval(()=>{
            GameStats.ai();
           // if(GameStatesUI)GameStatesUI.init();
        },  (300 * 60) * 1)
        setInterval(()=>{
            GameStats.storeStarInfo()
        },  (800 * 60) * 1)

        //
        
      // this.runEachSimulation();
   
        
    },
    runEachSimulation(ignoreStart){
        const scenarios = [
            this.haveShipsOnAnotherFleetAroundAStar.bind(this),
            this.haveShipsOnMultipleLocalStars.bind(this),
            this.dontHaveBackupAndLowResource.bind(this),
            this.dontHaveEnoughShipsAsBackup.bind(this),
        ];
        if(this.currentScenario >= scenarios.length)return;
        NeptunesPride.universe.galaxy.stars = {...this.initialData.stars};
        this.clean();
        AI.clean();
        scenarios[this.currentScenario]();
        NeptunesPride.universe.galaxy = NeptunesPride.universe.galaxy;
        if(!ignoreStart)this.start();
        this.currentScenario++;
        //  this.scenario();
        // this.start();
        
    },
    scenario(){
        this.haveShipsOnMultipleLocalStars();
    },
    title(title){
        document.querySelector('#sim-title').textContent = `SCENARIO: ${title}`;
    },
    haveShipsOnAnotherFleetAroundAStar(){
        this.title('Defend with help from another star');
        this.addFleet(GameStats.Stars.Aldebaran,100, GameStats.Stars.Mi)
        this.updateStar(GameStats.Stars.Mi,{st:50})
        this.updateStar(GameStats.Stars.Haedus,{st:20})
        this.addFleet(GameStats.Stars.Haedus,100)
        // console.log('here',NeptunesPride.universe.galaxy)
    },
    haveShipsOnMultipleLocalStars(){
        this.title('Defend with help from multiple stars');
        Simulation.addFleet(GameStats.Stars.Saw,100, GameStats.Stars.Mi)
        Simulation.updateStar(GameStats.Stars.Mi,{st:30})
        Simulation.updateStar(GameStats.Stars.Haedus,{st:20})
        Simulation.addFleet(GameStats.Stars.Haedus,30)
        Simulation.updateStar(GameStats.Stars.Haedus,{st:20})
        Simulation.addFleet(GameStats.Stars.Chort,30)
    },
    dontHaveEnoughShipsAsBackup(){
        this.title('Cannot win so reduce enemy numbers');
        Simulation.addFleet(GameStats.Stars.Aldebaran,100, GameStats.Stars.Mi)
        Simulation.updateStar(GameStats.Stars.Mi,{st:50})
        Simulation.updateStar(GameStats.Stars.Haedus,{st:20})
        Simulation.addFleet(GameStats.Stars.Haedus,20)
    },
    dontHaveBackupAndLowResource(){
        this.title('Cannot win and star has low resource');
        Simulation.addFleet(GameStats.Stars.Aldebaran,100, GameStats.Stars.Mi)
        Simulation.updateStar(GameStats.Stars.Mi,{st:20, r:20,nr:20})
        Simulation.addFleet(GameStats.Stars.Mi,20)
    },
    start(){
        this.renderInterval = setInterval(() => {
            this.render();
        }, this.frameRate);
    },
    stop(){
        clearInterval(this.renderInterval );
    },
    updateStars(){
        Object.keys(NeptunesPride.universe.galaxy.stars).forEach(key =>{
            const star = NeptunesPride.universe.galaxy.stars[key];
            if(!star.i) return;
            const tick = GameStats.calcShipsPerTick(star.uid, star.puid);
            if( !isNaN(tick)){
                star.st += Number(tick);
            }
           
        });
        NeptunesPride.universe.galaxy = NeptunesPride.universe.galaxy;
    },
    render(){
        this.updateStars();
        // console.log(NeptunesPride.universe.galaxy.fleets);
        let end = false;
        Object.keys(NeptunesPride.universe.galaxy.fleets).forEach(key =>{
            if(end)return;
            const fleet = NeptunesPride.universe.galaxy.fleets[key];
            if(!fleet.o.length)return;
            const destStar = NeptunesPride.universe.galaxy.stars[fleet.o[0][1]];
            // console.log(fleet);
            const travel = GameStats.checkTravelCapability(fleet.currentStar.uid, fleet.o[0][1]);
            const timeParts = travel.time.split(' ');
            const hours = Number(timeParts[0].replace('h',''));
            const min = Number(timeParts[1].replace('m',''));
            let ticks = 0;
            if(!isNaN(hours)) 
            {
                 ticks = hours/0.5;
            }
            if(!isNaN(min)) {
                ticks += min / 30;
            } 
            fleet.ticks =  fleet.ticks ?  fleet.ticks : ticks;
              
               const currentTick = fleet.o[0][3] ? fleet.o[0][3] : 1; 
               const xDif = Math.abs(fleet.x  - destStar.x);
               const yDif = Math.abs(fleet.y  - destStar.y);
               const xMovement =  fleet.xMovement = fleet.xMovement ? fleet.xMovement: xDif/ticks;
               const yMovement =   fleet.yMovement = fleet.yMovement ? fleet.yMovement: yDif/ticks;
               if(fleet.x < Number(destStar.x)){
                fleet.x  += xMovement;
               }else{
                fleet.x  -= xMovement;
               }
               if(fleet.y < Number(destStar.y)){
                fleet.y  += yMovement;
               }else{
                fleet.y  -= yMovement;
               }
               if(currentTick >= ticks ){
                    fleet.ouid = destStar.uid;
                   end = !!this.isAttacking(fleet);
                    fleet.o = [];
               }else{
                    fleet.o[0][3] += 1;
               }
               
        });
        NeptunesPride.universe.galaxy = NeptunesPride.universe.galaxy;
        TestCanvas.draw();
    },
    isAttacking(fleet){
        const star = NeptunesPride.universe.galaxy.stars[fleet.ouid];
        if(star.puid !== fleet.puid) {
            this.stop();
            const player = NeptunesPride.universe.galaxy.players[GameStats.playerId];
            const attackerPlayer = NeptunesPride.universe.galaxy.players[fleet.puid];
            // console.log(AI.getShipsOnOrbitingFleets(star), star)
            const ships = AI.getShipsOnOrbitingFleets(star).totalShips + star.st;
            // console.log(star, player.tech.weapons.level,ships,attackerPlayer.tech.weapons.level, fleet.st)
            // console.log(ships);
           const battleDetails = GameStats.fight(player.tech.weapons.level + 1,ships,attackerPlayer.tech.weapons.level, fleet.st);
        //    console.log(battleDetails)
           if(battleDetails.defendersShips)
           {
            delete NeptunesPride.universe.galaxy.fleets[fleet.uid];
            star.st = battleDetails.defendersShips;
           }else{
               star.st = battleDetails.attackersShips;
               star.puid = fleet.puid;
           }
           this.runEachSimulation();
           return true;
        }    
    },
    sendShip(fleet, star){
        // console.log('send ship')
       const battleFleet = {
           ...fleet,
        o:[
            [0,star.uid,0,0]
        ], 
        orders:[[0,star.uid,0,0]],
        path:[star],
       }
       NeptunesPride.universe.galaxy.fleets[battleFleet.uid] = battleFleet;
    //    console.log('back up sent!')
    },
    transferShips(star,fleet, ships){
        NeptunesPride.universe.galaxy.fleets[fleet.uid].st += ships;
        NeptunesPride.universe.galaxy.stars[star.uid].st = NeptunesPride.universe.galaxy.stars[star.uid].st - ships < 0 ? 0: NeptunesPride.universe.galaxy.stars[star.uid].st - ships;
    }
};