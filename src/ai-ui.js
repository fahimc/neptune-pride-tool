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
    const compare = AI.comparePlayers().compare;
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

    const compareSection = this.createBoxSection(
      'Compare Players',
      this.createTableFromObject(compare, this.getTableRowsFromArray.bind(this)).innerHTML
    );
    section.appendChild(compareSection);

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
