var MarketTrade = {}

MarketTrade.hovering_item = null;
MarketTrade.hovering_item_infothread = null;
MarketTrade.displaying_item = null;

MarketTrade.AddListingSubpromptSelectOffer = function(tradeData, offerType, index, isCurrency, sku) {
    let selectedIndex = null;
    let currencyHtml = ``;
    let updateItem = null;
    if (index != undefined) {
        if (isCurrency) {
            updateItem = tradeData[offerType].currencies[index];
        }
        else {
            updateItem = tradeData[offerType].items[index];
        }
    }
    for (let i=0; i<CONFIG_CURRENCY_ITEMS.length; i++) {
        currencyHtml += `
            <div class="market-manage-item">
                <div style="background-image: url(${CONFIG_CURRENCY_ITEMS[i].image});">
                    <div></div>
                    <div></div>
                    <div>${_L(CONFIG_CURRENCY_ITEMS[i].label_locale)}</div>
                </div>
            </div>
        `
    }
    let itemsHtml = ``;
    for (let i=0; i<Market.data.items.length; i++) {
        itemsHtml += `
            <div class="market-manage-item">
                <div style="background-image: url(${ Market.data.config.img_folder + "/" + Market.data.items[i].name}.png);">
                    <div></div>
                    <div></div>
                    <div>${Market.data.items[i].label}</div>
                </div>
            </div>
        `
    }
    $("#market-container .trade.container > .prompt").remove()
    $("#market-container .trade.container").prepend(`
    <div class="prompt add-listing-${offerType} tall" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_trade_addlisting_" + offerType)}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div>${_L("market_trade_addlisting_"+offerType+"_choose")}:</div>
                <div class="select-inventory-tall-container server-currency">
                    <div class="select-inventory">
                        ${currencyHtml}
                    </div>
                </div>
                <div class="select-inventory-tall-container server-inventory">
                    <div class="select-inventory-tall">
                        ${itemsHtml}
                    </div>
                </div>
                <div class="selected-item">
                    <div style="display:flex;">
                        <div class="selected-item-container">
                        </div>
                        <div class="selected-item-options">
                            <div style="display: flex; align-items: center; margin-top: 0.5vw">
                                <div class="quantity-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_quantity")}:</div>
                                <input class="quantity-input" type="number" min="1" value="${updateItem != undefined ? updateItem.quantity : 1}" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                            </div>
                            <div class="italic" style="margin-top: 0.5vw;">${_L("market_buy_newlisting_note1")}</div>
                            <div class="italic">${_L("market_buy_newlisting_note2")}</div>
                        </div>
                    </div>            
                    <div style="margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                        <div class="add-listing-${offerType}-item" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_trade_addlisting_"+offerType + (updateItem != null ? "_update" : "") +"_submit")}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `)
    let addCurrency = function(index, canRemove) {
        let item = CONFIG_CURRENCY_ITEMS[index];
        selectedIndex = index;
        selectedType = "currency";
        $(".prompt.add-listing-"+offerType+" .selected-item").css("display", "flex");
        $(".prompt.add-listing-"+offerType+" .selected-item-container .market-buy-item").remove();
        $(".prompt.add-listing-"+offerType+" .selected-item-container").append(`
            <div class="market-buy-item">
                <div style="background-image: url(${item.image});">
                    <div>${canRemove ? `<i class="delete fas fa-trash"></i>` : ""}</div>
                    <div></div>
                    <div>${_L(item.label_locale)}</div>
                </div>
            </div>
        `);
        if (canRemove) {
            $("#market-container .trade.container > .prompt.add-listing-"+offerType+" .selected-item-container .market-buy-item .delete").on("click", function() {
                let targetIndex = tradeData[offerType].currencies.findIndex(x => x.name == CONFIG_CURRENCY_ITEMS[index].name);
                tradeData[offerType].currencies.splice(targetIndex, 1);
                MarketTrade.AddListingPrompt(tradeData, sku)
            })
        }
    }
    let addItem = function(index, canRemove) {
        let item = Market.data.items[index];
        selectedIndex = index;
        selectedType = "item";
        $(".prompt.add-listing-"+offerType+" .selected-item").css("display", "flex");
        $(".prompt.add-listing-"+offerType+" .selected-item-container .market-buy-item").remove();
        $(".prompt.add-listing-"+offerType+" .selected-item-container").append(`
            <div class="market-buy-item">
                <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + item.name}.png);">
                    <div>${canRemove ? `<i class="delete fas fa-trash"></i>` : ""}</div>
                    <div></div>
                    <div>${item.label}</div>
                </div>
            </div>
        `);
        if (canRemove) {
            $("#market-container .trade.container > .prompt.add-listing-"+offerType+" .selected-item-container .market-buy-item .delete").on("click", function() {
                let targetIndex = tradeData[offerType].items.findIndex(x => x.name == Market.data.items[index].name);
                tradeData[offerType].items.splice(targetIndex, 1);
                MarketTrade.AddListingPrompt(tradeData, sku)
            })
        }
    }
    $("#market-container .trade.container > .prompt").css("display", "flex");
    $("#market-container .trade.container > .prompt .add-listing-"+offerType+"-item").on("click", function() {
        if (selectedIndex != null) {
            let count = Number($(".prompt.add-listing-"+offerType+" .selected-item-options .quantity-input").val());
            let itemExists = false;
            if (count < 1) {
                count = 1
            }
            if (selectedType == "currency") {
                for (let i=0; i < tradeData[offerType].currencies.length; i++) {
                    if (tradeData[offerType].currencies[i].name == CONFIG_CURRENCY_ITEMS[selectedIndex].name) {
                        if (updateItem == null) {
                            tradeData[offerType].currencies[i].quantity += count;
                        }
                        else {
                            tradeData[offerType].currencies[i].quantity = count;
                        }
                        itemExists = true;
                        break;
                    }
                }
                if (!itemExists) {
                    tradeData[offerType].currencies.push({
                        name: CONFIG_CURRENCY_ITEMS[selectedIndex].name,
                        quantity: Number($(".prompt.add-listing-"+offerType+" .selected-item-options .quantity-input").val())
                    });
                }
            }
            else if (selectedType == "item") {
                for (let i=0; i < tradeData[offerType].items.length; i++) {
                    if (tradeData[offerType].items[i].name == Market.data.items[selectedIndex].name) {
                        if (updateItem == null) {
                            tradeData[offerType].items[i].quantity += count;
                        }
                        else {
                            tradeData[offerType].items[i].quantity = count;
                        }
                        itemExists = true;
                        break;
                    }
                }
                if (!itemExists) {
                    tradeData[offerType].items.push({
                        name: Market.data.items[selectedIndex].name,
                        quantity: Number($(".prompt.add-listing-"+offerType+" .selected-item-options .quantity-input").val())
                    });
                }
            }
        }
        MarketTrade.AddListingPrompt(tradeData, sku)
    });
    $("#market-container .trade.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .trade.container > .prompt").remove()
        MarketTrade.AddListingPrompt(tradeData, sku)
    })

    $("#market-container .trade.container > .prompt.add-listing-"+offerType+" .server-currency .market-manage-item").on("click", function() {
        let index = $(this).index();
        addCurrency(index)
    })

    $("#market-container .trade.container > .prompt.add-listing-"+offerType+" .server-inventory .market-manage-item").on("click", function() {
        let index = $(this).index();
        addItem(index)
    })
    if (index != undefined) {
        if (isCurrency) {
            let data = tradeData[offerType].currencies[index];
            addCurrency(CONFIG_CURRENCY_ITEMS.findIndex(x => x.name == data.name), true)
        }
        else {
            let data = tradeData[offerType].items[index];
            addItem(Market.data.items.findIndex(x => x.name == data.name), true)
        }
    }
}

MarketTrade.AddListingPrompt = function(data, sku) {
    let tradeData = data;
    if (tradeData == undefined || tradeData == null) {
        tradeData = {
            give: {
                items: [],
                currencies: [],
            },
            receive: {
                items: [],
                currencies: [],
            }
        }
    }

    let giveCurrenciesHtml = ``;
    for (let i=0; i<tradeData.give.currencies.length; i++) {
        console.log(JSON.stringify(tradeData.give.currencies[i]))
        giveCurrenciesHtml += `
            <div class="market-buy-item give">
                <div style="background-image: url(${Market.GetCurrency(tradeData.give.currencies[i].name).image});">
                    <div>${numberWithCommas(tradeData.give.currencies[i].quantity)}</div>
                    <div></div>
                    <div>${_L(Market.GetCurrency(tradeData.give.currencies[i].name).label_locale)}</div>
                </div>
            </div>
        `;
    }
    let giveItemsHtml = ``;
    for (let i=0; i<tradeData.give.items.length; i++) {
        giveItemsHtml += `
            <div class="market-buy-item give">
                <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + tradeData.give.items[i].name}.png);">
                    <div>x${tradeData.give.items[i].quantity}</div>
                    <div></div>
                    <div>${Market.GetItemLabel(tradeData.give.items[i].name)}</div>
                </div>
            </div>  
        `;
    }
    let receiveCurrenciesHtml = ``;
    for (let i=0; i<tradeData.receive.currencies.length; i++) {
        receiveCurrenciesHtml += `
            <div class="market-buy-item receive">
                <div style="background-image: url(${Market.GetCurrency(tradeData.receive.currencies[i].name).image});">
                    <div>${numberWithCommas(tradeData.receive.currencies[i].quantity)}</div>
                    <div></div>
                    <div>${_L(Market.GetCurrency(tradeData.receive.currencies[i].name).label_locale)}</div>
                </div>
            </div>
        `;
    }
    let receiveItemsHtml = ``;
    for (let i=0; i<tradeData.receive.items.length; i++) {
        receiveItemsHtml += `
            <div class="market-buy-item receive">
                <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + tradeData.receive.items[i].name}.png);">
                    <div>x${tradeData.receive.items[i].quantity}</div>  
                    <div></div>
                    <div>${Market.GetItemLabel(tradeData.receive.items[i].name)}</div>
                </div>
            </div>
        `;
    }
    $("#market-container .trade.container > .prompt").remove()
    $("#market-container .trade.container").prepend(`
    <div class="prompt add-listing tall" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_trade_addlisting" + (sku ? "_update" : ""))}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div>${_L("market_trade_addlisting_give")}:</div>
                <div class="select-inventory-container">
                    <div class="select-inventory">
                        <div class="market-add-item give">
                            <i class="fas fa-plus"></i>
                        </div>
                        ${giveCurrenciesHtml}
                        ${giveItemsHtml}
                    </div>
                </div>
                <div>${_L("market_trade_addlisting_receive")}:</div>
                <div class="select-inventory-container">
                    <div class="select-inventory">
                        <div class="market-add-item receive">
                            <i class="fas fa-plus"></i>
                        </div>
                        ${receiveCurrenciesHtml}
                        ${receiveItemsHtml}
                    </div>
                </div>
                <div style="margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                    <div class="submit-add-listing" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_trade_addlisting_submit" + (sku ? "_update" : ""))}</div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .trade.container > .prompt").css("display", "flex").hide().fadeIn(250);
    if ((tradeData.give.items.length > 0 || tradeData.give.currencies.length > 0) && (tradeData.receive.items.length > 0 || tradeData.receive.currencies.length > 0)) {
        $("#market-container .trade.container > .prompt .submit-add-listing").css("display", "flex");
        $("#market-container .trade.container > .prompt .submit-add-listing").on("click", function() {
            MarketTrade.AddListingPrompt_Submit(tradeData, sku)
        });    
    }
    else {
        $("#market-container .trade.container > .prompt .submit-add-listing").css("display", "none");
    }
    $("#market-container .trade.container > .prompt > div > .header > i").on("click", function() {
        console.log("BWAHHHHHH")
        $("#market-container .trade.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .trade.container > .prompt").remove()
        }, 255);
    })

    $("#market-container .trade.container > .prompt.add-listing .market-add-item.give").on("click", function() {
        MarketTrade.AddListingSubpromptSelectOffer(tradeData, "give", undefined, undefined, sku)
    })
    
    $("#market-container .trade.container > .prompt.add-listing .market-add-item.receive").on("click", function() {
        MarketTrade.AddListingSubpromptSelectOffer(tradeData, "receive", undefined, undefined, sku)
    })

    $("#market-container .trade.container > .prompt.add-listing .market-buy-item.give").on("click", function() {
        let index = $(this).index();
        let isCurrency = true;
        if (index > tradeData.give.currencies.length) {
            isCurrency = false;
            index -= tradeData.give.currencies.length; 
        }
        MarketTrade.AddListingSubpromptSelectOffer(tradeData, "give", index - 1, isCurrency, sku)
    })

    $("#market-container .trade.container > .prompt.add-listing .market-buy-item.receive").on("click", function() {
        let index = $(this).index();
        let isCurrency = true;
        if (index > tradeData.receive.currencies.length) {
            isCurrency = false;
            index -= tradeData.receive.currencies.length; 
        }
        MarketTrade.AddListingSubpromptSelectOffer(tradeData, "receive", index - 1, isCurrency, sku)
    })
    
}

MarketTrade.AddListingPrompt_Submit = function(tradeData, sku) {
    if (sku != undefined) {
        $.post("https://pickle_businesses/marketTradeAction", JSON.stringify({tradeData: tradeData, sku: sku, action: "update_listing"}));
    }
    else {
        $.post("https://pickle_businesses/marketTradeAction", JSON.stringify({tradeData: tradeData, action: "add_listing"}));
    }
    $("#market-container .trade.container > .prompt").css("display", "flex").fadeOut(250);
}    

MarketTrade.DeleteListingPrompt = function(sku) {
    $("#market-container .trade.container > .prompt").remove()
    $("#market-container .trade.container").prepend(`
    <div class="prompt delete-trade medium" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_trade_deletetrade")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div style="display: flex; align-items: center; justify-content: center; margin-top: 0.5vw">
                    <div class="label-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_trade_deletetrade_desc")}</div>
                </div>
                <div style="cursor: pointer; margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                    <div class="submit-delete-trade" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_trade_deletetrade_submit")}</div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .trade.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .trade.container > .prompt .submit-delete-trade").on("click", function() {
        MarketTrade.DeleteListingPrompt_Submit(sku);
    });
    $("#market-container .trade.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .trade.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .trade.container > .prompt").remove()
        }, 255);
    })
}

MarketTrade.DeleteListingPrompt_Submit = function(sku) {
    $.post("https://pickle_businesses/marketTradeAction", JSON.stringify({sku: sku, action: "delete_listing"}));
    $("#market-container .trade.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketTrade.RefreshListings = function(data) {
    if (data != undefined) {
        Market.data.trade_listings = data;
    }
    if (Market.currentSubmenu != 1) return;
    let trade_listings = Market.data.trade_listings;
    let contentHtml = "";
    let manageListingHtml = ``;
    if (Market.DoesHavePermission("items")) {
        manageListingHtml = `
            <div style="position: absolute; top: 0.65vw; right: 0.5vw; display: flex; flex-direction: row; column-gap: 0.75vw; font-size: 0.75vw">
                <i class="edit fas fa-pen"></i>
                <i class="delete fas fa-trash"></i>
            </div>
        `;
    }
    for (let i=0; i<trade_listings.length; i++) {
        let giveSpaces = 4 - (trade_listings[i].give.currencies.length + trade_listings[i].give.items.length);
        let giveItemsHtml = ``;
        for (let j=0; j<trade_listings[i].give.currencies.length; j++) {
            giveItemsHtml += `
                <div class="market-manage-item">
                    <div style="background-image: url(${Market.GetCurrency(trade_listings[i].give.currencies[j].name).image});">
                        <div>${numberWithCommas(trade_listings[i].give.currencies[j].quantity)}</div>
                        <div></div>
                        <div>${_L(Market.GetCurrency(trade_listings[i].give.currencies[j].name).label_locale)}</div>
                    </div>
                </div>
            `;
        }
        for (let j=0; j<trade_listings[i].give.items.length; j++) {
            giveItemsHtml += `
                <div class="market-manage-item">
                    <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + trade_listings[i].give.items[j].name}.png);">
                        <div>x${trade_listings[i].give.items[j].quantity}</div>
                        <div></div>
                        <div>${Market.GetItemLabel(trade_listings[i].give.items[j].name)}</div>
                    </div>
                </div>
            `;
        }
        for (let j=0; j<giveSpaces; j++) {
                giveItemsHtml += `
                <div class="market-manage-item invalid">
                </div>
            `;
        }
        let recieveSpaces = 4 - (trade_listings[i].receive.currencies.length + trade_listings[i].receive.items.length);
        let receiveItemsHtml = ``;
        for (let j=0; j<trade_listings[i].receive.currencies.length; j++) {
            receiveItemsHtml += `
                <div class="market-manage-item">
                    <div style="background-image: url(${Market.GetCurrency(trade_listings[i].receive.currencies[j].name).image});">
                        <div>${numberWithCommas(trade_listings[i].receive.currencies[j].quantity)}</div>
                        <div></div>
                        <div>${_L(Market.GetCurrency(trade_listings[i].receive.currencies[j].name).label_locale)}</div>
                    </div>
                </div>
            `;
        }
        for (let j=0; j<trade_listings[i].receive.items.length; j++) {
            receiveItemsHtml += `
                <div class="market-manage-item">
                    <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + trade_listings[i].receive.items[j].name}.png);">
                        <div>x${trade_listings[i].receive.items[j].quantity}</div>
                        <div></div>
                        <div>${Market.GetItemLabel(trade_listings[i].receive.items[j].name)}</div>
                    </div>
                </div>
            `;
        }
        for (let j=0; j<recieveSpaces; j++) {
            receiveItemsHtml += `
                <div class="market-manage-item invalid">
                </div>
            `;
        }
        let insert = `
            <div class="trade-listing">
                ${manageListingHtml}
                <div class="sections">
                    <div class="trade-listing-section">
                        <div class="header">
                            <div>${_L("market_trade_addlisting_give")}</div>
                            <div>${trade_listings[i].give.currencies.length + trade_listings[i].give.items.length} ITEM(S)</div>
                        </div>
                        <div class="inventory-container">
                            <div>
                                ${giveItemsHtml}
                            </div>
                        </div>
                    </div>
                    <div class="trade-listing-section">
                        <div class="header">
                            <div>${_L("market_trade_addlisting_receive")}</div>
                            <div>${trade_listings[i].receive.currencies.length + trade_listings[i].receive.items.length} ITEM(S)</div>
                        </div>
                        <div class="inventory-container">
                            <div>
                                ${receiveItemsHtml}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <div class="accept-trade">TRADE</div>
                </div>
            </div>
        `
        contentHtml += insert;
    };
    $("#market-container .trade.container > .content > .listings").html(contentHtml);
}

MarketTrade.DisplayMenu = function() {
    let trade_listings = Market.data.trade_listings;
    let addListingHtml = ``;
    if (Market.DoesHavePermission("items")) {
        addListingHtml = `
            <div class="add-listing">
                <i class="fas fa-plus"></i>
                <div>${_L("market_trade_addlisting")}</div>
            </div>
        `;
    }
    let elem = $("#market-container .container");
    elem.removeClass();
    elem.addClass("container");
    elem.addClass("trade");
    elem.html(`
        <div class="content">
            ${addListingHtml}
            <div class="listings">
            </div>
        </div>
    `);
    elem.css("display", "flex").hide().fadeIn(250);
    MarketTrade.RefreshListings()
}

$(document).ready(function() {
    $('#market-container').on('click', '.trade.container .content > .add-listing', function(event) {
        MarketTrade.AddListingPrompt()
    });

    $('#market-container').on('click', '.trade.container .content > .listings .trade-listing .edit', function(event) {
        let index = $(this).parent().parent().index();
        let sku = Market.data.trade_listings[index].sku;
        MarketTrade.AddListingPrompt(Market.data.trade_listings[index], sku)
    });

    $('#market-container').on('click', '.trade.container .content > .listings .trade-listing .delete', function(event) {
        let index = $(this).parent().parent().index();
        let sku = Market.data.trade_listings[index].sku;
        MarketTrade.DeleteListingPrompt(sku);
    });

    $('#market-container').on('click', '.trade.container .content > .listings .trade-listing .accept-trade', function(event) {
        let index = $(this).parent().parent().index();
        let sku = Market.data.trade_listings[index].sku;
        $.post("https://pickle_businesses/marketTradeAction", JSON.stringify({sku: sku, action: "accept_trade"}));
    });

});

window.addEventListener('message', function(ev) {
    if (ev.data.type == "updateTradeListings") {
        if (Market.businessId == ev.data.index) {
            MarketTrade.RefreshListings(ev.data.data.trade_listings)
        }
    }
});