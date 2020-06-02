if (!NeptunesPride)
    var NeptunesPride = {};
if (function() {
    NeptunesPride.Inbox = function(e) {
        "use strict";
        var t = {};
        return t = Crux.Widget().roost(Crux.crux),
        t.loading = !1,
        t.messages = {},
        t.messages.game_diplomacy = null,
        t.messages.game_event = null,
        t.selectedMessage = null,
        t.filter = "game_diplomacy",
        t.mpp = 10,
        t.page = 0,
        t.cpp = 15,
        t.unreadDiplomacy = 0,
        t.unreadEvents = 0,
        t.lastFetchedUnreadCount = 0,
        t.commentDrafts = {},
        t.draft = {
            to: [],
            subject: "",
            body: ""
        },
        t.createToList = function(t, r) {
            var n, o, a, i;
            if (i = r ? "alias" : "hyperlinkedAlias",
            n = "",
            t.payload.to_uids.length === e.playerCount - 1) {
                for (n += e.galaxy.players[t.payload.from_uid].colourBox + " ",
                n += e.galaxy.players[t.payload.from_uid][i] + "<br>",
                o = t.payload.to_uids.length - 1; o >= 0; o--)
                    a = e.galaxy.players[t.payload.to_uids[o]],
                    n += a.colourBox;
                n += " All Players<br>"
            } else
                for (n += e.galaxy.players[t.payload.from_uid].colourBox + " ",
                n += e.galaxy.players[t.payload.from_uid][i] + "<br>",
                o = t.payload.to_uids.length - 1; o >= 0; o--)
                    a = e.galaxy.players[t.payload.to_uids[o]],
                    a && (n += a.colourBox + " " + a[i],
                    n += "<br>");
            return n
        }
        ,
        t.onReadAll = function() {
            var e = 0
              , r = 0;
            for (e = 0,
            r = t.messages[t.filter].length; r > e; e += 1)
                t.messages[t.filter][e].status = "read";
            "game_diplomacy" === t.filter && (t.unreadDiplomacy = 0),
            "game_event" === t.filter && (t.unreadEvents = 0),
            t.trigger("server_request", {
                type: "read_all_game_messages",
                group: t.filter
            }),
            t.trigger("show_screen", "inbox")
        }
        ,
        t.onFetchUnreadCount = function() {
            (new Date).valueOf() - t.lastFetchedUnreadCount > 6e5 && (t.lastFetchedUnreadCount = (new Date).valueOf(),
            t.trigger("server_request", {
                type: "fetch_unread_count"
            }))
        }
        ,
        t.onUnreadCount = function(e, r) {
            t.unreadDiplomacy = Number(r.diplomacy),
            t.unreadEvents = Number(r.events)
        }
        ,
        t.fetchMessages = function(e) {
            t.filter !== e && (t.filter = e,
            t.messages[t.filter] = null,
            t.page = 0),
            t.unreadEvents && (t.messages.game_event = null),
            t.unreadDiplomacy && (t.messages.game_diplomacy = null),
            null === t.messages[t.filter] && (t.trigger("server_request", {
                type: "fetch_game_messages",
                count: t.mpp,
                offset: t.mpp * t.page,
                group: t.filter
            }),
            t.loading = !0)
        }
        ,
        t.reloadFilter = function() {
            t.messages[t.filter] = null,
            t.trigger("server_request", {
                type: "fetch_game_messages",
                count: t.mpp,
                offset: t.mpp * t.page,
                group: t.filter
            }),
            t.loading = !0
        }
        ,
        t.onNewMessages = function(e, r) {
            var n = 0
              , o = 0
              , a = {};
            for (t.messages[r.group] = r.messages,
            t.loading = !1,
            n = 0,
            o = t.messages[r.group].length; o > n; n += 1)
                a = t.messages[r.group][n],
                a.comments = null,
                a.commentsLoaded = !1,
                a.payload.created = new Date(a.created),
                a.payload.to_uids && (a.payload.to_uids = a.payload.to_uids.split(","),
                a.payload.to_aliases = a.payload.to_aliases.split(",")),
                t.commentDrafts[a.key] || (t.commentDrafts[a.key] = "");
            "game_event" === r.group && t.messages[r.group].sort(function(e, t) {
                return t.payload.tick - e.payload.tick
            }),
            t.filter == r.group && t.trigger("show_screen", "inbox")
        }
        ,
        t.onNewComments = function(r, n) {
            var o = 0
              , a = 0
              , i = 0
              , s = 0
              , l = {};
            for (o = 0,
            a = t.messages[t.filter].length; a > o; o += 1)
                if (l = t.messages[t.filter][o],
                l.key === n.message_key)
                    for (l.comments = n.messages,
                    l.commentsLoaded = !0,
                    l.commentsLoadedTime = (new Date).getTime(),
                    i = 0,
                    s = l.comments.length; s > i; i += 1)
                        l.comments[i].player = e.galaxy.players[l.comments[i].from_uid];
            "game_diplomacy" === t.filter && t.trigger("show_screen", "diplomacy_detail"),
            t.trigger("scroll_to_bottom")
        }
        ,
        t.onMessageRead = function(e, r) {
            t.selectedMessage = r,
            "read" !== t.selectedMessage.status && (t.updateReadCount(t.selectedMessage),
            t.selectedMessage.status = "read",
            t.trigger("server_request", {
                type: "read_game_message",
                message_key: t.selectedMessage.key
            }),
            t.trigger("show_screen", "inbox"))
        }
        ,
        t.updateReadCount = function(e) {
            "game_diplomacy" === e.group && (t.unreadDiplomacy -= 1),
            "game_event" === e.group && (t.unreadEvents -= 1)
        }
        ,
        t.onSelectMessage = function(e, r) {
            t.selectedMessage = r,
            "read" !== t.selectedMessage.status && (t.updateReadCount(t.selectedMessage),
            t.selectedMessage.status = "read"),
            t.trigger("server_request", {
                type: "fetch_game_message_comments",
                message_key: t.selectedMessage.key,
                count: t.cpp,
                offset: 0
            }),
            t.noOlderComments = !1,
            "game_diplomacy" === t.filter && t.trigger("show_screen", "diplomacy_detail"),
            "game_event" === t.filter && t.trigger("show_screen", "inbox")
        }
        ,
        t.onFindOlderComments = function() {
            t.trigger("server_request", {
                type: "fetch_game_message_comments",
                message_key: t.selectedMessage.key,
                count: 100,
                offset: 0
            }),
            t.noOlderComments = !0
        }
        ,
        t.onPostComment = function(r, n) {
            n && (t.selectedMessage.comments.unshift({
                player_uid: e.player.uid,
                body: n
            }),
            t.trigger("server_request", {
                type: "create_game_message_comment",
                message_key: t.selectedMessage.key,
                body: n
            }),
            "game_diplomacy" === t.filter && t.trigger("show_screen", "diplomacy_detail"),
            t.trigger("scroll_to_bottom"))
        }
        ,
        t.onPageNext = function() {
            t.messages[t.filter] && (t.messages[t.filter].length < t.mpp || (t.page += 1,
            t.messages[t.filter] = null,
            t.fetchMessages(t.filter),
            t.trigger("show_screen", "inbox")))
        }
        ,
        t.onPageBack = function() {
            t.page -= 1,
            t.page < 0 && (t.page = 0),
            t.messages[t.filter] = null,
            t.fetchMessages(t.filter),
            t.trigger("show_screen", "inbox")
        }
        ,
        t.onDraftSend = function() {
            var r, n = "", o = "", a = "";
            if ("" !== t.draft.subject && "" !== t.draft.body && !(t.draft.to.length > 18)) {
                for (r = 0; r < t.draft.to.length; r += 1)
                    e.galaxy.players[t.draft.to[r]] !== e.player && (n += e.galaxy.players[t.draft.to[r]].uid,
                    n += ",",
                    o += e.galaxy.players[t.draft.to[r]].rawAlias,
                    o += ",",
                    a += e.galaxy.players[t.draft.to[r]].color,
                    a += ",");
                n = n.slice(0, -1),
                o = o.slice(0, -1),
                a = a.slice(0, -1),
                t.trigger("server_request", {
                    type: "create_game_message",
                    from_color: e.player.color,
                    to_uids: n,
                    to_aliases: o,
                    to_colors: a,
                    subject: t.draft.subject,
                    body: t.draft.body
                }),
                t.trigger("hide_screen"),
                t.clearDraft()
            }
        }
        ,
        t.clearDraft = function() {
            t.draft = {
                to: [],
                body: "",
                attachment: ""
            }
        }
        ,
        t.onDraftClear = function() {
            t.clearDraft(),
            t.trigger("show_screen", "compose")
        }
        ,
        t.onDraftAddAll = function() {
            var r;
            t.draft.to = [];
            for (r in e.galaxy.players)
                "" !== e.galaxy.players[r].alias && e.galaxy.players[r].uid !== e.player.uid && 0 === e.galaxy.players[r].conceded && t.draft.to.push(e.galaxy.players[r].uid);
            t.trigger("show_screen", "compose")
        }
        ,
        t.onAddRecipient = function(e, r) {
            t.draft.to.indexOf(r) < 0 && t.draft.to.unshift(r),
            t.trigger("show_screen", "compose")
        }
        ,
        t.onNewMessageToPlayer = function(r, n) {
            t.clearDraft(),
            n !== e.player.uid && t.draft.to.push(n),
            t.trigger("show_screen", "compose")
        }
        ,
        t.onSetFilter = function(e, r) {
            t.fetchMessages(r),
            t.trigger("show_screen", "inbox")
        }
        ,
        t.onShowInbox = function() {
            t.unreadEvents > t.unreadDiplomacy ? t.onSetFilter(null, "game_event") : t.onSetFilter(null, "game_diplomacy")
        }
        ,
        t.hyperlinkMessage = function(t) {
            var r, n, o, a;
            for (r in e.galaxy.players)
                n = e.galaxy.players[r],
                a = "\\[\\[" + n.uid + "\\]\\] " + n.rawAlias,
                o = new RegExp(a,"g"),
                t = t.replace(o, n.hyperlinkedBox + n.hyperlinkedRawAlias);
            return t = Crux.format(t, e.hyperlinkedMessageInserts)
        }
        ,
        t.on("show_inbox", t.onShowInbox),
        t.on("inbox_page_next", t.onPageNext),
        t.on("inbox_page_back", t.onPageBack),
        t.on("inbox_read_message", t.onMessageRead),
        t.on("inbox_select_message", t.onSelectMessage),
        t.on("find_older_comments", t.onFindOlderComments),
        t.on("inbox_read_all", t.onReadAll),
        t.on("inboxt_post_comment", t.onPostComment),
        t.on("inbox_set_filter", t.onSetFilter),
        t.on("inbox_relaod_filter", t.reloadFilter),
        t.on("inbox_draft_send", t.onDraftSend),
        t.on("inboxt_draft_clear", t.onDraftClear),
        t.on("inboxt_draft_addall", t.onDraftAddAll),
        t.on("inbox_add_recipient", t.onAddRecipient),
        t.on("inbox_new_message_to_player", t.onNewMessageToPlayer),
        t.on("message:new_comments", t.onNewComments),
        t.on("message:new_messages", t.onNewMessages),
        t.on("message:unread_count", t.onUnreadCount),
        t
    }
}(),
!NeptunesPride)
    var NeptunesPride = {};
if (function() {
    NeptunesPride.InterfaceScreens = function(e, t, r) {
        "use strict";
        e.GiftItem = function(e) {
            var t = Crux.Widget("rel").size(480);
            return Crux.Widget("rel col_base").size(480, 16).roost(t),
            t.icon = Crux.Image("../images/badges/" + e.icon + ".png", "abs").grid(.25, 1, 6, 6).roost(t),
            t.body = Crux.Text("gift_desc_" + e.icon, "rel txt_selectable").size(360).pos(108).roost(t),
            t.buyNowBg = Crux.Widget("rel").size(480, 52).roost(t),
            t.buyNowButton = Crux.Button("buy_now", "buy_gift", e).grid(20, 0, 10, 3).roost(t.buyNowBg),
            e.amount > NeptunesPride.account.credits && t.buyNowButton.disable(),
            Crux.Widget("rel col_accent").size(480, 4).roost(t),
            t
        }
        ,
        e.BuyGiftScreen = function() {
            var r = e.Screen("gift_heading").size(480);
            Crux.Text("gift_intro", "rel pad12 col_accent txt_center").format({
                player: t.selectedPlayer.colourBox + t.selectedPlayer.hyperlinkedAlias
            }).size(480).roost(r),
            e.GalacticCreditBalance().roost(r);
            var n, o = [{
                icon: "trek",
                amount: 1
            }, {
                icon: "rebel",
                amount: 1
            }, {
                icon: "empire",
                amount: 1
            }, {
                icon: "wolf",
                amount: 5
            }, {
                icon: "pirate",
                amount: 5
            }, {
                icon: "wordsmith",
                amount: 2
            }, {
                icon: "lucky",
                amount: 2
            }, {
                icon: "ironborn",
                amount: 2
            }, {
                icon: "strange",
                amount: 2
            }, {
                icon: "cheesy",
                amount: 1
            }, {
                icon: "strategic",
                amount: 1
            }, {
                icon: "badass",
                amount: 1
            }, {
                icon: "lionheart",
                amount: 1
            }, {
                icon: "gun",
                amount: 1
            }, {
                icon: "command",
                amount: 1
            }, {
                icon: "science",
                amount: 1
            }, {
                icon: "nerd",
                amount: 1
            }, {
                icon: "merit",
                amount: 1
            }];
            for (n = o.length - 1; n >= 0; n--)
                o[n].puid = t.selectedPlayer.uid,
                e.GiftItem(o[n]).roost(r);
            return r
        }
        ,
        e.GalacticCreditBalance = function() {
            var e = Crux.Widget("rel col_black").size(480);
            return e.bg = Crux.Widget("rel").size(480, 48).roost(e),
            Crux.Text("galactic_credit_balance", "pad12").format({
                x: NeptunesPride.account.credits
            }).size(480, 48).roost(e.bg),
            Crux.Button("buy_credits", "browse_to", "../#buy_credits").addStyle("col_google_red").grid(20, 0, 10, 3).roost(e),
            NeptunesPride.account.credits <= 0 && Crux.Text("need_credits", "rel pad12 col_accent txt_center").size(480).roost(e),
            e
        }
        ,
        e.BuyPremiumGiftScreen = function() {
            var r = e.Screen("gift_premium_heading").size(480);
            Crux.Text("gift_premium_intro", "rel pad12 col_accent txt_center").format({
                player: t.selectedPlayer.colourBox + t.selectedPlayer.hyperlinkedAlias
            }).size(480).roost(r),
            e.GalacticCreditBalance().roost(r);
            var n, o = [{
                icon: "1_month",
                amount: 5
            }, {
                icon: "3_month",
                amount: 12
            }, {
                icon: "12_month",
                amount: 24
            }, {
                icon: "lifetime",
                amount: 48
            }];
            for (n = o.length - 1; n >= 0; n--)
                o[n].puid = t.selectedPlayer.uid,
                e.GiftItem(o[n]).roost(r);
            return Crux.Text("gift_premium_footer", "rel pad12 col_accent txt_center").size(480).roost(r),
            r
        }
        ,
        e.BulkUpgradeScreen = function() {
            var r = e.Screen("bulk_upgrade_heading").size(480);
            if (t.player) {
                var n = Crux.Widget("rel col_accent").grid(0, 0, 30, 11).roost(r);
                Crux.Text("bulk_upgrade_intro", "pad12").grid(0, .5, 20, 9).roost(n),
                r.amount = Crux.TextInput("single", "", "number").grid(20, 1, 10, 3).setValue(t.player.cash).roost(n);
                var o = {
                    economy: Crux.localise("economy"),
                    industry: Crux.localise("industry"),
                    science: Crux.localise("science")
                };
                return r.infKind = Crux.DropDown("e", o).grid(20, 4, 10, 3).roost(n),
                r.buy = Crux.Button("buy_cheapest", "pre_bulk_upgrade").grid(20, 7, 10, 3).roost(n),
                Crux.Widget("rel").grid(0, 0, 30, 1).roost(r),
                r.onPreBulkUpgrade = function() {
                    var e = {
                        amount: r.amount.getValue(),
                        kind: r.infKind.getValue(),
                        localised_kind: Crux.localise(r.infKind.getValue())
                    }
                      , t = {
                        message: "sure_you_want_bulk_upgrade",
                        messageTemplateData: e,
                        eventKind: "bulk_upgrade",
                        eventData: e
                    };
                    r.trigger("show_screen", ["confirm", t])
                }
                ,
                r.on("pre_bulk_upgrade", r.onPreBulkUpgrade),
                r
            }
        }
        ,
        e.HelpScreen = function() {
            var r = e.Screen("triton_codex").size(480);
            return Crux.IconButton("icon-help", "show_help", "index").grid(24.5, 0, 3, 3).roost(r),
            r.postRoost = function() {
                $("a").click(function(e) {
                    var t = $(this).attr("href").split("/");
                    return "help" === t[1] ? (e.preventDefault(),
                    r.trigger("show_help", t[t.length - 1]),
                    !1) : !0
                })
            }
            ,
            t.helpHTML ? (Crux.Text("", "help rel pad12 txt_selectable col_accent").rawHTML(t.helpHTML).roost(r),
            r.footer = Crux.Widget("rel col_black").size(480, 48).roost(r),
            Crux.Button("help_index", "show_help", "index").grid(20, 0, 10, 3).roost(r.footer),
            r) : (Crux.Text("loading", "rel pad12 txt_selectable txt_center col_accent").roost(r),
            r)
        }
        ,
        e.DirectoryTabs = function(e) {
            var t = Crux.Widget("rel").size(480, 48);
            return Crux.Widget("col_accent_light").grid(0, 2.5, 30, .5).roost(t),
            t.starTab = Crux.Tab("stars", "show_screen", "star_dir").grid(0, -.5, 10, 3).roost(t),
            t.fleetTab = Crux.Tab("fleets", "show_screen", "fleet_dir").grid(10, -.5, 10, 3).roost(t),
            t.shipTab = Crux.Tab("ships", "show_screen", "ship_dir").grid(20, -.5, 10, 3).roost(t),
            "fleet" === e && t.fleetTab.activate(),
            "star" === e && t.starTab.activate(),
            "ship" === e && t.shipTab.activate(),
            t
        }
        ,
        e.FleetDirectory = function() {
            var r, n, o = e.Screen("galaxy").size(480);
            e.DirectoryTabs("fleet").roost(o);
            var a = "filter_show_mine_fleets";
            "my_fleets" === t.fleetDirectory.filter && (a = "filter_show_all_fleets"),
            Crux.Text(a, "rel pad12 col_accent").roost(o);
            var i = [];
            for (r in t.galaxy.fleets)
                "my_fleets" === t.fleetDirectory.filter ? t.galaxy.fleets[r].player === t.player && i.push(t.galaxy.fleets[r]) : i.push(t.galaxy.fleets[r]);
            "name" === t.fleetDirectory.sortBy && i.sort(function(e, r) {
                var n = -1;
                return e.n < r.n && (n = 1),
                n *= t.fleetDirectory.invert
            }),
            ("st" === t.fleetDirectory.sortBy || "puid" === t.fleetDirectory.sortBy || "etaFirst" === t.fleetDirectory.sortBy || "eta" === t.fleetDirectory.sortBy) && i.sort(function(e, r) {
                var n = r[t.fleetDirectory.sortBy] - e[t.fleetDirectory.sortBy];
                return 0 === n && (n = 1,
                e.n < r.n && (n = -1)),
                n *= t.fleetDirectory.invert
            }),
            "w" === t.fleetDirectory.sortBy && i.sort(function(e, r) {
                var n = r.path.length - e.path.length;
                return 0 === n && (n = 1,
                e.n < r.n && (n = -1)),
                n *= t.fleetDirectory.invert
            });
            var s = "<table class='star_directory'>";
            for (s += "<tr><td><a onClick=\"Crux.crux.trigger('fleet_dir_sort', 'puid')\">P</a></td>",
            s += "<td class='star_directory_name'><a onClick=\"Crux.crux.trigger('fleet_dir_sort', 'name')\">Name</a></td>",
            s += "<td></td>",
            s += "<td><a onClick=\"Crux.crux.trigger('fleet_dir_sort', 'st')\">Ships</a></td>",
            s += "<td><a onClick=\"Crux.crux.trigger('fleet_dir_sort', 'w')\">W</a></td>",
            s += "<td><a onClick=\"Crux.crux.trigger('fleet_dir_sort', 'etaFirst')\">ETA</a></td>",
            s += "<td><a onClick=\"Crux.crux.trigger('fleet_dir_sort', 'eta')\">Total ETA</a></td>",
            s += "</tr>",
            n = i.length - 1; n >= 0; n--) {
                var l = "";
                s += "<tr>",
                s += "<td>",
                i[n].player && (s += i[n].player.colourBox),
                s += "</td>",
                l = "Crux.crux.trigger('show_fleet_screen_uid' , '" + i[n].uid + "' )",
                s += '<td class="star_directory_name"> <a onClick="' + l + '"> ' + i[n].n + " </a> </td>",
                l = "Crux.crux.trigger('show_fleet_uid' , '" + i[n].uid + "' )",
                s += '<td> <a onClick="' + l + '" class="ic-eye">&#59146;</a> </td>',
                s += "<td> " + i[n].st + "</td>",
                s += "<td> " + i[n].path.length,
                i[n].loop && (s += " <span class='icon-loop'></span>"),
                s += "</td>",
                s += "<td> " + t.timeToTick(i[n].etaFirst, !0) + "</td>",
                s += "<td> " + t.timeToTick(i[n].eta, !0) + "</td>",
                s += "</tr>"
            }
            return s += "</table>",
            Crux.Text("", "rel").rawHTML(s).roost(o),
            o
        }
        ,
        e.StarDirectory = function() {
            var r, n, o, a = e.Screen("galaxy").size(480);
            t.rawExportStar = [],
            t.rawExportStars = "",
            e.DirectoryTabs("star").roost(a);
            var i = Crux.Widget("rel pad12 col_base").size(480, 48).roost(a);
            Crux.IconButton("icon-dollar", "show_screen", "bulk_upgrade").grid(27, 0, 3, 3).roost(i);
            var s = {
                off: "Disable Upgrades",
                on: "Enable Upgrades"
            }
              , l = "on";
            t.interfaceSettings.allowBuyGalaxyScreen || (l = "off"),
            a.allowBuyGalaxyScreen = Crux.DropDown(l, s, "setting_change").grid(15.5, 0, 12, 3).roost(i),
            a.onSettingChange = function() {
                "on" === a.allowBuyGalaxyScreen.getValue() ? t.setInterfaceSetting("allowBuyGalaxyScreen", !0) : t.setInterfaceSetting("allowBuyGalaxyScreen", !1),
                a.trigger("refresh_interface")
            }
            ,
            a.on("setting_change", a.onSettingChange);
            var c = "filter_show_mine";
            "my_stars" === t.starDirectory.filter && (c = "filter_show_all"),
            Crux.Text(c, "rel pad12 col_accent").roost(a);
            var u = [];
            for (r in t.galaxy.stars)
                "my_stars" === t.starDirectory.filter ? t.galaxy.stars[r].player === t.player && u.push(t.galaxy.stars[r]) : u.push(t.galaxy.stars[r]);
            "name" === t.starDirectory.sortBy && u.sort(function(e, r) {
                var n = -1;
                return e.n < r.n && (n = 1),
                n *= t.starDirectory.invert
            }),
            ("uce" === t.starDirectory.sortBy || "uci" === t.starDirectory.sortBy || "ucs" === t.starDirectory.sortBy || "puid" === t.starDirectory.sortBy || "e" === t.starDirectory.sortBy || "i" === t.starDirectory.sortBy || "s" === t.starDirectory.sortBy) && u.sort(function(e, r) {
                var n = r[t.starDirectory.sortBy] - e[t.starDirectory.sortBy];
                return 0 === n && (n = 1,
                e.n < r.n && (n = -1)),
                n *= t.starDirectory.invert
            });
            var d = "<table class='star_directory'>";
            for (d += "<tr><td><a onClick=\"Crux.crux.trigger('star_dir_sort', 'puid')\">P</a></td>",
            d += "<td class='star_directory_name'><a onClick=\"Crux.crux.trigger('star_dir_sort', 'name')\">Name</a></td>",
            d += "<td></td>",
            d += "<td><a onClick=\"Crux.crux.trigger('star_dir_sort', 'e')\">E</a></td>",
            d += "<td><a onClick=\"Crux.crux.trigger('star_dir_sort', 'i')\">I</a></td>",
            d += "<td><a onClick=\"Crux.crux.trigger('star_dir_sort', 's')\">S</a></td>",
            d += "<td><a onClick=\"Crux.crux.trigger('star_dir_sort', 'uce')\">$ E</a></td>",
            d += "<td><a onClick=\"Crux.crux.trigger('star_dir_sort', 'uci')\">$ I</a></td>",
            d += "<td><a onClick=\"Crux.crux.trigger('star_dir_sort', 'ucs')\">$ S</a></td>",
            d += "</tr>",
            o = u.length - 1; o >= 0; o--) {
                n = u[o],
                t.rawExportStar = [],
                t.rawExportStar.push(n.r),
                t.rawExportStar.push(n.n),
                t.rawExportStar.push(n.e),
                t.rawExportStar.push(n.i),
                t.rawExportStar.push(n.s),
                t.rawExportStar.push(n.uce),
                t.rawExportStar.push(n.uci),
                t.rawExportStar.push(n.ucs),
                t.rawExportStar.push(n.st),
                t.rawExportStar.push(n.totalDefenses),
                t.rawExportStars += t.rawExportStar.join(",") + "\n";
                var p = "";
                d += "<tr>",
                d += "<td>",
                u[o].player && (d += u[o].player.colourBox),
                d += "</td>",
                p = "Crux.crux.trigger('show_star_screen_uid' , '" + u[o].uid + "' )",
                d += '<td class="star_directory_name"> <a onClick="' + p + '"> ' + u[o].n + " </a> </td>",
                p = "Crux.crux.trigger('show_star_uid' , '" + u[o].uid + "' ); Crux.crux.trigger('star_dir_row_hilight' , '" + o + "' )",
                d += t.StarDirRowHilight === o ? '<td> <a onClick="' + p + '" class="ic-eye txt_warn_bad">&#59146;</a> </td>' : '<td> <a onClick="' + p + '" class="ic-eye">&#59146;</a> </td>',
                d += "<td> " + u[o].e + "</td>",
                d += "<td> " + u[o].i + "</td>",
                d += "<td> " + u[o].s + "</td>",
                t.player.conceded > 0 && (t.interfaceSettings.allowBuyGalaxyScreen = !1),
                d += u[o].player === t.player && t.player.cash >= u[o].uce && t.interfaceSettings.allowBuyGalaxyScreen ? "<td> <a  onClick=\"event.preventDefault();Crux.crux.trigger('star_dir_upgrade_e', '" + u[o].uid + "')\"  >$" + u[o].uce + "</a></td>" : "<td> $" + u[o].uce + "</td>",
                d += u[o].player === t.player && t.player.cash >= u[o].uci && t.interfaceSettings.allowBuyGalaxyScreen ? "<td> <a  onClick=\"event.preventDefault();Crux.crux.trigger('star_dir_upgrade_i', '" + u[o].uid + "')\"  >$" + u[o].uci + "</a></td>" : "<td> $" + u[o].uci + "</td>",
                d += u[o].player === t.player && t.player.cash >= u[o].ucs && t.interfaceSettings.allowBuyGalaxyScreen ? "<td> <a  onClick=\"event.preventDefault();Crux.crux.trigger('star_dir_upgrade_s', '" + u[o].uid + "')\"  >$" + u[o].ucs + "</a></td>" : "<td> $" + u[o].ucs + "</td>",
                d += "</tr>"
            }
            return d += "</table>",
            Crux.Text("", "rel").rawHTML(d).roost(a),
            a
        }
        ,
        e.ShipDirectory = function() {
            var r, n, o = e.Screen("galaxy").size(480);
            e.DirectoryTabs("ship").roost(o);
            var a = "filter_show_mine_ships";
            "my_ships" === t.shipDirectory.filter && (a = "filter_show_all_ships"),
            Crux.Text(a, "rel pad12 col_accent").roost(o);
            var i = [];
            for (r in t.galaxy.fleets)
                "my_ships" === t.shipDirectory.filter ? t.galaxy.fleets[r].player === t.player && i.push(t.galaxy.fleets[r]) : i.push(t.galaxy.fleets[r]);
            for (r in t.galaxy.stars)
                "my_ships" === t.shipDirectory.filter ? t.galaxy.stars[r].player === t.player && i.push(t.galaxy.stars[r]) : i.push(t.galaxy.stars[r]);
            "name" === t.shipDirectory.sortBy && i.sort(function(e, r) {
                var n = -1;
                return e.n < r.n && (n = 1),
                n *= t.shipDirectory.invert
            }),
            ("st" === t.shipDirectory.sortBy || "puid" === t.shipDirectory.sortBy) && i.sort(function(e, r) {
                var n = r[t.shipDirectory.sortBy] - e[t.shipDirectory.sortBy];
                return 0 === n && (n = 1,
                e.n < r.n && (n = -1)),
                n *= t.shipDirectory.invert
            });
            var s = "<table class='star_directory'>";
            for (s += "<tr><td><a onClick=\"Crux.crux.trigger('ship_dir_sort', 'puid')\">P</a></td>",
            s += "<td class='star_directory_name'><a onClick=\"Crux.crux.trigger('ship_dir_sort', 'name')\">Name</a></td>",
            s += "<td></td>",
            s += "<td></td>",
            s += "<td><a onClick=\"Crux.crux.trigger('ship_dir_sort', 'st')\">Ships</a></td>",
            s += "</tr>",
            n = i.length - 1; n >= 0; n--) {
                var l = "";
                s += "<tr>",
                s += "<td>",
                i[n].player && (s += i[n].player.colourBox),
                s += "</td>",
                "fleet" === i[n].kind ? (l = "Crux.crux.trigger('show_fleet_screen_uid' , '" + i[n].uid + "' )",
                s += '<td class="star_directory_name"> <a onClick="' + l + '"> ' + i[n].n + " </a> </td>",
                l = "Crux.crux.trigger('show_fleet_uid' , '" + i[n].uid + "' )",
                s += '<td> <a onClick="' + l + '" class="ic-eye">&#59146;</a> </td>',
                s += "<td> <span class=icon-rocket></span></td>",
                s += "<td> " + i[n].st + "</td>") : (l = "Crux.crux.trigger('show_star_screen_uid' , '" + i[n].uid + "' )",
                s += '<td class="star_directory_name"> <a onClick="' + l + '"> ' + i[n].n + " </a> </td>",
                l = "Crux.crux.trigger('show_star_uid' , '" + i[n].uid + "' )",
                s += '<td> <a onClick="' + l + '" class="ic-eye">&#59146;</a> </td>',
                s += "<td> <span class=icon-star-1></span></td>",
                s += "<td> " + i[n].st + "</td>"),
                s += "</tr>"
            }
            return s += "</table>",
            Crux.Text("", "rel").rawHTML(s).roost(o),
            o
        }
        ,
        e.CombatCalc = function() {
            var r = e.Screen("combat_calculator").size(480, 480);
            Crux.Widget("rel").size(480, 432).roost(r);
            var n = 10
              , o = 1;
            return t.selectedSpaceObject && (n = t.selectedSpaceObject.st,
            "star" === t.selectedSpaceObject.kind && (n = t.selectedSpaceObject.totalDefenses),
            t.selectedSpaceObject.player && (o = t.selectedSpaceObject.player.tech.weapons.value)),
            Crux.Text("defender_weapon_tech", "pad12 col_accent").grid(0, 3, 30, 3).roost(r),
            Crux.Text("defender_ships", "pad12 col_accent").grid(0, 6, 30, 3).roost(r),
            Crux.Text("defender_ships_bonus", "pad12 col_accent").grid(0, 9, 30, 3).roost(r),
            Crux.Widget("col_black").grid(0, 12, 30, .5).roost(r),
            Crux.Text("attacker_weapon_tech", "pad12 col_accent").grid(0, 13.5, 30, 3).roost(r),
            Crux.Text("attacker_ships", "pad12 col_accent").grid(0, 16.5, 30, 3).roost(r),
            Crux.Widget("col_black").grid(0, 19.5, 30, .5).roost(r),
            r.dwt = Crux.TextInput("single", "", "number").setText(o).grid(20, 3, 10, 3).roost(r),
            r.ds = Crux.TextInput("single", "", "number").setText(n).grid(20, 6, 10, 3).roost(r),
            Crux.Text("", "pad4 col_base rad4 txt_center").grid(20, 9, 10, 3).inset(8).rawHTML("+1 Weapons").roost(r),
            r.awt = Crux.TextInput("single", "", "number").setText(o).grid(20, 13.5, 10, 3).roost(r),
            r.as = Crux.TextInput("single", "", "number").setText(n).grid(20, 16.5, 10, 3).roost(r),
            Crux.Button("fight", "pre_calculate_combat").grid(20, 21, 10, 3).roost(r),
            r.result = Crux.Text("", "pad12 col_accent txt_center").grid(0, 25, 30, 3).rawHTML("").roost(r),
            r.onPreCalcCombat = function() {
                var e = r.dwt.getText()
                  , t = r.ds.getText()
                  , n = r.awt.getText()
                  , o = r.as.getText();
                if (0 === t || 0 === o)
                    return r.result.update("combat_calc_no_combat"),
                    void 0;
                e += 1;
                for (var a = ""; !a; ) {
                    if (o -= e,
                    0 >= o) {
                        a = "defender";
                        break
                    }
                    if (t -= n,
                    0 >= t) {
                        a = "attacker";
                        break
                    }
                }
                var i = {};
                i.as = o,
                i.ds = t,
                "attacker" == a ? r.result.updateFormat("combat_calc_win_attack", i) : r.result.updateFormat("combat_calc_win_defend", i)
            }
            ,
            r.on("pre_calculate_combat", r.onPreCalcCombat),
            r
        }
        ,
        e.IntelDataSelection = function() {
            var e = Crux.Widget("rel col_accent").size(480, 48)
              , r = {
                ts: "Total Stars",
                e: "Total Economy",
                i: "Total Industry",
                s: "Total Science",
                sh: "Total Ships",
                fl: "Total Carriers",
                wt: "Weapons",
                bt: "Banking",
                mt: "Manufacturing",
                ht: "Hyperspace",
                st: "Scanning",
                gt: "Experimentation",
                tt: "Terraforming"
            };
            return e.dataType = Crux.DropDown(t.intelDataType, r, "intel_selection_change").grid(10, 0, 20, 3).roost(e),
            e
        }
        ,
        e.IntelFooter = function() {
            var e = Crux.Widget("rel").size(480, 92);
            Crux.Button("all", "intel_player_filter_all").grid(.5, .5, 5, 3).roost(e),
            Crux.Button("none", "intel_player_filter_none").grid(5.5, .5, 5, 3).roost(e);
            var r = Crux.Widget("rel").size(256).pos(196, 2).roost(e)
              , n = -2
              , o = 1
              , a = 0;
            for (t.playerCount < 8 && (n += (16 - 2 * t.playerCount) / 2); a < t.playerCount; ) {
                n += 2,
                n >= 16 && (n = 0,
                o += 2,
                t.playerCount - a < 8 && (n += (16 - 2 * (t.playerCount - a)) / 2));
                var i = t.galaxy.players[a]
                  , s = Crux.Clickable("intel_player_filter_change", i.uid).grid(n, o, 2, 2).roost(r);
                t.intelPlayerToChart.indexOf(i.uid) >= 0 && Crux.Widget("col_accent rad4").grid(0, 0, 2, 2).roost(s),
                Crux.Widget("pci_32_" + i.uid).grid(0, 0, 2, 2).roost(s),
                a += 1
            }
            return e.size(480, 16 * o + 48),
            e
        }
        ,
        e.IntelChart = function() {
            var e = Crux.Widget("rel").size(480, 256)
              , r = new google.visualization.LineChart(e.ui[0]);
            return r.draw(t.intelData, t.IntelChartOptions),
            e
        }
        ,
        e.Intel = function() {
            var r = e.Screen("intel");
            return e.IntelDataSelection().roost(r),
            t.intelDataNone ? Crux.Text("no_intel_data", "rel pad12 col_black txt_center").size(480, 0).roost(r) : (t.intelData ? e.IntelChart().roost(r) : Crux.Text("loading", "rel pad12 col_black txt_center").size(480, 0).roost(r),
            e.trigger("intel_request")),
            e.IntelFooter().roost(r),
            r
        }
        ,
        e.NewFleetScreen = function(r) {
            t.selectStar(r);
            var n = e.Screen("new_fleet").size(480, 344);
            n.footerRequired = !1;
            var o = t.selectedStar.st;
            if (0 >= o)
                return n;
            if (t.player.cash < 25)
                return n;
            Crux.Text("new_fleet_body", "pad12 col_black txt_center rel").size(480).roost(n);
            var a = Crux.Widget("rel col_black").size(480, 248).roost(n);
            return Crux.Widget("col_accent").grid(10, 0, 20, 15).roost(a),
            Crux.Text("", "txt_center").rawHTML(t.selectedStar.n).grid(10, 1, 10, 3).roost(a),
            Crux.Text("new_carrier", "txt_center").grid(20, 1, 10, 3).roost(a),
            n.starSt = Crux.TextInput("single", "", "number").grid(10, 3, 10, 3).setText(0).roost(a),
            n.fleetSt = Crux.TextInput("single", "", "number").grid(20, 3, 10, 3).setText(t.selectedStar.st).roost(a),
            n.starSt.eventKind = "new_fleet_star_change",
            n.fleetSt.eventKind = "new_fleet_fleet_change",
            n.noneBtn = Crux.Button("min", "new_fleet_none").grid(10, 6, 5, 3).roost(a),
            n.lessBtn = Crux.IconButton("icon-left-open", "new_fleet_less").grid(17, 6, 3, 3).roost(a),
            n.moreBtn = Crux.IconButton("icon-right-open", "new_fleet_more").grid(20, 6, 3, 3).roost(a),
            n.allBtn = Crux.Button("max", "new_fleet_all").grid(25, 6, 5, 3).roost(a),
            Crux.Widget("col_black").grid(0, 11, 30, 3).roost(a),
            n.subBtn = Crux.Button("new_fleet_for_25", "new_fleet_submit").grid(17, 11, 13, 3).roost(a),
            Crux.Image("../images/tech_dock.jpg", "abs").grid(0, 0, 10, 15).roost(a),
            n.onSubmit = function() {
                n.trigger("new_fleet", {
                    strength: n.fleetSt.getText()
                })
            }
            ,
            n.onNone = function() {
                n.fleetSt.setText(1),
                n.starSt.setText(o - 1)
            }
            ,
            n.onLess = function() {
                n.fleetSt.getText() > 1 && (n.starSt.setText(n.starSt.getText() + 1),
                n.fleetSt.setText(n.fleetSt.getText() - 1))
            }
            ,
            n.onMore = function() {
                n.starSt.getText() > 0 && (n.starSt.setText(n.starSt.getText() - 1),
                n.fleetSt.setText(n.fleetSt.getText() + 1))
            }
            ,
            n.onAll = function() {
                n.fleetSt.setText(o),
                n.starSt.setText(0),
                n.subBtn.enable()
            }
            ,
            n.onStarChange = function() {
                n.starSt.getText() > o - 1 || n.starSt.getText() < 0 ? n.subBtn.disable() : (n.fleetSt.setText(o - n.starSt.getText()),
                n.subBtn.enable())
            }
            ,
            n.onFleetChange = function() {
                n.fleetSt.getText() > o || n.fleetSt.getText() < 1 ? n.subBtn.disable() : (n.starSt.setText(o - n.fleetSt.getText()),
                n.subBtn.enable())
            }
            ,
            n.on("new_fleet_submit", n.onSubmit),
            n.on("new_fleet_star_change", n.onStarChange),
            n.on("new_fleet_fleet_change", n.onFleetChange),
            n.on("new_fleet_none", n.onNone),
            n.on("new_fleet_less", n.onLess),
            n.on("new_fleet_more", n.onMore),
            n.on("new_fleet_all", n.onAll),
            n
        }
        ,
        e.ShipTransferScreen = function() {
            var r = e.Screen("ship_transfer").size(480, 368);
            r.footerRequired = !1;
            var n = t.selectedFleet.orbiting.st + t.selectedFleet.st;
            if (0 >= n)
                return r;
            Crux.Text("ship_transfer_body", "pad12 col_black txt_center rel").size(480).roost(r);
            var o = Crux.Widget("rel col_black").size(480, 256).roost(r);
            return Crux.Widget("col_accent").grid(10, 0, 20, 15).roost(o),
            Crux.Text("star_name", "txt_center").rawHTML(t.selectedFleet.orbiting.n).grid(10, 1, 10, 3).roost(o),
            Crux.Text("fleet_name", "txt_center").rawHTML(t.selectedFleet.n).grid(20, 1, 10, 3).roost(o),
            r.starSt = Crux.TextInput("single", "", "number").grid(10, 3, 10, 3).setText(0).roost(o),
            r.fleetSt = Crux.TextInput("single", "", "number").grid(20, 3, 10, 3).setText(t.selectedFleet.st + t.selectedFleet.orbiting.st).roost(o),
            r.starSt.eventKind = "ship_transfer_star_change",
            r.fleetSt.eventKind = "ship_transfer_fleet_change",
            r.noneBtn = Crux.Button("min", "ship_transfer_none").grid(10, 6, 5, 3).roost(o),
            r.lessBtn = Crux.IconButton("icon-left-open", "ship_transfer_less").grid(17, 6, 3, 3).roost(o),
            r.moreBtn = Crux.IconButton("icon-right-open", "ship_transfer_more").grid(20, 6, 3, 3).roost(o),
            r.allBtn = Crux.Button("max", "ship_transfer_all").grid(25, 6, 5, 3).roost(o),
            Crux.Widget("col_black").grid(0, 11, 30, 3).roost(o),
            r.subBtn = Crux.Button("transfer", "ship_transfer_submit").grid(17, 11, 10.5, 3).roost(o),
            Crux.IconButton("icon-plus-circled", "ship_transfer_submit_dispatch").grid(27, 11, 3, 3).roost(o),
            Crux.Image("../images/tech_shields.jpg", "abs").grid(0, 0, 10, 15).roost(o),
            r.onStarChange = function() {
                r.starSt.getText() > n - 1 || r.starSt.getText() < 0 ? r.subBtn.disable() : (r.fleetSt.setText(n - r.starSt.getText()),
                r.subBtn.enable())
            }
            ,
            r.onFleetChange = function() {
                r.fleetSt.getText() > n || r.fleetSt.getText() < 1 ? r.subBtn.disable() : (r.starSt.setText(n - r.fleetSt.getText()),
                r.subBtn.enable())
            }
            ,
            r.onNone = function() {
                r.fleetSt.setText(1),
                r.starSt.setText(n - 1),
                r.subBtn.enable()
            }
            ,
            r.onLess = function() {
                r.fleetSt.getText() > 1 && (r.starSt.setText(r.starSt.getText() + 1),
                r.fleetSt.setText(r.fleetSt.getText() - 1))
            }
            ,
            r.onMore = function() {
                r.starSt.getText() > 0 && (r.starSt.setText(r.starSt.getText() - 1),
                r.fleetSt.setText(r.fleetSt.getText() + 1))
            }
            ,
            r.onAll = function() {
                r.fleetSt.setText(n),
                r.starSt.setText(0),
                r.subBtn.enable()
            }
            ,
            r.onSubmit = function() {
                r.trigger("ship_transfer", {
                    star: r.starSt.getText(),
                    fleet: r.fleetSt.getText()
                })
            }
            ,
            r.onSubmitDispatch = function() {
                r.onSubmit(),
                e.trigger("start_edit_waypoints", {
                    fleet: t.selectedFleet
                })
            }
            ,
            r.on("ship_transfer_submit_dispatch", r.onSubmitDispatch),
            r.on("ship_transfer_submit", r.onSubmit),
            r.on("ship_transfer_star_change", r.onStarChange),
            r.on("ship_transfer_fleet_change", r.onFleetChange),
            r.on("ship_transfer_none", r.onNone),
            r.on("ship_transfer_less", r.onLess),
            r.on("ship_transfer_more", r.onMore),
            r.on("ship_transfer_all", r.onAll),
            r
        }
        ,
        e.EditFleetOrder = function(r) {
            var n = e.Screen("edit_fleet_order").size(480);
            Crux.Image("../images/joingame_01.jpg", "rel img_black_cap").size(480, 96).roost(n),
            n.bg = Crux.Widget("rel col_accent").size(480, 112).roost(n),
            n.screenConfig = r,
            n.fleet = t.galaxy.fleets[r.fleet],
            n.order = n.fleet.orders[r.order];
            var o = n.order[0]
              , a = t.galaxy.stars[n.order[1]].n
              , i = n.order[2]
              , s = n.order[3];
            Crux.Text("delay", "txt_center").grid(0, 1.5, 5, 3).roost(n.bg),
            n.delay = Crux.TextInput("single", "efo_setting_change", "number").grid(0, 3, 5, 3).setValue(o).roost(n.bg),
            Crux.Text("destination", "txt_center").grid(5, 1.5, 10, 3).roost(n.bg),
            Crux.Text("", "rad4 pad4 col_black txt_center").grid(5, 3, 10, 3).nudge(0, 6, 0, -12).rawHTML(a).roost(n.bg),
            Crux.Text("action", "txt_center").grid(15, 1.5, 10, 3).roost(n.bg);
            var l = {
                0: "Do Nothing",
                1: "Collect All",
                2: "Drop All",
                3: "Collect",
                4: "Drop",
                5: "Collect All But",
                6: "Drop All But",
                7: "Garrison Star"
            };
            return n.action = Crux.DropDown(String(i), l, "efo_setting_change_action").grid(15, 3, 10, 3).roost(n.bg),
            Crux.Text("ships", "txt_center").grid(25, 1.5, 5, 3).roost(n.bg),
            n.amountDisabled = Crux.Widget("col_base rad4").grid(25, 3, 5, 3).inset(6).roost(n.bg),
            n.amount = Crux.TextInput("single", "efo_setting_change", "number").setValue(Number(s)).grid(25, 3, 5, 3).roost(n.bg),
            n.OKbg = Crux.Widget("rel col_black").size(480, 48).roost(n),
            Crux.Button("ok", "efo_ok").grid(20, 0, 10, 3).roost(n.OKbg),
            n.last = Crux.IconButton("icon-left-open", "fleet_order_last").grid(0, 0, 3, 3).roost(n.OKbg),
            n.next = Crux.IconButton("icon-right-open", "fleet_order_next").grid(2.5, 0, 3, 3).roost(n.OKbg),
            n.onFleetOrderLast = function() {
                var e = Number(n.screenConfig.order) - 1;
                0 > e && (e = n.fleet.orders.length - 1),
                n.trigger("ripple_star", t.galaxy.stars[n.fleet.orders[e][1]]),
                n.trigger("show_screen", ["edit_order", {
                    order: [[e]],
                    fleet: [[n.fleet.uid]]
                }])
            }
            ,
            n.onFleetOrderNext = function() {
                var e = Number(n.screenConfig.order) + 1;
                e >= n.fleet.orders.length && (e = 0),
                n.trigger("ripple_star", t.galaxy.stars[n.fleet.orders[e][1]]),
                n.trigger("show_screen", ["edit_order", {
                    order: [[e]],
                    fleet: [[n.fleet.uid]]
                }])
            }
            ,
            n.onOK = function() {
                e.trigger("select_fleet", {
                    fleet: n.fleet
                }),
                e.trigger("show_screen", "fleet"),
                e.trigger("submit_fleet_orders")
            }
            ,
            n.ordersThatRequireAmount = [3, 4, 5, 6, 7],
            n.onSettingsChange = function() {
                n.ordersThatRequireAmount.indexOf(Number(n.action.getValue())) < 0 ? n.amount.hide() : n.amount.show(),
                n.order[0] = Number(n.delay.getValue()),
                n.order[2] = Number(n.action.getValue()),
                n.order[3] = Number(n.amount.getValue()),
                t.calcFleetEta(n.fleet)
            }
            ,
            n.onSettingsChangeAction = function() {
                n.ordersThatRequireAmount.indexOf(Number(n.action.getValue())) >= 0 ? n.amount.setValue(1) : n.amount.setValue(0),
                n.onSettingsChange()
            }
            ,
            n.onSettingsChange(),
            n.on("efo_setting_change", n.onSettingsChange),
            n.on("efo_setting_change_action", n.onSettingsChangeAction),
            n.on("efo_ok", n.onOK),
            n.on("fleet_order_last", n.onFleetOrderLast),
            n.on("fleet_order_next", n.onFleetOrderNext),
            n
        }
        ,
        e.FLeetNavOrderHeading = function() {
            var e = Crux.Widget("rel col_accent").size(480, 48);
            Crux.Text("delay", "txt_center pad12").grid(0, 0, 4, 3).roost(e),
            Crux.Text("destination", " pad12").grid(4, 0, 8, 3).roost(e);
            var r = "action";
            return t.interfaceSettings.showFleetNavEtaDetail && (r = "eta"),
            Crux.Text(r, "pad12").grid(14, 0, 14, 3).roost(e),
            r = "show_eta",
            t.interfaceSettings.showFleetNavEtaDetail && (r = "show_action"),
            Crux.Text(r, "pad12 txt_right").grid(20, 0, 10, 3).roost(e),
            e
        }
        ,
        e.FleetNavOrder = function(e, r) {
            var n = Crux.Widget("rel").size(480, 32)
              , o = e[0]
              , a = t.galaxy.stars[e[1]];
            if (void 0 === a)
                return Crux.Text("target_star_unscanned", "rel txt_center pad12").grid(0, 0, 30, 3).roost(n),
                n;
            var i = a.n;
            t.selectedFleet.orbiting === a && (i += " *");
            var s = Crux.localise("do_nothing")
              , l = t.timeToTick(e[4]);
            return 1 === e[2] && (s = Crux.localise("collect_all_ships")),
            2 === e[2] && (s = Crux.localise("drop_all_ships")),
            3 === e[2] && (s = Crux.format(Crux.localise("collect_x_ships"), {
                amount: e[3]
            })),
            4 === e[2] && (s = Crux.format(Crux.localise("drop_x_ships"), {
                amount: e[3]
            })),
            5 === e[2] && (s = Crux.format(Crux.localise("collect_all_but_x_ships"), {
                amount: e[3]
            })),
            6 === e[2] && (s = Crux.format(Crux.localise("drop_all_but_x_ships"), {
                amount: e[3]
            })),
            7 === e[2] && (s = Crux.format(Crux.localise("garrison_star_x"), {
                amount: e[3]
            })),
            0 !== r || t.selectedFleet.orbiting ? Crux.Text("", "txt_center pad12").grid(0, 0, 4, 3).rawHTML(o).roost(n) : Crux.Text("", "txt_center pad12").grid(0, 0, 4, 3).rawHTML("-").roost(n),
            Crux.Text("", " pad12 txt_ellipsis").grid(4, 0, 8, 3).rawHTML(i).roost(n),
            t.interfaceSettings.showFleetNavEtaDetail && (s = l),
            Crux.Text("", "pad12").grid(14, 0, 14, 3).rawHTML(s).roost(n),
            t.selectedFleet.player === t.player && Crux.Text("edit_fleet_order_link", "pad12 txt_right").grid(25, 0, 5, 3).format({
                index: r,
                fuid: t.selectedFleet.uid
            }).roost(n),
            n
        }
        ,
        e.FleetNav = function() {
            var r, n, o = Crux.Widget("rel col_base").size(480), a = t.selectedFleet, i = {};
            Crux.Text("navigation", "rel section_title col_black").grid(0, 0, 30, 3).roost(o),
            a.orbiting && (i.orbiting = a.orbiting.n,
            Crux.Text("orbiting", "rel pad12 col_base").format(i).roost(o),
            a.player === t.player && a.orbiting.player && Crux.Button("ship_transfer", "show_screen", "ship_transfer").grid(20, 3, 10, 3).roost(o));
            if (a.orders.length) {
                for (e.FLeetNavOrderHeading().roost(o),
                r = 0,
                n = a.orders.length; n > r; r += 1)
                    e.FleetNavOrder(a.orders[r], r).roost(o);
                if (Crux.Widget("rel").size(480, 16).roost(o),
                a.puid === t.player.uid)
                    if (o.loopingBlock = Crux.Widget("rel col_accent").size(480, 48).roost(o),
                    a.loop)
                        Crux.Text("looping_enabled", "pad12").roost(o.loopingBlock),
                        Crux.Button("disable_looping", "loop_fleet_orders_off").grid(20, 0, 10, 3).roost(o.loopingBlock);
                    else {
                        Crux.Text("looping_disabled", "pad12").roost(o.loopingBlock);
                        var s = Crux.Button("enable_looping", "loop_fleet_orders").grid(20, 0, 10, 3).disable().roost(o.loopingBlock);
                        t.ordersLoopable() && s.enable()
                    }
                else
                    o.loopingBlock = Crux.Widget("rel col_accent").size(480, 16).roost(o)
            } else
                a.orbiting ? Crux.Text("path_empty", "rel pad12 col_accent").roost(o) : Crux.Text("path_unknown", "rel pad12 col_accent").roost(o);
            return o.etaBlock = Crux.Widget("rel col_base").size(480, 48).roost(o),
            o.eta = Crux.Text("total_eta", "pad12").roost(o.etaBlock),
            a.player === t.player && Crux.Button("edit_waypoints", "start_edit_waypoints", {
                fleet: a
            }).grid(20, 0, 10, 3).roost(o.etaBlock),
            o.onOneSecondTick = function() {
                a && (0 === a.path.length ? o.eta.hide() : o.eta.show(),
                a.path.length && o.eta && (a.path.length > 1 ? o.eta.updateFormat("total_eta", {
                    etaFirst: t.timeToTick(a.etaFirst),
                    eta: t.timeToTick(a.eta)
                }) : o.eta.updateFormat("total_eta_single", {
                    etaFirst: t.timeToTick(a.etaFirst)
                })))
            }
            ,
            o.onOneSecondTick(),
            o.on("one_second_tick", o.onOneSecondTick),
            o
        }
        ,
        e.FleetPremium = function() {
            var t = Crux.Widget("rel col_base").size(480);
            return Crux.Text("premium_features", "rel premium_section_title col_black").grid(0, 0, 30, 3).roost(t),
            NeptunesPride.account.premium && (t.bg = Crux.Widget("rel col_accent").grid(0, 0, 30, 5.5).roost(t),
            Crux.Text("rename_fleet_body", "pad12").grid(0, 0, 30, 3).roost(t.bg),
            t.renameText = Crux.TextInput("single").grid(0, 2.5, 20, 3).roost(t.bg),
            Crux.Button("rename", "pre_rename_fleet").grid(20, 2.5, 10, 3).roost(t.bg)),
            NeptunesPride.account.premium || Crux.Text("premium_features_fleet_body", "rel pad12 premium_body").size(480).roost(t),
            t.onPreRenameFleet = function() {
                e.trigger("rename_fleet", t.renameText.getValue())
            }
            ,
            t.on("pre_rename_fleet", t.onPreRenameFleet),
            t
        }
        ,
        e.FleetStatus = function() {
            var e = Crux.Widget("rel col_base").size(480, 48);
            return Crux.Text("ships", "screen_subtitle col_accent").grid(0, 0, 30, 3).roost(e),
            Crux.Text("", "screen_subtitle icon-rocket-inline txt_right").grid(0, 0, 30, 3).rawHTML(t.selectedFleet.st).roost(e),
            e
        }
        ,
        e.FleetInspector = function() {
            var r = e.Screen();
            r.heading.rawHTML(t.selectedFleet.n),
            Crux.IconButton("icon-help", "show_help", "fleets").grid(24.5, 0, 3, 3).roost(r),
            Crux.IconButton("icon-doc-text", "show_screen", "combat_calculator").grid(22, 0, 3, 3).roost(r);
            var n = "my_fleet";
            return t.selectedFleet.player !== t.player && (n = "enemy_fleet"),
            Crux.Text(n, "rel pad12 col_black txt_center").format({
                colourBox: t.selectedFleet.colourBox,
                hyperlinkedAlias: t.selectedFleet.hyperlinkedAlias
            }).roost(r),
            e.FleetStatus().roost(r),
            e.FleetNav().roost(r),
            t.selectedFleet.player === t.player && e.FleetPremium().roost(r),
            e.PlayerPanel(t.selectedFleet.player, !0).roost(r),
            r
        }
        ,
        e.StarPremium = function() {
            var t = Crux.Widget("rel col_base").size(480);
            return Crux.Text("premium_features", "rel premium_section_title col_black").grid(0, 0, 30, 3).roost(t),
            NeptunesPride.account.premium && (t.bg = Crux.Widget("rel col_accent").grid(0, 0, 30, 5.5).roost(t),
            Crux.Text("rename_star_body", "pad12").grid(0, 0, 30, 3).roost(t.bg),
            t.renameText = Crux.TextInput("single").grid(0, 2.5, 20, 3).roost(t.bg),
            Crux.Button("rename", "pre_rename_star").grid(20, 2.5, 10, 3).roost(t.bg)),
            NeptunesPride.account.premium || Crux.Text("premium_features_star_body", "rel pad12 premium_body").size(480).roost(t),
            t.onPreRenameStar = function() {
                e.trigger("rename_star", t.renameText.getValue())
            }
            ,
            t.on("pre_rename_star", t.onPreRenameStar),
            t
        }
        ,
        e.StarInfStatus = function(e) {
            var r, n = Crux.Widget("rel  col_base").size(480, 144);
            return e && n.size(480, 192),
            Crux.Widget("col_accent").grid(0, 6, 30, 3).roost(n),
            Crux.Text("infrastructure", "section_title col_black").grid(0, 0, 30, 3).roost(n),
            Crux.BlockValueBig("economy", "icon-dollar-inline", t.selectedStar.e, "col_accent").grid(0, 3, 10, 6).roost(n),
            Crux.BlockValueBig("industry", "icon-tools-inline", t.selectedStar.i, "col_base").grid(10, 3, 10, 6).roost(n),
            Crux.BlockValueBig("science", "icon-graduation-cap-inline", t.selectedStar.s, "col_accent").grid(20, 3, 10, 6).roost(n),
            e && (t.selectedStar.uce > 0 && (r = Crux.Button("upgrade_for_x", "upgrade_economy").grid(0, 9, 10, 3).format({
                cost: String(t.selectedStar.uce)
            }).roost(n),
            t.player.cash - t.selectedStar.uce < 0 && r.disable()),
            Crux.Widget("col_accent").grid(10, 9, 10, 3).roost(n),
            t.selectedStar.uci > 0 && (r = Crux.Button("upgrade_for_x", "upgrade_industry").grid(10, 9, 10, 3).format({
                cost: String(t.selectedStar.uci)
            }).roost(n),
            t.player.cash - t.selectedStar.uci < 0 && r.disable()),
            t.selectedStar.ucs > 0 && (r = Crux.Button("upgrade_for_x", "upgrade_science").grid(20, 9, 10, 3).format({
                cost: String(t.selectedStar.ucs)
            }).roost(n),
            t.player.cash - t.selectedStar.ucs < 0 && r.disable())),
            n
        }
        ,
        e.StarGateStatus = function(e) {
            function r() {
                Crux.Text("warp_gate_body_with", "pad12").grid(0, 0, 20, 3).roost(i),
                a = {
                    message: "sure_you_want_to_destroy_warpgate",
                    messageTemplateData: {
                        star_name: t.selectedStar.n
                    },
                    eventKind: "destroy_warp_gate",
                    eventData: {}
                },
                o = Crux.Button("destroy_gate", "show_screen", ["confirm", a]).grid(20, 1.5, 10, 3).format({
                    cost: String(t.selectedStar.ucg)
                }).roost(i)
            }
            function n() {
                Crux.Text("warp_gate_body_without", "pad12").grid(0, 0, 20, 3).roost(i),
                t.selectedStar.ucg > 0 && e && (a = {
                    message: "sure_you_want_to_buy_warpgate",
                    messageTemplateData: {
                        cost: t.selectedStar.ucg,
                        star_name: t.selectedStar.n
                    },
                    eventKind: "buy_warp_gate",
                    eventData: {}
                },
                o = Crux.Button("upgrade_for_x", "show_screen", ["confirm", a]).grid(20, 1.5, 10, 3).format({
                    cost: String(t.selectedStar.ucg)
                }).roost(i),
                t.player.cash - t.selectedStar.ucg < 0 && o.disable())
            }
            var o, a, i = Crux.Widget("rel col_accent").size(480, 72);
            return t.selectedStar.ga > 0 ? r() : n(),
            i
        }
        ,
        e.ShipConstructionRate = function() {
            var e = Crux.Widget("rel col_base").size(480, 48);
            return Crux.Text("ships_per_hour", "txt_center pad12").format({
                sph: t.selectedStar.shipsPerTick,
                tr: t.describeTickRate()
            }).grid(0, 0, 30, 3).roost(e),
            e
        }
        ,
        e.StarDefStatus = function() {
            var e = Crux.Widget("rel  col_black").size(480, 128);
            return Crux.Text("ships", "pad12 col_accent").grid(0, 0, 30, 3).roost(e),
            Crux.Text("", "pad12 icon-rocket-inline txt_right").grid(0, 0, 30, 3).rawHTML(t.selectedStar.st).roost(e),
            Crux.Text("natural_resources", "pad12 col_base").grid(0, 3, 30, 3).roost(e),
            Crux.Text("", "txt_right pad12 icon-globe-inline").grid(0, 3, 30, 3).rawHTML(t.selectedStar.nr).roost(e),
            Crux.Text("terraformed_resources", "pad12 col_base").grid(0, 5, 30, 3).roost(e),
            Crux.Text("", "txt_right pad12 icon-globe-inline").grid(0, 5, 30, 3).rawHTML(t.selectedStar.r).roost(e),
            e
        }
        ,
        e.StarResStatus = function(e) {
            var r, n, o, a = Crux.Widget("rel col_black").size(480, 104);
            return e ? (r = t.selectedStar.r,
            n = t.selectedStar.st,
            o = t.selectedStar.totalDefenses) : (r = "&#63; &#63;",
            n = "&#63; &#63;",
            o = "&#63;"),
            0 === t.selectedStar.r && (r = "&#63; &#63;"),
            Crux.BlockValueBig("resources", "icon-globe-inline", r, "col_base").grid(0, 0, 10, 6).roost(a),
            Crux.Text("resources_body", "pad12 col_accent").grid(10, 0, 20, 6).roost(a),
            a
        }
        ,
        e.StarBuildFleet = function() {
            var e = Crux.Widget("rel col_accent").size(480, 72);
            Crux.Text("carrier_body", "pad12").grid(0, 0, 20, 6).roost(e);
            var r = Crux.Button("upgrade_for_x", "show_screen", ["new_fleet", t.selectedStar]).grid(20, 1.5, 10, 3).format({
                cost: 25
            }).roost(e);
            return (0 === t.selectedStar.st || t.player.cash < 25) && r.disable(),
            e
        }
        ,
        e.StarAbandon = function() {
            var e = Crux.Widget("rel col_accent").size(480, 72);
            Crux.Text("abandon_star_body", "pad12").grid(0, 0, 20, 6).roost(e);
            var r = {
                message: "sure_you_want_to_abandon_star",
                messageTemplateData: {
                    star_name: t.selectedStar.n
                },
                eventKind: "abandon_star",
                eventData: {}
            };
            return e.btn = Crux.Button("abandon_star", "show_screen", ["confirm", r]).grid(20, 1.5, 10, 3).roost(e),
            t.player.stars_abandoned > 0 && e.btn.disable(),
            e
        }
        ,
        e.StarInspector = function() {
            var r = e.Screen();
            r.heading.rawHTML(t.selectedStar.n),
            Crux.IconButton("icon-help", "show_help", "stars").grid(24.5, 0, 3, 3).roost(r),
            Crux.IconButton("icon-doc-text", "show_screen", "combat_calculator").grid(22, 0, 3, 3).roost(r);
            var n = "unscanned_star";
            return t.selectedStar.player ? (n = "enemy_star",
            "0" === t.selectedStar.v && (n = "unscanned_enemy")) : n = "unclaimed_star",
            t.selectedStar.owned && (n = "my_star"),
            r.intro = Crux.Widget("rel").roost(r),
            Crux.Text(n, "pad12 rel col_black txt_center").format(t.selectedStar).roost(r.intro),
            "unclaimed_star" === n && (e.StarResStatus(!0, !1).roost(r),
            r.footerRequired = !1),
            "unscanned_enemy" === n && (e.StarResStatus(!0, !1).roost(r),
            e.PlayerPanel(t.selectedStar.player, !0).roost(r)),
            "enemy_star" === n && (e.StarDefStatus(!1).roost(r),
            e.StarInfStatus(!1).roost(r),
            Crux.Widget("rel col_black").size(480, 8).roost(r),
            e.ShipConstructionRate().roost(r),
            t.selectedStar.ga > 0 && (Crux.Widget("rel col_black").size(480, 8).roost(r),
            Crux.Text("has_warp_gate", "rel col_accent pad12 txt_center").size(480, 48).roost(r)),
            e.PlayerPanel(t.selectedStar.player, !0).roost(r)),
            "my_star" === n && (e.StarDefStatus(!0).roost(r),
            e.StarInfStatus(!0).roost(r),
            Crux.Widget("rel col_black").size(480, 8).roost(r),
            e.ShipConstructionRate().roost(r),
            Crux.Widget("rel col_black").size(480, 8).roost(r),
            e.StarBuildFleet().roost(r),
            0 !== NeptunesPride.gameConfig.buildGates ? (Crux.Widget("rel col_black").size(480, 8).roost(r),
            e.StarGateStatus(!0).roost(r)) : t.selectedStar.ga > 0 && (Crux.Widget("rel col_black").size(480, 8).roost(r),
            Crux.Text("has_warp_gate", "rel col_accent pad12 txt_center").size(480, 48).roost(r)),
            Crux.Widget("rel col_black").size(480, 8).roost(r),
            e.StarAbandon().roost(r),
            e.StarPremium().roost(r),
            e.PlayerPanel(t.selectedStar.player, !0).roost(r)),
            r
        }
        ,
        e.OptionsAdminActions = function() {
            var e = Crux.Widget();
            t.galaxy.turn_based ? Crux.Button("force_turn", "server_request", {
                type: "order",
                order: "force_turn"
            }).grid(10, 3, 10, 3).roost(e) : (Crux.Button("jump_6_hours", "server_request", {
                type: "order",
                order: "force_ticks, 6"
            }).grid(10, 3, 10, 3).roost(e),
            Crux.Button("jump_1_hour", "server_request", {
                type: "order",
                order: "force_ticks, 1"
            }).grid(10, 6, 10, 3).roost(e)),
            t.galaxy.started && Crux.Button("toggle_pause", "server_request", {
                type: "order",
                order: "toggle_pause_game"
            }).grid(20, 3, 10, 3).roost(e),
            t.galaxy.started || Crux.Button("force_start", "server_request", {
                type: "order",
                order: "force_start"
            }).grid(20, 3, 10, 3).roost(e);
            var r = [];
            for (var n in t.galaxy.players)
                (0 === t.galaxy.players[n].conceded || 1 === t.galaxy.players[n].conceded) && r.push(t.galaxy.players[n].uid);
            var o = {
                name: "restore_player",
                body: "restore_player_select_body",
                returnScreen: "options",
                selectionEvent: "restore_conceded_player",
                playerFilter: r
            };
            Crux.Button("restore_player", "show_screen", ["select_player", o]).grid(10, 15, 10, 3).roost(e);
            var a = {
                message: "sure_you_want_to_delete",
                messageTemplateData: null,
                eventKind: "server_request",
                eventData: {
                    type: "delete_game"
                }
            };
            return Crux.Button("delete_game", "show_screen", ["confirm", a]).grid(20, 15, 10, 3).roost(e),
            e
        }
        ,
        e.OptionsGameAdmin = function() {
            var r = Crux.Widget("rel").size(480, 288);
            return Crux.Text("game_admin", "section_title col_black").grid(0, 0, 30, 3).roost(r),
            Crux.Image("../images/tech_blastoff.jpg", "abs").grid(0, 3, 10, 15).roost(r),
            t.adminPlayer === t.player ? e.OptionsAdminActions().roost(r) : Crux.Text("game_admin_none", "pad8").grid(10, 3, 20, 6).roost(r),
            r
        }
        ,
        e.OptionsMap = function() {
            var r = Crux.Widget("rel").size(480, 288);
            Crux.Text("interface", "section_title col_black").grid(0, 0, 30, 3).roost(r),
            Crux.Image("../images/tech_asteroids.jpg", "rel").grid(0, 3, 10, 15).roost(r),
            Crux.Text("map_graphics", "pad12 col_accent").grid(10, 3, 20, 3).roost(r);
            var n = {
                low: "Low",
                medium: "Medium",
                high: "High"
            };
            r.graphics = Crux.DropDown(t.interfaceSettings.mapGraphics, n, "setting_change_map").grid(20, 3, 10, 3).roost(r),
            Crux.Text("main_menu", "pad12 col_base").grid(10, 6, 20, 3).roost(r);
            var o = {
                dd: "Drop Down",
                d: "Docked"
            }
              , a = "dd";
            t.interfaceSettings.sideMenuPin && (a = "d"),
            r.menuPin = Crux.DropDown(a, o, "setting_change").grid(20, 6, 10, 3).roost(r),
            Crux.Text("ui_pos", "pad12 col_accent").grid(10, 9, 20, 3).roost(r);
            var i = {
                left: "Left",
                center: "Center",
                right: "Right"
            };
            r.uiPos = Crux.DropDown(t.interfaceSettings.screenPos, i, "setting_change").grid(20, 9, 10, 3).roost(r),
            Crux.Text("buy_galaxy_screen", "pad12 col_base").grid(10, 12, 20, 3).roost(r);
            var s = {
                off: "No Upgrades",
                on: "Allow Upgrades"
            }
              , l = "on";
            t.interfaceSettings.allowBuyGalaxyScreen || (l = "off"),
            r.allowBuyGalaxyScreen = Crux.DropDown(l, s, "setting_change").grid(20, 12, 10, 3).roost(r),
            Crux.Text("audio", "pad12 col_accent").grid(10, 15, 20, 3).roost(r);
            var c = {
                off: "Audio Off",
                on: "Audio On"
            }
              , u = "on";
            return t.interfaceSettings.audio || (u = "off"),
            r.audio = Crux.DropDown(u, c, "setting_change").grid(20, 15, 10, 3).roost(r),
            r.onSettingsChangeMap = function() {
                t.setInterfaceSetting("mapGraphics", r.graphics.getValue()),
                e.trigger("map_refresh")
            }
            ,
            r.onSettingsChange = function() {
                t.setInterfaceSetting("screenPos", r.uiPos.getValue()),
                "d" === r.menuPin.getValue() ? t.setInterfaceSetting("sideMenuPin", !0) : t.setInterfaceSetting("sideMenuPin", !1),
                "on" === r.allowBuyGalaxyScreen.getValue() ? t.setInterfaceSetting("allowBuyGalaxyScreen", !0) : t.setInterfaceSetting("allowBuyGalaxyScreen", !1),
                "on" === r.audio.getValue() ? t.setInterfaceSetting("audio", !0) : t.setInterfaceSetting("audio", !1),
                e.trigger("layout")
            }
            ,
            r.on("setting_change", r.onSettingsChange),
            r.on("setting_change_map", r.onSettingsChangeMap),
            r
        }
        ,
        e.OptionsFleet = function() {
            var e = Crux.Widget("rel").size(480, 288);
            Crux.Text("carrier", "section_title col_black").grid(0, 0, 30, 3).roost(e),
            Crux.Image("../images/tech_scramble.jpg", "abs").grid(0, 3, 10, 15).roost(e),
            Crux.Text("default_action", "pad12 col_accent").grid(10, 3, 20, 3).roost(e);
            var r = {
                0: "Do Nothing",
                1: "Collect All",
                2: "Drop All",
                3: "Collect",
                4: "Drop",
                5: "Collect All But",
                6: "Drop All But",
                7: "Garrison Star"
            };
            return e.action = Crux.DropDown(t.interfaceSettings.defaultFleetAction, r, "setting_change").grid(20, 3, 10, 3).roost(e),
            Crux.Text("default_amount", "pad12 col_base").grid(10, 6, 20, 3).roost(e),
            e.amountDisabled = Crux.Widget("col_grey rad4").grid(20, 6, 10, 3).inset(6).roost(e),
            e.amount = Crux.TextInput("single", "setting_change", "number").setValue(t.interfaceSettings.defaultFleetAmount).grid(20, 6, 10, 3).roost(e),
            e.onSettingsChange = function() {
                t.setInterfaceSetting("defaultFleetAction", e.action.getValue()),
                t.setInterfaceSetting("defaultFleetAmount", e.amount.getValue()),
                e.checkAmountVis()
            }
            ,
            e.checkAmountVis = function() {
                e.action.getValue() < 3 ? (t.setInterfaceSetting("defaultFleetAmount", 0),
                e.amount.hide()) : e.amount.show()
            }
            ,
            e.checkAmountVis(),
            e.on("setting_change", e.onSettingsChange),
            e
        }
        ,
        e.OptionsMapText = function() {
            var r = Crux.Widget("rel").size(480, 288);
            Crux.Text("map", "section_title col_black").grid(0, 0, 30, 3).roost(r),
            Crux.Text("map_intro", "pad12 col_accent txt_center").grid(0, 3, 30, 3).roost(r),
            Crux.Image("../images/tech_espionage.jpg", "abs").grid(0, 6, 10, 15).roost(r);
            var n = {
                150: "150",
                250: "250",
                350: "350",
                450: "450",
                550: "550",
                650: "650",
                750: "750",
                950: "950",
                1100: "1150",
                1350: "1350",
                1550: "1550"
            };
            return Crux.Text("zoom_ship_count", "pad12 col_base").grid(10, 6, 20, 3).roost(r),
            r.textZoomShips = Crux.DropDown(t.interfaceSettings.textZoomShips, n, "setting_change_map").grid(20, 6, 10, 3).roost(r),
            Crux.Text("zoom_star_names", "pad12 col_accent").grid(10, 9, 20, 3).roost(r),
            r.textZoomStarNames = Crux.DropDown(t.interfaceSettings.textZoomStarNames, n, "setting_change_map").grid(20, 9, 10, 3).roost(r),
            Crux.Text("zoom_star_inf", "pad12 col_base").grid(10, 12, 20, 3).roost(r),
            r.textZoomInf = Crux.DropDown(t.interfaceSettings.textZoomInf, n, "setting_change_map").grid(20, 12, 10, 3).roost(r),
            Crux.Text("zoom_star_player_names", "pad12 col_accent").grid(10, 15, 20, 3).roost(r),
            r.textZoomStarPlayerNames = Crux.DropDown(t.interfaceSettings.textZoomStarPlayerNames, n, "setting_change_map").grid(20, 15, 10, 3).roost(r),
            r.onSettingsChangeMap = function() {
                t.setInterfaceSetting("textZoomShips", r.textZoomShips.getValue()),
                t.setInterfaceSetting("textZoomStarNames", r.textZoomStarNames.getValue()),
                t.setInterfaceSetting("textZoomInf", r.textZoomInf.getValue()),
                t.setInterfaceSetting("textZoomStarPlayerNames", r.textZoomStarPlayerNames.getValue()),
                e.trigger("map_refresh")
            }
            ,
            r.on("setting_change", r.onSettingsChange),
            r.on("setting_change_map", r.onSettingsChangeMap),
            r
        }
        ,
        e.OptionsAPI = function() {
            var e = Crux.Widget("rel").size(480, 288);
            return Crux.Text("API", "section_title col_black").grid(0, 0, 30, 3).roost(e),
            Crux.Image("../images/tech_scanning.jpg", "abs").grid(0, 3, 10, 15).roost(e),
            Crux.Text("external_api_intro", "pad12").grid(10, 3, 20, 6).format({
                x: t.player.api_code
            }).roost(e),
            Crux.Button("generate", "server_request", {
                type: "order",
                order: "generate_api_code"
            }).grid(20, 15, 10, 3).roost(e),
            e
        }
        ,
        e.OptionsScreen = function() {
            var r = e.Screen("options");
            return Crux.IconButton("icon-help", "show_help", "options").grid(24.5, 0, 3, 3).roost(r),
            e.OptionsMap().roost(r),
            e.OptionsMapText().roost(r),
            e.OptionsFleet().roost(r),
            e.OptionsGameAdmin().roost(r),
            t.player && e.OptionsAPI().roost(r),
            r
        }
        ,
        e.CustomSettingsScreen = function() {
            var r = e.Screen("custom_settings");
            return e.CustomSettingsTable(NeptunesPride.gameConfig, t.adminPlayer).roost(r),
            r
        }
        ,
        e.EmpireWar = function(e) {
            var r = Crux.Widget("rel").size(480, 96);
            Crux.Text("formal_alliance", "section_title col_black").grid(0, 0, 30, 3).roost(r),
            Crux.IconButton("icon-help", "show_help", "alliances").grid(27, 0, 3, 3).roost(r);
            var n, o = t.player.war[e.uid], a = t.player.countdown_to_war[e.uid];
            return a > 0 ? (Crux.Text("war_count_down", "pad12").format({
                time: t.timeToTick(a)
            }).grid(0, 3, 30, 3).roost(r),
            r) : (0 === o && (Crux.Text("war_at_peace", "pad12").grid(0, 3, 30, 3).roost(r),
            n = {
                message: "confirm_declare_war",
                eventKind: "declare_war",
                returnScreen: "empire"
            },
            Crux.Button("war_declare_war_button", "show_screen", ["confirm", n]).grid(20, 3, 10, 3).roost(r)),
            1 === o && (Crux.Text("war_peace_requested", "pad12").grid(0, 3, 30, 3).roost(r),
            n = {
                message: "confirm_accept_peace",
                eventKind: "accept_peace",
                returnScreen: "empire"
            },
            Crux.Button("war_accept_peace_button", "show_screen", ["confirm", n]).grid(20, 3, 10, 3).roost(r)),
            2 === o && (Crux.Text("war_requested_peace", "pad12").grid(0, 3, 30, 3).roost(r),
            n = {
                message: "confirm_declare_war",
                eventKind: "unrequest_peace",
                returnScreen: "empire"
            },
            Crux.Button("war_unrequest_peace_button", "show_screen", ["confirm", n]).grid(20, 3, 10, 3).roost(r)),
            3 === o && (Crux.Text("war_at_war", "pad12").grid(0, 3, 30, 3).roost(r),
            n = {
                message: "confirm_request_peace",
                eventKind: "request_peace",
                returnScreen: "empire"
            },
            r.rqb = Crux.Button("war_request_peace_button", "show_screen", ["confirm", n]).grid(15, 3, 15, 3).roost(r),
            t.player.cash < 150 && r.rqb.disable()),
            r)
        }
        ,
        e.EmpireRegard = function(e) {
            var t = Crux.Widget("rel").size(480);
            Crux.Widget("rel col_black").size(480, 8).roost(t);
            var r = "regard_neutral";
            return e.regard > 0 && (r = "regard_ally"),
            e.regard < 0 && (r = "regard_enemy"),
            Crux.Text(r, "rel pad12 txt_center").format({
                x: e.regard
            }).roost(t),
            e.regard < 8 && e.total_economy > 1 && Crux.Text("regard_footer", "rel pad12 txt_center txt_tiny").format({
                x: 5 * e.total_economy
            }).roost(t),
            t
        }
        ,
        e.EmpireInf = function(e) {
            var r = Crux.Widget("rel");
            return e !== t.player ? r.size(480, 192) : r.size(480, 144),
            Crux.Text("infrastructure", "section_title col_black").grid(0, 0, 30, 3).roost(r),
            Crux.BlockValueBig("total_economy", "icon-dollar-inline", e.total_economy, "col_accent").grid(0, 3, 10, 6).roost(r),
            Crux.BlockValueBig("total_industry", "icon-tools-inline", e.total_industry, "col_base").grid(10, 3, 10, 6).roost(r),
            Crux.BlockValueBig("total_science", "icon-graduation-cap-inline", e.total_science, "col_accent").grid(20, 3, 10, 6).roost(r),
            e !== t.player && (Crux.BlockValue("yours", t.player.total_economy, "col_base").grid(0, 9, 10, 3).roost(r),
            Crux.BlockValue("yours", t.player.total_industry, "col_accent").grid(10, 9, 10, 3).roost(r),
            Crux.BlockValue("yours", t.player.total_science, "col_base").grid(20, 9, 10, 3).roost(r)),
            r
        }
        ,
        e.EmpireScience = function(e) {
            var r = Crux.Widget("rel").size(480, 192);
            Crux.Text("technology", "section_title col_black").grid(0, 0, 30, 3).roost(r),
            Crux.Text("you", "txt_center pad12").grid(25, 0, 5, 3).roost(r);
            var n, o = 3, a = "";
            for (n in e.tech)
                a = e === t.player ? "" : e.tech[n].level,
                Crux.BlockValue("tech_" + n, a, "").grid(0, o, 25, 3).roost(r),
                o += 2;
            o = 3;
            var i = "";
            for (n in e.tech)
                e.tech[n].level === t.player.tech[n].level && (i = ""),
                e.tech[n].level < t.player.tech[n].level && (i = "txt_warn_good"),
                e.tech[n].level > t.player.tech[n].level && (i = "txt_warn_bad"),
                Crux.Text("", "txt_center pad12 " + i).grid(25, o, 5, 3).rawHTML(t.player.tech[n].level).roost(r),
                o += 2;
            return o += 1,
            r.size(480, 16 * o),
            r
        }
        ,
        e.EmpireTrade = function(r) {
            var n, o, a = Crux.Widget("rel").size(480, 240), i = {};
            for (n in r.tech)
                r.tech[n].level < t.player.tech[n].level && (i[n] = Crux.localise("tech_" + n),
                o = r.tech[n].level + 1,
                i[n] += " ( " + o + " - $" + t.galaxy.trade_cost * o + " )");
            return Crux.Text("trade", "section_title col_black").grid(0, 0, 30, 3).roost(a),
            Crux.IconButton("icon-help", "show_help", "trade").grid(27, 0, 3, 3).roost(a),
            NeptunesPride.gameConfig.tradeScanned && t.player.scannedPlayers.indexOf(r.uid) < 0 ? (Crux.Text("trade_scan_required", "pad12 col_base txt_center").grid(0, 3, 30, 3).roost(a),
            a.size(480, 128),
            a) : (Crux.Text("trade_tech_body", "pad12").grid(0, 3, 30, 3).format({
                cost: t.galaxy.trade_cost
            }).roost(a),
            a.techSelection = Crux.DropDown("", i, "trade_tech_selected").grid(0, 5.5, 20, 3).roost(a),
            a.sendTech = Crux.Button("share_tech", "pre_trade_tech").grid(20, 5.5, 10, 3).disable().roost(a),
            Crux.Widget("col_accent").grid(0, 9, 30, 6).roost(a),
            Crux.Text("trade_money_body", "pad12").grid(0, 9, 30, 3).format({
                amount: t.player.cash
            }).roost(a),
            a.moneyToSend = Crux.TextInput("single", "money_changed", "number").grid(0, 11.5, 20, 3).setText(0).roost(a),
            a.sendMoney = Crux.Button("send_money", "pre_send_money").grid(20, 11.5, 10, 3).disable().roost(a),
            a.onTradeTechSelected = function() {
                var e = a.techSelection.getValue();
                if (e) {
                    var r = (t.selectedPlayer.tech[e].level + 1) * t.galaxy.trade_cost;
                    t.player.cash >= r ? a.sendTech.enable() : a.sendTech.disable()
                }
            }
            ,
            a.onTradeTechSelected(),
            a.onMoneyChanged = function() {
                a.moneyToSend.getValue() <= t.player.cash && a.moneyToSend.getValue() > 0 ? a.sendMoney.enable() : a.sendMoney.disable()
            }
            ,
            a.onPreTradeTech = function() {
                var n = a.techSelection.getValue()
                  , o = (t.selectedPlayer.tech[n].level + 1) * t.galaxy.trade_cost;
                e.trigger("hide_screen");
                var i = {
                    message: "confirm_trade_tech",
                    messageTemplateData: {
                        price: o,
                        tech: Crux.localise("tech_" + n),
                        alias: r.colourBox + r.hyperlinkedRawAlias
                    },
                    eventKind: "share_tech",
                    eventData: {
                        targetPlayer: r,
                        techName: n
                    },
                    notification: !1,
                    returnScreen: "empire"
                };
                e.trigger("show_screen", ["confirm", i])
            }
            ,
            a.onPreSendMoney = function() {
                var e = a.moneyToSend.getValue();
                a.trigger("send_money", {
                    targetPlayer: r,
                    amount: e
                })
            }
            ,
            a.on("trade_tech_selected", a.onTradeTechSelected),
            a.on("pre_trade_tech", a.onPreTradeTech),
            a.on("money_changed", a.onMoneyChanged),
            a.on("pre_send_money", a.onPreSendMoney),
            a)
        }
        ,
        e.EmpireAchievements = function(r, n) {
            var o = Crux.Widget("rel col_base");
            return t.player && r !== t.player ? o.size(480, 200) : o.size(480, 144),
            e.SharedAchievements(n).roost(o),
            t.player && r !== t.player && (Crux.Widget("col_black").grid(0, 9, 30, 3).roost(o),
            Crux.Text("renown_points_remaining", "pad12").format({
                rp: t.player.karma_to_give
            }).grid(0, 9, 20, 3).roost(o),
            t.player.karma_to_give > 0 && (Crux.Button("award_renown", "award_karma").grid(20, 9, 10, 3).roost(o),
            Crux.Widget("col_base").grid(0, 12, 30, .5).roost(o))),
            o
        }
        ,
        e.EmpireScreen = function() {
            var r = e.Screen("empire_overview")
              , n = t.selectedPlayer;
            Crux.IconButton("icon-help", "show_help", "diplomacy").grid(24.5, 0, 3, 3).roost(r),
            Crux.IconButton("icon-right-open", "key_right", "diplomacy").grid(22, 0, 3, 3).roost(r),
            Crux.IconButton("icon-left-open", "key_left", "diplomacy").grid(19.5, 0, 3, 3).roost(r),
            e.PlayerPanel(n).roost(r),
            t.player && (n.ai && void 0 !== n.regard && e.EmpireRegard(n).roost(r),
            e.EmpireInf(n).roost(r),
            e.EmpireScience(n).roost(r),
            n != t.player && 0 === t.player.conceded && 3 !== n.conceded && t.galaxy.started && e.EmpireTrade(n).roost(r),
            n != t.player && NeptunesPride.gameConfig.alliances && e.EmpireWar(n).roost(r));
            var o = null;
            return t.playerAchievements && (o = t.playerAchievements[n.uid]),
            o && (e.EmpireAchievements(n, o).roost(r),
            e.SharedBadges(o.badges, !0).roost(r)),
            r.onLastEmpire = function() {
                var r = t.selectedPlayer.uid - 1;
                0 > r && (r = t.playerCount - 1),
                e.trigger("select_player", r)
            }
            ,
            r.onNextEmpire = function() {
                var r = t.selectedPlayer.uid + 1;
                r > t.playerCount - 1 && (r = 0),
                e.trigger("select_player", r)
            }
            ,
            r.on("key_left", r.onLastEmpire),
            r.on("key_right", r.onNextEmpire),
            r
        }
        ,
        e.LeaderboardIntro = function() {
            var e = Crux.Widget("rel");
            return NeptunesPride.gameConfig.turnBased && Crux.Text("tbg_settings", "rel pad12 txt_center col_accent").format({
                deadline: NeptunesPride.gameConfig.turnTime,
                jump: NeptunesPride.gameConfig.turnJumpTicks
            }).roost(e),
            "" !== NeptunesPride.gameConfig.description && Crux.Text("", "rel pad12 txt_center col_accent").rawHTML(NeptunesPride.gameConfig.description).roost(e),
            NeptunesPride.gameConfig.non_default_settings.length > 0 && Crux.Text("this_game_has_custom_settings", "rel pad12 txt_center col_base").roost(e),
            e
        }
        ,
        e.JoinPlayer = function(r) {
            var n = Crux.Widget("rel").size(480, 56);
            return n.player = r,
            Crux.Widget("col_black").grid(0, 0, 30, 3).roost(n),
            Crux.Widget("pci_48_" + r.uid).grid(0, 0, 3, 3).roost(n),
            Crux.Image("../images/avatars/160/" + r.avatar + ".jpg", "abs").grid(3, 0, 3, 3).roost(n),
            r.alias ? (Crux.Text("", "section_title").grid(6, 0, 25, 3).rawHTML(r.alias).roost(n),
            Crux.IconButton("icon-eye", "select_player", r.uid).grid(27, 0, 3, 3).roost(n)) : (Crux.IconButton("icon-eye", "select_player_pre_join", r.uid).grid(17.5, 0, 3, 3).roost(n),
            Crux.Button("join", "pre_join_game", n.player.uid).grid(20, 0, 10, 3).roost(n)),
            n.onPreJoinGame = function() {
                t.joinGamePos = n.player.uid,
                e.trigger("join_game")
            }
            ,
            n.on("pre_join_game", n.onPreJoinGame, n),
            n
        }
        ,
        e.AvatarSelector = function(e) {
            var t = Crux.Widget("col_accent").size(160, 224);
            return Crux.Image("../images/avatars/160/" + e + ".jpg", "abs").grid(0, 0, 10, 10).roost(t),
            Crux.Text("select_avatar", "pad12 txt_center col_black").grid(0, 10, 10, 3).format({
                index: e
            }).roost(t),
            t
        }
        ,
        e.JoinGameBodySelectAnyAvatar = function() {
            var r = Crux.Widget("rel").size(480);
            Crux.Text("select_avatar_heading", "rel txt_center pad12 col_accent").size(480, 48).roost(r),
            Crux.Widget("rel col_black").size(480, 8).roost(r);
            for (var n = Crux.Widget("rel col_black").size(480, 392).roost(r), o = 1, a = 0, i = 0; 49 > o; )
                e.AvatarSelector(o).grid(10 * i, 14 * a, 10, 10).roost(n),
                i += 1,
                3 === i && (a += 1,
                i = 0),
                o += 1;
            return n.size(480, 14 * a * 16),
            r.onSelectAvatar = function(r, n) {
                t.joinGameAvatar = n,
                e.trigger("show_screen", "join_game")
            }
            ,
            r.on("select_avatar", r.onSelectAvatar),
            r
        }
        ,
        e.JoinGameBodyChooseAlias = function() {
            var r = Crux.Widget("rel").size(480);
            Crux.Text("choose_alias_heading", "rel txt_center pad12 col_accent").size(480).roost(r);
            var n = Crux.Widget("rel col_black").size(480, 392).roost(r);
            return Crux.Text("choose_alias_body", "txt_center pad12").grid(0, .5, 30, 4).roost(n),
            r.alias = Crux.TextInput("single").grid(5, 7, 20, 3).setValue(NeptunesPride.account.alias).roost(n),
            r.alias.node.css("text-align", "center"),
            Crux.Text("choose_alias_rules", "txt_center pad12").grid(0, 10, 30, 3).roost(n),
            r.select = Crux.Button("select", "join_game_select_alias").grid(10, 14.5, 10, 3).roost(n),
            r.image = Crux.Image("../images/joingame_03.jpg", "abs").grid(0, 18, 30, 6).roost(n),
            r.onSelectAlias = function() {
                var n = r.alias.getValue();
                if (n = t.validateAlias(n))
                    t.joinGameAlias = n,
                    e.trigger("show_screen", "join_game");
                else {
                    e.trigger("hide_screen");
                    var o = {
                        message: "notification_bad_alias",
                        eventKind: "show_screen",
                        eventData: "join_game",
                        notification: !0
                    };
                    e.trigger("show_screen", ["confirm", o])
                }
            }
            ,
            r.on("join_game_select_alias", r.onSelectAlias),
            r
        }
        ,
        e.JoinGameBodyChooseAvatar = function() {
            var r = Crux.Widget("rel").size(480);
            Crux.Text("choose_avatar_heading", "rel txt_center pad12 col_accent").size(480).roost(r);
            var n = Crux.Widget("rel col_black").size(480, 392).roost(r);
            return r.last = Crux.IconButton("icon-left-open", "join_game_last_avatar").grid(.25, 21, 3, 3).roost(n),
            r.next = Crux.IconButton("icon-right-open", "join_game_next_avatar").grid(27, 21, 3, 3).roost(n),
            r.select = Crux.Button("select", "join_game_select_avatar").grid(10, 21, 10, 3).roost(n),
            r.ppo = Crux.Text("join_game_ppo", "pad12 txt_center").grid(3, 21, 24, 3).roost(n),
            r.image = null,
            r.description = null,
            r.updateAvatarSelection = function() {
                var e = t.joinGameAvatarChoices[t.joinGameSelectedAvatarIndex];
                !NeptunesPride.account.premium && t.joinGamePremiumAvatars.indexOf(e) >= 0 ? (r.select.hide(),
                r.ppo.show()) : (r.select.show(),
                r.ppo.hide()),
                r.image && r.removeChild(r.image),
                r.description && r.removeChild(r.description),
                r.image = Crux.Image("../images/avatars/240x320/" + e + ".jpg", "asb").grid(0, .5, 15, 20).roost(n),
                r.description = Crux.Text("avatar_description_" + e, "pad12 col_base").grid(15, .5, 15, 20).roost(n)
            }
            ,
            r.updateAvatarSelection(),
            r.onLastAvatar = function() {
                t.joinGameSelectedAvatarIndex -= 1,
                t.joinGameSelectedAvatarIndex < 0 && (t.joinGameSelectedAvatarIndex = t.joinGameAvatarChoices.length - 1),
                r.updateAvatarSelection()
            }
            ,
            r.onNextAvatar = function() {
                t.joinGameSelectedAvatarIndex += 1,
                t.joinGameSelectedAvatarIndex >= t.joinGameAvatarChoices.length && (t.joinGameSelectedAvatarIndex = 0),
                r.updateAvatarSelection()
            }
            ,
            r.onSelectAvatar = function() {
                t.joinGameAvatar = t.joinGameAvatarChoices[t.joinGameSelectedAvatarIndex],
                e.trigger("show_screen", "join_game")
            }
            ,
            r.on("join_game_last_avatar", r.onLastAvatar),
            r.on("join_game_next_avatar", r.onNextAvatar),
            r.on("join_game_select_avatar", r.onSelectAvatar),
            r
        }
        ,
        e.JoinGameBodyChooseLocation = function() {
            var r = Crux.Widget("rel").size(480);
            Crux.Text("choose_location_heading", "rel txt_center pad12 col_accent").size(480).roost(r),
            Crux.Widget("rel").size(480, 16).roost(r);
            var n;
            for (n in t.galaxy.players)
                e.JoinPlayer(t.galaxy.players[n]).roost(r);
            return r
        }
        ,
        e.JoinGameBodyChoosePassword = function() {
            var r = Crux.Widget("rel").size(480);
            Crux.Text("choose_password_heading", "rel txt_center pad12 col_accent").size(480, 48).roost(r);
            var n = Crux.Widget("rel col_black").size(480, 172).roost(r);
            return Crux.Text("choose_password_body", "txt_center pad12").grid(0, .5, 30, 4).roost(n),
            r.pw = Crux.TextInput("single").grid(5, 3.5, 20, 3).roost(n),
            r.pw.node.css("text-align", "center"),
            r.select = Crux.Button("select", "join_game_select_password").grid(10, 7, 10, 3).roost(n),
            r.onSelectPassword = function() {
                t.joinGamePassword = r.pw.getValue(),
                e.trigger("show_screen", "join_game")
            }
            ,
            r.on("join_game_select_password", r.onSelectPassword),
            r
        }
        ,
        e.JoinGameScreen = function() {
            function r() {
                return "" === t.joinGamePassword && "" !== NeptunesPride.gameConfig.password ? e.JoinGameBodyChoosePassword() : t.joinGameAvatar < 0 ? e.JoinGameBodyChooseAvatar() : 999 === t.joinGameAvatar ? e.JoinGameBodySelectAnyAvatar() : "" === t.joinGameAlias ? e.JoinGameBodyChooseAlias() : e.JoinGameBodyChooseLocation()
            }
            var n = e.Screen("join_game_title");
            return 0 === t.openPlayerPositions ? (Crux.Text("game_full", "txt_center col_accent pad12 rel").format({
                game_number: NeptunesPride.gameNumber
            }).roost(n),
            Crux.Button("main_menu", "browse_to", "/").addStyle("rel mar12").size(160, 36).pos(148).roost(n),
            n) : (Crux.Widget("rel col_black").size(480, 8).roost(n),
            e.LeaderboardIntro().roost(n),
            NeptunesPride.gameConfig.playerType && t.openPlayerPositions && Crux.Text("warning_premium_players_only", "txt_center col_warning pad12 rel").format({
                game_number: NeptunesPride.gameNumber
            }).roost(n),
            t.galaxy.paused || t.openPlayerPositions || Crux.Text("this_game_has_started", "txt_center col_warning pad12 rel").format({
                game_number: NeptunesPride.gameNumber
            }).roost(n),
            n.addChild(r()),
            Crux.Text("simple_social", "rel").size(480, 176).format({
                url: "http://np.ironhelmet.com/game/" + NeptunesPride.gameNumber,
                game_number: NeptunesPride.gameNumber
            }).roost(n),
            n)
        }
        ,
        e.LeaderboardLeaveGame = function() {
            var e = Crux.Widget("rel col_accent").size(480, 48)
              , t = {
                message: "sure_you_want_to_leave_game",
                messageTemplateData: null,
                eventKind: "leave_game",
                eventData: {}
            };
            return Crux.Text("leave_game_body", "pad12").grid(0, 0, 30, 3).roost(e),
            Crux.Button("leave_game", "show_screen", ["confirm", t]).grid(20, 0, 10, 3).roost(e),
            e
        }
        ,
        e.LeaderboardConcedeDefeat = function() {
            var e = Crux.Widget("rel col_accent").size(480, 48);
            if (0 === t.player.conceded)
                if (t.lastPlayerActiveAndWinning())
                    Crux.Text("accept_victory_body", "pad12").grid(0, 0, 30, 3).roost(e),
                    Crux.Button("accept_victory", "server_request", {
                        type: "order",
                        order: "concede_defeat"
                    }).grid(20, 0, 10, 3).roost(e);
                else {
                    var r = {
                        message: "sure_you_want_to_concede_defeat",
                        messageTemplateData: null,
                        eventKind: "server_request",
                        eventData: {
                            type: "order",
                            order: "concede_defeat"
                        }
                    };
                    Crux.Text("concede_defeat_body", "pad12").grid(0, 0, 30, 3).roost(e),
                    Crux.Button("concede_defeat", "show_screen", ["confirm", r]).grid(20, 0, 10, 3).roost(e)
                }
            return e
        }
        ,
        e.LeaderboardPlayer = function(e) {
            var r, n = 48;
            t.playerAchievements && t.playerAchievements[e.uid] && (r = t.playerAchievements[e.uid],
            r.true_alias && (n = 96));
            var o = Crux.Widget("rel player_cell").size(480, n);
            Crux.Widget("col_black").grid(0, 0, 30, 3).roost(o),
            Crux.Widget("pci_48_" + e.uid).grid(0, 0, 3, 3).roost(o),
            Crux.Image("../images/avatars/160/" + e.avatar + ".jpg", "abs").grid(3, 0, 3, 3).roost(o);
            var a = e.alias
              , i = "section_title txt_ellipsis";
            return 1 === t.galaxy.turn_based && 0 === t.galaxy.game_over && 1 === e.ready && 0 === e.conceded && (i = "premium_section_title txt_ellipsis icon-ok-inline"),
            Crux.Text("", i).grid(6, 0, 16, 3).rawHTML(a).roost(o),
            96 === n && Crux.Text("true_alias", "txt_ellipsis pad12").grid(4, 3, 26, 3).format({
                alias: r.true_alias
            }).roost(o),
            Crux.Text("x_stars", "txt_right pad12").format({
                count: e.total_stars
            }).grid(21, 0, 6, 3).roost(o),
            Crux.IconButton("icon-eye", "select_player", [e.uid, !0]).grid(27, 0, 3, 3).roost(o),
            o
        }
        ,
        e.LeaderboardScreen = function() {
            var r = e.Screen("leaderboard")
              , n = 0
              , o = 0
              , a = ""
              , i = []
              , s = []
              , l = "";
            for (a in t.galaxy.players)
                "" === t.galaxy.players[a].alias ? n += 1 : (o += 1,
                2 === t.galaxy.players[a].conceded ? (l = t.galaxy.players[a].hyperlinkedBox + t.galaxy.players[a].hyperlinkedAlias,
                l += " (" + t.galaxy.players[a].total_stars + ")",
                t.playerAchievements && t.playerAchievements[a] && t.playerAchievements[a].true_alias && (l += " " + t.playerAchievements[a].true_alias),
                s.push(l)) : i.push(t.galaxy.players[a]));
            i.sort(function(e, t) {
                return t.total_stars === e.total_stars ? t.total_strength - e.total_strength : t.total_stars - e.total_stars
            }),
            Crux.Text("", "rel pad12 txt_center col_black  section_title").rawHTML(NeptunesPride.gameConfig.name).roost(r),
            n && !t.galaxy.game_over && (Crux.Widget("rel").size(480, 8).roost(r),
            Crux.Text("leaderboard_open", "txt_center col_accent pad12 rel").format({
                open: n
            }).roost(r),
            Crux.Text("simple_social", "rel").size(480, 176).format({
                url: "http://np.ironhelmet.com/game/" + NeptunesPride.gameNumber,
                game_number: NeptunesPride.gameNumber
            }).roost(r),
            Crux.Widget("rel col_black").size(480, 8).roost(r)),
            e.LeaderboardIntro().roost(r),
            t.galaxy.game_over ? Crux.Text("game_over", "txt_center col_accent rel pad12").roost(r) : Crux.Text("leaderboard_heading", "txt_center col_accent rel pad12").format({
                productions: t.galaxy.productions,
                tick: t.galaxy.tick,
                victory: t.galaxy.stars_for_victory,
                totalStars: t.galaxy.total_stars
            }).roost(r),
            Crux.Widget("rel").size(480, 16).roost(r);
            for (a in i)
                e.LeaderboardPlayer(i[a]).roost(r);
            if (s.length) {
                var c = s.join(", ");
                Crux.Text("afk_player_list", "rel pad12 txt_center").format({
                    names: c
                }).size(480).roost(r)
            }
            return t.galaxy.started ? e.LeaderboardConcedeDefeat().roost(r) : e.LeaderboardLeaveGame().roost(r),
            t.galaxy.game_over && Crux.Text("simple_social_game_over").size(480, 120).addStyle("col_accent").format({
                url: "http://np.ironhelmet.com/game/" + NeptunesPride.gameNumber,
                game_number: NeptunesPride.gameNumber
            }).roost(r),
            r
        }
        ,
        e.TechRow = function(e, r) {
            var n = Crux.Widget("rel  col_accent").size(480, 288);
            return Crux.Text("tech_" + r, "section_title col_black rel").grid(0, 0, 30, 3).roost(n),
            Crux.Image("../images/tech_" + r + ".jpg", "abs").size(160, 240).roost(n),
            Crux.Text("tech_description_" + r, "col_accent pad12").grid(10, 3, 20, 15).format({
                tr: t.describeTickRate(),
                pr: t.describeProductionRate()
            }).roost(n),
            t.player.researching === r ? Crux.Text("active", "txt_right pad12").grid(20, 0, 10, 3).roost(n) : t.player.researching_next === r && Crux.Text("research_next", "txt_right pad12").grid(20, 0, 10, 3).roost(n),
            0 === e.brr && Crux.Text("unavailable_this_game", "txt_right pad12").grid(20, 0, 10, 3).roost(n),
            n
        }
        ,
        e.TechNowSelection = function() {
            var e, r = Crux.Widget("rel  col_accent").size(480, 96);
            Crux.Text("research_now", "pad12").roost(r);
            var n = {};
            for (e in t.player.tech)
                t.player.tech[e].brr > 0 && (n[e] = Crux.localise("tech_" + e));
            Crux.DropDown(t.player.researching, n, "change_research").grid(15, 0, 15, 3).roost(r);
            var o = t.player.tech[t.player.researching]
              , a = Number(o.level) * Number(o.brr)
              , i = a - Number(o.research);
            0 === t.player.total_science ? r.ticks = 0 : (r.ticks = i / t.player.total_science,
            r.ticks = Math.ceil(r.ticks));
            var s = t.timeToTick(r.ticks);
            return r.eta = Crux.BlockValue("current_research_eta", s, "col_base").grid(0, 3, 30, 3).roost(r),
            r.onTick = function() {
                r.eta.value.rawHTML(t.timeToTick(r.ticks))
            }
            ,
            r.on("one_second_tick", r.onTick),
            r
        }
        ,
        e.TechNextSelection = function() {
            var e, r = Crux.Widget("rel  col_accent").size(480, 48);
            Crux.Text("research_next", "pad12").roost(r);
            var n = {};
            for (e in t.player.tech)
                t.player.tech[e].brr > 0 && (n[e] = Crux.localise("tech_" + e));
            return Crux.DropDown(t.player.researching_next, n, "change_research_next").grid(15, 0, 15, 3).roost(r),
            r
        }
        ,
        e.TechSummary = function() {
            var e, r, n = Crux.Widget("rel  col_base").size(480);
            Crux.Text("tech_summary", "section_title col_black rel").grid(0, 0, 30, 3).roost(n);
            var o = Crux.Widget("rel").roost(n)
              , a = 0;
            for (e in t.player.tech) {
                var i = t.player.tech[e];
                t.player.tech[e].brr > 0 && (Crux.Text("tech_" + e, "pad12").grid(0, a, 30, 2).roost(o),
                Crux.Text("level_x", "pad12").format({
                    x: i.level
                }).grid(14, a, 6, 2).roost(o),
                r = i.research + " of " + Number(i.level) * Number(i.brr),
                Crux.Text("", "txt_right pad12").rawHTML(r).grid(20, a, 10, 2).roost(o),
                a += 2)
            }
            return o.size(480, 16 * a),
            Crux.Widget("rel").size(480, 16).roost(n),
            n
        }
        ,
        e.TechScreen = function() {
            var r, n = e.Screen("research");
            Crux.IconButton("icon-help", "show_help", "tech").grid(24.5, 0, 3, 3).roost(n),
            Crux.Text("tech_intro", "col_black rel pad12 txt_center").format({
                tr: t.describeTickRate()
            }).roost(n),
            n.f1 = Crux.Widget("rel").size(480, 48).roost(n),
            Crux.BlockValue("total_science", t.player.total_science, "").grid(0, 0, 30, 3).roost(n.f1),
            e.TechNowSelection().roost(n),
            e.TechNextSelection().roost(n),
            e.TechSummary().roost(n);
            for (r in t.player.tech)
                e.TechRow(t.player.tech[r], r).roost(n);
            return n
        }
        ,
        e.InboxTabs = function() {
            var e = Crux.Widget("rel").size(480, 48);
            return e.tickCount = 0,
            Crux.Widget("col_accent_light").grid(0, 2.5, 30, .5).roost(e),
            e.diplomacyTab = Crux.Tab("diplomacy", "inbox_set_filter", "game_diplomacy").grid(0, -.5, 10, 3).roost(e),
            e.eventTab = Crux.Tab("events", "inbox_set_filter", "game_event").grid(10, -.5, 10, 3).roost(e),
            "game_diplomacy" === r.filter && e.diplomacyTab.activate(),
            "game_event" === r.filter && e.eventTab.activate(),
            e.onOneSecondTick = function() {
                e.tickCount += 1,
                r.unreadDiplomacy > 0 && (e.tickCount % 2 ? e.diplomacyTab.label.updateFormat("diplomacy_c", {
                    count: r.unreadDiplomacy
                }) : e.diplomacyTab.label.update("diplomacy")),
                r.unreadEvents > 0 && (e.tickCount % 2 ? e.eventTab.label.updateFormat("events_c", {
                    count: r.unreadEvents
                }) : e.eventTab.label.update("events"))
            }
            ,
            e.on("one_second_tick", e.onOneSecondTick),
            e
        }
        ,
        e.InboxNewMessageButton = function() {
            var e = Crux.Widget("rel col_black").size(480, 48);
            return Crux.IconButton("icon-mail", "show_screen", "compose").grid(0, 0, 3, 3).roost(e),
            Crux.IconButton("icon-loop", "inbox_relaod_filter").grid(2.5, 0, 3, 3).roost(e),
            Crux.Button("read_all", "inbox_read_all").grid(20, 0, 10, 3).roost(e),
            e
        }
        ,
        e.InboxEventHeader = function() {
            var e = Crux.Widget("rel col_black").size(480);
            return Crux.Text("event_header", "pad12 rel").roost(e),
            Crux.Button("read_all", "inbox_read_all").grid(20, 0, 10, 3).roost(e),
            e
        }
        ,
        e.InboxBackButton = function() {
            var e = Crux.Widget("rel col_accent").size(480, 48);
            return Crux.Button("back", "show_screen", "inbox").grid(0, 0, 10, 3).roost(e),
            e
        }
        ,
        e.InboxScreen = function() {
            var t = {};
            t = e.Screen("inbox");
            var n = 0
              , o = 0
              , a = {}
              , i = !1;
            if (e.InboxTabs().roost(t),
            "game_diplomacy" === r.filter && e.InboxNewMessageButton().roost(t),
            "game_event" === r.filter && e.InboxEventHeader().roost(t),
            r.loading && Crux.Text("loading", "rel txt_center pad12").size(480, 48).roost(t),
            r.loading || null === r.messages[r.filter] || 0 === r.messages[r.filter].length && Crux.Text("no_messages", "rel txt_center pad12").size(480, 48).roost(t),
            !r.loading && r.messages[r.filter])
                for (n = 0,
                o = r.messages[r.filter].length; o > n; n += 1)
                    a = r.messages[r.filter][n],
                    i = i ? !1 : !0,
                    "game_diplomacy" === r.filter && e.InboxRow(a.payload.subject, a, i).roost(t),
                    "game_event" === r.filter && e.InboxRowEvent(a, i).roost(t);
            return e.InboxScreenFooter().roost(t),
            t
        }
        ,
        e.InboxRow = function(e, n, o) {
            var a = Crux.Clickable("inbox_select_message", n).addStyle("rel minh72")
              , i = "";
            o ? a.configStyles("click_row_up", "click_row_down", "click_row_hover", "click_row_disabled") : a.configStyles("click_row_up_alt", "click_row_down", "click_row_hover", "click_row_disabled");
            var s = t.galaxy.players[n.payload.from_uid];
            if (s) {
                Crux.Image("../images/avatars/160/" + s.avatar + ".jpg", "abs").grid(0, .75, 3, 3).roost(a),
                i = Crux.formatDate(new Date(n.created)),
                "unread" === n.status && (i += "<br><span class='txt_anchor'>" + Crux.localise("unread_comments") + "</span>"),
                Crux.Text("", "pad12 txt_right txt_tiny txt_em").grid(0, 0, 30, 0).rawHTML(i).roost(a),
                Crux.Text("fromto", "pad12").size(96).pos(48).roost(a);
                var l = "";
                "unread" === n.status && (l = "txt_anchor"),
                i = r.createToList(n, !0) + "<br><span class='" + l + "'>" + e + "</span>",
                a.label = Crux.Text("", "pad12 rel").rawHTML(i).size(384).pos(96).roost(a)
            } else {
                var c = "col_black";
                "unread" === n.status && (c = "col_unread"),
                Crux.Widget(c + " pad8").pos(0, 12).size(48, 48).roost(a),
                Crux.Text("", "txt_center pad8 button_text").rawHTML(n.payload.tick).pos(0, 16).size(48, 48).roost(a),
                a.label = Crux.Text("", "pad12 rel").rawHTML(e).size(432).pos(48).roost(a)
            }
            return a
        }
        ,
        e.InboxRowEvent = function(r, n) {
            var o, a, i, s, l = Crux.Clickable("inbox_read_message", r).addStyle("rel minh72");
            n ? l.configStyles("click_row_up", "click_row_down", "click_row_hover", "click_row_disabled") : l.configStyles("click_row_up_alt", "click_row_down", "click_row_hover", "click_row_disabled"),
            i = "message_event_" + r.payload.template,
            s = r.payload,
            s.creationTime = Crux.formatDate(new Date(r.created)),
            "ai_chat: enemy_of_enemy_is_friend" === r.payload.template && (s.aiColour = t.galaxy.players[r.payload.from_puid].colourBox,
            s.aiAlias = t.galaxy.players[r.payload.from_puid].hyperlinkedAlias,
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "production_new" === r.payload.template && (s.localised_tech_name = Crux.localise("tech_" + r.payload.tech_name),
            0 === r.payload.tech_points && (i = "message_event_production_new_no_tech"),
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "tech_up" === r.payload.template && (s.tech_name = Crux.localise("tech_" + r.payload.tech),
            s.tech_desc = Crux.localise("tech_description_" + r.payload.tech),
            i = "message_event_tech_up",
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "tech_up_exp" === r.payload.template && (s.tech_name = Crux.localise("tech_" + r.payload.tech),
            i = 0 === r.payload.points ? "message_event_tech_up_exp_disabled" : "message_event_tech_up_exp",
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "peace_requested" === r.payload.template && (s.fromColour = t.galaxy.players[r.payload.from_puid].colourBox,
            s.toColour = t.galaxy.players[r.payload.to_puid].colourBox,
            s.fromAlias = t.galaxy.players[r.payload.from_puid].hyperlinkedAlias,
            s.toAlias = t.galaxy.players[r.payload.to_puid].hyperlinkedAlias,
            i = t.player.uid === r.payload.from_puid ? "message_event_" + r.payload.template + "_giver" : "message_event_" + r.payload.template + "_receiver",
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "peace_accepted" === r.payload.template && (s.fromColour = t.galaxy.players[r.payload.from_puid].colourBox,
            s.toColour = t.galaxy.players[r.payload.to_puid].colourBox,
            s.fromAlias = t.galaxy.players[r.payload.from_puid].hyperlinkedAlias,
            s.toAlias = t.galaxy.players[r.payload.to_puid].hyperlinkedAlias,
            i = t.player.uid === r.payload.from_puid ? "message_event_" + r.payload.template + "_giver" : "message_event_" + r.payload.template + "_receiver",
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "war_declared" === r.payload.template && (s.attackerColour = t.galaxy.players[r.payload.attacker].colourBox,
            s.defenderColour = t.galaxy.players[r.payload.defender].colourBox,
            s.attackerAlias = t.galaxy.players[r.payload.attacker].hyperlinkedAlias,
            s.defenderAlias = t.galaxy.players[r.payload.defender].hyperlinkedAlias,
            i = "message_event_" + r.payload.template,
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            ("goodbye_to_player_inactivity" === r.payload.template || "goodbye_to_player_defeated" === r.payload.template || "accept_victory" === r.payload.template || "goodbye_to_player" === r.payload.template) && (s.colour = t.galaxy.players[r.payload.uid].colourBox,
            s.name = t.galaxy.players[r.payload.uid].hyperlinkedAlias,
            i = "message_event_" + r.payload.template,
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "star_given" === r.payload.template && (o = t.galaxy.players[r.payload.from_puid],
            a = t.galaxy.players[r.payload.to_puid],
            s.display_name = "unknown",
            r.payload.star_name && (s.display_name = r.payload.star_name),
            t.galaxy.stars[r.payload.suid] && (s.display_name = t.galaxy.stars[r.payload.suid].hyperlinkedName),
            s.giverName = o.alias,
            s.giverColour = o.colourBox,
            s.giverUid = o.uid,
            s.receiverName = a.alias,
            s.receiverColour = a.colourBox,
            s.receiverUid = a.uid,
            i = t.player === o ? "message_event_star_given_giver" : "message_event_star_given_receiver",
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "shared_technology" === r.payload.template && (o = t.galaxy.players[r.payload.from_puid],
            a = t.galaxy.players[r.payload.to_puid],
            s.display_name = Crux.localise("tech_" + r.payload.name),
            s.giverName = o.hyperlinkedAlias,
            s.giverColour = o.colourBox,
            s.giverUid = o.uid,
            s.receiverName = a.hyperlinkedAlias,
            s.receiverColour = a.colourBox,
            s.receiverUid = a.uid,
            void 0 !== r.payload.price ? (s.level = r.payload.level,
            s.price = r.payload.price,
            i = t.player === o ? "message_event_shared_technology_giver_new" : "message_event_shared_technology_receiver_new") : i = t.player === o ? "message_event_shared_technology_giver" : "message_event_shared_technology_receiver",
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "money_sent" === r.payload.template && (o = t.galaxy.players[r.payload.from_puid],
            a = t.galaxy.players[r.payload.to_puid],
            s.giverName = o.alias,
            s.giverColour = o.colourBox,
            s.giverUid = o.uid,
            s.receiverName = a.alias,
            s.receiverColour = a.colourBox,
            s.receiverUid = a.uid,
            s.amount = r.payload.amount,
            i = t.player === o ? "message_event_money_giver" : "message_event_money_receiver",
            l.body = Crux.Text("", "rel pad12").size(432).pos(48).roost(l),
            l.body.updateFormat(i, s)),
            "combat" === r.payload.template && (l.body = e.CombatEventBody(r).roost(l)),
            "combat_mk_ii" === r.payload.template && (l.body = e.CombatMkIIEventBody(r).roost(l));
            var c = "col_black";
            return "unread" === r.status && (c = "col_unread"),
            Crux.Widget(c + " pad8").pos(0, 12).size(48, 48).roost(l),
            Crux.Text("", "txt_center pad8 button_text").rawHTML(r.payload.tick).pos(0, 16).size(48, 48).roost(l),
            l
        }
        ,
        e.CombatMkIIEventBody = function(e) {
            function r(e) {
                return {
                    kind: "Carrier",
                    name: e.n,
                    icon: "<div class='icon-rocket'></div>",
                    colour: t.galaxy.players[e.puid].colourBox,
                    player: t.galaxy.players[e.puid].hyperlinkedAlias,
                    shipsStart: e.ss,
                    shipsEnd: e.es,
                    weaponSkill: e.w,
                    shipsLost: e.ss - e.es
                }
            }
            function n(e) {
                void 0 === s.players[e.puid] ? s.players[e.puid] = {
                    colour: t.galaxy.players[e.puid].colourBox,
                    alias: t.galaxy.players[e.puid].hyperlinkedAlias,
                    shipsStart: e.ss,
                    shipsEnd: e.es
                } : (s.players[e.puid].shipsStart += e.ss,
                s.players[e.puid].shipsEnd += e.es)
            }
            var o, a, i = Crux.Widget("rel"), s = {};
            s.tick = e.payload.tick,
            s.players = {},
            s.star = {},
            s.defenders = {},
            s.attackers = {};
            var l = e.payload.star;
            s.star.uid = l.uid,
            s.star.kind = "Star",
            s.star.icon = "<div class='icon-star-1'></div>",
            s.star.colour = t.galaxy.players[l.puid].colourBox,
            s.star.player = t.galaxy.players[l.puid].hyperlinkedAlias,
            s.star.name = l.name,
            s.star.shipsStart = l.ss,
            s.star.shipsEnd = l.es,
            s.star.weaponSkill = l.w,
            s.star.shipsLost = l.ss - l.es,
            n(l),
            a = t.galaxy.stars[l.uid] ? "message_event_combat_scanned" : "message_event_combat_unscanned",
            i.body = Crux.Text(a, "rel pad12").size(432).pos(48).format(s.star).roost(i);
            for (o in e.payload.attackers) {
                var c = e.payload.attackers[o];
                s.attackers[o] = r(c),
                n(c)
            }
            for (o in e.payload.defenders) {
                var u = e.payload.defenders[o];
                s.defenders[o] = r(u),
                n(u)
            }
            var d, p = "<tr><td>[[icon]]</td><td>[[colour]]</td><td>[[player]]</td><td>[[shipsStart]]</td><td>[[shipsLost]]</td><td>[[shipsEnd]]</td></tr>";
            d = "<table class='combat_result'>",
            d += "<tr><td></td><td></td><td></td><td>Before</td><td>Lost</td><td>After</td></tr>",
            d += "<tr><td colspan='6' style='text-align:left' class='combat_result_teams_heading'>Defenders: Weapons " + (e.payload.dw - 1) + " (+1)</td></tr>",
            d += Crux.format(p, s.star);
            for (o in s.defenders)
                d += Crux.format(p, s.defenders[o]);
            d += "<tr><td colspan='6' style='text-align:left' class='combat_result_teams_heading'>Attackers: Weapons " + e.payload.aw + "</td></tr>";
            for (o in s.attackers)
                d += Crux.format(p, s.attackers[o]);
            return d += "</table>",
            Crux.Text("", "rel").size(388).pos(60).rawHTML(d).format(s).roost(i),
            s.alias = t.galaxy.players[e.payload.looter].hyperlinkedAlias,
            s.loot = e.payload.loot,
            e.payload.loot > 0 && Crux.Text("message_event_combatmkii_loot", "rel pad12").size(432).pos(48).format(s).roost(i),
            Crux.Widget("rel").size(432, 16).roost(i),
            i
        }
        ,
        e.CombatEventBody = function(e) {
            var r, n, o = Crux.Widget("rel"), a = {};
            a.tick = e.payload.tick;
            var i = {};
            a.star = {};
            var s = e.payload.st;
            a.star.uid = s.uid,
            a.star.kind = "Star",
            a.star.colour = t.galaxy.players[s.puid].colourBox,
            a.star.player = t.galaxy.players[s.puid].hyperlinkedAlias,
            a.star.shipsStart = s.ss,
            a.star.shipsEnd = s.es,
            a.star.weaponSkill = s.w,
            a.star.name = s.name,
            t.galaxy.stars[s.uid] && (a.star.name = t.galaxy.stars[s.uid].n),
            a.defender = t.galaxy.players[s.puid].hyperlinkedAlias,
            a.winner = t.galaxy.players[e.payload.w].hyperlinkedAlias,
            a.salvage = e.payload.s,
            i[s.puid] = {
                colour: t.galaxy.players[s.puid].colourBox,
                alias: t.galaxy.players[s.puid].hyperlinkedAlias,
                shipsStart: s.ss,
                shipsEnd: s.es
            },
            a.fleets = {};
            for (r in e.payload.f) {
                var l = e.payload.f[r];
                a.fleets[r] = {
                    kind: "Carrier",
                    name: l.n,
                    colour: t.galaxy.players[l.puid].colourBox,
                    player: t.galaxy.players[l.puid].hyperlinkedAlias,
                    shipsStart: l.ss,
                    shipsEnd: l.es,
                    weaponSkill: l.w
                },
                void 0 === i[l.puid] ? i[l.puid] = {
                    colour: t.galaxy.players[l.puid].colourBox,
                    alias: t.galaxy.players[l.puid].hyperlinkedAlias,
                    shipsStart: l.ss,
                    shipsEnd: l.es
                } : (i[l.puid].shipsStart += l.ss,
                i[l.puid].shipsEnd += l.es)
            }
            n = t.galaxy.stars[s.uid] ? "message_event_combat_scanned" : "message_event_combat_unscanned",
            o.body = Crux.Text(n, "rel pad12").size(432).pos(48).format(a.star).roost(o);
            for (var c in i)
                Crux.Text("message_event_combat_players", "rel pad12").size(432).pos(48).format(i[c]).roost(o);
            Crux.Text("message_event_combat_end", "rel pad12").size(432).pos(48).format(a).roost(o);
            var u = "<table class='combat_result'>"
              , d = "<tr><td>[[colour]]</td><td>[[kind]]</td><td>[[shipsStart]] Ships</td><td>[[weaponSkill]]</td><td>[[shipsEnd]] Ships</td></tr>";
            u += "<tr><td>&nbsp;</td><td>Unit</td><td>Before</td><td>Tech</td><td>After</td></tr>",
            u += Crux.format(d, a.star);
            for (r in a.fleets)
                u += Crux.format(d, a.fleets[r]);
            return u += "</table>",
            Crux.Text("", "rel").size(432).pos(48).rawHTML(u).format(a).roost(o),
            Crux.Widget("rel").size(480, 16).roost(o),
            o
        }
        ,
        e.InboxScreenFooter = function() {
            var e = Crux.Widget("rel").size(480, 56);
            return Crux.Widget("col_black").grid(0, 0, 30, .5).roost(e),
            e.back = Crux.Button("back", "inbox_page_back").grid(18, .5, 5, 3).roost(e),
            e.next = Crux.Button("next", "inbox_page_next").grid(22.5, .5, 5, 3).roost(e),
            screen.closeButton = Crux.IconButton("icon-cancel", "hide_screen").grid(27, .5, 3, 3).roost(e),
            0 === r.page && e.back.disable(),
            e.next.disable(),
            null !== r.messages[r.filter] && r.messages[r.filter].length === r.mpp && e.next.enable(),
            e
        }
        ,
        e.DiplomacyDetailScreen = function() {
            var n, o, a = e.Screen("diplomacy"), i = r.selectedMessage;
            e.InboxBackButton().roost(a);
            var s = Crux.Widget("rel").roost(a)
              , l = t.galaxy.players[i.payload.from_uid]
              , c = Crux.Clickable("select_player", l.uid).roost(s);
            if (Crux.Image("../images/avatars/160/" + l.avatar + ".jpg", "abs").grid(0, .75, 3, 3).roost(c),
            Crux.Text("fromto", "pad12").size(96).pos(48).roost(s),
            o = r.createToList(i),
            Crux.Text("", "pad12 rel minh72").size(384).pos(96).rawHTML(o).roost(s),
            Crux.Text("", "pad12 txt_right txt_tiny txt_em").grid(20, 0, 10, 0).rawHTML(Crux.formatDate(new Date(i.created))).roost(s),
            Crux.Text("", "pad12 col_accent rel txt_selectable").size(432).pos(48).rawHTML(i.payload.subject).roost(s),
            o = i.payload.body.replace(/\n/g, "<br>"),
            o = r.hyperlinkMessage(o),
            Crux.Text("", "pad12 rel txt_selectable").size(432).pos(48).rawHTML(o).roost(s),
            Crux.Widget("rel col_grey").size(480, 8).roost(s),
            i.commentsLoaded ? r.noOlderComments || r.selectedMessage.comments.length !== r.cpp || Crux.Text("inbox_load_older_comments", "col_black txt_center pad12 rel").size(480, 48).roost(a) : Crux.Text("loading_comments", "col_accent txt_center pad12 rel").size(480, 48).roost(a),
            i.comments)
                for (n = r.selectedMessage.comments.length - 1; n >= 0; n -= 1)
                    e.MessageComment(r.selectedMessage.comments[n], n).roost(a);
            return e.NewMessageCommentBox().roost(a),
            a
        }
        ,
        e.NewMessageCommentBox = function() {
            var e = Crux.Widget("rel").size(480, 240);
            return e.comment = Crux.TextInput("multi", "comment_box_change").grid(0, .25, 30, 12).setText(r.commentDrafts[r.selectedMessage.key]).focus().roost(e),
            e.send = Crux.Button("send", "pre_inboxt_post_comment").grid(20, 12, 10, 3).roost(e),
            Crux.Button("back", "show_screen", "inbox").grid(0, 12, 10, 3).roost(e),
            e.onChange = function() {
                r.commentDrafts[r.selectedMessage.key] = e.comment.getText()
            }
            ,
            e.onPrePostComment = function() {
                r.commentDrafts[r.selectedMessage.key] = "";
                var t = e.comment.getText();
                e.comment.setText(""),
                e.trigger("inboxt_post_comment", t)
            }
            ,
            e.onInsertStarName = function(t, r) {
                e.comment.insert(r)
            }
            ,
            e.on("pre_inboxt_post_comment", e.onPrePostComment),
            e.on("comment_box_change", e.onChange),
            e.on("insert_star_name", e.onInsertStarName),
            e
        }
        ,
        e.MessageComment = function(e, n) {
            var o = Crux.Widget("rel minh72");
            n % 2 === 0 && o.addStyle("col_accent"),
            Crux.Text("", "pad12 txt_right txt_tiny txt_em").grid(20, 0, 10, 0).rawHTML(Crux.formatDate(new Date(e.created))).roost(o);
            var a = t.galaxy.players[e.player_uid]
              , i = Crux.Clickable("select_player", a.uid).roost(o);
            Crux.Image("../images/avatars/160/" + a.avatar + ".jpg", "abs").grid(0, .75, 3, 3).roost(i);
            var s = a.colourBox + " " + a.hyperlinkedAlias + "<br>";
            return s += e.body.replace(/\n/g, "<br />"),
            s = r.hyperlinkMessage(s),
            o.comment = Crux.Text("comment", "rel pad12 txt_selectable").size(416).pos(48).format({
                message: s
            }).roost(o),
            o
        }
        ,
        e.ComposeDiplomacyScreen = function() {
            var n, o, a, i = e.Screen("new_message");
            Crux.Text("", "pad12").rawHTML("To: ").grid(0, 3, 3, 3).roost(i);
            var s = [t.player.uid];
            for (n = r.draft.to.length - 1; n >= 0; n--)
                s.push(r.draft.to[n]);
            if (s.length !== t.filledPlayerPositions && s.length <= 18) {
                var l = {
                    name: "select_player",
                    body: "compose_select_player_body",
                    returnScreen: "compose",
                    selectionEvent: "inbox_add_recipient",
                    playerFilter: s
                };
                Crux.Button("", "show_screen", ["select_player", l]).grid(21.5, 3, 3, 3).rawHTML("+").roost(i);
                var c = Crux.Button("all", "inboxt_draft_addall").grid(24, 3, 6, 3).roost(i);
                t.playerCount > 18 && c.disable()
            }
            for (a = "",
            n = r.draft.to.length - 1; n >= 0; n--)
                o = t.galaxy.players[r.draft.to[n]],
                a += o.colourBox + o.qualifiedAlias,
                a += "<br>";
            return "" === a && (a = "<br>"),
            i.to = Crux.Text("", "rel pad12").size(272).pos(48, 0).rawHTML(a).roost(i),
            i.bc = Crux.Widget("rel").size(480, 368).pos(0).roost(i),
            i.subject = Crux.TextInput("single").grid(0, 0, 30, 3).setText(r.draft.subject).roost(i.bc),
            i.body = Crux.TextInput("multi").grid(0, 3, 30, 12).setText(r.draft.body).roost(i.bc),
            i.send = Crux.Button("send", "inbox_draft_send").grid(20, 15, 10, 3).disable().roost(i.bc),
            i.clear = Crux.Button("clear", "inboxt_draft_clear").grid(0, 15, 10, 3).roost(i.bc),
            Crux.Widget("col_accent").grid(0, 18.5, 30, .5).roost(i.bc),
            Crux.Widget("col_black").grid(0, 19, 30, 4).roost(i.bc),
            Crux.Text("compose_footer", "txt_center txt_small pad8").grid(0, 19, 30, 4).roost(i.bc),
            i.onChange = function() {
                r.draft.body = i.body.getText(),
                r.draft.subject = i.subject.getText(),
                i.validate()
            }
            ,
            i.validate = function() {
                "" !== r.draft.subject && "" !== r.draft.body ? i.send.enable() : i.send.disable()
            }
            ,
            i.validate(),
            i.onInsertStarName = function(e, t) {
                i.body.insert(t)
            }
            ,
            i.body.node.on("keyup", i.onChange),
            i.subject.node.on("keyup", i.onChange),
            i.on("insert_star_name", i.onInsertStarName),
            i
        }
    }
}(),
!NeptunesPride)
    var NeptunesPride = {};
if (function() {
    NeptunesPride.Map = function(e, t) {
        "use strict";
        var r = {};
        if (r = Crux.Widget(),
        r.ui.off(),
        r.ui.css("background-color", "#000000"),
        r.pos(0, 0),
        r.canvas = jQuery("<canvas></canvas>"),
        r.ui.append(r.canvas),
        r.context = r.canvas[0].getContext("2d"),
        r.context.setLineDash || (r.context.setLineDash = function() {}
        ),
        r.pixelRatio = window.devicePixelRatio || 1,
        r.context.lineCap = "round",
        r.viewportMask = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        },
        r.sx = 0,
        r.sy = 0,
        r.scale = 500 * r.pixelRatio,
        r.scaleStop = 5,
        r.scaleStops = [50, 75, 100, 200, 300, 400, 500, 600, 700, 900, 1100, 1300, 1500, 2e3],
        t.interfaceSettings.mapZoom) {
            r.scaleTarget = Number(t.interfaceSettings.mapZoom);
            for (var n = r.scaleStops.length - 1; n >= 0; n--)
                r.scaleStops[n] >= r.scaleTarget && (r.scaleStop = n)
        } else
            r.scaleTarget = r.scaleStops[r.scaleStop];
        r.miniMapEnabled = !1,
        r.scanRangeBob = 0,
        r.tickCount = 0,
        r.width = t.mapWidth,
        r.height = t.mapHeight,
        r.viewportWidth = 0,
        r.viewportHeight = 0,
        r.maxScrollX = 0,
        r.maxScrollY = 0,
        r.oldX = 0,
        r.oldY = 0,
        r.deltaX = 0,
        r.deltaY = 0,
        r.dragging = !1,
        r.rangeRotation = 0,
        r.scanRotation = 0,
        r.waypointOriginScale = .5,
        r.ripples = [],
        r.ringSrc = document.getElementById("img_star_rings"),
        r.starBgSrc1 = document.getElementById("neb1"),
        r.starBgSrc2 = document.getElementById("neb2"),
        r.starBgSrc3 = document.getElementById("neb1"),
        r.starBgSrc4 = document.getElementById("neb3"),
        r.starSrc = document.getElementById("img_stars"),
        r.haloSrc = document.getElementById("img_halo"),
        r.rippleSrc = document.getElementById("img_ripple"),
        r.fleetRangeSrc = document.getElementById("img_fleet_range"),
        r.scanningRangeSrc = document.getElementById("img_scanning_range"),
        r.fleetWaypointSrc = document.getElementById("img_fleet_waypoint"),
        r.fleetWaypointNextSrc = document.getElementById("img_fleet_waypoint_next"),
        r.selectionRingSrc = document.getElementById("img_selection_ring"),
        r.sortedStarSprites = [],
        r.sortedStarYPos = [],
        r.sortedFleetSprites = [],
        r.sortedFleetYPos = [],
        r.nebularSprites = [],
        r.scanningRangeSprite = {},
        r.fleetRangeSprite = {},
        r.selectionRingSprite = {},
        r.createSpritesOwnershipRings = function() {
            var e, n, o;
            r.ownership_rings = [];
            for (e in t.galaxy.fleets)
                n = Math.floor(t.galaxy.fleets[e].puid / 8),
                o = Math.floor(t.galaxy.fleets[e].puid % 8),
                t.galaxy.fleets[e].orbiting || (t.galaxy.fleets[e].spriteOwner = {
                    ox: 0,
                    oy: 0,
                    width: 64,
                    height: 64,
                    pivotX: 32,
                    pivotY: 32,
                    rotation: 0,
                    scale: 1 * r.pixelRatio,
                    image: r.starSrc,
                    spriteX: 64 * n,
                    spriteY: 64 * o + 64,
                    visible: !0
                })
        }
        ,
        r.createSpritesNebular = function() {
            if (r.nebularSprites = [],
            t.interfaceSettings.showNebular) {
                var e, n, o, a, i = 0, s = 1;
                for (e in t.galaxy.stars)
                    n = t.galaxy.stars[e],
                    i += 1,
                    i > 6 && (i = 0,
                    s += 1,
                    s > 6 && (s = 0),
                    0 === s && (a = r.starBgSrc2),
                    1 === s && (a = r.starBgSrc1),
                    2 === s && (a = r.starBgSrc2),
                    3 === s && (a = r.starBgSrc3),
                    4 === s && (a = r.starBgSrc4),
                    5 === s && (a = r.starBgSrc2),
                    6 === s && (a = r.starBgSrc1),
                    o = {
                        worldX: n.x,
                        worldY: n.y,
                        starscreenX: 0,
                        screenY: 0,
                        width: 640,
                        height: 640,
                        pivotX: 320,
                        pivotY: 320,
                        rotation: 360 * n.x,
                        scale: .5,
                        image: a,
                        spriteX: 0,
                        spriteY: 0,
                        visible: !0
                    },
                    r.nebularSprites.push(o),
                    o.bgz = 1.125 - (n.n.length - 3) / 10,
                    o.bgz < .875 && (o.bgz = .875))
            }
        }
        ,
        r.createSpritesFleets = function() {
            var e, n, o, a, i, s, l, c;
            r.sortedFleetSprites = [],
            r.sortedFleetYPos = [];
            for (e in t.galaxy.fleets)
                a = t.galaxy.fleets[e],
                a.showStrength = !0;
            for (e in t.galaxy.fleets) {
                a = t.galaxy.fleets[e],
                s = {},
                s.worldX = a.x,
                s.worldY = a.y,
                s.screenX = r.worldToScreenX(s.worldX),
                s.screenY = r.worldToScreenY(s.worldY),
                r.sortedFleetSprites.push(s),
                r.sortedFleetYPos.push(s.worldY),
                s.visible = !0,
                s.strength = a.st,
                s.showStrength = a.showStrength,
                s.loop = a.loop,
                a.orbiting && (s.showStrength = !1),
                s.name = a.n,
                s.colorName = "",
                s.playerAlias = "",
                a.player && (s.colorName = a.player.colorName),
                a.player && (s.playerAlias = a.player.alias),
                s.fleet = null,
                s.ownership = null,
                a.orbiting || (o = r.calcFleetAngle(a),
                s.fleet = {
                    width: 64,
                    height: 64,
                    pivotX: 32,
                    pivotY: 32,
                    rotation: o,
                    scale: .75 * r.pixelRatio,
                    image: r.starSrc,
                    spriteX: 128,
                    spriteY: 0
                },
                a.puid >= 0 && (l = Math.floor(a.puid / 8),
                c = Math.floor(a.puid % 8),
                s.ownership = {
                    width: 64,
                    height: 64,
                    pivotX: 32,
                    pivotY: 32,
                    rotation: 0,
                    scale: 1 * r.pixelRatio,
                    image: r.starSrc,
                    spriteX: 64 * l,
                    spriteY: 64 * c + 64
                }));
                for (n in t.galaxy.fleets)
                    i = t.galaxy.fleets[n],
                    a.orbiting || i.orbiting || a !== i && a.puid === i.puid && t.isInRange(a, i, .0125) && (s.strength += i.st,
                    i.showStrength = !1)
            }
            r.sortedFleetSprites.sort(function(e, t) {
                return e.worldY - t.worldY
            }),
            r.sortedFleetYPos.sort(function(e, t) {
                return e - t
            })
        }
        ,
        r.createSpritesStars = function() {
            var e, n, o, a, i, s, l, c, u, d;
            r.sortedStarSprites = [],
            r.sortedStarYPos = [];
            for (e in t.galaxy.stars) {
                if (n = t.galaxy.stars[e],
                o = {},
                o.uid = n.uid,
                o.worldX = n.x,
                o.worldY = n.y,
                o.screenX = r.worldToScreenX(o.worldX),
                o.screenY = r.worldToScreenY(o.worldY),
                o.visible = !0,
                o.star = null,
                o.resources = null,
                o.ownership = null,
                o.alliedOwnership = null,
                o.gate = null,
                o.fleets = [],
                o.waypoint = null,
                o.waypointGate = null,
                o.waypointNext = null,
                o.name = n.n,
                o.colorName = "",
                o.playerAlias = "",
                o.puid = -1,
                o.totalDefenses = n.totalDefenses,
                o.showInf = !1,
                o.inf = "",
                o.showQuickUpgrade = !1,
                o.quickUpgrade = "",
                n.player && (o.colorName = n.player.colorName,
                o.playerAlias = n.player.alias),
                t.player && (o.showInf = n.v > 0 && n.puid >= 0 || n.puid === t.player.uid,
                o.inf = n.e + "  " + n.i + "  " + n.s,
                o.showQuickUpgrade = n.v > 0 && n.puid === t.player.uid,
                o.quickUpgrade = n.uce + "  " + n.uci + "  " + n.ucs),
                r.sortedStarSprites.push(o),
                r.sortedStarYPos.push(o.worldY),
                o.star = {
                    width: 64,
                    height: 64,
                    pivotX: 32,
                    pivotY: 32,
                    rotation: 0,
                    scale: 1 * r.pixelRatio,
                    image: r.starSrc,
                    spriteX: 0,
                    spriteY: 0,
                    visibleWaypoint: !1
                },
                "0" === n.v && (o.star.spriteX = 64),
                t.waypoints.indexOf(n) >= 0 && (o.visibleWaypoint = !0,
                o.waypoint = {
                    width: 128,
                    height: 128,
                    pivotX: 64,
                    pivotY: 64,
                    rotation: 0,
                    scale: .5 * r.pixelRatio,
                    image: r.fleetWaypointSrc,
                    spriteX: 0,
                    spriteY: 0
                },
                n.ga && (o.waypointGate = {
                    width: 128,
                    height: 128,
                    pivotX: 64,
                    pivotY: 64,
                    rotation: 0,
                    scale: .3 * r.pixelRatio,
                    image: r.fleetWaypointSrc,
                    spriteX: 0,
                    spriteY: 0
                }),
                t.selectedFleet && t.selectedFleet.lastStar === n && (o.waypointNext = {
                    width: 128,
                    height: 128,
                    pivotX: 64,
                    pivotY: 64,
                    rotation: 0,
                    scale: 1 * r.pixelRatio,
                    image: r.fleetWaypointNextSrc,
                    spriteX: 0,
                    spriteY: 0
                })),
                t.galaxy.stars[e].r > 0 && (o.resources = {
                    width: 128,
                    height: 128,
                    pivotX: 64,
                    pivotY: 64,
                    rotation: 0,
                    scale: (t.galaxy.stars[e].nr + 12) / 48 * r.pixelRatio,
                    image: r.haloSrc,
                    spriteX: 0,
                    spriteY: 0
                }),
                n.puid >= 0 && (o.puid = n.puid,
                a = Math.floor(n.puid / 8),
                i = Math.floor(n.puid % 8),
                o.ownership = {
                    width: 64,
                    height: 64,
                    pivotX: 32,
                    pivotY: 32,
                    rotation: 0,
                    scale: 1 * r.pixelRatio,
                    image: r.starSrc,
                    spriteX: 64 * a,
                    spriteY: 64 * i + 64
                }),
                n.alliedDefenders.length)
                    for (o.alliedOwnership = [],
                    l = 0; l < n.alliedDefenders.length; l += 1)
                        s = n.alliedDefenders[l],
                        a = Math.floor(s / 8),
                        i = Math.floor(s % 8),
                        o.alliedOwnership.push({
                            width: 64,
                            height: 64,
                            pivotX: 0 - 16 * l,
                            pivotY: 8,
                            rotation: 0,
                            scale: .5 * r.pixelRatio,
                            image: r.starSrc,
                            spriteX: 64 * a,
                            spriteY: 64 * i + 64
                        });
                if (1 == n.ga && (o.gate = {
                    width: 64,
                    height: 64,
                    pivotX: 32,
                    pivotY: 32,
                    rotation: 0,
                    scale: 1 * r.pixelRatio,
                    image: r.starSrc,
                    spriteX: 512,
                    spriteY: 64 * i + 64
                }),
                n.fleetsInOrbit.length)
                    for (d = !1,
                    l = 0,
                    c = n.fleetsInOrbit.length; c > l; l += 1)
                        u = r.calcFleetAngle(n.fleetsInOrbit[l]),
                        0 !== u || d || (d = !0,
                        o.fleets.push({
                            loop: n.fleetsInOrbit[l].loop,
                            width: 64,
                            height: 64,
                            pivotX: 32,
                            pivotY: 32,
                            rotation: 0,
                            scale: .75 * r.pixelRatio,
                            image: r.starSrc,
                            spriteX: 128,
                            spriteY: 0
                        })),
                        0 !== u && o.fleets.push({
                            loop: n.fleetsInOrbit[l].loop,
                            width: 64,
                            height: 64,
                            pivotX: 32,
                            pivotY: 32,
                            rotation: u,
                            scale: .75 * r.pixelRatio,
                            image: r.starSrc,
                            spriteX: 128,
                            spriteY: 0
                        })
            }
            r.sortedStarSprites.sort(function(e, t) {
                return e.worldY - t.worldY
            }),
            r.sortedStarYPos.sort(function(e, t) {
                return e - t
            })
        }
        ,
        r.createEssentialSprites = function() {
            r.rippleSprite = {
                screenX: 0,
                screenY: 0,
                width: 128,
                height: 128,
                pivotX: 64,
                pivotY: 64,
                rotation: 0,
                scale: 0,
                image: r.rippleSrc,
                spriteX: 0,
                spriteY: 0,
                visible: !0
            },
            r.scanningRangeSprite = {
                screenX: 0,
                screenY: 0,
                width: 576,
                height: 576,
                pivotX: 288,
                pivotY: 288,
                rotation: r.scanRotation,
                scale: 1,
                image: r.scanningRangeSrc,
                spriteX: 0,
                spriteY: 0,
                visible: !0
            },
            r.fleetRangeSprite = {
                screenX: 0,
                screenY: 0,
                width: 576,
                height: 576,
                pivotX: 288,
                pivotY: 288,
                rotation: r.rangeRotation,
                scale: 0,
                image: r.fleetRangeSrc,
                spriteX: 0,
                spriteY: 0
            },
            r.selectionRingSprite = {
                screenX: 0,
                screenY: 0,
                width: 128,
                height: 128,
                pivotX: 64,
                pivotY: 64,
                rotation: .5,
                scale: .5 * r.pixelRatio * r.scale / 250,
                image: r.selectionRingSrc,
                spriteX: 0,
                spriteY: 0
            }
        }
        ,
        r.createSprites = function() {
            t.galaxy.stars && (r.createEssentialSprites(),
            r.createSpritesStars(),
            r.createSpritesFleets(),
            r.createSpritesNebular(),
            Crux.drawReqired = !0)
        }
        ,
        r.calcWorldViewport = function() {
            r.worldViewport = {},
            r.worldViewport.left = r.screenToWorldX(-64),
            r.worldViewport.right = r.screenToWorldX(r.viewportWidth + 64),
            r.worldViewport.top = r.screenToWorldY(-64),
            r.worldViewport.bottom = r.screenToWorldY(r.viewportHeight + 64)
        }
        ,
        r.calcVisibleRange = function() {
            function e(e, t, r, n) {
                for (arguments.length < 3 && (r = 0),
                arguments.length < 4 && (n = e.length); n > r; ) {
                    var o = r + n >> 1;
                    t < e[o] ? n = o : r = o + 1
                }
                return r
            }
            r.startVisisbleStarIndex = e(r.sortedStarYPos, r.worldViewport.top),
            r.endVisisbleStarIndex = e(r.sortedStarYPos, r.worldViewport.bottom),
            r.startVisisbleFleetIndex = e(r.sortedFleetYPos, r.worldViewport.top),
            r.endVisisbleFleetIndex = e(r.sortedFleetYPos, r.worldViewport.bottom)
        }
        ,
        r.calcVisibleStarsAndFleets = function() {
            var e, t;
            for (e = r.startVisisbleStarIndex,
            t = r.endVisisbleStarIndex; t > e; e += 1)
                r.sortedStarSprites[e].visible = !0,
                (r.sortedStarSprites[e].worldX < r.worldViewport.left || r.sortedStarSprites[e].worldX > r.worldViewport.right) && (r.sortedStarSprites[e].visible = !1);
            for (e = r.startVisisbleFleetIndex,
            t = r.endVisisbleFleetIndex; t > e; e += 1)
                r.sortedFleetSprites[e].visible = !0,
                (r.sortedFleetSprites[e].worldX < r.worldViewport.left || r.sortedFleetSprites[e].worldX > r.worldViewport.right) && (r.sortedFleetSprites[e].visible = !1)
        }
        ,
        r.updateSpritePositions = function() {
            var e, t, n, o, a, i, s = r.scale / 400;
            for (.35 > s && (s = .35),
            s > 1 && (s = 1),
            s *= r.pixelRatio,
            e = r.startVisisbleStarIndex,
            t = r.endVisisbleStarIndex; t > e; e += 1)
                if (a = r.sortedStarSprites[e],
                a.visible) {
                    if (a.screenX = r.worldToScreenX(a.worldX),
                    a.screenY = r.worldToScreenY(a.worldY),
                    a.star.scale = .75 * s,
                    a.ownership && (a.ownership.scale = s),
                    a.alliedOwnership)
                        for (n = 0; n < a.alliedOwnership.length; n += 1)
                            a.alliedOwnership[n].scale = s / 2;
                    for (a.gate && (a.gate.scale = 2.5 * s),
                    n = 0,
                    o = a.fleets.length; o > n; n += 1)
                        a.fleets[n].scale = .65 * s,
                        a.fleets[n].loop && (a.fleets[n].scale *= .75)
                }
            for (e = 0,
            t = r.nebularSprites.length; t > e; e += 1)
                r.nebularSprites[e].screenX = r.worldToScreenX(r.nebularSprites[e].worldX) * r.nebularSprites[e].bgz,
                r.nebularSprites[e].screenY = r.worldToScreenY(r.nebularSprites[e].worldY) * r.nebularSprites[e].bgz,
                r.nebularSprites[e].scale = r.scale / 400 * r.pixelRatio;
            for (e = r.startVisisbleFleetIndex,
            t = r.endVisisbleFleetIndex; t > e; e += 1)
                i = r.sortedFleetSprites[e],
                i.visible && (i.screenX = r.worldToScreenX(i.worldX),
                i.screenY = r.worldToScreenY(i.worldY),
                i.fleet && (i.fleet.scale = .65 * s,
                i.loop && (i.fleet.scale *= .75),
                i.ownership && (i.ownership.scale = s,
                i.loop && (i.ownership.scale *= .75))))
        }
        ,
        r.drawSprite = function(e) {
            r.context.save(),
            r.context.translate(e.screenX, e.screenY),
            r.context.rotate(e.rotation),
            r.context.scale(e.scale, e.scale),
            r.context.drawImage(e.image, e.spriteX, e.spriteY, e.width, e.height, -e.pivotX, -e.pivotY, e.width, e.height),
            r.context.restore()
        }
        ,
        r.debugDrawNeighbours = function(e) {
            var n, o, a, i, s = t.galaxy.stars[e];
            for (r.context.globalAlpha = 1,
            r.context.strokeStyle = "rgba(255, 128, 255, 0.25)",
            r.context.lineWidth = 2,
            n = 0,
            o = s.nh.length; o > n; n += 1)
                a = t.galaxy.stars[s.nh[n]],
                r.context.beginPath(),
                r.context.moveTo(r.worldToScreenX(s.x), r.worldToScreenY(s.y)),
                r.context.lineTo(r.worldToScreenX(a.x), r.worldToScreenY(a.y)),
                r.context.stroke();
            var l = [];
            for (l.push("IDEAL: " + s.ideal),
            l.push("DEFICIT: " + s.deficit),
            r.context.font = 12 * r.pixelRatio + "px OpenSansRegular, sans-serif",
            r.context.fillStyle = "#FF8888",
            r.context.textAlign = "left",
            r.context.textBaseline = "middle",
            n = 0; n < l.length; n += 1)
                i = l[n],
                r.context.fillText(i, r.worldToScreenX(s.x) + 24 * r.pixelRatio, r.worldToScreenY(s.y) + 14 * n * r.pixelRatio)
        }
        ,
        r.drawStars = function() {
            function e(e) {
                r.context.scale(e.scale, e.scale),
                r.context.drawImage(e.image, e.spriteX, e.spriteY, e.width, e.height, -e.pivotX, -e.pivotY, e.width, e.height),
                r.context.scale(1 / e.scale, 1 / e.scale)
            }
            var t, n, o, a;
            for (t = r.startVisisbleStarIndex,
            n = r.endVisisbleStarIndex; n > t; t += 1)
                if (a = r.sortedStarSprites[t],
                a.visible) {
                    if (r.context.save(),
                    r.context.translate(a.screenX, a.screenY),
                    a.resources && !r.miniMapEnabled && r.scale > 375 && e(a.resources),
                    a.gate && e(a.gate),
                    a.star && e(a.star),
                    a.ownership && e(a.ownership),
                    a.alliedOwnership)
                        for (o = 0; o < a.alliedOwnership.length; o += 1)
                            e(a.alliedOwnership[o]);
                    a.waypoint && e(a.waypoint),
                    a.waypointGate && e(a.waypointGate),
                    a.waypointNext && (a.waypointNext.scale = r.waypointOriginScale,
                    e(a.waypointNext)),
                    r.context.restore()
                }
        }
        ,
        r.drawNebular = function() {
            var e, t;
            for (e = 0,
            t = r.nebularSprites.length; t > e; e += 1)
                r.drawSprite(r.nebularSprites[e])
        }
        ,
        r.drawRipples = function() {
            var e, t;
            for (e = r.ripples.length - 1; e >= 0; e--)
                t = r.ripples[e],
                r.rippleSprite.scale = t.radius / 64 * r.pixelRatio,
                r.rippleSprite.screenX = r.worldToScreenX(t.worldX),
                r.rippleSprite.screenY = r.worldToScreenY(t.worldY),
                r.context.globalAlpha = t.alpha,
                r.drawSprite(r.rippleSprite),
                r.context.globalAlpha = 1
        }
        ,
        r.drawFleets = function() {
            function e(e) {
                r.context.scale(e.scale, e.scale),
                r.context.rotate(e.rotation),
                r.context.drawImage(e.image, e.spriteX, e.spriteY, e.width, e.height, -e.pivotX, -e.pivotY, e.width, e.height),
                r.context.rotate(-e.rotation),
                r.context.scale(1 / e.scale, 1 / e.scale)
            }
            var t, n, o;
            for (t = r.startVisisbleFleetIndex,
            n = r.endVisisbleFleetIndex; n > t; t += 1)
                o = r.sortedFleetSprites[t],
                o.fleet && o.visible && (r.context.save(),
                r.context.translate(o.screenX, o.screenY),
                e(o.ownership),
                e(o.fleet),
                r.context.restore())
        }
        ,
        r.drawFleetPath = function() {
            var e, n, o;
            for (e in t.galaxy.fleets) {
                o = t.galaxy.fleets[e];
                var a = .5
                  , i = 4;
                for (!o.orbiting && o.path.length && (a = .75,
                i = 12,
                o === t.selectedFleet && (a = .75,
                i = 16),
                r.context.globalAlpha = a,
                r.context.strokeStyle = "rgba(255, 255, 255, 0.35)",
                r.context.lineWidth = i * r.pixelRatio,
                r.context.beginPath(),
                r.context.moveTo(r.worldToScreenX(o.x), r.worldToScreenY(o.y)),
                r.context.lineTo(r.worldToScreenX(o.path[0].x), r.worldToScreenY(o.path[0].y)),
                r.context.stroke()),
                a = .5,
                i = 4,
                o === t.selectedFleet && (a = .75,
                i = 8),
                o.loop && r.context.setLineDash([5, 10]),
                r.context.globalAlpha = a,
                r.context.strokeStyle = o.player.color,
                r.context.lineWidth = i * r.pixelRatio,
                r.context.beginPath(),
                r.context.moveTo(r.worldToScreenX(o.x), r.worldToScreenY(o.y)),
                n = 0; n < o.path.length; n += 1)
                    r.context.lineTo(r.worldToScreenX(o.path[n].x), r.worldToScreenY(o.path[n].y));
                r.context.stroke(),
                r.context.globalAlpha = 1,
                r.context.setLineDash([])
            }
            if (t.selectedFleet) {
                for (r.context.setLineDash([3, 6]),
                r.context.globalAlpha = 1,
                r.context.strokeStyle = "#FFFFFF",
                r.context.lineWidth = 3 * r.pixelRatio,
                r.context.beginPath(),
                r.context.moveTo(r.worldToScreenX(t.selectedFleet.x), r.worldToScreenY(t.selectedFleet.y)),
                n = 0; n < t.selectedFleet.path.length; n += 1)
                    r.context.lineTo(r.worldToScreenX(t.selectedFleet.path[n].x), r.worldToScreenY(t.selectedFleet.path[n].y));
                r.context.stroke(),
                r.context.setLineDash([])
            }
        }
        ,
        r.drawOrbitingFleets = function() {
            function e(e) {
                r.context.scale(e.scale, e.scale),
                r.context.rotate(e.rotation),
                r.context.drawImage(e.image, e.spriteX, e.spriteY, e.width, e.height, -e.pivotX, -e.pivotY, e.width, e.height),
                r.context.rotate(-e.rotation),
                r.context.scale(1 / e.scale, 1 / e.scale)
            }
            var t, n, o, a, i;
            for (t = r.startVisisbleStarIndex,
            n = r.endVisisbleStarIndex; n > t; t += 1)
                if (i = r.sortedStarSprites[t],
                i.visible) {
                    for (r.context.save(),
                    r.context.translate(i.screenX, i.screenY),
                    o = 0,
                    a = i.fleets.length; a > o; o += 1)
                        e(i.fleets[o]);
                    r.context.restore()
                }
        }
        ,
        r.drawScanningRange = function() {
            t.selectedStar && t.selectedStar.player && (r.scale < 150 || (r.scanningRangeSprite.screenX = r.worldToScreenX(t.selectedStar.x),
            r.scanningRangeSprite.screenY = r.worldToScreenY(t.selectedStar.y),
            r.scanningRangeSprite.scale = t.selectedStar.player.tech.scanning.value * r.scale * r.pixelRatio / 250,
            r.drawSprite(r.scanningRangeSprite)))
        }
        ,
        r.drawFleetRange = function() {
            t.selectedFleet && t.selectedFleet.lastStar && "edit_waypoints" === t.editMode && (r.fleetRangeSprite.screenX = r.worldToScreenX(t.selectedFleet.lastStar.x),
            r.fleetRangeSprite.screenY = r.worldToScreenY(t.selectedFleet.lastStar.y),
            r.fleetRangeSprite.scale = (t.player.tech.propulsion.value + .0125) * r.scale * r.pixelRatio / 250,
            r.drawSprite(r.fleetRangeSprite))
        }
        ,
        r.drawStarFleetRange = function() {
            t.selectedStar && t.selectedStar.player && (r.scale < 150 || (r.fleetRangeSprite.screenX = r.worldToScreenX(t.selectedStar.x),
            r.fleetRangeSprite.screenY = r.worldToScreenY(t.selectedStar.y),
            r.fleetRangeSprite.scale = (t.selectedStar.player.tech.propulsion.value + .0125) * r.scale * r.pixelRatio / 250,
            r.drawSprite(r.fleetRangeSprite)))
        }
        ,
        r.drawSelectionRing = function() {
            t.selectedSpaceObject && (r.selectionRingSprite.scale = .5 * r.pixelRatio * r.scale / 250,
            r.selectionRingSprite.screenX = r.worldToScreenX(t.selectedSpaceObject.x),
            r.selectionRingSprite.screenY = r.worldToScreenY(t.selectedSpaceObject.y),
            r.drawSprite(r.selectionRingSprite))
        }
        ,
        r.drawRuler = function() {
            var e, n = t.ruler.stars.length;
            if (!(2 > n)) {
                var o = .3
                  , a = .6
                  , i = .05
                  , s = a;
                for (e = n - 1; e > 0; e--) {
                    r.context.strokeStyle = "rgba(255, 255, 255, " + s + ")",
                    r.context.lineWidth = 8 * r.pixelRatio,
                    r.context.beginPath();
                    var l = r.worldToScreenX(t.ruler.stars[e].x)
                      , c = r.worldToScreenY(t.ruler.stars[e].y)
                      , u = r.worldToScreenX(t.ruler.stars[e - 1].x)
                      , d = r.worldToScreenY(t.ruler.stars[e - 1].y);
                    r.context.moveTo(l, c),
                    r.context.lineTo(u, d),
                    r.context.stroke(),
                    s = Math.max(o, s - i)
                }
            }
        }
        ,
        r.drawText = function() {
            var e, n, o, a, i = 0, s = 0, l = 0, c = 16 * r.pixelRatio, u = 38 * r.pixelRatio, d = 28 * r.pixelRatio;
            if (r.context.font = 14 * r.pixelRatio + "px OpenSansRegular, sans-serif",
            r.context.textAlign = "center",
            r.context.fillStyle = "#FDF0DC",
            r.context.textBaseline = "middle",
            "high" === t.interfaceSettings.mapGraphics && (r.context.shadowColor = "#000000",
            r.context.shadowOffsetX = 2,
            r.context.shadowOffsetY = 2,
            r.context.shadowBlur = 2),
            t.colorBlindHelper) {
                for (r.context.fillStyle = "#000000",
                r.context.globalAlpha = .5,
                e = r.startVisisbleStarIndex,
                n = r.endVisisbleStarIndex; n > e; e += 1)
                    o = r.sortedStarSprites[e],
                    o.visible && r.context.fillRect(o.screenX - 48 * r.pixelRatio, o.screenY - 12 * r.pixelRatio, 96 * r.pixelRatio, 24 * r.pixelRatio);
                for (e = r.startVisisbleFleetIndex,
                n = r.endVisisbleFleetIndex; n > e; e += 1)
                    a = r.sortedFleetSprites[e],
                    a.visible && r.context.fillRect(a.screenX - 48 * r.pixelRatio, a.screenY - 12 * r.pixelRatio, 96 * r.pixelRatio, 24 * r.pixelRatio);
                for (r.context.globalAlpha = 1,
                r.context.fillStyle = "#FDF0DC",
                e = r.startVisisbleStarIndex,
                n = r.endVisisbleStarIndex; n > e; e += 1)
                    o = r.sortedStarSprites[e],
                    o.visible && r.context.fillText(o.colorName, o.screenX, o.screenY);
                for (e = r.startVisisbleFleetIndex,
                n = r.endVisisbleFleetIndex; n > e; e += 1)
                    a = r.sortedFleetSprites[e],
                    a.visible && r.context.fillText(a.colorName, a.screenX, a.screenY)
            }
            for (e = r.startVisisbleFleetIndex,
            n = r.endVisisbleFleetIndex; n > e; e += 1)
                a = r.sortedFleetSprites[e],
                a.visible && a.showStrength && (r.scale < t.interfaceSettings.textZoomShips || r.context.fillText(a.strength, a.screenX + s, a.screenY + d));
            for (e = r.startVisisbleStarIndex,
            n = r.endVisisbleStarIndex; n > e; e += 1)
                o = r.sortedStarSprites[e],
                o.visible && (i = 0,
                l = o.visibleWaypoint && t.interfaceSettings.showWaypointChoices ? u : d,
                t.interfaceSettings.showBasicInfo && (r.scale >= t.interfaceSettings.textZoomStarNames && (r.context.fillText(o.name, o.screenX + s, o.screenY + l + i),
                i += c),
                r.scale >= t.interfaceSettings.textZoomShips && o.totalDefenses && (r.context.fillText(o.totalDefenses, o.screenX + s, o.screenY + l + i),
                i += c)),
                t.interfaceSettings.showStarInfrastructure && t.player && r.scale >= t.interfaceSettings.textZoomInf && o.showInf && r.context.fillText(o.inf, o.screenX + s, o.screenY - l),
                r.scale > t.interfaceSettings.textZoomStarPlayerNames && o.playerAlias && (r.context.fillText(o.playerAlias, o.screenX + s, o.screenY + l + i),
                i += c),
                t.interfaceSettings.showQuickUpgrade && t.player && r.scale >= t.interfaceSettings.textZoomShips && o.showQuickUpgrade && r.context.fillText(o.quickUpgrade, o.screenX + s, o.screenY + i + 28 * r.pixelRatio));
            "high" === t.interfaceSettings.mapGraphics && (r.context.shadowColor = null,
            r.context.shadowOffsetX = 0,
            r.context.shadowOffsetY = 0,
            r.context.shadowBlur = 0)
        }
        ,
        r.draw = function() {
            r.context.lineCap = "round",
            r.scale !== r.scaleTarget && r.zoom(r.scaleTarget - r.scale),
            r.calcWorldViewport(),
            r.calcVisibleRange(),
            r.calcVisibleStarsAndFleets(),
            r.updateSpritePositions(),
            r.context.fillStyle = "#000000",
            r.context.globalAlpha = 1,
            r.context.fillRect(0, 0, r.viewportMask.w, r.viewportMask.h),
            r.miniMapEnabled || r.drawNebular(),
            r.drawSelectionRing(),
            t.interfaceSettings.showRipples && !r.miniMapEnabled && r.drawRipples(),
            r.drawStars(),
            r.drawScanningRange(),
            r.drawStarFleetRange(),
            t.interfaceSettings.showFleets && !r.miniMapEnabled && (r.drawFleetRange(),
            r.drawFleetPath(),
            r.drawOrbitingFleets(),
            r.drawFleets()),
            "ruler" === t.editMode && r.drawRuler(),
            r.drawText(),
            r.context.globalAlpha = 1
        }
        ,
        r.pinchZoom = function(e, t, n) {
            var o, a, i, s, l, c;
            o = (r.sx - t) / r.scale,
            a = (r.sy - n) / r.scale,
            r.scale = e,
            r.scaleTarget = r.scale,
            i = (r.sx - t) / r.scale,
            s = (r.sy - n) / r.scale,
            l = i - o,
            c = s - a,
            r.sx -= Math.round(l * r.scale),
            r.sy -= Math.round(c * r.scale),
            isNaN(r.sx) && (r.sx = 0,
            r.sy = 0)
        }
        ,
        r.onPinchZoom = function(e) {
            "pinchstart" == e.type && (r.pinchStartScale = r.scale);
            var t = r.pinchStartScale * e.scale;
            t < 50 * r.pixelRatio || t > 2e3 * r.pixelRatio || r.pinchZoom(t, e.center.x, e.center.y)
        }
        ;
        var o = new Hammer.Manager(r.canvas[0]);
        return o.add(new Hammer.Pinch),
        o.on("pinchstart", r.onPinchZoom),
        o.on("pinchout", r.onPinchZoom),
        o.on("pinchin", r.onPinchZoom),
        r.zoom = function(e) {
            var t, n, o, a, i, s;
            t = (r.sx - r.viewportWidth / r.pixelRatio / 2) / r.scale,
            n = (r.sy - r.viewportHeight / r.pixelRatio / 2) / r.scale,
            r.scale += e,
            r.miniMapEnabled = r.scale < 200 ? !0 : !1,
            o = (r.sx - r.viewportWidth / r.pixelRatio / 2) / r.scale,
            a = (r.sy - r.viewportHeight / r.pixelRatio / 2) / r.scale,
            i = o - t,
            s = a - n,
            r.sx -= i * r.scale,
            r.sy -= s * r.scale
        }
        ,
        r.onZoomIn = function() {
            if (!r.zooming) {
                if (r.scaleStop += 1,
                r.scaleStop > r.scaleStops.length - 1)
                    return r.scaleStop = r.scaleStops.length - 1,
                    void 0;
                r.zooming = !0,
                Crux.createAnim(r, "scaleTarget", r.scaleTarget, r.scaleStops[r.scaleStop], 250, {
                    onComplete: r.onZoomComplete
                })
            }
        }
        ,
        r.onZoomOut = function() {
            if (!r.zooming) {
                if (r.scaleStop -= 1,
                r.scaleStop < 0)
                    return r.scaleStop = 0,
                    void 0;
                r.zooming = !0,
                Crux.createAnim(r, "scaleTarget", r.scaleTarget, r.scaleStops[r.scaleStop], 250, {
                    onComplete: r.onZoomComplete
                })
            }
        }
        ,
        r.onZoomComplete = function() {
            r.zooming = !1,
            t.setInterfaceSetting("mapZoom", r.scaleStops[r.scaleStop])
        }
        ,
        r.onZoomMinimap = function() {
            r.miniMapEnabled ? (r.scaleStop = 3,
            Crux.createAnim(r, "scaleTarget", r.scaleTarget, r.scaleStops[r.scaleStop], 500),
            r.miniMapEnabled = !1) : (Crux.createAnim(r, "scaleTarget", r.scaleTarget, r.scaleStops[0], 500),
            r.miniMapEnabled = !0)
        }
        ,
        r.onCenter = function(e, t) {
            r.centerPointInMap(t.x, t.y),
            r.onMapRefresh()
        }
        ,
        r.centerPointInMap = function(e, t) {
            e *= r.scale,
            t *= r.scale,
            r.sx = -e + r.viewportWidth / r.pixelRatio / 2,
            r.sy = -t + r.viewportWidth / r.pixelRatio / 2
        }
        ,
        r.onCenterSlide = function(e, t) {
            r.trigger("play_sound", "zoom"),
            r.slideCenterPointInMap(t.x, t.y)
        }
        ,
        r.slideCenterPointInMap = function(e, n) {
            var o, a, i, s, l = 0;
            "right" === t.interfaceSettings.screenPos && (l = -480),
            "left" === t.interfaceSettings.screenPos && (l = 480),
            e *= r.scale,
            n *= r.scale,
            o = Math.round(-e + (r.viewportWidth + l) / r.pixelRatio / 2),
            a = Math.round(-n + r.viewportHeight / r.pixelRatio / 3),
            i = Crux.createAnim(r, "sx", r.sx, o, 1e3),
            s = Crux.createAnim(r, "sy", r.sy, a, 1e3)
        }
        ,
        r.worldToScreenX = function(e) {
            return (e * r.scale + r.sx) * r.pixelRatio
        }
        ,
        r.worldToScreenY = function(e) {
            return (e * r.scale + r.sy) * r.pixelRatio
        }
        ,
        r.worldToScreenScale = function(e) {
            return e * r.scale * r.pixelRatio
        }
        ,
        r.screenToWorldX = function(e) {
            return (e / r.pixelRatio - r.sx) / r.scale
        }
        ,
        r.screenToWorldY = function(e) {
            return (e / r.pixelRatio - r.sy) / r.scale
        }
        ,
        r.screenToWorldScale = function(e) {
            return e / r.pixelRatio / r.scale
        }
        ,
        r.moveDelta = function() {
            r.sx -= r.deltaX,
            r.sy -= r.deltaY,
            Crux.drawReqired = !0
        }
        ,
        r.onMouseMove = function(t) {
            t.pageX -= e.map.x,
            t.pageY -= e.map.y,
            r.dragging && (r.deltaX = r.oldX - t.pageX,
            r.deltaY = r.oldY - t.pageY,
            r.oldX = t.pageX,
            r.oldY = t.pageY,
            r.moveDelta())
        }
        ,
        r.onMouseUp = function() {
            r.dragging = !1
        }
        ,
        r.onMouseDown = function(t) {
            if (!r.ignoreMouseEvents && t.target === r.canvas[0]) {
                var n = r.ui.offset().left
                  , o = r.ui.offset().top
                  , a = "map_clicked";
                (2 === t.which || 3 === t.which) && (a = "map_middle_clicked"),
                e.ui.trigger(a, {
                    x: (t.pageX - r.sx - n) / r.scale,
                    y: (t.pageY - r.sy - o) / r.scale
                }),
                r.dragging = !0,
                r.oldX = t.pageX - r.x,
                r.oldY = t.pageY - r.y,
                r.one("mouseup", r.onMouseUp)
            }
        }
        ,
        r.onTouchUp = function() {
            r.dragging = !1
        }
        ,
        r.onTouchDown = function(t) {
            var n, o, a, i, s;
            n = t.originalEvent,
            n.target === r.canvas[0] && (r.ignoreMouseEvents = !0,
            i = r.ui.offset().left,
            s = r.ui.offset().top,
            o = n.touches[0].pageX - e.map.x,
            a = n.touches[0].pageY - e.map.y,
            e.ui.trigger("map_clicked", {
                x: (n.touches[0].pageX - r.sx - i) / r.scale,
                y: (n.touches[0].pageY - r.sy - s) / r.scale
            }),
            r.dragging = !0,
            r.oldX = o,
            r.oldY = a,
            r.ui.one("touchend", r.onTouchUp))
        }
        ,
        r.onTouchMove = function(t) {
            var n, o, a;
            a = t.originalEvent,
            a.target === r.canvas[0] && (t.preventDefault(),
            r.dragging && (n = a.touches[0].pageX - e.map.x,
            o = a.touches[0].pageY - e.map.y,
            r.deltaX = r.oldX - n,
            r.deltaY = r.oldY - o,
            r.oldX = n,
            r.oldY = o,
            r.moveDelta()))
        }
        ,
        r.onMouseWheel = function(e) {
            e.target === r.canvas[0] && (e.originalEvent.deltaY < 0 && r.onZoomIn(),
            e.originalEvent.deltaY > 0 && r.onZoomOut(),
            e.preventDefault())
        }
        ,
        r.createRipple = function(e, t, n, o, a, i, s) {
            var l = {
                worldX: e,
                worldY: t,
                radius: 0,
                alpha: 1
            }
              , c = Crux.createAnim(l, "radius", a, i, s, {
                onComplete: r.rippleComplete
            })
              , u = Crux.createAnim(l, "alpha", 1, 0, s);
            c.ease = Crux.easeOutQuad,
            u.ease = Crux.easeOutQuad,
            r.ripples.push(l)
        }
        ,
        r.rippleComplete = function(e) {
            var t = r.ripples.indexOf(e);
            t >= 0 && r.ripples.splice(t, 1)
        }
        ,
        r.onRippleStar = function(e, t) {
            r.createRipple(t.x, t.y, "255,0,0", 8, 26, 100, 2e3)
        }
        ,
        r.onSpecialRippleStar = function() {
            Crux.createAnim(r.fleetRangeSprite, "rotation", .25, 0, 500).ease = Crux.easeOutQuad,
            Crux.createAnim(r.scanningRangeSprite, "rotation", -.25, 0, 500).ease = Crux.easeOutQuad,
            Crux.createAnim(r.selectionRingSprite, "rotation", -.25, 0, 500).ease = Crux.easeOutQuad
        }
        ,
        r.onRippleFleet = function(e, t) {
            r.createRipple(t.x, t.y, "0,255,0", 8, 26, 100, 2e3)
        }
        ,
        r.onRippleUpgrade = function() {
            r.createRipple(t.selectedStar.x, t.selectedStar.y, "64,64,64", 12, 26, 200, 4e3)
        }
        ,
        r.onAddWaypoint = function() {
            Crux.createAnim(r, "waypointOriginScale", .5, 1, 250).ease = Crux.easeOutQuad
        }
        ,
        r.oldW = 0,
        r.oldH = 0,
        r.layout = function() {
            var t = e.width
              , n = e.height;
            (r.oldW !== t || r.oldH !== n) && (r.oldW = t,
            r.oldH = n,
            e.map.size(t * r.pixelRatio, n * r.pixelRatio),
            e.map.addStyle("fixed"),
            r.canvas.width = t * r.pixelRatio,
            r.canvas.height = n * r.pixelRatio,
            r.canvas[0].style.width = t + "px",
            r.canvas[0].style.height = n + "px",
            Crux.drawReqired = !0)
        }
        ,
        r.close = function() {
            Crux.tickCallbacks.splice(Crux.tickCallbacks.indexOf(r.draw), 1)
        }
        ,
        r.size = function(e, t) {
            r.viewportWidth = e,
            r.viewportHeight = t,
            r.maxScrollX = r.width - r.viewportWidth,
            r.maxScrollY = r.height - r.viewportHeight,
            r.canvas.attr("width", e),
            r.canvas.attr("height", t),
            r.viewportMask = {
                x: 0,
                y: 0,
                w: e,
                h: t
            }
        }
        ,
        r.onOneSecondTick = function() {}
        ,
        r.onMapRefresh = function() {
            Crux.drawReqired = !0
        }
        ,
        r.calcFleetAngle = function(e) {
            var t;
            return t = e.path[0] ? r.lookAngle(e.x, e.y, e.path[0].x, e.path[0].y) + 90 : e.x === e.lx && e.y === e.ly || null !== e.orbiting ? 0 : r.lookAngle(e.x, e.y, e.lx, e.ly) - 90,
            Math.PI * t / 180
        }
        ,
        r.lookAngle = function(e, t, r, n) {
            var o, a, i;
            return o = r - e,
            a = n - t,
            i = 0,
            0 === o ? i = a > 0 ? 90 : 270 : 0 === a ? i = o > 0 ? 0 : 180 : (i = 180 * Math.atan(a / o) / Math.PI,
            0 > o ? i += 180 : 0 > a && o > 0 && (i += 360),
            i)
        }
        ,
        r.on("mousemove", r.onMouseMove),
        r.on("mousedown", r.onMouseDown),
        r.on("contextmenu", function(e) {
            return e.target !== r.canvas[0] ? !0 : !1
        }),
        r.ignoreMouseEvents = !1,
        r.on("touchmove", r.onTouchMove),
        r.on("touchstart", r.onTouchDown),
        r.on("wheel", r.onMouseWheel),
        r.on("zoom_in", r.onZoomIn),
        r.on("zoom_out", r.onZoomOut),
        r.on("zoom_minimap", r.onZoomMinimap),
        r.on("map_center", r.onCenter),
        r.on("map_center_slide", r.onCenterSlide),
        r.on("ripple_star", r.onRippleStar),
        r.on("ripple_fleet", r.onRippleFleet),
        r.on("ripple_waypoint", r.onRippleWaypoint),
        r.on("special_ripple_star", r.onSpecialRippleStar),
        r.on("add_waypoint", r.onAddWaypoint),
        r.on("upgrade_economy", r.onRippleUpgrade),
        r.on("upgrade_industry", r.onRippleUpgrade),
        r.on("upgrade_science", r.onRippleUpgrade),
        r.on("one_second_tick", r.onOneSecondTick),
        r.on("map_rebuild", r.createSprites),
        r.on("map_refresh", r.onMapRefresh),
        r.createSprites(),
        Crux.tickCallbacks.push(r.draw),
        r
    }
}(),
!NeptunesPride)
    var NeptunesPride = {};
if (function() {
    NeptunesPride.Interface = function(e, t) {
        "use strict";
        var r = Crux.Widget().style("fullscreen").roost(Crux.crux);
        return r.Screen = function(e) {
            var t = Crux.Widget("rel col_base no_overflow");
            return t.size(480, 0),
            t.yOffset = r.screenTop,
            t.footerRequired = !0,
            t.bg = Crux.Widget("rel").size(480, 48).roost(t),
            t.heading = Crux.Text(e, "screen_title").roost(t.bg),
            t.closeButton = Crux.IconButton("icon-cancel", "hide_screen").grid(27, 0, 3, 3).roost(t.bg),
            t.roost = function(e) {
                return t.footerRequired && t.addFooter(),
                e.addChild(t),
                t.postRoost(),
                t
            }
            ,
            t.addFooter = function() {
                t.footer = Crux.Widget("rel").roost(t),
                Crux.Widget("col_accent rel").size(480, 8).roost(t.footer),
                Crux.Widget("col_black rel").size(480, 8).roost(t.footer)
            }
            ,
            t
        }
        ,
        r.SelectPlayerScreen = function(t) {
            var n, o, a, i = r.Screen("select_player");
            Crux.Button("cancel", "show_screen", t.returnScreen).grid(20, 0, 10, 3).roost(i),
            Crux.Text(t.body, "pad12 col_grey rel").roost(i);
            for (n in e.galaxy.players)
                a = e.galaxy.players[n],
                "" !== a.alias && t.playerFilter.indexOf(a.uid) < 0 && (o = r.PlayerNameIconRow(e.galaxy.players[n]).roost(i),
                o.addStyle("player_cell"),
                Crux.Button("select", t.selectionEvent, a.uid).grid(20, 0, 10, 3).roost(o));
            return i.addFooter(),
            i
        }
        ,
        r.PlayerNameIconRow = function(e) {
            var t = Crux.Widget("rel col_black").size(480, 48);
            return r.PlayerIcon(e, !0).roost(t),
            Crux.Text("", "section_title").grid(6, 0, 21, 3).rawHTML(e.alias).roost(t),
            t
        }
        ,
        r.PlayerPanel = function(t, n) {
            function o(e, t) {
                return e = Number(e),
                t = Number(t),
                t > e ? " txt_warn_bad" : e > t ? " txt_warn_good" : ""
            }
            var a = Crux.Widget("rel").size(480, 304)
              , i = "player";
            e.playerAchievements && 0 === NeptunesPride.gameConfig.anonymity && e.playerAchievements[t.uid] && ("premium" === e.playerAchievements[t.uid].premium && (i = "premium_player"),
            "lifetime" === e.playerAchievements[t.uid].premium && (i = "lifetime_premium_player")),
            Crux.Text(i, "section_title col_black").grid(0, 0, 30, 3).roost(a),
            t.ai && Crux.Text("ai_admin", "txt_right pad12").grid(0, 0, 30, 3).roost(a),
            Crux.Image("../images/avatars/160/" + t.avatar + ".jpg", "abs").grid(0, 6, 10, 10).roost(a),
            Crux.Widget("pci_48_" + t.uid).grid(7, 13, 3, 3).roost(a),
            Crux.Widget("col_accent").grid(0, 3, 30, 3).roost(a),
            Crux.Text("", "screen_subtitle").grid(0, 3, 30, 3).rawHTML(t.qualifiedAlias).roost(a);
            var s;
            if (e.playerAchievements && (s = e.playerAchievements[t.uid]),
            s && r.SmallBadgeRow(s.badges).grid(0, 3, 30, 3).roost(a),
            Crux.Widget("col_black").grid(10, 6, 20, 3).roost(a),
            Crux.Text("you", "pad12 txt_center").grid(25, 6, 5, 3).roost(a),
            Crux.Text("total_stars", "pad8").grid(10, 9, 15, 3).roost(a),
            Crux.Text("total_fleets", "pad8").grid(10, 11, 15, 3).roost(a),
            Crux.Text("total_ships", "pad8").grid(10, 13, 15, 3).roost(a),
            Crux.Text("new_ships", "pad8").grid(10, 15, 15, 3).roost(a),
            t !== e.player && (Crux.Text("", "pad8 txt_center").grid(20, 9, 5, 3).rawHTML(t.total_stars).roost(a),
            Crux.Text("", "pad8 txt_center").grid(20, 11, 5, 3).rawHTML(t.total_fleets).roost(a),
            Crux.Text("", "pad8 txt_center").grid(20, 13, 5, 3).rawHTML(t.total_strength).roost(a),
            Crux.Text("", "pad8 txt_center").grid(20, 15, 5, 3).rawHTML(t.shipsPerTick).roost(a)),
            e.player && (Crux.Text("", "pad8 txt_center " + o(e.player.total_stars, t.total_stars)).grid(25, 9, 5, 3).rawHTML(e.player.total_stars).roost(a),
            Crux.Text("", "pad8 txt_center" + o(e.player.total_fleets, t.total_fleets)).grid(25, 11, 5, 3).rawHTML(e.player.total_fleets).roost(a),
            Crux.Text("", "pad8 txt_center" + o(e.player.total_strength, t.total_strength)).grid(25, 13, 5, 3).rawHTML(e.player.total_strength).roost(a),
            Crux.Text("", "pad8 txt_center" + o(e.player.shipsPerTick, t.shipsPerTick)).grid(25, 15, 5, 3).rawHTML(e.player.shipsPerTick).roost(a)),
            Crux.Widget("col_accent").grid(0, 16, 10, 3).roost(a),
            e.player) {
                var l = Crux.IconButton("icon-mail", "inbox_new_message_to_player", t.uid).grid(0, 16, 3, 3).disable().roost(a);
                t !== e.player && t.alias && l.enable(),
                Crux.IconButton("icon-chart-line", "show_intel", t.uid).grid(2.5, 16, 3, 3).roost(a),
                n && Crux.IconButton("icon-eye", "show_screen", "empire").grid(7, 16, 3, 3).roost(a)
            }
            return a
        }
        ,
        r.ConfirmScreen = function(e) {
            var t = "are_you_sure";
            e.notification && (t = "attention");
            var n = r.Screen(t)
              , o = Crux.Text(e.message, "rel pad12 txt_center col_accent txt_selectable").size(480).roost(n);
            e.messageTemplateData && o.format(e.messageTemplateData);
            var a = Crux.Widget("rel col_body").size(480, 80).roost(n)
              , i = "ok"
              , s = "cancel";
            return e.yesNoLabels && (i = "yes",
            s = "no"),
            e.notification ? Crux.Button(i, "pre_confirm_ok").grid(10, 1, 10, 3).roost(a) : (Crux.Button(s, "pre_confirm_cancel").grid(5, 1, 10, 3).roost(a),
            Crux.Button(i, "pre_confirm_ok").grid(15, 1, 10, 3).roost(a)),
            n.onPreCancel = function() {
                r.trigger("hide_screen"),
                e.returnScreen && r.trigger("show_screen", e.returnScreen),
                e.cancelEventKind && r.trigger(e.cancelEventKind, e.cancelEventData)
            }
            ,
            n.onPreOk = function() {
                r.trigger("hide_screen"),
                r.trigger("play_sound", "ok"),
                e.eventKind && r.trigger(e.eventKind, e.eventData),
                e.returnScreen && r.trigger("show_screen", e.returnScreen)
            }
            ,
            n.on("pre_confirm_ok", n.onPreOk),
            n.on("pre_confirm_cancel", n.onPreCancel),
            n
        }
        ,
        r.FleetOrderConfirm = function() {
            var t = Crux.Widget("selmenu_cell col_accent");
            t.size(480),
            t.yOffset = r.screenTop;
            var n, o, a = [], i = "", s = {};
            for (console.log("selected Fleet orders! ", e.selectedFleet),
            n = 0; n < e.selectedFleet.path.length; n++) {
                var l = e.galaxy.stars[e.selectedFleet.orders[n][1]];
                l ? (o = "&nbsp;" + l.n,
                0 === e.selectedFleet.orders[n][2] && (o += " <b><em>!</em></b>"),
                1 === e.selectedFleet.orders[n][2],
                2 === e.selectedFleet.orders[n][2] && (o += " <em><span class='icon-down-open'></span></em>"),
                3 === e.selectedFleet.orders[n][2] && (o += " <em><span class='icon-up-open'></span>" + e.selectedFleet.orders[n][3] + "</em>"),
                4 === e.selectedFleet.orders[n][2] && (o += " <em><span class='icon-down-open'></span>" + e.selectedFleet.orders[n][3] + "</em>"),
                5 === e.selectedFleet.orders[n][2] && (o += "<em>" + e.selectedFleet.orders[n][3] + "<span class='icon-up-open'></span></em> "),
                6 === e.selectedFleet.orders[n][2] && (o += " <em>" + e.selectedFleet.orders[n][3] + "<span class='icon-down-open'></span> </em>"),
                7 === e.selectedFleet.orders[n][2] && (o += " <em><span class='icon-light-up'></span>" + e.selectedFleet.orders[n][3] + "</em>"),
                a.push(o)) : a.push("(?)")
            }
            return i = a.join(", "),
            e.selectedFleet.loop && (i += " <em><span class='icon-loop'></span></em>"),
            s.path = i,
            Crux.Text("path", "rel pad12 minh72").size(432).format(s).roost(t),
            Crux.IconButton("icon-cancel", "cancel_fleet_orders").grid(27, 0, 3, 3).roost(t),
            t.bg = Crux.Widget("col_base").size(480, 48).roost(t),
            t.eta = Crux.Text("", "pad12").grid(0, 0, 30, 3).roost(t.bg),
            Crux.IconButton("icon-minus-circled", "remove_waypoint").grid(12.5, 0, 3, 3).roost(t.bg),
            Crux.IconButton("icon-cancel-circled", "clear_waypoints").grid(15, 0, 3, 3).roost(t.bg),
            Crux.Button("save", "submit_fleet_orders_test_loop").grid(17.5, 0, 5, 3).roost(t.bg),
            Crux.Button("save_edit", "submit_fleet_orders_edit").grid(22, 0, 8, 3).roost(t.bg),
            t.onOneSecondTick = function() {
                0 === e.selectedFleet.path.length ? t.eta.hide() : t.eta.show(),
                t.eta.updateFormat("total_eta_single", {
                    etaFirst: e.timeToTick(e.selectedFleet.eta)
                })
            }
            ,
            t.onOneSecondTick(),
            t.on("one_second_tick", t.onOneSecondTick),
            t
        }
        ,
        r.SelectionMenu = function() {
            var t, n, o = Crux.Widget();
            if (o.yOffset = r.screenTop,
            o.size(480, 3.5 * e.possibleSelections.length * Crux.gridSize + 8),
            !e.player)
                return o;
            for (o.rows = [],
            t = e.possibleSelections.length - 1; t >= 0; t--) {
                if (n = Crux.Widget("col_base selmenu_cell anim_fast").size(480, 48).roost(o),
                o.rows.push(n),
                e.possibleSelections[t].player && Crux.Widget("bgpc_" + e.possibleSelections[t].player.colorIndex).grid(0, 0, .5, 3).roost(n),
                "fleet" === e.possibleSelections[t].kind) {
                    var a = e.possibleSelections[t]
                      , i = Crux.Clickable("show_fleet_path", a).grid(7.5, 0, 12.5, 3).roost(n);
                    if (Crux.Text("", "pad12").grid(0, 0, 12.5, 3).rawHTML(a.n).roost(i),
                    Crux.Text("", "pad12 txt_center col_accent").grid(3.75, 0, 3.75, 3).rawHTML(a.st).roost(n),
                    Crux.Text("", "pad12 icon_button icon-rocket").grid(.5, 0, 3, 3).rawHTML("").roost(n),
                    a.player === e.player) {
                        var s = a.path.length;
                        a.loop && (s += " <span class='icon-loop'></span>"),
                        a.path.length && Crux.Text("", "pad12 txt_right").rawHTML(s).grid(16, 0, 4, 3).roost(n),
                        a.orbiting && a.orbiting.player && a.orbiting.player.uid === e.player.uid && Crux.IconButton("icon-down-open", "show_ship_transfer", {
                            fleet: a
                        }).grid(19.5, 0, 3, 3).roost(n),
                        Crux.IconButton("icon-plus-circled", "start_edit_waypoints", {
                            fleet: a
                        }).grid(22, 0, 3, 3).roost(n)
                    }
                    Crux.Button("view").grid(24.5, 0, 5.5, 3).click("select_fleet", {
                        fleet: a
                    }).roost(n)
                }
                if ("star" === e.possibleSelections[t].kind) {
                    var l = e.possibleSelections[t];
                    Crux.Text("", "pad12").grid(7.5, 0, 12.5, 3).rawHTML(l.n).roost(n),
                    Crux.Text("", "pad12 txt_center col_accent").grid(3.75, 0, 3.75, 3).rawHTML(l.st).roost(n),
                    Crux.Text("", "pad12 icon_button icon-star-1").grid(.5, 0, 18, 3).rawHTML("").roost(n),
                    e.player.cash >= 25 && l.st > 0 && e.player === l.player && Crux.IconButton("icon-rocket", "show_screen", ["new_fleet", l]).grid(22, 0, 3, 3).roost(n),
                    e.player === l.player && l.fleetsInOrbit.length > 0 && Crux.IconButton("icon-up-open", "select_gather_all_ships", l).grid(19.5, 0, 3, 3).roost(n),
                    Crux.Button("view").grid(24.5, 0, 5.5, 3).click("select_star", {
                        star: l
                    }).roost(n)
                }
            }
            return o.animate = function() {
                var e, r = 0;
                for (t = o.rows.length - 1; t >= 0; t--)
                    e = o.rows[t],
                    e.pos(0, r),
                    r += 52
            }
            ,
            window.setTimeout(o.animate, 1),
            o
        }
        ,
        r.PlayerIcon = function(t, r) {
            var n = Crux.Clickable("select_player", t.uid).size(60, 60);
            return r ? (Crux.Widget("col_black").grid(0, 0, 3, 3).roost(n),
            Crux.Widget("pci_48_" + t.uid).grid(0, 0, 3, 3).roost(n),
            Crux.Image("../images/avatars/160/" + t.avatar + ".jpg", "abs").grid(3, 0, 3, 3).roost(n)) : (Crux.Widget("bgpc_" + t.colorIndex).grid(0, 3.75, 3.75, .5).roost(n),
            Crux.Image("../images/avatars/160/" + t.avatar + ".jpg", "abs").grid(0, 0, 3.75, 3.75).roost(n),
            e.colorBlindHelper && Crux.Text("", "txt_center txt_tiny col_black").grid(0, 2, 3.75, 1.75).rawHTML(t.colorName).roost(n),
            e.empireNameHelper && Crux.Text("", "txt_center txt_tiny col_black no_overflow").grid(0, 2, 3.75, 1.75).rawHTML(t.alias).roost(n)),
            n
        }
        ,
        r.PlayerIcons = function() {
            var t = Crux.Widget();
            t.yOffset = 48,
            Crux.Widget("col_black").grid(0, 0, 30, 4.75).roost(t);
            var n, o, a;
            t.width = 480,
            t.size(t.width, 48),
            t.icons = [],
            t.addIcon = function(e, o) {
                n = r.PlayerIcon(e),
                n.pos(o, 0),
                n.style("clickable anim_fast col_accent rad4"),
                n.selected = !1,
                n.uid = e.uid,
                t.addChild(n),
                t.icons.push(n)
            }
            ,
            o = 0;
            var i = (480 - 60 * NeptunesPride.gameConfig.players) / 2;
            if (e.galaxy.players)
                for (a in e.galaxy.players)
                    t.addIcon(e.galaxy.players[a], i + 60 * o),
                    o += 1;
            return t.refresh = function() {
                if (e.galaxy.players) {
                    for (o = 0; o < t.icons.length; o += 1)
                        t.icons[o].selected && (t.icons[o].nudge(0, -8),
                        t.icons[o].selected = !1);
                    for (o = 0; o < t.icons.length; o += 1)
                        e.selectedPlayer && e.selectedPlayer.uid === t.icons[o].uid && (t.icons[o].selected || (t.icons[o].nudge(0, 8),
                        t.icons[o].selected = !0))
                }
                return t
            }
            ,
            e.playerCount > 8 && t.hide(),
            t
        }
        ,
        r.RulerToolbar = function() {
            var t = Crux.Widget("col_grey");
            return t.grid(0, 0, 30, 6),
            t.width = 480,
            t.yOffset = r.screenTop,
            Crux.IconButton("icon-help", "show_help", "ruler").grid(24.5, 0, 3, 3).roost(t),
            Crux.Button("reset", "reset_ruler", "").grid(19, 0, 6, 3).roost(t),
            Crux.Text("ruler_toolbar_heading", "screen_title").grid(0, 0, 15, 3).format({
                eta: e.timeToTick(e.ruler.eta, !0)
            }).roost(t),
            Crux.IconButton("icon-cancel", "end_ruler").grid(27, 0, 3, 3).roost(t),
            Crux.Widget("col_base").grid(0, 3, 30, 3).roost(t),
            Crux.Text("ruler_toolbar_eta", "pad12").grid(0, 3, 30, 3).format({
                eta: e.timeToTick(e.ruler.eta, !0)
            }).roost(t),
            Crux.Text("ruler_toolbar_range", "pad12 txt_center").grid(0, 3, 30, 3).format({
                range: e.ruler.ly
            }).roost(t),
            Crux.Text("ruler_toolbar_tech", "pad12 txt_right").grid(0, 3, 30, 3).format({
                hs: e.ruler.hsRequired
            }).roost(t),
            Crux.Text("total_without_gates", "pad12  col_accent ").format({
                gateEta: e.timeToTick(e.ruler.baseEta, !0)
            }).grid(0, 6, 30, 3).roost(t),
            Crux.Text("total_with_gates", "pad12  txt_right").format({
                gateEta: e.timeToTick(e.ruler.gateEta, !0)
            }).grid(0, 6, 30, 3).roost(t),
            t
        }
        ,
        r.BuildInfToolbar = function() {
            var t = Crux.Widget("col_grey");
            t.grid(0, 0, 30, 3),
            t.width = 480,
            t.yOffset = r.screenTop,
            Crux.IconButton("icon-cancel", "end_quick_upgrade").grid(27, 0, 3, 3).roost(t),
            t.heading = Crux.Text("quick_upgrade", "screen_title").grid(0, 0, 27, 3).roost(t),
            t.instructions = Crux.Text("select_star_to_upgrade", "col_base pad12").hide().grid(0, 3, 30, 3).roost(t),
            t.bg = Crux.Widget("col_base").grid(0, 3, 30, 3).roost(t);
            var n = "col_accent";
            return e.player && (n = "bgpc_" + e.player.colorIndex),
            t.colourIndicator = Crux.Widget(n).grid(0, 0, .5, 3).roost(t.bg),
            Crux.Text("", "pad12 entypo icon-light-up").grid(.5, 0, 3, 3).rawHTML("").roost(t.bg),
            t.starName = Crux.Text("", "pad12").grid(2.5, 0, 27, 3).roost(t.bg),
            t.ueb = Crux.IconButton("icon-dollar", "upgrade_economy").grid(12, 0, 3, 3).roost(t.bg),
            t.uebl = Crux.Text("", "pad12").grid(14.25, 0, 3, 3).roost(t.bg),
            t.uib = Crux.IconButton("icon-tools", "upgrade_industry").grid(18, 0, 3, 3).roost(t.bg),
            t.uibl = Crux.Text("", "pad12").grid(20.25, 0, 3, 3).roost(t.bg),
            t.usb = Crux.IconButton("icon-graduation-cap", "upgrade_science").grid(24, 0, 3, 3).roost(t.bg),
            t.usbl = Crux.Text("", "pad12").grid(26.25, 0, 3, 3).roost(t.bg),
            t.refresh = function() {
                if (e.player && "quick_upgrade" === e.editMode) {
                    if (!e.selectedStar)
                        return t.bg.hide(),
                        t.instructions.show(),
                        void 0;
                    if (e.selectedStar.player !== e.player)
                        return t.bg.hide(),
                        t.instructions.show(),
                        void 0;
                    t.instructions.hide(),
                    t.starName.rawHTML(e.selectedStar.n),
                    t.ueb.enable(),
                    t.uib.enable(),
                    t.usb.enable(),
                    e.player.cash - e.selectedStar.uce < 0 && t.ueb.disable(),
                    e.player.cash - e.selectedStar.uci < 0 && t.uib.disable(),
                    e.player.cash - e.selectedStar.ucs < 0 && t.usb.disable(),
                    t.ueb.show(),
                    t.uib.show(),
                    t.usb.show(),
                    e.selectedStar.uce <= 0 && t.ueb.hide(),
                    e.selectedStar.uci <= 0 && t.uib.hide(),
                    e.selectedStar.ucs <= 0 && t.usb.hide(),
                    t.uebl.rawHTML("$" + e.selectedStar.uce),
                    t.uibl.rawHTML("$" + e.selectedStar.uci),
                    t.usbl.rawHTML("$" + e.selectedStar.ucs),
                    t.bg.show()
                }
            }
            ,
            t
        }
        ,
        r.Status = function() {
            var n = Crux.Widget();
            return n.size(480, 48),
            n.yOffset = 0,
            Crux.Widget("col_black").grid(0, 0, 30, 3.5).roost(n),
            Crux.Widget("col_base").grid(0, 0, 30, 3).roost(n),
            n.menuBtn = Crux.IconButton("icon-menu", "show_side_menu").grid(0, 0, 3, 3).roost(n),
            n.info = Crux.Text("status", "txt_center pad12").grid(3, 0, 24, 3).roost(n),
            n.inboxIconButton = Crux.IconButton("icon-mail", "show_inbox").grid(27, 0, 3, 3).roost(n),
            n.inboxButton = Crux.Text("1", "txt_center col_warning rad4").grid(-.25, -.25, 2, 2).nudge(12, 12, -8, -8).roost(n.inboxIconButton),
            n.warning = Crux.Text("", "col_warning  txt_center pad12").size(480).pos(0, r.screenTop).roost(n),
            n.warning.hide(),
            e.interfaceSettings.showFirstTimePlayer && (n.ftpWarning = Crux.Widget().size(480).pos(0, r.screenTop).roost(n),
            e.galaxy.turn_based && n.ftpWarning.pos(0, r.screenTop + 84),
            Crux.Text("first_time_player", "rel col_base pad12").roost(n.ftpWarning),
            Crux.IconButton("icon-cancel", "hide_ftp_warning").grid(27, 0, 3, 3).roost(n.ftpWarning)),
            n.onShow = function() {
                n.show()
            }
            ,
            n.onHide = function() {
                n.hide()
            }
            ,
            n.tickCount = 0,
            n.onOneSecondTick = function() {
                r.sideMenu && (r.sideMenu.pinned ? n.menuBtn.disable() : n.menuBtn.enable()),
                n.tickCount += 1;
                var o = Number(t.unreadDiplomacy) + Number(t.unreadEvents);
                return o > 0 && n.tickCount % 2 ? (n.inboxButton.show(),
                n.inboxButton.rawHTML(o)) : (n.inboxButton.hide(),
                n.inboxButton.rawHTML("")),
                e.loading ? (n.info.update("loading"),
                void 0) : e.galaxy.paused ? e.player ? (n.info.update("inspector_info_player_paused"),
                n.info.format({
                    cash: e.player.cash
                }),
                void 0) : (n.info.update("paused"),
                void 0) : (e.player ? (n.info.update("inspector_info_player"),
                n.info.format({
                    nextProduction: e.timeToProduction,
                    cash: e.player.cash
                })) : (n.info.update("inspector_info"),
                n.info.format({
                    nextProduction: e.timeToProduction
                })),
                void 0)
            }
            ,
            n.onOneSecondTick(),
            n.onShowWarning = function(e, t) {
                console.log(t),
                Crux.templates[t] ? n.warning.update(t) : n.warning.update("failed_order"),
                n.warning.show()
            }
            ,
            n.onHideWarning = function() {
                n.warning.hide()
            }
            ,
            n.onHideFTPWarning = function() {
                n.ftpWarning.hide(),
                e.setInterfaceSetting("showFirstTimePlayer", !1)
            }
            ,
            n.onClick = function() {
                t.trigger("server_request", {
                    type: "order",
                    order: "full_universe_report"
                })
            }
            ,
            n.on("one_second_tick", n.onOneSecondTick),
            n.on("update_status", n.onOneSecondTick),
            n.on("show_warning", n.onShowWarning),
            n.on("hide_warning", n.onHideWarning),
            n.on("hide_ftp_warning", n.onHideFTPWarning),
            n.info.on("click", n.onClick, n.info),
            n
        }
        ,
        r.TurnManager = function() {
            var t = Crux.Widget("col_accent anim_mid").size(480, 48);
            t.yOffset = r.screenTop,
            null === e.galaxy.turnDue ? Crux.Text("game_not_started", "pad12 txt_right").grid(10, 0, 20, 0).roost(t) : e.galaxy.paused ? Crux.Text("paused", "pad12 txt_right").grid(10, 0, 20, 0).roost(t) : Crux.Text("turn_deadline", "pad12 txt_right").grid(10, 0, 20, 0).format({
                time: Crux.formatDate(e.galaxy.turnDue)
            }).roost(t),
            t.missedWarning = Crux.Text("missed_turns", "pad12 txt_warn_bad txt_center").grid(0, 3, 30, 0).hide().roost(t);
            var n = {
                message: "sure_you_want_to_submit_turn",
                messageTemplateData: {},
                eventKind: "turn_ready",
                eventData: {}
            };
            return t.submitBtn = Crux.Button("submit_turn", "show_screen", ["confirm", n]).grid(0, 0, 10, 3).roost(t),
            t.onOneSecondTick = function() {
                e.player && (1 === e.player.ready && (t.submitBtn.update("submitted"),
                t.submitBtn.disable()),
                e.player.missed_turns && 1 !== e.player.ready ? (t.missedWarning.show(),
                t.missedWarning.format({
                    turns: e.player.missed_turns
                })) : t.missedWarning.hide())
            }
            ,
            t.onOneSecondTick(),
            t.on("turn_ready", t.onOneSecondTick),
            t.on("one_second_tick", t.onOneSecondTick),
            t
        }
        ,
        r.SideMenuToolBar = function() {
            var t = Crux.Widget("rel").size(172, 104);
            return Crux.IconButton("icon-compass", "zoom_minimap").grid(0, .5, 3, 3).roost(t),
            Crux.IconButton("icon-zoom-in", "zoom_in").grid(2.5, .5, 3, 3).roost(t),
            Crux.IconButton("icon-zoom-out", "zoom_out").grid(5, .5, 3, 3).roost(t),
            e.player && Crux.IconButton("icon-home", "select_player", [e.player.uid, !0]).grid(7.5, .5, 3, 3).roost(t),
            Crux.IconButton("icon-myspace", "start_ruler").grid(0, 3, 3, 3).roost(t),
            Crux.IconButton("icon-flash", "start_quick_upgrade").grid(2.5, 3, 3, 3).roost(t),
            Crux.IconButton("icon-dollar", "show_screen", "bulk_upgrade").grid(5, 3, 3, 3).roost(t),
            t
        }
        ,
        r.SideMenuItem = function(e, t, r, n) {
            var o = Crux.Clickable(r, n).addStyle("rel side_menu_item").configStyles("side_menu_item_up", "side_menu_item_down", "side_menu_item_hover", "side_menu_item_disabled").size(172, 40);
            return Crux.Text("", "pad12 txt_center").addStyle(e).grid(0, -.25, 3, 2.5).rawHTML("").roost(o),
            Crux.Text(t, "pad12").grid(2, -.25, 8, 2.5).roost(o),
            o
        }
        ,
        r.SideMenu = function() {
            var e = Crux.Widget("col_accent side_menu").size(172, 0);
            return e.pinned = !1,
            e.rows = 11,
            r.sideMenuItemSize = 40,
            e.spacer = Crux.Widget("rel").size(160, 48).roost(e),
            e.showBtn = Crux.IconButton("icon-menu", "hide_side_menu").grid(0, 0, 3, 3).roost(e),
            r.SideMenuToolBar().roost(e),
            r.SideMenuItem("icon-users", "leaderboard", "show_screen", "leaderboard").roost(e),
            r.SideMenuItem("icon-beaker", "research", "show_screen", "tech").roost(e),
            r.SideMenuItem("icon-star-1", "galaxy", "show_screen", "star_dir").roost(e),
            r.SideMenuItem("icon-chart-line", "intel", "show_screen", "intel").roost(e),
            r.SideMenuItem("icon-cog-1", "options", "show_screen", "options").roost(e),
            r.SideMenuItem("icon-help", "help", "show_help", "index").roost(e),
            r.SideMenuItem("icon-left-open", "main_menu", "browse_to", "/").roost(e),
            e.pin = function() {
                e.show(),
                e.showBtn.hide(),
                e.spacer.hide(),
                e.pinned = !0,
                e.addStyle("fixed")
            }
            ,
            e.unPin = function() {
                e.pinned = !1,
                e.showBtn.show(),
                e.spacer.show(),
                e.removeStyle("fixed"),
                e.hide()
            }
            ,
            e.onPopUp = function() {
                e.pinned || (e.show(),
                e.trigger("play_sound", "selection_open"),
                e.trigger("hide_section_menu"),
                e.trigger("hide_screen"),
                e.trigger("cancel_fleet_orders"))
            }
            ,
            e.onPopDown = function() {
                e.pinned || e.hide()
            }
            ,
            e.on("show_side_menu", e.onPopUp),
            e.on("hide_side_menu", e.onPopDown),
            e.on("unpin_side_menu", e.unPin),
            e
        }
        ,
        r.onShowFleetOrderConfirm = function() {
            r.fleetOrderConfirm && r.removeChild(r.fleetOrderConfirm),
            r.fleetOrderConfirm = r.FleetOrderConfirm(),
            r.addChild(r.fleetOrderConfirm),
            r.layoutElement(r.fleetOrderConfirm)
        }
        ,
        r.onHideFleetOrderConfirm = function() {
            r.fleetOrderConfirm && (r.removeChild(r.fleetOrderConfirm),
            r.fleetOrderConfirm = null)
        }
        ,
        r.onShowSelectionMenu = function() {
            "normal" === e.editMode && (r.sideMenu.onPopDown(),
            r.selectionMenu && r.selectionMenuContainer.removeChild(r.selectionMenu),
            r.selectionMenu = r.SelectionMenu(),
            r.selectionMenuContainer.addChild(r.selectionMenu),
            r.layoutElement(r.selectionMenu))
        }
        ,
        r.onHideSelectionMenu = function() {
            r.selectionMenu && (r.selectionMenuContainer.removeChild(r.selectionMenu),
            r.selectionMenu = null)
        }
        ,
        r.onShowShipTransfer = function(e, t) {
            r.trigger("select_fleet", t),
            r.trigger("show_screen", "ship_transfer")
        }
        ,
        r.onScrollToBottom = function() {
            jQuery(window).scrollTop(document.body.scrollHeight)
        }
        ,
        r.onScrollToTop = function() {
            jQuery(window).scrollTop(0)
        }
        ,
        r.onShowBuildInfToolbar = function() {
            r.buildInfToolbar && e.player && (r.buildInfToolbar.show(),
            r.buildInfToolbar.refresh())
        }
        ,
        r.onHideBuildInfToolbar = function() {
            r.buildInfToolbar && r.buildInfToolbar.hide()
        }
        ,
        r.onShowRulerToolbar = function() {
            r.rulerToolbar && r.onHideRulerToolbar(),
            r.rulerToolbar = r.RulerToolbar().roost(r.rulerToolbarContainer),
            r.layoutElement(r.rulerToolbar)
        }
        ,
        r.onHideRulerToolbar = function() {
            r.rulerToolbarContainer.removeChild(r.rulerToolbar),
            r.rulerToolbar = null
        }
        ,
        r.refreshTurnManager = function() {
            e.galaxy.turn_based && (r.turnManager && (r.tmContainer.removeChild(r.turnManager),
            r.turnManager = null),
            r.turnManager = r.TurnManager().roost(r.tmContainer),
            r.layoutElement(r.turnManager))
        }
        ,
        r.NagScreen = function() {
            var e = Crux.Widget("col_black").pos(0, 0).size(r.width, r.height);
            e.bg = Crux.Widget("col_base rad12 side_menu").size(480, 480).pos(r.width / 2 - 240, 32).roost(e),
            Crux.Image("/images/joingame_07.jpg", "abs img_black_cap").grid(0, 2, 30, 12).roost(e.bg);
            var t = Math.round(5 * Math.random());
            return Crux.Text("nag_body_" + t, "txt_center pad12").grid(1, 15, 28, 6).roost(e.bg),
            Crux.Button("go_premium_today", "browse_to", "/#buy_premium").grid(5, 21, 20, 3).addStyle("col_google_red").roost(e.bg),
            Crux.Button("not_today_thanks", "hide_nag").grid(5, 24, 20, 3).roost(e.bg),
            e.layout = function() {
                e.size(r.width, r.height),
                e.bg.pos(r.width / 2 - 240, 32)
            }
            ,
            e
        }
        ,
        r.onShowNagScreen = function() {
            r.nagScreen = r.NagScreen().roost(r.nagContainer)
        }
        ,
        r.onHideNagScreen = function() {
            r.nagScreen && r.nagContainer.removeChild(r.nagScreen)
        }
        ,
        r.onShowScreen = function(t, n, o) {
            var a = 0;
            r.showingScreen === n ? a = jQuery(window).scrollTop() : (jQuery(window).scrollTop(0),
            r.trigger("play_sound", "screen_open")),
            r.onHideScreen(null, !0),
            r.onHideSelectionMenu(),
            r.trigger("hide_side_menu"),
            r.trigger("reset_edit_mode"),
            r.showingScreen = n,
            r.screenConfig = o,
            e.player && e.player.conceded > 0 && ("star" === n || "fleet" === n || "ship_transfer" === n || "new_fleet" === n) && (r.showingScreen = "leaderboard"),
            e.player || "confirm" === n || "game_password" === n || "custom_settings" === n || "empire" === n || "help" === n || (r.showingScreen = "join_game");
            var i = {
                main_menu: r.MainMenuScreen,
                compose: r.ComposeDiplomacyScreen,
                inbox: r.InboxScreen,
                diplomacy_detail: r.DiplomacyDetailScreen,
                join_game: r.JoinGameScreen,
                empire: r.EmpireScreen,
                leaderboard: r.LeaderboardScreen,
                options: r.OptionsScreen,
                tech: r.TechScreen,
                star: r.StarInspector,
                fleet: r.FleetInspector,
                edit_order: r.EditFleetOrder,
                bulk_upgrade: r.BulkUpgradeScreen,
                ship_transfer: r.ShipTransferScreen,
                new_fleet: r.NewFleetScreen,
                star_dir: r.StarDirectory,
                fleet_dir: r.FleetDirectory,
                ship_dir: r.ShipDirectory,
                combat_calculator: r.CombatCalc,
                custom_settings: r.CustomSettingsScreen,
                confirm: r.ConfirmScreen,
                help: r.HelpScreen,
                select_player: r.SelectPlayerScreen,
                buy_gift: r.BuyGiftScreen,
                buy_premium_gift: r.BuyPremiumGiftScreen,
                intel: r.Intel
            };
            r.activeScreen = i[r.showingScreen](o),
            r.activeScreen && (r.activeScreen.roost(r.screenContainer),
            r.layoutElement(r.activeScreen)),
            jQuery(window).scrollTop(a)
        }
        ,
        r.onHideScreen = function(e, t) {
            r.activeScreen && (void 0 === t && (r.onScrollToTop(),
            r.trigger("play_sound", "cancel")),
            r.screenContainer.removeChild(r.activeScreen)),
            r.activeScreen = null,
            r.showingScreen = ""
        }
        ,
        r.onRefreshInterface = function() {
            r.playerIcons.refresh(),
            r.buildInfToolbar.refresh(),
            r.refreshTurnManager(),
            r.showingScreen && r.onShowScreen(null, r.showingScreen, r.screenConfig)
        }
        ,
        r.onRefreshPlayerIcons = function() {
            r.playerIcons.refresh()
        }
        ,
        r.onRefreshBuildInf = function() {
            "quick_upgrade" === e.editMode && r.buildInfToolbar.refresh()
        }
        ,
        r.onRebuildPlayerIcons = function() {
            r.playerIcons && r.removeChild(r.playerIcons),
            r.playerIcons = r.PlayerIcons().roost(r.playerIconsContainer),
            r.layoutElement(r.playerIcons)
        }
        ,
        r.onBuildInterface = function() {
            r.map = NeptunesPride.Map(r, e).roost(r),
            r.screenTop = 124,
            e.playerCount > 8 && (r.screenTop = 56),
            "right" === e.interfaceSettings.screenPos && jQuery("html").css("overflow-y", "scroll").css("overflow", "-moz-scrollbars-vertical"),
            e.galaxy.turn_based && (r.tmContainer = Crux.Widget().size(1, 1).roost(r),
            r.turnManager = r.TurnManager().roost(r.tmContainer)),
            r.status = r.Status().roost(r),
            r.screenContainer = Crux.Widget().size(1, 1).roost(r),
            r.playerIconsContainer = Crux.Widget().size(1, 1).roost(r),
            r.playerIcons = r.PlayerIcons().roost(r.playerIconsContainer),
            r.buildInfToolbar = r.BuildInfToolbar().hide().roost(r),
            r.rulerToolbarContainer = Crux.Widget().size(1, 1).roost(r),
            r.selectionMenuContainer = Crux.Widget().size(1, 1).roost(r),
            r.sideMenu = r.SideMenu().roost(r),
            r.nagContainer = Crux.Widget().size(1, 1).roost(r),
            jQuery(window).on("resize", r.layout),
            r.layout(),
            r.onRefreshInterface()
        }
        ,
        r.onSetLayoutPos = function(t, n) {
            e.interfaceSettings.screenPos = n,
            r.layout()
        }
        ,
        r.layoutElement = function(t) {
            var n = 0;
            if (n = "bottom" === t.yOffset ? r.height - t.h : t.yOffset,
            "center" === e.interfaceSettings.screenPos && t.pos(r.width / 2 - t.w / 2, n),
            "right" === e.interfaceSettings.screenPos && t.pos(r.width - t.w, n),
            "left" === e.interfaceSettings.screenPos) {
                var o = 0;
                r.sideMenu.pinned && (o = r.sideMenu.w),
                t.pos(o, n)
            }
        }
        ,
        r.layout = function() {
            r.width = jQuery(window).width(),
            r.height = jQuery(window).height(),
            e.movieMode && (r.width = 640,
            r.height = 480,
            Crux.crux.pos(256 - window.screenX, 256 - window.screenY)),
            e.interfaceSettings.sideMenuPin ? r.sideMenu.pin() : r.sideMenu.unPin(),
            r.layoutElement(r.status),
            r.layoutElement(r.playerIcons),
            r.layoutElement(r.buildInfToolbar),
            r.rulerToolbar && r.layoutElement(r.rulerToolbar),
            r.sideMenu.pinned ? (r.sideMenu.size(r.sideMenu.w, r.height),
            r.sideMenu.pos(0, 0)) : (r.sideMenu.size(r.sideMenu.w, r.sideMenu.rows * r.sideMenuItemSize),
            r.sideMenu.pos(r.status.x, r.status.y)),
            r.activeScreen && r.layoutElement(r.activeScreen),
            e.galaxy.turn_based && r.layoutElement(r.turnManager),
            r.selectionMenu && r.layoutElement(r.selectionMenu),
            r.fleetOrderConfirm && r.layoutElement(r.fleetOrderConfirm),
            r.nagScreen && r.nagScreen.layout(),
            r.map.layout(),
            e.movieMode && (r.width = 640,
            r.height = 480,
            Crux.crux.pos(256 - window.screenX, 256 - window.screenY),
            r.map.pos(256 - window.screenX, 256 - window.screenY))
        }
        ,
        r.on("layout", r.layout),
        r.on("show_screen", r.onShowScreen),
        r.on("hide_screen", r.onHideScreen),
        r.on("show_fleet_order_confirm", r.onShowFleetOrderConfirm),
        r.on("hide_fleet_order_confirm", r.onHideFleetOrderConfirm),
        r.on("show_selection_menu", r.onShowSelectionMenu),
        r.on("hide_selection_menu", r.onHideSelectionMenu),
        r.on("refresh_interface", r.onRefreshInterface),
        r.on("refresh_player_icons", r.onRefreshPlayerIcons),
        r.on("build_interface", r.onBuildInterface),
        r.on("rebuild_player_icons", r.onRebuildPlayerIcons),
        r.on("show_ship_transfer", r.onShowShipTransfer),
        r.on("scroll_to_bottom", r.onScrollToBottom),
        r.on("scroll_to_top", r.onScrollToTop),
        r.on("show_build_inf_toolbar", r.onShowBuildInfToolbar),
        r.on("hide_build_inf_toolbar", r.onHideBuildInfToolbar),
        r.on("refresh_build_inf_toolbar", r.onRefreshBuildInf),
        r.on("show_ruler_toolbar", r.onShowRulerToolbar),
        r.on("hide_ruler_toolbar", r.onHideRulerToolbar),
        r.on("show_nag", r.onShowNagScreen),
        r.on("hide_nag", r.onHideNagScreen),
        r.activeScreen = null,
        r.showingScreen = "",
        r
    }
}(),
!NeptunesPride)
    var NeptunesPride = {};
if (function() {
    NeptunesPride.Universe = function() {
        "use strict";
        var e;
        return e = {},
        e.galaxy = null,
        e.playerAchievements = null,
        e.outstandingRequests = 0,
        e.loading = !1,
        e.player = null,
        e.selectedStar = null,
        e.selectedFleet = null,
        e.selectedPlayer = null,
        e.selectedSpaceObject = null,
        e.waypoints = [],
        e.editMode = "normal",
        e.playerCount = 0,
        e.openPlayerPositions = 0,
        e.filledPlayerPositions = 0,
        e.hyperlinkedMessageInserts = {},
        e.now = 0,
        e.locTimeCorrection = 0,
        e.intelDataRequestPending = !1,
        e.intelDataType = "ts",
        e.intelPlayerToChart = [],
        e.intelData = null,
        e.intelDataNone = !1,
        e.intelDataFull = null,
        e.intelDataRecievedTime = null,
        e.IntelChartOptions = {
            lineWidth: 3,
            backgroundColor: {
                fill: "#000000"
            },
            chartArea: {
                left: 0,
                top: 0,
                width: 480,
                height: 256
            },
            fontSize: 14,
            fontName: "OpenSansRegular",
            hAxis: {
                gridlines: {
                    color: "#2C3273",
                    count: 4
                },
                textPosition: "in",
                textStyle: {
                    color: "SeaShell",
                    fontName: "OpenSansRegular",
                    fontSize: 14
                },
                baselineColor: "#2C3273"
            },
            vAxis: {
                gridlines: {
                    color: "#2C3273",
                    count: 4
                },
                textPosition: "in",
                textStyle: {
                    color: "SeaShell",
                    fontName: "OpenSansRegular",
                    fontSize: 14
                },
                baselineColor: "#2C3273"
            },
            legend: {
                position: "none"
            },
            colors: [],
            width: 480,
            height: 256
        },
        e.movieMode = !1,
        e.joinGamePos = -1,
        e.joinGameAlias = "",
        e.joinGameAvatar = -1,
        e.joinGamePassword = "",
        e.joinGameSelectedAvatarIndex = 0,
        e.joinGameAvatarChoices = [38, 33, 34, 32, 36, 50, 31, 26, 30, 44, 23, 16, 999],
        e.joinGamePremiumAvatars = [31, 26, 30, 44, 23, 16, 999],
        e.defaultFleetOrderOverride = 0,
        e.askForLooping = !1,
        e.addGalaxy = function(t) {
            var r, n, o;
            e.galaxy = t,
            -1 !== Number(e.galaxy.player_uid) ? (e.player = e.galaxy.players[e.galaxy.player_uid],
            e.player.scannedPlayers = []) : e.player = null,
            e.selectedPlayer = e.selectedPlayer ? e.galaxy.players[e.selectedPlayer.uid] : e.player,
            e.adminPlayer = -1 !== Number(e.galaxy.admin) ? e.galaxy.players[e.galaxy.admin] : null,
            e.now = new Date(e.galaxy.now),
            e.locTimeCorrection = e.now.valueOf() - (new Date).valueOf(),
            e.galaxy.turnDue = null,
            e.galaxy.turn_based_time_out > 0 && (e.galaxy.turnDue = new Date(e.galaxy.turn_based_time_out)),
            e.playerCount = 0,
            e.openPlayerPositions = 0,
            e.filledPlayerPositions = 0;
            for (n in e.galaxy.players)
                e.expandPlayerData(e.galaxy.players[n]);
            for (n in e.galaxy.stars)
                e.expandStarData(e.galaxy.stars[n]);
            for (n in e.galaxy.fleets)
                e.expandFleetData(e.galaxy.fleets[n]);
            for (n in e.galaxy.stars)
                for (r = e.galaxy.stars[n],
                r.totalDefenses = r.st,
                r.victoryBonus = 0,
                r.uce = e.calcUCE(r),
                r.uci = e.calcUCI(r),
                r.ucs = e.calcUCS(r),
                r.ucg = e.calcUCG(r),
                o = r.fleetsInOrbit.length - 1; o >= 0; o--)
                    r.totalDefenses += e.galaxy.stars[n].fleetsInOrbit[o].st;
            if (e.player && NeptunesPride.gameConfig.tradeScanned)
                for (n in e.galaxy.stars)
                    r = e.galaxy.stars[n],
                    r.player && r.v > 0 && e.isDrectlyScanned(r) && e.player.scannedPlayers.indexOf(r.puid) < 0 && e.player.scannedPlayers.push(r.puid);
            if (e.selectedStar && (e.selectedStar = e.galaxy.stars[e.selectedStar.uid]),
            e.selectedFleet) {
                if (e.selectedFleet.oldPath) {
                    var a = e.galaxy.fleets[e.selectedFleet.uid]
                      , i = e.selectedFleet;
                    for (a.oldPath = a.path,
                    a.path = [],
                    o = 0; o < i.path.length; o += 1)
                        a.path.push(e.galaxy.stars[i.path[o].uid])
                }
                e.selectedFleet = e.galaxy.fleets[e.selectedFleet.uid]
            }
            e.selectedSpaceObject && ("fleet" === e.selectedSpaceObject.kind && (e.selectedSpaceObject = e.selectedFleet),
            "star" === e.selectedSpaceObject.kind && (e.selectedSpaceObject = e.selectedStar)),
            "edit_waypoints" === e.editMode && e.calcWaypoints(),
            e.intelPlayerToChart.length || e.player && e.intelPlayerToChart.push(e.player.uid),
            e.player && e.calcPlayerTotalInf(),
            e.initRuler(),
            e.calcCenterOfGalaxy()
        }
        ,
        e.calcPlayerTotalInf = function() {
            var t, r;
            e.player.total_economy = 0,
            e.player.total_industry = 0,
            e.player.total_science = 0;
            for (r in e.galaxy.stars)
                t = e.galaxy.stars[r],
                t.player === e.player && (e.player.total_economy += t.e,
                e.player.total_industry += t.i,
                e.player.total_science += t.s)
        }
        ,
        e.expandPlayerData = function(t) {
            t.kind = "player",
            t.home = e.galaxy.stars[t.huid],
            t.home || (t.home = e.findBestStar(t)),
            t.colorIndex = Math.floor(t.uid % 8),
            t.shapeIndex = Math.floor(t.uid / 8),
            t.color = e.playerColors[t.colorIndex],
            t.colorName = e.playerColorNames[t.colorIndex],
            t.colourBox = "<span class='playericon_font pc_" + t.colorIndex + "'>" + t.shapeIndex + "</span>",
            e.playerCount += 1,
            t.rawAlias = t.alias,
            "" === t.alias ? (t.hyperlinkedAlias = "an open player position",
            t.qualifiedAlias = "an open player position",
            e.openPlayerPositions += 1) : (e.galaxy.game_over || (1 === t.conceded && (t.alias += " (QUIT)"),
            2 === t.conceded && (t.alias += " (AFK)"),
            3 === t.conceded && (t.alias += " (KO)"),
            t.conceded > 0 && (t.avatar = 0)),
            t.hyperlinkedAlias = "<a onClick=\"Crux.crux.trigger('show_player_uid', '" + t.uid + "' )\">" + t.alias + "</a>",
            t.hyperlinkedRawAlias = "<a onClick=\"Crux.crux.trigger('show_player_uid', '" + t.uid + "' )\">" + t.rawAlias + "</a>",
            t.hyperlinkedBox = "<a onClick=\"Crux.crux.trigger('show_player_uid', '" + t.uid + "' )\"><span class='playericon_font pc_" + t.colorIndex + "'>" + t.shapeIndex + "</span></a>",
            t.qualifiedAlias = t.alias,
            e.filledPlayerPositions += 1),
            t.shipsPerTick = e.calcShipsPerTickTotal(t),
            e.hyperlinkedMessageInserts[t.uid] = t.hyperlinkedBox + t.hyperlinkedRawAlias
        }
        ,
        e.expandStarData = function(t) {
            t.kind = "star",
            t.fleetsInOrbit = [],
            t.alliedDefenders = [],
            t.player = e.galaxy.players[t.puid],
            t.player ? (t.qualifiedAlias = t.player.qualifiedAlias,
            t.hyperlinkedAlias = t.player.hyperlinkedAlias,
            t.colourBox = t.player.colourBox,
            t.shipsPerTick = e.calcShipsPerTick(t)) : t.qualifiedAlias = "",
            t.owned = !1,
            e.galaxy.player_uid === t.puid && (t.owned = !0),
            "0" === t.v && (t.st = 0,
            t.e = 0,
            t.i = 0,
            t.s = 0,
            t.uce = 0,
            t.uci = 0,
            t.ucs = 0,
            t.c = 0,
            t.g = 0,
            t.r = 0,
            t.nr = 0),
            t.n = t.n.replace(/[^a-z0-9_ ]/gi, "_"),
            t.hyperlinkedName = '<a onClick=\'Crux.crux.trigger("show_star_uid", "' + t.uid + "\")'>" + t.n + "</a>",
            e.hyperlinkedMessageInserts[t.n] = t.hyperlinkedName
        }
        ,
        e.expandFleetData = function(t) {
            var r;
            t.kind = "fleet",
            t.warpSpeed = t.w,
            t.player = e.galaxy.players[t.puid],
            t.orders = t.o,
            t.loop = t.l,
            t.player ? (t.qualifiedAlias = t.player.qualifiedAlias,
            t.hyperlinkedAlias = t.player.hyperlinkedAlias,
            t.colourBox = t.player.colourBox) : t.qualifiedAlias = "",
            t.orbiting = null,
            t.ouid && (t.orbiting = e.galaxy.stars[t.ouid],
            t.orbiting && (r = e.galaxy.stars[t.ouid],
            r.fleetsInOrbit.push(t),
            t.puid !== r.puid && r.alliedDefenders.indexOf(t.puid) < 0 && r.alliedDefenders.push(t.puid))),
            t.path = [];
            var n, o, a;
            for (o = 0,
            a = t.orders.length; a > o; o += 1) {
                if (n = t.orders[o],
                !e.galaxy.stars[n[1]]) {
                    t.unScannedStarInPath = !0;
                    break
                }
                t.path.push(e.galaxy.stars[n[1]])
            }
            t.owned = !1,
            e.galaxy.player_uid === t.puid && (t.owned = !0),
            t.lastStar = null,
            e.calcFleetEta(t)
        }
        ,
        e.calcCenterOfGalaxy = function() {
            var t, r, n = 1e3, o = 1e3, a = -1e3, i = -1e3;
            for (t in e.galaxy.stars)
                r = e.galaxy.stars[t],
                r.x = Number(r.x),
                r.y = Number(r.y),
                r.x < n && (n = r.x),
                r.y < o && (o = r.y),
                r.x > a && (a = r.x),
                r.y > i && (i = r.y);
            e.centerX = (a + n) / 2,
            e.centerY = (i + o) / 2
        }
        ,
        e.selectFleet = function(t) {
            e.selectedPlayer = t.player,
            e.selectedFleet = t,
            e.selectedSpaceObject = t,
            e.selectedStar = null
        }
        ,
        e.selectStar = function(t) {
            e.selectedPlayer = t.player,
            e.selectedStar = t,
            e.selectedSpaceObject = t,
            e.selectedFleet = null
        }
        ,
        e.selectPlayer = function(t) {
            e.selectedPlayer = t,
            e.selectedStar = null,
            e.selectedSpaceObject = null,
            e.selectedFleet = null
        }
        ,
        e.selectNone = function() {
            e.selectedPlayer = null,
            e.selectedStar = null,
            e.selectedSpaceObject = null,
            e.selectedFleet = null
        }
        ,
        e.seekSelection = function(t, r) {
            var n, o;
            if (n = [],
            e.interfaceSettings.showStars)
                for (o in e.galaxy.stars)
                    e.galaxy.stars[o].x > t - .04 && e.galaxy.stars[o].x < t + .04 && e.galaxy.stars[o].y > r - .04 && e.galaxy.stars[o].y < r + .04 && n.push(e.galaxy.stars[o]);
            if (e.interfaceSettings.showFleets)
                for (o in e.galaxy.fleets)
                    e.galaxy.fleets[o].x > t - .04 && e.galaxy.fleets[o].x < t + .04 && e.galaxy.fleets[o].y > r - .04 && e.galaxy.fleets[o].y < r + .04 && n.push(e.galaxy.fleets[o]);
            return e.possibleSelections = n,
            n
        }
        ,
        e.isInRange = function(e, t, r) {
            var n, o, a;
            return n = Math.abs(e.x - t.x),
            o = Math.abs(e.y - t.y),
            a = Math.sqrt(n * n + o * o),
            r >= a ? !0 : !1
        }
        ,
        e.isSameLocation = function(e, t) {
            return e.x === t.x && e.y === t.y ? !0 : !1
        }
        ,
        e.findBestStar = function(t) {
            var r, n, o;
            for (r in e.galaxy.stars)
                n = e.galaxy.stars[r],
                n.puid === t.uid && (void 0 === o && (o = n),
                n.r > o.r && (o = n));
            return o
        }
        ,
        e.findCheapestUpgrade = function(t) {
            var r, n, o;
            for (r in e.galaxy.stars)
                n = e.galaxy.stars[r],
                n.player === e.player && (void 0 === o && (o = n),
                "economy" === t && n.uce < o.uce && (o = n),
                "industry" === t && n.uci < o.uci && (o = n),
                "science" === t && n.ucs < o.ucs && (o = n));
            return o
        }
        ,
        e.upgradeEconomy = function(t) {
            void 0 === t && (t = e.selectedStar),
            t && (e.player.cash -= t.uce,
            t.uce = 0,
            t.e += 1,
            t.uce = e.calcUCE(t),
            e.player.total_economy += 1)
        }
        ,
        e.upgradeIndustry = function(t) {
            void 0 === t && (t = e.selectedStar),
            t && (e.player.cash -= t.uci,
            t.uci = 0,
            t.i += 1,
            t.uci = e.calcUCI(t),
            e.player.total_industry += 1,
            t.shipsPerTick = e.calcShipsPerTick(t),
            e.player.shipsPerTick = e.calcShipsPerTickTotal(e.player))
        }
        ,
        e.upgradeScience = function(t) {
            void 0 === t && (t = e.selectedStar),
            t && (e.player.cash -= t.ucs,
            t.ucs = 0,
            t.s += 1,
            t.ucs = e.calcUCS(t),
            e.player.total_science += 1)
        }
        ,
        e.buyWarpGate = function(t) {
            void 0 === t && (t = e.selectedStar),
            t && (e.player.cash -= t.ucg,
            t.ucg = 0,
            t.ga = 1)
        }
        ,
        e.destroyWarpGate = function(t) {
            void 0 === t && (t = e.selectedStar),
            t && (t.ga = 0,
            t.ucg = e.calcUCG(t))
        }
        ,
        e.abandonStar = function(t) {
            void 0 === t && (t = e.selectedStar),
            t && (t.player.stars_abandoned += 1,
            t.strength = 0,
            t.puid = -1,
            t.player = void 0,
            t.owned = !1,
            t.spriteOwner = void 0)
        }
        ,
        e.calcUCE = function(t) {
            return t.player !== e.player ? 0 : Math.floor(2.5 * NeptunesPride.gameConfig.developmentCostEconomy * (t.e + 1) / (t.r / 100))
        }
        ,
        e.calcUCI = function(t) {
            return t.player !== e.player ? 0 : Math.floor(5 * NeptunesPride.gameConfig.developmentCostIndustry * (t.i + 1) / (t.r / 100))
        }
        ,
        e.calcUCS = function(t) {
            return t.player !== e.player ? 0 : Math.floor(20 * NeptunesPride.gameConfig.developmentCostScience * (t.s + 1) / (t.r / 100))
        }
        ,
        e.calcUCG = function(t) {
            return t.player !== e.player ? 0 : t.ga ? 0 : 0 === NeptunesPride.gameConfig.buildGates ? 0 : Math.floor(100 * NeptunesPride.gameConfig.buildGates / (t.r / 100))
        }
        ,
        e.calcShipsPerTick = function(t) {
            var r = t.i * (5 + t.player.tech.manufacturing.level)
              , n = r / e.galaxy.production_rate;
            return n !== Math.round(n) && (n = n.toFixed(2)),
            n
        }
        ,
        e.calcShipsPerTickTotal = function(t) {
            var r = t.total_industry * (5 + t.tech.manufacturing.level)
              , n = r / e.galaxy.production_rate;
            return n !== Math.round(n) && (n = n.toFixed(2)),
            n
        }
        ,
        e.shipTransfer = function(t, r) {
            e.selectedFleet.st = r,
            e.selectedFleet.orbiting.st = t
        }
        ,
        e.distance = function(e, t, r, n) {
            var o = Math.sqrt((e - r) * (e - r) + (t - n) * (t - n));
            return o
        }
        ,
        e.starDistance = function(t, r) {
            return e.distance(t.x, t.y, r.x, r.y)
        }
        ,
        e.calcFleetEta = function(t) {
            var r, n, o, a, i = e.galaxy.fleet_speed, s = 3 * e.galaxy.fleet_speed;
            if (t.eta = 0,
            t.etaFirst = 0,
            t.path.length > 0 && (t.eta += 1,
            o = t,
            a = !1,
            t.orbiting && (o = t.orbiting,
            t.eta += t.orders[0][0]),
            r = e.distance(o.x, o.y, t.path[0].x, t.path[0].y),
            "star" === o.kind && e.starsGated(o, t.path[0]) && (a = !0),
            t.eta += t.warpSpeed || a ? Math.floor(r / s) : Math.floor(r / i),
            t.etaFirst = t.eta,
            t.orders[0][4] = t.eta,
            t.path.length > 1))
                for (n = 0; n < t.path.length - 1; n += 1)
                    r = e.distance(t.path[n].x, t.path[n].y, t.path[n + 1].x, t.path[n + 1].y),
                    t.eta += e.starsGated(t.path[n], t.path[n + 1]) ? Math.floor(r / s) : Math.floor(r / i),
                    t.eta += 1,
                    t.eta += t.orders[n + 1][0],
                    t.orders[n + 1][4] = t.eta
        }
        ,
        e.starsGated = function(e, t) {
            return 1 !== e.ga || 1 !== t.ga ? !1 : !0
        }
        ,
        e.areStarsEnemies = function(t, r) {
            return t.player && r.player ? t.puid === r.puid ? !1 : t.puid === e.player.uid && 0 === e.player.war[r.puid] ? !1 : r.puid === e.player.uid && 0 === e.player.war[t.puid] ? !1 : !0 : !0
        }
        ,
        e.isDrectlyScanned = function(t) {
            var r, n, o;
            if (t.player === e.player)
                return !0;
            for (r in e.galaxy.stars)
                if (n = e.galaxy.stars[r],
                n.player === e.player && (o = e.starDistance(t, n),
                o <= e.player.tech.scanning.value))
                    return !0
        }
        ,
        e.calcWaypoints = function() {
            var t, r;
            if (e.waypoints = [],
            t = e.selectedFleet.orbiting,
            e.selectedFleet.path.length && (t = e.selectedFleet.path[e.selectedFleet.path.length - 1]),
            e.selectedFleet.lastStar = t,
            t || e.selectedFleet.unScannedStarInPath || (t = e.selectedFleet),
            t) {
                e.waypoints.push(e.selectedFleet.lastStar);
                for (r in e.galaxy.stars)
                    e.isInRange(e.galaxy.stars[r], t, e.player.tech.propulsion.value) && e.galaxy.stars[r] !== t && e.waypoints.push(e.galaxy.stars[r])
            }
        }
        ,
        e.createOldOrders = function() {
            var t, r;
            for (e.selectedFleet.oldOrders = [],
            t = 0,
            r = e.selectedFleet.orders.length; r > t; t += 1)
                e.selectedFleet.oldOrders.push([e.selectedFleet.orders[t][0], e.selectedFleet.orders[t][1], e.selectedFleet.orders[t][2], e.selectedFleet.orders[t][3], e.selectedFleet.orders[t][4]]);
            for (e.selectedFleet.oldPath = [],
            t = 0,
            r = e.selectedFleet.path.length; r > t; t += 1)
                e.selectedFleet.oldPath.push(e.selectedFleet.path[t]);
            e.selectedFleet.oldLoop = e.selectedFleet.loop
        }
        ,
        e.ordersLoopable = function() {
            var t = e.selectedFleet;
            if (t.orders.length <= 1)
                return !1;
            if (t.orbiting && t.orbiting.uid === t.orders[t.orders.length - 1][1])
                return !0;
            var r = e.galaxy.stars[t.orders[0][1]]
              , n = e.galaxy.stars[t.orders[t.orders.length - 1][1]];
            return r && n ? e.isInRange(r, n, e.player.tech.propulsion.value) ? !0 : !1 : !1
        }
        ,
        e.restoreOldOrders = function() {
            e.selectedFleet.orders = e.selectedFleet.oldOrders,
            e.selectedFleet.path = e.selectedFleet.oldPath,
            e.selectedFleet.loop = e.selectedFleet.oldLoop
        }
        ,
        e.addFleetWaypoint = function(t) {
            var r = e.selectedFleet;
            if (!(r.orders.length > 18)) {
                var n, o;
                e.defaultFleetOrderOverride ? (n = e.defaultFleetOrderOverride,
                o = 0) : (n = Number(e.interfaceSettings.defaultFleetAction),
                o = Number(e.interfaceSettings.defaultFleetAmount)),
                r.orders.push([0, t.uid, n, o]),
                r.path.push(t),
                e.calcFleetEta(r),
                e.ordersLoopable() || (r.loop = !1),
                r.orbiting && r.orders.length > 1 && r.orbiting.uid === r.orders[r.orders.length - 1][1] && (e.askForLooping = !0)
            }
        }
        ,
        e.removeFleetWaypoint = function() {
            var t = e.selectedFleet;
            t.orbiting ? (t.orders.pop(),
            t.path.pop()) : t.path.length > 1 && (t.orders.pop(),
            t.path.pop()),
            e.calcFleetEta(t),
            t.loop = !1
        }
        ,
        e.clearFleetWaypoints = function() {
            var t, r = e.selectedFleet;
            r.orbiting ? (r.orders = [],
            r.path = []) : r.path.length > 1 && (t = r.path[0],
            r.path = [],
            r.path.push(t),
            t = r.orders[0],
            r.orders = [],
            r.orders.push(t)),
            e.calcFleetEta(r),
            r.loop = !1
        }
        ,
        e.onlyPlayerJoined = function() {
            return e.player && e.openPlayerPositions === e.playerCount - 1 ? !0 : !1
        }
        ,
        e.lastPlayerActiveAndWinning = function() {
            var t, r, n = [], o = [];
            for (r in e.galaxy.players)
                t = e.galaxy.players[r],
                0 === t.conceded && o.push(t),
                n.push(t);
            return n.sort(function(e, t) {
                return t.total_stars - e.total_stars
            }),
            e.player === n[0] && 1 === o.length ? !0 : !1
        }
        ,
        e.initRuler = function() {
            e.ruler = {},
            e.ruler.stars = [],
            e.ruler.eta = 0,
            e.ruler.baseEta = 0,
            e.ruler.gateEta = 0,
            e.ruler.gate = !0,
            e.ruler.totalDist = 0,
            e.ruler.ly = "0.0",
            e.ruler.hsRequired = 0
        }
        ,
        e.isGatedFlight = function(e, t) {
            return "fleet" !== e.kind || "star" !== t.kind ? !1 : 1 === e.warpSpeed && e.path.length > 0 && e.path[0].uid === t.uid
        }
        ,
        e.updateRuler = function(t) {
            if (t !== e.ruler.stars[e.ruler.stars.length - 1]) {
                "fleet" === t.kind && t.orbiting ? e.ruler.stars.push(t.orbiting) : e.ruler.stars.push(t);
                var r = e.ruler.stars.length;
                if (!(2 > r)) {
                    var n = e.ruler.stars[r - 2]
                      , o = e.ruler.stars[r - 1]
                      , a = e.distance(n.x, n.y, o.x, o.y)
                      , i = e.galaxy.fleet_speed
                      , s = Math.floor(a / i) + 1
                      , l = Math.floor(a / (3 * i)) + 1;
                    e.ruler.baseEta += s;
                    var c = s
                      , u = !1;
                    (e.starsGated(n, o) || e.isGatedFlight(n, o) || e.isGatedFlight(o, n)) && (u = !0,
                    c = l),
                    e.ruler.eta += c,
                    e.ruler.gateEta += u || "fleet" !== n.kind && "fleet" !== o.kind ? l : c,
                    e.ruler.totalDist += a;
                    var d = 8 * e.ruler.totalDist;
                    e.ruler.ly = (Math.round(1e3 * d) / 1e3).toFixed(3),
                    e.ruler.hsRequired = Math.max(e.ruler.hsRequired, Math.floor(8 * a) - 2, 1)
                }
            }
        }
        ,
        e.validateAlias = function(t) {
            if (t = t.trim(),
            t = t.replace(/[^a-z0-9 ]/gi, ""),
            t.length < 3 || t.length > 24)
                return "";
            var r;
            for (r in e.players)
                if (e.galaxy.players[r].alias == t)
                    return "";
            return /^\d+$/.test(t) ? "" : t
        }
        ,
        e.timeToProduction = function() {
            var t = e.galaxy.production_rate - e.galaxy.production_counter;
            return e.timeToTick(t)
        }
        ,
        e.timeToTick = function(t, r) {
            var n = 0
              , o = e.galaxy.tick_fragment
              , a = e.locTimeCorrection;
            e.galaxy.paused || (n = (new Date).valueOf() - e.now.valueOf()),
            (r || e.galaxy.turn_based) && (n = 0,
            o = 0,
            a = 0);
            var i = 1e3 * t * 60 * e.galaxy.tick_rate - 1e3 * o * 60 * e.galaxy.tick_rate - n - a;
            return 0 > i ? "0s" : Crux.formatTime(i, !0, !0)
        }
        ,
        e.describeTickRate = function() {
            return 120 == NeptunesPride.gameConfig.tickRate ? "every 2 hours" : 60 == NeptunesPride.gameConfig.tickRate ? "every hour" : 30 == NeptunesPride.gameConfig.tickRate ? "every 30 minutes" : 15 == NeptunesPride.gameConfig.tickRate ? "every 15 minutes" : void 0
        }
        ,
        e.describeProductionRate = function() {
            return "every " + NeptunesPride.gameConfig.tickRate / 2.5 + " hours"
        }
        ,
        e.initDirectorySettings = function() {
            e.starDirectory = {},
            e.starDirectory.sortBy = "uci",
            e.starDirectory.filter = "my_stars",
            e.starDirectory.invert = 1,
            e.fleetDirectory = {},
            e.fleetDirectory.sortBy = "st",
            e.fleetDirectory.filter = "my_fleets",
            e.fleetDirectory.invert = -1,
            e.shipDirectory = {},
            e.shipDirectory.sortBy = "st",
            e.shipDirectory.filter = "my_ships",
            e.shipDirectory.invert = -1
        }
        ,
        e.getInterfaceSettings = function() {
            if (store.enabled) {
                var t = store.get(e.storageName);
                if (t)
                    for (var r in t)
                        e.interfaceSettings[r] = t[r];
                e.interfaceSettings.showQuickUpgrade = !1,
                e.interfaceSettings.showBasicInfo = !0
            }
        }
        ,
        e.setInterfaceSetting = function(t, r) {
            "mapGraphics" === t && ("low" === r && (e.interfaceSettings.showNebular = !1,
            e.interfaceSettings.showRipples = !1),
            "medium" === r && (e.interfaceSettings.showNebular = !0,
            e.interfaceSettings.showRipples = !0),
            "high" === r && (e.interfaceSettings.showNebular = !0,
            e.interfaceSettings.showRipples = !0)),
            e.interfaceSettings[t] = r,
            store.enabled && store.set(e.storageName, e.interfaceSettings)
        }
        ,
        e.initInterfaceSettings = function() {
            e.interfaceSettings = {},
            e.interfaceSettings.showBasicInfo = !0,
            e.interfaceSettings.showStarInfrastructure = !0,
            e.interfaceSettings.showWaypointChoices = !1,
            e.interfaceSettings.showNebular = !0,
            e.interfaceSettings.showRipples = !0,
            e.interfaceSettings.showFleets = !0,
            e.interfaceSettings.showStars = !0,
            e.interfaceSettings.showQuickUpgrade = !1,
            e.interfaceSettings.allowBuyGalaxyScreen = !1,
            e.interfaceSettings.audio = !1,
            e.interfaceSettings.screenPos = "left",
            e.interfaceSettings.sideMenuPin = !1,
            e.interfaceSettings.mapGraphics = "medium",
            e.interfaceSettings.textZoomShips = "250",
            e.interfaceSettings.textZoomStarNames = "450",
            e.interfaceSettings.textZoomInf = "550",
            e.interfaceSettings.textZoomStarPlayerNames = "750",
            e.interfaceSettings.mapZoom = "500",
            e.interfaceSettings.showFirstTimePlayer = !0,
            e.interfaceSettings.showFleetNavEtaDetail = !1,
            e.interfaceSettings.defaultFleetAction = "1",
            e.interfaceSettings.defaultFleetAmount = "0",
            e.storageName = "NP2InterfaceV-8-5-13:" + NeptunesPride.version,
            e.getInterfaceSettings()
        }
        ,
        e.playerColors = [],
        e.playerColors.push("#0000ff"),
        e.playerColors.push("#009fdf"),
        e.playerColors.push("#40c000"),
        e.playerColors.push("#ffc000"),
        e.playerColors.push("#df5f00"),
        e.playerColors.push("#c00000"),
        e.playerColors.push("#c000c0"),
        e.playerColors.push("#6000c0"),
        e.playerColorNames = [],
        e.playerColorNames.push("BLUE"),
        e.playerColorNames.push("CYAN"),
        e.playerColorNames.push("GREEN"),
        e.playerColorNames.push("YELLOW"),
        e.playerColorNames.push("ORANGE"),
        e.playerColorNames.push("RED"),
        e.playerColorNames.push("PINK"),
        e.playerColorNames.push("PURPLE"),
        e.initInterfaceSettings(),
        e.initDirectorySettings(),
        e
    }
}(),
!NeptunesPride)
    var NeptunesPride = {};
if (function() {
    NeptunesPride.Game = function(e, t, r) {
        "use strict";
        var n = Crux.Widget();
        return Crux.crux.addChild(n),
        window.setInterval(function() {
            Crux.crux.trigger("one_second_tick")
        }, 1e3),
        n.trigger = function(e, t) {
            n.preTrigger(e, t) && n.ui.trigger(e, t)
        }
        ,
        n.preTrigger = function() {
            return !0
        }
        ,
        n.onShowYourEmpire = function() {
            e.selectedPlayer = e.player,
            n.trigger("show_screen", "empire"),
            n.trigger("refresh_player_icons")
        }
        ,
        n.onSelectPlayerPreJoin = function(t, r) {
            e.selectedPlayer = e.galaxy.players[r],
            e.selectedPlayer.home && n.trigger("map_center_slide", e.selectedPlayer.home),
            n.trigger("hide_side_menu"),
            n.trigger("hide_selection_menu"),
            n.trigger("hide_screen"),
            n.trigger("refresh_player_icons")
        }
        ,
        n.onSelectPlayer = function(t, o, a) {
            var i = !1;
            return "diplomacy_detail" === r.showingScreen || "compose" === r.showingScreen ? (n.trigger("insert_star_name", "[[" + o + "]] " + e.galaxy.players[o].alias),
            void 0) : (a === !0 && (i = a),
            e.selectedPlayer === e.galaxy.players[o] && (i = !0),
            e.selectedPlayer = e.galaxy.players[o],
            n.trigger("refresh_player_icons"),
            n.trigger("show_screen", "empire"),
            i && e.selectedPlayer.home && n.trigger("map_center_slide", e.selectedPlayer.home),
            n.trigger("hide_side_menu"),
            n.trigger("hide_selection_menu"),
            void 0)
        }
        ,
        n.onSelectFleet = function(t, r) {
            e.player && (e.selectFleet(r.fleet),
            n.trigger("show_screen", "fleet"),
            n.trigger("refresh_player_icons"),
            n.trigger("hide_selection_menu"),
            n.trigger("map_refresh"))
        }
        ,
        n.onShowFleetPath = function(t, r) {
            e.selectFleet(r),
            n.trigger("refresh_player_icons"),
            n.trigger("map_refresh")
        }
        ,
        n.onSelectStar = function(t, r) {
            e.player && (e.selectStar(r.star),
            n.trigger("show_screen", "star"),
            n.trigger("refresh_player_icons"),
            n.trigger("hide_selection_menu"))
        }
        ,
        n.onShowStarUid = function(t, o) {
            var a = e.galaxy.stars[o];
            e.selectStar(a),
            n.trigger("map_center_slide", a),
            r.width < 640 && n.trigger("hide_screen")
        }
        ,
        n.onShowStarScreenUid = function(t, r) {
            var o = e.galaxy.stars[r];
            e.selectStar(o),
            n.trigger("show_screen", "star"),
            n.trigger("map_center_slide", o)
        }
        ,
        n.onShowFleetUid = function(t, o) {
            var a = e.galaxy.fleets[o];
            e.selectFleet(a),
            n.trigger("map_center_slide", a),
            r.width < 640 && n.trigger("hide_screen")
        }
        ,
        n.onShowFleetScreenUid = function(t, r) {
            var o = e.galaxy.fleets[r];
            e.selectFleet(o),
            n.trigger("show_screen", "fleet"),
            n.trigger("map_center_slide", o)
        }
        ,
        n.onShowPlayerUid = function(t, r) {
            e.selectPlayer(e.galaxy.players[r]),
            e.selectedPlayer.home && n.trigger("map_center_slide", e.selectedPlayer.home),
            n.trigger("show_screen", "empire")
        }
        ,
        n.onShowStar = function(e, t) {
            n.onSelectStar(e, t),
            n.trigger("hide_screen"),
            n.trigger("map_center_slide", t.star)
        }
        ,
        n.onUpgradeEconomy = function() {
            e.selectedStar && (n.trigger("server_request", {
                type: "batched_order",
                order: "upgrade_economy," + e.selectedStar.uid + "," + e.selectedStar.uce
            }),
            e.upgradeEconomy(),
            n.trigger("refresh_interface"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "ok"))
        }
        ,
        n.onUpgradeIndustry = function() {
            e.selectedStar && (n.trigger("server_request", {
                type: "batched_order",
                order: "upgrade_industry," + e.selectedStar.uid + "," + e.selectedStar.uci
            }),
            e.upgradeIndustry(),
            n.trigger("refresh_interface"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "ok"))
        }
        ,
        n.onUpgradeScience = function() {
            e.selectedStar && (n.trigger("server_request", {
                type: "batched_order",
                order: "upgrade_science," + e.selectedStar.uid + "," + e.selectedStar.ucs
            }),
            e.upgradeScience(),
            n.trigger("refresh_interface"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "ok"))
        }
        ,
        n.onBulkUpgrade = function(t, r) {
            if (e.player) {
                var o, a = r.amount, i = r.kind, s = 5e3, l = 0;
                if (!(a > e.player.cash)) {
                    for (; a > 0 && s > 0; ) {
                        if (s -= 1,
                        o = e.findCheapestUpgrade(i),
                        "economy" === i) {
                            if (o.uce > a) {
                                a = 0;
                                continue
                            }
                            a -= o.uce,
                            n.trigger("server_request", {
                                type: "batched_order",
                                order: "upgrade_economy," + o.uid + "," + o.uce
                            }),
                            e.upgradeEconomy(o),
                            l += 1
                        }
                        if ("industry" === i) {
                            if (o.uci > a) {
                                a = 0;
                                continue
                            }
                            a -= o.uci,
                            n.trigger("server_request", {
                                type: "batched_order",
                                order: "upgrade_industry," + o.uid + "," + o.uci
                            }),
                            e.upgradeIndustry(o),
                            l += 1
                        }
                        if ("science" === i) {
                            if (o.ucs > a) {
                                a = 0;
                                continue
                            }
                            a -= o.ucs,
                            n.trigger("server_request", {
                                type: "batched_order",
                                order: "upgrade_science," + o.uid + "," + o.ucs
                            }),
                            e.upgradeScience(o),
                            l += 1
                        }
                    }
                    n.trigger("refresh_interface"),
                    n.trigger("map_rebuild"),
                    n.trigger("play_sound", "ok");
                    var c = {
                        amount: l,
                        localised_kind: Crux.localise(i)
                    }
                      , u = {
                        message: "notification_bulk_upgrade",
                        messageTemplateData: c,
                        notification: !0
                    };
                    n.trigger("show_screen", ["confirm", u])
                }
            }
        }
        ,
        n.onBuyWarpGate = function() {
            e.selectedStar && (n.trigger("server_request", {
                type: "batched_order",
                order: "buy_warp_gate," + e.selectedStar.uid + "," + e.selectedStar.ucg
            }),
            e.buyWarpGate(),
            n.trigger("refresh_interface"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "ok"))
        }
        ,
        n.onDestroyWarpGate = function() {
            e.selectedStar && (n.trigger("server_request", {
                type: "batched_order",
                order: "destroy_warp_gate," + e.selectedStar.uid + "," + e.selectedStar.ucg
            }),
            e.destroyWarpGate(),
            n.trigger("map_rebuild"),
            n.trigger("refresh_interface"),
            n.trigger("play_sound", "ok"))
        }
        ,
        n.onAbandonStar = function() {
            e.selectedStar && (e.abandonStar(),
            n.trigger("server_request", {
                type: "order",
                order: "abandon_star," + e.selectedStar.uid
            }),
            n.trigger("refresh_interface"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "ok"))
        }
        ,
        n.onDeclareWar = function() {
            e.selectedPlayer && (e.player.countdown_to_war[e.selectedPlayer.uid] = 24,
            n.trigger("server_request", {
                type: "order",
                order: "declare_war," + e.selectedPlayer.uid
            }),
            n.trigger("refresh_interface"))
        }
        ,
        n.onUnRequestPeace = function() {
            e.selectedPlayer && (e.player.war[e.selectedPlayer.uid] = 3,
            n.trigger("server_request", {
                type: "order",
                order: "unrequest_peace," + e.selectedPlayer.uid
            }),
            n.trigger("refresh_interface"))
        }
        ,
        n.onRequestPeace = function() {
            e.selectedPlayer && (e.player.cash < 150 || (e.player.cash -= 150,
            e.player.war[e.selectedPlayer.uid] = 2,
            n.trigger("server_request", {
                type: "order",
                order: "request_peace," + e.selectedPlayer.uid
            }),
            n.trigger("refresh_interface")))
        }
        ,
        n.onAcceptPeace = function() {
            e.selectedPlayer && (e.player.war[e.selectedPlayer.uid] = 0,
            n.trigger("server_request", {
                type: "order",
                order: "accept_peace," + e.selectedPlayer.uid
            }),
            n.trigger("refresh_interface"))
        }
        ,
        n.onRenameFleet = function(t, r) {
            r = n.validateFleetStarName(r),
            r && (e.selectedFleet.n = r,
            n.trigger("map_refresh"),
            n.trigger("show_screen", "fleet"),
            n.trigger("server_request", {
                type: "order",
                order: "rename_fleet," + e.selectedFleet.uid + "," + r
            }))
        }
        ,
        n.onRenameStar = function(t, r) {
            r = n.validateFleetStarName(r),
            r && (e.selectedStar.n = r,
            n.trigger("map_refresh"),
            n.trigger("show_screen", "star"),
            n.trigger("server_request", {
                type: "order",
                order: "rename_star," + e.selectedStar.uid + "," + r
            }))
        }
        ,
        n.onStarDirectoryEconomy = function(t, r) {
            e.selectStar(e.galaxy.stars[r]),
            n.onUpgradeEconomy(),
            n.trigger("refresh_interface"),
            n.trigger("map_refresh")
        }
        ,
        n.onStarDirectoryIndustry = function(t, r) {
            e.selectStar(e.galaxy.stars[r]),
            n.onUpgradeIndustry(),
            n.trigger("refresh_interface"),
            n.trigger("map_refresh")
        }
        ,
        n.onStarDirectoryScience = function(t, r) {
            e.selectStar(e.galaxy.stars[r]),
            n.onUpgradeScience(),
            n.trigger("refresh_interface"),
            n.trigger("map_refresh")
        }
        ,
        n.onStarDirectoryRowHHilight = function(t, r) {
            e.StarDirRowHilight = Number(r),
            n.trigger("refresh_interface")
        }
        ,
        n.onShareTech = function(t, r) {
            var o = r.targetPlayer
              , a = r.techName
              , i = (o.tech[a].level + 1) * e.galaxy.trade_cost;
            e.player.cash >= i && (o.tech[a].level += 1,
            e.player.cash -= i,
            n.trigger("server_request", {
                type: "order",
                order: "share_tech," + o.uid + "," + a
            }),
            e.selectPlayer(o),
            n.trigger("refresh_interface"))
        }
        ,
        n.onSendMoney = function(t, r) {
            var o = r.targetPlayer
              , a = r.amount;
            e.player.cash >= a && (e.player.cash -= Number(a),
            o.cash += Number(a),
            n.trigger("server_request", {
                type: "order",
                order: "send_money," + o.uid + "," + a
            }),
            e.selectPlayer(o),
            n.trigger("refresh_interface"))
        }
        ,
        n.onGiveStar = function(t, r) {
            var o = r.targetPlayer
              , a = r.starUid;
            o.total_stars += 1,
            e.player.total_stars -= 1;
            var i = e.galaxy.stars[a];
            if (!(e.player.cash < 10 * i.nr)) {
                e.player.cash -= 10 * i.nr,
                i.puid = o.uid,
                i.player = o,
                i.qualifiedAlias = o.qualifiedAlias,
                i.hyperlinkedAlias = o.hyperlinkedAlias,
                i.colourBox = o.colourBox,
                i.owned = !1;
                var s, l;
                for (l = i.fleetsInOrbit.length - 1; l >= 0; l--)
                    s = i.fleetsInOrbit[l],
                    s.puid = i.puid,
                    s.player = i.player,
                    s.qualifiedAlias = o.qualifiedAlias,
                    s.hyperlinkedAlias = o.hyperlinkedAlias,
                    s.colourBox = o.colourBox,
                    i.owned = !1;
                n.trigger("server_request", {
                    type: "order",
                    order: "give_star," + o.uid + "," + a
                }),
                e.selectPlayer(o),
                n.trigger("map_rebuild")
            }
        }
        ,
        n.onSelectAndGatherAllShips = function(t, r) {
            e.selectStar(r),
            n.onGatherAllShips(),
            n.trigger("show_selection_menu")
        }
        ,
        n.onGatherAllShips = function() {
            var t, r, o = 0, a = e.selectedStar;
            for (t = a.fleetsInOrbit.length - 1; t >= 0; t--)
                r = a.fleetsInOrbit[t],
                a.player.uid == r.player.uid && (o += r.st - 1,
                r.st = 1);
            a.st += o,
            n.trigger("server_request", {
                type: "order",
                order: "gather_all_ships," + a.uid
            }),
            n.trigger("refresh_interface"),
            n.trigger("play_sound", "ok")
        }
        ,
        n.onAwardKarma = function() {
            e.player.karma_to_give > 0 && (e.player.karma_to_give -= 1,
            e.playerAchievements[e.selectedPlayer.uid].karma += 1,
            n.trigger("server_request", {
                type: "order",
                order: "award_karma," + e.selectedPlayer.uid
            }),
            n.trigger("refresh_interface"),
            n.trigger("play_sound", "ok"))
        }
        ,
        n.onEditWaypointKeyboard = function() {
            if ("edit_waypoints" === e.editMode)
                return n.onCancelFleetOrders(),
                void 0;
            if (e.selectedFleet && e.selectedFleet.player === e.player)
                return n.onStartEditWaypoints(null, {
                    fleet: e.selectedFleet
                }),
                void 0;
            var t, r;
            if (e.selectedStar && e.selectedStar.player === e.player && e.selectedStar.fleetsInOrbit.length)
                for (t = e.selectedStar.fleetsInOrbit.length - 1; t >= 0; t--)
                    if (r = e.selectedStar.fleetsInOrbit[t],
                    !r.path.length)
                        return n.onStartEditWaypoints(null, {
                            fleet: r
                        }),
                        void 0;
            return e.selectedStar && e.selectedStar.player === e.player && e.selectedStar.fleetsInOrbit.length ? (n.onStartEditWaypoints(null, {
                fleet: e.selectedStar.fleetsInOrbit[0]
            }),
            void 0) : void 0
        }
        ,
        n.onStartEditWaypoints = function(t, r) {
            e.editMode = "edit_waypoints",
            e.interfaceSettings.showWaypointChoices = !0,
            e.selectFleet(r.fleet),
            e.createOldOrders(),
            e.calcWaypoints(),
            n.trigger("hide_screen"),
            n.trigger("hide_selection_menu"),
            n.trigger("show_fleet_order_confirm"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "alt_open")
        }
        ,
        n.onAddWaypoint = function(t, r) {
            e.addFleetWaypoint(r),
            e.calcWaypoints(),
            n.trigger("map_rebuild"),
            n.trigger("show_fleet_order_confirm"),
            n.trigger("play_sound", "add")
        }
        ,
        n.onRemoveWaypoint = function() {
            e.removeFleetWaypoint(),
            e.calcWaypoints(),
            n.trigger("show_fleet_order_confirm"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "subtract")
        }
        ,
        n.onClearWaypoints = function() {
            e.clearFleetWaypoints(),
            e.calcWaypoints(),
            n.trigger("show_fleet_order_confirm"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "subtract")
        }
        ,
        n.onSubmitFleetOrdersEdit = function() {
            e.askForLooping = !1,
            n.onSubmitFleetOrders(),
            n.trigger("show_screen", "fleet")
        }
        ,
        n.onSubmitFleetOrdersTestLoop = function() {
            if (n.onSubmitFleetOrders(),
            e.askForLooping) {
                e.askForLooping = !1,
                n.trigger("hide_screen");
                var t = {
                    message: "confirm_auto_loop",
                    eventKind: "loop_submit_fleet_orders",
                    eventData: {
                        fleet: e.selectedFleet
                    },
                    cancelEventKind: "submit_fleet_orders",
                    cancelEventData: {
                        fleet: e.selectedFleet
                    },
                    yesNoLabels: !0
                };
                return n.trigger("show_screen", ["confirm", t]),
                void 0
            }
        }
        ,
        n.onLoopSubmitFleetOrders = function(t, r) {
            e.selectFleet(r.fleet),
            e.selectedFleet.loop = !0,
            n.onSubmitFleetOrders()
        }
        ,
        n.onSubmitFleetOrders = function() {
            var t = e.selectedFleet
              , o = []
              , a = []
              , i = []
              , s = []
              , l = 0;
            t.loop && (l = 1);
            var c = 0
              , u = 0;
            for (c = 0,
            u = t.orders.length; u > c; c += 1)
                o.push(t.orders[c][0]),
                a.push(t.orders[c][1]),
                i.push(t.orders[c][2]),
                s.push(t.orders[c][3]);
            o.length ? n.trigger("server_request", {
                type: "order",
                order: "add_fleet_orders," + t.uid + "," + o.join("_") + "," + a.join("_") + "," + i.join("_") + "," + s.join("_") + "," + l
            }) : (t.loop = !1,
            n.trigger("server_request", {
                type: "order",
                order: "clear_fleet_orders," + t.uid
            })),
            e.waypoints = [],
            e.editMode = "normal",
            t.oldOrders = null,
            t.oldPath = null,
            e.interfaceSettings.showWaypointChoices = !1,
            n.trigger("hide_fleet_order_confirm"),
            r.showingScreen || n.trigger("show_selection_menu"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "ok")
        }
        ,
        n.onCancelFleetOrders = function() {
            if ("edit_waypoints" === e.editMode) {
                e.waypoints = [],
                e.editMode = "normal",
                e.interfaceSettings.showWaypointChoices = !1,
                e.selectedFleet && (e.restoreOldOrders(),
                e.calcFleetEta(e.selectedFleet),
                n.trigger("hide_fleet_order_confirm"),
                n.trigger("map_rebuild"),
                n.trigger("play_sound", "cancel"))
            }
        }
        ,
        n.onLoopFleetOrders = function() {
            e.selectedFleet.loop = 1,
            n.trigger("server_request", {
                type: "order",
                order: "loop_fleet_orders," + e.selectedFleet.uid + ",1"
            }),
            n.trigger("show_screen", "fleet"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "ok")
        }
        ,
        n.onLoopFleetOrdersOff = function() {
            e.selectedFleet.loop = 0,
            n.trigger("server_request", {
                type: "order",
                order: "loop_fleet_orders," + e.selectedFleet.uid + ",0"
            }),
            n.trigger("show_screen", "fleet"),
            n.trigger("map_rebuild"),
            n.trigger("play_sound", "ok")
        }
        ,
        n.onShipTransfer = function(t, o) {
            e.selectedFleet.player.uid === e.selectedFleet.orbiting.player.uid && (e.shipTransfer(o.star, o.fleet),
            n.trigger("server_request", {
                type: "order",
                order: "ship_transfer," + e.selectedFleet.uid + "," + o.fleet
            }),
            n.trigger("hide_screen"),
            r.showingScreen || n.trigger("show_selection_menu"),
            n.trigger("play_sound", "ok"))
        }
        ,
        n.onNewFleet = function(t, r) {
            e.player.cash < 25 || (e.player.cash -= 25,
            e.selectedStar.st -= r.strength,
            n.trigger("server_request", {
                type: "order",
                order: "new_fleet," + e.selectedStar.uid + "," + r.strength
            }),
            n.trigger("map_refresh"),
            n.trigger("hide_screen"),
            n.trigger("play_sound", "ok"),
            e.selectNone())
        }
        ,
        n.onChangeResearch = function(t, r) {
            e.player.researching = r,
            n.trigger("server_request", {
                type: "order",
                order: "change_research," + r
            }),
            n.trigger("refresh_interface"),
            n.trigger("play_sound", "ok")
        }
        ,
        n.onChangeResearchNext = function(t, r) {
            e.player.researching_next = r,
            n.trigger("server_request", {
                type: "order",
                order: "change_research_next," + r
            }),
            n.trigger("refresh_interface"),
            n.trigger("play_sound", "ok")
        }
        ,
        n.onMapMiddleClicked = function(t, o) {
            var a = e.seekSelection(o.x, o.y);
            if (a[0])
                return "diplomacy_detail" !== r.showingScreen && "compose" !== r.showingScreen || !a[0].player ? a[0].player ? (e.selectPlayer(a[0].player),
                n.trigger("show_screen", "empire"),
                n.trigger("ripple_star", a[0]),
                n.trigger("play_sound", "map_clicked"),
                void 0) : void 0 : (n.trigger("insert_star_name", "[[" + a[0].player.uid + "]] " + a[0].player.alias),
                void 0)
        }
        ,
        n.onMapClicked = function(t, o) {
            var a = 0
              , i = 0
              , s = 0
              , l = 0
              , c = !1
              , u = e.seekSelection(o.x, o.y);
            if ("edit_waypoints" !== e.editMode) {
                if ("ruler" == e.editMode)
                    return u[0] && (e.updateRuler(u[0]),
                    e.selectStar(u[0]),
                    n.trigger("ripple_star", u[0]),
                    n.trigger("play_sound", "map_clicked"),
                    n.trigger("show_ruler_toolbar")),
                    void 0;
                if (e.selectionModifier && u[0] && u[0].player)
                    return e.selectPlayer(u[0].player),
                    n.trigger("show_screen", "empire"),
                    n.trigger("ripple_star", u[0]),
                    n.trigger("play_sound", "map_clicked"),
                    void 0;
                if (u.length > 0) {
                    if ("diplomacy_detail" === r.showingScreen || "compose" === r.showingScreen)
                        return n.trigger("insert_star_name", "[[" + u[0].n + "]]"),
                        void 0;
                    if ("star" === u[0].kind) {
                        if (e.selectedStar === u[0] && r.selectionMenu)
                            return n.trigger("show_screen", "star"),
                            void 0;
                        e.selectStar(u[0])
                    }
                    if ("fleet" === u[0].kind) {
                        if (e.selectedFleet === u[0] && r.selectionMenu)
                            return n.trigger("show_screen", "fleet"),
                            void 0;
                        e.selectFleet(u[0])
                    }
                    return n.trigger("hide_screen"),
                    n.trigger("show_selection_menu"),
                    n.trigger("play_sound", "selection_open"),
                    n.trigger("refresh_build_inf_toolbar"),
                    n.trigger("special_ripple_star", u[0]),
                    void 0
                }
                e.selectNone(),
                ("star" === r.showingScreen || "fleet" === r.showingScreen || "ship_transfer" === r.showingScreen) && n.trigger("hide_screen"),
                n.trigger("hide_side_menu"),
                n.trigger("hide_selection_menu"),
                n.trigger("refresh_build_inf_toolbar"),
                n.trigger("hide_fleet_order_confirm")
            } else
                for (a = 0,
                i = u.length; i > a; a += 1)
                    for (s = 0,
                    l = e.waypoints.length; l > s; s += 1)
                        u[a] === e.waypoints[s] && (n.trigger("add_waypoint", e.waypoints[s]),
                        c = !0)
        }
        ,
        n.onLeaveGame = function() {
            n.trigger("server_request", {
                type: "leave_game"
            })
        }
        ,
        n.onPostLeaveGame = function() {
            n.trigger("browse_to", "/")
        }
        ,
        n.onJoinGame = function() {
            n.trigger("server_request", {
                type: "join_game",
                pos: e.joinGamePos,
                alias: e.joinGameAlias,
                avatar: e.joinGameAvatar,
                pass: e.joinGamePassword
            }),
            e.joinGamePassword = "",
            e.joinGameAlias = "",
            n.trigger("hide_screen"),
            n.trigger("hide_warning")
        }
        ,
        n.onPostJoinGame = function(t, r) {
            e.addGalaxy(r),
            e.selectStar(e.player.home),
            n.trigger("refresh_interface"),
            n.trigger("rebuild_player_icons"),
            n.trigger("hide_screen"),
            n.trigger("hide_warning"),
            n.trigger("map_rebuild"),
            1 === NeptunesPride.gameConfig.darkGalaxy ? n.trigger("map_center", e.player.home) : n.trigger("map_center_slide", e.player.home),
            n.onFetchPlayerAchievements(),
            n.trigger("show_screen", "leaderboard")
        }
        ,
        n.onNewFleetResponse = function(t, r) {
            e.expandFleetData(r),
            e.galaxy.fleets[r.uid] = r,
            n.trigger("refresh_interface"),
            n.trigger("map_rebuild"),
            n.trigger("start_edit_waypoints", {
                fleet: r
            })
        }
        ,
        n.testForNag = function() {
            var e = (new Date).getTime()
              , t = 6048e5
              , r = 2016e5;
            e - NeptunesPride.account.created.getTime() > t && (NeptunesPride.account.premium || e - NeptunesPride.account.nagged.getTime() > r && (n.trigger("server_request", {
                type: "nag"
            }),
            window.setTimeout(function() {
                n.trigger("show_nag")
            }, 1e3),
            NeptunesPride.account.nagged = new Date))
        }
        ,
        n.onFullUniverse = function(r, o) {
            n.testForNag(),
            n.onResetEditMode();
            var a = !1;
            e.showingError && n.trigger("hide_warning"),
            null === e.galaxy && (a = !0),
            e.addGalaxy(o),
            n.trigger("map_rebuild"),
            a && (n.trigger("build_interface"),
            n.trigger("show_screen", "leaderboard"),
            e.player && e.player.home ? n.trigger("map_center", e.player.home) : n.trigger("map_center", {
                x: e.centerX,
                y: e.centerY
            }),
            jQuery("#loadingArea").remove()),
            a || n.trigger("refresh_interface"),
            e.player || e.openPlayerPositions > 0 && n.trigger("show_warning", "warning_not_in_game"),
            e.galaxy.game_over && n.trigger("show_screen", "leaderboard"),
            n.onFetchPlayerAchievements(),
            t.onFetchUnreadCount()
        }
        ,
        n.onError = function(t, r) {
            console.log("FAILED ORDER: ", r),
            e.showingError = !0,
            e.loading = !1,
            e.outstandingRequests = 0,
            n.trigger("hide_screen"),
            n.trigger("show_warning", "failed_order_" + r)
        }
        ,
        n.onAPICode = function(t, r) {
            e.loading = !1,
            e.outstandingRequests = 0,
            n.trigger("hide_screen");
            var o = {
                message: "new_api_code",
                messageTemplateData: {
                    note: r
                },
                eventKind: "",
                eventData: {},
                notification: !0
            };
            n.trigger("show_screen", ["confirm", o])
        }
        ,
        n.onOK = function() {}
        ,
        n.onServerResponseError = function(t) {
            console.log("FAILED REQUEST: ", t.responseText),
            e.showingError = !0,
            e.loading = !1,
            e.outstandingRequests = 0,
            n.trigger("hide_screen"),
            n.trigger("show_warning", "server_communication_error")
        }
        ,
        n.onServerResponse = function(t) {
            return console.log(t),
            t && t.event ? (n.trigger(t.event, t.report),
            e.outstandingRequests -= 1,
            e.outstandingRequests <= 0 && (e.outstandingRequests = 0,
            e.loading = !1,
            n.trigger("update_status")),
            void 0) : (n.onServerResponseError(t),
            void 0)
        }
        ,
        e.batchedRequests = [],
        e.batchedRequestTimeout = 0,
        n.sendBatchedRequests = function(t) {
            void 0 === t && (t = !0),
            e.batchedRequests.length && (n.serverRequest({
                type: "batched_orders",
                order: e.batchedRequests.join("/")
            }, t),
            e.batchedRequests = [],
            e.batchedRequestTimeout = 0,
            e.outstandingRequests += 1,
            e.loading = !0)
        }
        ,
        n.onUnloaded = function() {
            n.sendBatchedRequests(!1)
        }
        ,
        n.onServerRequest = function(t, r) {
            "batched_order" === r.type ? (e.batchedRequests.push(r.order),
            e.batchedRequestTimeout = 5) : (n.serverRequest(r),
            e.outstandingRequests += 1,
            e.loading = !0,
            n.trigger("update_status"))
        }
        ,
        n.serverRequest = function(e, t) {
            var r = {}
              , o = ""
              , a = {}
              , i = "";
            void 0 === t && (t = !0),
            o = "/trequest/" + e.type,
            a = {};
            for (i in e)
                a[i] = e[i];
            a.version = NeptunesPride.version,
            a.game_number = NeptunesPride.gameNumber,
            r = jQuery.ajax({
                type: "POST",
                url: o,
                async: t,
                data: a,
                success: n.onServerResponse,
                error: n.onServerResponseError,
                dataType: "json"
            })
        }
        ,
        n.onBrowseTo = function(e, t) {
            window.location.href = t
        }
        ,
        n.onStartRuler = function() {
            return "edit_waypoints" === e.editMode && n.onCancelFleetOrders(),
            e.selectNone(),
            e.initRuler(),
            "ruler" === e.editMode ? (n.onEndRuler(),
            void 0) : (e.selectedStar ? e.updateRuler(e.selectedStar) : e.selectedFleet && e.updateRuler(e.selectedFleet),
            n.onResetEditMode(),
            e.editMode = "ruler",
            e.interfaceSettings.showRuler = !0,
            n.trigger("show_ruler_toolbar"),
            n.trigger("map_refresh"),
            n.trigger("hide_screen"),
            n.trigger("hide_side_menu"),
            n.trigger("hide_selection_menu"),
            n.trigger("play_sound", "alt_open"),
            void 0)
        }
        ,
        n.onResetRuler = function() {
            e.initRuler(),
            n.trigger("show_ruler_toolbar"),
            n.trigger("map_refresh")
        }
        ,
        n.onEndRuler = function() {
            "ruler" == e.editMode && (e.editMode = "normal",
            n.trigger("hide_ruler_toolbar"),
            n.trigger("map_refresh"))
        }
        ,
        n.onStartQuickUpgrade = function() {
            return "quick_upgrade" === e.editMode ? (n.onEndQuickUpgrade(),
            void 0) : (n.onResetEditMode(),
            e.editMode = "quick_upgrade",
            e.interfaceSettings.showQuickUpgrade = !0,
            e.interfaceSettings.showBasicInfo = !1,
            n.trigger("show_build_inf_toolbar"),
            n.trigger("map_refresh"),
            n.trigger("hide_screen"),
            n.trigger("hide_side_menu"),
            n.trigger("hide_selection_menu"),
            n.trigger("play_sound", "alt_open"),
            void 0)
        }
        ,
        n.onEndQuickUpgrade = function() {
            e.editMode = "normal",
            e.interfaceSettings.showBasicInfo = !0,
            e.interfaceSettings.showQuickUpgrade = !1,
            n.trigger("hide_build_inf_toolbar"),
            n.trigger("map_refresh")
        }
        ,
        n.onResetEditMode = function() {
            "normal" !== e.editMode && ("edit_waypoints" === e.editMode && n.onCancelFleetOrders(),
            "quick_upgrade" === e.editMode && n.onEndQuickUpgrade(),
            "ruler" === e.editMode && n.onEndRuler())
        }
        ,
        n.onOneSecondTick = function() {
            e.galaxy && e.player && (e.batchedRequestTimeout > 0 && (e.batchedRequestTimeout -= 1),
            e.batchedRequests.length && 0 === e.batchedRequestTimeout && n.sendBatchedRequests())
        }
        ,
        n.onTurnReady = function() {
            e.player.ready = 1,
            n.trigger("server_request", {
                type: "order",
                order: "force_ready"
            }),
            n.trigger("refresh_interface"),
            n.trigger("play_sound", "ok")
        }
        ,
        n.onStarDirSort = function(t, r) {
            e.starDirectory.sortBy === r && (e.starDirectory.invert *= -1),
            e.starDirectory.invert > 0 ? n.trigger("play_sound", "add") : n.trigger("play_sound", "subtract"),
            e.StarDirRowHilight = void 0,
            e.starDirectory.sortBy = r,
            n.trigger("show_screen", "star_dir")
        }
        ,
        n.onStarDirFilter = function(t, r) {
            e.starDirectory.filter = r,
            e.StarDirRowHilight = void 0,
            n.trigger("show_screen", "star_dir")
        }
        ,
        n.onFleetDirSort = function(t, r) {
            e.fleetDirectory.sortBy === r && (e.fleetDirectory.invert *= -1),
            e.fleetDirectory.invert > 0 ? n.trigger("play_sound", "add") : n.trigger("play_sound", "subtract"),
            e.fleetDirectory.sortBy = r,
            n.trigger("show_screen", "fleet_dir")
        }
        ,
        n.onFleetDirFilter = function(t, r) {
            e.fleetDirectory.filter = r,
            n.trigger("show_screen", "fleet_dir")
        }
        ,
        n.onShipDirSort = function(t, r) {
            e.shipDirectory.sortBy === r && (e.shipDirectory.invert *= -1),
            e.shipDirectory.invert > 0 ? n.trigger("play_sound", "add") : n.trigger("play_sound", "subtract"),
            e.shipDirectory.sortBy = r,
            n.trigger("show_screen", "ship_dir")
        }
        ,
        n.onShipDirFilter = function(t, r) {
            e.shipDirectory.filter = r,
            n.trigger("show_screen", "ship_dir")
        }
        ,
        n.onShowHelp = function(t, r) {
            function o(t) {
                e.helpHTML = t,
                n.trigger("show_screen", "help")
            }
            function a(e) {
                console.log("Help Request Fail", e)
            }
            e.helpKind = r,
            e.helpHTML = "",
            jQuery.ajax({
                type: "GET",
                url: "/html/help/" + r + ".html",
                success: o,
                error: a,
                dataType: "html"
            }),
            n.trigger("play_sound", "alt_open"),
            n.trigger("show_screen", "help")
        }
        ,
        n.onFetchPlayerAchievements = function() {
            1 !== NeptunesPride.gameConfig.anonymity && null === e.playerAchievements && n.trigger("server_request", {
                type: "fetch_player_achievements",
                game_number: NeptunesPride.gameNumber
            })
        }
        ,
        n.onNewPlayerAchievements = function(t, r) {
            e.playerAchievements = r,
            n.trigger("refresh_interface")
        }
        ,
        n.onIntelPlayerFilterChange = function(t, r) {
            var o = e.intelPlayerToChart.indexOf(r);
            o >= 0 ? e.intelPlayerToChart.splice(o, 1) : e.intelPlayerToChart.push(r),
            e.intelPlayerToChart.length || e.intelPlayerToChart.push(e.player.uid),
            n.onIntelSelectionChange(null, e.intelDataType)
        }
        ,
        n.onIntelPlayerFilterAll = function() {
            var t;
            e.intelPlayerToChart = [];
            for (t in e.galaxy.players)
                e.intelPlayerToChart.push(Number(t));
            n.onIntelSelectionChange(null, e.intelDataType)
        }
        ,
        n.onIntelPlayerFilterNone = function() {
            e.intelPlayerToChart = [e.player.uid],
            n.onIntelSelectionChange(null, e.intelDataType)
        }
        ,
        n.onIntelSelectionChange = function(t, r) {
            if (e.intelDataFull) {
                var o, a;
                e.intelDataType = r,
                e.IntelChartOptions.colors = [];
                var i = [];
                for (o = 0; o < e.intelDataFull.length; o += 1) {
                    var s = e.intelDataFull[o]
                      , l = []
                      , c = null;
                    for (l.push(s.tick),
                    a = 0; a < s.players.length; a += 1) {
                        var u = s.players[a];
                        e.intelPlayerToChart.indexOf(u.uid) >= 0 && (u.uid === e.player.uid ? c = u[e.intelDataType] : (l.push(u[e.intelDataType]),
                        e.IntelChartOptions.colors.push(e.playerColors[e.galaxy.players[u.uid].colorIndex])))
                    }
                    null !== c && (l.push(c),
                    e.IntelChartOptions.colors.push("#FFFFFF")),
                    i.push(l)
                }
                i.sort(function(e, t) {
                    return e[0] - t[0]
                });
                var d = null;
                for (i.unshift([""]),
                o = 0; o < e.playerCount; o += 1)
                    e.intelPlayerToChart.indexOf(e.galaxy.players[o].uid) >= 0 && (e.galaxy.players[o] === e.player ? d = e.player.alias : i[0].push(e.galaxy.players[o].alias));
                d && i[0].push(d),
                e.intelData = google.visualization.arrayToDataTable(i),
                n.trigger("show_screen", "intel")
            }
        }
        ,
        n.onIntelDataRecieved = function(t, r) {
            e.intelDataRequestPending = !1,
            e.intelDataRecievedTime = (new Date).getTime(),
            r.stats.length ? (e.intelDataFull = r.stats,
            n.onIntelSelectionChange(null, e.intelDataType)) : (e.intelDataNone = !0,
            n.trigger("show_screen", "intel"))
        }
        ,
        n.onRequestIntelData = function() {
            if (!e.intelDataRequestPending) {
                if (e.intelDataRecievedTime) {
                    var t = (new Date).getTime();
                    t > e.intelDataRecievedTime + 108e5 && (e.intelData = null)
                }
                e.intelData || (e.intelDataRequestPending = !0,
                n.trigger("server_request", {
                    type: "intel_data"
                }))
            }
        }
        ,
        n.onShowIntel = function(t, r) {
            e.player && (e.intelDataFull || n.onRequestIntelData(),
            e.intelPlayerToChart = [],
            e.intelPlayerToChart.push(e.player.uid),
            r !== e.player.uid && e.intelPlayerToChart.push(r),
            n.onIntelSelectionChange(null, e.intelDataType))
        }
        ,
        n.onToggleFleetNavEtaDetail = function() {
            e.interfaceSettings.showFleetNavEtaDetail = e.interfaceSettings.showFleetNavEtaDetail ? !1 : !0,
            n.trigger("show_screen", "fleet")
        }
        ,
        n.onRestoreConcededPlayer = function(e, t) {
            n.trigger("server_request", {
                type: "order",
                order: "restore_conceded_player," + t
            }),
            n.trigger("show_screen", "options")
        }
        ,
        n.onSelectPlayerForGift = function() {
            var e = {
                name: "select_player",
                body: "select_player_for_gift",
                returnScreen: "leaderboard",
                selectionEvent: "select_player_for_gift_selected",
                playerFilter: []
            };
            n.trigger("show_screen", ["select_player", e])
        }
        ,
        n.onSelectPlayerForGiftSelected = function(t, r) {
            var o = e.galaxy.players[r];
            e.selectPlayer(o),
            n.trigger("show_screen", "buy_gift")
        }
        ,
        n.onSelectPlayerForPremiumGift = function() {
            var e = {
                name: "select_player",
                body: "select_player_for_gift",
                returnScreen: "leaderboard",
                selectionEvent: "select_player_for_premium_gift_selected",
                playerFilter: []
            };
            n.trigger("show_screen", ["select_player", e])
        }
        ,
        n.onSelectPlayerForPremiumGiftSelected = function(t, r) {
            var o = e.galaxy.players[r];
            e.selectPlayer(o),
            n.trigger("show_screen", "buy_premium_gift")
        }
        ,
        e.colorBlindHelper = !1,
        n.toggleColourBlindHelp = function() {
            e.empireNameHelper && (e.empireNameHelper = !1),
            e.colorBlindHelper = e.colorBlindHelper ? !1 : !0,
            n.trigger("map_refresh"),
            n.trigger("rebuild_player_icons")
        }
        ,
        n.validateFleetStarName = function(t) {
            function r() {
                n.trigger("hide_screen");
                var e = {
                    message: "notification_bad_fleet_star_name",
                    eventKind: "",
                    eventData: {},
                    notification: !0
                };
                return n.trigger("show_screen", ["confirm", e]),
                ""
            }
            if (t = t.trim(),
            t = t.replace(/[^a-z0-9_ ]/gi, ""),
            /^\d+$/.test(t))
                return r();
            if (t.length < 3 || t.length > 24)
                return r();
            var o;
            for (o in e.galaxy.stars)
                if (e.galaxy.stars[o].n == t)
                    return r();
            for (o in e.galaxy.fleets)
                if (e.galaxy.fleets[o].n == t)
                    return r();
            return t
        }
        ,
        e.movieMode && (n.smootScrollTarget = 0,
        n.smoothScroll = function(e, t) {
            e.preventDefault(),
            Crux.createAnim(n, "smootScrollTarget", n.smootScrollTarget, n.smootScrollTarget + 256 * t, 500)
        }
        ,
        n.draw = function() {
            window.scroll(0, n.smootScrollTarget)
        }
        ,
        Crux.tickCallbacks.push(n.draw)),
        n.onScreenShotMiniMap = function() {
            n.trigger("map_center", {
                x: 0,
                y: 0
            }),
            r.status.hide(),
            r.playerIcons.hide(),
            r.tmContainer && r.tmContainer.hide()
        }
        ,
        n.onBuyGift = function(t, o) {
            n.trigger("server_request", {
                type: "buy_gift",
                kind: o.icon,
                puid: o.puid
            }),
            NeptunesPride.account.credits -= o.amount;
            var a, i;
            e.playerAchievements && (a = e.playerAchievements[o.puid]);
            for (i in r.badgeFileNames)
                r.badgeFileNames[i] === o.icon && (a.badges += i);
            var s = {
                message: "notification_gift_purchase",
                messageTemplateData: o,
                eventKind: "show_screen",
                eventData: "empire",
                notification: !0
            };
            n.trigger("show_screen", ["confirm", s])
        }
        ,
        e.interfaceSettings.audio && (n.soundFormats = {
            formats: ["ogg", "mp3"],
            preload: !0,
            autoplay: !1,
            loop: !1,
            volume: 50
        },
        n.sounds = {},
        n.sounds.screen_open = new buzz.sound("/sounds/Button_10",n.soundFormats),
        n.sounds.selection_open = new buzz.sound("/sounds/Button_11",n.soundFormats),
        n.sounds.alt_open = new buzz.sound("/sounds/Button_26",n.soundFormats),
        n.sounds.ok = new buzz.sound("/sounds/Chirp_08",n.soundFormats),
        n.sounds.cancel = new buzz.sound("/sounds/Click_77",n.soundFormats),
        n.sounds.add = new buzz.sound("/sounds/Button_02",n.soundFormats),
        n.sounds.subtract = new buzz.sound("/sounds/Button_03",n.soundFormats),
        n.sounds.zoom = new buzz.sound("/sounds/Rollover_22",n.soundFormats)),
        n.onPlaySound = function(e, t) {
            n.sounds[t] && (n.sounds[t].stop(),
            n.sounds[t].play())
        }
        ,
        Mousetrap.bind(["="], function() {
            n.trigger("zoom_in")
        }),
        Mousetrap.bind(["-"], function() {
            n.trigger("zoom_out")
        }),
        Mousetrap.bind(["z", "Z"], function() {
            n.trigger("zoom_minimap")
        }),
        Mousetrap.bind(["0"], function() {
            n.trigger("zoom_minimap")
        }),
        Mousetrap.bind(["w", "W"], function() {
            n.trigger("edit_waypoint_keyboard")
        }),
        Mousetrap.bind(["q", "Q"], function() {
            n.trigger("start_quick_upgrade")
        }),
        Mousetrap.bind(["v", "V"], function() {
            n.trigger("start_ruler")
        }),
        Mousetrap.bind(["h", "H"], function() {
            n.trigger("select_player", [e.player.uid, !0])
        }),
        Mousetrap.bind(["g", "G"], function() {
            n.trigger("show_screen", "intel")
        }),
        Mousetrap.bind(["s", "S"], function() {
            n.trigger("show_screen", "star_dir")
        }),
        Mousetrap.bind(["f", "F"], function() {
            n.trigger("show_screen", "fleet_dir")
        }),
        Mousetrap.bind(["l", "L"], function() {
            n.trigger("show_screen", "leaderboard")
        }),
        Mousetrap.bind(["c", "C"], function() {
            n.trigger("show_screen", "combat_calculator")
        }),
        Mousetrap.bind(["n", "N"], function() {
            n.trigger("show_screen", "compose")
        }),
        Mousetrap.bind(["i", "I"], function() {
            n.trigger("show_screen", "inbox")
        }),
        Mousetrap.bind(["o", "O"], function() {
            n.trigger("show_screen", "options")
        }),
        Mousetrap.bind(["t", "T"], function() {
            n.trigger("show_screen", "tech")
        }),
        Mousetrap.bind(["r", "R"], function() {
            n.trigger("show_screen", "tech")
        }),
        Mousetrap.bind(["left"], function() {
            n.trigger("key_left")
        }),
        Mousetrap.bind(["right"], function() {
            n.trigger("key_right")
        }),
        Mousetrap.bind(["down"], function() {
            e.defaultFleetOrderOverride = 2
        }, "keydown"),
        Mousetrap.bind(["down"], function() {
            e.defaultFleetOrderOverride = 0
        }, "keyup"),
        Mousetrap.bind(["up"], function() {
            e.defaultFleetOrderOverride = 1
        }, "keydown"),
        Mousetrap.bind(["up"], function() {
            e.defaultFleetOrderOverride = 0
        }, "keyup"),
        e.selectionModifier = !1,
        Mousetrap.bind(["alt"], function() {
            e.selectionModifier = !0
        }, "keydown"),
        Mousetrap.bind(["alt"], function() {
            e.selectionModifier = !1
        }, "keyup"),
        jQuery(window).blur(function() {
            e.selectionModifier = !1
        }),
        Mousetrap.bind(["b", "B"], n.toggleColourBlindHelp),
        Mousetrap.bind(["u"], function() {
            window.location.href = document.getElementsByTagName("canvas")[0].toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream")
        }),
        e.movieMode && (Mousetrap.bind(["down"], function(e) {
            n.smoothScroll(e, 1)
        }),
        Mousetrap.bind(["up"], function(e) {
            n.smoothScroll(e, -1)
        })),
        Mousetrap.bind("esc", function() {
            n.trigger("hide_screen"),
            n.trigger("cancel_fleet_orders"),
            n.trigger("end_ruler")
        }),
        e.interfaceSettings.audio && n.on("play_sound", n.onPlaySound),
        n.on("select_player", n.onSelectPlayer),
        n.on("select_player_pre_join", n.onSelectPlayerPreJoin),
        n.on("select_player_for_gift", n.onSelectPlayerForGift),
        n.on("select_player_for_gift_selected", n.onSelectPlayerForGiftSelected),
        n.on("select_player_for_premium_gift", n.onSelectPlayerForPremiumGift),
        n.on("select_player_for_premium_gift_selected", n.onSelectPlayerForPremiumGiftSelected),
        n.on("select_star", n.onSelectStar),
        n.on("show_star", n.onShowStar),
        n.on("select_fleet", n.onSelectFleet),
        n.on("show_fleet_path", n.onShowFleetPath),
        n.on("show_star_uid", n.onShowStarUid),
        n.on("show_star_screen_uid", n.onShowStarScreenUid),
        n.on("show_fleet_uid", n.onShowFleetUid),
        n.on("show_fleet_screen_uid", n.onShowFleetScreenUid),
        n.on("show_player_uid", n.onShowPlayerUid),
        n.on("show_your_empire", n.onShowYourEmpire),
        n.on("join_game", n.onJoinGame),
        n.on("leave_game", n.onLeaveGame),
        n.on("upgrade_economy", n.onUpgradeEconomy),
        n.on("upgrade_industry", n.onUpgradeIndustry),
        n.on("upgrade_science", n.onUpgradeScience),
        n.on("bulk_upgrade", n.onBulkUpgrade),
        n.on("buy_warp_gate", n.onBuyWarpGate),
        n.on("destroy_warp_gate", n.onDestroyWarpGate),
        n.on("abandon_star", n.onAbandonStar),
        n.on("declare_war", n.onDeclareWar),
        n.on("request_peace", n.onRequestPeace),
        n.on("unrequest_peace", n.onUnRequestPeace),
        n.on("accept_peace", n.onAcceptPeace),
        n.on("star_dir_upgrade_e", n.onStarDirectoryEconomy),
        n.on("star_dir_upgrade_i", n.onStarDirectoryIndustry),
        n.on("star_dir_upgrade_s", n.onStarDirectoryScience),
        n.on("star_dir_row_hilight", n.onStarDirectoryRowHHilight),
        n.on("share_tech", n.onShareTech),
        n.on("send_money", n.onSendMoney),
        n.on("give_star", n.onGiveStar),
        n.on("buy_gift", n.onBuyGift),
        n.on("toggle_fleet_nav_eta_detail", n.onToggleFleetNavEtaDetail),
        n.on("select_gather_all_ships", n.onSelectAndGatherAllShips),
        n.on("gather_all_ships", n.onGatherAllShips),
        n.on("award_karma", n.onAwardKarma),
        n.on("ship_transfer", n.onShipTransfer),
        n.on("new_fleet", n.onNewFleet),
        n.on("map_clicked", n.onMapClicked),
        n.on("map_middle_clicked", n.onMapMiddleClicked),
        n.on("reset_edit_mode", n.onResetEditMode),
        n.on("edit_waypoint_keyboard", n.onEditWaypointKeyboard),
        n.on("start_edit_waypoints", n.onStartEditWaypoints),
        n.on("add_waypoint", n.onAddWaypoint),
        n.on("remove_waypoint", n.onRemoveWaypoint),
        n.on("clear_waypoints", n.onClearWaypoints),
        n.on("submit_fleet_orders", n.onSubmitFleetOrders),
        n.on("submit_fleet_orders_edit", n.onSubmitFleetOrdersEdit),
        n.on("submit_fleet_orders_test_loop", n.onSubmitFleetOrdersTestLoop),
        n.on("loop_submit_fleet_orders", n.onLoopSubmitFleetOrders),
        n.on("cancel_fleet_orders", n.onCancelFleetOrders),
        n.on("loop_fleet_orders", n.onLoopFleetOrders),
        n.on("loop_fleet_orders_off", n.onLoopFleetOrdersOff),
        n.on("start_quick_upgrade", n.onStartQuickUpgrade),
        n.on("end_quick_upgrade", n.onEndQuickUpgrade),
        n.on("start_ruler", n.onStartRuler),
        n.on("reset_ruler", n.onResetRuler),
        n.on("end_ruler", n.onEndRuler),
        n.on("change_research", n.onChangeResearch),
        n.on("change_research_next", n.onChangeResearchNext),
        n.on("star_dir_sort", n.onStarDirSort),
        n.on("star_dir_filter", n.onStarDirFilter),
        n.on("fleet_dir_sort", n.onFleetDirSort),
        n.on("fleet_dir_filter", n.onFleetDirFilter),
        n.on("ship_dir_sort", n.onShipDirSort),
        n.on("ship_dir_filter", n.onShipDirFilter),
        n.on("rename_fleet", n.onRenameFleet),
        n.on("rename_star", n.onRenameStar),
        n.on("show_help", n.onShowHelp),
        n.on("one_second_tick", n.onOneSecondTick),
        n.on("turn_ready", n.onTurnReady),
        n.on("restore_conceded_player", n.onRestoreConcededPlayer),
        n.on("browse_to", n.onBrowseTo),
        n.on("intel_selection_change", n.onIntelSelectionChange),
        n.on("intel_player_filter_change", n.onIntelPlayerFilterChange),
        n.on("intel_player_filter_all", n.onIntelPlayerFilterAll),
        n.on("intel_player_filter_none", n.onIntelPlayerFilterNone),
        n.on("intel_request", n.onRequestIntelData),
        n.on("show_intel", n.onShowIntel),
        n.on("server_request", n.onServerRequest),
        n.on("order:post_join_game", n.onPostJoinGame),
        n.on("order:post_leave_game", n.onPostLeaveGame),
        n.on("order:new_fleet", n.onNewFleetResponse),
        n.on("order:full_universe", n.onFullUniverse),
        n.on("order:ok", n.onOK),
        n.on("order:redirect", n.onBrowseTo),
        n.on("order:player_achievements", n.onNewPlayerAchievements),
        n.on("order:intel_data", n.onIntelDataRecieved),
        n.on("order:error", n.onError),
        n.on("order:api_code", n.onAPICode),
        window.addEventListener("unload", n.onUnloaded, !1),
        window.addEventListener("pagehide", n.onUnloaded, !1),
        n
    }
}(),
!NeptunesPride)
    var NeptunesPride = {};
if (function() {
    "use strict";
    NeptunesPride.templates = {
        special_warning: "",
        neptunes_pride_title: "Neptune's Pride 2",
        question: "?",
        reset: "Reset",
        empire_overview: "Empire",
        galaxy: "Galaxy",
        leaderboard: "Leaderboard",
        options: "Options",
        inbox: "Inbox",
        help: "Help",
        help_index: "Help Index",
        game_options: "Game Options",
        exit_game: "Exit Game",
        new_game: "New Game",
        edit_path: "Edit Waypoints",
        game_not_started: "Awaiting Players",
        game_over: "<h2>GAME OVER!</h2>Congratulations to the winner!",
        true_alias: "True Alias: [[alias]]",
        research: "Research",
        intel: "Intel",
        carrier: "Carrier",
        no_intel_data: "Data Pending",
        warning: "Warning",
        premium_features: "Premium Features",
        premium_features_fleet_body: "Premium players may give carriers unique names.<br>Read more about <a onclick=\"Crux.crux.trigger('browse_to', 'http://np.ironhelmet.com/#buy_premium')\">Premium Membership</a>.",
        premium_features_star_body: "Premium players may give stars unique names.<br>Read more about <a onclick=\"Crux.crux.trigger('browse_to', 'http://np.ironhelmet.com/#buy_premium')\">Premium Membership</a>.",
        rename_fleet_body: "Rename this Carrier",
        rename_star_body: "Rename this Star",
        notification_bad_alias: "Your commanders name must unique and have between 3 and 16 standard characters. (A-Z, a-z, 0-9)",
        notification_bad_fleet_star_name: "Fleet and star names must unique, must not be numbers only, and have between 3 and 24 standard characters.<br>(A-Z, a-z, 0-9)",
        warning_premium_players_only: "This game is reserved for premium players.",
        warning_password: "This game requires a password to join.",
        select_star_to_upgrade: "Select a star in your empire to upgrade.",
        ruler_toolbar_heading: "Ruler",
        ruler_toolbar_eta: "ETA: [[eta]]",
        ruler_toolbar_range: "Range: [[range]]ly",
        ruler_toolbar_tech: "Tech Level: [[hs]]",
        total_with_gates: "ETA Warp Speed: [[gateEta]]",
        total_without_gates: "ETA Base Speed: [[gateEta]]",
        address_warning: "Warning: shares a network address with [[aliases]].<br>You should assume they are allies.",
        server_communication_error: "Error Contacting Server.<br>Please hit reload or try again later.",
        failed_order: "Error Processing Order.<br>Please hit reload to refresh your games data.",
        failed_order_must_be_logged_in: "Opps, looks like your login has expired. <br> Please visit the <a href='/'>home page</a> to login again.",
        failed_order_free_player_max_games: "Free players may only join 2 games at once.<br>Read more about the benefits of a <a href='/#buy_premium'>Premium Membership</a>",
        failed_order_premium_players_only: "This game is reserved for premium players.<br>Read more about the benefits of a <a href='/#buy_premium'>Premium Membership</a>",
        failed_order_player_defeated: "Looks like you are no longer in this game.<br>You may have been defeated, resigned<br>or been away too long.<br><a href='/#join_game'>Jump into a new game now!</a>",
        failed_order_game_is_full: "Oops. Looks like this game is already full. You gotta be quick!<br>Please return to the lobby and choose another game.",
        failed_order_last_seat_reserved_for_creator: "The games creator has not yet joined this game.<br>The last seat is always reserved for the game creator.<br>Please return to the lobby and try again.",
        failed_order_blocked_player: "You many not join this game.<br> You may have joined previously and left, or you may have been kicked by the games admin.",
        failed_order_bad_alias: "Your commanders name must unique and have between 3 and 16 standard characters. (A-Z, a-z, 0-9) <a onclick=\"Crux.crux.trigger('show_screen', 'join')\">Click here try again.</a>",
        failed_order_players_real_alias: "Your commanders name in use as another players<br>real identity. <a onclick=\"Crux.crux.trigger('show_screen', 'join')\">Click here try again.</a>",
        failed_order_alias_in_use: "Your commanders name in use in this game.<br><a onclick=\"Crux.crux.trigger('show_screen', 'join')\">Click here try again.</a>",
        failed_order_starting_position_filled: "Oops. Looks like that seat was just taken.<br><a onclick=\"Crux.crux.trigger('show_screen', 'join')\">Click here try again.</a>",
        failed_order_wrong_password: "Oops. That's not the correct password.<br><a onclick=\"Crux.crux.trigger('show_screen', 'join')\">Click here to try again.</a>",
        failed_order_no_alias: "Oops. Looks like you don't have an alias yet.<br><a href='http://np.ironhelmet.com'>Click here to return to the main menu.</a><br>",
        failed_order_verified_email_required: "You must verify your email before you can join this game.<br>Check your Inbox for a verification link. <br><br>You can resend the verification email from your account settings page from the main menu.",
        failed_order_gift_for_self_not_allowed: "Sorry, you can't buy badges for yourself. ",
        leave_game: "Leave Game",
        leave_game_body: "This game has not started",
        accept_victory: "Accept Victory",
        accept_victory_body: "You are the last player and winning",
        concede_defeat: "Concede Defeat",
        concede_defeat_body: "Place your empire in AI Administration",
        restore_player: "Restore Player",
        restore_player_select_body: "Select a player that has been dropped or kicked from the game to restore.",
        join: "Join",
        join_game_title: "Welcome",
        join_game_paused: "This game is paused and will start when full.",
        afk_player_list: "Empires that have been kicked for inactivity:<br>[[names]]",
        this_game_has_started: "This game has been started by the game's creator.",
        game_full: "This game is full!<br>Please return to the main menu and try again.",
        options_title: "Options",
        game_admin: "Game Admin",
        game_admin_another_player: "As admin of this game<b> [[player]] </b>may pause the game or jump ahead in 6 hour blocks.",
        game_admin_none: "<p>When you create your own password protected game you can jump ahead in 6 hour blocks or pause the game.</p><p>Create a game where the production times are best for you and your friends, or even create a turn-based game.</p>",
        jump_1_hour: "Jump 1 Tick",
        jump_6_hours: "Jump 6 Ticks",
        jump_12_hours: "Jump 12 Ticks",
        force_turn: "Force Turn",
        toggle_pause: "Toggle Pause",
        force_start: "Force Start",
        "interface": "Interface",
        map_graphics: "Map Graphics",
        pin_menu: "Pin Menu",
        infrastructure: "Infrastructure",
        audio: "Audio",
        player_names: "Names on Map",
        upgrade_costs: "Upgrade Costs",
        ui_pos: "UI Position",
        API: "API",
        external_api_intro: "This API code will allow third party apps scan your galaxy. Only give this code to those you trust!",
        code_x: "API Code: [[x]]",
        generate: "Generate",
        new_api_code: "New API Code<br><br><h2>[[note]]</h2><br>A third party application can access<br>your game data with this code.",
        buy_galaxy_screen: "Galaxy Screen",
        main_menu: "Main Menu",
        min: "Min",
        max: "Max",
        defence_forces: "Defence Forces",
        weapon_skill: "Weapon Skill",
        bulk_upgrade_heading: "Bulk Infrastructure Upgrade",
        bulk_upgrade_intro: "Select an amount of money to spend and the kind of infrastructure you would like to buy. The cheapest infrastructure will be purchased throughout your empire.",
        buy_cheapest: "Buy Cheapest",
        map: "Map",
        map_intro: "Select a zoom level at which text appears on the map.",
        zoom_ship_count: "Ship Count",
        zoom_star_names: "Star Names",
        zoom_star_inf: "Infrastructure",
        zoom_star_player_names: "Player Names",
        default_action: "Default Action",
        default_amount: "Default Amount",
        sure_you_want_to_leave_game: "Are you sure you want to leave this game?<br><br><b> WARNING, WARNING, WARNING </b><br> You will not be able to rejoin this game in future.",
        sure_you_want_to_submit_turn: "Are you sure you want to submit your turn?<br>When everybody has submitted a turn the game will jump forward and a new turn will begin.",
        submit_turn: "Submit Turn",
        submitted: "Submitted",
        turn_deadline: "Turn Due: [[time]]",
        missed_turns: "Turns Missed: [[turns]] of 6<br>Please hit submit when you are ready.",
        warning_not_in_game: "You have not yet joined this game. <a onclick=\"Crux.crux.trigger('show_screen', 'join')\">Click here to join.</a>",
        error_title: "Error",
        error_body: "Opps, looks like there has been an error of some kind. Sorry about that!<br>Please refresh your browser to see if the problem can be easily corrected.<br><br>[[errorMessage]]",
        error_button: "OK",
        select_player_for_gift: "Select the player you would like to buy a gift for:",
        buy_premium_leaderboard: "<div class='pad12'>Support Neptune's Pride and buy a <a onclick=\"Crux.crux.trigger('browse_to', 'http://np.ironhelmet.com/#buy_premium')\">Premium Membership!</a></div> <a onclick=\"Crux.crux.trigger('browse_to', 'http://np.ironhelmet.com/#buy_premium')'><img src='../images/joingame_07.jpg'></a>",
        buy_badge_leaderboard: "<div class='pad12'>Reward good players and buy them a<br><a onclick=\"Crux.crux.trigger('select_player_for_gift\")'>Badge of Honor</a> or <a onclick=\"Crux.crux.trigger('select_player_for_premium_gift')\">Premium Membership!</a></div> <img src='../images/badges/lionheart.png'> <img src='../images/badges/badass.png'> <img src='../images/badges/strategic.png'> <img src='../images/badges/cheesy.png'>",
        go_premium_today: "Go Premium Today!",
        not_today_thanks: "No Thanks",
        nag_body_0: "Please show your support for Neptune's Pride and upgrade to a Premium Account.",
        nag_body_1: "Less drop-outs and tougher opponents!",
        nag_body_2: "Help us keep Neptune's Pride Ad free!",
        nag_body_3: "Even the most ruthless pirates upgrade to Premium.",
        nag_body_4: "Surrounded by rouges, scoundrels and bloodthirsty pirates?",
        nag_body_5: "Show your support for Neptune's Pride!",
        regard_enemy: "ENEMY ([[x]])<br>This AI player has a low regard for your empire and will attack if given the opportunity.",
        regard_neutral: "NEUTRAL ([[x]])<br>This AI player is neutral towards your empire.",
        regard_ally: "FRIENDLY ([[x]])<br>This AI player has a high regard for your empire and will trade given the opportunity.",
        regard_footer: "You can send technology or $[[x]] to improve your relationship with this empire. ",
        galactic_credit_balance: "Galactic Credits:  [[x]]",
        x_credits: "[[x]] Credits",
        need_credits: "You must buy credits from the store before you can reward this player with a badge!",
        buy_credits: "Buy Credits",
        buy_now: "Buy Now",
        badges: "Badges",
        badges_body: "Buy this player a <a onclick=\"Crux.crux.trigger('show_screen', 'buy_gift')\">Badge of Honor</a> or <a onclick=\"Crux.crux.trigger('show_screen', 'buy_premium_gift')\">Premium Membership!</a>",
        badges_none: "No Badges Yet!",
        gift_heading: "Player Honors",
        gift_intro: "<h3>A tough opponent or loyal ally?</h3>Buy [[player]] a Badge of Honour!",
        badge_honour: "Badge of Honor",
        badge_tourney_win: "Tournament Winner",
        badge_tourney_join: "Tournament Participant",
        badge_badass: "Badass",
        badge_cheesy: "Cheese",
        badge_command: "Sentinel",
        badge_conquest: "Conquest",
        badge_empire: "Empire",
        badge_flambeau: "Flambeau",
        badge_gun: "Quick Draw ",
        badge_ironborn: "Ironborn",
        badge_lifetime: "Lifetime Premium Player",
        badge_lionheart: "Lionheart",
        badge_lucky: "Lucky Devil",
        badge_magic: "Magic!",
        badge_merit: "Merit",
        badge_nerd: "Top Ally",
        badge_pirate: "Cutthroat Pirate",
        badge_proteus: "Proteus Winner",
        badge_rat: "Lab Rat",
        badge_rebel: "Rebel Badge",
        badge_science: "Mad Scientist",
        badge_strange: "Strange One",
        badge_strategic: "Strategist",
        badge_toxic: "Toxic",
        badge_wizard: "Wizard",
        badge_wolf: "Wolf",
        badge_wordsmith: "Wordsmith",
        gift_desc_nerd: "<h3>Top Ally - 1 Credit</h3><p>For no other reason than that you enjoyed your game with this player.</p>",
        gift_desc_science: "<h3>Mad Scientist - 1 Credit</h3><p>For those who love the feel of a lab coat against the skin. Reward those who claim galactic dominance by pushing their research teams to the limit!</p>",
        gift_desc_command: "<h3>Sentinel - 1 Credit</h3><p>Some players are always watching, just waiting for you to make that one crucial mistake. Why not buy that player who never seems to sleep the sentinel badge?</p>",
        gift_desc_gun: "<h3>Quick Draw - 1 Credit</h3><p>For the player who shoots first and asks questions later. Whether they deliver a hammer blow or are massacred, such a bold move deserves some recognition.</p>",
        gift_desc_ironborn: "<h3>Ironborn - 2 Credits</h3><p>Hard places breed hard men, and hard men rule the world. Award this badge to the Ironborn of Neptune's Pride.</p>",
        gift_desc_strange: "<h3>Strange One - 2 Credits</h3><p>We all seek to anticipate our opponents’ moves, but sometimes their actions defy all predictions. Why not buy them this badge to show them how confused you are by their judgements.</p>",
        gift_desc_toxic: "<h3>Toxic - 10 Credits</h3><p>Some players just make your blood boil. Vent your spleen and label them toxic.</p>",
        gift_desc_badass: "<h3>Dead Set Badass - 1 Credit</h3><p>Buy this badge for the toughest opponents. Let other players be warned, this player shows a level of commitment that goes above and beyond.</p>",
        gift_desc_lionheart: "<h3>Lionheart - 1 Credit</h3><p>Buy this badge for players who show great courage in the face of adversity, holding on against all odds to support the alliance in victory!</p>",
        gift_desc_cheesy: "<h3>Slice of Cheese - 1 Credit</h3><p>Done something you're not proud of? Buy your victims a slice of cheese. The perfect way to say sorry. </p>",
        gift_desc_strategic: "<h3>Master Strategist - 1 Credit</h3><p>This badge is for players who had a plan and executed it with aplomb. Be they allies or enemies, some players deserve a little recognition for their achievements.</p>",
        gift_desc_lucky: "<h3>Lucky Devil - 2 Credits</h3><p>Great tactics, awesome strategy, or just one lucky son-of-a-gun. Buy this badge for the player whose stars were aligned and warp gates engaged. You won't be so lucky next time!</p>",
        gift_desc_wordsmith: "<h3>Wordsmith - 2 Credits</h3><p>This badge is for the players who breathe life and flavor into the game with their commitment to roleplaying. Good show chaps!</p>",
        gift_desc_pirate: "<h3>Cutthroat Pirate - 5 Credits</h3><p>In the treacherous universe of Neptune's Pride, it's a fine line between good and evil. Buy this badge for the players who tread this line with grace and mastery.</p>",
        gift_desc_wolf: "<h3>The Wolf - 5 Credits</h3><p>Buy this badge as a warning to all, this player is not as soft and fluffy as they look.</p>",
        gift_desc_merit: "<h3>Merit Badge - 1 Credit</h3><p>Reward the good deeds of a fellow player with a merit badge!</p>",
        gift_desc_trek: "<h3>Trekkie Badge - 1 Credit</h3><p>Reward those that go where no man has gone before.</p>",
        gift_desc_rebel: '<h3>Rebel Badge - 1 Credit</h3><p>"Do. Or do not. There is no try."</p>',
        gift_desc_empire: '<h3>Empire Badge - 1 Credit</h3><p>"I find your lack of faith disturbing"</p>',
        gift_premium_intro: "<h3>A tough opponent or loyal ally?</h3>Buy [[player]] a Premium Account!",
        gift_premium_heading: "Premium Gifts",
        gift_desc_lifetime: "<h3>Lifetime Premium - 48 Credits</h3><p>The ultimate reward, make this player a premium player for life.</p>",
        gift_desc_12_month: "<h3>12 Month Premium - 24 Credits</h3><p>You'll have all year for a chance at revenge with this premium gift.</p>",
        gift_desc_3_month: "<h3>3 Month Premium - 12 Credits</h3><p>Want to see this player get serious? Three months of playing the big leagues should see if they have what it takes.</p>",
        gift_desc_1_month: "<h3>1 Month Premium - 5 Credits</h3><p>Raise your beer and say cheers!<br>Give this player a month of premium.</p>",
        gift_premium_footer: "<p>Buying premium time for a player who is already premium will extend their current account.</p><p>Lifetime Premium accounts do not stack, but players receive a badge for each one they have.</p>",
        buy_item_button: "<form action='https://www.paypal.com/cgi-bin/webscr' method='post'> <input type='hidden' name='item_name' value='[[item_name]]'> <input type='hidden' name='amount' value='[[amount]]'> <input type='hidden' name='custom' value='[[custom]]'> <input type='hidden' name='return' value='http://np.ironhelmet.com/paypal_success'> <input type='hidden' name='cancel_return' value='http://np.ironhelmet.com/paypal_cancel'> <input type='hidden' name='notify_url' value='http://np.ironhelmet.com/paypal_ipn'> <input type='hidden' name='cmd' value='_xclick'> <input type='hidden' name='business' value='paypal@ironhelmet.com'> <input type='hidden' name='lc' value='AU'> <input type='hidden' name='currency_code' value='USD'> <input type='hidden' name='button_subtype' value='services'> <input type='hidden' name='no_note' value='1'> <input type='hidden' name='no_shipping' value='1'> <input type='hidden' name='rm' value='2'> <input type='hidden' name='bn' value='PP-BuyNowBF:btn_buynowCC_LG.gif:NonHosted'> <input type='image' src='/images/buynow2.png' border='0' name='submit' alt='PayPal - The safer, easier way to pay online.' style='width:144px; height:40px'> </form>",
        notification_gift_purchase: "Thanks for rewarding great players <br> and supporting the game!",
        attention: "Attention",
        achievements: "Achievements",
        rank: "Rank",
        renown: "Renown",
        award_renown: "Award 1 Renown",
        victories: "Victories",
        games_complete: "Games Complete",
        renown_points_remaining: "[[rp]] Renown to distribute.",
        reply: "Reply",
        empire: "Empire",
        player: "Player",
        premium_player: "Premium Player",
        lifetime_premium_player: "Lifetime Premium Player",
        ai_admin: "AI Administration",
        strength: "Strength",
        economy: "Economy",
        science: "Science",
        warp_gate: "Warp Gate",
        has_warp_gate: "This star has a Warp Gate. <a onclick=\"Crux.crux.trigger('show_help', 'gates')\">Read More</a>.",
        warp_gate_body_without: "Buy a Warp Gate to accelerate carrier movement. <a onclick=\"Crux.crux.trigger('show_help', 'gates')\">Read More</a>.",
        warp_gate_body_with: "This star has a Warp Gate to accelerate carrier movement. <a onclick=\"Crux.crux.trigger('show_help', 'gates')\">Read More</a>.",
        destroy_gate: "Destroy Gate",
        sure_you_want_to_buy_warpgate: "Are you sure you want to buy a Warp Gate<br>at [[star_name]] for $[[cost]]?<br>",
        sure_you_want_to_destroy_warpgate: "Are you sure you want to destroy the Warp Gate<br>at [[star_name]]?<br>",
        technology: "Technology",
        tech: "Tech",
        industry: "Industry",
        ships: "Ships",
        fleets: "Carriers",
        stars: "Stars",
        active: "Active",
        research_now: "Researching Now:",
        research_next: "Research Next:",
        quick_upgrade: "Quick Upgrade",
        unavailable_this_game: "Not Available",
        triton_codex: "The Triton Codex",
        first_time_player: "First Time Player? Watch a short <a onclick=\"Crux.crux.trigger('show_help', 'index')\">Tutorial Video.</a>",
        delete_game: "Delete Game",
        are_you_sure: "Are You Sure?",
        ok: "OK",
        sure_you_want_bulk_upgrade: "Are you sure you want to spend $[[amount]] buying [[localised_kind]] throughout your empire.",
        notification_bulk_upgrade: "You have purchased [[amount]] points of [[localised_kind]] throughout your empire.",
        sure_you_want_to_delete: "Are you sure you want to delete this game?<br>There is no Undo. There are no backups!<br><br>The game will be immediately removed from the active game list of all participating players.",
        sure_you_want_to_concede_defeat: "Are you sure you want to concede defeat in this game?<br>",
        natural_resources: "Natural Resources:",
        terraformed_resources: "Terraformed Resources:",
        your_level: "Your Level",
        home_star: "Home Star",
        total_economy: "Total Economy",
        total_science: "Total Science",
        total_industry: "Total Industry",
        total_cash: "Total Credits",
        total_strength: "Total Strength",
        total_ships: "Total Ships",
        total_fleets: "Total Carriers",
        new_ships: "New Ships",
        formal_alliance: "Formal Alliance",
        alliance: "Alliance",
        war_at_peace: "Allied to this player.",
        war_declare_war_button: "Declare War",
        war_unrequest_peace_button: "Cancel Request",
        war_at_war: "At war with this player.",
        war_request_peace_button: "Request Alliance for $150",
        war_peace_requested: "Has requested an alliance.",
        war_accept_peace_button: "Join Alliance",
        war_requested_peace: "You have requested an alliance.",
        war_count_down: "War declared: Alliance will end in [[time]].",
        confirm_request_peace: "Are you sure you want to spend $150 to request an alliance with this player?<br><br>Allies cannot capture each others stars.<br>Allies share scanning data<br>24 Ticks notice must be given before ending an Alliance.",
        confirm_accept_peace: "Are you sure you want to accept this players offer of an alliance?<br><br>Allies cannot capture each others stars.<br>Allies share scanning data.<br>24 Ticks notice must be given before ending an Alliance.",
        confirm_declare_war: "Are you sure you want to end your alliance with this player?",
        confirm_trade_tech: "Are you sure you want to send <br>[[alias]] <br>[[tech]] Tech for $[[price]] Credits?",
        your_economy: "Your Economy",
        your_science: "Your Science",
        your_industry: "Your Industry",
        your_cash: "Your Credits",
        your_strength: "Your Strength",
        you: "You",
        yours: "Yours",
        your_empire: "Your Empire",
        home_system: "Home Star",
        cash: "Credits",
        next_pay: "Next Pay",
        total_stars: "Total Stars",
        resources: "Resources",
        star_strength: "Star Strength",
        navigation: "Navigation",
        total_defenses: "Total Defenses",
        upgrade_for_x: "Buy for $[[cost]]",
        carrier_body: "Buy a carrier to transport ships through hyperspace. <a onclick=\"Crux.crux.trigger('show_help', 'fleets')\">Read More.</a>",
        abandon_star_body: "Abandon this star for another player to claim. <a onclick=\"Crux.crux.trigger('show_help', 'stars')\">Read More.</a>",
        sure_you_want_to_abandon_star: "<p>Are you sure you want to abandon [[star_name]].</p><p>It's Economy, Industry and Science will remain, but all ships at this star will be destroyed.</p>",
        abandon_star: "Abandon Star",
        new_fleet: "Build Carrier",
        building_fleet_costs_25: "Building a new carrier cost $25",
        new_fleet_for_25: "Build Carrier for $25",
        new_carrier: "New Carrier",
        edit_fleet_order: "Edit Fleet Order",
        delay: "Delay",
        destination: "Destination",
        action: "Action",
        eta: "ETA",
        show_eta: "<a onclick=\"Crux.crux.trigger('toggle_fleet_nav_eta_detail')\">Show Eta</a>",
        show_action: "<a onclick=\"Crux.crux.trigger('toggle_fleet_nav_eta_detail')\">Show Action</a>",
        target_star_unscanned: "Destination not in scanning range.",
        do_nothing: "Do Nothing",
        collect_all_ships: "Collect All Ships",
        drop_all_ships: "Drop All Ships",
        collect_x_ships: "Collect [[amount]] Ships",
        drop_x_ships: "Drop [[amount]] Ships",
        collect_all_but_x_ships: "Collect all but [[amount]] Ships",
        drop_all_but_x_ships: "Drop all but [[amount]] Ships",
        garrison_star_x: "Garrison with [[amount]] Ships",
        edit_fleet_order_link: "<a onclick=\"Crux.crux.trigger('show_screen', ['edit_order', {order:[[index]], fleet:[[fuid]] }])\">Edit</a>",
        looping_enabled: "Looping: Enabled",
        looping_disabled: "Looping: Disabled",
        confirm_auto_loop: "Would you like to loop these carrier orders?",
        yes: "Yes",
        no: "No",
        enable_looping: "Enable Looping",
        disable_looping: "Disable Looping",
        edit_waypoints: "Edit Waypoints",
        ships_per_hour: "This star builds [[sph]] ships [[tr]].",
        too_many_ships: "This star has more than 100 times its Natural Resources in ships in orbit and has stopped production.",
        orbiting_fleets: "Orbiting Carriers",
        x_avaliable: "$[[cash]] Available",
        add_waypoint: "Add",
        remove_waypoint: "Remove",
        clear_all: "Clear All",
        rename: "Rename",
        orbiting: "Orbiting: [[orbiting]]",
        path: "Waypoints: [[path]]",
        path_empty: "Waypoints: None.",
        path_unknown: "Waypoints: Unknown.",
        total_eta: "ETA: [[etaFirst]] ([[eta]])",
        total_eta_single: "ETA: [[etaFirst]]",
        set_star: "Set Star",
        set_all: "Set All",
        gather_all_ships: "Gather All Ships",
        scanning: "Scanning",
        propulsion: "Propulsion",
        weapons: "Weapons",
        view: "View",
        new_message: "New Message",
        unread_comments: "Unread Comments",
        select: "Select",
        select_player: "Select Player",
        your_research: "Your Research",
        compose_select_player_body: "Select a player to add to the list of recipients for your message.",
        compose_footer: "Dread Pirate or Robot Overlord? We love roleplaying <br> but please avoid bad language and cheating allegations.",
        dispatch_spy: "Dispatch Spy for $[[cost]]",
        current_research_eta: "Current Research ETA:",
        tech_summary: "Research Progress",
        tech_weapons: "Weapons",
        tech_banking: "Banking",
        tech_manufacturing: "Manufacturing",
        tech_terraforming: "Terraforming",
        tech_propulsion: "Hyperspace Range",
        tech_scanning: "Scanning",
        tech_research: "Experimentation",
        tech_description_weapons: "Ships deal X damage each round of combat where X is weapons tech level.",
        tech_description_banking: "At the end of each production cycle you earn an additional X*$75 where X is banking tech level.",
        tech_description_manufacturing: "A star produces Y*(X+5) ships [[pr]] where X is your manufacturing tech level and Y is the amount of industry at a star.",
        tech_description_terraforming: "All your stars natural resources are improved to (X*5)+Y where X terraforming level tech and Y is the stars natural state.",
        tech_description_propulsion: "Carriers may make hyperspace jumps up to X+3 light years where X is hyperspace range tech level.",
        tech_description_scanning: "Stars may scan the infrastructure and strength of enemy carriers and stars up to X+2 light years where X is scanning tech level.",
        tech_description_research: "At the end of each production cycle your scientists will conduct experiments that will unlock X*72 points of research in a random technology where X is your experimentation tech level.",
        trade: "Trade",
        trade_scan_required: "This game requires players to have a star in scanning range before you can trade with them.",
        trade_tech_body: "Give this player Technology. (Costs $[[cost]] per tech level)",
        trade_money_body: "Give this player Credits. (You have $[[amount]])",
        trade_star_body: "Give this player a Star. (You must have more than them)",
        share_tech: "Share Technology",
        send_money: "Send Money",
        give_star: "Gift Star",
        sure_you_want_to_send_star: "Are you sure you want to give this player<br>[[starName]]<br>Any carriers at the star will also be transfered.",
        combat_calculator: "Combat Calculator",
        fight: "Fight",
        defender_weapon_tech: "Defender Weapon Technology",
        defender_defense_tech: "Defender Orbital Defenses Technology",
        defender_exp_level: "Defender Experience Level",
        defender_ships: "Defender Ships",
        defender_ships_bonus: "Defender Bonus",
        attacker_weapon_tech: "Attacker Weapon Technology",
        attacker_exp_level: "Attacker Experience Level",
        attacker_ships: "Attacker Ships",
        combat_calc_win_attack: "Attacker Wins with [[as]] ships remaining.",
        combat_calc_win_defend: "Defender Wins with [[ds]] ships remaining.",
        combat_calc_no_combat: "Without ships there will be no combat.",
        total_defense: "Total Defenses",
        resources_body: "A stars natural resources dictate how cheap it is to build Economy, Industry and Science in the system.",
        my_star: "A star under your command.",
        enemy_star: "This star is controlled by &nbsp;[[colourBox]][[hyperlinkedAlias]].",
        unscanned_enemy: "This star is controlled by &nbsp;[[colourBox]][[hyperlinkedAlias]].<br>It's outside your scanning range.",
        cloaked_enemy: "This star is controlled by &nbsp;[[colourBox]][[hyperlinkedAlias]] and they using Jamming Technology to hide from your Scanners.<br>Improve your Scanning Technology to overcome their jammers.",
        unclaimed_star: "This star has not been claimed by any faction.<br>Send a carrier here to claim it for yourself.",
        unscanned_star: "This star is outside your scanning range. Send a carrier here to explore it and claim it for yourself!",
        my_fleet: "A carrier under your command.<br>Give it orders to capture more stars!",
        enemy_fleet: "An enemy carrier under the command of [[colourBox]][[hyperlinkedAlias]]",
        submit_fleet_orders: "Submit",
        inspector_info_player: "Credits: $[[cash]] &nbsp;&nbsp;&nbsp;&nbsp; Production: [[nextProduction]]",
        inspector_info_player_paused: "Credits: $[[cash]] &nbsp;&nbsp;&nbsp;&nbsp; Paused",
        inspector_info: "Production in [[nextProduction]]",
        pending_orders: "Pending Orders: [[count]] ([[seconds]]s)",
        leaderboard_heading: "Be the first to capture [[victory]] of [[totalStars]] Stars.<br>Galactic Cycle [[productions]] - Tick [[tick]]<br>",
        leaderboard_open: "There are [[open]] positions to fill before this game can start!<br>",
        x_stars: "[[count]] Stars",
        paused: "Paused",
        loading: "Loading",
        open_player_position: "Open Player Position",
        simple_social: "<div class='txt_center pad12'> Invite your friends and take on the Galaxy together!<br> </div> <div class='center' style='width:156px; height:48pcx'> <a target='_blank' href='https://plus.google.com/share?url=http://np.ironhelmet.com/game/[[game_number]]'><img width='48px' height='48px' src='../images/social/fc-webicon-googleplus.svg'></a> <a target='_blank' href='https://facebook.com/sharer.php?u=http://np.ironhelmet.com/game/[[game_number]]'><img width='48px' height='48px' src='../images/social/fc-webicon-facebook.svg'></a> <a target='_blank' href='https://twitter.com/share?text=Join%20me%20in%20this%20game%20of%20Neptune&#39;s%20Pride:&amp;url=http://np.ironhelmet.com/game/[[game_number]]'><img width='48px' height='48px' src='../images/social/fc-webicon-twitter.svg'></a> </div> <div class='txt_center pad12 txt_selectable'> Send them this address!<br> <em>[[url]]</em> </div>",
        simple_social_game_over: "<div class='txt_center pad12'> Tell your friends about this game!<br> </div> <div class='center' style='width:156px; height:48pcx'> <a target='_blank' href='https://plus.google.com/share?url=http://np.ironhelmet.com/'><img width='48px' height='48px' src='../images/social/fc-webicon-googleplus.svg'></a> <a target='_blank' href='https://facebook.com/sharer.php?u=http://np.ironhelmet.com/'><img width='48px' height='48px' src='../images/social/fc-webicon-facebook.svg'></a> <a target='_blank' href='https://twitter.com/share?text=NP2:%20Triton:&amp;url=http://np.ironhelmet.com/'><img width='48px' height='48px' src='../images/social/fc-webicon-twitter.svg'></a> </div>",
        jump_in_a_new_game: "<a href='/#join_game'>Jump into a new game now!</a>",
        this_game_has_custom_settings: "<a onclick=\"Crux.crux.trigger('show_screen', 'custom_settings')\">Review This Game's Custom Settings</a>",
        tbg_settings: "Turn Based Game. [[deadline]] Hour Deadline. [[jump]] Hour Jumps",
        select_avatar_heading: "<p>Select an Avatar to use in this game.</p>",
        avatar_description_38: "<h2>Neo Sapians</h2><p>Supposedly descended from apes, these late comers to the intergalactic congress are familiar with all types of advanced technologies. Having contributed little as a race and with no special talents to speak of, they are expert generalists.</p>",
        avatar_description_33: "<h2>Formoculus</h2><p>Having transcended the confines of emotions millennia ago, the Formoculus quickly discovered the answer to the universe, and it had a dollar sign. Masters of banking and finance, it is rumored the second eye is always on your wallet.</p>",
        avatar_description_34: "<h2>Limaxians</h2><p>Words, wits, and womanly wiles. Revered for their beauty by many races, all negotiations and trade are carried out by the female Limaxians, and they know how to get what they want.</p>",
        avatar_description_32: "<h2>Lapidex</h2><p>Millennia of advanced industrialization have caused the Lapidex to develop a hard exoskeleton. They are workers through and through, with an empire built on the hardened backs of its people.</p>",
        avatar_description_36: "<h2>Ignadiums</h2><p>The Ignadiums do not take prisoners, unless they are to further their research. They have an advanced knowledge of other races, which they use to destroy them swiftly and precisely.</p>",
        avatar_description_50: "<h2>Huldrakal</h2><p>Swift and silent, the Huldrakal ships are rarely matched for speed or elegance. Rumor has it that the ships of the Huldrakal are propelled by more than advanced technology.</p>",
        avatar_description_31: "<h2>Mantids</h2><p>Like the creatures themselves, the Mantids seem to have eyes all over space. Their vision is so far-reaching, it seems that sometimes they know your next move before you do.</p>",
        avatar_description_26: "<h2>Order of Lolga</h2><p>The brethren of the Order of Lolga have devoted their lives to the pursuit of truth. Though highly secretive, it is said that they need not sleep, nor food, and that they lust only for knowledge.</p>",
        avatar_description_30: "<h2>Anurians</h2><p>The Anurians have strong ties to the land. When engaged in interstellar missions, they always transport large vats of Anurian mud, which they soak in for at least six hours a day.</p>",
        avatar_description_44: "<h2>Insectorgs</h2><p>The origins of the Insectorgs are unknown. At first there were a few hundred, perhaps some misguided experiment. But now, their numbers are too many to count. They can construct anything from materials they scavenge, even more of themselves.</p>",
        avatar_description_23: "<h2>Carchurians</h2><p>The Carchurians are warriors, proud and strong. Masters of combat and destruction, they are yet to learn that interstellar conquest doesn't always belong to the race with the biggest guns.</p>",
        avatar_description_16: "<h2>Varulfur</h2><p>Sharing their origins with the Neo Sapians, the Varulfur are ridiculed for their primitive appearance, particularly by their self-proclaimed 'more evolved' cousins. Nevertheless, the Varulfur are masters of robotics and cybernetics.</p>",
        avatar_description_999: "<h2>Create your own!</h2><p>Use your favorite Avatar and role-play your own unique alien species.</p><p>Send diplomatic messages in character and make the game more fun for everybody!</p>",
        select_avatar: "<a onclick=\"Crux.crux.trigger('select_avatar','[[index]]')\">Select</a>",
        join_game_ppo: "This race requires a <a onclick=\"Crux.crux.trigger('browse_to', 'http://np.ironhelmet.com/#buy_premium')\">Premium Membership</a>!",
        choose_location_heading: "Select a colour and starting location. <br>(Step 3 of 3)",
        choose_alias_heading: "Select a name for your commander in chief.<br>(Step 2 of 3)",
        choose_alias_body: "<p>Choose a new alias every game and play anonymously.<br>Every great story needs both heroes and villains.<br>Which will you be?</p>",
        choose_alias_rules: "Your alias must be between 3 and 24 characters and can only contain standard characters.",
        choose_avatar_heading: "Select an alien race to play.<br>(Step 1 of 3)",
        choose_password_heading: "Password Required",
        choose_password_body: "The creator of this game has set a password.",
        custom_settings: "Custom Game Settings",
        custom_settings_intro: "As creator of this game, [[creator]] may have made changes to the default configuration. Please review the games settings.",
        custom_settings_intro_no_admin: "This game has custom settings. Please review before joining.",
        custom_settings_intro_standard: "This game uses standard settings.",
        cgs_players: "Players",
        cgs_starsForVictory: "Stars For Victory",
        cgs_starsForVictory_25: "25% of all Stars",
        cgs_starsForVictory_33: "33% of all Stars",
        cgs_starsForVictory_50: "50% of all Stars",
        cgs_starsForVictory_66: "66% of all Stars",
        cgs_playerType: "Player Type",
        cgs_playerType_0: "All Players",
        cgs_playerType_1: "Premium Players Only",
        cgs_alliances: "Formal Alliances",
        cgs_alliances_0: "Disabled",
        cgs_alliances_1: "Enabled",
        cgs_anonymity: "Anonymity",
        cgs_anonymity_1: "Extra",
        cgs_anonymity_0: "Normal",
        cgs_turnBased: "Turn Based",
        cgs_turnBased_0: "Off",
        cgs_turnBased_1: "On",
        cgs_tickRate: "Tick Rate",
        cgs_tickRate_120: "Slow (2 Hours)",
        cgs_tickRate_60: "Normal (1 Hour)",
        cgs_tickRate_30: "Double (30 Mins)",
        cgs_tickRate_15: "Quad (15 Mins)",
        cgs_turnJumpTicks: "Tick to Jump Each Turn",
        cgs_turnJumpTicks_1: "1 Tick Jumps",
        cgs_turnJumpTicks_3: "3 Tick Jumps",
        cgs_turnJumpTicks_6: "6 Tick Jumps",
        cgs_turnJumpTicks_8: "8 Tick Jumps",
        cgs_turnJumpTicks_12: "12 Tick Jumps",
        cgs_turnJumpTicks_24: "24 Tick Jumps",
        cgs_turnTime: "Turn Deadline",
        cgs_turnTime_1: "1 Hour",
        cgs_turnTime_6: "6 Hours",
        cgs_turnTime_8: "8 Hours",
        cgs_turnTime_10: "10 Hours",
        cgs_turnTime_12: "12 Hours",
        cgs_turnTime_18: "18 Hours",
        cgs_turnTime_24: "24 Hours",
        cgs_turnTime_48: "48 Hours",
        cgs_buildGates: "Build Warp Gates",
        cgs_buildGates_0: "Disabled",
        cgs_buildGates_1: "Cheap",
        cgs_buildGates_2: "Expensive",
        cgs_randomGates: "Random Warp Gates",
        cgs_randomGates_0: "Disabled",
        cgs_randomGates_1: "Rare",
        cgs_randomGates_2: "Common",
        cgs_darkGalaxy: "Dark Galaxy",
        cgs_darkGalaxy_0: "Disabled",
        cgs_darkGalaxy_1: "Enabled",
        cgs_darkGalaxy_2: "Dark Start Only",
        cgs_starfield: "Starfield",
        cgs_starfield_hexgrid: "Hexgrid",
        cgs_starfield_circular: "Circular",
        cgs_starfield_mega_circle: "Mega Circle",
        cgs_starfield_mega_grid: "Mega Grid",
        cgs_starfield_custom: "Custom",
        cgs_starScatter: "Star Scatter",
        cgs_starScatter_random: "Random",
        cgs_starScatter_twin_ring: "Twin Ring",
        cgs_starsPerPlayer: "Stars Per Player",
        cgs_starsPerPlayer_8: "8 Stars, Very Small",
        cgs_starsPerPlayer_16: "16 Stars, Small",
        cgs_starsPerPlayer_24: "24 Stars, Medium",
        cgs_starsPerPlayer_32: "32 Stars, Large",
        cgs_starsPerPlayer_48: "48 Stars, Very Large",
        cgs_starsPerPlayer_64: "64 Stars, Epic",
        cgs_homeStarDistance: "Home Star Distance",
        cgs_homeStarDistance_2: "Close",
        cgs_homeStarDistance_3: "Medium",
        cgs_homeStarDistance_4: "Far",
        cgs_homeStarDistance_5: "Very Far",
        cgs_homeStarDistance_6: "Epic",
        cgs_naturalResources: "Natural Resources",
        cgs_naturalResources_1: "Sparse",
        cgs_naturalResources_2: "Standard",
        cgs_naturalResources_3: "Plentiful",
        cgs_startingStars: "Starting Stars",
        cgs_startingCash: "Starting Credits",
        cgs_startingCash_250: "$250",
        cgs_startingCash_500: "$500",
        cgs_startingCash_1000: "$1000",
        cgs_startingCash_1500: "$1500",
        cgs_startingCash_2000: "$2000",
        cgs_startingCash_2500: "$2500",
        cgs_startingCash_3000: "$3000",
        cgs_startingShips: "Starting Ships Per Star",
        cgs_startingShips_0: "0 Ships",
        cgs_startingShips_10: "10 Ships",
        cgs_startingShips_50: "50 Ships",
        cgs_startingShips_100: "100 Ships",
        cgs_startingInfEconomy: "Starting: Economy",
        cgs_startingInfIndustry: "Starting: Industry",
        cgs_startingInfScience: "Starting: Science",
        cgs_developmentCostEconomy: "Cost: Economy",
        cgs_developmentCostIndustry: "Cost: Industry",
        cgs_developmentCostScience: "Cost: Science",
        cgs_developmentCost_1: "Cheap",
        cgs_developmentCost_2: "Standard",
        cgs_developmentCost_4: "Expensive",
        cgs_researchCostBanking: "Cost: Banking",
        cgs_researchCostExperimentation: "Cost: Experimentation",
        cgs_researchCostHyperspace: "Cost: Hyperspace",
        cgs_researchCostManufacturing: "Cost: Manufacturing",
        cgs_researchCostScanning: "Cost: Scanning",
        cgs_researchCostWeapons: "Cost: Weapons",
        cgs_researchCostTerraforming: "Cost: Terraforming",
        cgs_researchCost_0: "None",
        cgs_researchCost_1: "Cheap",
        cgs_researchCost_2: "Normal",
        cgs_researchCost_3: "Expensive",
        cgs_researchCost_4: "Very Expensive",
        cgs_researchCost_5: "Crazy Expensive",
        cgs_startingTechBanking: "Starting: Banking",
        cgs_startingTechExperimentation: "Starting: Experimentation",
        cgs_startingTechHyperspace: "Starting: Hyperspace",
        cgs_startingTechManufacturing: "Starting: Manufacturing",
        cgs_startingTechScanning: "Starting: Scanning",
        cgs_startingTechWeapons: "Starting: Weapons",
        cgs_startingTechTerraforming: "Starting: Terraforming",
        cgs_startingTech: "Level",
        cgs_tradeCost: "Trade Cost",
        cgs_tradeCost_5: "Cheap 5$/Level",
        cgs_tradeCost_15: "Standard 15$/Level",
        cgs_tradeCost_25: "Expensive 25$/Level",
        cgs_tradeCost_50: "Very Expensive 50$/Level",
        cgs_tradeScanned: "Trade Scanned",
        cgs_tradeScanned_1: "Enabled",
        cgs_tradeScanned_0: "Disabled",
        cgs_productionTicks: "Production Ticks",
        cgs_productionTicks_16: "16 Ticks",
        cgs_productionTicks_18: "18 Ticks",
        cgs_productionTicks_20: "20 Ticks",
        cgs_productionTicks_22: "22 Ticks",
        cgs_productionTicks_24: "24 Ticks",
        cgs_productionTicks_28: "28 Ticks",
        cgs_productionTicks_30: "30 Ticks",
        cgs_productionTicks_32: "32 Ticks",
        save: "Save",
        save_edit: "Save &amp; Edit",
        cancel: "Cancel",
        build_fleet: "Build Carrier for $25",
        new_fleet_body: "Build a new Fleet Carrier to transport your ships through hyperspace. It costs $25 to build a new Fleet Carrier.",
        new_fleet_name: "New Fleet Name",
        none: "None",
        less: "Less",
        more: "More",
        all: "All",
        back: "Back",
        next: "Next",
        read_all: "Mark All Read",
        level: "Level",
        level_x: "Level [[x]]",
        exp: "Exp",
        progress: "Progress",
        now: "Now",
        declare_war: "Declare War",
        request_peace: "Request Peace",
        accept_peace: "Accept Peace",
        inbox_c: "Inbox ([[count]])",
        diplomacy: "Diplomacy",
        diplomacy_c: "Diplomacy ([[count]])",
        events: "Events",
        events_c: "Events ([[count]])",
        event_header: "Click an event to mark it as read.",
        inbox_load_older_comments: "<a onclick=\"Crux.crux.trigger('find_older_comments')\">Load Older Comments</a>",
        filter_show_mine: "<a onclick=\"Crux.crux.trigger('star_dir_filter','my_stars')\">Show My Stars Only</a>",
        filter_show_all: "<a onclick=\"Crux.crux.trigger('star_dir_filter','all_stars')\">Show All Stars</a>",
        filter_show_mine_fleets: "<a onclick=\"Crux.crux.trigger('fleet_dir_filter','my_fleets')\">Show My Carriers Only</a>",
        filter_show_all_fleets: "<a onclick=\"Crux.crux.trigger('fleet_dir_filter','all_fleets')\">Show All Carriers</a>",
        filter_show_mine_ships: "<a onclick=\"Crux.crux.trigger('ship_dir_filter','my_ships')\">Show My Ships Only</a>",
        filter_show_all_ships: "<a onclick=\"Crux.crux.trigger('ship_dir_filter','all_ships')\">Show All Ships</a>",
        ship_transfer: "Ship Transfer",
        transfer: "Transfer",
        ship_transfer_body: "While in orbit of a star you may move ships to and from a fleet Carrier. It's free to transfer ships.",
        transfer_close: "Transfer &amp; Close",
        transfer_dispatch: "Transfer &amp; Dispatch",
        tech_intro: "Each point of science on your stars contributes 1 point of research [[tr]] towards your chosen technology.",
        research_next_body: "Select a technology to switch to once the current research topic is complete.",
        fromto: "From:<br>To:",
        loading_comments: "Loading Comments",
        no_messages: "No Messages",
        comment: "[[message]]",
        post_comment: "Post Comment",
        message_event_ai_chat_enemy_of_enemy: "<p>[[aiColour]][[aiAlias]] says:<br>The enemy of my enemy is my friend.",
        message_event_war_declared: "<p>[[attackerColour]][[attackerAlias]] has declared war on [[defenderColour]][[defenderAlias]].</p>",
        message_event_production: "<p>A galactic cycle is complete. You have received<b> $[[economy]] </b>from your economic infrastructure and<b> $[[banking]] </b>from your banking technology.</p>",
        message_event_production_new: "<p>A galactic cycle is complete. You have received<b> $[[economy]] </b>from your economic infrastructure and<b> $[[banking]] </b>from your banking technology</p> <p>Your experimental scientists have stumbled across a new discovery which has unlocked <b>[[tech_points]] points</b> of research in the field of <b>[[localised_tech_name]]</b>.</p>",
        message_event_production_new_no_tech: "<p>A galactic cycle is complete. You have received<b> $[[economy]] </b>from your economic infrastructure and<b> $[[banking]] </b>from your banking technology.</p>",
        message_event_star_given_giver: "<em>[[creationTime]]</em><br>You have given the star [[display_name]] to [[receiverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[receiverUid]]')\">[[receiverName]].</a>",
        message_event_star_given_receiver: "<em>[[creationTime]]</em><br>You have received the star [[display_name]] from [[giverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[giverUid]]' )\">[[giverName]].</a>",
        message_event_shared_technology_giver: "<em>[[creationTime]]</em><br>You have shared a level of<b> [[display_name]] </b>technology with [[receiverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[receiverUid]]' )\">[[receiverName]].</a>",
        message_event_shared_technology_receiver: "<em>[[creationTime]]</em><br>You have received a level of<b> [[display_name]] </b>technology from [[giverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[giverUid]]' )\">[[giverName]].</a>",
        message_event_peace_requested_giver: "You have paid $[[price]] to request a formal alliance from [[toColour]] [[toAlias]].",
        message_event_peace_requested_receiver: "[[fromColour]] [[fromAlias]] has paid $[[price]] to request a formal alliance of you. Visit [[fromAlias]]'s Empire Screen to accept this request.",
        message_event_peace_accepted_giver: "You have accepted a Formal Alliance request from [[toColour]] [[toAlias]].",
        message_event_peace_accepted_receiver: "[[fromColour]] [[fromAlias]] has accepted your formal alliance request.",
        message_event_shared_technology_giver_new: "<em>[[creationTime]]</em><br>You have paid $[[price]] to share <b>Level [[level]] [[display_name]] </b>technology with [[receiverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[receiverUid]]' )\">[[receiverName]].</a>",
        message_event_shared_technology_receiver_new: "<em>[[creationTime]]</em><br>[[giverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[giverUid]]' )\">[[giverName]] has paid $[[price]] to send you <b>Level [[level]] [[display_name]]</b> technology.</a>",
        message_event_money_giver: "<em>[[creationTime]]</em><br>You have sent $[[amount]] to [[receiverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[receiverUid]]' )\">[[receiverName]].</a>",
        message_event_money_receiver: "<em>[[creationTime]]</em><br>You have received $[[amount]] from [[giverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[giverUid]]' )\">[[giverName]].</a>",
        message_event_goodbye_to_player_inactivity: "[[colour]] [[name]] has been placed under AI Administration for inactivity.",
        message_event_goodbye_to_player_defeated: "[[colour]] [[name]] has been wiped from the galaxy!",
        message_event_goodbye_to_player: "[[colour]] [[name]] has conceded defeat! All remaining forces will be placed under AI Administration.",
        message_event_accept_victory: "[[colour]] [[name]] has claimed Victory. All hail the new Galactic Emperor.",
        message_event_combat_unscanned: "Your forces have engaged the enemy at [[name]].",
        message_event_combat_scanned: "Your forces have engaged the enemy at <a onclick=\"Crux.crux.trigger('show_star_uid', '[[uid]]')\">[[name]]</a>.",
        message_event_combat_players: "[[colour]] [[alias]] entered the battle with [[shipsStart]] Ships and has [[shipsEnd]] Ships remaining.",
        message_event_combat_end: "<p>As defender [[defender]] fought with a bonus +1 weapon tech. [[winner]] was victorious.</p>",
        message_event_combatmkii_end: "The defenders fought with +1 weapons technology.",
        message_event_combatmkii_loot: "[[alias]] captured the star and $[[loot]].",
        message_event_tech_up: "<p>Your scientists have made a breakthrough in the field of<b> [[tech_name]]. </b></p><p><em>[[tech_desc]]</em></p><p>View the <a onclick=\"Crux.crux.trigger('show_screen', 'tech')\">Science and Technology Screen</a> to review your research priorities.</p>",
        message_event_tech_up_exp: "<p>Your scientists have conducted a successful experiment which has added [[points]] research points to the field of<b> [[tech_name]]. </b></p><p>This may soon lead to new discoveries!</p>",
        message_event_tech_up_exp_disabled: "<p>Your scientists conducted successful experiments which conclusively proved that no advancement can be made in the field of<b> [[tech_name]] </b></p>",
        send: "Send",
        clear: "Clear"
    }
}(),
!NeptunesPride)
    var NeptunesPride = {};
if (function() {
    "use strict";
    NeptunesPride.SharedInterface = function(e) {
        e.BadgeIcon = function(e, t, r) {
            var n = Crux.Widget();
            return void 0 === r && (r = !1),
            r ? (Crux.Image("/images/badges_small/" + e + ".png", "abs").grid(.25, .25, 2.5, 2.5).roost(n),
            Crux.Clickable("show_screen", "buy_gift").grid(.25, .25, 2.5, 2.5).tt("badge_" + e).roost(n)) : (Crux.Image("/images/badges/" + e + ".png", "abs").grid(0, 0, 6, 6).roost(n),
            Crux.Clickable("show_screen", "buy_gift").grid(0, 0, 6, 6).tt("badge_" + e).roost(n)),
            t > 1 && !r && (Crux.Image("/images/badges/counter.png", "abs").grid(0, 0, 6, 6).roost(n),
            Crux.Text("", "txt_center txt_tiny", "abs").rawHTML(t).pos(51, 64).size(32, 32).roost(n)),
            n
        }
        ,
        e.groupBadges = function(e) {
            e || (e = "");
            var t, r = {};
            for (t = e.length - 1; t >= 0; t--) {
                var n = e.charAt(t);
                r.hasOwnProperty(n) ? r[n] += 1 : r[n] = 1
            }
            return r
        }
        ,
        e.badgeFileNames = {
            A: "honour",
            B: "lifetime",
            C: "tourney_win",
            D: "tourney_join",
            E: "bullseye",
            F: "bullseye",
            G: "wolf",
            H: "pirate",
            I: "wordsmith",
            J: "lucky",
            K: "cheesy",
            L: "strategic",
            M: "badass",
            N: "lionheart",
            O: "ironborn",
            P: "gun",
            Q: "conquest",
            R: "command",
            S: "strange",
            T: "nerd",
            U: "magic",
            V: "toxic",
            W: "wizard",
            X: "rat",
            Y: "science",
            Z: "merit",
            1: "trek",
            2: "rebel",
            3: "empire",
            4: "proteus",
            5: "flambeau"
        },
        e.SharedBadges = function(t, r) {
            var n = Crux.Widget("rel col_base rel");
            n.size(480),
            Crux.Text("badges", "section_title col_black rel").size(480, 48).roost(n),
            Crux.IconButton("icon-help", "show_help", "badges").grid(27, 0, 3, 3).roost(n);
            var o = e.groupBadges(t);
            if ("" === t)
                Crux.Text("badges_none", "pad12 txt_center rel").size(480).roost(n);
            else {
                n.bg = Crux.Widget("rel").size(480).roost(n);
                var a, i, s = -6, l = .5;
                for (a in o)
                    i = o[a],
                    s += 6,
                    s > 26 && (l += 6,
                    s = -0),
                    e.BadgeIcon(e.badgeFileNames[a], i, !1).grid(s, l, 6, 6).roost(n.bg);
                n.bg.size(480, 16 * l + 96 + 16)
            }
            return r && Crux.Text("badges_body", "pad12 rel col_black").size(480).roost(n),
            n
        }
        ,
        e.SmallBadgeRow = function(t) {
            var r, n, o = Crux.Widget(""), a = e.groupBadges(t), i = 27, s = 15 / Object.keys(a).length;
            s > 2 && (s = 2);
            for (r in a)
                n = a[r],
                e.BadgeIcon(e.badgeFileNames[r], n, !0).grid(i, 0, 3, 3).roost(o),
                i -= s;
            return o
        }
        ,
        e.SharedAchievements = function(t) {
            var r = Crux.Widget("rel col_base").size(480, 144);
            return Crux.Text("achievements", "rel section_title col_black").size(480, 48).roost(r),
            Crux.IconButton("icon-help", "show_help", "achievements").grid(27, 0, 3, 3).roost(r),
            e.SharedAchievementsBody(t).roost(r),
            r
        }
        ,
        e.SharedAchievementsBody = function(e) {
            var t = Crux.Widget("rel col_base").size(480, 96);
            return Crux.BlockValueBig("victories", "icon-award-inline", e.games_won, "col_accent").grid(0, 0, 10, 6).roost(t),
            Crux.BlockValueBig("rank", "icon-star-inline", e.score, "col_base").grid(10, 0, 10, 6).roost(t),
            Crux.BlockValueBig("renown", "icon-heart-inline", e.karma, "col_accent").grid(20, 0, 10, 6).roost(t),
            t
        }
        ,
        e.CustomSettingsTable = function(e, t) {
            var r = Crux.Widget("rel");
            t && 0 === e.anonymity ? Crux.Text("custom_settings_intro", "pad12 col_accent txt_center rel").format({
                creator: t.hyperlinkedAlias
            }).roost(r) : e.non_default_settings.length ? Crux.Text("custom_settings_intro_no_admin", "pad12 col_accent txt_center rel").roost(r) : Crux.Text("custom_settings_intro_standard", "pad12 col_accent txt_center rel").roost(r);
            var n = 0
              , o = ""
              , a = ""
              , i = 0
              , s = ["-", "starsForVictory", "playerType", "alliances", "anonymity", "turnBased", "tickRate", "turnJumpTicks", "turnTime", "-", "buildGates", "randomGates", "darkGalaxy", "starfield", "starScatter", "-", "starsPerPlayer", "homeStarDistance", "naturalResources", "productionTicks", "-", "startingStars", "startingCash", "startingShips", "-", "startingInfEconomy", "startingInfIndustry", "startingInfScience", "-", "developmentCostEconomy", "developmentCostIndustry", "developmentCostScience", "-", "tradeCost", "tradeScanned", "-", "researchCostTerraforming", "researchCostExperimentation", "researchCostScanning", "researchCostHyperspace", "researchCostManufacturing", "researchCostBanking", "researchCostWeapons", "-", "startingTechTerraforming", "startingTechExperimentation", "startingTechScanning", "startingTechHyperspace", "startingTechManufacturing", "startingTechBanking", "startingTechWeapons"];
            e.turnBased ? s.splice(s.indexOf("tickRate"), 1) : (s.splice(s.indexOf("turnJumpTicks"), 1),
            s.splice(s.indexOf("turnTime"), 1));
            var l = "<table class='custom_settings'>";
            for (n = 0; n < s.length; n += 1)
                if (o = s[n],
                "-" !== o) {
                    i = e[o],
                    a = "startingTech" === o.substring(0, 12) ? Crux.localise("cgs_startingTech") + i : "researchCost" === o.substring(0, 12) ? Crux.localise("cgs_researchCost_" + i) : "developmentCost" === o.substring(0, 15) ? Crux.localise("cgs_developmentCost_" + i) : "startingInf" === o.substring(0, 11) ? i : "startingStars" === o ? i : "players" === o ? i : Crux.localise("cgs_" + o + "_" + i);
                    var c = "";
                    e.non_default_settings.indexOf(o) >= 0 && (c = "txt_warn_bad"),
                    l += "<tr><td>" + Crux.localise("cgs_" + o) + "</td><td class='" + c + "'>" + a + "</td></tr>"
                } else
                    l += "<tr><td class='col_black'></td><td class='col_black'></td></tr>";
            return l += "</table>",
            Crux.Text("", "rel col_base").size(480).rawHTML(l).roost(r),
            r
        }
    }
}(),
!Crux)
    var Crux = {};
!function() {
    "use strict";
    window.log = console.log.bind(console),
    Crux.gridSize = 16,
    Crux.regexNumbersOnly = new RegExp("[^0-9]","g"),
    Crux.Widget = function(e) {
        var t = {};
        return t.name = "",
        t.x = 0,
        t.y = 0,
        t.w = 0,
        t.h = 0,
        t.mum = null,
        t.children = [],
        t.handlers = [],
        t.ui = jQuery(document.createElement("div")),
        t.ui.addClass("widget"),
        t.ui.addClass(e),
        t.one = function(e, r, n) {
            return n || (n = Crux.crux),
            t.handlers.push({
                node: n,
                name: e,
                func: r
            }),
            n.ui.one(e, r),
            t
        }
        ,
        t.on = function(e, r, n) {
            return n || (n = Crux.crux),
            t.handlers.push({
                node: n,
                name: e,
                func: r
            }),
            n.ui.on(e, r),
            t
        }
        ,
        t.off = function() {
            var e;
            for (e = 0; e < t.handlers.length; e += 1)
                t.handlers[e].node.ui.off(t.handlers[e].name, t.handlers[e].func);
            return t.handlers = [],
            t
        }
        ,
        t.addChild = function(e) {
            return e.mum = t,
            t.children.push(e),
            t.ui.append(e.ui),
            t
        }
        ,
        t.removeChild = function(e) {
            var r, n = t.children.indexOf(e);
            if (0 > n)
                return log("Warning: attempting to remove child that is not a child."),
                void 0;
            for (r = e.children.length - 1; r >= 0; r--)
                e.removeChild(e.children[r]);
            return e.off(),
            e.preRemove(),
            e.ui.remove(),
            e.mum = null,
            t.children.splice(n, 1),
            t
        }
        ,
        t.roost = function(e) {
            return e.addChild(t),
            t.postRoost(),
            t
        }
        ,
        t.preRemove = function() {}
        ,
        t.postRoost = function() {}
        ,
        t.style = function(e) {
            return t.ui.attr("class", "widget " + e),
            t
        }
        ,
        t.addStyle = function(e) {
            return t.ui.addClass(e),
            t
        }
        ,
        t.removeStyle = function(e) {
            return t.ui.removeClass(e),
            t
        }
        ,
        t.pos = function(e, r) {
            return void 0 === e && void 0 === r ? (t.x = t.ui.position().left,
            t.y = t.ui.position().top,
            {
                x: t.x,
                y: t.y
            }) : (t.x = e,
            t.y = r,
            t.ui.css("left", e + "px"),
            t.ui.css("top", r + "px"),
            t)
        }
        ,
        t.size = function(e, r) {
            return void 0 === e && void 0 === r ? (t.w = t.ui.outerWidth(!0),
            t.h = t.ui.outerHeight(!0),
            {
                w: t.w,
                h: t.h
            }) : (e && (t.w = e,
            t.ui.css("width", e + "px")),
            r && (t.h = r,
            t.ui.css("height", r + "px")),
            t)
        }
        ,
        t.place = function(e, r, n, o) {
            return t.pos(e, r),
            void 0 !== n && void 0 !== o && t.size(n, o),
            t
        }
        ,
        t.grid = function(e, r, n, o) {
            return t.pos(e * Crux.gridSize, r * Crux.gridSize),
            void 0 !== n && void 0 !== o && t.size(n * Crux.gridSize, o * Crux.gridSize),
            t
        }
        ,
        t.nudge = function(e, r, n, o) {
            return t.x += e,
            t.y += r,
            t.ui.css("left", t.x + "px"),
            t.ui.css("top", t.y + "px"),
            t.w += n,
            t.h += o,
            t.ui.css("width", t.w + "px"),
            t.ui.css("height", t.h + "px"),
            t
        }
        ,
        t.inset = function(e) {
            return t.nudge(e, e, 2 * -e, 2 * -e),
            t
        }
        ,
        t.trigger = function(e, r) {
            return t.ui.trigger(e, r),
            t
        }
        ,
        t.hide = function() {
            return t.ui.css("display", "none"),
            t
        }
        ,
        t.show = function() {
            return t.ui.css("display", "block"),
            t
        }
        ,
        t.tt = function(e) {
            return t.ui.attr("title", Crux.localise(e)),
            t
        }
        ,
        t
    }
    ,
    Crux.addTransforms = function(e) {
        return e.tanimate = function(t, r, n, o, a) {
            return t = 1e3 * t,
            20 > t && (t = 20),
            window.setTimeout(function() {
                e.transition(r, n),
                e.transform(o)
            }, t),
            a && window.setTimeout(a, t + 1e3 * r),
            e
        }
        ,
        e.transition = function(t, r) {
            var n = ["ease", "ease-in", "ease-out", "ease-in-out", "linear"];
            if (n.indexOf(r) < 0)
                return console.log("invalid transition kind!"),
                e;
            var o = "all " + t + "s " + r;
            return e.ui.css({
                "-webkit-transition": o,
                transition: o
            }),
            e
        }
        ,
        e.transform = function(t) {
            void 0 !== t.x && (e.tx = t.x),
            void 0 !== t.y && (e.ty = t.y),
            void 0 !== t.z && (e.tz = t.z),
            void 0 !== t.sx && (e.tsx = t.sx),
            void 0 !== t.sy && (e.tsy = t.sy),
            void 0 !== t.sz && (e.tsz = t.sz),
            void 0 !== t.rx && (e.trx = t.rx),
            void 0 !== t.ry && (e.try = t.ry),
            void 0 !== t.rz && (e.trz = t.rz),
            void 0 !== t.ox && (e.tox = t.ox),
            void 0 !== t.oy && (e.toy = t.oy),
            void 0 !== t.s && (e.tsx = t.s,
            e.tsy = t.s),
            void 0 !== t.r && (e.trz = t.r);
            var r = "perspective(480px) translate3d(" + e.tx + "px," + e.ty + "px," + e.tz + "px) scale3d(" + e.tsx + "," + e.tsy + "," + e.tsz + ") rotateX(" + e.trx + "deg) rotateY(" + e.try + "deg) rotateZ(" + e.trz + "deg)"
              , n = e.tox + " " + e.toy;
            return e.ui.css({
                "-webkit-transform-origin": n,
                "transform-origin": n,
                "-webkit-transform": r,
                transform: r
            }),
            e
        }
        ,
        void 0 === e.tx && (e.tx = 0,
        e.ty = 0,
        e.tz = 0,
        e.tsx = 1,
        e.tsy = 1,
        e.tsz = 1,
        e.trx = 0,
        e.try = 0,
        e.trz = 0,
        e.tox = 0,
        e.toy = 0),
        e.transform({}),
        e
    }
    ,
    Crux.Clickable = function(e, t) {
        var r = Crux.Widget();
        return r.eventKind = e,
        r.eventData = t,
        r.enabled = !0,
        r.styleCurrent = "",
        r.styleDown = "",
        r.styleUp = "",
        r.styleDisabled = "",
        r.styleHover = "",
        r.ui.attr("tabindex", 0),
        r.configStyles = function(e, t, n, o) {
            return r.styleCurrent = e,
            r.styleUp = e,
            r.styleDown = t,
            r.styleHover = n,
            r.styleDisabled = o,
            r.ui.addClass(r.styleCurrent),
            r
        }
        ,
        r.configStyleUp = function(e) {
            return r.ui.removeClass(r.styleUp),
            r.styleCurrent = e,
            r.styleUp = e,
            r.ui.addClass(r.styleCurrent),
            r
        }
        ,
        r.setStyleState = function(e) {
            return r.enabled === !1 && (e = r.styleDisabled),
            r.styleHover && r.ui.removeClass(r.styleHover),
            r.ui.removeClass(r.styleCurrent),
            r.styleCurrent = e,
            r.ui.addClass(r.styleCurrent),
            r
        }
        ,
        r.click = function(e, t) {
            return r.eventKind = e,
            r.eventData = t,
            r
        }
        ,
        r.onClick = function() {
            r.eventKind && r.enabled && (r.trigger("play_sound", "click"),
            r.ui.trigger(r.eventKind, r.eventData))
        }
        ,
        r.onMouseUp = function(e) {
            r.enabled ? r.setStyleState(r.styleUp) : r.setStyleState(r.styleDisabled),
            r.onClick(),
            e.stopPropagation()
        }
        ,
        r.onMouseDown = function(e) {
            Crux.touchEnabled || (r.setStyleState(r.styleDown),
            r.ui.one("mouseup", r.onMouseUp),
            r.one("mouseup", r.onClickEnd),
            e.stopPropagation())
        }
        ,
        r.onMouseOver = function() {
            Crux.touchEnabled || r.styleHover && r.ui.addClass(r.styleHover)
        }
        ,
        r.onMouseOut = function() {
            Crux.touchEnabled || r.styleHover && r.ui.removeClass(r.styleHover)
        }
        ,
        r.onTouchUp = function(e) {
            r.scrollAtUp = jQuery(window).scrollTop(),
            Math.abs(r.scrollAtUp - r.scrollAtDown) < 16 && r.onClick(),
            r.onClickEnd(),
            e.stopPropagation()
        }
        ,
        r.onTouchDown = function(e) {
            r.scrollAtDown = jQuery(window).scrollTop(),
            r.setStyleState(r.styleDown),
            r.ui.one("touchend", r.onTouchUp),
            r.one("touchcancel", r.onClickEnd),
            e.stopPropagation()
        }
        ,
        r.onClickEnd = function() {
            r.enabled ? r.setStyleState(r.styleUp) : r.setStyleState(r.styleDisabled)
        }
        ,
        r.onKeydown = function(e) {
            r.ui.is(":focus") && 13 === e.which && (e.preventDefault(),
            r.onClick())
        }
        ,
        r.disable = function() {
            return r.enabled = !1,
            r.setStyleState(r.styleDisabled),
            r
        }
        ,
        r.enable = function(e) {
            return void 0 === e && (e = !0),
            e ? (r.enabled = !0,
            r.setStyleState(r.styleUp),
            r) : r.disable()
        }
        ,
        r.ui.on("keydown", r.onKeydown),
        r.ui.on("touchstart", r.onTouchDown),
        r.ui.on("mouseover", r.onMouseOver),
        r.ui.on("mouseout", r.onMouseOut),
        r.ui.on("mousedown", r.onMouseDown),
        r
    }
    ,
    Crux.Tab = function(e, t, r) {
        var n = Crux.Clickable(t, r);
        return n.addStyle("tab_button"),
        n.label = Crux.Text(e, "button_text").roost(n),
        n.widgetGrid = n.grid,
        n.grid = function(e, t, r, o) {
            return n.widgetGrid(e, t, r, o),
            n.nudge(6, 10, -12, -10),
            n
        }
        ,
        n.format = function(e) {
            return n.label.format(e),
            n
        }
        ,
        n.postRoost = function() {
            n.label.nudge(0, n.h / 2, n.w)
        }
        ,
        n.activate = function() {
            return n.addStyle("tab_button_active"),
            n
        }
        ,
        n
    }
    ,
    Crux.IconButton = function(e, t, r) {
        var n = Crux.Button("", t, r);
        return n.label.style(e + " txt_center icon_button").rawHTML(""),
        n.postRoost = function() {
            n.label.nudge(0, n.h / 2, n.w)
        }
        ,
        n
    }
    ,
    Crux.Button = function(e, t, r) {
        var n = Crux.Clickable(t, r);
        return n.addStyle("button"),
        n.configStyles("button_up", "button_down", "button_hover", "button_disabled"),
        n.label = Crux.Text(e, "button_text").roost(n),
        n.widgetGrid = n.grid,
        n.grid = function(e, t, r, o) {
            return n.widgetGrid(e, t, r, o),
            n.nudge(8, 8, -16, -16),
            n
        }
        ,
        n.update = function(e) {
            return n.label.update(e),
            n
        }
        ,
        n.format = function(e) {
            return n.label.format(e),
            n
        }
        ,
        n.postRoost = function() {
            n.label.nudge(0, n.h / 2, n.w)
        }
        ,
        n.rawHTML = function(e) {
            return n.label.rawHTML(e),
            n
        }
        ,
        n.onKeydown = function(e) {
            n.ui.is(":focus") && 13 === e.which && (e.preventDefault(),
            n.onClick())
        }
        ,
        n.on("keydown", n.onKeydown),
        n
    }
    ,
    Crux.DropDown = function(e, t, r, n) {
        var o, a, i = Crux.Widget();
        void 0 === n && (n = !1);
        var s = [];
        if (Array.isArray(t))
            s = t;
        else
            for (o in t)
                s.push([o, t[o]]);
        n && s.sort(function(e, t) {
            return e[1] < t[1] ? -1 : 1
        });
        for (var l = "", c = 0; c < s.length; c += 1) {
            var u = s[c];
            u[0] === e && (l = u[1])
        }
        i.addStyle("drop_down"),
        i.eventKind = r,
        i.label = Crux.Text("", "drop_down_text").rawHTML(l).roost(i),
        i.icon = Crux.Text("", "icon-down-open drop_down_icon").rawHTML(" ").roost(i);
        var d = "<select>"
          , p = ""
          , g = "";
        for (a = 0; a < s.length; a += 1)
            o = s[a][0],
            g = s[a][1],
            p = o === e ? "selected" : "",
            d += "<option value='" + o + "' " + p + ">" + g + "</option>";
        return d += "</select>",
        i.select = jQuery(d),
        i.ui.append(i.select),
        i.label.rawHTML(i.select.children("option:selected").text()),
        i.widgetGrid = i.grid,
        i.grid = function(e, t, r, n) {
            return i.widgetGrid(e, t, r, n),
            i.nudge(8, 8, -16, -16),
            i
        }
        ,
        i.onChange = function() {
            i.label.rawHTML(i.select.children("option:selected").text()),
            i.eventKind && i.ui.trigger(i.eventKind, i.select.val())
        }
        ,
        i.ui.change(i.onChange),
        i.getValue = function() {
            return i.select.val()
        }
        ,
        i.setValue = function(e) {
            i.select.val(e),
            i.label.rawHTML(i.select.children("option:selected").text())
        }
        ,
        i.postRoost = function() {
            i.label.nudge(8, i.h / 2, i.w),
            i.icon.place(i.w - 28, i.h / 2, 28, 28)
        }
        ,
        i.preRemove = function() {
            window.document.activeElement === i.select[0] && window.document.activeElement.blur()
        }
        ,
        i.onKeydown = function(e) {
            i.ui.is(":focus") && (13 === e.which || 38 === e.which || 40 === e.which) && i.select.focus()
        }
        ,
        i.on("keydown", i.onKeydown),
        i
    }
    ,
    Crux.Text = function(e, t) {
        var r = Crux.Widget();
        return t && r.style(t),
        r.update = function(e) {
            if (!isNaN(Number(e)))
                return r.ui.html(e),
                r;
            var t = Crux.templates[e];
            return t ? r.ui.html(t) : r.ui.html("'" + e + "'"),
            r
        }
        ,
        r.update(e),
        r.format = function(e) {
            return r.ui.html(Crux.format(r.ui.html(), e)),
            r
        }
        ,
        r.updateFormat = function(e, t) {
            return r.update(e),
            r.format(t),
            r
        }
        ,
        r.rawHTML = function(e) {
            return r.ui.html(e),
            r
        }
        ,
        r
    }
    ,
    Crux.Image = function(e, t) {
        var r = Crux.Widget();
        return void 0 === t && (t = ""),
        r.ui = jQuery(document.createElement("img")),
        r.ui.addClass("widget " + t),
        r.ui.attr("draggable", !1),
        e && r.ui.attr("src", e),
        r.ui[0].style.display = "none",
        r.ui.attr("onLoad", function() {
            r.ui[0].style.display = "inherit"
        }),
        r.src = function(e) {
            r.ui.attr("src", e)
        }
        ,
        r
    }
    ,
    Crux.BlockValue = function(e, t, r) {
        var n;
        return n = Crux.Widget(r),
        n.widgetGrid = n.grid,
        n.grid = function(e, t, r, o) {
            return n.widgetGrid(e, t, r, o),
            n.label.grid(0, 0, r, o),
            n.value.grid(0, 0, r, o),
            n
        }
        ,
        n.widgetSize = n.size,
        n.size = function(e, t) {
            return void 0 === e && void 0 === t ? n.widgetSize() : (n.widgetSize(e, t),
            n.label.size(e, t),
            n.value.size(e, t),
            n)
        }
        ,
        n.label = Crux.Text(e, "pad12").roost(n),
        n.value = Crux.Text("", "txt_right pad12").rawHTML(t).roost(n),
        n
    }
    ,
    Crux.BlockValueBig = function(e, t, r, n) {
        var o = Crux.Widget(n);
        return o.widgetGrid = o.grid,
        o.grid = function(e, t, r, n) {
            return o.widgetGrid(e, t, r, n),
            o.label.grid(0, 0, r, 3),
            o.value.grid(0, 3, r, 3),
            o
        }
        ,
        o.label = Crux.Text(e, "txt_center pad12").roost(o),
        o.value = Crux.Text("", t + " txt_center block_value_big_value").rawHTML(r).roost(o),
        o
    }
    ,
    Crux.TextInput = function(e, t, r, n) {
        var o;
        return o = Crux.Widget(),
        o.eventKind = t,
        o.type = "text",
        r && (o.type = r),
        o.pattern = "",
        n && (o.pattern = n),
        "single" == e && (o.node = jQuery("<input type='" + o.type + "' pattern = '" + o.pattern + "'class='text_area'></input>")),
        "multi" == e && (o.node = jQuery("<textarea class='text_area'></textarea>")),
        "number" === o.type && o.node.css("text-align", "center"),
        o.ui.append(o.node),
        o.ui.addClass("col_black rad4 text_area_border"),
        o.onChange = function(e) {
            o.numbersOnly === !0 && o.node.val(o.node.val().replace(Crux.regexNumbersOnly, "")),
            o.eventKind && o.ui.trigger(o.eventKind, o.eventData),
            13 === e.keyCode && o.onEnterEvent && o.trigger(o.onEnterEvent)
        }
        ,
        o.widgetGrid = o.grid,
        o.grid = function(e, t, r, n) {
            return o.widgetGrid(e, t, r, n),
            o.nudge(6, 6, -12, -12),
            o
        }
        ,
        o.setText = function(e) {
            return "number" === o.type && o.node.val(Number(e)),
            o.node.val(e),
            o
        }
        ,
        o.getText = function() {
            return "number" === o.type ? Number(o.node.val()) : o.node.val()
        }
        ,
        o.getValue = function() {
            return o.getText()
        }
        ,
        o.setValue = function(e) {
            return o.setText(e)
        }
        ,
        o.focus = function() {
            o.node.focus();
            var e = o.node[0].value.length;
            return o.node[0].selectionStart = e,
            o.node[0].selectionEnd = e,
            o
        }
        ,
        o.focus = function() {
            return window.setTimeout(function() {
                o.node[0].setSelectionRange(o.selectionStart, o.selectionEnd),
                o.node.focus()
            }, 1),
            o
        }
        ,
        o.insert = function(e) {
            o.selectionStart = o.node[0].selectionStart,
            o.selectionEnd = o.node[0].selectionEnd;
            var t = o.getText();
            " " !== t[o.selectionEnd] && (e += " "),
            " " !== t[o.selectionStart - 1] && (e = " " + e);
            var r = t.slice(0, o.selectionStart) + e + t.slice(o.selectionEnd);
            o.setText(r),
            o.selectionStart = o.selectionStart + e.length,
            o.selectionEnd = o.selectionStart,
            o.focus()
        }
        ,
        o.preRemove = function() {
            window.document.activeElement === o.node[0] && window.document.activeElement.blur()
        }
        ,
        o.node.on("keyup", o.onChange),
        o.node.on("change", o.onChange),
        o
    }
    ,
    Crux.anims = [],
    Crux.lastTick = (new Date).getTime(),
    Crux.tickCallbacks = [],
    Crux.frameCounter = [],
    Crux.drawReqired = !1,
    Crux.removeCompleteAnims = function() {
        var e;
        for (e = Crux.anims.length - 1; e > -1; e -= 1)
            Crux.anims[e].complete && (Crux.anims[e].completeCallback && Crux.anims[e].completeCallback(Crux.anims[e].target),
            Crux.anims.splice(Crux.anims.indexOf(Crux.anims[e]), 1))
    }
    ,
    Crux.killAnimsOf = function(e) {
        var t;
        for (t = 0; t < Crux.anims.length; t += 1)
            Crux.anims[t].target === e && (Crux.anims[t].complete = !0);
        Crux.removeCompleteAnims()
    }
    ,
    Crux.tickAnims = function(e) {
        var t = 0
          , r = 0;
        for (t = 0,
        r = Crux.anims.length; r > t; t += 1)
            Crux.anims[t].tick(e),
            Crux.drawReqired = !0;
        Crux.removeCompleteAnims()
    }
    ,
    Crux.createAnim = function(e, t, r, n, o, a) {
        var i = {};
        return i.target = e,
        i.property = t,
        i.start = r,
        i.end = n,
        i.duration = o,
        a || (a = {}),
        i.onFrame = a.onFrame ? a.onFrame : null,
        i.completeCallback = a.onComplete ? a.onComplete : null,
        a.onStart ? (i.startCallback = a.onStart,
        0 === i.delay && i.startCallback()) : i.startCallback = null,
        i.delay = a.delay ? a.delay : 0,
        i.ease = a.ease ? a.ease : Crux.easeInOutQuad,
        i.complete = !1,
        i.timeAcc = 0,
        i.target[i.property] = i.start,
        i.tick = function(e) {
            var t;
            return i.delay > e ? (i.delay -= e,
            void 0) : (i.delay > 0 && i.delay < e && (e -= i.delay,
            i.delay = 0,
            i.startCallback && i.startCallback()),
            i.timeAcc += e,
            t = i.ease(i.timeAcc, 0, 1, i.duration),
            i.target[i.property] = i.start + t * (i.end - i.start),
            i.onFrame && i.onFrame(),
            i.timeAcc >= i.duration && (i.complete = !0,
            i.target[i.property] = i.end),
            void 0)
        }
        ,
        Crux.anims.push(i),
        i
    }
    ,
    Crux.mainLoop = function(e) {
        var t, r = 0, n = 0;
        if (window.requestAnimationFrame(Crux.mainLoop),
        t = e - Crux.lastTick,
        Crux.lastTick = e,
        Crux.tickAnims(t),
        Crux.drawReqired)
            for (Crux.drawReqired = !1,
            r = 0; r < Crux.tickCallbacks.length; r += 1)
                Crux.tickCallbacks[r]();
        if (Crux.frameCounter.push(t),
        Crux.frameRate = 0,
        Crux.frameCounter.length >= 100) {
            for (r = 0,
            n = Crux.frameCounter.length; n > r; r += 1)
                Crux.frameRate += Crux.frameCounter[r];
            Crux.frameRate /= Crux.frameCounter.length,
            Crux.frameCounter = []
        }
    }
    ,
    Crux.easeInOutQuad = function(e, t, r, n) {
        return (e /= n / 2) < 1 ? r / 2 * e * e + t : -r / 2 * ((e -= 1) * (e - 2) - 1) + t
    }
    ,
    Crux.easeInQuad = function(e, t, r, n) {
        return r * (e /= n) * e + t
    }
    ,
    Crux.easeOutQuad = function(e, t, r, n) {
        return -r * (e /= n) * (e - 2) + t
    }
    ,
    Crux.easeInBounce = function(e, t, r, n) {
        return r - Crux.easeOutBounce(n - e, 0, r, n) + t
    }
    ,
    Crux.easeOutBounce = function(e, t, r, n) {
        return (e /= n) < 1 / 2.75 ? 7.5625 * r * e * e + t : 2 / 2.75 > e ? r * (7.5625 * (e -= 1.5 / 2.75) * e + .75) + t : 2.5 / 2.75 > e ? r * (7.5625 * (e -= 2.25 / 2.75) * e + .9375) + t : r * (7.5625 * (e -= 2.625 / 2.75) * e + .984375) + t
    }
    ,
    Crux.easeInOutBounce = function(e, t, r, n) {
        return n / 2 > e ? .5 * jQuery.easing.easeInBounce(2 * e, 0, r, n) + t : .5 * Crux.easeOutBounce(2 * e - n, 0, r, n) + .5 * r + t
    }
    ,
    Crux.formatTime = function(e, t, r) {
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
    }
    ,
    Crux.formatDate = function(e, t) {
        if (!(e instanceof Date))
            return "";
        if (isNaN(e.getDay()))
            return "";
        var r = ""
          , n = e.getDay();
        1 === n && (r += "Mon"),
        2 === n && (r += "Tue"),
        3 === n && (r += "Wed"),
        4 === n && (r += "Thu"),
        5 === n && (r += "Fri"),
        6 === n && (r += "Sat"),
        7 === n && (r += "Sun"),
        r += " ",
        r += e.getDate(),
        r += " ";
        var o = e.getMonth();
        return 0 === o && (r += "Jan"),
        1 === o && (r += "Feb"),
        2 === o && (r += "Mar"),
        3 === o && (r += "Apr"),
        4 === o && (r += "May"),
        5 === o && (r += "Jun"),
        6 === o && (r += "Jul"),
        7 === o && (r += "Aug"),
        8 === o && (r += "Sep"),
        9 === o && (r += "Oct"),
        10 === o && (r += "Nov"),
        11 === o && (r += "Dec"),
        r += " ",
        t && (r += e.getFullYear() + " "),
        r += e.getHours(),
        r += ":",
        e.getMinutes() <= 9 && (r += "0"),
        r += e.getMinutes(),
        r.trim()
    }
    ,
    Crux.format = function(e, t) {
        if (!e)
            return "error";
        var r, n, o, a, i;
        for (r = 0,
        n = 0,
        o = 0,
        a = "",
        i = ""; n >= 0 && 100 > r; )
            r += 1,
            n = e.search("\\[\\["),
            o = e.search("\\]\\]"),
            a = e.slice(n + 2, o),
            i = "[[" + a + "]]",
            e = void 0 !== t[a] ? e.replace(i, t[a]) : e.replace(i, "(" + a + ")");
        return e
    }
    ,
    Crux.localise = function(e) {
        return Crux.templates[e] ? Crux.templates[e] : "'" + e + "'"
    }
    ,
    Crux.formatLocalise = function(e, t) {
        var r = Crux.localise(e);
        return r = Crux.format(r, t)
    }
    ,
    Crux.toCamelCase = function(e) {
        return e.replace(/(\_[a-z])/g, function(e) {
            return e.toUpperCase().replace("_", "")
        })
    }
    ,
    Crux.toSnakeCase = function(e) {
        return e.replace(/([A-Z])/g, function(e) {
            return "_" + e.toLowerCase()
        })
    }
    ,
    Crux.snakeKeys = function(e) {
        var t, r;
        for (t in e)
            r = t,
            t = Crux.toSnakeCase(t),
            t != r && (e[t] = e[r],
            delete e[r]),
            "object" == typeof e[t] && Crux.snakeKeys(e[t])
    }
    ,
    Crux.camelKeys = function(e) {
        var t, r;
        for (t in e)
            r = t,
            t = Crux.toCamelCase(t),
            t != r && (e[t] = e[r],
            delete e[r]),
            "object" == typeof e[t] && Crux.camelKeys(e[t])
    }
    ,
    Crux.decodeObjectAsArray = function(e) {
        function t(e, r) {
            var n, o = {};
            for (n = 0; n < e.length; n += 1)
                "string" == typeof e[n] && (o[Crux.toCamelCase(e[n])] = r[n]),
                "object" == typeof e[n] && (o[e[n][0]] = t(e[n][1], r[n]));
            return o
        }
        var r, n, o, a = [], i = e.shift();
        for (r = 0,
        n = e.length; n > r; r += 1)
            e[r].length != i.length ? a.push(e[r]) : (o = t(i, e[r]),
            a.push(o));
        return a
    }
    ,
    Crux.init = function(e) {
        Crux.crux = Crux.Widget("crux"),
        jQuery(e).append(Crux.crux.ui),
        Crux.crux.onTouchDown = function() {
            Crux.touchEnabled = !0
        }
        ,
        Crux.crux.one("touchstart", Crux.crux.onTouchDown),
        document.crux = Crux.crux,
        Crux.mainLoop(0)
    }
}(),
function() {
    "use strict";
    var e, t = 0, r = ["ms", "moz", "webkit", "o"];
    for (e = 0; e < r.length && !window.requestAnimationFrame; e += 1)
        window.requestAnimationFrame = window[r[e] + "RequestAnimationFrame"],
        window.cancelAnimationFrame = window[r[e] + "CancelAnimationFrame"] || window[r[e] + "CancelRequestAnimationFrame"];
    window.requestAnimationFrame || (window.requestAnimationFrame = function(e) {
        var r = (new Date).getTime()
          , n = Math.max(0, 16 - (r - t))
          , o = window.setTimeout(function() {
            e(r + n)
        }, n);
        return t = r + n,
        o
    }
    ),
    window.cancelAnimationFrame || (window.cancelAnimationFrame = function(e) {
        clearTimeout(e)
    }
    )
}(),
String.prototype.trim || (String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "")
}
),
!function(e, t) {
    "object" == typeof module && "object" == typeof module.exports ? module.exports = e.document ? t(e, !0) : function(e) {
        if (!e.document)
            throw new Error("jQuery requires a window with a document");
        return t(e)
    }
    : t(e)
}("undefined" != typeof window ? window : this, function(e, t) {
    function r(e) {
        var t = e.length
          , r = et.type(e);
        return "function" === r || et.isWindow(e) ? !1 : 1 === e.nodeType && t ? !0 : "array" === r || 0 === t || "number" == typeof t && t > 0 && t - 1 in e
    }
    function n(e, t, r) {
        if (et.isFunction(t))
            return et.grep(e, function(e, n) {
                return !!t.call(e, n, e) !== r
            });
        if (t.nodeType)
            return et.grep(e, function(e) {
                return e === t !== r
            });
        if ("string" == typeof t) {
            if (st.test(t))
                return et.filter(t, e, r);
            t = et.filter(t, e)
        }
        return et.grep(e, function(e) {
            return X.call(t, e) >= 0 !== r
        })
    }
    function o(e, t) {
        for (; (e = e[t]) && 1 !== e.nodeType; )
            ;
        return e
    }
    function a(e) {
        var t = ht[e] = {};
        return et.each(e.match(gt) || [], function(e, r) {
            t[r] = !0
        }),
        t
    }
    function i() {
        Q.removeEventListener("DOMContentLoaded", i, !1),
        e.removeEventListener("load", i, !1),
        et.ready()
    }
    function s() {
        Object.defineProperty(this.cache = {}, 0, {
            get: function() {
                return {}
            }
        }),
        this.expando = et.expando + Math.random()
    }
    function l(e, t, r) {
        var n;
        if (void 0 === r && 1 === e.nodeType)
            if (n = "data-" + t.replace(vt, "-$1").toLowerCase(),
            r = e.getAttribute(n),
            "string" == typeof r) {
                try {
                    r = "true" === r ? !0 : "false" === r ? !1 : "null" === r ? null : +r + "" === r ? +r : xt.test(r) ? et.parseJSON(r) : r
                } catch (o) {}
                yt.set(e, t, r)
            } else
                r = void 0;
        return r
    }
    function c() {
        return !0
    }
    function u() {
        return !1
    }
    function d() {
        try {
            return Q.activeElement
        } catch (e) {}
    }
    function p(e, t) {
        return et.nodeName(e, "table") && et.nodeName(11 !== t.nodeType ? t : t.firstChild, "tr") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
    }
    function g(e) {
        return e.type = (null !== e.getAttribute("type")) + "/" + e.type,
        e
    }
    function h(e) {
        var t = Rt.exec(e.type);
        return t ? e.type = t[1] : e.removeAttribute("type"),
        e
    }
    function f(e, t) {
        for (var r = 0, n = e.length; n > r; r++)
            _t.set(e[r], "globalEval", !t || _t.get(t[r], "globalEval"))
    }
    function m(e, t) {
        var r, n, o, a, i, s, l, c;
        if (1 === t.nodeType) {
            if (_t.hasData(e) && (a = _t.access(e),
            i = _t.set(t, a),
            c = a.events)) {
                delete i.handle,
                i.events = {};
                for (o in c)
                    for (r = 0,
                    n = c[o].length; n > r; r++)
                        et.event.add(t, o, c[o][r])
            }
            yt.hasData(e) && (s = yt.access(e),
            l = et.extend({}, s),
            yt.set(t, l))
        }
    }
    function _(e, t) {
        var r = e.getElementsByTagName ? e.getElementsByTagName(t || "*") : e.querySelectorAll ? e.querySelectorAll(t || "*") : [];
        return void 0 === t || t && et.nodeName(e, t) ? et.merge([e], r) : r
    }
    function y(e, t) {
        var r = t.nodeName.toLowerCase();
        "input" === r && St.test(e.type) ? t.checked = e.checked : ("input" === r || "textarea" === r) && (t.defaultValue = e.defaultValue)
    }
    function x(t, r) {
        var n = et(r.createElement(t)).appendTo(r.body)
          , o = e.getDefaultComputedStyle ? e.getDefaultComputedStyle(n[0]).display : et.css(n[0], "display");
        return n.detach(),
        o
    }
    function v(e) {
        var t = Q
          , r = Lt[e];
        return r || (r = x(e, t),
        "none" !== r && r || (zt = (zt || et("<iframe frameborder='0' width='0' height='0'/>")).appendTo(t.documentElement),
        t = zt[0].contentDocument,
        t.write(),
        t.close(),
        r = x(e, t),
        zt.detach()),
        Lt[e] = r),
        r
    }
    function b(e, t, r) {
        var n, o, a, i, s = e.style;
        return r = r || Ht(e),
        r && (i = r.getPropertyValue(t) || r[t]),
        r && ("" !== i || et.contains(e.ownerDocument, e) || (i = et.style(e, t)),
        qt.test(i) && jt.test(t) && (n = s.width,
        o = s.minWidth,
        a = s.maxWidth,
        s.minWidth = s.maxWidth = s.width = i,
        i = r.width,
        s.width = n,
        s.minWidth = o,
        s.maxWidth = a)),
        void 0 !== i ? i + "" : i
    }
    function w(e, t) {
        return {
            get: function() {
                return e() ? void delete this.get : (this.get = t).apply(this, arguments)
            }
        }
    }
    function C(e, t) {
        if (t in e)
            return t;
        for (var r = t[0].toUpperCase() + t.slice(1), n = t, o = $t.length; o--; )
            if (t = $t[o] + r,
            t in e)
                return t;
        return n
    }
    function S(e, t, r) {
        var n = Gt.exec(t);
        return n ? Math.max(0, n[1] - (r || 0)) + (n[2] || "px") : t
    }
    function T(e, t, r, n, o) {
        for (var a = r === (n ? "border" : "content") ? 4 : "width" === t ? 1 : 0, i = 0; 4 > a; a += 2)
            "margin" === r && (i += et.css(e, r + wt[a], !0, o)),
            n ? ("content" === r && (i -= et.css(e, "padding" + wt[a], !0, o)),
            "margin" !== r && (i -= et.css(e, "border" + wt[a] + "Width", !0, o))) : (i += et.css(e, "padding" + wt[a], !0, o),
            "padding" !== r && (i += et.css(e, "border" + wt[a] + "Width", !0, o)));
        return i
    }
    function k(e, t, r) {
        var n = !0
          , o = "width" === t ? e.offsetWidth : e.offsetHeight
          , a = Ht(e)
          , i = "border-box" === et.css(e, "boxSizing", !1, a);
        if (0 >= o || null == o) {
            if (o = b(e, t, a),
            (0 > o || null == o) && (o = e.style[t]),
            qt.test(o))
                return o;
            n = i && (J.boxSizingReliable() || o === e.style[t]),
            o = parseFloat(o) || 0
        }
        return o + T(e, t, r || (i ? "border" : "content"), n, a) + "px"
    }
    function P(e, t) {
        for (var r, n, o, a = [], i = 0, s = e.length; s > i; i++)
            n = e[i],
            n.style && (a[i] = _t.get(n, "olddisplay"),
            r = n.style.display,
            t ? (a[i] || "none" !== r || (n.style.display = ""),
            "" === n.style.display && Ct(n) && (a[i] = _t.access(n, "olddisplay", v(n.nodeName)))) : a[i] || (o = Ct(n),
            (r && "none" !== r || !o) && _t.set(n, "olddisplay", o ? r : et.css(n, "display"))));
        for (i = 0; s > i; i++)
            n = e[i],
            n.style && (t && "none" !== n.style.display && "" !== n.style.display || (n.style.display = t ? a[i] || "" : "none"));
        return e
    }
    function A(e, t, r, n, o) {
        return new A.prototype.init(e,t,r,n,o)
    }
    function D() {
        return setTimeout(function() {
            Kt = void 0
        }),
        Kt = et.now()
    }
    function I(e, t) {
        var r, n = 0, o = {
            height: e
        };
        for (t = t ? 1 : 0; 4 > n; n += 2 - t)
            r = wt[n],
            o["margin" + r] = o["padding" + r] = e;
        return t && (o.opacity = o.width = e),
        o
    }
    function N(e, t, r) {
        for (var n, o = (rr[t] || []).concat(rr["*"]), a = 0, i = o.length; i > a; a++)
            if (n = o[a].call(r, t, e))
                return n
    }
    function F(e, t, r) {
        var n, o, a, i, s, l, c, u = this, d = {}, p = e.style, g = e.nodeType && Ct(e), h = _t.get(e, "fxshow");
        r.queue || (s = et._queueHooks(e, "fx"),
        null == s.unqueued && (s.unqueued = 0,
        l = s.empty.fire,
        s.empty.fire = function() {
            s.unqueued || l()
        }
        ),
        s.unqueued++,
        u.always(function() {
            u.always(function() {
                s.unqueued--,
                et.queue(e, "fx").length || s.empty.fire()
            })
        })),
        1 === e.nodeType && ("height"in t || "width"in t) && (r.overflow = [p.overflow, p.overflowX, p.overflowY],
        c = et.css(e, "display"),
        "none" === c && (c = v(e.nodeName)),
        "inline" === c && "none" === et.css(e, "float") && (p.display = "inline-block")),
        r.overflow && (p.overflow = "hidden",
        u.always(function() {
            p.overflow = r.overflow[0],
            p.overflowX = r.overflow[1],
            p.overflowY = r.overflow[2]
        }));
        for (n in t)
            if (o = t[n],
            Qt.exec(o)) {
                if (delete t[n],
                a = a || "toggle" === o,
                o === (g ? "hide" : "show")) {
                    if ("show" !== o || !h || void 0 === h[n])
                        continue;
                    g = !0
                }
                d[n] = h && h[n] || et.style(e, n)
            }
        if (!et.isEmptyObject(d)) {
            h ? "hidden"in h && (g = h.hidden) : h = _t.access(e, "fxshow", {}),
            a && (h.hidden = !g),
            g ? et(e).show() : u.done(function() {
                et(e).hide()
            }),
            u.done(function() {
                var t;
                _t.remove(e, "fxshow");
                for (t in d)
                    et.style(e, t, d[t])
            });
            for (n in d)
                i = N(g ? h[n] : 0, n, u),
                n in h || (h[n] = i.start,
                g && (i.end = i.start,
                i.start = "width" === n || "height" === n ? 1 : 0))
        }
    }
    function E(e, t) {
        var r, n, o, a, i;
        for (r in e)
            if (n = et.camelCase(r),
            o = t[n],
            a = e[r],
            et.isArray(a) && (o = a[1],
            a = e[r] = a[0]),
            r !== n && (e[n] = a,
            delete e[r]),
            i = et.cssHooks[n],
            i && "expand"in i) {
                a = i.expand(a),
                delete e[n];
                for (r in a)
                    r in e || (e[r] = a[r],
                    t[r] = o)
            } else
                t[n] = o
    }
    function M(e, t, r) {
        var n, o, a = 0, i = tr.length, s = et.Deferred().always(function() {
            delete l.elem
        }), l = function() {
            if (o)
                return !1;
            for (var t = Kt || D(), r = Math.max(0, c.startTime + c.duration - t), n = r / c.duration || 0, a = 1 - n, i = 0, l = c.tweens.length; l > i; i++)
                c.tweens[i].run(a);
            return s.notifyWith(e, [c, a, r]),
            1 > a && l ? r : (s.resolveWith(e, [c]),
            !1)
        }, c = s.promise({
            elem: e,
            props: et.extend({}, t),
            opts: et.extend(!0, {
                specialEasing: {}
            }, r),
            originalProperties: t,
            originalOptions: r,
            startTime: Kt || D(),
            duration: r.duration,
            tweens: [],
            createTween: function(t, r) {
                var n = et.Tween(e, c.opts, t, r, c.opts.specialEasing[t] || c.opts.easing);
                return c.tweens.push(n),
                n
            },
            stop: function(t) {
                var r = 0
                  , n = t ? c.tweens.length : 0;
                if (o)
                    return this;
                for (o = !0; n > r; r++)
                    c.tweens[r].run(1);
                return t ? s.resolveWith(e, [c, t]) : s.rejectWith(e, [c, t]),
                this
            }
        }), u = c.props;
        for (E(u, c.opts.specialEasing); i > a; a++)
            if (n = tr[a].call(c, e, u, c.opts))
                return n;
        return et.map(u, N, c),
        et.isFunction(c.opts.start) && c.opts.start.call(e, c),
        et.fx.timer(et.extend(l, {
            elem: e,
            anim: c,
            queue: c.opts.queue
        })),
        c.progress(c.opts.progress).done(c.opts.done, c.opts.complete).fail(c.opts.fail).always(c.opts.always)
    }
    function B(e) {
        return function(t, r) {
            "string" != typeof t && (r = t,
            t = "*");
            var n, o = 0, a = t.toLowerCase().match(gt) || [];
            if (et.isFunction(r))
                for (; n = a[o++]; )
                    "+" === n[0] ? (n = n.slice(1) || "*",
                    (e[n] = e[n] || []).unshift(r)) : (e[n] = e[n] || []).push(r)
        }
    }
    function R(e, t, r, n) {
        function o(s) {
            var l;
            return a[s] = !0,
            et.each(e[s] || [], function(e, s) {
                var c = s(t, r, n);
                return "string" != typeof c || i || a[c] ? i ? !(l = c) : void 0 : (t.dataTypes.unshift(c),
                o(c),
                !1)
            }),
            l
        }
        var a = {}
          , i = e === br;
        return o(t.dataTypes[0]) || !a["*"] && o("*")
    }
    function W(e, t) {
        var r, n, o = et.ajaxSettings.flatOptions || {};
        for (r in t)
            void 0 !== t[r] && ((o[r] ? e : n || (n = {}))[r] = t[r]);
        return n && et.extend(!0, e, n),
        e
    }
    function O(e, t, r) {
        for (var n, o, a, i, s = e.contents, l = e.dataTypes; "*" === l[0]; )
            l.shift(),
            void 0 === n && (n = e.mimeType || t.getResponseHeader("Content-Type"));
        if (n)
            for (o in s)
                if (s[o] && s[o].test(n)) {
                    l.unshift(o);
                    break
                }
        if (l[0]in r)
            a = l[0];
        else {
            for (o in r) {
                if (!l[0] || e.converters[o + " " + l[0]]) {
                    a = o;
                    break
                }
                i || (i = o)
            }
            a = a || i
        }
        return a ? (a !== l[0] && l.unshift(a),
        r[a]) : void 0
    }
    function z(e, t, r, n) {
        var o, a, i, s, l, c = {}, u = e.dataTypes.slice();
        if (u[1])
            for (i in e.converters)
                c[i.toLowerCase()] = e.converters[i];
        for (a = u.shift(); a; )
            if (e.responseFields[a] && (r[e.responseFields[a]] = t),
            !l && n && e.dataFilter && (t = e.dataFilter(t, e.dataType)),
            l = a,
            a = u.shift())
                if ("*" === a)
                    a = l;
                else if ("*" !== l && l !== a) {
                    if (i = c[l + " " + a] || c["* " + a],
                    !i)
                        for (o in c)
                            if (s = o.split(" "),
                            s[1] === a && (i = c[l + " " + s[0]] || c["* " + s[0]])) {
                                i === !0 ? i = c[o] : c[o] !== !0 && (a = s[0],
                                u.unshift(s[1]));
                                break
                            }
                    if (i !== !0)
                        if (i && e["throws"])
                            t = i(t);
                        else
                            try {
                                t = i(t)
                            } catch (d) {
                                return {
                                    state: "parsererror",
                                    error: i ? d : "No conversion from " + l + " to " + a
                                }
                            }
                }
        return {
            state: "success",
            data: t
        }
    }
    function L(e, t, r, n) {
        var o;
        if (et.isArray(t))
            et.each(t, function(t, o) {
                r || Tr.test(e) ? n(e, o) : L(e + "[" + ("object" == typeof o ? t : "") + "]", o, r, n)
            });
        else if (r || "object" !== et.type(t))
            n(e, t);
        else
            for (o in t)
                L(e + "[" + o + "]", t[o], r, n)
    }
    function j(e) {
        return et.isWindow(e) ? e : 9 === e.nodeType && e.defaultView
    }
    var q = []
      , H = q.slice
      , Y = q.concat
      , G = q.push
      , X = q.indexOf
      , V = {}
      , U = V.toString
      , $ = V.hasOwnProperty
      , K = "".trim
      , J = {}
      , Q = e.document
      , Z = "2.1.0"
      , et = function(e, t) {
        return new et.fn.init(e,t)
    }
      , tt = /^-ms-/
      , rt = /-([\da-z])/gi
      , nt = function(e, t) {
        return t.toUpperCase()
    };
    et.fn = et.prototype = {
        jquery: Z,
        constructor: et,
        selector: "",
        length: 0,
        toArray: function() {
            return H.call(this)
        },
        get: function(e) {
            return null != e ? 0 > e ? this[e + this.length] : this[e] : H.call(this)
        },
        pushStack: function(e) {
            var t = et.merge(this.constructor(), e);
            return t.prevObject = this,
            t.context = this.context,
            t
        },
        each: function(e, t) {
            return et.each(this, e, t)
        },
        map: function(e) {
            return this.pushStack(et.map(this, function(t, r) {
                return e.call(t, r, t)
            }))
        },
        slice: function() {
            return this.pushStack(H.apply(this, arguments))
        },
        first: function() {
            return this.eq(0)
        },
        last: function() {
            return this.eq(-1)
        },
        eq: function(e) {
            var t = this.length
              , r = +e + (0 > e ? t : 0);
            return this.pushStack(r >= 0 && t > r ? [this[r]] : [])
        },
        end: function() {
            return this.prevObject || this.constructor(null)
        },
        push: G,
        sort: q.sort,
        splice: q.splice
    },
    et.extend = et.fn.extend = function() {
        var e, t, r, n, o, a, i = arguments[0] || {}, s = 1, l = arguments.length, c = !1;
        for ("boolean" == typeof i && (c = i,
        i = arguments[s] || {},
        s++),
        "object" == typeof i || et.isFunction(i) || (i = {}),
        s === l && (i = this,
        s--); l > s; s++)
            if (null != (e = arguments[s]))
                for (t in e)
                    r = i[t],
                    n = e[t],
                    i !== n && (c && n && (et.isPlainObject(n) || (o = et.isArray(n))) ? (o ? (o = !1,
                    a = r && et.isArray(r) ? r : []) : a = r && et.isPlainObject(r) ? r : {},
                    i[t] = et.extend(c, a, n)) : void 0 !== n && (i[t] = n));
        return i
    }
    ,
    et.extend({
        expando: "jQuery" + (Z + Math.random()).replace(/\D/g, ""),
        isReady: !0,
        error: function(e) {
            throw new Error(e)
        },
        noop: function() {},
        isFunction: function(e) {
            return "function" === et.type(e)
        },
        isArray: Array.isArray,
        isWindow: function(e) {
            return null != e && e === e.window
        },
        isNumeric: function(e) {
            return e - parseFloat(e) >= 0
        },
        isPlainObject: function(e) {
            if ("object" !== et.type(e) || e.nodeType || et.isWindow(e))
                return !1;
            try {
                if (e.constructor && !$.call(e.constructor.prototype, "isPrototypeOf"))
                    return !1
            } catch (t) {
                return !1
            }
            return !0
        },
        isEmptyObject: function(e) {
            var t;
            for (t in e)
                return !1;
            return !0
        },
        type: function(e) {
            return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? V[U.call(e)] || "object" : typeof e
        },
        globalEval: function(e) {
            var t, r = eval;
            e = et.trim(e),
            e && (1 === e.indexOf("use strict") ? (t = Q.createElement("script"),
            t.text = e,
            Q.head.appendChild(t).parentNode.removeChild(t)) : r(e))
        },
        camelCase: function(e) {
            return e.replace(tt, "ms-").replace(rt, nt)
        },
        nodeName: function(e, t) {
            return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
        },
        each: function(e, t, n) {
            var o, a = 0, i = e.length, s = r(e);
            if (n) {
                if (s)
                    for (; i > a && (o = t.apply(e[a], n),
                    o !== !1); a++)
                        ;
                else
                    for (a in e)
                        if (o = t.apply(e[a], n),
                        o === !1)
                            break
            } else if (s)
                for (; i > a && (o = t.call(e[a], a, e[a]),
                o !== !1); a++)
                    ;
            else
                for (a in e)
                    if (o = t.call(e[a], a, e[a]),
                    o === !1)
                        break;
            return e
        },
        trim: function(e) {
            return null == e ? "" : K.call(e)
        },
        makeArray: function(e, t) {
            var n = t || [];
            return null != e && (r(Object(e)) ? et.merge(n, "string" == typeof e ? [e] : e) : G.call(n, e)),
            n
        },
        inArray: function(e, t, r) {
            return null == t ? -1 : X.call(t, e, r)
        },
        merge: function(e, t) {
            for (var r = +t.length, n = 0, o = e.length; r > n; n++)
                e[o++] = t[n];
            return e.length = o,
            e
        },
        grep: function(e, t, r) {
            for (var n, o = [], a = 0, i = e.length, s = !r; i > a; a++)
                n = !t(e[a], a),
                n !== s && o.push(e[a]);
            return o
        },
        map: function(e, t, n) {
            var o, a = 0, i = e.length, s = r(e), l = [];
            if (s)
                for (; i > a; a++)
                    o = t(e[a], a, n),
                    null != o && l.push(o);
            else
                for (a in e)
                    o = t(e[a], a, n),
                    null != o && l.push(o);
            return Y.apply([], l)
        },
        guid: 1,
        proxy: function(e, t) {
            var r, n, o;
            return "string" == typeof t && (r = e[t],
            t = e,
            e = r),
            et.isFunction(e) ? (n = H.call(arguments, 2),
            o = function() {
                return e.apply(t || this, n.concat(H.call(arguments)))
            }
            ,
            o.guid = e.guid = e.guid || et.guid++,
            o) : void 0
        },
        now: Date.now,
        support: J
    }),
    et.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(e, t) {
        V["[object " + t + "]"] = t.toLowerCase()
    });
    var ot = function(e) {
        function t(e, t, r, n) {
            var o, a, i, s, l, c, d, h, f, m;
            if ((t ? t.ownerDocument || t : L) !== F && N(t),
            t = t || F,
            r = r || [],
            !e || "string" != typeof e)
                return r;
            if (1 !== (s = t.nodeType) && 9 !== s)
                return [];
            if (M && !n) {
                if (o = yt.exec(e))
                    if (i = o[1]) {
                        if (9 === s) {
                            if (a = t.getElementById(i),
                            !a || !a.parentNode)
                                return r;
                            if (a.id === i)
                                return r.push(a),
                                r
                        } else if (t.ownerDocument && (a = t.ownerDocument.getElementById(i)) && O(t, a) && a.id === i)
                            return r.push(a),
                            r
                    } else {
                        if (o[2])
                            return Z.apply(r, t.getElementsByTagName(e)),
                            r;
                        if ((i = o[3]) && C.getElementsByClassName && t.getElementsByClassName)
                            return Z.apply(r, t.getElementsByClassName(i)),
                            r
                    }
                if (C.qsa && (!B || !B.test(e))) {
                    if (h = d = z,
                    f = t,
                    m = 9 === s && e,
                    1 === s && "object" !== t.nodeName.toLowerCase()) {
                        for (c = p(e),
                        (d = t.getAttribute("id")) ? h = d.replace(vt, "\\$&") : t.setAttribute("id", h),
                        h = "[id='" + h + "'] ",
                        l = c.length; l--; )
                            c[l] = h + g(c[l]);
                        f = xt.test(e) && u(t.parentNode) || t,
                        m = c.join(",")
                    }
                    if (m)
                        try {
                            return Z.apply(r, f.querySelectorAll(m)),
                            r
                        } catch (_) {} finally {
                            d || t.removeAttribute("id")
                        }
                }
            }
            return b(e.replace(lt, "$1"), t, r, n)
        }
        function r() {
            function e(r, n) {
                return t.push(r + " ") > S.cacheLength && delete e[t.shift()],
                e[r + " "] = n
            }
            var t = [];
            return e
        }
        function n(e) {
            return e[z] = !0,
            e
        }
        function o(e) {
            var t = F.createElement("div");
            try {
                return !!e(t)
            } catch (r) {
                return !1
            } finally {
                t.parentNode && t.parentNode.removeChild(t),
                t = null
            }
        }
        function a(e, t) {
            for (var r = e.split("|"), n = e.length; n--; )
                S.attrHandle[r[n]] = t
        }
        function i(e, t) {
            var r = t && e
              , n = r && 1 === e.nodeType && 1 === t.nodeType && (~t.sourceIndex || U) - (~e.sourceIndex || U);
            if (n)
                return n;
            if (r)
                for (; r = r.nextSibling; )
                    if (r === t)
                        return -1;
            return e ? 1 : -1
        }
        function s(e) {
            return function(t) {
                var r = t.nodeName.toLowerCase();
                return "input" === r && t.type === e
            }
        }
        function l(e) {
            return function(t) {
                var r = t.nodeName.toLowerCase();
                return ("input" === r || "button" === r) && t.type === e
            }
        }
        function c(e) {
            return n(function(t) {
                return t = +t,
                n(function(r, n) {
                    for (var o, a = e([], r.length, t), i = a.length; i--; )
                        r[o = a[i]] && (r[o] = !(n[o] = r[o]))
                })
            })
        }
        function u(e) {
            return e && typeof e.getElementsByTagName !== V && e
        }
        function d() {}
        function p(e, r) {
            var n, o, a, i, s, l, c, u = Y[e + " "];
            if (u)
                return r ? 0 : u.slice(0);
            for (s = e,
            l = [],
            c = S.preFilter; s; ) {
                (!n || (o = ct.exec(s))) && (o && (s = s.slice(o[0].length) || s),
                l.push(a = [])),
                n = !1,
                (o = ut.exec(s)) && (n = o.shift(),
                a.push({
                    value: n,
                    type: o[0].replace(lt, " ")
                }),
                s = s.slice(n.length));
                for (i in S.filter)
                    !(o = ht[i].exec(s)) || c[i] && !(o = c[i](o)) || (n = o.shift(),
                    a.push({
                        value: n,
                        type: i,
                        matches: o
                    }),
                    s = s.slice(n.length));
                if (!n)
                    break
            }
            return r ? s.length : s ? t.error(e) : Y(e, l).slice(0)
        }
        function g(e) {
            for (var t = 0, r = e.length, n = ""; r > t; t++)
                n += e[t].value;
            return n
        }
        function h(e, t, r) {
            var n = t.dir
              , o = r && "parentNode" === n
              , a = q++;
            return t.first ? function(t, r, a) {
                for (; t = t[n]; )
                    if (1 === t.nodeType || o)
                        return e(t, r, a)
            }
            : function(t, r, i) {
                var s, l, c = [j, a];
                if (i) {
                    for (; t = t[n]; )
                        if ((1 === t.nodeType || o) && e(t, r, i))
                            return !0
                } else
                    for (; t = t[n]; )
                        if (1 === t.nodeType || o) {
                            if (l = t[z] || (t[z] = {}),
                            (s = l[n]) && s[0] === j && s[1] === a)
                                return c[2] = s[2];
                            if (l[n] = c,
                            c[2] = e(t, r, i))
                                return !0
                        }
            }
        }
        function f(e) {
            return e.length > 1 ? function(t, r, n) {
                for (var o = e.length; o--; )
                    if (!e[o](t, r, n))
                        return !1;
                return !0
            }
            : e[0]
        }
        function m(e, t, r, n, o) {
            for (var a, i = [], s = 0, l = e.length, c = null != t; l > s; s++)
                (a = e[s]) && (!r || r(a, n, o)) && (i.push(a),
                c && t.push(s));
            return i
        }
        function _(e, t, r, o, a, i) {
            return o && !o[z] && (o = _(o)),
            a && !a[z] && (a = _(a, i)),
            n(function(n, i, s, l) {
                var c, u, d, p = [], g = [], h = i.length, f = n || v(t || "*", s.nodeType ? [s] : s, []), _ = !e || !n && t ? f : m(f, p, e, s, l), y = r ? a || (n ? e : h || o) ? [] : i : _;
                if (r && r(_, y, s, l),
                o)
                    for (c = m(y, g),
                    o(c, [], s, l),
                    u = c.length; u--; )
                        (d = c[u]) && (y[g[u]] = !(_[g[u]] = d));
                if (n) {
                    if (a || e) {
                        if (a) {
                            for (c = [],
                            u = y.length; u--; )
                                (d = y[u]) && c.push(_[u] = d);
                            a(null, y = [], c, l)
                        }
                        for (u = y.length; u--; )
                            (d = y[u]) && (c = a ? tt.call(n, d) : p[u]) > -1 && (n[c] = !(i[c] = d))
                    }
                } else
                    y = m(y === i ? y.splice(h, y.length) : y),
                    a ? a(null, i, y, l) : Z.apply(i, y)
            })
        }
        function y(e) {
            for (var t, r, n, o = e.length, a = S.relative[e[0].type], i = a || S.relative[" "], s = a ? 1 : 0, l = h(function(e) {
                return e === t
            }, i, !0), c = h(function(e) {
                return tt.call(t, e) > -1
            }, i, !0), u = [function(e, r, n) {
                return !a && (n || r !== A) || ((t = r).nodeType ? l(e, r, n) : c(e, r, n))
            }
            ]; o > s; s++)
                if (r = S.relative[e[s].type])
                    u = [h(f(u), r)];
                else {
                    if (r = S.filter[e[s].type].apply(null, e[s].matches),
                    r[z]) {
                        for (n = ++s; o > n && !S.relative[e[n].type]; n++)
                            ;
                        return _(s > 1 && f(u), s > 1 && g(e.slice(0, s - 1).concat({
                            value: " " === e[s - 2].type ? "*" : ""
                        })).replace(lt, "$1"), r, n > s && y(e.slice(s, n)), o > n && y(e = e.slice(n)), o > n && g(e))
                    }
                    u.push(r)
                }
            return f(u)
        }
        function x(e, r) {
            var o = r.length > 0
              , a = e.length > 0
              , i = function(n, i, s, l, c) {
                var u, d, p, g = 0, h = "0", f = n && [], _ = [], y = A, x = n || a && S.find.TAG("*", c), v = j += null == y ? 1 : Math.random() || .1, b = x.length;
                for (c && (A = i !== F && i); h !== b && null != (u = x[h]); h++) {
                    if (a && u) {
                        for (d = 0; p = e[d++]; )
                            if (p(u, i, s)) {
                                l.push(u);
                                break
                            }
                        c && (j = v)
                    }
                    o && ((u = !p && u) && g--,
                    n && f.push(u))
                }
                if (g += h,
                o && h !== g) {
                    for (d = 0; p = r[d++]; )
                        p(f, _, i, s);
                    if (n) {
                        if (g > 0)
                            for (; h--; )
                                f[h] || _[h] || (_[h] = J.call(l));
                        _ = m(_)
                    }
                    Z.apply(l, _),
                    c && !n && _.length > 0 && g + r.length > 1 && t.uniqueSort(l)
                }
                return c && (j = v,
                A = y),
                f
            };
            return o ? n(i) : i
        }
        function v(e, r, n) {
            for (var o = 0, a = r.length; a > o; o++)
                t(e, r[o], n);
            return n
        }
        function b(e, t, r, n) {
            var o, a, i, s, l, c = p(e);
            if (!n && 1 === c.length) {
                if (a = c[0] = c[0].slice(0),
                a.length > 2 && "ID" === (i = a[0]).type && C.getById && 9 === t.nodeType && M && S.relative[a[1].type]) {
                    if (t = (S.find.ID(i.matches[0].replace(bt, wt), t) || [])[0],
                    !t)
                        return r;
                    e = e.slice(a.shift().value.length)
                }
                for (o = ht.needsContext.test(e) ? 0 : a.length; o-- && (i = a[o],
                !S.relative[s = i.type]); )
                    if ((l = S.find[s]) && (n = l(i.matches[0].replace(bt, wt), xt.test(a[0].type) && u(t.parentNode) || t))) {
                        if (a.splice(o, 1),
                        e = n.length && g(a),
                        !e)
                            return Z.apply(r, n),
                            r;
                        break
                    }
            }
            return P(e, c)(n, t, !M, r, xt.test(e) && u(t.parentNode) || t),
            r
        }
        var w, C, S, T, k, P, A, D, I, N, F, E, M, B, R, W, O, z = "sizzle" + -new Date, L = e.document, j = 0, q = 0, H = r(), Y = r(), G = r(), X = function(e, t) {
            return e === t && (I = !0),
            0
        }, V = "undefined", U = 1 << 31, $ = {}.hasOwnProperty, K = [], J = K.pop, Q = K.push, Z = K.push, et = K.slice, tt = K.indexOf || function(e) {
            for (var t = 0, r = this.length; r > t; t++)
                if (this[t] === e)
                    return t;
            return -1
        }
        , rt = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", nt = "[\\x20\\t\\r\\n\\f]", ot = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", at = ot.replace("w", "w#"), it = "\\[" + nt + "*(" + ot + ")" + nt + "*(?:([*^$|!~]?=)" + nt + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + at + ")|)|)" + nt + "*\\]", st = ":(" + ot + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + it.replace(3, 8) + ")*)|.*)\\)|)", lt = new RegExp("^" + nt + "+|((?:^|[^\\\\])(?:\\\\.)*)" + nt + "+$","g"), ct = new RegExp("^" + nt + "*," + nt + "*"), ut = new RegExp("^" + nt + "*([>+~]|" + nt + ")" + nt + "*"), dt = new RegExp("=" + nt + "*([^\\]'\"]*?)" + nt + "*\\]","g"), pt = new RegExp(st), gt = new RegExp("^" + at + "$"), ht = {
            ID: new RegExp("^#(" + ot + ")"),
            CLASS: new RegExp("^\\.(" + ot + ")"),
            TAG: new RegExp("^(" + ot.replace("w", "w*") + ")"),
            ATTR: new RegExp("^" + it),
            PSEUDO: new RegExp("^" + st),
            CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + nt + "*(even|odd|(([+-]|)(\\d*)n|)" + nt + "*(?:([+-]|)" + nt + "*(\\d+)|))" + nt + "*\\)|)","i"),
            bool: new RegExp("^(?:" + rt + ")$","i"),
            needsContext: new RegExp("^" + nt + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + nt + "*((?:-\\d)?\\d*)" + nt + "*\\)|)(?=[^-]|$)","i")
        }, ft = /^(?:input|select|textarea|button)$/i, mt = /^h\d$/i, _t = /^[^{]+\{\s*\[native \w/, yt = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, xt = /[+~]/, vt = /'|\\/g, bt = new RegExp("\\\\([\\da-f]{1,6}" + nt + "?|(" + nt + ")|.)","ig"), wt = function(e, t, r) {
            var n = "0x" + t - 65536;
            return n !== n || r ? t : 0 > n ? String.fromCharCode(n + 65536) : String.fromCharCode(n >> 10 | 55296, 1023 & n | 56320)
        };
        try {
            Z.apply(K = et.call(L.childNodes), L.childNodes),
            K[L.childNodes.length].nodeType
        } catch (Ct) {
            Z = {
                apply: K.length ? function(e, t) {
                    Q.apply(e, et.call(t))
                }
                : function(e, t) {
                    for (var r = e.length, n = 0; e[r++] = t[n++]; )
                        ;
                    e.length = r - 1
                }
            }
        }
        C = t.support = {},
        k = t.isXML = function(e) {
            var t = e && (e.ownerDocument || e).documentElement;
            return t ? "HTML" !== t.nodeName : !1
        }
        ,
        N = t.setDocument = function(e) {
            var t, r = e ? e.ownerDocument || e : L, n = r.defaultView;
            return r !== F && 9 === r.nodeType && r.documentElement ? (F = r,
            E = r.documentElement,
            M = !k(r),
            n && n !== n.top && (n.addEventListener ? n.addEventListener("unload", function() {
                N()
            }, !1) : n.attachEvent && n.attachEvent("onunload", function() {
                N()
            })),
            C.attributes = o(function(e) {
                return e.className = "i",
                !e.getAttribute("className")
            }),
            C.getElementsByTagName = o(function(e) {
                return e.appendChild(r.createComment("")),
                !e.getElementsByTagName("*").length
            }),
            C.getElementsByClassName = _t.test(r.getElementsByClassName) && o(function(e) {
                return e.innerHTML = "<div class='a'></div><div class='a i'></div>",
                e.firstChild.className = "i",
                2 === e.getElementsByClassName("i").length
            }),
            C.getById = o(function(e) {
                return E.appendChild(e).id = z,
                !r.getElementsByName || !r.getElementsByName(z).length
            }),
            C.getById ? (S.find.ID = function(e, t) {
                if (typeof t.getElementById !== V && M) {
                    var r = t.getElementById(e);
                    return r && r.parentNode ? [r] : []
                }
            }
            ,
            S.filter.ID = function(e) {
                var t = e.replace(bt, wt);
                return function(e) {
                    return e.getAttribute("id") === t
                }
            }
            ) : (delete S.find.ID,
            S.filter.ID = function(e) {
                var t = e.replace(bt, wt);
                return function(e) {
                    var r = typeof e.getAttributeNode !== V && e.getAttributeNode("id");
                    return r && r.value === t
                }
            }
            ),
            S.find.TAG = C.getElementsByTagName ? function(e, t) {
                return typeof t.getElementsByTagName !== V ? t.getElementsByTagName(e) : void 0
            }
            : function(e, t) {
                var r, n = [], o = 0, a = t.getElementsByTagName(e);
                if ("*" === e) {
                    for (; r = a[o++]; )
                        1 === r.nodeType && n.push(r);
                    return n
                }
                return a
            }
            ,
            S.find.CLASS = C.getElementsByClassName && function(e, t) {
                return typeof t.getElementsByClassName !== V && M ? t.getElementsByClassName(e) : void 0
            }
            ,
            R = [],
            B = [],
            (C.qsa = _t.test(r.querySelectorAll)) && (o(function(e) {
                e.innerHTML = "<select t=''><option selected=''></option></select>",
                e.querySelectorAll("[t^='']").length && B.push("[*^$]=" + nt + "*(?:''|\"\")"),
                e.querySelectorAll("[selected]").length || B.push("\\[" + nt + "*(?:value|" + rt + ")"),
                e.querySelectorAll(":checked").length || B.push(":checked")
            }),
            o(function(e) {
                var t = r.createElement("input");
                t.setAttribute("type", "hidden"),
                e.appendChild(t).setAttribute("name", "D"),
                e.querySelectorAll("[name=d]").length && B.push("name" + nt + "*[*^$|!~]?="),
                e.querySelectorAll(":enabled").length || B.push(":enabled", ":disabled"),
                e.querySelectorAll("*,:x"),
                B.push(",.*:")
            })),
            (C.matchesSelector = _t.test(W = E.webkitMatchesSelector || E.mozMatchesSelector || E.oMatchesSelector || E.msMatchesSelector)) && o(function(e) {
                C.disconnectedMatch = W.call(e, "div"),
                W.call(e, "[s!='']:x"),
                R.push("!=", st)
            }),
            B = B.length && new RegExp(B.join("|")),
            R = R.length && new RegExp(R.join("|")),
            t = _t.test(E.compareDocumentPosition),
            O = t || _t.test(E.contains) ? function(e, t) {
                var r = 9 === e.nodeType ? e.documentElement : e
                  , n = t && t.parentNode;
                return e === n || !(!n || 1 !== n.nodeType || !(r.contains ? r.contains(n) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(n)))
            }
            : function(e, t) {
                if (t)
                    for (; t = t.parentNode; )
                        if (t === e)
                            return !0;
                return !1
            }
            ,
            X = t ? function(e, t) {
                if (e === t)
                    return I = !0,
                    0;
                var n = !e.compareDocumentPosition - !t.compareDocumentPosition;
                return n ? n : (n = (e.ownerDocument || e) === (t.ownerDocument || t) ? e.compareDocumentPosition(t) : 1,
                1 & n || !C.sortDetached && t.compareDocumentPosition(e) === n ? e === r || e.ownerDocument === L && O(L, e) ? -1 : t === r || t.ownerDocument === L && O(L, t) ? 1 : D ? tt.call(D, e) - tt.call(D, t) : 0 : 4 & n ? -1 : 1)
            }
            : function(e, t) {
                if (e === t)
                    return I = !0,
                    0;
                var n, o = 0, a = e.parentNode, s = t.parentNode, l = [e], c = [t];
                if (!a || !s)
                    return e === r ? -1 : t === r ? 1 : a ? -1 : s ? 1 : D ? tt.call(D, e) - tt.call(D, t) : 0;
                if (a === s)
                    return i(e, t);
                for (n = e; n = n.parentNode; )
                    l.unshift(n);
                for (n = t; n = n.parentNode; )
                    c.unshift(n);
                for (; l[o] === c[o]; )
                    o++;
                return o ? i(l[o], c[o]) : l[o] === L ? -1 : c[o] === L ? 1 : 0
            }
            ,
            r) : F
        }
        ,
        t.matches = function(e, r) {
            return t(e, null, null, r)
        }
        ,
        t.matchesSelector = function(e, r) {
            if ((e.ownerDocument || e) !== F && N(e),
            r = r.replace(dt, "='$1']"),
            !(!C.matchesSelector || !M || R && R.test(r) || B && B.test(r)))
                try {
                    var n = W.call(e, r);
                    if (n || C.disconnectedMatch || e.document && 11 !== e.document.nodeType)
                        return n
                } catch (o) {}
            return t(r, F, null, [e]).length > 0
        }
        ,
        t.contains = function(e, t) {
            return (e.ownerDocument || e) !== F && N(e),
            O(e, t)
        }
        ,
        t.attr = function(e, t) {
            (e.ownerDocument || e) !== F && N(e);
            var r = S.attrHandle[t.toLowerCase()]
              , n = r && $.call(S.attrHandle, t.toLowerCase()) ? r(e, t, !M) : void 0;
            return void 0 !== n ? n : C.attributes || !M ? e.getAttribute(t) : (n = e.getAttributeNode(t)) && n.specified ? n.value : null
        }
        ,
        t.error = function(e) {
            throw new Error("Syntax error, unrecognized expression: " + e)
        }
        ,
        t.uniqueSort = function(e) {
            var t, r = [], n = 0, o = 0;
            if (I = !C.detectDuplicates,
            D = !C.sortStable && e.slice(0),
            e.sort(X),
            I) {
                for (; t = e[o++]; )
                    t === e[o] && (n = r.push(o));
                for (; n--; )
                    e.splice(r[n], 1)
            }
            return D = null,
            e
        }
        ,
        T = t.getText = function(e) {
            var t, r = "", n = 0, o = e.nodeType;
            if (o) {
                if (1 === o || 9 === o || 11 === o) {
                    if ("string" == typeof e.textContent)
                        return e.textContent;
                    for (e = e.firstChild; e; e = e.nextSibling)
                        r += T(e)
                } else if (3 === o || 4 === o)
                    return e.nodeValue
            } else
                for (; t = e[n++]; )
                    r += T(t);
            return r
        }
        ,
        S = t.selectors = {
            cacheLength: 50,
            createPseudo: n,
            match: ht,
            attrHandle: {},
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: !0
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: !0
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(e) {
                    return e[1] = e[1].replace(bt, wt),
                    e[3] = (e[4] || e[5] || "").replace(bt, wt),
                    "~=" === e[2] && (e[3] = " " + e[3] + " "),
                    e.slice(0, 4)
                },
                CHILD: function(e) {
                    return e[1] = e[1].toLowerCase(),
                    "nth" === e[1].slice(0, 3) ? (e[3] || t.error(e[0]),
                    e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * ("even" === e[3] || "odd" === e[3])),
                    e[5] = +(e[7] + e[8] || "odd" === e[3])) : e[3] && t.error(e[0]),
                    e
                },
                PSEUDO: function(e) {
                    var t, r = !e[5] && e[2];
                    return ht.CHILD.test(e[0]) ? null : (e[3] && void 0 !== e[4] ? e[2] = e[4] : r && pt.test(r) && (t = p(r, !0)) && (t = r.indexOf(")", r.length - t) - r.length) && (e[0] = e[0].slice(0, t),
                    e[2] = r.slice(0, t)),
                    e.slice(0, 3))
                }
            },
            filter: {
                TAG: function(e) {
                    var t = e.replace(bt, wt).toLowerCase();
                    return "*" === e ? function() {
                        return !0
                    }
                    : function(e) {
                        return e.nodeName && e.nodeName.toLowerCase() === t
                    }
                },
                CLASS: function(e) {
                    var t = H[e + " "];
                    return t || (t = new RegExp("(^|" + nt + ")" + e + "(" + nt + "|$)")) && H(e, function(e) {
                        return t.test("string" == typeof e.className && e.className || typeof e.getAttribute !== V && e.getAttribute("class") || "")
                    })
                },
                ATTR: function(e, r, n) {
                    return function(o) {
                        var a = t.attr(o, e);
                        return null == a ? "!=" === r : r ? (a += "",
                        "=" === r ? a === n : "!=" === r ? a !== n : "^=" === r ? n && 0 === a.indexOf(n) : "*=" === r ? n && a.indexOf(n) > -1 : "$=" === r ? n && a.slice(-n.length) === n : "~=" === r ? (" " + a + " ").indexOf(n) > -1 : "|=" === r ? a === n || a.slice(0, n.length + 1) === n + "-" : !1) : !0
                    }
                },
                CHILD: function(e, t, r, n, o) {
                    var a = "nth" !== e.slice(0, 3)
                      , i = "last" !== e.slice(-4)
                      , s = "of-type" === t;
                    return 1 === n && 0 === o ? function(e) {
                        return !!e.parentNode
                    }
                    : function(t, r, l) {
                        var c, u, d, p, g, h, f = a !== i ? "nextSibling" : "previousSibling", m = t.parentNode, _ = s && t.nodeName.toLowerCase(), y = !l && !s;
                        if (m) {
                            if (a) {
                                for (; f; ) {
                                    for (d = t; d = d[f]; )
                                        if (s ? d.nodeName.toLowerCase() === _ : 1 === d.nodeType)
                                            return !1;
                                    h = f = "only" === e && !h && "nextSibling"
                                }
                                return !0
                            }
                            if (h = [i ? m.firstChild : m.lastChild],
                            i && y) {
                                for (u = m[z] || (m[z] = {}),
                                c = u[e] || [],
                                g = c[0] === j && c[1],
                                p = c[0] === j && c[2],
                                d = g && m.childNodes[g]; d = ++g && d && d[f] || (p = g = 0) || h.pop(); )
                                    if (1 === d.nodeType && ++p && d === t) {
                                        u[e] = [j, g, p];
                                        break
                                    }
                            } else if (y && (c = (t[z] || (t[z] = {}))[e]) && c[0] === j)
                                p = c[1];
                            else
                                for (; (d = ++g && d && d[f] || (p = g = 0) || h.pop()) && ((s ? d.nodeName.toLowerCase() !== _ : 1 !== d.nodeType) || !++p || (y && ((d[z] || (d[z] = {}))[e] = [j, p]),
                                d !== t)); )
                                    ;
                            return p -= o,
                            p === n || p % n === 0 && p / n >= 0
                        }
                    }
                },
                PSEUDO: function(e, r) {
                    var o, a = S.pseudos[e] || S.setFilters[e.toLowerCase()] || t.error("unsupported pseudo: " + e);
                    return a[z] ? a(r) : a.length > 1 ? (o = [e, e, "", r],
                    S.setFilters.hasOwnProperty(e.toLowerCase()) ? n(function(e, t) {
                        for (var n, o = a(e, r), i = o.length; i--; )
                            n = tt.call(e, o[i]),
                            e[n] = !(t[n] = o[i])
                    }) : function(e) {
                        return a(e, 0, o)
                    }
                    ) : a
                }
            },
            pseudos: {
                not: n(function(e) {
                    var t = []
                      , r = []
                      , o = P(e.replace(lt, "$1"));
                    return o[z] ? n(function(e, t, r, n) {
                        for (var a, i = o(e, null, n, []), s = e.length; s--; )
                            (a = i[s]) && (e[s] = !(t[s] = a))
                    }) : function(e, n, a) {
                        return t[0] = e,
                        o(t, null, a, r),
                        !r.pop()
                    }
                }),
                has: n(function(e) {
                    return function(r) {
                        return t(e, r).length > 0
                    }
                }),
                contains: n(function(e) {
                    return function(t) {
                        return (t.textContent || t.innerText || T(t)).indexOf(e) > -1
                    }
                }),
                lang: n(function(e) {
                    return gt.test(e || "") || t.error("unsupported lang: " + e),
                    e = e.replace(bt, wt).toLowerCase(),
                    function(t) {
                        var r;
                        do
                            if (r = M ? t.lang : t.getAttribute("xml:lang") || t.getAttribute("lang"))
                                return r = r.toLowerCase(),
                                r === e || 0 === r.indexOf(e + "-");
                        while ((t = t.parentNode) && 1 === t.nodeType);return !1
                    }
                }),
                target: function(t) {
                    var r = e.location && e.location.hash;
                    return r && r.slice(1) === t.id
                },
                root: function(e) {
                    return e === E
                },
                focus: function(e) {
                    return e === F.activeElement && (!F.hasFocus || F.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
                },
                enabled: function(e) {
                    return e.disabled === !1
                },
                disabled: function(e) {
                    return e.disabled === !0
                },
                checked: function(e) {
                    var t = e.nodeName.toLowerCase();
                    return "input" === t && !!e.checked || "option" === t && !!e.selected
                },
                selected: function(e) {
                    return e.parentNode && e.parentNode.selectedIndex,
                    e.selected === !0
                },
                empty: function(e) {
                    for (e = e.firstChild; e; e = e.nextSibling)
                        if (e.nodeType < 6)
                            return !1;
                    return !0
                },
                parent: function(e) {
                    return !S.pseudos.empty(e)
                },
                header: function(e) {
                    return mt.test(e.nodeName)
                },
                input: function(e) {
                    return ft.test(e.nodeName)
                },
                button: function(e) {
                    var t = e.nodeName.toLowerCase();
                    return "input" === t && "button" === e.type || "button" === t
                },
                text: function(e) {
                    var t;
                    return "input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || "text" === t.toLowerCase())
                },
                first: c(function() {
                    return [0]
                }),
                last: c(function(e, t) {
                    return [t - 1]
                }),
                eq: c(function(e, t, r) {
                    return [0 > r ? r + t : r]
                }),
                even: c(function(e, t) {
                    for (var r = 0; t > r; r += 2)
                        e.push(r);
                    return e
                }),
                odd: c(function(e, t) {
                    for (var r = 1; t > r; r += 2)
                        e.push(r);
                    return e
                }),
                lt: c(function(e, t, r) {
                    for (var n = 0 > r ? r + t : r; --n >= 0; )
                        e.push(n);
                    return e
                }),
                gt: c(function(e, t, r) {
                    for (var n = 0 > r ? r + t : r; ++n < t; )
                        e.push(n);
                    return e
                })
            }
        },
        S.pseudos.nth = S.pseudos.eq;
        for (w in {
            radio: !0,
            checkbox: !0,
            file: !0,
            password: !0,
            image: !0
        })
            S.pseudos[w] = s(w);
        for (w in {
            submit: !0,
            reset: !0
        })
            S.pseudos[w] = l(w);
        return d.prototype = S.filters = S.pseudos,
        S.setFilters = new d,
        P = t.compile = function(e, t) {
            var r, n = [], o = [], a = G[e + " "];
            if (!a) {
                for (t || (t = p(e)),
                r = t.length; r--; )
                    a = y(t[r]),
                    a[z] ? n.push(a) : o.push(a);
                a = G(e, x(o, n))
            }
            return a
        }
        ,
        C.sortStable = z.split("").sort(X).join("") === z,
        C.detectDuplicates = !!I,
        N(),
        C.sortDetached = o(function(e) {
            return 1 & e.compareDocumentPosition(F.createElement("div"))
        }),
        o(function(e) {
            return e.innerHTML = "<a href='#'></a>",
            "#" === e.firstChild.getAttribute("href")
        }) || a("type|href|height|width", function(e, t, r) {
            return r ? void 0 : e.getAttribute(t, "type" === t.toLowerCase() ? 1 : 2)
        }),
        C.attributes && o(function(e) {
            return e.innerHTML = "<input/>",
            e.firstChild.setAttribute("value", ""),
            "" === e.firstChild.getAttribute("value")
        }) || a("value", function(e, t, r) {
            return r || "input" !== e.nodeName.toLowerCase() ? void 0 : e.defaultValue
        }),
        o(function(e) {
            return null == e.getAttribute("disabled")
        }) || a(rt, function(e, t, r) {
            var n;
            return r ? void 0 : e[t] === !0 ? t.toLowerCase() : (n = e.getAttributeNode(t)) && n.specified ? n.value : null
        }),
        t
    }(e);
    et.find = ot,
    et.expr = ot.selectors,
    et.expr[":"] = et.expr.pseudos,
    et.unique = ot.uniqueSort,
    et.text = ot.getText,
    et.isXMLDoc = ot.isXML,
    et.contains = ot.contains;
    var at = et.expr.match.needsContext
      , it = /^<(\w+)\s*\/?>(?:<\/\1>|)$/
      , st = /^.[^:#\[\.,]*$/;
    et.filter = function(e, t, r) {
        var n = t[0];
        return r && (e = ":not(" + e + ")"),
        1 === t.length && 1 === n.nodeType ? et.find.matchesSelector(n, e) ? [n] : [] : et.find.matches(e, et.grep(t, function(e) {
            return 1 === e.nodeType
        }))
    }
    ,
    et.fn.extend({
        find: function(e) {
            var t, r = this.length, n = [], o = this;
            if ("string" != typeof e)
                return this.pushStack(et(e).filter(function() {
                    for (t = 0; r > t; t++)
                        if (et.contains(o[t], this))
                            return !0
                }));
            for (t = 0; r > t; t++)
                et.find(e, o[t], n);
            return n = this.pushStack(r > 1 ? et.unique(n) : n),
            n.selector = this.selector ? this.selector + " " + e : e,
            n
        },
        filter: function(e) {
            return this.pushStack(n(this, e || [], !1))
        },
        not: function(e) {
            return this.pushStack(n(this, e || [], !0))
        },
        is: function(e) {
            return !!n(this, "string" == typeof e && at.test(e) ? et(e) : e || [], !1).length
        }
    });
    var lt, ct = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, ut = et.fn.init = function(e, t) {
        var r, n;
        if (!e)
            return this;
        if ("string" == typeof e) {
            if (r = "<" === e[0] && ">" === e[e.length - 1] && e.length >= 3 ? [null, e, null] : ct.exec(e),
            !r || !r[1] && t)
                return !t || t.jquery ? (t || lt).find(e) : this.constructor(t).find(e);
            if (r[1]) {
                if (t = t instanceof et ? t[0] : t,
                et.merge(this, et.parseHTML(r[1], t && t.nodeType ? t.ownerDocument || t : Q, !0)),
                it.test(r[1]) && et.isPlainObject(t))
                    for (r in t)
                        et.isFunction(this[r]) ? this[r](t[r]) : this.attr(r, t[r]);
                return this
            }
            return n = Q.getElementById(r[2]),
            n && n.parentNode && (this.length = 1,
            this[0] = n),
            this.context = Q,
            this.selector = e,
            this
        }
        return e.nodeType ? (this.context = this[0] = e,
        this.length = 1,
        this) : et.isFunction(e) ? "undefined" != typeof lt.ready ? lt.ready(e) : e(et) : (void 0 !== e.selector && (this.selector = e.selector,
        this.context = e.context),
        et.makeArray(e, this))
    }
    ;
    ut.prototype = et.fn,
    lt = et(Q);
    var dt = /^(?:parents|prev(?:Until|All))/
      , pt = {
        children: !0,
        contents: !0,
        next: !0,
        prev: !0
    };
    et.extend({
        dir: function(e, t, r) {
            for (var n = [], o = void 0 !== r; (e = e[t]) && 9 !== e.nodeType; )
                if (1 === e.nodeType) {
                    if (o && et(e).is(r))
                        break;
                    n.push(e)
                }
            return n
        },
        sibling: function(e, t) {
            for (var r = []; e; e = e.nextSibling)
                1 === e.nodeType && e !== t && r.push(e);
            return r
        }
    }),
    et.fn.extend({
        has: function(e) {
            var t = et(e, this)
              , r = t.length;
            return this.filter(function() {
                for (var e = 0; r > e; e++)
                    if (et.contains(this, t[e]))
                        return !0
            })
        },
        closest: function(e, t) {
            for (var r, n = 0, o = this.length, a = [], i = at.test(e) || "string" != typeof e ? et(e, t || this.context) : 0; o > n; n++)
                for (r = this[n]; r && r !== t; r = r.parentNode)
                    if (r.nodeType < 11 && (i ? i.index(r) > -1 : 1 === r.nodeType && et.find.matchesSelector(r, e))) {
                        a.push(r);
                        break
                    }
            return this.pushStack(a.length > 1 ? et.unique(a) : a)
        },
        index: function(e) {
            return e ? "string" == typeof e ? X.call(et(e), this[0]) : X.call(this, e.jquery ? e[0] : e) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
        },
        add: function(e, t) {
            return this.pushStack(et.unique(et.merge(this.get(), et(e, t))))
        },
        addBack: function(e) {
            return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
        }
    }),
    et.each({
        parent: function(e) {
            var t = e.parentNode;
            return t && 11 !== t.nodeType ? t : null
        },
        parents: function(e) {
            return et.dir(e, "parentNode")
        },
        parentsUntil: function(e, t, r) {
            return et.dir(e, "parentNode", r)
        },
        next: function(e) {
            return o(e, "nextSibling")
        },
        prev: function(e) {
            return o(e, "previousSibling")
        },
        nextAll: function(e) {
            return et.dir(e, "nextSibling")
        },
        prevAll: function(e) {
            return et.dir(e, "previousSibling")
        },
        nextUntil: function(e, t, r) {
            return et.dir(e, "nextSibling", r)
        },
        prevUntil: function(e, t, r) {
            return et.dir(e, "previousSibling", r)
        },
        siblings: function(e) {
            return et.sibling((e.parentNode || {}).firstChild, e)
        },
        children: function(e) {
            return et.sibling(e.firstChild)
        },
        contents: function(e) {
            return e.contentDocument || et.merge([], e.childNodes)
        }
    }, function(e, t) {
        et.fn[e] = function(r, n) {
            var o = et.map(this, t, r);
            return "Until" !== e.slice(-5) && (n = r),
            n && "string" == typeof n && (o = et.filter(n, o)),
            this.length > 1 && (pt[e] || et.unique(o),
            dt.test(e) && o.reverse()),
            this.pushStack(o)
        }
    });
    var gt = /\S+/g
      , ht = {};
    et.Callbacks = function(e) {
        e = "string" == typeof e ? ht[e] || a(e) : et.extend({}, e);
        var t, r, n, o, i, s, l = [], c = !e.once && [], u = function(a) {
            for (t = e.memory && a,
            r = !0,
            s = o || 0,
            o = 0,
            i = l.length,
            n = !0; l && i > s; s++)
                if (l[s].apply(a[0], a[1]) === !1 && e.stopOnFalse) {
                    t = !1;
                    break
                }
            n = !1,
            l && (c ? c.length && u(c.shift()) : t ? l = [] : d.disable())
        }, d = {
            add: function() {
                if (l) {
                    var r = l.length;
                    !function a(t) {
                        et.each(t, function(t, r) {
                            var n = et.type(r);
                            "function" === n ? e.unique && d.has(r) || l.push(r) : r && r.length && "string" !== n && a(r)
                        })
                    }(arguments),
                    n ? i = l.length : t && (o = r,
                    u(t))
                }
                return this
            },
            remove: function() {
                return l && et.each(arguments, function(e, t) {
                    for (var r; (r = et.inArray(t, l, r)) > -1; )
                        l.splice(r, 1),
                        n && (i >= r && i--,
                        s >= r && s--)
                }),
                this
            },
            has: function(e) {
                return e ? et.inArray(e, l) > -1 : !(!l || !l.length)
            },
            empty: function() {
                return l = [],
                i = 0,
                this
            },
            disable: function() {
                return l = c = t = void 0,
                this
            },
            disabled: function() {
                return !l
            },
            lock: function() {
                return c = void 0,
                t || d.disable(),
                this
            },
            locked: function() {
                return !c
            },
            fireWith: function(e, t) {
                return !l || r && !c || (t = t || [],
                t = [e, t.slice ? t.slice() : t],
                n ? c.push(t) : u(t)),
                this
            },
            fire: function() {
                return d.fireWith(this, arguments),
                this
            },
            fired: function() {
                return !!r
            }
        };
        return d
    }
    ,
    et.extend({
        Deferred: function(e) {
            var t = [["resolve", "done", et.Callbacks("once memory"), "resolved"], ["reject", "fail", et.Callbacks("once memory"), "rejected"], ["notify", "progress", et.Callbacks("memory")]]
              , r = "pending"
              , n = {
                state: function() {
                    return r
                },
                always: function() {
                    return o.done(arguments).fail(arguments),
                    this
                },
                then: function() {
                    var e = arguments;
                    return et.Deferred(function(r) {
                        et.each(t, function(t, a) {
                            var i = et.isFunction(e[t]) && e[t];
                            o[a[1]](function() {
                                var e = i && i.apply(this, arguments);
                                e && et.isFunction(e.promise) ? e.promise().done(r.resolve).fail(r.reject).progress(r.notify) : r[a[0] + "With"](this === n ? r.promise() : this, i ? [e] : arguments)
                            })
                        }),
                        e = null
                    }).promise()
                },
                promise: function(e) {
                    return null != e ? et.extend(e, n) : n
                }
            }
              , o = {};
            return n.pipe = n.then,
            et.each(t, function(e, a) {
                var i = a[2]
                  , s = a[3];
                n[a[1]] = i.add,
                s && i.add(function() {
                    r = s
                }, t[1 ^ e][2].disable, t[2][2].lock),
                o[a[0]] = function() {
                    return o[a[0] + "With"](this === o ? n : this, arguments),
                    this
                }
                ,
                o[a[0] + "With"] = i.fireWith
            }),
            n.promise(o),
            e && e.call(o, o),
            o
        },
        when: function(e) {
            var t, r, n, o = 0, a = H.call(arguments), i = a.length, s = 1 !== i || e && et.isFunction(e.promise) ? i : 0, l = 1 === s ? e : et.Deferred(), c = function(e, r, n) {
                return function(o) {
                    r[e] = this,
                    n[e] = arguments.length > 1 ? H.call(arguments) : o,
                    n === t ? l.notifyWith(r, n) : --s || l.resolveWith(r, n)
                }
            };
            if (i > 1)
                for (t = new Array(i),
                r = new Array(i),
                n = new Array(i); i > o; o++)
                    a[o] && et.isFunction(a[o].promise) ? a[o].promise().done(c(o, n, a)).fail(l.reject).progress(c(o, r, t)) : --s;
            return s || l.resolveWith(n, a),
            l.promise()
        }
    });
    var ft;
    et.fn.ready = function(e) {
        return et.ready.promise().done(e),
        this
    }
    ,
    et.extend({
        isReady: !1,
        readyWait: 1,
        holdReady: function(e) {
            e ? et.readyWait++ : et.ready(!0)
        },
        ready: function(e) {
            (e === !0 ? --et.readyWait : et.isReady) || (et.isReady = !0,
            e !== !0 && --et.readyWait > 0 || (ft.resolveWith(Q, [et]),
            et.fn.trigger && et(Q).trigger("ready").off("ready")))
        }
    }),
    et.ready.promise = function(t) {
        return ft || (ft = et.Deferred(),
        "complete" === Q.readyState ? setTimeout(et.ready) : (Q.addEventListener("DOMContentLoaded", i, !1),
        e.addEventListener("load", i, !1))),
        ft.promise(t)
    }
    ,
    et.ready.promise();
    var mt = et.access = function(e, t, r, n, o, a, i) {
        var s = 0
          , l = e.length
          , c = null == r;
        if ("object" === et.type(r)) {
            o = !0;
            for (s in r)
                et.access(e, t, s, r[s], !0, a, i)
        } else if (void 0 !== n && (o = !0,
        et.isFunction(n) || (i = !0),
        c && (i ? (t.call(e, n),
        t = null) : (c = t,
        t = function(e, t, r) {
            return c.call(et(e), r)
        }
        )),
        t))
            for (; l > s; s++)
                t(e[s], r, i ? n : n.call(e[s], s, t(e[s], r)));
        return o ? e : c ? t.call(e) : l ? t(e[0], r) : a
    }
    ;
    et.acceptData = function(e) {
        return 1 === e.nodeType || 9 === e.nodeType || !+e.nodeType
    }
    ,
    s.uid = 1,
    s.accepts = et.acceptData,
    s.prototype = {
        key: function(e) {
            if (!s.accepts(e))
                return 0;
            var t = {}
              , r = e[this.expando];
            if (!r) {
                r = s.uid++;
                try {
                    t[this.expando] = {
                        value: r
                    },
                    Object.defineProperties(e, t)
                } catch (n) {
                    t[this.expando] = r,
                    et.extend(e, t)
                }
            }
            return this.cache[r] || (this.cache[r] = {}),
            r
        },
        set: function(e, t, r) {
            var n, o = this.key(e), a = this.cache[o];
            if ("string" == typeof t)
                a[t] = r;
            else if (et.isEmptyObject(a))
                et.extend(this.cache[o], t);
            else
                for (n in t)
                    a[n] = t[n];
            return a
        },
        get: function(e, t) {
            var r = this.cache[this.key(e)];
            return void 0 === t ? r : r[t]
        },
        access: function(e, t, r) {
            var n;
            return void 0 === t || t && "string" == typeof t && void 0 === r ? (n = this.get(e, t),
            void 0 !== n ? n : this.get(e, et.camelCase(t))) : (this.set(e, t, r),
            void 0 !== r ? r : t)
        },
        remove: function(e, t) {
            var r, n, o, a = this.key(e), i = this.cache[a];
            if (void 0 === t)
                this.cache[a] = {};
            else {
                et.isArray(t) ? n = t.concat(t.map(et.camelCase)) : (o = et.camelCase(t),
                t in i ? n = [t, o] : (n = o,
                n = n in i ? [n] : n.match(gt) || [])),
                r = n.length;
                for (; r--; )
                    delete i[n[r]]
            }
        },
        hasData: function(e) {
            return !et.isEmptyObject(this.cache[e[this.expando]] || {})
        },
        discard: function(e) {
            e[this.expando] && delete this.cache[e[this.expando]]
        }
    };
    var _t = new s
      , yt = new s
      , xt = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/
      , vt = /([A-Z])/g;
    et.extend({
        hasData: function(e) {
            return yt.hasData(e) || _t.hasData(e)
        },
        data: function(e, t, r) {
            return yt.access(e, t, r)
        },
        removeData: function(e, t) {
            yt.remove(e, t)
        },
        _data: function(e, t, r) {
            return _t.access(e, t, r)
        },
        _removeData: function(e, t) {
            _t.remove(e, t)
        }
    }),
    et.fn.extend({
        data: function(e, t) {
            var r, n, o, a = this[0], i = a && a.attributes;
            if (void 0 === e) {
                if (this.length && (o = yt.get(a),
                1 === a.nodeType && !_t.get(a, "hasDataAttrs"))) {
                    for (r = i.length; r--; )
                        n = i[r].name,
                        0 === n.indexOf("data-") && (n = et.camelCase(n.slice(5)),
                        l(a, n, o[n]));
                    _t.set(a, "hasDataAttrs", !0)
                }
                return o
            }
            return "object" == typeof e ? this.each(function() {
                yt.set(this, e)
            }) : mt(this, function(t) {
                var r, n = et.camelCase(e);
                if (a && void 0 === t) {
                    if (r = yt.get(a, e),
                    void 0 !== r)
                        return r;
                    if (r = yt.get(a, n),
                    void 0 !== r)
                        return r;
                    if (r = l(a, n, void 0),
                    void 0 !== r)
                        return r
                } else
                    this.each(function() {
                        var r = yt.get(this, n);
                        yt.set(this, n, t),
                        -1 !== e.indexOf("-") && void 0 !== r && yt.set(this, e, t)
                    })
            }, null, t, arguments.length > 1, null, !0)
        },
        removeData: function(e) {
            return this.each(function() {
                yt.remove(this, e)
            })
        }
    }),
    et.extend({
        queue: function(e, t, r) {
            var n;
            return e ? (t = (t || "fx") + "queue",
            n = _t.get(e, t),
            r && (!n || et.isArray(r) ? n = _t.access(e, t, et.makeArray(r)) : n.push(r)),
            n || []) : void 0
        },
        dequeue: function(e, t) {
            t = t || "fx";
            var r = et.queue(e, t)
              , n = r.length
              , o = r.shift()
              , a = et._queueHooks(e, t)
              , i = function() {
                et.dequeue(e, t)
            };
            "inprogress" === o && (o = r.shift(),
            n--),
            o && ("fx" === t && r.unshift("inprogress"),
            delete a.stop,
            o.call(e, i, a)),
            !n && a && a.empty.fire()
        },
        _queueHooks: function(e, t) {
            var r = t + "queueHooks";
            return _t.get(e, r) || _t.access(e, r, {
                empty: et.Callbacks("once memory").add(function() {
                    _t.remove(e, [t + "queue", r])
                })
            })
        }
    }),
    et.fn.extend({
        queue: function(e, t) {
            var r = 2;
            return "string" != typeof e && (t = e,
            e = "fx",
            r--),
            arguments.length < r ? et.queue(this[0], e) : void 0 === t ? this : this.each(function() {
                var r = et.queue(this, e, t);
                et._queueHooks(this, e),
                "fx" === e && "inprogress" !== r[0] && et.dequeue(this, e)
            })
        },
        dequeue: function(e) {
            return this.each(function() {
                et.dequeue(this, e)
            })
        },
        clearQueue: function(e) {
            return this.queue(e || "fx", [])
        },
        promise: function(e, t) {
            var r, n = 1, o = et.Deferred(), a = this, i = this.length, s = function() {
                --n || o.resolveWith(a, [a])
            };
            for ("string" != typeof e && (t = e,
            e = void 0),
            e = e || "fx"; i--; )
                r = _t.get(a[i], e + "queueHooks"),
                r && r.empty && (n++,
                r.empty.add(s));
            return s(),
            o.promise(t)
        }
    });
    var bt = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source
      , wt = ["Top", "Right", "Bottom", "Left"]
      , Ct = function(e, t) {
        return e = t || e,
        "none" === et.css(e, "display") || !et.contains(e.ownerDocument, e)
    }
      , St = /^(?:checkbox|radio)$/i;
    !function() {
        var e = Q.createDocumentFragment()
          , t = e.appendChild(Q.createElement("div"));
        t.innerHTML = "<input type='radio' checked='checked' name='t'/>",
        J.checkClone = t.cloneNode(!0).cloneNode(!0).lastChild.checked,
        t.innerHTML = "<textarea>x</textarea>",
        J.noCloneChecked = !!t.cloneNode(!0).lastChild.defaultValue
    }();
    var Tt = "undefined";
    J.focusinBubbles = "onfocusin"in e;
    var kt = /^key/
      , Pt = /^(?:mouse|contextmenu)|click/
      , At = /^(?:focusinfocus|focusoutblur)$/
      , Dt = /^([^.]*)(?:\.(.+)|)$/;
    et.event = {
        global: {},
        add: function(e, t, r, n, o) {
            var a, i, s, l, c, u, d, p, g, h, f, m = _t.get(e);
            if (m)
                for (r.handler && (a = r,
                r = a.handler,
                o = a.selector),
                r.guid || (r.guid = et.guid++),
                (l = m.events) || (l = m.events = {}),
                (i = m.handle) || (i = m.handle = function(t) {
                    return typeof et !== Tt && et.event.triggered !== t.type ? et.event.dispatch.apply(e, arguments) : void 0
                }
                ),
                t = (t || "").match(gt) || [""],
                c = t.length; c--; )
                    s = Dt.exec(t[c]) || [],
                    g = f = s[1],
                    h = (s[2] || "").split(".").sort(),
                    g && (d = et.event.special[g] || {},
                    g = (o ? d.delegateType : d.bindType) || g,
                    d = et.event.special[g] || {},
                    u = et.extend({
                        type: g,
                        origType: f,
                        data: n,
                        handler: r,
                        guid: r.guid,
                        selector: o,
                        needsContext: o && et.expr.match.needsContext.test(o),
                        namespace: h.join(".")
                    }, a),
                    (p = l[g]) || (p = l[g] = [],
                    p.delegateCount = 0,
                    d.setup && d.setup.call(e, n, h, i) !== !1 || e.addEventListener && e.addEventListener(g, i, !1)),
                    d.add && (d.add.call(e, u),
                    u.handler.guid || (u.handler.guid = r.guid)),
                    o ? p.splice(p.delegateCount++, 0, u) : p.push(u),
                    et.event.global[g] = !0)
        },
        remove: function(e, t, r, n, o) {
            var a, i, s, l, c, u, d, p, g, h, f, m = _t.hasData(e) && _t.get(e);
            if (m && (l = m.events)) {
                for (t = (t || "").match(gt) || [""],
                c = t.length; c--; )
                    if (s = Dt.exec(t[c]) || [],
                    g = f = s[1],
                    h = (s[2] || "").split(".").sort(),
                    g) {
                        for (d = et.event.special[g] || {},
                        g = (n ? d.delegateType : d.bindType) || g,
                        p = l[g] || [],
                        s = s[2] && new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)"),
                        i = a = p.length; a--; )
                            u = p[a],
                            !o && f !== u.origType || r && r.guid !== u.guid || s && !s.test(u.namespace) || n && n !== u.selector && ("**" !== n || !u.selector) || (p.splice(a, 1),
                            u.selector && p.delegateCount--,
                            d.remove && d.remove.call(e, u));
                        i && !p.length && (d.teardown && d.teardown.call(e, h, m.handle) !== !1 || et.removeEvent(e, g, m.handle),
                        delete l[g])
                    } else
                        for (g in l)
                            et.event.remove(e, g + t[c], r, n, !0);
                et.isEmptyObject(l) && (delete m.handle,
                _t.remove(e, "events"))
            }
        },
        trigger: function(t, r, n, o) {
            var a, i, s, l, c, u, d, p = [n || Q], g = $.call(t, "type") ? t.type : t, h = $.call(t, "namespace") ? t.namespace.split(".") : [];
            if (i = s = n = n || Q,
            3 !== n.nodeType && 8 !== n.nodeType && !At.test(g + et.event.triggered) && (g.indexOf(".") >= 0 && (h = g.split("."),
            g = h.shift(),
            h.sort()),
            c = g.indexOf(":") < 0 && "on" + g,
            t = t[et.expando] ? t : new et.Event(g,"object" == typeof t && t),
            t.isTrigger = o ? 2 : 3,
            t.namespace = h.join("."),
            t.namespace_re = t.namespace ? new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)") : null,
            t.result = void 0,
            t.target || (t.target = n),
            r = null == r ? [t] : et.makeArray(r, [t]),
            d = et.event.special[g] || {},
            o || !d.trigger || d.trigger.apply(n, r) !== !1)) {
                if (!o && !d.noBubble && !et.isWindow(n)) {
                    for (l = d.delegateType || g,
                    At.test(l + g) || (i = i.parentNode); i; i = i.parentNode)
                        p.push(i),
                        s = i;
                    s === (n.ownerDocument || Q) && p.push(s.defaultView || s.parentWindow || e)
                }
                for (a = 0; (i = p[a++]) && !t.isPropagationStopped(); )
                    t.type = a > 1 ? l : d.bindType || g,
                    u = (_t.get(i, "events") || {})[t.type] && _t.get(i, "handle"),
                    u && u.apply(i, r),
                    u = c && i[c],
                    u && u.apply && et.acceptData(i) && (t.result = u.apply(i, r),
                    t.result === !1 && t.preventDefault());
                return t.type = g,
                o || t.isDefaultPrevented() || d._default && d._default.apply(p.pop(), r) !== !1 || !et.acceptData(n) || c && et.isFunction(n[g]) && !et.isWindow(n) && (s = n[c],
                s && (n[c] = null),
                et.event.triggered = g,
                n[g](),
                et.event.triggered = void 0,
                s && (n[c] = s)),
                t.result
            }
        },
        dispatch: function(e) {
            e = et.event.fix(e);
            var t, r, n, o, a, i = [], s = H.call(arguments), l = (_t.get(this, "events") || {})[e.type] || [], c = et.event.special[e.type] || {};
            if (s[0] = e,
            e.delegateTarget = this,
            !c.preDispatch || c.preDispatch.call(this, e) !== !1) {
                for (i = et.event.handlers.call(this, e, l),
                t = 0; (o = i[t++]) && !e.isPropagationStopped(); )
                    for (e.currentTarget = o.elem,
                    r = 0; (a = o.handlers[r++]) && !e.isImmediatePropagationStopped(); )
                        (!e.namespace_re || e.namespace_re.test(a.namespace)) && (e.handleObj = a,
                        e.data = a.data,
                        n = ((et.event.special[a.origType] || {}).handle || a.handler).apply(o.elem, s),
                        void 0 !== n && (e.result = n) === !1 && (e.preventDefault(),
                        e.stopPropagation()));
                return c.postDispatch && c.postDispatch.call(this, e),
                e.result
            }
        },
        handlers: function(e, t) {
            var r, n, o, a, i = [], s = t.delegateCount, l = e.target;
            if (s && l.nodeType && (!e.button || "click" !== e.type))
                for (; l !== this; l = l.parentNode || this)
                    if (l.disabled !== !0 || "click" !== e.type) {
                        for (n = [],
                        r = 0; s > r; r++)
                            a = t[r],
                            o = a.selector + " ",
                            void 0 === n[o] && (n[o] = a.needsContext ? et(o, this).index(l) >= 0 : et.find(o, this, null, [l]).length),
                            n[o] && n.push(a);
                        n.length && i.push({
                            elem: l,
                            handlers: n
                        })
                    }
            return s < t.length && i.push({
                elem: this,
                handlers: t.slice(s)
            }),
            i
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(e, t) {
                return null == e.which && (e.which = null != t.charCode ? t.charCode : t.keyCode),
                e
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(e, t) {
                var r, n, o, a = t.button;
                return null == e.pageX && null != t.clientX && (r = e.target.ownerDocument || Q,
                n = r.documentElement,
                o = r.body,
                e.pageX = t.clientX + (n && n.scrollLeft || o && o.scrollLeft || 0) - (n && n.clientLeft || o && o.clientLeft || 0),
                e.pageY = t.clientY + (n && n.scrollTop || o && o.scrollTop || 0) - (n && n.clientTop || o && o.clientTop || 0)),
                e.which || void 0 === a || (e.which = 1 & a ? 1 : 2 & a ? 3 : 4 & a ? 2 : 0),
                e
            }
        },
        fix: function(e) {
            if (e[et.expando])
                return e;
            var t, r, n, o = e.type, a = e, i = this.fixHooks[o];
            for (i || (this.fixHooks[o] = i = Pt.test(o) ? this.mouseHooks : kt.test(o) ? this.keyHooks : {}),
            n = i.props ? this.props.concat(i.props) : this.props,
            e = new et.Event(a),
            t = n.length; t--; )
                r = n[t],
                e[r] = a[r];
            return e.target || (e.target = Q),
            3 === e.target.nodeType && (e.target = e.target.parentNode),
            i.filter ? i.filter(e, a) : e
        },
        special: {
            load: {
                noBubble: !0
            },
            focus: {
                trigger: function() {
                    return this !== d() && this.focus ? (this.focus(),
                    !1) : void 0
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    return this === d() && this.blur ? (this.blur(),
                    !1) : void 0
                },
                delegateType: "focusout"
            },
            click: {
                trigger: function() {
                    return "checkbox" === this.type && this.click && et.nodeName(this, "input") ? (this.click(),
                    !1) : void 0
                },
                _default: function(e) {
                    return et.nodeName(e.target, "a")
                }
            },
            beforeunload: {
                postDispatch: function(e) {
                    void 0 !== e.result && (e.originalEvent.returnValue = e.result)
                }
            }
        },
        simulate: function(e, t, r, n) {
            var o = et.extend(new et.Event, r, {
                type: e,
                isSimulated: !0,
                originalEvent: {}
            });
            n ? et.event.trigger(o, null, t) : et.event.dispatch.call(t, o),
            o.isDefaultPrevented() && r.preventDefault()
        }
    },
    et.removeEvent = function(e, t, r) {
        e.removeEventListener && e.removeEventListener(t, r, !1)
    }
    ,
    et.Event = function(e, t) {
        return this instanceof et.Event ? (e && e.type ? (this.originalEvent = e,
        this.type = e.type,
        this.isDefaultPrevented = e.defaultPrevented || void 0 === e.defaultPrevented && e.getPreventDefault && e.getPreventDefault() ? c : u) : this.type = e,
        t && et.extend(this, t),
        this.timeStamp = e && e.timeStamp || et.now(),
        void (this[et.expando] = !0)) : new et.Event(e,t)
    }
    ,
    et.Event.prototype = {
        isDefaultPrevented: u,
        isPropagationStopped: u,
        isImmediatePropagationStopped: u,
        preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = c,
            e && e.preventDefault && e.preventDefault()
        },
        stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = c,
            e && e.stopPropagation && e.stopPropagation()
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = c,
            this.stopPropagation()
        }
    },
    et.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(e, t) {
        et.event.special[e] = {
            delegateType: t,
            bindType: t,
            handle: function(e) {
                var r, n = this, o = e.relatedTarget, a = e.handleObj;
                return (!o || o !== n && !et.contains(n, o)) && (e.type = a.origType,
                r = a.handler.apply(this, arguments),
                e.type = t),
                r
            }
        }
    }),
    J.focusinBubbles || et.each({
        focus: "focusin",
        blur: "focusout"
    }, function(e, t) {
        var r = function(e) {
            et.event.simulate(t, e.target, et.event.fix(e), !0)
        };
        et.event.special[t] = {
            setup: function() {
                var n = this.ownerDocument || this
                  , o = _t.access(n, t);
                o || n.addEventListener(e, r, !0),
                _t.access(n, t, (o || 0) + 1)
            },
            teardown: function() {
                var n = this.ownerDocument || this
                  , o = _t.access(n, t) - 1;
                o ? _t.access(n, t, o) : (n.removeEventListener(e, r, !0),
                _t.remove(n, t))
            }
        }
    }),
    et.fn.extend({
        on: function(e, t, r, n, o) {
            var a, i;
            if ("object" == typeof e) {
                "string" != typeof t && (r = r || t,
                t = void 0);
                for (i in e)
                    this.on(i, t, r, e[i], o);
                return this
            }
            if (null == r && null == n ? (n = t,
            r = t = void 0) : null == n && ("string" == typeof t ? (n = r,
            r = void 0) : (n = r,
            r = t,
            t = void 0)),
            n === !1)
                n = u;
            else if (!n)
                return this;
            return 1 === o && (a = n,
            n = function(e) {
                return et().off(e),
                a.apply(this, arguments)
            }
            ,
            n.guid = a.guid || (a.guid = et.guid++)),
            this.each(function() {
                et.event.add(this, e, n, r, t)
            })
        },
        one: function(e, t, r, n) {
            return this.on(e, t, r, n, 1)
        },
        off: function(e, t, r) {
            var n, o;
            if (e && e.preventDefault && e.handleObj)
                return n = e.handleObj,
                et(e.delegateTarget).off(n.namespace ? n.origType + "." + n.namespace : n.origType, n.selector, n.handler),
                this;
            if ("object" == typeof e) {
                for (o in e)
                    this.off(o, t, e[o]);
                return this
            }
            return (t === !1 || "function" == typeof t) && (r = t,
            t = void 0),
            r === !1 && (r = u),
            this.each(function() {
                et.event.remove(this, e, r, t)
            })
        },
        trigger: function(e, t) {
            return this.each(function() {
                et.event.trigger(e, t, this)
            })
        },
        triggerHandler: function(e, t) {
            var r = this[0];
            return r ? et.event.trigger(e, t, r, !0) : void 0
        }
    });
    var It = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi
      , Nt = /<([\w:]+)/
      , Ft = /<|&#?\w+;/
      , Et = /<(?:script|style|link)/i
      , Mt = /checked\s*(?:[^=]|=\s*.checked.)/i
      , Bt = /^$|\/(?:java|ecma)script/i
      , Rt = /^true\/(.*)/
      , Wt = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g
      , Ot = {
        option: [1, "<select multiple='multiple'>", "</select>"],
        thead: [1, "<table>", "</table>"],
        col: [2, "<table><colgroup>", "</colgroup></table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        _default: [0, "", ""]
    };
    Ot.optgroup = Ot.option,
    Ot.tbody = Ot.tfoot = Ot.colgroup = Ot.caption = Ot.thead,
    Ot.th = Ot.td,
    et.extend({
        clone: function(e, t, r) {
            var n, o, a, i, s = e.cloneNode(!0), l = et.contains(e.ownerDocument, e);
            if (!(J.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || et.isXMLDoc(e)))
                for (i = _(s),
                a = _(e),
                n = 0,
                o = a.length; o > n; n++)
                    y(a[n], i[n]);
            if (t)
                if (r)
                    for (a = a || _(e),
                    i = i || _(s),
                    n = 0,
                    o = a.length; o > n; n++)
                        m(a[n], i[n]);
                else
                    m(e, s);
            return i = _(s, "script"),
            i.length > 0 && f(i, !l && _(e, "script")),
            s
        },
        buildFragment: function(e, t, r, n) {
            for (var o, a, i, s, l, c, u = t.createDocumentFragment(), d = [], p = 0, g = e.length; g > p; p++)
                if (o = e[p],
                o || 0 === o)
                    if ("object" === et.type(o))
                        et.merge(d, o.nodeType ? [o] : o);
                    else if (Ft.test(o)) {
                        for (a = a || u.appendChild(t.createElement("div")),
                        i = (Nt.exec(o) || ["", ""])[1].toLowerCase(),
                        s = Ot[i] || Ot._default,
                        a.innerHTML = s[1] + o.replace(It, "<$1></$2>") + s[2],
                        c = s[0]; c--; )
                            a = a.lastChild;
                        et.merge(d, a.childNodes),
                        a = u.firstChild,
                        a.textContent = ""
                    } else
                        d.push(t.createTextNode(o));
            for (u.textContent = "",
            p = 0; o = d[p++]; )
                if ((!n || -1 === et.inArray(o, n)) && (l = et.contains(o.ownerDocument, o),
                a = _(u.appendChild(o), "script"),
                l && f(a),
                r))
                    for (c = 0; o = a[c++]; )
                        Bt.test(o.type || "") && r.push(o);
            return u
        },
        cleanData: function(e) {
            for (var t, r, n, o, a, i, s = et.event.special, l = 0; void 0 !== (r = e[l]); l++) {
                if (et.acceptData(r) && (a = r[_t.expando],
                a && (t = _t.cache[a]))) {
                    if (n = Object.keys(t.events || {}),
                    n.length)
                        for (i = 0; void 0 !== (o = n[i]); i++)
                            s[o] ? et.event.remove(r, o) : et.removeEvent(r, o, t.handle);
                    _t.cache[a] && delete _t.cache[a]
                }
                delete yt.cache[r[yt.expando]]
            }
        }
    }),
    et.fn.extend({
        text: function(e) {
            return mt(this, function(e) {
                return void 0 === e ? et.text(this) : this.empty().each(function() {
                    (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && (this.textContent = e)
                })
            }, null, e, arguments.length)
        },
        append: function() {
            return this.domManip(arguments, function(e) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var t = p(this, e);
                    t.appendChild(e)
                }
            })
        },
        prepend: function() {
            return this.domManip(arguments, function(e) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var t = p(this, e);
                    t.insertBefore(e, t.firstChild)
                }
            })
        },
        before: function() {
            return this.domManip(arguments, function(e) {
                this.parentNode && this.parentNode.insertBefore(e, this)
            })
        },
        after: function() {
            return this.domManip(arguments, function(e) {
                this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
            })
        },
        remove: function(e, t) {
            for (var r, n = e ? et.filter(e, this) : this, o = 0; null != (r = n[o]); o++)
                t || 1 !== r.nodeType || et.cleanData(_(r)),
                r.parentNode && (t && et.contains(r.ownerDocument, r) && f(_(r, "script")),
                r.parentNode.removeChild(r));
            return this
        },
        empty: function() {
            for (var e, t = 0; null != (e = this[t]); t++)
                1 === e.nodeType && (et.cleanData(_(e, !1)),
                e.textContent = "");
            return this
        },
        clone: function(e, t) {
            return e = null == e ? !1 : e,
            t = null == t ? e : t,
            this.map(function() {
                return et.clone(this, e, t)
            })
        },
        html: function(e) {
            return mt(this, function(e) {
                var t = this[0] || {}
                  , r = 0
                  , n = this.length;
                if (void 0 === e && 1 === t.nodeType)
                    return t.innerHTML;
                if ("string" == typeof e && !Et.test(e) && !Ot[(Nt.exec(e) || ["", ""])[1].toLowerCase()]) {
                    e = e.replace(It, "<$1></$2>");
                    try {
                        for (; n > r; r++)
                            t = this[r] || {},
                            1 === t.nodeType && (et.cleanData(_(t, !1)),
                            t.innerHTML = e);
                        t = 0
                    } catch (o) {}
                }
                t && this.empty().append(e)
            }, null, e, arguments.length)
        },
        replaceWith: function() {
            var e = arguments[0];
            return this.domManip(arguments, function(t) {
                e = this.parentNode,
                et.cleanData(_(this)),
                e && e.replaceChild(t, this)
            }),
            e && (e.length || e.nodeType) ? this : this.remove()
        },
        detach: function(e) {
            return this.remove(e, !0)
        },
        domManip: function(e, t) {
            e = Y.apply([], e);
            var r, n, o, a, i, s, l = 0, c = this.length, u = this, d = c - 1, p = e[0], f = et.isFunction(p);
            if (f || c > 1 && "string" == typeof p && !J.checkClone && Mt.test(p))
                return this.each(function(r) {
                    var n = u.eq(r);
                    f && (e[0] = p.call(this, r, n.html())),
                    n.domManip(e, t)
                });
            if (c && (r = et.buildFragment(e, this[0].ownerDocument, !1, this),
            n = r.firstChild,
            1 === r.childNodes.length && (r = n),
            n)) {
                for (o = et.map(_(r, "script"), g),
                a = o.length; c > l; l++)
                    i = r,
                    l !== d && (i = et.clone(i, !0, !0),
                    a && et.merge(o, _(i, "script"))),
                    t.call(this[l], i, l);
                if (a)
                    for (s = o[o.length - 1].ownerDocument,
                    et.map(o, h),
                    l = 0; a > l; l++)
                        i = o[l],
                        Bt.test(i.type || "") && !_t.access(i, "globalEval") && et.contains(s, i) && (i.src ? et._evalUrl && et._evalUrl(i.src) : et.globalEval(i.textContent.replace(Wt, "")))
            }
            return this
        }
    }),
    et.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(e, t) {
        et.fn[e] = function(e) {
            for (var r, n = [], o = et(e), a = o.length - 1, i = 0; a >= i; i++)
                r = i === a ? this : this.clone(!0),
                et(o[i])[t](r),
                G.apply(n, r.get());
            return this.pushStack(n)
        }
    });
    var zt, Lt = {}, jt = /^margin/, qt = new RegExp("^(" + bt + ")(?!px)[a-z%]+$","i"), Ht = function(e) {
        return e.ownerDocument.defaultView.getComputedStyle(e, null)
    };
    !function() {
        function t() {
            s.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%",
            a.appendChild(i);
            var t = e.getComputedStyle(s, null);
            r = "1%" !== t.top,
            n = "4px" === t.width,
            a.removeChild(i)
        }
        var r, n, o = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box", a = Q.documentElement, i = Q.createElement("div"), s = Q.createElement("div");
        s.style.backgroundClip = "content-box",
        s.cloneNode(!0).style.backgroundClip = "",
        J.clearCloneStyle = "content-box" === s.style.backgroundClip,
        i.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",
        i.appendChild(s),
        e.getComputedStyle && et.extend(J, {
            pixelPosition: function() {
                return t(),
                r
            },
            boxSizingReliable: function() {
                return null == n && t(),
                n
            },
            reliableMarginRight: function() {
                var t, r = s.appendChild(Q.createElement("div"));
                return r.style.cssText = s.style.cssText = o,
                r.style.marginRight = r.style.width = "0",
                s.style.width = "1px",
                a.appendChild(i),
                t = !parseFloat(e.getComputedStyle(r, null).marginRight),
                a.removeChild(i),
                s.innerHTML = "",
                t
            }
        })
    }(),
    et.swap = function(e, t, r, n) {
        var o, a, i = {};
        for (a in t)
            i[a] = e.style[a],
            e.style[a] = t[a];
        o = r.apply(e, n || []);
        for (a in t)
            e.style[a] = i[a];
        return o
    }
    ;
    var Yt = /^(none|table(?!-c[ea]).+)/
      , Gt = new RegExp("^(" + bt + ")(.*)$","i")
      , Xt = new RegExp("^([+-])=(" + bt + ")","i")
      , Vt = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }
      , Ut = {
        letterSpacing: 0,
        fontWeight: 400
    }
      , $t = ["Webkit", "O", "Moz", "ms"];
    et.extend({
        cssHooks: {
            opacity: {
                get: function(e, t) {
                    if (t) {
                        var r = b(e, "opacity");
                        return "" === r ? "1" : r
                    }
                }
            }
        },
        cssNumber: {
            columnCount: !0,
            fillOpacity: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            "float": "cssFloat"
        },
        style: function(e, t, r, n) {
            if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
                var o, a, i, s = et.camelCase(t), l = e.style;
                return t = et.cssProps[s] || (et.cssProps[s] = C(l, s)),
                i = et.cssHooks[t] || et.cssHooks[s],
                void 0 === r ? i && "get"in i && void 0 !== (o = i.get(e, !1, n)) ? o : l[t] : (a = typeof r,
                "string" === a && (o = Xt.exec(r)) && (r = (o[1] + 1) * o[2] + parseFloat(et.css(e, t)),
                a = "number"),
                null != r && r === r && ("number" !== a || et.cssNumber[s] || (r += "px"),
                J.clearCloneStyle || "" !== r || 0 !== t.indexOf("background") || (l[t] = "inherit"),
                i && "set"in i && void 0 === (r = i.set(e, r, n)) || (l[t] = "",
                l[t] = r)),
                void 0)
            }
        },
        css: function(e, t, r, n) {
            var o, a, i, s = et.camelCase(t);
            return t = et.cssProps[s] || (et.cssProps[s] = C(e.style, s)),
            i = et.cssHooks[t] || et.cssHooks[s],
            i && "get"in i && (o = i.get(e, !0, r)),
            void 0 === o && (o = b(e, t, n)),
            "normal" === o && t in Ut && (o = Ut[t]),
            "" === r || r ? (a = parseFloat(o),
            r === !0 || et.isNumeric(a) ? a || 0 : o) : o
        }
    }),
    et.each(["height", "width"], function(e, t) {
        et.cssHooks[t] = {
            get: function(e, r, n) {
                return r ? 0 === e.offsetWidth && Yt.test(et.css(e, "display")) ? et.swap(e, Vt, function() {
                    return k(e, t, n)
                }) : k(e, t, n) : void 0
            },
            set: function(e, r, n) {
                var o = n && Ht(e);
                return S(e, r, n ? T(e, t, n, "border-box" === et.css(e, "boxSizing", !1, o), o) : 0)
            }
        }
    }),
    et.cssHooks.marginRight = w(J.reliableMarginRight, function(e, t) {
        return t ? et.swap(e, {
            display: "inline-block"
        }, b, [e, "marginRight"]) : void 0
    }),
    et.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(e, t) {
        et.cssHooks[e + t] = {
            expand: function(r) {
                for (var n = 0, o = {}, a = "string" == typeof r ? r.split(" ") : [r]; 4 > n; n++)
                    o[e + wt[n] + t] = a[n] || a[n - 2] || a[0];
                return o
            }
        },
        jt.test(e) || (et.cssHooks[e + t].set = S)
    }),
    et.fn.extend({
        css: function(e, t) {
            return mt(this, function(e, t, r) {
                var n, o, a = {}, i = 0;
                if (et.isArray(t)) {
                    for (n = Ht(e),
                    o = t.length; o > i; i++)
                        a[t[i]] = et.css(e, t[i], !1, n);
                    return a
                }
                return void 0 !== r ? et.style(e, t, r) : et.css(e, t)
            }, e, t, arguments.length > 1)
        },
        show: function() {
            return P(this, !0)
        },
        hide: function() {
            return P(this)
        },
        toggle: function(e) {
            return "boolean" == typeof e ? e ? this.show() : this.hide() : this.each(function() {
                Ct(this) ? et(this).show() : et(this).hide()
            })
        }
    }),
    et.Tween = A,
    A.prototype = {
        constructor: A,
        init: function(e, t, r, n, o, a) {
            this.elem = e,
            this.prop = r,
            this.easing = o || "swing",
            this.options = t,
            this.start = this.now = this.cur(),
            this.end = n,
            this.unit = a || (et.cssNumber[r] ? "" : "px")
        },
        cur: function() {
            var e = A.propHooks[this.prop];
            return e && e.get ? e.get(this) : A.propHooks._default.get(this)
        },
        run: function(e) {
            var t, r = A.propHooks[this.prop];
            return this.pos = t = this.options.duration ? et.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : e,
            this.now = (this.end - this.start) * t + this.start,
            this.options.step && this.options.step.call(this.elem, this.now, this),
            r && r.set ? r.set(this) : A.propHooks._default.set(this),
            this
        }
    },
    A.prototype.init.prototype = A.prototype,
    A.propHooks = {
        _default: {
            get: function(e) {
                var t;
                return null == e.elem[e.prop] || e.elem.style && null != e.elem.style[e.prop] ? (t = et.css(e.elem, e.prop, ""),
                t && "auto" !== t ? t : 0) : e.elem[e.prop]
            },
            set: function(e) {
                et.fx.step[e.prop] ? et.fx.step[e.prop](e) : e.elem.style && (null != e.elem.style[et.cssProps[e.prop]] || et.cssHooks[e.prop]) ? et.style(e.elem, e.prop, e.now + e.unit) : e.elem[e.prop] = e.now
            }
        }
    },
    A.propHooks.scrollTop = A.propHooks.scrollLeft = {
        set: function(e) {
            e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
        }
    },
    et.easing = {
        linear: function(e) {
            return e
        },
        swing: function(e) {
            return .5 - Math.cos(e * Math.PI) / 2
        }
    },
    et.fx = A.prototype.init,
    et.fx.step = {};
    var Kt, Jt, Qt = /^(?:toggle|show|hide)$/, Zt = new RegExp("^(?:([+-])=|)(" + bt + ")([a-z%]*)$","i"), er = /queueHooks$/, tr = [F], rr = {
        "*": [function(e, t) {
            var r = this.createTween(e, t)
              , n = r.cur()
              , o = Zt.exec(t)
              , a = o && o[3] || (et.cssNumber[e] ? "" : "px")
              , i = (et.cssNumber[e] || "px" !== a && +n) && Zt.exec(et.css(r.elem, e))
              , s = 1
              , l = 20;
            if (i && i[3] !== a) {
                a = a || i[3],
                o = o || [],
                i = +n || 1;
                do
                    s = s || ".5",
                    i /= s,
                    et.style(r.elem, e, i + a);
                while (s !== (s = r.cur() / n) && 1 !== s && --l)
            }
            return o && (i = r.start = +i || +n || 0,
            r.unit = a,
            r.end = o[1] ? i + (o[1] + 1) * o[2] : +o[2]),
            r
        }
        ]
    };
    et.Animation = et.extend(M, {
        tweener: function(e, t) {
            et.isFunction(e) ? (t = e,
            e = ["*"]) : e = e.split(" ");
            for (var r, n = 0, o = e.length; o > n; n++)
                r = e[n],
                rr[r] = rr[r] || [],
                rr[r].unshift(t)
        },
        prefilter: function(e, t) {
            t ? tr.unshift(e) : tr.push(e)
        }
    }),
    et.speed = function(e, t, r) {
        var n = e && "object" == typeof e ? et.extend({}, e) : {
            complete: r || !r && t || et.isFunction(e) && e,
            duration: e,
            easing: r && t || t && !et.isFunction(t) && t
        };
        return n.duration = et.fx.off ? 0 : "number" == typeof n.duration ? n.duration : n.duration in et.fx.speeds ? et.fx.speeds[n.duration] : et.fx.speeds._default,
        (null == n.queue || n.queue === !0) && (n.queue = "fx"),
        n.old = n.complete,
        n.complete = function() {
            et.isFunction(n.old) && n.old.call(this),
            n.queue && et.dequeue(this, n.queue)
        }
        ,
        n
    }
    ,
    et.fn.extend({
        fadeTo: function(e, t, r, n) {
            return this.filter(Ct).css("opacity", 0).show().end().animate({
                opacity: t
            }, e, r, n)
        },
        animate: function(e, t, r, n) {
            var o = et.isEmptyObject(e)
              , a = et.speed(t, r, n)
              , i = function() {
                var t = M(this, et.extend({}, e), a);
                (o || _t.get(this, "finish")) && t.stop(!0)
            };
            return i.finish = i,
            o || a.queue === !1 ? this.each(i) : this.queue(a.queue, i)
        },
        stop: function(e, t, r) {
            var n = function(e) {
                var t = e.stop;
                delete e.stop,
                t(r)
            };
            return "string" != typeof e && (r = t,
            t = e,
            e = void 0),
            t && e !== !1 && this.queue(e || "fx", []),
            this.each(function() {
                var t = !0
                  , o = null != e && e + "queueHooks"
                  , a = et.timers
                  , i = _t.get(this);
                if (o)
                    i[o] && i[o].stop && n(i[o]);
                else
                    for (o in i)
                        i[o] && i[o].stop && er.test(o) && n(i[o]);
                for (o = a.length; o--; )
                    a[o].elem !== this || null != e && a[o].queue !== e || (a[o].anim.stop(r),
                    t = !1,
                    a.splice(o, 1));
                (t || !r) && et.dequeue(this, e)
            })
        },
        finish: function(e) {
            return e !== !1 && (e = e || "fx"),
            this.each(function() {
                var t, r = _t.get(this), n = r[e + "queue"], o = r[e + "queueHooks"], a = et.timers, i = n ? n.length : 0;
                for (r.finish = !0,
                et.queue(this, e, []),
                o && o.stop && o.stop.call(this, !0),
                t = a.length; t--; )
                    a[t].elem === this && a[t].queue === e && (a[t].anim.stop(!0),
                    a.splice(t, 1));
                for (t = 0; i > t; t++)
                    n[t] && n[t].finish && n[t].finish.call(this);
                delete r.finish
            })
        }
    }),
    et.each(["toggle", "show", "hide"], function(e, t) {
        var r = et.fn[t];
        et.fn[t] = function(e, n, o) {
            return null == e || "boolean" == typeof e ? r.apply(this, arguments) : this.animate(I(t, !0), e, n, o)
        }
    }),
    et.each({
        slideDown: I("show"),
        slideUp: I("hide"),
        slideToggle: I("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(e, t) {
        et.fn[e] = function(e, r, n) {
            return this.animate(t, e, r, n)
        }
    }),
    et.timers = [],
    et.fx.tick = function() {
        var e, t = 0, r = et.timers;
        for (Kt = et.now(); t < r.length; t++)
            e = r[t],
            e() || r[t] !== e || r.splice(t--, 1);
        r.length || et.fx.stop(),
        Kt = void 0
    }
    ,
    et.fx.timer = function(e) {
        et.timers.push(e),
        e() ? et.fx.start() : et.timers.pop()
    }
    ,
    et.fx.interval = 13,
    et.fx.start = function() {
        Jt || (Jt = setInterval(et.fx.tick, et.fx.interval))
    }
    ,
    et.fx.stop = function() {
        clearInterval(Jt),
        Jt = null
    }
    ,
    et.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    },
    et.fn.delay = function(e, t) {
        return e = et.fx ? et.fx.speeds[e] || e : e,
        t = t || "fx",
        this.queue(t, function(t, r) {
            var n = setTimeout(t, e);
            r.stop = function() {
                clearTimeout(n)
            }
        })
    }
    ,
    function() {
        var e = Q.createElement("input")
          , t = Q.createElement("select")
          , r = t.appendChild(Q.createElement("option"));
        e.type = "checkbox",
        J.checkOn = "" !== e.value,
        J.optSelected = r.selected,
        t.disabled = !0,
        J.optDisabled = !r.disabled,
        e = Q.createElement("input"),
        e.value = "t",
        e.type = "radio",
        J.radioValue = "t" === e.value
    }();
    var nr, or, ar = et.expr.attrHandle;
    et.fn.extend({
        attr: function(e, t) {
            return mt(this, et.attr, e, t, arguments.length > 1)
        },
        removeAttr: function(e) {
            return this.each(function() {
                et.removeAttr(this, e)
            })
        }
    }),
    et.extend({
        attr: function(e, t, r) {
            var n, o, a = e.nodeType;
            return e && 3 !== a && 8 !== a && 2 !== a ? typeof e.getAttribute === Tt ? et.prop(e, t, r) : (1 === a && et.isXMLDoc(e) || (t = t.toLowerCase(),
            n = et.attrHooks[t] || (et.expr.match.bool.test(t) ? or : nr)),
            void 0 === r ? n && "get"in n && null !== (o = n.get(e, t)) ? o : (o = et.find.attr(e, t),
            null == o ? void 0 : o) : null !== r ? n && "set"in n && void 0 !== (o = n.set(e, r, t)) ? o : (e.setAttribute(t, r + ""),
            r) : void et.removeAttr(e, t)) : void 0
        },
        removeAttr: function(e, t) {
            var r, n, o = 0, a = t && t.match(gt);
            if (a && 1 === e.nodeType)
                for (; r = a[o++]; )
                    n = et.propFix[r] || r,
                    et.expr.match.bool.test(r) && (e[n] = !1),
                    e.removeAttribute(r)
        },
        attrHooks: {
            type: {
                set: function(e, t) {
                    if (!J.radioValue && "radio" === t && et.nodeName(e, "input")) {
                        var r = e.value;
                        return e.setAttribute("type", t),
                        r && (e.value = r),
                        t
                    }
                }
            }
        }
    }),
    or = {
        set: function(e, t, r) {
            return t === !1 ? et.removeAttr(e, r) : e.setAttribute(r, r),
            r
        }
    },
    et.each(et.expr.match.bool.source.match(/\w+/g), function(e, t) {
        var r = ar[t] || et.find.attr;
        ar[t] = function(e, t, n) {
            var o, a;
            return n || (a = ar[t],
            ar[t] = o,
            o = null != r(e, t, n) ? t.toLowerCase() : null,
            ar[t] = a),
            o
        }
    });
    var ir = /^(?:input|select|textarea|button)$/i;
    et.fn.extend({
        prop: function(e, t) {
            return mt(this, et.prop, e, t, arguments.length > 1)
        },
        removeProp: function(e) {
            return this.each(function() {
                delete this[et.propFix[e] || e]
            })
        }
    }),
    et.extend({
        propFix: {
            "for": "htmlFor",
            "class": "className"
        },
        prop: function(e, t, r) {
            var n, o, a, i = e.nodeType;
            return e && 3 !== i && 8 !== i && 2 !== i ? (a = 1 !== i || !et.isXMLDoc(e),
            a && (t = et.propFix[t] || t,
            o = et.propHooks[t]),
            void 0 !== r ? o && "set"in o && void 0 !== (n = o.set(e, r, t)) ? n : e[t] = r : o && "get"in o && null !== (n = o.get(e, t)) ? n : e[t]) : void 0
        },
        propHooks: {
            tabIndex: {
                get: function(e) {
                    return e.hasAttribute("tabindex") || ir.test(e.nodeName) || e.href ? e.tabIndex : -1
                }
            }
        }
    }),
    J.optSelected || (et.propHooks.selected = {
        get: function(e) {
            var t = e.parentNode;
            return t && t.parentNode && t.parentNode.selectedIndex,
            null
        }
    }),
    et.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
        et.propFix[this.toLowerCase()] = this
    });
    var sr = /[\t\r\n\f]/g;
    et.fn.extend({
        addClass: function(e) {
            var t, r, n, o, a, i, s = "string" == typeof e && e, l = 0, c = this.length;
            if (et.isFunction(e))
                return this.each(function(t) {
                    et(this).addClass(e.call(this, t, this.className))
                });
            if (s)
                for (t = (e || "").match(gt) || []; c > l; l++)
                    if (r = this[l],
                    n = 1 === r.nodeType && (r.className ? (" " + r.className + " ").replace(sr, " ") : " ")) {
                        for (a = 0; o = t[a++]; )
                            n.indexOf(" " + o + " ") < 0 && (n += o + " ");
                        i = et.trim(n),
                        r.className !== i && (r.className = i)
                    }
            return this
        },
        removeClass: function(e) {
            var t, r, n, o, a, i, s = 0 === arguments.length || "string" == typeof e && e, l = 0, c = this.length;
            if (et.isFunction(e))
                return this.each(function(t) {
                    et(this).removeClass(e.call(this, t, this.className))
                });
            if (s)
                for (t = (e || "").match(gt) || []; c > l; l++)
                    if (r = this[l],
                    n = 1 === r.nodeType && (r.className ? (" " + r.className + " ").replace(sr, " ") : "")) {
                        for (a = 0; o = t[a++]; )
                            for (; n.indexOf(" " + o + " ") >= 0; )
                                n = n.replace(" " + o + " ", " ");
                        i = e ? et.trim(n) : "",
                        r.className !== i && (r.className = i)
                    }
            return this
        },
        toggleClass: function(e, t) {
            var r = typeof e;
            return "boolean" == typeof t && "string" === r ? t ? this.addClass(e) : this.removeClass(e) : this.each(et.isFunction(e) ? function(r) {
                et(this).toggleClass(e.call(this, r, this.className, t), t)
            }
            : function() {
                if ("string" === r)
                    for (var t, n = 0, o = et(this), a = e.match(gt) || []; t = a[n++]; )
                        o.hasClass(t) ? o.removeClass(t) : o.addClass(t);
                else
                    (r === Tt || "boolean" === r) && (this.className && _t.set(this, "__className__", this.className),
                    this.className = this.className || e === !1 ? "" : _t.get(this, "__className__") || "")
            }
            )
        },
        hasClass: function(e) {
            for (var t = " " + e + " ", r = 0, n = this.length; n > r; r++)
                if (1 === this[r].nodeType && (" " + this[r].className + " ").replace(sr, " ").indexOf(t) >= 0)
                    return !0;
            return !1
        }
    });
    var lr = /\r/g;
    et.fn.extend({
        val: function(e) {
            var t, r, n, o = this[0];
            return arguments.length ? (n = et.isFunction(e),
            this.each(function(r) {
                var o;
                1 === this.nodeType && (o = n ? e.call(this, r, et(this).val()) : e,
                null == o ? o = "" : "number" == typeof o ? o += "" : et.isArray(o) && (o = et.map(o, function(e) {
                    return null == e ? "" : e + ""
                })),
                t = et.valHooks[this.type] || et.valHooks[this.nodeName.toLowerCase()],
                t && "set"in t && void 0 !== t.set(this, o, "value") || (this.value = o))
            })) : o ? (t = et.valHooks[o.type] || et.valHooks[o.nodeName.toLowerCase()],
            t && "get"in t && void 0 !== (r = t.get(o, "value")) ? r : (r = o.value,
            "string" == typeof r ? r.replace(lr, "") : null == r ? "" : r)) : void 0
        }
    }),
    et.extend({
        valHooks: {
            select: {
                get: function(e) {
                    for (var t, r, n = e.options, o = e.selectedIndex, a = "select-one" === e.type || 0 > o, i = a ? null : [], s = a ? o + 1 : n.length, l = 0 > o ? s : a ? o : 0; s > l; l++)
                        if (r = n[l],
                        !(!r.selected && l !== o || (J.optDisabled ? r.disabled : null !== r.getAttribute("disabled")) || r.parentNode.disabled && et.nodeName(r.parentNode, "optgroup"))) {
                            if (t = et(r).val(),
                            a)
                                return t;
                            i.push(t)
                        }
                    return i
                },
                set: function(e, t) {
                    for (var r, n, o = e.options, a = et.makeArray(t), i = o.length; i--; )
                        n = o[i],
                        (n.selected = et.inArray(et(n).val(), a) >= 0) && (r = !0);
                    return r || (e.selectedIndex = -1),
                    a
                }
            }
        }
    }),
    et.each(["radio", "checkbox"], function() {
        et.valHooks[this] = {
            set: function(e, t) {
                return et.isArray(t) ? e.checked = et.inArray(et(e).val(), t) >= 0 : void 0
            }
        },
        J.checkOn || (et.valHooks[this].get = function(e) {
            return null === e.getAttribute("value") ? "on" : e.value
        }
        )
    }),
    et.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(e, t) {
        et.fn[t] = function(e, r) {
            return arguments.length > 0 ? this.on(t, null, e, r) : this.trigger(t)
        }
    }),
    et.fn.extend({
        hover: function(e, t) {
            return this.mouseenter(e).mouseleave(t || e)
        },
        bind: function(e, t, r) {
            return this.on(e, null, t, r)
        },
        unbind: function(e, t) {
            return this.off(e, null, t)
        },
        delegate: function(e, t, r, n) {
            return this.on(t, e, r, n)
        },
        undelegate: function(e, t, r) {
            return 1 === arguments.length ? this.off(e, "**") : this.off(t, e || "**", r)
        }
    });
    var cr = et.now()
      , ur = /\?/;
    et.parseJSON = function(e) {
        return JSON.parse(e + "")
    }
    ,
    et.parseXML = function(e) {
        var t, r;
        if (!e || "string" != typeof e)
            return null;
        try {
            r = new DOMParser,
            t = r.parseFromString(e, "text/xml")
        } catch (n) {
            t = void 0
        }
        return (!t || t.getElementsByTagName("parsererror").length) && et.error("Invalid XML: " + e),
        t
    }
    ;
    var dr, pr, gr = /#.*$/, hr = /([?&])_=[^&]*/, fr = /^(.*?):[ \t]*([^\r\n]*)$/gm, mr = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, _r = /^(?:GET|HEAD)$/, yr = /^\/\//, xr = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, vr = {}, br = {}, wr = "*/".concat("*");
    try {
        pr = location.href
    } catch (Cr) {
        pr = Q.createElement("a"),
        pr.href = "",
        pr = pr.href
    }
    dr = xr.exec(pr.toLowerCase()) || [],
    et.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: pr,
            type: "GET",
            isLocal: mr.test(dr[1]),
            global: !0,
            processData: !0,
            async: !0,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": wr,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },
            converters: {
                "* text": String,
                "text html": !0,
                "text json": et.parseJSON,
                "text xml": et.parseXML
            },
            flatOptions: {
                url: !0,
                context: !0
            }
        },
        ajaxSetup: function(e, t) {
            return t ? W(W(e, et.ajaxSettings), t) : W(et.ajaxSettings, e)
        },
        ajaxPrefilter: B(vr),
        ajaxTransport: B(br),
        ajax: function(e, t) {
            function r(e, t, r, i) {
                var l, u, _, y, v, w = t;
                2 !== x && (x = 2,
                s && clearTimeout(s),
                n = void 0,
                a = i || "",
                b.readyState = e > 0 ? 4 : 0,
                l = e >= 200 && 300 > e || 304 === e,
                r && (y = O(d, b, r)),
                y = z(d, y, b, l),
                l ? (d.ifModified && (v = b.getResponseHeader("Last-Modified"),
                v && (et.lastModified[o] = v),
                v = b.getResponseHeader("etag"),
                v && (et.etag[o] = v)),
                204 === e || "HEAD" === d.type ? w = "nocontent" : 304 === e ? w = "notmodified" : (w = y.state,
                u = y.data,
                _ = y.error,
                l = !_)) : (_ = w,
                (e || !w) && (w = "error",
                0 > e && (e = 0))),
                b.status = e,
                b.statusText = (t || w) + "",
                l ? h.resolveWith(p, [u, w, b]) : h.rejectWith(p, [b, w, _]),
                b.statusCode(m),
                m = void 0,
                c && g.trigger(l ? "ajaxSuccess" : "ajaxError", [b, d, l ? u : _]),
                f.fireWith(p, [b, w]),
                c && (g.trigger("ajaxComplete", [b, d]),
                --et.active || et.event.trigger("ajaxStop")))
            }
            "object" == typeof e && (t = e,
            e = void 0),
            t = t || {};
            var n, o, a, i, s, l, c, u, d = et.ajaxSetup({}, t), p = d.context || d, g = d.context && (p.nodeType || p.jquery) ? et(p) : et.event, h = et.Deferred(), f = et.Callbacks("once memory"), m = d.statusCode || {}, _ = {}, y = {}, x = 0, v = "canceled", b = {
                readyState: 0,
                getResponseHeader: function(e) {
                    var t;
                    if (2 === x) {
                        if (!i)
                            for (i = {}; t = fr.exec(a); )
                                i[t[1].toLowerCase()] = t[2];
                        t = i[e.toLowerCase()]
                    }
                    return null == t ? null : t
                },
                getAllResponseHeaders: function() {
                    return 2 === x ? a : null
                },
                setRequestHeader: function(e, t) {
                    var r = e.toLowerCase();
                    return x || (e = y[r] = y[r] || e,
                    _[e] = t),
                    this
                },
                overrideMimeType: function(e) {
                    return x || (d.mimeType = e),
                    this
                },
                statusCode: function(e) {
                    var t;
                    if (e)
                        if (2 > x)
                            for (t in e)
                                m[t] = [m[t], e[t]];
                        else
                            b.always(e[b.status]);
                    return this
                },
                abort: function(e) {
                    var t = e || v;
                    return n && n.abort(t),
                    r(0, t),
                    this
                }
            };
            if (h.promise(b).complete = f.add,
            b.success = b.done,
            b.error = b.fail,
            d.url = ((e || d.url || pr) + "").replace(gr, "").replace(yr, dr[1] + "//"),
            d.type = t.method || t.type || d.method || d.type,
            d.dataTypes = et.trim(d.dataType || "*").toLowerCase().match(gt) || [""],
            null == d.crossDomain && (l = xr.exec(d.url.toLowerCase()),
            d.crossDomain = !(!l || l[1] === dr[1] && l[2] === dr[2] && (l[3] || ("http:" === l[1] ? "80" : "443")) === (dr[3] || ("http:" === dr[1] ? "80" : "443")))),
            d.data && d.processData && "string" != typeof d.data && (d.data = et.param(d.data, d.traditional)),
            R(vr, d, t, b),
            2 === x)
                return b;
            c = d.global,
            c && 0 === et.active++ && et.event.trigger("ajaxStart"),
            d.type = d.type.toUpperCase(),
            d.hasContent = !_r.test(d.type),
            o = d.url,
            d.hasContent || (d.data && (o = d.url += (ur.test(o) ? "&" : "?") + d.data,
            delete d.data),
            d.cache === !1 && (d.url = hr.test(o) ? o.replace(hr, "$1_=" + cr++) : o + (ur.test(o) ? "&" : "?") + "_=" + cr++)),
            d.ifModified && (et.lastModified[o] && b.setRequestHeader("If-Modified-Since", et.lastModified[o]),
            et.etag[o] && b.setRequestHeader("If-None-Match", et.etag[o])),
            (d.data && d.hasContent && d.contentType !== !1 || t.contentType) && b.setRequestHeader("Content-Type", d.contentType),
            b.setRequestHeader("Accept", d.dataTypes[0] && d.accepts[d.dataTypes[0]] ? d.accepts[d.dataTypes[0]] + ("*" !== d.dataTypes[0] ? ", " + wr + "; q=0.01" : "") : d.accepts["*"]);
            for (u in d.headers)
                b.setRequestHeader(u, d.headers[u]);
            if (d.beforeSend && (d.beforeSend.call(p, b, d) === !1 || 2 === x))
                return b.abort();
            v = "abort";
            for (u in {
                success: 1,
                error: 1,
                complete: 1
            })
                b[u](d[u]);
            if (n = R(br, d, t, b)) {
                b.readyState = 1,
                c && g.trigger("ajaxSend", [b, d]),
                d.async && d.timeout > 0 && (s = setTimeout(function() {
                    b.abort("timeout")
                }, d.timeout));
                try {
                    x = 1,
                    n.send(_, r)
                } catch (w) {
                    if (!(2 > x))
                        throw w;
                    r(-1, w)
                }
            } else
                r(-1, "No Transport");
            return b
        },
        getJSON: function(e, t, r) {
            return et.get(e, t, r, "json")
        },
        getScript: function(e, t) {
            return et.get(e, void 0, t, "script")
        }
    }),
    et.each(["get", "post"], function(e, t) {
        et[t] = function(e, r, n, o) {
            return et.isFunction(r) && (o = o || n,
            n = r,
            r = void 0),
            et.ajax({
                url: e,
                type: t,
                dataType: o,
                data: r,
                success: n
            })
        }
    }),
    et.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(e, t) {
        et.fn[t] = function(e) {
            return this.on(t, e)
        }
    }),
    et._evalUrl = function(e) {
        return et.ajax({
            url: e,
            type: "GET",
            dataType: "script",
            async: !1,
            global: !1,
            "throws": !0
        })
    }
    ,
    et.fn.extend({
        wrapAll: function(e) {
            var t;
            return et.isFunction(e) ? this.each(function(t) {
                et(this).wrapAll(e.call(this, t))
            }) : (this[0] && (t = et(e, this[0].ownerDocument).eq(0).clone(!0),
            this[0].parentNode && t.insertBefore(this[0]),
            t.map(function() {
                for (var e = this; e.firstElementChild; )
                    e = e.firstElementChild;
                return e
            }).append(this)),
            this)
        },
        wrapInner: function(e) {
            return this.each(et.isFunction(e) ? function(t) {
                et(this).wrapInner(e.call(this, t))
            }
            : function() {
                var t = et(this)
                  , r = t.contents();
                r.length ? r.wrapAll(e) : t.append(e)
            }
            )
        },
        wrap: function(e) {
            var t = et.isFunction(e);
            return this.each(function(r) {
                et(this).wrapAll(t ? e.call(this, r) : e)
            })
        },
        unwrap: function() {
            return this.parent().each(function() {
                et.nodeName(this, "body") || et(this).replaceWith(this.childNodes)
            }).end()
        }
    }),
    et.expr.filters.hidden = function(e) {
        return e.offsetWidth <= 0 && e.offsetHeight <= 0
    }
    ,
    et.expr.filters.visible = function(e) {
        return !et.expr.filters.hidden(e)
    }
    ;
    var Sr = /%20/g
      , Tr = /\[\]$/
      , kr = /\r?\n/g
      , Pr = /^(?:submit|button|image|reset|file)$/i
      , Ar = /^(?:input|select|textarea|keygen)/i;
    et.param = function(e, t) {
        var r, n = [], o = function(e, t) {
            t = et.isFunction(t) ? t() : null == t ? "" : t,
            n[n.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
        };
        if (void 0 === t && (t = et.ajaxSettings && et.ajaxSettings.traditional),
        et.isArray(e) || e.jquery && !et.isPlainObject(e))
            et.each(e, function() {
                o(this.name, this.value)
            });
        else
            for (r in e)
                L(r, e[r], t, o);
        return n.join("&").replace(Sr, "+")
    }
    ,
    et.fn.extend({
        serialize: function() {
            return et.param(this.serializeArray())
        },
        serializeArray: function() {
            return this.map(function() {
                var e = et.prop(this, "elements");
                return e ? et.makeArray(e) : this
            }).filter(function() {
                var e = this.type;
                return this.name && !et(this).is(":disabled") && Ar.test(this.nodeName) && !Pr.test(e) && (this.checked || !St.test(e))
            }).map(function(e, t) {
                var r = et(this).val();
                return null == r ? null : et.isArray(r) ? et.map(r, function(e) {
                    return {
                        name: t.name,
                        value: e.replace(kr, "\r\n")
                    }
                }) : {
                    name: t.name,
                    value: r.replace(kr, "\r\n")
                }
            }).get()
        }
    }),
    et.ajaxSettings.xhr = function() {
        try {
            return new XMLHttpRequest
        } catch (e) {}
    }
    ;
    var Dr = 0
      , Ir = {}
      , Nr = {
        0: 200,
        1223: 204
    }
      , Fr = et.ajaxSettings.xhr();
    e.ActiveXObject && et(e).on("unload", function() {
        for (var e in Ir)
            Ir[e]()
    }),
    J.cors = !!Fr && "withCredentials"in Fr,
    J.ajax = Fr = !!Fr,
    et.ajaxTransport(function(e) {
        var t;
        return J.cors || Fr && !e.crossDomain ? {
            send: function(r, n) {
                var o, a = e.xhr(), i = ++Dr;
                if (a.open(e.type, e.url, e.async, e.username, e.password),
                e.xhrFields)
                    for (o in e.xhrFields)
                        a[o] = e.xhrFields[o];
                e.mimeType && a.overrideMimeType && a.overrideMimeType(e.mimeType),
                e.crossDomain || r["X-Requested-With"] || (r["X-Requested-With"] = "XMLHttpRequest");
                for (o in r)
                    a.setRequestHeader(o, r[o]);
                t = function(e) {
                    return function() {
                        t && (delete Ir[i],
                        t = a.onload = a.onerror = null,
                        "abort" === e ? a.abort() : "error" === e ? n(a.status, a.statusText) : n(Nr[a.status] || a.status, a.statusText, "string" == typeof a.responseText ? {
                            text: a.responseText
                        } : void 0, a.getAllResponseHeaders()))
                    }
                }
                ,
                a.onload = t(),
                a.onerror = t("error"),
                t = Ir[i] = t("abort"),
                a.send(e.hasContent && e.data || null)
            },
            abort: function() {
                t && t()
            }
        } : void 0
    }),
    et.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function(e) {
                return et.globalEval(e),
                e
            }
        }
    }),
    et.ajaxPrefilter("script", function(e) {
        void 0 === e.cache && (e.cache = !1),
        e.crossDomain && (e.type = "GET")
    }),
    et.ajaxTransport("script", function(e) {
        if (e.crossDomain) {
            var t, r;
            return {
                send: function(n, o) {
                    t = et("<script>").prop({
                        async: !0,
                        charset: e.scriptCharset,
                        src: e.url
                    }).on("load error", r = function(e) {
                        t.remove(),
                        r = null,
                        e && o("error" === e.type ? 404 : 200, e.type)
                    }
                    ),
                    Q.head.appendChild(t[0])
                },
                abort: function() {
                    r && r()
                }
            }
        }
    });
    var Er = []
      , Mr = /(=)\?(?=&|$)|\?\?/;
    et.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var e = Er.pop() || et.expando + "_" + cr++;
            return this[e] = !0,
            e
        }
    }),
    et.ajaxPrefilter("json jsonp", function(t, r, n) {
        var o, a, i, s = t.jsonp !== !1 && (Mr.test(t.url) ? "url" : "string" == typeof t.data && !(t.contentType || "").indexOf("application/x-www-form-urlencoded") && Mr.test(t.data) && "data");
        return s || "jsonp" === t.dataTypes[0] ? (o = t.jsonpCallback = et.isFunction(t.jsonpCallback) ? t.jsonpCallback() : t.jsonpCallback,
        s ? t[s] = t[s].replace(Mr, "$1" + o) : t.jsonp !== !1 && (t.url += (ur.test(t.url) ? "&" : "?") + t.jsonp + "=" + o),
        t.converters["script json"] = function() {
            return i || et.error(o + " was not called"),
            i[0]
        }
        ,
        t.dataTypes[0] = "json",
        a = e[o],
        e[o] = function() {
            i = arguments
        }
        ,
        n.always(function() {
            e[o] = a,
            t[o] && (t.jsonpCallback = r.jsonpCallback,
            Er.push(o)),
            i && et.isFunction(a) && a(i[0]),
            i = a = void 0
        }),
        "script") : void 0
    }),
    et.parseHTML = function(e, t, r) {
        if (!e || "string" != typeof e)
            return null;
        "boolean" == typeof t && (r = t,
        t = !1),
        t = t || Q;
        var n = it.exec(e)
          , o = !r && [];
        return n ? [t.createElement(n[1])] : (n = et.buildFragment([e], t, o),
        o && o.length && et(o).remove(),
        et.merge([], n.childNodes))
    }
    ;
    var Br = et.fn.load;
    et.fn.load = function(e, t, r) {
        if ("string" != typeof e && Br)
            return Br.apply(this, arguments);
        var n, o, a, i = this, s = e.indexOf(" ");
        return s >= 0 && (n = e.slice(s),
        e = e.slice(0, s)),
        et.isFunction(t) ? (r = t,
        t = void 0) : t && "object" == typeof t && (o = "POST"),
        i.length > 0 && et.ajax({
            url: e,
            type: o,
            dataType: "html",
            data: t
        }).done(function(e) {
            a = arguments,
            i.html(n ? et("<div>").append(et.parseHTML(e)).find(n) : e)
        }).complete(r && function(e, t) {
            i.each(r, a || [e.responseText, t, e])
        }
        ),
        this
    }
    ,
    et.expr.filters.animated = function(e) {
        return et.grep(et.timers, function(t) {
            return e === t.elem
        }).length
    }
    ;
    var Rr = e.document.documentElement;
    et.offset = {
        setOffset: function(e, t, r) {
            var n, o, a, i, s, l, c, u = et.css(e, "position"), d = et(e), p = {};
            "static" === u && (e.style.position = "relative"),
            s = d.offset(),
            a = et.css(e, "top"),
            l = et.css(e, "left"),
            c = ("absolute" === u || "fixed" === u) && (a + l).indexOf("auto") > -1,
            c ? (n = d.position(),
            i = n.top,
            o = n.left) : (i = parseFloat(a) || 0,
            o = parseFloat(l) || 0),
            et.isFunction(t) && (t = t.call(e, r, s)),
            null != t.top && (p.top = t.top - s.top + i),
            null != t.left && (p.left = t.left - s.left + o),
            "using"in t ? t.using.call(e, p) : d.css(p)
        }
    },
    et.fn.extend({
        offset: function(e) {
            if (arguments.length)
                return void 0 === e ? this : this.each(function(t) {
                    et.offset.setOffset(this, e, t)
                });
            var t, r, n = this[0], o = {
                top: 0,
                left: 0
            }, a = n && n.ownerDocument;
            return a ? (t = a.documentElement,
            et.contains(t, n) ? (typeof n.getBoundingClientRect !== Tt && (o = n.getBoundingClientRect()),
            r = j(a),
            {
                top: o.top + r.pageYOffset - t.clientTop,
                left: o.left + r.pageXOffset - t.clientLeft
            }) : o) : void 0
        },
        position: function() {
            if (this[0]) {
                var e, t, r = this[0], n = {
                    top: 0,
                    left: 0
                };
                return "fixed" === et.css(r, "position") ? t = r.getBoundingClientRect() : (e = this.offsetParent(),
                t = this.offset(),
                et.nodeName(e[0], "html") || (n = e.offset()),
                n.top += et.css(e[0], "borderTopWidth", !0),
                n.left += et.css(e[0], "borderLeftWidth", !0)),
                {
                    top: t.top - n.top - et.css(r, "marginTop", !0),
                    left: t.left - n.left - et.css(r, "marginLeft", !0)
                }
            }
        },
        offsetParent: function() {
            return this.map(function() {
                for (var e = this.offsetParent || Rr; e && !et.nodeName(e, "html") && "static" === et.css(e, "position"); )
                    e = e.offsetParent;
                return e || Rr
            })
        }
    }),
    et.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(t, r) {
        var n = "pageYOffset" === r;
        et.fn[t] = function(o) {
            return mt(this, function(t, o, a) {
                var i = j(t);
                return void 0 === a ? i ? i[r] : t[o] : void (i ? i.scrollTo(n ? e.pageXOffset : a, n ? a : e.pageYOffset) : t[o] = a)
            }, t, o, arguments.length, null)
        }
    }),
    et.each(["top", "left"], function(e, t) {
        et.cssHooks[t] = w(J.pixelPosition, function(e, r) {
            return r ? (r = b(e, t),
            qt.test(r) ? et(e).position()[t] + "px" : r) : void 0
        })
    }),
    et.each({
        Height: "height",
        Width: "width"
    }, function(e, t) {
        et.each({
            padding: "inner" + e,
            content: t,
            "": "outer" + e
        }, function(r, n) {
            et.fn[n] = function(n, o) {
                var a = arguments.length && (r || "boolean" != typeof n)
                  , i = r || (n === !0 || o === !0 ? "margin" : "border");
                return mt(this, function(t, r, n) {
                    var o;
                    return et.isWindow(t) ? t.document.documentElement["client" + e] : 9 === t.nodeType ? (o = t.documentElement,
                    Math.max(t.body["scroll" + e], o["scroll" + e], t.body["offset" + e], o["offset" + e], o["client" + e])) : void 0 === n ? et.css(t, r, i) : et.style(t, r, n, i)
                }, t, a ? n : void 0, a, null)
            }
        })
    }),
    et.fn.size = function() {
        return this.length
    }
    ,
    et.fn.andSelf = et.fn.addBack,
    "function" == typeof define && define.amd && define("jquery", [], function() {
        return et
    });
    var Wr = e.jQuery
      , Or = e.$;
    return et.noConflict = function(t) {
        return e.$ === et && (e.$ = Or),
        t && e.jQuery === et && (e.jQuery = Wr),
        et
    }
    ,
    typeof t === Tt && (e.jQuery = e.$ = et),
    et
}),
function() {
    function e() {
        try {
            return s in a && a[s]
        } catch (e) {
            return !1
        }
    }
    function t(e) {
        return function() {
            var t = Array.prototype.slice.call(arguments, 0);
            t.unshift(n),
            c.appendChild(n),
            n.addBehavior("#default#userData"),
            n.load(s);
            var r = e.apply(o, t);
            return c.removeChild(n),
            r
        }
    }
    function r(e) {
        return e.replace(p, "___")
    }
    var n, o = {}, a = window, i = a.document, s = "localStorage", l = "__storejs__";
    if (o.disabled = !1,
    o.set = function() {}
    ,
    o.get = function() {}
    ,
    o.remove = function() {}
    ,
    o.clear = function() {}
    ,
    o.transact = function(e, t, r) {
        var n = o.get(e);
        null == r && (r = t,
        t = null),
        "undefined" == typeof n && (n = t || {}),
        r(n),
        o.set(e, n)
    }
    ,
    o.getAll = function() {}
    ,
    o.serialize = function(e) {
        return JSON.stringify(e)
    }
    ,
    o.deserialize = function(e) {
        if ("string" != typeof e)
            return void 0;
        try {
            return JSON.parse(e)
        } catch (t) {
            return e || void 0
        }
    }
    ,
    e())
        n = a[s],
        o.set = function(e, t) {
            return void 0 === t ? o.remove(e) : (n.setItem(e, o.serialize(t)),
            t)
        }
        ,
        o.get = function(e) {
            return o.deserialize(n.getItem(e))
        }
        ,
        o.remove = function(e) {
            n.removeItem(e)
        }
        ,
        o.clear = function() {
            n.clear()
        }
        ,
        o.getAll = function() {
            for (var e = {}, t = 0; t < n.length; ++t) {
                var r = n.key(t);
                e[r] = o.get(r)
            }
            return e
        }
        ;
    else if (i.documentElement.addBehavior) {
        var c, u;
        try {
            u = new ActiveXObject("htmlfile"),
            u.open(),
            u.write('<script>document.w=window</script><iframe src="/favicon.ico"></frame>'),
            u.close(),
            c = u.w.frames[0].document,
            n = c.createElement("div")
        } catch (d) {
            n = i.createElement("div"),
            c = i.body
        }
        var p = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]","g");
        o.set = t(function(e, t, n) {
            return t = r(t),
            void 0 === n ? o.remove(t) : (e.setAttribute(t, o.serialize(n)),
            e.save(s),
            n)
        }),
        o.get = t(function(e, t) {
            return t = r(t),
            o.deserialize(e.getAttribute(t))
        }),
        o.remove = t(function(e, t) {
            t = r(t),
            e.removeAttribute(t),
            e.save(s)
        }),
        o.clear = t(function(e) {
            var t = e.XMLDocument.documentElement.attributes;
            e.load(s);
            for (var r, n = 0; r = t[n]; n++)
                e.removeAttribute(r.name);
            e.save(s)
        }),
        o.getAll = t(function(e) {
            var t = e.XMLDocument.documentElement.attributes;
            e.load(s);
            for (var r, n = {}, a = 0; r = t[a]; ++a)
                n[r] = o.get(r);
            return n
        })
    }
    try {
        o.set(l, l),
        o.get(l) != l && (o.disabled = !0),
        o.remove(l)
    } catch (d) {
        o.disabled = !0
    }
    o.enabled = !o.disabled,
    "undefined" != typeof module && "function" != typeof module ? module.exports = o : "function" == typeof define && define.amd ? define(o) : this.store = o
}(),
function(e, t, r) {
    "undefined" != typeof module && module.exports ? module.exports = r() : "function" == typeof t.define && t.define.amd ? define(e, [], r) : t[e] = r()
}("buzz", this, function() {
    var e = {
        defaults: {
            autoplay: !1,
            duration: 5e3,
            formats: [],
            loop: !1,
            placeholder: "--",
            preload: "metadata",
            volume: 80,
            document: document
        },
        types: {
            mp3: "audio/mpeg",
            ogg: "audio/ogg",
            wav: "audio/wav",
            aac: "audio/aac",
            m4a: "audio/x-m4a"
        },
        sounds: [],
        el: document.createElement("audio"),
        sound: function(t, r) {
            function n(e) {
                for (var t = [], r = e.length - 1, n = 0; r >= n; n++)
                    t.push({
                        start: e.start(n),
                        end: e.end(n)
                    });
                return t
            }
            function o(e) {
                return e.split(".").pop()
            }
            function a(t, r) {
                var n = i.createElement("source");
                n.src = r,
                e.types[o(r)] && (n.type = e.types[o(r)]),
                t.appendChild(n)
            }
            r = r || {};
            var i = r.document || e.defaults.document
              , s = 0
              , l = []
              , c = {}
              , u = e.isSupported();
            if (this.load = function() {
                return u ? (this.sound.load(),
                this) : this
            }
            ,
            this.play = function() {
                return u ? (this.sound.play(),
                this) : this
            }
            ,
            this.togglePlay = function() {
                return u ? (this.sound.paused ? this.sound.play() : this.sound.pause(),
                this) : this
            }
            ,
            this.pause = function() {
                return u ? (this.sound.pause(),
                this) : this
            }
            ,
            this.isPaused = function() {
                return u ? this.sound.paused : null
            }
            ,
            this.stop = function() {
                return u ? (this.setTime(0),
                this.sound.pause(),
                this) : this
            }
            ,
            this.isEnded = function() {
                return u ? this.sound.ended : null
            }
            ,
            this.loop = function() {
                return u ? (this.sound.loop = "loop",
                this.bind("ended.buzzloop", function() {
                    this.currentTime = 0,
                    this.play()
                }),
                this) : this
            }
            ,
            this.unloop = function() {
                return u ? (this.sound.removeAttribute("loop"),
                this.unbind("ended.buzzloop"),
                this) : this
            }
            ,
            this.mute = function() {
                return u ? (this.sound.muted = !0,
                this) : this
            }
            ,
            this.unmute = function() {
                return u ? (this.sound.muted = !1,
                this) : this
            }
            ,
            this.toggleMute = function() {
                return u ? (this.sound.muted = !this.sound.muted,
                this) : this
            }
            ,
            this.isMuted = function() {
                return u ? this.sound.muted : null
            }
            ,
            this.setVolume = function(e) {
                return u ? (0 > e && (e = 0),
                e > 100 && (e = 100),
                this.volume = e,
                this.sound.volume = e / 100,
                this) : this
            }
            ,
            this.getVolume = function() {
                return u ? this.volume : this
            }
            ,
            this.increaseVolume = function(e) {
                return this.setVolume(this.volume + (e || 1))
            }
            ,
            this.decreaseVolume = function(e) {
                return this.setVolume(this.volume - (e || 1))
            }
            ,
            this.setTime = function(e) {
                if (!u)
                    return this;
                var t = !0;
                return this.whenReady(function() {
                    t === !0 && (t = !1,
                    this.sound.currentTime = e)
                }),
                this
            }
            ,
            this.getTime = function() {
                if (!u)
                    return null;
                var t = Math.round(100 * this.sound.currentTime) / 100;
                return isNaN(t) ? e.defaults.placeholder : t
            }
            ,
            this.setPercent = function(t) {
                return u ? this.setTime(e.fromPercent(t, this.sound.duration)) : this
            }
            ,
            this.getPercent = function() {
                if (!u)
                    return null;
                var t = Math.round(e.toPercent(this.sound.currentTime, this.sound.duration));
                return isNaN(t) ? e.defaults.placeholder : t
            }
            ,
            this.setSpeed = function(e) {
                return u ? (this.sound.playbackRate = e,
                this) : this
            }
            ,
            this.getSpeed = function() {
                return u ? this.sound.playbackRate : null
            }
            ,
            this.getDuration = function() {
                if (!u)
                    return null;
                var t = Math.round(100 * this.sound.duration) / 100;
                return isNaN(t) ? e.defaults.placeholder : t
            }
            ,
            this.getPlayed = function() {
                return u ? n(this.sound.played) : null
            }
            ,
            this.getBuffered = function() {
                return u ? n(this.sound.buffered) : null
            }
            ,
            this.getSeekable = function() {
                return u ? n(this.sound.seekable) : null
            }
            ,
            this.getErrorCode = function() {
                return u && this.sound.error ? this.sound.error.code : 0
            }
            ,
            this.getErrorMessage = function() {
                if (!u)
                    return null;
                switch (this.getErrorCode()) {
                case 1:
                    return "MEDIA_ERR_ABORTED";
                case 2:
                    return "MEDIA_ERR_NETWORK";
                case 3:
                    return "MEDIA_ERR_DECODE";
                case 4:
                    return "MEDIA_ERR_SRC_NOT_SUPPORTED";
                default:
                    return null
                }
            }
            ,
            this.getStateCode = function() {
                return u ? this.sound.readyState : null
            }
            ,
            this.getStateMessage = function() {
                if (!u)
                    return null;
                switch (this.getStateCode()) {
                case 0:
                    return "HAVE_NOTHING";
                case 1:
                    return "HAVE_METADATA";
                case 2:
                    return "HAVE_CURRENT_DATA";
                case 3:
                    return "HAVE_FUTURE_DATA";
                case 4:
                    return "HAVE_ENOUGH_DATA";
                default:
                    return null
                }
            }
            ,
            this.getNetworkStateCode = function() {
                return u ? this.sound.networkState : null
            }
            ,
            this.getNetworkStateMessage = function() {
                if (!u)
                    return null;
                switch (this.getNetworkStateCode()) {
                case 0:
                    return "NETWORK_EMPTY";
                case 1:
                    return "NETWORK_IDLE";
                case 2:
                    return "NETWORK_LOADING";
                case 3:
                    return "NETWORK_NO_SOURCE";
                default:
                    return null
                }
            }
            ,
            this.set = function(e, t) {
                return u ? (this.sound[e] = t,
                this) : this
            }
            ,
            this.get = function(e) {
                return u ? e ? this.sound[e] : this.sound : null
            }
            ,
            this.bind = function(e, t) {
                if (!u)
                    return this;
                e = e.split(" ");
                for (var r = this, n = function(e) {
                    t.call(r, e)
                }, o = 0; e.length > o; o++) {
                    var a = e[o]
                      , i = a;
                    a = i.split(".")[0],
                    l.push({
                        idx: i,
                        func: n
                    }),
                    this.sound.addEventListener(a, n, !0)
                }
                return this
            }
            ,
            this.unbind = function(e) {
                if (!u)
                    return this;
                e = e.split(" ");
                for (var t = 0; e.length > t; t++)
                    for (var r = e[t], n = r.split(".")[0], o = 0; l.length > o; o++) {
                        var a = l[o].idx.split(".");
                        (l[o].idx == r || a[1] && a[1] == r.replace(".", "")) && (this.sound.removeEventListener(n, l[o].func, !0),
                        l.splice(o, 1))
                    }
                return this
            }
            ,
            this.bindOnce = function(e, t) {
                if (!u)
                    return this;
                var r = this;
                return c[s++] = !1,
                this.bind(e + "." + s, function() {
                    c[s] || (c[s] = !0,
                    t.call(r)),
                    r.unbind(e + "." + s)
                }),
                this
            }
            ,
            this.trigger = function(e) {
                if (!u)
                    return this;
                e = e.split(" ");
                for (var t = 0; e.length > t; t++)
                    for (var r = e[t], n = 0; l.length > n; n++) {
                        var o = l[n].idx.split(".");
                        if (l[n].idx == r || o[0] && o[0] == r.replace(".", "")) {
                            var a = i.createEvent("HTMLEvents");
                            a.initEvent(o[0], !1, !0),
                            this.sound.dispatchEvent(a)
                        }
                    }
                return this
            }
            ,
            this.fadeTo = function(t, r, n) {
                function o() {
                    setTimeout(function() {
                        t > a && t > s.volume ? (s.setVolume(s.volume += 1),
                        o()) : a > t && s.volume > t ? (s.setVolume(s.volume -= 1),
                        o()) : n instanceof Function && n.apply(s)
                    }, i)
                }
                if (!u)
                    return this;
                r instanceof Function ? (n = r,
                r = e.defaults.duration) : r = r || e.defaults.duration;
                var a = this.volume
                  , i = r / Math.abs(a - t)
                  , s = this;
                return this.play(),
                this.whenReady(function() {
                    o()
                }),
                this
            }
            ,
            this.fadeIn = function(e, t) {
                return u ? this.setVolume(0).fadeTo(100, e, t) : this
            }
            ,
            this.fadeOut = function(e, t) {
                return u ? this.fadeTo(0, e, t) : this
            }
            ,
            this.fadeWith = function(e, t) {
                return u ? (this.fadeOut(t, function() {
                    this.stop()
                }),
                e.play().fadeIn(t),
                this) : this
            }
            ,
            this.whenReady = function(e) {
                if (!u)
                    return null;
                var t = this;
                0 === this.sound.readyState ? this.bind("canplay.buzzwhenready", function() {
                    e.call(t)
                }) : e.call(t)
            }
            ,
            u && t) {
                for (var d in e.defaults)
                    e.defaults.hasOwnProperty(d) && (r[d] = r[d] || e.defaults[d]);
                if (this.sound = i.createElement("audio"),
                t instanceof Array)
                    for (var p in t)
                        t.hasOwnProperty(p) && a(this.sound, t[p]);
                else if (r.formats.length)
                    for (var g in r.formats)
                        r.formats.hasOwnProperty(g) && a(this.sound, t + "." + r.formats[g]);
                else
                    a(this.sound, t);
                r.loop && this.loop(),
                r.autoplay && (this.sound.autoplay = "autoplay"),
                this.sound.preload = r.preload === !0 ? "auto" : r.preload === !1 ? "none" : r.preload,
                this.setVolume(r.volume),
                e.sounds.push(this)
            }
        },
        group: function(e) {
            function t() {
                for (var t = r(null, arguments), n = t.shift(), o = 0; e.length > o; o++)
                    e[o][n].apply(e[o], t)
            }
            function r(e, t) {
                return e instanceof Array ? e : Array.prototype.slice.call(t)
            }
            e = r(e, arguments),
            this.getSounds = function() {
                return e
            }
            ,
            this.add = function(t) {
                t = r(t, arguments);
                for (var n = 0; t.length > n; n++)
                    e.push(t[n])
            }
            ,
            this.remove = function(t) {
                t = r(t, arguments);
                for (var n = 0; t.length > n; n++)
                    for (var o = 0; e.length > o; o++)
                        if (e[o] == t[n]) {
                            e.splice(o, 1);
                            break
                        }
            }
            ,
            this.load = function() {
                return t("load"),
                this
            }
            ,
            this.play = function() {
                return t("play"),
                this
            }
            ,
            this.togglePlay = function() {
                return t("togglePlay"),
                this
            }
            ,
            this.pause = function(e) {
                return t("pause", e),
                this
            }
            ,
            this.stop = function() {
                return t("stop"),
                this
            }
            ,
            this.mute = function() {
                return t("mute"),
                this
            }
            ,
            this.unmute = function() {
                return t("unmute"),
                this
            }
            ,
            this.toggleMute = function() {
                return t("toggleMute"),
                this
            }
            ,
            this.setVolume = function(e) {
                return t("setVolume", e),
                this
            }
            ,
            this.increaseVolume = function(e) {
                return t("increaseVolume", e),
                this
            }
            ,
            this.decreaseVolume = function(e) {
                return t("decreaseVolume", e),
                this
            }
            ,
            this.loop = function() {
                return t("loop"),
                this
            }
            ,
            this.unloop = function() {
                return t("unloop"),
                this
            }
            ,
            this.setTime = function(e) {
                return t("setTime", e),
                this
            }
            ,
            this.set = function(e, r) {
                return t("set", e, r),
                this
            }
            ,
            this.bind = function(e, r) {
                return t("bind", e, r),
                this
            }
            ,
            this.unbind = function(e) {
                return t("unbind", e),
                this
            }
            ,
            this.bindOnce = function(e, r) {
                return t("bindOnce", e, r),
                this
            }
            ,
            this.trigger = function(e) {
                return t("trigger", e),
                this
            }
            ,
            this.fade = function(e, r, n, o) {
                return t("fade", e, r, n, o),
                this
            }
            ,
            this.fadeIn = function(e, r) {
                return t("fadeIn", e, r),
                this
            }
            ,
            this.fadeOut = function(e, r) {
                return t("fadeOut", e, r),
                this
            }
        },
        all: function() {
            return new e.group(e.sounds)
        },
        isSupported: function() {
            return !!e.el.canPlayType
        },
        isOGGSupported: function() {
            return !!e.el.canPlayType && e.el.canPlayType('audio/ogg; codecs="vorbis"')
        },
        isWAVSupported: function() {
            return !!e.el.canPlayType && e.el.canPlayType('audio/wav; codecs="1"')
        },
        isMP3Supported: function() {
            return !!e.el.canPlayType && e.el.canPlayType("audio/mpeg;")
        },
        isAACSupported: function() {
            return !!e.el.canPlayType && (e.el.canPlayType("audio/x-m4a;") || e.el.canPlayType("audio/aac;"))
        },
        toTimer: function(e, t) {
            var r, n, o;
            return r = Math.floor(e / 3600),
            r = isNaN(r) ? "--" : r >= 10 ? r : "0" + r,
            n = t ? Math.floor(e / 60 % 60) : Math.floor(e / 60),
            n = isNaN(n) ? "--" : n >= 10 ? n : "0" + n,
            o = Math.floor(e % 60),
            o = isNaN(o) ? "--" : o >= 10 ? o : "0" + o,
            t ? r + ":" + n + ":" + o : n + ":" + o
        },
        fromTimer: function(e) {
            var t = ("" + e).split(":");
            return t && 3 == t.length && (e = 3600 * parseInt(t[0], 10) + 60 * parseInt(t[1], 10) + parseInt(t[2], 10)),
            t && 2 == t.length && (e = 60 * parseInt(t[0], 10) + parseInt(t[1], 10)),
            e
        },
        toPercent: function(e, t, r) {
            var n = Math.pow(10, r || 0);
            return Math.round(100 * e / t * n) / n
        },
        fromPercent: function(e, t, r) {
            var n = Math.pow(10, r || 0);
            return Math.round(t / 100 * e * n) / n
        }
    };
    return e
}),
function() {
    function e(e, t, r) {
        e.addEventListener ? e.addEventListener(t, r, !1) : e.attachEvent("on" + t, r)
    }
    function t(e) {
        return "keypress" == e.type ? String.fromCharCode(e.which) : d[e.which] ? d[e.which] : p[e.which] ? p[e.which] : String.fromCharCode(e.which).toLowerCase()
    }
    function r(e, t) {
        e = e || {};
        var r, n = !1;
        for (r in _)
            e[r] && _[r] > t ? n = !0 : _[r] = 0;
        n || (x = !1)
    }
    function n(e, t, r, n, o) {
        var a, s, l = [], c = r.type;
        if (!f[e])
            return [];
        for ("keyup" == c && i(e) && (t = [e]),
        a = 0; a < f[e].length; ++a)
            s = f[e][a],
            s.seq && _[s.seq] != s.level || c != s.action || ("keypress" != c || r.metaKey || r.ctrlKey) && t.sort().join(",") !== s.modifiers.sort().join(",") || (n && s.combo == o && f[e].splice(a, 1),
            l.push(s));
        return l
    }
    function o(e, t, r) {
        b.stopCallback(t, t.target || t.srcElement, r) || !1 !== e(t, r) || (t.preventDefault && t.preventDefault(),
        t.stopPropagation && t.stopPropagation(),
        t.returnValue = !1,
        t.cancelBubble = !0)
    }
    function a(e) {
        "number" != typeof e.which && (e.which = e.keyCode);
        var a = t(e);
        if (a)
            if ("keyup" == e.type && y == a)
                y = !1;
            else {
                var s = [];
                e.shiftKey && s.push("shift"),
                e.altKey && s.push("alt"),
                e.ctrlKey && s.push("ctrl"),
                e.metaKey && s.push("meta");
                var l, s = n(a, s, e), c = {}, u = 0, d = !1;
                for (l = 0; l < s.length; ++l)
                    s[l].seq ? (d = !0,
                    u = Math.max(u, s[l].level),
                    c[s[l].seq] = 1,
                    o(s[l].callback, e, s[l].combo)) : !d && !x && o(s[l].callback, e, s[l].combo);
                e.type == x && !i(a) && r(c, u)
            }
    }
    function i(e) {
        return "shift" == e || "ctrl" == e || "alt" == e || "meta" == e
    }
    function s(e, t, r) {
        if (!r) {
            if (!c) {
                c = {};
                for (var n in d)
                    n > 95 && 112 > n || d.hasOwnProperty(n) && (c[d[n]] = n)
            }
            r = c[e] ? "keydown" : "keypress"
        }
        return "keypress" == r && t.length && (r = "keydown"),
        r
    }
    function l(e, a, c, d, p) {
        m[e + ":" + c] = a,
        e = e.replace(/\s+/g, " ");
        var v, b, w = e.split(" "), C = [];
        if (1 < w.length) {
            var S = e
              , T = c;
            for (_[S] = 0,
            T || (T = s(w[0], [])),
            e = function() {
                x = T,
                ++_[S],
                clearTimeout(u),
                u = setTimeout(r, 1e3)
            }
            ,
            c = function(e) {
                o(a, e, S),
                "keyup" !== T && (y = t(e)),
                setTimeout(r, 10)
            }
            ,
            d = 0; d < w.length; ++d)
                l(w[d], d < w.length - 1 ? e : c, T, S, d)
        } else {
            for (b = "+" === e ? ["+"] : e.split("+"),
            w = 0; w < b.length; ++w)
                v = b[w],
                h[v] && (v = h[v]),
                c && "keypress" != c && g[v] && (v = g[v],
                C.push("shift")),
                i(v) && C.push(v);
            c = s(v, C, c),
            f[v] || (f[v] = []),
            n(v, C, {
                type: c
            }, !d, e),
            f[v][d ? "unshift" : "push"]({
                callback: a,
                modifiers: C,
                action: c,
                seq: d,
                level: p,
                combo: e
            })
        }
    }
    for (var c, u, d = {
        8: "backspace",
        9: "tab",
        13: "enter",
        16: "shift",
        17: "ctrl",
        18: "alt",
        20: "capslock",
        27: "esc",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "ins",
        46: "del",
        91: "meta",
        93: "meta",
        224: "meta"
    }, p = {
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
    }, g = {
        "~": "`",
        "!": "1",
        "@": "2",
        "#": "3",
        $: "4",
        "%": "5",
        "^": "6",
        "&": "7",
        "*": "8",
        "(": "9",
        ")": "0",
        _: "-",
        "+": "=",
        ":": ";",
        '"': "'",
        "<": ",",
        ">": ".",
        "?": "/",
        "|": "\\"
    }, h = {
        option: "alt",
        command: "meta",
        "return": "enter",
        escape: "esc"
    }, f = {}, m = {}, _ = {}, y = !1, x = !1, v = 1; 20 > v; ++v)
        d[111 + v] = "f" + v;
    for (v = 0; 9 >= v; ++v)
        d[v + 96] = v;
    e(document, "keypress", a),
    e(document, "keydown", a),
    e(document, "keyup", a);
    var b = {
        bind: function(e, t, r) {
            e = e instanceof Array ? e : [e];
            for (var n = 0; n < e.length; ++n)
                l(e[n], t, r);
            return this
        },
        unbind: function(e, t) {
            return b.bind(e, function() {}, t)
        },
        trigger: function(e, t) {
            return m[e + ":" + t] && m[e + ":" + t](),
            this
        },
        reset: function() {
            return f = {},
            m = {},
            this
        },
        stopCallback: function(e, t) {
            return -1 < (" " + t.className + " ").indexOf(" mousetrap ") ? !1 : "INPUT" == t.tagName || "SELECT" == t.tagName || "TEXTAREA" == t.tagName || t.contentEditable && "true" == t.contentEditable
        }
    };
    window.Mousetrap = b,
    "function" == typeof define && define.amd && define(b)
}(),
!function(e, t, r, n) {
    "use strict";
    function o(e, t, r) {
        return setTimeout(u(e, r), t)
    }
    function a(e, t, r) {
        return Array.isArray(e) ? (i(e, r[t], r),
        !0) : !1
    }
    function i(e, t, r) {
        var o;
        if (e)
            if (e.forEach)
                e.forEach(t, r);
            else if (e.length !== n)
                for (o = 0; o < e.length; )
                    t.call(r, e[o], o, e),
                    o++;
            else
                for (o in e)
                    e.hasOwnProperty(o) && t.call(r, e[o], o, e)
    }
    function s(e, t, r) {
        for (var o = Object.keys(t), a = 0; a < o.length; )
            (!r || r && e[o[a]] === n) && (e[o[a]] = t[o[a]]),
            a++;
        return e
    }
    function l(e, t) {
        return s(e, t, !0)
    }
    function c(e, t, r) {
        var n, o = t.prototype;
        n = e.prototype = Object.create(o),
        n.constructor = e,
        n._super = o,
        r && s(n, r)
    }
    function u(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }
    function d(e, t) {
        return typeof e == ut ? e.apply(t ? t[0] || n : n, t) : e
    }
    function p(e, t) {
        return e === n ? t : e
    }
    function g(e, t, r) {
        i(_(t), function(t) {
            e.addEventListener(t, r, !1)
        })
    }
    function h(e, t, r) {
        i(_(t), function(t) {
            e.removeEventListener(t, r, !1)
        })
    }
    function f(e, t) {
        for (; e; ) {
            if (e == t)
                return !0;
            e = e.parentNode
        }
        return !1
    }
    function m(e, t) {
        return e.indexOf(t) > -1
    }
    function _(e) {
        return e.trim().split(/\s+/g)
    }
    function y(e, t, r) {
        if (e.indexOf && !r)
            return e.indexOf(t);
        for (var n = 0; n < e.length; ) {
            if (r && e[n][r] == t || !r && e[n] === t)
                return n;
            n++
        }
        return -1
    }
    function x(e) {
        return Array.prototype.slice.call(e, 0)
    }
    function v(e, t, r) {
        for (var n = [], o = [], a = 0; a < e.length; ) {
            var i = t ? e[a][t] : e[a];
            y(o, i) < 0 && n.push(e[a]),
            o[a] = i,
            a++
        }
        return r && (n = t ? n.sort(function(e, r) {
            return e[t] > r[t]
        }) : n.sort()),
        n
    }
    function b(e, t) {
        for (var r, o, a = t[0].toUpperCase() + t.slice(1), i = 0; i < lt.length; ) {
            if (r = lt[i],
            o = r ? r + a : t,
            o in e)
                return o;
            i++
        }
        return n
    }
    function w() {
        return ht++
    }
    function C(e) {
        var t = e.ownerDocument;
        return t.defaultView || t.parentWindow
    }
    function S(e, t) {
        var r = this;
        this.manager = e,
        this.callback = t,
        this.element = e.element,
        this.target = e.options.inputTarget,
        this.domHandler = function(t) {
            d(e.options.enable, [e]) && r.handler(t)
        }
        ,
        this.init()
    }
    function T(e) {
        var t, r = e.options.inputClass;
        return new (t = r ? r : _t ? z : yt ? q : mt ? Y : O)(e,k)
    }
    function k(e, t, r) {
        var n = r.pointers.length
          , o = r.changedPointers.length
          , a = t & St && n - o === 0
          , i = t & (kt | Pt) && n - o === 0;
        r.isFirst = !!a,
        r.isFinal = !!i,
        a && (e.session = {}),
        r.eventType = t,
        P(e, r),
        e.emit("hammer.input", r),
        e.recognize(r),
        e.session.prevInput = r
    }
    function P(e, t) {
        var r = e.session
          , n = t.pointers
          , o = n.length;
        r.firstInput || (r.firstInput = I(t)),
        o > 1 && !r.firstMultiple ? r.firstMultiple = I(t) : 1 === o && (r.firstMultiple = !1);
        var a = r.firstInput
          , i = r.firstMultiple
          , s = i ? i.center : a.center
          , l = t.center = N(n);
        t.timeStamp = gt(),
        t.deltaTime = t.timeStamp - a.timeStamp,
        t.angle = B(s, l),
        t.distance = M(s, l),
        A(r, t),
        t.offsetDirection = E(t.deltaX, t.deltaY),
        t.scale = i ? W(i.pointers, n) : 1,
        t.rotation = i ? R(i.pointers, n) : 0,
        D(r, t);
        var c = e.element;
        f(t.srcEvent.target, c) && (c = t.srcEvent.target),
        t.target = c
    }
    function A(e, t) {
        var r = t.center
          , n = e.offsetDelta || {}
          , o = e.prevDelta || {}
          , a = e.prevInput || {};
        (t.eventType === St || a.eventType === kt) && (o = e.prevDelta = {
            x: a.deltaX || 0,
            y: a.deltaY || 0
        },
        n = e.offsetDelta = {
            x: r.x,
            y: r.y
        }),
        t.deltaX = o.x + (r.x - n.x),
        t.deltaY = o.y + (r.y - n.y)
    }
    function D(e, t) {
        var r, o, a, i, s = e.lastInterval || t, l = t.timeStamp - s.timeStamp;
        if (t.eventType != Pt && (l > Ct || s.velocity === n)) {
            var c = s.deltaX - t.deltaX
              , u = s.deltaY - t.deltaY
              , d = F(l, c, u);
            o = d.x,
            a = d.y,
            r = pt(d.x) > pt(d.y) ? d.x : d.y,
            i = E(c, u),
            e.lastInterval = t
        } else
            r = s.velocity,
            o = s.velocityX,
            a = s.velocityY,
            i = s.direction;
        t.velocity = r,
        t.velocityX = o,
        t.velocityY = a,
        t.direction = i
    }
    function I(e) {
        for (var t = [], r = 0; r < e.pointers.length; )
            t[r] = {
                clientX: dt(e.pointers[r].clientX),
                clientY: dt(e.pointers[r].clientY)
            },
            r++;
        return {
            timeStamp: gt(),
            pointers: t,
            center: N(t),
            deltaX: e.deltaX,
            deltaY: e.deltaY
        }
    }
    function N(e) {
        var t = e.length;
        if (1 === t)
            return {
                x: dt(e[0].clientX),
                y: dt(e[0].clientY)
            };
        for (var r = 0, n = 0, o = 0; t > o; )
            r += e[o].clientX,
            n += e[o].clientY,
            o++;
        return {
            x: dt(r / t),
            y: dt(n / t)
        }
    }
    function F(e, t, r) {
        return {
            x: t / e || 0,
            y: r / e || 0
        }
    }
    function E(e, t) {
        return e === t ? At : pt(e) >= pt(t) ? e > 0 ? Dt : It : t > 0 ? Nt : Ft
    }
    function M(e, t, r) {
        r || (r = Rt);
        var n = t[r[0]] - e[r[0]]
          , o = t[r[1]] - e[r[1]];
        return Math.sqrt(n * n + o * o)
    }
    function B(e, t, r) {
        r || (r = Rt);
        var n = t[r[0]] - e[r[0]]
          , o = t[r[1]] - e[r[1]];
        return 180 * Math.atan2(o, n) / Math.PI
    }
    function R(e, t) {
        return B(t[1], t[0], Wt) - B(e[1], e[0], Wt)
    }
    function W(e, t) {
        return M(t[0], t[1], Wt) / M(e[0], e[1], Wt)
    }
    function O() {
        this.evEl = zt,
        this.evWin = Lt,
        this.allow = !0,
        this.pressed = !1,
        S.apply(this, arguments)
    }
    function z() {
        this.evEl = Ht,
        this.evWin = Yt,
        S.apply(this, arguments),
        this.store = this.manager.session.pointerEvents = []
    }
    function L() {
        this.evTarget = Xt,
        this.evWin = Vt,
        this.started = !1,
        S.apply(this, arguments)
    }
    function j(e, t) {
        var r = x(e.touches)
          , n = x(e.changedTouches);
        return t & (kt | Pt) && (r = v(r.concat(n), "identifier", !0)),
        [r, n]
    }
    function q() {
        this.evTarget = $t,
        this.targetIds = {},
        S.apply(this, arguments)
    }
    function H(e, t) {
        var r = x(e.touches)
          , n = this.targetIds;
        if (t & (St | Tt) && 1 === r.length)
            return n[r[0].identifier] = !0,
            [r, r];
        var o, a, i = x(e.changedTouches), s = [], l = this.target;
        if (a = r.filter(function(e) {
            return f(e.target, l)
        }),
        t === St)
            for (o = 0; o < a.length; )
                n[a[o].identifier] = !0,
                o++;
        for (o = 0; o < i.length; )
            n[i[o].identifier] && s.push(i[o]),
            t & (kt | Pt) && delete n[i[o].identifier],
            o++;
        return s.length ? [v(a.concat(s), "identifier", !0), s] : void 0
    }
    function Y() {
        S.apply(this, arguments);
        var e = u(this.handler, this);
        this.touch = new q(this.manager,e),
        this.mouse = new O(this.manager,e)
    }
    function G(e, t) {
        this.manager = e,
        this.set(t)
    }
    function X(e) {
        if (m(e, tr))
            return tr;
        var t = m(e, rr)
          , r = m(e, nr);
        return t && r ? rr + " " + nr : t || r ? t ? rr : nr : m(e, er) ? er : Zt
    }
    function V(e) {
        this.id = w(),
        this.manager = null,
        this.options = l(e || {}, this.defaults),
        this.options.enable = p(this.options.enable, !0),
        this.state = or,
        this.simultaneous = {},
        this.requireFail = []
    }
    function U(e) {
        return e & cr ? "cancel" : e & sr ? "end" : e & ir ? "move" : e & ar ? "start" : ""
    }
    function $(e) {
        return e == Ft ? "down" : e == Nt ? "up" : e == Dt ? "left" : e == It ? "right" : ""
    }
    function K(e, t) {
        var r = t.manager;
        return r ? r.get(e) : e
    }
    function J() {
        V.apply(this, arguments)
    }
    function Q() {
        J.apply(this, arguments),
        this.pX = null,
        this.pY = null
    }
    function Z() {
        J.apply(this, arguments)
    }
    function et() {
        V.apply(this, arguments),
        this._timer = null,
        this._input = null
    }
    function tt() {
        J.apply(this, arguments)
    }
    function rt() {
        J.apply(this, arguments)
    }
    function nt() {
        V.apply(this, arguments),
        this.pTime = !1,
        this.pCenter = !1,
        this._timer = null,
        this._input = null,
        this.count = 0
    }
    function ot(e, t) {
        return t = t || {},
        t.recognizers = p(t.recognizers, ot.defaults.preset),
        new at(e,t)
    }
    function at(e, t) {
        t = t || {},
        this.options = l(t, ot.defaults),
        this.options.inputTarget = this.options.inputTarget || e,
        this.handlers = {},
        this.session = {},
        this.recognizers = [],
        this.element = e,
        this.input = T(this),
        this.touchAction = new G(this,this.options.touchAction),
        it(this, !0),
        i(t.recognizers, function(e) {
            var t = this.add(new e[0](e[1]));
            e[2] && t.recognizeWith(e[2]),
            e[3] && t.requireFailure(e[3])
        }, this)
    }
    function it(e, t) {
        var r = e.element;
        i(e.options.cssProps, function(e, n) {
            r.style[b(r.style, n)] = t ? e : ""
        })
    }
    function st(e, r) {
        var n = t.createEvent("Event");
        n.initEvent(e, !0, !0),
        n.gesture = r,
        r.target.dispatchEvent(n)
    }
    var lt = ["", "webkit", "moz", "MS", "ms", "o"]
      , ct = t.createElement("div")
      , ut = "function"
      , dt = Math.round
      , pt = Math.abs
      , gt = Date.now
      , ht = 1
      , ft = /mobile|tablet|ip(ad|hone|od)|android/i
      , mt = "ontouchstart"in e
      , _t = b(e, "PointerEvent") !== n
      , yt = mt && ft.test(navigator.userAgent)
      , xt = "touch"
      , vt = "pen"
      , bt = "mouse"
      , wt = "kinect"
      , Ct = 25
      , St = 1
      , Tt = 2
      , kt = 4
      , Pt = 8
      , At = 1
      , Dt = 2
      , It = 4
      , Nt = 8
      , Ft = 16
      , Et = Dt | It
      , Mt = Nt | Ft
      , Bt = Et | Mt
      , Rt = ["x", "y"]
      , Wt = ["clientX", "clientY"];
    S.prototype = {
        handler: function() {},
        init: function() {
            this.evEl && g(this.element, this.evEl, this.domHandler),
            this.evTarget && g(this.target, this.evTarget, this.domHandler),
            this.evWin && g(C(this.element), this.evWin, this.domHandler)
        },
        destroy: function() {
            this.evEl && h(this.element, this.evEl, this.domHandler),
            this.evTarget && h(this.target, this.evTarget, this.domHandler),
            this.evWin && h(C(this.element), this.evWin, this.domHandler)
        }
    };
    var Ot = {
        mousedown: St,
        mousemove: Tt,
        mouseup: kt
    }
      , zt = "mousedown"
      , Lt = "mousemove mouseup";
    c(O, S, {
        handler: function(e) {
            var t = Ot[e.type];
            t & St && 0 === e.button && (this.pressed = !0),
            t & Tt && 1 !== e.which && (t = kt),
            this.pressed && this.allow && (t & kt && (this.pressed = !1),
            this.callback(this.manager, t, {
                pointers: [e],
                changedPointers: [e],
                pointerType: bt,
                srcEvent: e
            }))
        }
    });
    var jt = {
        pointerdown: St,
        pointermove: Tt,
        pointerup: kt,
        pointercancel: Pt,
        pointerout: Pt
    }
      , qt = {
        2: xt,
        3: vt,
        4: bt,
        5: wt
    }
      , Ht = "pointerdown"
      , Yt = "pointermove pointerup pointercancel";
    e.MSPointerEvent && (Ht = "MSPointerDown",
    Yt = "MSPointerMove MSPointerUp MSPointerCancel"),
    c(z, S, {
        handler: function(e) {
            var t = this.store
              , r = !1
              , n = e.type.toLowerCase().replace("ms", "")
              , o = jt[n]
              , a = qt[e.pointerType] || e.pointerType
              , i = a == xt
              , s = y(t, e.pointerId, "pointerId");
            o & St && (0 === e.button || i) ? 0 > s && (t.push(e),
            s = t.length - 1) : o & (kt | Pt) && (r = !0),
            0 > s || (t[s] = e,
            this.callback(this.manager, o, {
                pointers: t,
                changedPointers: [e],
                pointerType: a,
                srcEvent: e
            }),
            r && t.splice(s, 1))
        }
    });
    var Gt = {
        touchstart: St,
        touchmove: Tt,
        touchend: kt,
        touchcancel: Pt
    }
      , Xt = "touchstart"
      , Vt = "touchstart touchmove touchend touchcancel";
    c(L, S, {
        handler: function(e) {
            var t = Gt[e.type];
            if (t === St && (this.started = !0),
            this.started) {
                var r = j.call(this, e, t);
                t & (kt | Pt) && r[0].length - r[1].length === 0 && (this.started = !1),
                this.callback(this.manager, t, {
                    pointers: r[0],
                    changedPointers: r[1],
                    pointerType: xt,
                    srcEvent: e
                })
            }
        }
    });
    var Ut = {
        touchstart: St,
        touchmove: Tt,
        touchend: kt,
        touchcancel: Pt
    }
      , $t = "touchstart touchmove touchend touchcancel";
    c(q, S, {
        handler: function(e) {
            var t = Ut[e.type]
              , r = H.call(this, e, t);
            r && this.callback(this.manager, t, {
                pointers: r[0],
                changedPointers: r[1],
                pointerType: xt,
                srcEvent: e
            })
        }
    }),
    c(Y, S, {
        handler: function(e, t, r) {
            var n = r.pointerType == xt
              , o = r.pointerType == bt;
            if (n)
                this.mouse.allow = !1;
            else if (o && !this.mouse.allow)
                return;
            t & (kt | Pt) && (this.mouse.allow = !0),
            this.callback(e, t, r)
        },
        destroy: function() {
            this.touch.destroy(),
            this.mouse.destroy()
        }
    });
    var Kt = b(ct.style, "touchAction")
      , Jt = Kt !== n
      , Qt = "compute"
      , Zt = "auto"
      , er = "manipulation"
      , tr = "none"
      , rr = "pan-x"
      , nr = "pan-y";
    G.prototype = {
        set: function(e) {
            e == Qt && (e = this.compute()),
            Jt && (this.manager.element.style[Kt] = e),
            this.actions = e.toLowerCase().trim()
        },
        update: function() {
            this.set(this.manager.options.touchAction)
        },
        compute: function() {
            var e = [];
            return i(this.manager.recognizers, function(t) {
                d(t.options.enable, [t]) && (e = e.concat(t.getTouchAction()))
            }),
            X(e.join(" "))
        },
        preventDefaults: function(e) {
            if (!Jt) {
                var t = e.srcEvent
                  , r = e.offsetDirection;
                if (this.manager.session.prevented)
                    return void t.preventDefault();
                var n = this.actions
                  , o = m(n, tr)
                  , a = m(n, nr)
                  , i = m(n, rr);
                return o || a && r & Et || i && r & Mt ? this.preventSrc(t) : void 0
            }
        },
        preventSrc: function(e) {
            this.manager.session.prevented = !0,
            e.preventDefault()
        }
    };
    var or = 1
      , ar = 2
      , ir = 4
      , sr = 8
      , lr = sr
      , cr = 16
      , ur = 32;
    V.prototype = {
        defaults: {},
        set: function(e) {
            return s(this.options, e),
            this.manager && this.manager.touchAction.update(),
            this
        },
        recognizeWith: function(e) {
            if (a(e, "recognizeWith", this))
                return this;
            var t = this.simultaneous;
            return e = K(e, this),
            t[e.id] || (t[e.id] = e,
            e.recognizeWith(this)),
            this
        },
        dropRecognizeWith: function(e) {
            return a(e, "dropRecognizeWith", this) ? this : (e = K(e, this),
            delete this.simultaneous[e.id],
            this)
        },
        requireFailure: function(e) {
            if (a(e, "requireFailure", this))
                return this;
            var t = this.requireFail;
            return e = K(e, this),
            -1 === y(t, e) && (t.push(e),
            e.requireFailure(this)),
            this
        },
        dropRequireFailure: function(e) {
            if (a(e, "dropRequireFailure", this))
                return this;
            e = K(e, this);
            var t = y(this.requireFail, e);
            return t > -1 && this.requireFail.splice(t, 1),
            this
        },
        hasRequireFailures: function() {
            return this.requireFail.length > 0
        },
        canRecognizeWith: function(e) {
            return !!this.simultaneous[e.id]
        },
        emit: function(e) {
            function t(t) {
                r.manager.emit(r.options.event + (t ? U(n) : ""), e)
            }
            var r = this
              , n = this.state;
            sr > n && t(!0),
            t(),
            n >= sr && t(!0)
        },
        tryEmit: function(e) {
            return this.canEmit() ? this.emit(e) : void (this.state = ur)
        },
        canEmit: function() {
            for (var e = 0; e < this.requireFail.length; ) {
                if (!(this.requireFail[e].state & (ur | or)))
                    return !1;
                e++
            }
            return !0
        },
        recognize: function(e) {
            var t = s({}, e);
            return d(this.options.enable, [this, t]) ? (this.state & (lr | cr | ur) && (this.state = or),
            this.state = this.process(t),
            void (this.state & (ar | ir | sr | cr) && this.tryEmit(t))) : (this.reset(),
            void (this.state = ur))
        },
        process: function() {},
        getTouchAction: function() {},
        reset: function() {}
    },
    c(J, V, {
        defaults: {
            pointers: 1
        },
        attrTest: function(e) {
            var t = this.options.pointers;
            return 0 === t || e.pointers.length === t
        },
        process: function(e) {
            var t = this.state
              , r = e.eventType
              , n = t & (ar | ir)
              , o = this.attrTest(e);
            return n && (r & Pt || !o) ? t | cr : n || o ? r & kt ? t | sr : t & ar ? t | ir : ar : ur
        }
    }),
    c(Q, J, {
        defaults: {
            event: "pan",
            threshold: 10,
            pointers: 1,
            direction: Bt
        },
        getTouchAction: function() {
            var e = this.options.direction
              , t = [];
            return e & Et && t.push(nr),
            e & Mt && t.push(rr),
            t
        },
        directionTest: function(e) {
            var t = this.options
              , r = !0
              , n = e.distance
              , o = e.direction
              , a = e.deltaX
              , i = e.deltaY;
            return o & t.direction || (t.direction & Et ? (o = 0 === a ? At : 0 > a ? Dt : It,
            r = a != this.pX,
            n = Math.abs(e.deltaX)) : (o = 0 === i ? At : 0 > i ? Nt : Ft,
            r = i != this.pY,
            n = Math.abs(e.deltaY))),
            e.direction = o,
            r && n > t.threshold && o & t.direction
        },
        attrTest: function(e) {
            return J.prototype.attrTest.call(this, e) && (this.state & ar || !(this.state & ar) && this.directionTest(e))
        },
        emit: function(e) {
            this.pX = e.deltaX,
            this.pY = e.deltaY;
            var t = $(e.direction);
            t && this.manager.emit(this.options.event + t, e),
            this._super.emit.call(this, e)
        }
    }),
    c(Z, J, {
        defaults: {
            event: "pinch",
            threshold: 0,
            pointers: 2
        },
        getTouchAction: function() {
            return [tr]
        },
        attrTest: function(e) {
            return this._super.attrTest.call(this, e) && (Math.abs(e.scale - 1) > this.options.threshold || this.state & ar)
        },
        emit: function(e) {
            if (this._super.emit.call(this, e),
            1 !== e.scale) {
                var t = e.scale < 1 ? "in" : "out";
                this.manager.emit(this.options.event + t, e)
            }
        }
    }),
    c(et, V, {
        defaults: {
            event: "press",
            pointers: 1,
            time: 500,
            threshold: 5
        },
        getTouchAction: function() {
            return [Zt]
        },
        process: function(e) {
            var t = this.options
              , r = e.pointers.length === t.pointers
              , n = e.distance < t.threshold
              , a = e.deltaTime > t.time;
            if (this._input = e,
            !n || !r || e.eventType & (kt | Pt) && !a)
                this.reset();
            else if (e.eventType & St)
                this.reset(),
                this._timer = o(function() {
                    this.state = lr,
                    this.tryEmit()
                }, t.time, this);
            else if (e.eventType & kt)
                return lr;
            return ur
        },
        reset: function() {
            clearTimeout(this._timer)
        },
        emit: function(e) {
            this.state === lr && (e && e.eventType & kt ? this.manager.emit(this.options.event + "up", e) : (this._input.timeStamp = gt(),
            this.manager.emit(this.options.event, this._input)))
        }
    }),
    c(tt, J, {
        defaults: {
            event: "rotate",
            threshold: 0,
            pointers: 2
        },
        getTouchAction: function() {
            return [tr]
        },
        attrTest: function(e) {
            return this._super.attrTest.call(this, e) && (Math.abs(e.rotation) > this.options.threshold || this.state & ar)
        }
    }),
    c(rt, J, {
        defaults: {
            event: "swipe",
            threshold: 10,
            velocity: .65,
            direction: Et | Mt,
            pointers: 1
        },
        getTouchAction: function() {
            return Q.prototype.getTouchAction.call(this)
        },
        attrTest: function(e) {
            var t, r = this.options.direction;
            return r & (Et | Mt) ? t = e.velocity : r & Et ? t = e.velocityX : r & Mt && (t = e.velocityY),
            this._super.attrTest.call(this, e) && r & e.direction && e.distance > this.options.threshold && pt(t) > this.options.velocity && e.eventType & kt
        },
        emit: function(e) {
            var t = $(e.direction);
            t && this.manager.emit(this.options.event + t, e),
            this.manager.emit(this.options.event, e)
        }
    }),
    c(nt, V, {
        defaults: {
            event: "tap",
            pointers: 1,
            taps: 1,
            interval: 300,
            time: 250,
            threshold: 2,
            posThreshold: 10
        },
        getTouchAction: function() {
            return [er]
        },
        process: function(e) {
            var t = this.options
              , r = e.pointers.length === t.pointers
              , n = e.distance < t.threshold
              , a = e.deltaTime < t.time;
            if (this.reset(),
            e.eventType & St && 0 === this.count)
                return this.failTimeout();
            if (n && a && r) {
                if (e.eventType != kt)
                    return this.failTimeout();
                var i = this.pTime ? e.timeStamp - this.pTime < t.interval : !0
                  , s = !this.pCenter || M(this.pCenter, e.center) < t.posThreshold;
                this.pTime = e.timeStamp,
                this.pCenter = e.center,
                s && i ? this.count += 1 : this.count = 1,
                this._input = e;
                var l = this.count % t.taps;
                if (0 === l)
                    return this.hasRequireFailures() ? (this._timer = o(function() {
                        this.state = lr,
                        this.tryEmit()
                    }, t.interval, this),
                    ar) : lr
            }
            return ur
        },
        failTimeout: function() {
            return this._timer = o(function() {
                this.state = ur
            }, this.options.interval, this),
            ur
        },
        reset: function() {
            clearTimeout(this._timer)
        },
        emit: function() {
            this.state == lr && (this._input.tapCount = this.count,
            this.manager.emit(this.options.event, this._input))
        }
    }),
    ot.VERSION = "2.0.4",
    ot.defaults = {
        domEvents: !1,
        touchAction: Qt,
        enable: !0,
        inputTarget: null,
        inputClass: null,
        preset: [[tt, {
            enable: !1
        }], [Z, {
            enable: !1
        }, ["rotate"]], [rt, {
            direction: Et
        }], [Q, {
            direction: Et
        }, ["swipe"]], [nt], [nt, {
            event: "doubletap",
            taps: 2
        }, ["tap"]], [et]],
        cssProps: {
            userSelect: "none",
            touchSelect: "none",
            touchCallout: "none",
            contentZooming: "none",
            userDrag: "none",
            tapHighlightColor: "rgba(0,0,0,0)"
        }
    };
    var dr = 1
      , pr = 2;
    at.prototype = {
        set: function(e) {
            return s(this.options, e),
            e.touchAction && this.touchAction.update(),
            e.inputTarget && (this.input.destroy(),
            this.input.target = e.inputTarget,
            this.input.init()),
            this
        },
        stop: function(e) {
            this.session.stopped = e ? pr : dr
        },
        recognize: function(e) {
            var t = this.session;
            if (!t.stopped) {
                this.touchAction.preventDefaults(e);
                var r, n = this.recognizers, o = t.curRecognizer;
                (!o || o && o.state & lr) && (o = t.curRecognizer = null);
                for (var a = 0; a < n.length; )
                    r = n[a],
                    t.stopped === pr || o && r != o && !r.canRecognizeWith(o) ? r.reset() : r.recognize(e),
                    !o && r.state & (ar | ir | sr) && (o = t.curRecognizer = r),
                    a++
            }
        },
        get: function(e) {
            if (e instanceof V)
                return e;
            for (var t = this.recognizers, r = 0; r < t.length; r++)
                if (t[r].options.event == e)
                    return t[r];
            return null
        },
        add: function(e) {
            if (a(e, "add", this))
                return this;
            var t = this.get(e.options.event);
            return t && this.remove(t),
            this.recognizers.push(e),
            e.manager = this,
            this.touchAction.update(),
            e
        },
        remove: function(e) {
            if (a(e, "remove", this))
                return this;
            var t = this.recognizers;
            return e = this.get(e),
            t.splice(y(t, e), 1),
            this.touchAction.update(),
            this
        },
        on: function(e, t) {
            var r = this.handlers;
            return i(_(e), function(e) {
                r[e] = r[e] || [],
                r[e].push(t)
            }),
            this
        },
        off: function(e, t) {
            var r = this.handlers;
            return i(_(e), function(e) {
                t ? r[e].splice(y(r[e], t), 1) : delete r[e]
            }),
            this
        },
        emit: function(e, t) {
            this.options.domEvents && st(e, t);
            var r = this.handlers[e] && this.handlers[e].slice();
            if (r && r.length) {
                t.type = e,
                t.preventDefault = function() {
                    t.srcEvent.preventDefault()
                }
                ;
                for (var n = 0; n < r.length; )
                    r[n](t),
                    n++
            }
        },
        destroy: function() {
            this.element && it(this, !1),
            this.handlers = {},
            this.session = {},
            this.input.destroy(),
            this.element = null
        }
    },
    s(ot, {
        INPUT_START: St,
        INPUT_MOVE: Tt,
        INPUT_END: kt,
        INPUT_CANCEL: Pt,
        STATE_POSSIBLE: or,
        STATE_BEGAN: ar,
        STATE_CHANGED: ir,
        STATE_ENDED: sr,
        STATE_RECOGNIZED: lr,
        STATE_CANCELLED: cr,
        STATE_FAILED: ur,
        DIRECTION_NONE: At,
        DIRECTION_LEFT: Dt,
        DIRECTION_RIGHT: It,
        DIRECTION_UP: Nt,
        DIRECTION_DOWN: Ft,
        DIRECTION_HORIZONTAL: Et,
        DIRECTION_VERTICAL: Mt,
        DIRECTION_ALL: Bt,
        Manager: at,
        Input: S,
        TouchAction: G,
        TouchInput: q,
        MouseInput: O,
        PointerEventInput: z,
        TouchMouseInput: Y,
        SingleTouchInput: L,
        Recognizer: V,
        AttrRecognizer: J,
        Tap: nt,
        Pan: Q,
        Swipe: rt,
        Pinch: Z,
        Rotate: tt,
        Press: et,
        on: g,
        off: h,
        each: i,
        merge: l,
        extend: s,
        inherit: c,
        bindFn: u,
        prefixed: b
    }),
    typeof define == ut && define.amd ? define(function() {
        return ot
    }) : "undefined" != typeof module && module.exports ? module.exports = ot : e[r] = ot
}(window, document, "Hammer");
