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