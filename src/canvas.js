var TestCanvas = {
    canvas:null,
    context:null,
    scale:200,
    colors:['red', 'green', 'blue'],
    playerColors:{

    },
    init(){
       
       // document.addEventListener('DOMContentLoaded', this.onLocalLoad.bind(this));
    },
    onLocalLoad(){
        this.canvas = document.querySelector('#game');
        this.context = this.canvas.getContext('2d');
        this.sizeCanvas();
        this.draw();
        // this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    },
    draw(){
        if(!this.canvas){
            this.onLocalLoad();
            return;
        }
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawStars();
        this.drawFleets();
    },
    sizeCanvas(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    onMouseMove(event){
        console.log(this.screenToWorldX(event.pageX), this.screenToWorldY(event.pageY));


    },
    getRandomColor() {
        const index = Math.floor(Math.random() * ((this.colors.length -1) - 0 + 1) + 0);
        const color = this.colors[index];
        this.colors = this.colors.filter((item,i) => i !== index);
        return color;
      },
    drawBackground(){
        this.context.beginPath();
        this.context.fillStyle = 'black';
        this.context.fillRect(0,0,window.innerWidth, window.innerHeight);
        this.context.fill();
    },
    drawStars(){
        Object.keys(GameStats.galaxy.stars).forEach(key =>{
            const  star = GameStats.galaxy.stars[key];
            this.drawStar(star);
        });
    },
    drawStar(star){
        let color = '#ccc';
        if(!this.playerColors[star.puid]) {
            color =  this.playerColors[star.puid] = star.puid == -1 ? '#ccc' : this.getRandomColor();
        }else if(star.puid !== undefined){
            color =  this.playerColors[star.puid];
        }
        this.context.beginPath();
        this.context.arc(this.worldToScreenX(star.x), this.worldToScreenY(star.y), 10, 0, 2 * Math.PI, false);
        this.context.fillStyle = '#999';
        this.context.fill();
        this.context.lineWidth = 5;
        this.context.strokeStyle = color;
        this.context.stroke();
        this.context.fillStyle = '#666';
        this.context.font = "11px Arial";
        this.context.fillText(star.n,this.worldToScreenX(star.x), this.worldToScreenY(star.y) + 25);
        if(star.st !== undefined)this.context.fillText(Math.floor(star.st),this.worldToScreenX(star.x), this.worldToScreenY(star.y) - 15);
    },
    drawFleets(){
        Object.keys(GameStats.galaxy.fleets).forEach(key =>{
            const  fleet = GameStats.galaxy.fleets[key];
            this.drawFleet(fleet);
        });
    },
    drawFleet(fleet){
        const x = this.worldToScreenX(fleet.x);
        const y = this.worldToScreenY(fleet.y);

        this.context.beginPath();
        this.context.strokeStyle = '#333';
        this.context.fillStyle = this.playerColors[fleet.puid];
        this.context.moveTo(x - 10, y + 20);
        this.context.lineTo(x + 10, y + 20);
        this.context.lineTo(x, y);
        this.context.lineTo(x - 10, y + 20);
        this.context.stroke();
        this.context.fill();
        this.context.fillStyle = 'white';
        this.context.font = "11px Arial";
        this.context.fillText(Math.floor(fleet.st),x - 5, y + 20);
        if(fleet.o) {
            let dx = x;
            let dy = y;
            fleet.o.forEach(dest => {
                const destStar = GameStats.galaxy.stars[dest[1]];
                this.context.beginPath();
                this.context.globalAlpha = 0.3;
                this.context.moveTo(dx, dy);
                this.context.lineTo(this.worldToScreenX(destStar.x), this.worldToScreenY(destStar.y));
                this.context.strokeStyle = this.playerColors[fleet.puid];
                // this.context.setLineDash([5, 5]);
                this.context.stroke();
                this.context.globalAlpha = 1;
            })
        }
    },
    worldToScreenX (x) {
        const sx = -1 + window.innerWidth / (window.devicePixelRatio || 1) / 2;
        return (x * this.scale + sx) * (window.devicePixelRatio || 1)
    },
    worldToScreenY (y) {
        const sy =  -1 + window.innerHeight / (window.devicePixelRatio || 1) / 2;
        return (y * this.scale + sy) * (window.devicePixelRatio || 1)
    },
    screenToWorldX(x) {
        const sx = -1 + window.innerWidth / (window.devicePixelRatio || 1) / 2;
        return (x / (window.devicePixelRatio || 1) - sx) / this.scale;
    }
    ,
    screenToWorldY(y) {
        const sy =  -1 + window.innerHeight / (window.devicePixelRatio || 1) / 2;
        return (y / (window.devicePixelRatio || 1) - sy) / this.scale
    }
}