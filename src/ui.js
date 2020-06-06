var GameStatesUI = {
    colors: {
        darkBlue: '#1A1D44',
        black: '#000000',
        yellow: '#FF9000',
    },
    container:null,
    css:`
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
      
    `,
    state: {
        show:false,
    },
    showButton: null,
    init(){
        if(document.querySelector('#game-stats-ui'))this.update();
        this.createContainer();
        this.createNotificationInfo();
        this.createPlayerInfo();
        this.createPlayersInfo();
        this.createTechInfo();
        this.createStarInfo();
        this.createStarDetail();
        this.createStarBattle();
        this.createStarTravel();
    },
    clean(){
        if(!document.querySelector('#gamestats-style')) return;
        document.body.removeChild(document.querySelector('#game-stats-ui'));
        document.body.removeChild(document.querySelector('#gamestats-button'));
    },
    update(){
        this.createNotificationInfo();
        this.createPlayerInfo();
        this.createPlayersInfo();
        this.createTechInfo();
        this.createStarInfo();
    },
    createContainer(){
        this.container = document.createElement('div');
        this.container.id = 'game-stats-ui'
        this.container.className = this.state.show ? '' : 'hide';
        this.container.style = `
        min-width: 50vw;
        height: 100vh;
        position: absolute;
        top: 0;
        right: 20px;
        background: ${this.colors.black};
        font-family: OpenSansRegular, sans-serif;
        font-size: 16px;
        color: white;
       
        align-items:flex-start;
        align-content:flex-start;
        flex-direction: column;
        max-width: 50vw;
        `;
        const style = document.createElement('style');
        style.innerHTML = this.css;
        style.id = 'gamestats-style'
        this.container.appendChild(style);
        this.container.appendChild(this.createSectionTitle('Game AI'));
        this.contentContainer  =this.createElement('div', `
        flex: 1;
        overflow:auto;
        `,``,'gs-content-container'); 
        this.container.appendChild(this.contentContainer);
        const button = document.createElement('div');
        button.innerHTML = '<div class="navigate-solid icon"></div>';
        button.id = 'gamestats-button';
        button.onclick = this.onToggleShow.bind(this);
        this.showButton = button;
        document.body.appendChild(button);
        document.body.appendChild(this.container);
        document.querySelector('#gamestats-close-button').onclick = this.onToggleShow.bind(this);
    },
    onToggleShow(){
        this.state.show = !this.state.show;
        this.showButton.classList.toggle('hide');
        this.container.classList.toggle('hide');
    },
    createPlayerInfo(){
        const section = this.createSection('Your Information');
        this.updateSection('Your Information', section);
        this.contentContainer.appendChild(section);
        const playerInfo = GameStats.getPlayerInfo(GameStats.playerId);
        section.appendChild(this.createTableFromObject(playerInfo));
    },
    createNotificationInfo(){
        const section = this.createSection('Notification');
        section.style = ` max-height:50vh;
        overflow:auto;`
        this.updateSection('Notification', section);
        section.querySelector('.gs-subtitle').appendChild(this.createElement('button',`
            background: #5961bb;
            border-radius: 4px;
            align-self: flex-start;
            margin-top: 20px;
            color:white;
            border:none;
            cursor:pointer;

        `,`clear all`,`clear-notifications-button`,``))
        section.querySelector('#clear-notifications-button').onclick = ()=> {
            GameStats.clearAllNotifications();
            Array.prototype.forEach.call(section.querySelectorAll('.gs-alert'), (item)=> {
                item.parentNode.removeChild(item);
            });
        };
        const info = {};
        GameStats.notifications.forEach(notification => {
            if(GameStats.playerId == notification.playerId) return;
            const {playerName, ...n} = notification;
            info[playerName] = info[playerName] || [];
            //console.log('n',n)
            info[playerName].push(n);
        });
        //console.log('createNotificationInfo',info)
        if(!Object.keys(info).length)return;
        Object.keys(info).forEach(key => {
            section.appendChild(this.createElement('h1',``,`Player ${key}`))
            info[key].forEach(notification => {
                Object.keys(notification.star).filter(k => k !=='starId' && k !== 'type').forEach(type =>{
                    const star = GameStats.galaxy.stars[notification.star.starId];
                     section.appendChild(this.createNotificaton(`star ${star.n} has increased its ${type} from ${notification.star[type].prevously} to ${notification.star[type].current}`, notification.uid));
                })
              
            })
        });
    },
    createNotificaton(message, uid){
        const alert =  this.createElement('div',`
        padding: 20px;
        background: red;
        border-bottom:1px solid black;
        display:flex;
        position:relative;
        `,`
        <span style="flex:1">${message}</span>
        <div class="gs-close"></div>
        `,uid,`gs-alert`);
        alert.querySelector('.gs-close').onclick = ()=> {
            GameStats.removedNotification(uid);
            alert.parentNode.removeChild(alert);
        }
        return alert;
    },
    createTechInfo(){
        const section = this.createSection('Tech Production Days');
        this.updateSection('Tech Production Days', section);
        this.contentContainer.appendChild(section);
        const info = GameStats.allTechInfo(GameStats.playerId);
        section.appendChild(this.createTableFromObject(info));
    },
    createPlayersInfo(){
        const section = this.createSection('Players Info');
        this.updateSection('Players Info', section);
        this.contentContainer.appendChild(section);
        const info = GameStats.comparePlayers();
        section.appendChild(this.createTableFromObject(info,this.getTableRowsFromArray.bind(this)));
    },
    createStarDetail(){
        const section = this.createSection('Star Details');
        const select = this.createElement('select');
        const details = this.createElement('div',``,``,'gs-star-details','gs-details');
        const stars = Object.keys(GameStats.Stars).filter(key => {
          return GameStats.galaxy.stars[GameStats.Stars[key]].st !== undefined; 

        })
       let optionsHtml = '<option value=-1></option>';
       stars.forEach(key => {
           const s = GameStats.getStarById(key);
        optionsHtml += `<option value=${s.uid}>${s.n}</option>`;
       })
        select.innerHTML = optionsHtml;
        select.onchange = this.onStarDetailChange.bind(this);
        const selectHolder = document.createElement('div');
        selectHolder.className = 'select-holder';

        const label = document.createElement('label');
        label.innerHTML = 'select a star'
        selectHolder.appendChild(label)
        selectHolder.appendChild(select)
        section.appendChild(selectHolder)
        section.appendChild(details)
        this.contentContainer.appendChild(section);
    },
    createStarTravel(){
        const section = this.createSection('Star Travel');
        const options = Object.keys(GameStats.galaxy.stars).map(key => {
            const star = GameStats.galaxy.stars[key];
            return {
                value: key,
                label: star.n,
            }
        })
        const details = this.createElement('div',``,``,'gs-star-travel-details','gs-details');
        section.appendChild(this.createSelect('from star', options, this.onTravelStarSelect.bind(this) ))
        section.appendChild(this.createSelect('to star', options, this.onTravelStarSelect.bind(this) ))
        section.appendChild(details)
        this.contentContainer.appendChild(section);
    },
    onTravelStarSelect(){
        const section = document.querySelector('#StarTravel-section');
        const selects = section.querySelectorAll('select');
        if(selects[0].value != -1 && selects[1].value != -1) {
           
            const info = GameStats.checkTravelCapability(selects[0].value,selects[1].value);
            document.querySelector('#gs-star-travel-details').innerHTML = `
                <p>Time: <span style="color:${this.colors.yellow} ">${info.time}</span></p>
                <p>Distance: <span style="color:${this.colors.yellow}">${info.distance}</span></p>
                <p>Tech Level Required: <span style="color:${this.colors.yellow}">${info.techLevel}</span></p>
            `;
        }else{
            document.querySelector('#gs-star-travel-details').innerHTML = ``;
        }
    },
    createStarBattle(){
        const section = this.createSection('Star Battle');
        const options = Object.keys(GameStats.galaxy.stars).map(key => {
            const star = GameStats.galaxy.stars[key];
            return {
                value: key,
                label: star.n,
            }
        })
        const details = this.createElement('div',``,``,'gs-star-battle-details','gs-details');
        section.appendChild(this.createSelect('select a star', options, this.onBattleSelect.bind(this) ))
        section.appendChild(details)
        this.contentContainer.appendChild(section);
    },
    onBattleSelect(event){
        const details = document.querySelector('#gs-star-battle-details');
        if(event.target.value == -1){
            details.innerHTML = '';
            return;
        }
        const info = GameStats.battle(event.target.value,true);
        const innerHTML =  this.createTableFromObject(info, this.getTableRowsFromArray.bind(this)).innerHTML;
        //console.log(info);
        details.innerHTML = info.length ? innerHTML : 'No battles found';
    },
    createSelect(text, obj, callback){
        const selectHolder = document.createElement('div');
        const label = document.createElement('label');
        const select = this.createElement('select');
        selectHolder.className = 'select-holder';
        let optionsHtml = '<option value=-1></option>';
       obj.forEach(item => {
        optionsHtml += `<option value=${item.value}>${item.label}</option>`;
       })
       select.innerHTML = optionsHtml;
        select.onchange = callback;
        label.innerHTML =text;
        selectHolder.appendChild(label)
        selectHolder.appendChild(select)
        return selectHolder;
    },
    onStarDetailChange(event){
        const details = document.querySelector('#gs-star-details');
        if(event.target.value == -1){
            details.innerHTML = '';
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
    createStarInfo(){
        const section = this.createSection('Your Stars Information');
        this.updateSection('Your Stars Information', section);
        const info = GameStats.myStarInfo();
        section.appendChild(this.createElement('p', `color:${this.colors.yellow}`, `Star Resource Info`, undefined, 'subtitle'))
        section.appendChild(this.createTableFromObject(info.highResource, this.getTableRowsFromArray.bind(this)));
        section.appendChild(this.createElement('p', `color:${this.colors.yellow}`, `High Value Stars`, undefined, 'subtitle'))
        section.appendChild(this.createTableFromObject(info.topDogs, this.getTableRowsFromArray.bind(this)));
    },
    updateSection(title, section){
        const sectionId = `${title.replace(/ /g, '')}-section`;
        const existing = this.contentContainer.querySelector(`#${sectionId}`);
        if(existing) {
            existing.parentNode.replaceChild(section, existing);
        }else{
            this.contentContainer.appendChild(section);
        }
        
    },
    createSection(title){
        const sectionId = `${title.replace(/ /g, '')}-section`;
        const section = this.createElement('div', `width: 100%; background:${this.colors.darkBlue}`, ``,sectionId, 'section');
        const titleElement = this.createSectionSubTitle(title);
        section.appendChild(titleElement);
        return section;
    },
    createSectionTitle(title){
        return this.createElement(
            'div',
            `
            background: ${this.colors.darkBlue};
            font-size: 28px;
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
            <div id="gamestats-close-button" class="widget icon-cancel txt_center icon_button" style="position:relative; margin-top:0"></div>
            `,
        );
    },
    createSectionSubTitle(title){
        return this.createElement(
            'div',
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
    createElement(tag , style, content, id, className){
       const element = document.createElement(tag);
       element.className = className ? className: '';
       element.style = style;
       element.id = id || '';
       element.innerHTML = content || '';
       return element;
    },
    createTableFromObject(data, func){
        const holder = this.createElement('div', `
        padding: 20px;
        overflow: auto;
        box-sizing: border-box;
        `);
        const table = this.createElement('table', `
        color:white;
        width:100%;
       
        `);
        const thead =  document.createElement('thead');
        const tbody =  document.createElement('tbody');
        table.appendChild(thead);
        table.appendChild(tbody);
        let innerHTML = func ? func(data, '', thead) : `
        `
        if(!func)Object.keys(data).forEach(key => {
            innerHTML += `
                <tr><td>${this.camelToSpace(key)}</td><td align="right">
                ${typeof data[key] == 'object' ? this.createInnerTableString(data[key]): data[key]}
                
                </td></tr>
            `
        })
        tbody.innerHTML = innerHTML;
        holder.appendChild(table)
        return holder;
    },
    getTableRowsFromArray(data, html, thead){
        if(!data.length)return '';
        let theadHtml = `<tr style="color:${this.colors.yellow}">`;
        Object.keys(data[0]).forEach(key => {
            theadHtml += `
            <td>${this.camelToSpace(key).replace(/ /g, '<br>')}</td>
        `
        });
        theadHtml += '</tr>';
        thead.innerHTML = theadHtml;
        data.forEach(item => {
            html += '<tr>';
            Object.keys(item).forEach(key => {
                html += `
                    <td>${item[key]}</td>
                `
            });
            html += '</tr>'
        });
        return html;
    },
    camelToSpace(key){
        return key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, function(str){ return str.toUpperCase();})
    },
    createInnerTableString(data){
        let thead = '<table style="width: 100%; color: white;text-align: center;"><thead><tr>';
        let tbody = '<tbody><tr>';
        Object.keys(data).forEach(key => {
            thead += `<td style="color:${this.colors.yellow};">${this.camelToSpace(key)}</td>`
            tbody += `<td>${this.camelToSpace(data[key])}</td>`
        });
        thead += '</tr></thead>';
        tbody += '</tr></tbody></table>';
        return thead + tbody;
    }
};
