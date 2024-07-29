var MarketManage = {};
MarketManage.chartElement = null;
MarketManage.additemprompt_selected_item = null;

MarketManage.GetAssignableRoles = function(roleId, currentRoleId) {
    let roles = Market.data.roles;
    let role = Market.GetRoleById(roleId);
    let assignableRoles = [];
    let currentPushed = false;
    for (let i=roles.length - 1; i >= 0; i--) {
        if (roles[i].id != role.id) {
            roles[i].index = i;
            assignableRoles.push(roles[i]);
            if (currentRoleId != undefined && roles[i].id == currentRoleId) {
                currentPushed = true;
            }
        }
        else {
            if (currentRoleId != undefined && !currentPushed) {
                for (let j=i; j >= 0; j--) {
                    if (roles[j].id == currentRoleId) {
                        roles[j].index = j;
                        assignableRoles.push(roles[j]);
                        break;
                    }
                }
            }
            break;
        }
    }
    assignableRoles.reverse();
    return assignableRoles;
}

MarketManage.UpdateDailySales = function(data) {
    if (data != undefined && data != null) {
        Market.data.daily_sales = data;
    }
    if (Market.currentSubmenu != 2) return;
    var ctx = document.getElementById('manage-sales-chart').getContext('2d');
    if (!Market.DoesHavePermission("logs")) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        $("#market-container .manage.container .weekly-sales .no-access").css("display", "flex");
        $("#market-container .manage.container .weekly-sales .no-access").html(_L("no_permission_view"))
        return;
    }
    let sales = Market.data.daily_sales;
    let labels = [];
    let salesData = [];
    if (sales.length == 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        $("#market-container .manage.container .weekly-sales .no-access").css("display", "flex");
        $("#market-container .manage.container .weekly-sales .no-access").html(_L("no_sales"))
        return;
    }
    else {
        for (let i=0; i<sales.length; i++) {
            labels.push(sales[i].date);
            salesData.push(sales[i].amount);
        }
        for (let i=0; i<7; i++) {
            if (sales[i] == undefined) {
                labels.unshift("N/A");
                salesData.unshift(0);
            }
        }
    }
    if (MarketManage.chartElement != null) {
        MarketManage.chartElement.destroy();
    }
    MarketManage.chartElement = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: _L("total_sales"),
                backgroundColor: '#BFDBFE',
                borderColor: '#2563EB',
                data: salesData,
            }]
        },
        options: {
            layout: {
                padding: 0,
            },
            legend: {
                display: false,
                position: 'bottom',
            },
            title: {
                display: false,
                text: ''
            },
            scales: {
                yAxes: [{
                    gridLines: { color: "rgba(255, 255, 255, 0.5)", drawBorder: false },
                    scaleLabel: {
                        display: false,
                        labelString: 'Amount'
                    },
                    ticks: {
                        beginAtZero: true,
                        fontColor: "white",
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return numberWithCommas(value);
                        }
                    }
                }],
                xAxes: [{
                    gridLines: { display: false },
                    ticks: {
                        fontColor: "white",
                    },
                    scaleLabel: {
                        display: false,
                        labelString: _L("day")
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        return _L("sales_number", numberWithCommas(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]));
                    }
                }
            }
        }
    });
}

MarketManage.UpdateRecentSales = function(data) {
    let elem = $("#market-container .container .recent-sales .table-container table");
    if (data != undefined && data != null) {
        Market.data.recent_sales = data;
    }
    if (Market.currentSubmenu != 2) return;
    if (!Market.DoesHavePermission("logs")) {
        $("#market-container .manage.container .recent-sales .no-access").css("display", "flex");
        $("#market-container .manage.container .recent-sales .no-access").html(_L("no_permission_view"))
        return;
    }
    let recentSalesHtml = `
        <tr class="table-header">
            <th>${_L("table_customername")}</th>
            <th>${_L("table_timestamp")}</th>
            <th>${_L("table_items")}</th>
            <th>${_L("market_price")}</th>
            <th></th>
        </tr>
    `
    if (Market.data.recent_sales.length == 0) {
        recentSalesHtml += `
            <tr>
                <td colspan="5">${_L("no_recent_sales")}</td>
            </tr>
        `;
    }
    else {
        for (let i=0; i<Market.data.recent_sales.length; i++) {
            let price = 0;
            let sale = Market.data.recent_sales[i];
            for (let j=0; j<sale.items.length; j++) {
                price += sale.items[j].price * sale.items[j].quantity;
            }
            recentSalesHtml += `
                <tr>
                    <td>${sale.name}</td>
                    <td>${sale.timestamp}</td>
                    <td>${_L((sale.items.length != 1 ? "market_recent_items" : "market_recent_item"), sale.items.length)}</td>
                    <td>${numberWithCommas(price)}</td>
                    <td class="view-sale">View</td>
                </tr>
            `
        }
    }
    elem.html(recentSalesHtml);
}

MarketManage.ViewRecentSale = function(index) {
    let sale = Market.data.recent_sales[index];
    let totalPrice = 0;
    let taxes = 10;
    let itemsHtml = "";
    for (let i=0; i<sale.items.length; i++) {
        let itemCost = sale.items[i].price * sale.items[i].quantity;
        totalPrice += itemCost;
        itemsHtml += `
            <div class="market-manage-item">
                <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + sale.items[i].name}.png);">
                    <div>${numberWithCommas(itemCost)}</div>
                    <div>x${sale.items[i].quantity}</div>
                    <div>${Market.GetItemLabel(sale.items[i].name)}</div>
                </div>
            </div>
        `;
        setTimeout(() => {
            tippy(`#market-container .manage.container .view-sale .inventory > div:nth-child(${i+1})`, {
                allowHTML: true,
                theme: "market-theme",
                content: `<b>${_L("market_sku", sale.items[i].sku.replace("sku_", ""))}</b><br>` + StringifyItemMetadata(sale.items[i]).string,
            });
        }, 100);
    }
    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt view-sale tall" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_view_sale")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div style=""><b>${_L("customer")}:</b> ${sale.name}</div>
                <div style="margin-top:0.5vw;"><b>${_L("date")}:</b> ${sale.timestamp}</div>
                <div style="margin-top:0.5vw;"><b>${_L("purchased_items")}:</b></div>
                <div class="inventory" style="margin-top:0.5vw; background-color: var(--color2); padding: 0.5vw;">
                    ${itemsHtml}
                </div>
                <div style="margin-top:0.5vw;"><b>${_L("subtotal")}:</b> ${numberWithCommas(totalPrice)}</div>
                <div style="margin-top:0.5vw;"><b>${_L("taxes")}:</b> -${numberWithCommas(taxes)}</div>
                <div style="margin-top:0.5vw;"><b>${_L("total")}:</b> ${numberWithCommas(totalPrice - taxes)}</div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })


}

MarketManage.GetTradeInventoryHtml = function() {
    let trade_inventory = Market.data.trade_inventory || [];
    let hasPermission = Market.DoesHavePermission("items");
    let contentHtml = ``;
    let manageItemHtml = `
        <div style="position: absolute; bottom: 1vw; display: flex; flex-direction: row; column-gap: 0.25vw; font-size: 0.5vw">
            <i class="edit fas fa-pen"></i>
            <i class="delete fas fa-trash"></i>
        </div>
    `;
    for (let i=0; i<trade_inventory.length; i++) {

        let insert = `
        <div class="market-manage-item">
            <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + trade_inventory[i].name}.png);">
                <div></div>
                <div>x${trade_inventory[i].quantity}</div>
                <div>${Market.GetItemLabel(trade_inventory[i].name)}</div>
                ${hasPermission ? manageItemHtml : ""}
            </div>
        </div>
        `
        contentHtml += insert;
    };
    if (hasPermission) {
        contentHtml =  `
            <div class="market-add-item">
                <i class="fas fa-plus"></i>
            </div>
        ` + contentHtml;
    }
    return contentHtml;
}

MarketManage.RefreshTradeInventory = function(data) {
    if (data != undefined && data != null) {
        Market.data.trade_inventory = data;
    }
    $("#market-container .manage.container .trade-inventory .inventory-container").css("display", (!Market.DoesHavePermission("items") ? "none" : "flex"));
    if (!Market.DoesHavePermission("items")) {
        $("#market-container .manage.container .trade-inventory .no-access").css("display", "flex");
        $("#market-container .manage.container .trade-inventory .no-access").html(_L("no_permission_view"));
        return;
    }
    $("#market-container .manage.container .trade-inventory .inventory-container .inventory").html(MarketManage.GetTradeInventoryHtml());
    $("#market-container .manage.container .trade-inventory .market-manage-item").each(function(i) {
        tippy($("#market-container .manage.container .trade-inventory .market-manage-item").get(i), {
            allowHTML: true,
            theme: "market-theme",
            content: `<b>${_L("market_sku", Market.data.trade_inventory[i].sku.replace("sku_", ""))}</b><br>` + StringifyItemMetadata(Market.data.trade_inventory[i]).string,
        });
        $("#market-container .manage.container .trade-inventory .market-manage-item .edit").eq(i).on("click", function() {
            MarketManage.EditItemPrompt(i);
        });
        $("#market-container .manage.container .trade-inventory .market-manage-item .delete").eq(i).on("click", function() {
            MarketManage.EditItemPrompt_Submit(i, true);
        });
    });
}

MarketManage.CurrencyPrompt = function(currency, transactionType) {
    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt currency medium" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_manage_"+transactionType)}</div>
                <i class="fas fa-times"></i>    
            </div>
            <div class="content">
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="currency-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("balance_" + currency)}:</div>
                    <div class="currency-balance" style="margin-left: auto; font-size:0.75vw;">${numberWithCommas(Market.data[currency])}</div>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="currency-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_"+transactionType+"_amount")}:</div>
                    <input class="currency-input" type="number" min="0" value="0" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="cursor: pointer; margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                    <div class="submit-currency" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_manage_"+transactionType+"_submit")}</div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt .submit-currency").on("click", function() {
        let amount = $("#market-container .manage.container > .prompt .currency-input").val();
        MarketManage.CurrencyPrompt_Submit(currency, transactionType, amount);
    });
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })
}

MarketManage.CurrencyPrompt_Submit = function(currency, transactionType, amount) {
    if (amount < 0) {
        $.notify(_L("market_manage_"+transactionType+"_fail"), {color: "#fff", background: "#D44950"});
        return;
    }
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({currency: currency, amount: Number(amount), action: transactionType}));
    $("#market-container .manage.container > .prompt").css("display", "flex").fadeOut(250);
}


MarketManage.AddItemPrompt_SelectItem = function(itemId) {
    let item = Market.data.player_inventory[itemId];
    let stackedItems = Market.GetStackableItems(itemId);
    MarketManage.additemprompt_selected_item = itemId;
    $(".prompt.add-item .selected-item").css("display", "flex");
    $(".prompt.add-item .selected-item-container .market-buy-item").remove();
    $(".prompt.add-item .selected-item-container").append(`
        <div class="market-buy-item">
            <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + item.name}.png);">
                <div></div>
                <div>x${item.count}</div>
                <div>${item.label}</div>
            </div>
        </div>
    `);
    $("#market-container .manage.container > .prompt.add-item .quantity-input").attr("max", stackedItems.count).val(stackedItems.count);
    $("#market-container .manage.container > .prompt .quantity-text").html(_L("market_quantity_max", stackedItems.count) + ":");
    tippy('.prompt.add-item .selected-item .market-buy-item', {
        allowHTML: true,
        theme: "market-theme",
        content: StringifyItemMetadata(item).string,
    });
}

MarketManage.AddItemPrompt_PopulateInventory = function() {
    let serverItemsHtml = ``;
    for (let i=0; i<Market.data.player_inventory.length; i++) {
        serverItemsHtml += `
        <div class="market-buy-item">
            <div style="background-image: url(${ Market.data.config.img_folder + "/" + Market.data.player_inventory[i].name}.png);">
                <div></div>
                <div>x${Market.data.player_inventory[i].count}</div>
                <div>${Market.data.player_inventory[i].label}</div>
            </div>
        </div>
        `
        setTimeout(() => {
            tippy('.prompt.add-item .inventory .market-buy-item:nth-child('+(i+1)+')', {
                allowHTML: true,
                theme: "market-theme",
                content: StringifyItemMetadata(Market.data.player_inventory[i]).string,
            });
            $('.prompt.add-item .inventory .market-buy-item:nth-child('+(i+1)+')').on("click", function() {
                MarketManage.AddItemPrompt_SelectItem(i)
            })
        }, 250);
    }
    $("#market-container .manage.container > .prompt .inventory").html(serverItemsHtml);
}

MarketManage.AddItemPrompt_Submit = function() {
    let itemId = MarketManage.additemprompt_selected_item;
    if (itemId == null) {
        $.notify(_L("market_manage_newitem_addfail"), {color: "#fff", background: "#D44950"});
        return;
    }
    let item = Market.data.player_inventory[itemId];
    let stackedItems = Market.GetStackableItems(itemId);
    let quantity = $("#market-container .manage.container > .prompt .quantity-input").val();
    if (quantity < 1) {
        $.notify(_L("market_buy_listing_addfail"), {color: "#fff", background: "#D44950"});
        return;
    }
    if (quantity > stackedItems.count) {
        $.notify(_L("market_buy_listing_addfail"), {color: "#fff", background: "#D44950"});
        return;
    }
    let data = {
        item: item,
        quantity: quantity,
    }
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({item: item, quantity: Number(quantity), action: "add_item"}));
    $("#market-container .manage.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketManage.AddItemPrompt = function() {
    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt add-item tall" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_manage_newitem")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div>${_L("market_manage_newitem_choose")}:</div>
                <div class="inventory">
                </div>
                <div class="selected-item">
                    <div style="display:flex;">
                        <div class="selected-item-container">
                        </div>
                        <div class="selected-item-options">
                            <div style="display: flex; align-items: center; margin-top: 0.5vw">
                                <div class="quantity-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_quantity")}:</div>
                                <input class="quantity-input" type="number" min="1" value="1" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                            </div>
                            <div class="italic" style="margin-top: 0.5vw;">${_L("market_buy_newlisting_note1")}</div>
                            <div class="italic">${_L("market_buy_newlisting_note2")}</div>
                        </div>
                    </div>            
                    <div style="margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                        <div class="submit-add-item" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_manage_newitem_submit")}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt .submit-add-item").on("click", function() {
        MarketManage.AddItemPrompt_Submit()
    });
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })
      
    MarketManage.AddItemPrompt_PopulateInventory()
}

MarketManage.EditItemPrompt = function(listingId) {
    let tradeItem = Market.data.trade_inventory[listingId];
    if (tradeItem == undefined || tradeItem == null) return;
    let maxQuantity = tradeItem.quantity; // TODO: Add amount in player inventory to maximum.
    let addableCount = Market.GetListingItemInfo(tradeItem);
    maxQuantity += addableCount;

    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt edit-item medium" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_buy_modifylisting")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div class="selected-item">
                    <div style="display:flex;">
                        <div class="selected-item-container">
                            <div class="market-buy-item">
                                <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + tradeItem.name}.png);">
                                    <div></div>
                                    <div>x${tradeItem.quantity}</div>
                                    <div>${Market.GetItemLabel(tradeItem.name)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="selected-item-options">
                            <div style="display: flex; align-items: center; margin-top: 0.5vw">
                                <div class="quantity-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_quantity")}:</div>
                                <input class="quantity-input" type="number" min="0" max="${maxQuantity}" value="${tradeItem.quantity}" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                            </div>
                            <div class="italic" style="margin-top: 0.5vw;">Note: You cannot stack items that have been damaged.</div>
                            <div class="italic">If selling unique and/or damaged items, the quantity must be set to 1 to preserve the data.</div>
                        </div>
                    </div>            
                    <div style="margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                        <div class="submit-add-item" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_buy_modifylisting_submit")}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt .submit-add-item").on("click", function() {
        MarketManage.EditItemPrompt_Submit(listingId);
    });
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })
}

MarketManage.EditItemPrompt_Submit = function(listingId, deleteItem) {
    let tradeItem = Market.data.trade_inventory[listingId];
    if (!tradeItem) return;
    if (deleteItem) {
        $.post("https://pickle_businesses/marketManageAction", JSON.stringify({sku: tradeItem.sku, quantity: Number(0), action: "edit_item"}));
        return;
    }
    let quantity = $("#market-container .manage.container > .prompt .quantity-input").val();
    if (quantity < 0) {
        $.notify(_L("market_buy_listing_editfail"), {color: "#fff", background: "#D44950"});
        return;
    }
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({sku: tradeItem.sku, quantity: Number(quantity), action: "edit_item"}));
    $("#market-container .manage.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketManage.RefreshSettings = function(data) {
    if (data != undefined && data != null && Market.data.game_info != undefined) {
        Market.data.label = data.label;
        Market.data.game_info = data.game_info;
    }
    if (!Market.DoesHavePermission("owner")) {
        $("#market-container .manage.container .business-settings .no-access").css("display", "flex");
        $("#market-container .manage.container .business-settings .no-access").html(_L("no_permission_view"))
        return;
    }
    let webhooks = {
        business: "",
        purchase: "",
        trade: "",
    }
    if (Market.data.game_info != undefined && Market.data.game_info.webhooks != undefined) {
        webhooks = Market.data.game_info.webhooks;
    }
    let settingsHtml = `
        <div class="options">
            <div>
                <div>
                    <div>Business Name:</div>
                    <div>This name will appear on all generated bills.</div>
                </div>
                <input type="text" value="${Market.data.label}">
            </div>
            <div>
                <div>
                    <div>Business Webhook URL:</div>
                    <div>Sends messages when business updates occur.</div>
                </div>
                <input type="text" value="${webhooks.business}">
            </div>
            <div>
                <div>
                    <div>Purchase Webhook URL:</div>
                    <div>Sends a message after a business product has been purchased.</div>
                </div>
                <input type="text" value="${webhooks.purchase}">
            </div>
            <div>
                <div>
                    <div>Trade Webhook URL:</div>
                    <div>Sends a message after a business trade has been finalized.</div>
                </div>
                <input type="text" value="${webhooks.trade}">
            </div>
        </div>
        <div class="actions">
            <div>Save Settings</div>
        </div>
    `;
    $("#market-container .manage.container .business-settings .settings-content").html(settingsHtml);
    $("#market-container .manage.container .business-settings .settings-content .actions > div").on("click", function() {
        let businessName = $("#market-container .manage.container .business-settings .settings-content .options > div:nth-child(1) > input").val();
        let businessWebhook = $("#market-container .manage.container .business-settings .settings-content .options > div:nth-child(2) > input").val();
        let purchaseWebhook = $("#market-container .manage.container .business-settings .settings-content .options > div:nth-child(3) > input").val();
        let tradeWebhook = $("#market-container .manage.container .business-settings .settings-content .options > div:nth-child(4) > input").val();
        $.post("https://pickle_businesses/marketManageAction", JSON.stringify({label: businessName, business: businessWebhook, purchase: purchaseWebhook, trade: tradeWebhook, action: "save_settings"}));
    });
}

MarketManage.PromoteRole = function(roleIndex) {
    let role = Market.data.roles[roleIndex];
    if (role == undefined || role == null) return;
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({roleId: role.id, action: "promote_role"}));
}

MarketManage.DemoteRole = function(roleIndex) {
    let role = Market.data.roles[roleIndex];
    if (role == undefined || role == null) return;
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({roleId: role.id, action: "demote_role"}));
}

MarketManage.AddRolePrompt = function() {
    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt add-role medium" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_manage_addrole")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="label-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_label")}:</div>
                    <input class="label-input" type="text" maxlength="50" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="salary-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_salary")}:</div>                 
                    <input class="salary-input" type="number" min="0" value="0" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="commission-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_commission")}:</div>
                    <input class="commission-input" type="number" min="0" max="100" value="0" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="permission-funds-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_permission_funds")}:</div>
                    <input class="permission-funds-input" type="checkbox" style="margin-left: auto; width: 1vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="permission-items-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_permission_items")}:</div>
                    <input class="permission-items-input" type="checkbox" style="margin-left: auto; width: 1vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="permission-roles-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_permission_employee")}:</div>
                    <input class="permission-roles-input" type="checkbox" style="margin-left: auto; width: 1vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="permission-logs-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_permission_logs")}:</div>
                    <input class="permission-logs-input" type="checkbox" style="margin-left: auto; width: 1vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="cursor: pointer; margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                    <div class="submit-add-role" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_manage_addrole_submit")}</div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt .submit-add-role").on("click", function() {
        let roleData = {
            label: $("#market-container .manage.container > .prompt .label-input").val(),
            salary: Number($("#market-container .manage.container > .prompt .salary-input").val()),
            commission: Number($("#market-container .manage.container > .prompt .commission-input").val()),
            permissions: {
                funds: $("#market-container .manage.container > .prompt .permission-funds-input").is(":checked"),
                roles: $("#market-container .manage.container > .prompt .permission-roles-input").is(":checked"),
                items: $("#market-container .manage.container > .prompt .permission-items-input").is(":checked"),
                logs: $("#market-container .manage.container > .prompt .permission-logs-input").is(":checked"),
            }
        }
        MarketManage.AddRolePrompt_Submit(roleData);
    });
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })
}

MarketManage.AddRolePrompt_Submit = function(roleData) {
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({roleData: roleData, action: "add_role"}));
    $("#market-container .manage.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketManage.EditRolePrompt = function(roleIndex) {
    let role = Market.data.roles[roleIndex];
    let roleId = role.id;
    let permissionsHtml = `
        <div style="display: flex; align-items: center; margin-top: 0.5vw">
            <div class="permission-funds-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_permission_funds")}:</div>
            <input class="permission-funds-input" ${role.permissions.funds ? "checked" : ""} type="checkbox" style="margin-left: auto; width: 1vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
        </div>
        <div style="display: flex; align-items: center; margin-top: 0.5vw">
            <div class="permission-items-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_permission_items")}:</div>
            <input class="permission-items-input" ${role.permissions.items ? "checked" : ""} type="checkbox" style="margin-left: auto; width: 1vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
        </div>
        <div style="display: flex; align-items: center; margin-top: 0.5vw">
            <div class="permission-roles-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_permission_employee")}:</div>
            <input class="permission-roles-input" ${role.permissions.roles ? "checked" : ""} type="checkbox" style="margin-left: auto; width: 1vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
        </div>
        <div style="display: flex; align-items: center; margin-top: 0.5vw">
            <div class="permission-logs-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_permission_logs")}:</div>
            <input class="permission-logs-input" ${role.permissions.logs ? "checked" : ""} type="checkbox" style="margin-left: auto; width: 1vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
        </div>
    `;
    let permissionsEditable = true;
    if (role.owner) {
        permissionsHtml = ``;
        permissionsEditable = false;
    }
    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt edit-role medium" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_manage_editrole")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="label-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_label")}:</div>
                    <input class="label-input" value="${role.label}" type="text" maxlength="50" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="salary-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_salary")}:</div>                 
                    <input class="salary-input" value="${role.salary}" type="number" min="0" value="0" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="commission-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addrole_commission")}:</div>
                    <input class="commission-input" value="${Math.ceil(role.commission)}" type="number" min="0" max="100" value="0" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                </div>
                ${permissionsHtml}
                <div style="cursor: pointer; margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                    <div class="submit-edit-role" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_manage_editrole_submit")}</div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt .submit-edit-role").on("click", function() {
        let roleData = {
            label: $("#market-container .manage.container > .prompt .label-input").val(),
            salary: Number($("#market-container .manage.container > .prompt .salary-input").val()),
            commission: Number($("#market-container .manage.container > .prompt .commission-input").val()),
            permissions: permissionsEditable ? {
                funds: $("#market-container .manage.container > .prompt .permission-funds-input").is(":checked"),
                roles: $("#market-container .manage.container > .prompt .permission-roles-input").is(":checked"),
                items: $("#market-container .manage.container > .prompt .permission-items-input").is(":checked"),
                logs: $("#market-container .manage.container > .prompt .permission-logs-input").is(":checked"),
            } : role.permissions
        }
        MarketManage.EditRolePrompt_Submit(roleId, roleData);
    });
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })
}

MarketManage.EditRolePrompt_Submit = function(roleId, roleData) {
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({roleId: roleId, roleData: roleData, action: "edit_role"}));
    $("#market-container .manage.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketManage.DeleteRolePrompt = function(roleIndex) {
    let role = Market.data.roles[roleIndex];
    let roleId = role.id;
    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt delete-role medium" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_manage_deleterole")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div style="display: flex; align-items: center; justify-content: center; margin-top: 0.5vw">
                    <div class="label-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_deleterole_desc", role.label)}</div>
                </div>
                <div style="cursor: pointer; margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                    <div class="submit-delete-role" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_manage_deleterole_submit")}</div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt .submit-delete-role").on("click", function() {
        MarketManage.DeleteRolePrompt_Submit(roleId);
    });
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })
}

MarketManage.DeleteRolePrompt_Submit = function(roleId) {
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({roleId: roleId, action: "delete_role"}));
    $("#market-container .manage.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketManage.GetSortedEmployees = function() {
    let employees = Market.data.employees;
    let arr = [];
    let online = [];
    let offline = [];

    // Sort by online status
    for (let i=0; i<employees.length; i++) {
        if (employees[i].source) {
            online.push(employees[i]);
        }
    }
    for (let i=0; i<employees.length; i++) {
        if (!employees[i].source) {
            offline.push(employees[i]);
        }
    }
    // Sort by role
    online.sort((a, b) => {
        let roleA = Market.GetRoleById(a.roleId);
        let roleB = Market.GetRoleById(b.roleId);
        if (roleA.index > roleB.index) {
            return 1;
        }
        if (roleA.index < roleB.index) {
            return -1;
        }
        return 0;
    });
    offline.sort((a, b) => {
        let roleA = Market.GetRoleById(a.roleId);
        let roleB = Market.GetRoleById(b.roleId);
        if (roleA.index > roleB.index) {
            return 1;
        }
        if (roleA.index < roleB.index) {
            return -1;
        }
        return 0;
    });
    arr = online.concat(offline);
    return arr;
}

MarketManage.RefreshRoles = function() {
    $("#market-container .manage.container .roles-list .add-role").css("display", Market.DoesHavePermission("roles") ? "flex" : "none");
    if (!Market.DoesHavePermission("roles")) {
        $("#market-container .manage.container .roles-list .no-access").css("display", "flex");
        $("#market-container .manage.container .roles-list .no-access").html(_L("no_permission_view"))
        return;
    }
    let roles = Market.data.roles;
    let rolesHtml = `
        <tr class="table-header">
            ${Market.DoesHavePermission("roles") ? "<th></th>" : ""}
            <th>Position</th>
            <th>Salary</th>
            <th>Commission</th>
            <th></th>
            <th></th>
        </tr>
    `;
    for (let i=0; i<roles.length; i++) {
        let moveRoleHtml = Market.DoesHavePermission("roles") ? `
            <td style="font-size: 0.5vw; display: flex; flex-direction: column; row-gap: 0.25vw">
            </td>
        ` : "";
        if (Market.DoesHavePermission("roles")) {
            if (!roles[i].owner) {
                moveRoleHtml = `
                    <td style="font-size: 0.5vw; display: flex; flex-direction: column; row-gap: 0.25vw">
                `;
                if (i - 1 >= 0 && !roles[i-1].owner) {
                    moveRoleHtml += `<i class="promote-role fas fa-arrow-up"></i>`;
                }
                else {
                    moveRoleHtml += `<i class="promote-role fas fa-arrow-up" style="color: var(--color7);"></i>`;
                }
                if (i + 1 < roles.length) {
                    moveRoleHtml += `<i class="demote-role fas fa-arrow-down"></i>`;
                }
                else {
                    moveRoleHtml += `<i class="demote-role fas fa-arrow-down" style="color: var(--color7);"></i>`;
                }
                moveRoleHtml += `</td>`;
            }
        }
        rolesHtml += `
            <tr>
                ${moveRoleHtml}
                <td>${roles[i].label}</td>
                <td>${numberWithCommas(roles[i].salary)}</td>
                <td>${Math.ceil(roles[i].commission)}%</td>
                <td class="link">View</td>
                <td>${(!Market.DoesHavePermission("roles") || roles[i].owner || roles.length <= 2) ? "" : "<i class='delete-role fas fa-trash'></i>"}</td>
            </tr>
        `;
    }
    $("#market-container .manage.container .roles-list .table-container table").html(rolesHtml);
}

MarketManage.AddEmployeePrompt = function(nearbyPlayers) {
    let playersHtml = `<select class="label-input target" value="${nearbyPlayers[0].id}" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;">`;
    for (let i=0; i<nearbyPlayers.length; i++) {
        playersHtml += `<option value="${nearbyPlayers[i].id}">${nearbyPlayers[i].name}</option>`;
    }
    playersHtml += `</select>`;
    let employee = Market.GetEmployee();
    if (employee == undefined || employee == null) return;
    let assignableRoles = MarketManage.GetAssignableRoles(employee.roleId);
    let rolesHtml = `<select class="label-input role" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;">`;
    for (let i=0; i<assignableRoles.length; i++) {
        rolesHtml += `<option ${i == assignableRoles.length - 1 ? `selected="selected"` : ""} value="${assignableRoles[i].id}">${assignableRoles[i].label}</option>`;
    }
    rolesHtml += `</select>`;
    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt delete-role medium" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_manage_addemployee")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="label-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addemployee_target")}:</div>
                    ${playersHtml}
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="label-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addemployee_role")}:</div>
                    ${rolesHtml}
                </div>
                <div style="cursor: pointer; margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                    <div class="submit-add-employee" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_manage_addemployee_submit")}</div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt .submit-add-employee").on("click", function() {
        let source = $("#market-container .manage.container > .prompt .label-input.target").val();
        let roleId = $("#market-container .manage.container > .prompt .label-input.role").val();
        MarketManage.AddEmployeePrompt_Submit(source, roleId);
    });
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })
}

MarketManage.AddEmployeePrompt_Submit = function(source, roleId) {
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({source: source, roleId: roleId, action: "add_employee"}));
    $("#market-container .manage.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketManage.EditEmployeePrompt = function(index) {
    let employees = MarketManage.GetSortedEmployees();
    let employee = Market.GetEmployee();
    let targetEmployee = Market.GetEmployee(employees[index].identifier);
    if (targetEmployee == undefined || targetEmployee == null) return;
    let assignableRoles = MarketManage.GetAssignableRoles(employee.roleId, targetEmployee.roleId);
    let rolesHtml = `<select class="label-input role" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;">`;
    for (let i=0; i<assignableRoles.length; i++) {
        rolesHtml += `<option ${assignableRoles[i].id == targetEmployee.roleId ? `selected="selected"` : ""} value="${assignableRoles[i].id}">${assignableRoles[i].label}</option>`;
    }
    rolesHtml += `</select>`;
    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt delete-role medium" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_manage_editemployee")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="label-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addemployee_target")}:</div>
                    <div style="margin-left: auto; color: white; font-size:0.75vw;">
                        ${targetEmployee.name}
                    </div>
                </div>
                <div style="display: flex; align-items: center; margin-top: 0.5vw">
                    <div class="label-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_addemployee_role")}:</div>
                    ${rolesHtml}
                </div>
                <div style="cursor: pointer; margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                    <div class="submit-edit-employee" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_manage_editemployee_submit")}</div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt .submit-edit-employee").on("click", function() {
        let roleId = $("#market-container .manage.container > .prompt .label-input.role").val();
        MarketManage.EditEmployeePrompt_Submit(employees[index].identifier, roleId);
    });
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })
}

MarketManage.EditEmployeePrompt_Submit = function(identifier, roleId) {
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({identifier: identifier, roleId: roleId, action: "edit_employee"}));
    $("#market-container .manage.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketManage.DeleteEmployeePrompt = function(index) {
    let employees = MarketManage.GetSortedEmployees();
    let employee = Market.GetEmployee();
    let targetEmployee = Market.GetEmployee(employees[index].identifier);
    if (targetEmployee == undefined || targetEmployee == null) return;
    $("#market-container .manage.container > .prompt").remove()
    $("#market-container .manage.container").prepend(`
    <div class="prompt delete-role medium" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_manage_deleteemployee")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div style="display: flex; align-items: center; justify-content: center; margin-top: 0.5vw">
                    <div class="label-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_manage_deleteemployee_desc", targetEmployee.name)}</div>
                </div>
                <div style="cursor: pointer; margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                    <div class="submit-delete-employee" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_manage_deleteemployee_submit")}</div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .manage.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .manage.container > .prompt .submit-delete-employee").on("click", function() {
        MarketManage.DeleteEmployeePrompt_Submit(employees[index].identifier);
    });
    $("#market-container .manage.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .manage.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .manage.container > .prompt").remove()
        }, 255);
    })
}

MarketManage.DeleteEmployeePrompt_Submit = function(identifier) {
    $.post("https://pickle_businesses/marketManageAction", JSON.stringify({identifier: identifier, action: "delete_employee"}));
    $("#market-container .manage.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketManage.RefreshEmployees = function() {
    $("#market-container .manage.container .employee-list .add-employee").css("display", Market.DoesHavePermission("roles") ? "flex" : "none");
    if (!Market.DoesHavePermission("roles")) {
        $("#market-container .manage.container .employee-list .no-access").css("display", "flex");
        $("#market-container .manage.container .employee-list .no-access").html(_L("no_permission_view"))
        return;
    }
    let employees = MarketManage.GetSortedEmployees();
    let employeesHtml = `
        <tr class="table-header">
            <th>Name</th>
            <th>Position</th>
            <th></th>
            <th></th>
        </tr>
    `;
    for (let i=0; i<employees.length; i++) {
        let role = Market.GetRoleById(employees[i].roleId);
        employeesHtml += `
            <tr>
                <td><i class="fas fa-circle ${employees[i].source ? "green" : "red"}"></i>${employees[i].name}</td>
                <td>${role.label}</td>
                <td class="link">View</td>
                <td><i class='delete-employee fas fa-trash'></i></td>
            </tr>
        `;
    }
    $("#market-container .manage.container .employee-list .table-container table").html(employeesHtml);
}

MarketManage.RefreshBalance = function(currency, value) {
    if (currency == "card") {
        currency = "money";  
    }
    let balance = Market.data[currency];
    $("#market-container .manage.container .content > ." + currency).html(`
        <div>
            <div class="section-title">${_L("balance_"+currency)}</div>
            <div>${numberWithCommas(balance)}</div>
        </div>
        <div>
            <div class="deposit">${_L("balance_deposit")}</div>
            <div class="withdraw">${_L("balance_withdraw")}</div>
        </div>
    `)
}

MarketManage.DisplayMenu = function() {
    let elem = $("#market-container .container");
    elem.removeClass();
    elem.addClass("container");
    elem.addClass("manage");
    elem.html(`
        <div class="content">
            <div class="card balance money contain-short-1">
            </div>
            <div class="card balance dirty_money contain-short-1">\
            </div>
            <div class="card weekly-sales contain-2">
                <div class="section-title">${_L("daily_sales")}</div>
                <div class="no-access" style="display:none; margin-top: 0.8vw; font-size: 0.8vw;">
                </div>
                <div class="chart-container" style="position: relative;">
                    <canvas id="manage-sales-chart"></canvas>
                </div>
            </div>
            <div class="card recent-sales contain-2">
                <div class="section-title">Recent Sales</div>
                <div class="no-access" style="display:none; margin-top: 0.8vw; font-size: 0.8vw;">
                </div>
                <div class="table-container">
                    <table>
                    </table>
                </div>
            </div>
            <div class="card trade-inventory contain-2">
                <div class="section-title">${_L("trade_inventory")}</div>
                <div class="no-access" style="display:none; margin-top: 0.8vw; font-size: 0.8vw;">
                </div>
                <div class="inventory-container">
                    <div class="inventory">
                    </div>
                </div>
            </div>
            <div class="card business-settings contain-2">
                <div class="section-title">Business Settings</div>
                <div class="no-access" style="display:none; margin-top: 0.8vw; font-size: 0.8vw;">
                </div>
                <div class="settings-content">
                    
                </div>
            </div>
            <div class="card employee-list contain-2">
                <div class="section-title">Employees</div>
                <div class="no-access" style="display:none; margin-top: 0.8vw; font-size: 0.8vw;">
                </div>
                <div class="add-employee">
                    + Hire Employee
                </div>
                <div class="table-container">
                    <table>
                    </table>
                </div>
            </div>
            <div class="card roles-list contain-2">
                <div class="section-title">Roles & Permissions</div>
                <div class="no-access" style="display:none; margin-top: 0.8vw; font-size: 0.8vw;">
                </div>
                <div class="add-role">
                    + Add Role
                </div>
                <div class="table-container">
                    <table>
                    </table>
                </div>
            </div>
        </div>
    `)
    elem.css("display", "flex").hide().fadeIn(250);
    MarketManage.RefreshBalance("money", Market.data.money);
    MarketManage.RefreshBalance("dirty_money", Market.data.dirty_money);
    MarketManage.UpdateDailySales()
    MarketManage.UpdateRecentSales()
    MarketManage.RefreshTradeInventory()
    MarketManage.RefreshSettings()
    MarketManage.RefreshRoles()
    MarketManage.RefreshEmployees()
}

$(document).ready(function() {
    /* Buy Sub-menu */

    $('#market-container').on('click', '.manage.container .recent-sales .view-sale', function(event) {
        MarketManage.ViewRecentSale($(this).parent().index() - 1)
    });

    $('#market-container').on('click', '.manage.container .trade-inventory .market-add-item', function(event) {
        MarketManage.AddItemPrompt()
    });

    $('#market-container').on('click', '.manage.container .roles-list .promote-role', function(event) {
        MarketManage.PromoteRole($(this).parent().parent().index() - 1)
    });
    
    $('#market-container').on('click', '.manage.container .roles-list .demote-role', function(event) {
        MarketManage.DemoteRole($(this).parent().parent().index() - 1)
    });

    $('#market-container').on('click', '.manage.container .roles-list .add-role', function(event) {
        MarketManage.AddRolePrompt()
    });
    
    $('#market-container').on('click', '.manage.container .roles-list .link', function(event) {
        MarketManage.EditRolePrompt($(this).parent().index() - 1)
    });
        
    $('#market-container').on('click', '.manage.container .roles-list .delete-role', function(event) {
        MarketManage.DeleteRolePrompt($(this).parent().parent().index() - 1)
    });

    $('#market-container').on('click', '.manage.container .employee-list .add-employee', function(event) {
        $.post("https://pickle_businesses/marketManageAction", JSON.stringify({action: "getNearbyPlayers"}), function(data) {
            MarketManage.AddEmployeePrompt(data)
        });
        // let nearbyPlayers = [ // TODO: Get nearby players
        //     {
        //         name: "John Doe",
        //         source: 1
        //     },
        // ];
    });

    $('#market-container').on('click', '.manage.container .employee-list .link', function(event) {
        MarketManage.EditEmployeePrompt($(this).parent().index() - 1)
    });
    
    $('#market-container').on('click', '.manage.container .employee-list .delete-employee', function(event) {
        MarketManage.DeleteEmployeePrompt($(this).parent().parent().index() - 1)
    });

    $('#market-container').on('click', '.manage.container .balance.money .deposit', function(event) {
        MarketManage.CurrencyPrompt("money", "deposit")
    });

    $('#market-container').on('click', '.manage.container .balance.money .withdraw', function(event) {
        MarketManage.CurrencyPrompt("money", "withdraw")
    });

    $('#market-container').on('click', '.manage.container .balance.dirty_money .deposit', function(event) {
        MarketManage.CurrencyPrompt("dirty_money", "deposit")
    });

    $('#market-container').on('click', '.manage.container .balance.dirty_money .withdraw', function(event) {
        MarketManage.CurrencyPrompt("dirty_money", "withdraw")
    });

});

window.addEventListener('message', function(ev) {
    if (ev.data.type == "updateRecentSales") {
        if (Market.businessId == ev.data.index) {
            MarketManage.UpdateRecentSales(ev.data.data.recent_sales)
        }
    }
    else if (ev.data.type == "updateDailySales") {
        if (Market.businessId == ev.data.index) {
            MarketManage.UpdateDailySales(ev.data.data.daily_sales)
        }
    }
    else if (ev.data.type == "updateTradeInventory") {
        MarketManage.RefreshTradeInventory(ev.data.data.trade_inventory)
    }
    else if (ev.data.type == "updateRoles") {
        Market.data.roles = ev.data.data.roles;
        MarketManage.RefreshRoles()
    }
    else if (ev.data.type == "updateEmployees") {
        if (Market.data == null || Market.data == undefined) return;
        Market.data.employees = ev.data.data.employees;
        MarketManage.RefreshEmployees()
    }
    else if (ev.data.type == "updateBusinessBalance") {
        Market.data[ev.data.data.currency] = ev.data.data.value;
        MarketManage.RefreshBalance(ev.data.data.currency, ev.data.data.value);
    }
    else if (ev.data.type == "updateBusinessSettings") {
        Market.data.label = ev.data.data.label;
        Market.data.game_info = ev.data.data.game_info;
        MarketManage.RefreshSettings()
    }
});