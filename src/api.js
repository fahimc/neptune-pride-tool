var Api = {
    transferRequest(fleet,ships){
        this.request("ship_transfer," + fleet.uid + "," + ships); 
    },
    fleetOrders(fleet){
        let isLooping = 0; //1 for looping;
        let o = [];
        let a = [];
        let i = [];
        let s = [];
        fleet.o.forEach(order =>{
            o.push(fleet.o[order][0]);
            a.push(fleet.o[order][1]);
            i.push(fleet.o[order][2]);
            s.push(fleet.o[order][3]);
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
        jQuery.ajax({
            url: '/trequest/order',
            type:'POST',
            dataType:'json',
            data: {
              type: 'order',
              order: order,
              version:'',
              game_number: '4959642116161536'
            },
            success: (e) => {this.onLoaded(e)},
          }) 
    },
    sendShip(fleet, star){
       if(!GameStats.isProd()) {
          if(window.Simulation)Simulation.sendShip(fleet,star); 
       }else{
           this.fleetOrders(fleet);
       }
    },
    transferShips(star,fleet, ships){
        if(!GameStats.isProd()) {
            if(window.Simulation)Simulation.transferShips(star,fleet,ships); 
         }else{
             this.transferRequest(fleet,ships);
         }
    }
}