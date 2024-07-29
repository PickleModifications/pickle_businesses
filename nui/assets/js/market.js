const CONFIG_INVENTORY_IMG_DIR = "nui://ox_inventory/web/images"
const CONFIG_CURRENCY_ITEMS = [
    {
        label_locale: "market_cash",
        name: "cash",
        image: `assets/images/cash.png`,
    },
    {
        label_locale: "market_card",
        name: "card",
        image: `assets/images/card.png`,
    },
    {
        label_locale: "market_dirtycash",
        name: "dirtycash",
        image: `assets/images/dirtycash.png`,
    },
]

var Market = {}

Market.businessId = null; 
Market.data = null;
Market.currentSubmenu = null;
Market.transitioning = false;

Market.GetCurrency = function(name) {
    for (let i=0; i<CONFIG_CURRENCY_ITEMS.length; i++) {
        if (CONFIG_CURRENCY_ITEMS[i].name == name) {
            return CONFIG_CURRENCY_ITEMS[i];
        }
    }
}

Market.GetItemLabel = function(name) {
    for (let i=0; i<Market.data.items.length; i++) {
        if (Market.data.items[i].name == name) {
            return Market.data.items[i].label;
        }
    }
    return "No Label";
}

Market.GetStackableItems = function(itemId) {
    let count = 0;
    let items = [];
    let name = Market.data.player_inventory[itemId].name;
    if (Market.data.player_inventory[itemId].durability < 100) {
        return {count: 1, itemIndexes: [itemId]};
    }
    for (let i=0; i<Market.data.player_inventory.length; i++) {
        if (Market.data.player_inventory[i].name == name && Market.data.player_inventory[i].durability >= 100) {
            count += Market.data.player_inventory[i].count;
            items.push(i);
        }
    }
    return {count: count, itemIndexes: items};
}

Market.GetListingItemInfo = function(listing) {
    let count = 0;
    let items = [];
    let name = listing.name;
    if (listing.metadata.durability != undefined && listing.metadata.durability < 100) {
        return 0;
    }
    for (let i=0; i<Market.data.player_inventory.length; i++) {
        if (Market.data.player_inventory[i].name == name && Market.data.player_inventory[i].durability >= 100) {
            count += Market.data.player_inventory[i].count;
            items.push(i);
        }
    }
    return count;
}

Market.GetEmployee = function(target) {
    let source = target;
    if (source == null || source == undefined) {
        source = Market.data.source;
    }
    else if (typeof source == 'string') {
        for (let i=0; i<Market.data.employees.length; i++) {
            if (Market.data.employees[i].identifier != null && Market.data.employees[i].identifier != undefined && Market.data.employees[i].identifier == source) {
                Market.data.employees[i].index = i;
                return Market.data.employees[i];
            }
        }
        return null;
    }
    for (let i=0; i<Market.data.employees.length; i++) {
        if (Market.data.employees[i].source != null && Market.data.employees[i].source != undefined && Market.data.employees[i].source == source) {
            Market.data.employees[i].index = i;
            return Market.data.employees[i];
        }
    }
    return null;
}

Market.GetRoleById = function(roleId) {
    let roles = Market.data.roles;
    for (let i=0; i<roles.length; i++) {
        if (roles[i].id == roleId) {
            roles[i].index = i;
            return roles[i];
        }
    }
    return null;
}

Market.DoesHavePermission = function(permission) {
    if (Market.data.admin) return true;
    let employee = Market.GetEmployee();
    if (employee == null) return false;
    let role = Market.GetRoleById(employee.roleId);
    if (role == null) return false;
    if (role.owner) return true;
    if (permission == "owner") return false;
    return (role.permissions[permission] == true);
}

Market.ClearTippy = function() {
    [...document.querySelectorAll('*')].forEach(node => {
        if (node._tippy) {
          node._tippy.destroy();
        }
    });
}

/*Main Menu*/

Market.SubmenuTransition = function(cb) {
    if (Market.transitioning) return;
    Market.transitioning = true;
    if (Market.currentSubmenu != null) {
        $("#market-container .container").fadeOut(250)
        setTimeout(() => {
            Market.transitioning = false;
            cb();
        }, 260);
    }
    else {
        Market.transitioning = false;
        cb();
    }
}

Market.SelectSubmenu = function(index) {
    if (Market.currentSubmenu == index) return;
    Market.ClearTippy();
    Market.SubmenuTransition(function() {
        switch (index) {
            case 0: {
                Market.currentSubmenu = index;
                MarketBuy.DisplayMenu()
                break;
            }
            case 1: {
                Market.currentSubmenu = index;
                MarketTrade.DisplayMenu()
                break;
            }
            case 2: {
                Market.currentSubmenu = index;
                MarketManage.DisplayMenu()
                break;
            }
            case 3: {
    
                break;
            }
            default: {
                break;
            }
            
        }
    })
}

Market.OpenStore = function(index, data) {
    Market.businessId = index;
    Market.data = {
        config: data.config, 
        admin: data.admin,
        label: data.label, 
        items: data.items, 
        money: data.money || 0,
        dirty_money: data.dirty_money || 0,
        player_inventory: data.player_inventory,
        game_info: data.game_info,
        store_listings: data.store_listings, 
        trade_listings: data.trade_listings,
        trade_inventory: data.trade_inventory,
        daily_sales: data.daily_sales,
        recent_sales: data.recent_sales,
        recent_trades: data.recent_trades,
        employees: data.employees,
        roles: data.roles,
        source: data.source,
    }
    Language = data.config.language;
    if (!Market.DoesHavePermission("logs") && !Market.DoesHavePermission("employee") && !Market.DoesHavePermission("items") && !Market.DoesHavePermission("funds")) {
        $("#market-container .header .options .manage").css("display", "none");
    }
    else {
        $("#market-container .header .options .manage").css("display", "flex");
    }

    $("#market-container").css("display", "flex").hide().fadeIn(250);
    Market.SelectSubmenu(0)
} 

$(document).ready(function() {

    $('#market-container').on('click', '.header .options > div', function(event) {
        Market.SelectSubmenu($(this).index())
    });

    document.onkeydown = function (e) {
        if (e.code == "Escape") {
            $("#market-container").fadeOut(250, function() {
                Market.ClearTippy();
                Market.businessId = null; 
                Market.data = null;
                Market.currentSubmenu = null;
                Market.transitioning = false;
                let elem = $("#market-container .container");
                elem.removeClass();
                elem.addClass("container");
                elem.html(``);
            });
            $.post('https://pickle_businesses/closeMenu', JSON.stringify({ }));
        }
    };

});

window.addEventListener('message', function(ev) {
    if (ev.data.type == "openStore") {
        Market.OpenStore(ev.data.index, ev.data.data)
    }
    else if (ev.data.type == "updatePlayerInventory") {
        Market.data.player_inventory = ev.data.data.player_inventory;
    }
});