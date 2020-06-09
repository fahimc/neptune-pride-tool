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