var MarketBuy = {}
MarketBuy.dragging = null;
MarketBuy.hovering_checkout = false;
MarketBuy.hovering_listing = null;
MarketBuy.hovering_listing_infothread = null;
MarketBuy.displaying_item = null;
MarketBuy.additemprompt_selected_item = null;

MarketBuy.GetListingsHtml = function() {
    let store_listings = Market.data.store_listings;
    let hasPermission = Market.DoesHavePermission("items");
    let contentHtml = ``;
    let manageItemHtml = `
        <div style="position: absolute; bottom: 1.3vw; display: flex; flex-direction: row; column-gap: 0.25vw; font-size: 0.5vw">
            <i class="edit fas fa-pen"></i>
            <i class="delete fas fa-trash"></i>
        </div>
    `;
    for (let i=0; i<store_listings.length; i++) {

        let insert = `
        <div class="market-buy-item">
            <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + store_listings[i].name}.png);">
                <div>${numberWithCommas(store_listings[i].price)}</div>
                <div>x${store_listings[i].quantity}</div>
                <div>${Market.GetItemLabel(store_listings[i].name)}</div>
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

MarketBuy.RefreshMetadataTooltip = function() {
    let store_listings = Market.data.store_listings;
    [...document.querySelectorAll('*')].forEach(node => {
        if (node._tippy) {
          node._tippy.destroy();
        }
    });
    $("#market-container .container > .content > .listings .market-buy-item").each(function(i) {
        tippy($("#market-container .container > .content > .listings .market-buy-item").get(i), {
            allowHTML: true,
            theme: "market-theme",
            content: `<b>${_L("market_sku", store_listings[i].sku.replace("sku_", ""))}</b><br>` + StringifyItemMetadata(store_listings[i]).string,
        });
        $("#market-container .container > .content > .listings .market-buy-item .edit").eq(i).on("click", function() {
            MarketBuy.EditItemPrompt(i);
        });
        $("#market-container .container > .content > .listings .market-buy-item .delete").eq(i).on("click", function() {
            MarketBuy.EditItemPrompt_Submit(i, true);
        });
    });
}

MarketBuy.DisplayMenu = function(data) {
    if (Market.data == null) return;
    let store_listings = Market.data.store_listings;
    let contentHtml = MarketBuy.GetListingsHtml();
    let elem = $("#market-container .container");
    elem.removeClass();
    elem.addClass("container");
    elem.addClass("buy");
    elem.html(`
    <div class="content">
        <div class="listings">
            ${contentHtml}
        </div>
    </div>
    <div class="checkout-area items">
        <div class="checkout-list empty">
        </div>
        <div class="checkout-summary empty">
            <div>
                <div>
                    <div>${_L("market_buy_total")}:</div>
                    <div class="total-price"></div>
                </div>
                <div>
                    <div>Payment Method:</div>
                    <select value="cash" class="payment-method">
                        <option value="cash">${_L("market_cash")}</option>
                        <option value="card">${_L("market_card")}</option>
                        ${Market.data.acceptsDirtyCash ? `<option value="dirtycash">${_L("market_dirtycash")} </option>` : ""}
                    </select>
                </div>
            </div>
            <div class="purchase">
            </div>
        </div>
    </div>
    `);
    elem.css("display", "flex").hide().fadeIn(250);
    MarketBuy.RefreshMetadataTooltip();
    MarketBuy.Cart_EmptyCheck();
}

MarketBuy.Cart_EmptyCheck = function() {
    if ($("#market-container .buy.container > .checkout-area > .checkout-list > .checkout-item").length == 0) {
        $("#market-container .buy.container > .checkout-area > .checkout-list").html(`
        <div style="display: flex; flex-direction: column; align-items: center;">
            <div><img src="assets/images/cart.png" style="width: 4vw; margin-bottom: 0.7vw;"></div>
            <div style="font-size: 0.7vw;">${_L("market_buy_dragtocart")}</div>
        </div>
        `).addClass("empty");
        $("#market-container .buy.container > .checkout-area > .checkout-summary").addClass("empty");
    }
}

MarketBuy.Cart_UpdateTotalPrice = function() { 
    let total = 0;
    $("#market-container .buy.container > .checkout-area > .checkout-list > .checkout-item").each(function(i) {
        let sku = $(this).attr("id").split("-")[2];
        let listingId = Market.data.store_listings.findIndex(x => x.sku == sku);
        if (listingId == -1) {
            $(this).remove();
            MarketBuy.Cart_EmptyCheck();
            return;
        }
        let listing = Market.data.store_listings[listingId];
        let quantity = $(`#checkout-listing-${sku} .quantity-input`).val();
        total += listing.price * quantity;
    });
    $("#market-container .checkout-area .total-price").html(numberWithCommas(total));
    $("#market-container .checkout-area .purchase").html(_L("market_buy_purchase_amount", $("#market-container .buy.container > .checkout-area > .checkout-list > .checkout-item").length));
}

MarketBuy.Cart_AddListing = function(listingId) {
    let listing = Market.data.store_listings[listingId];
    if (listing == null) {
        $.notify(_L("market_buy_listing_invalid"), {color: "#fff", background: "#D44950"});
        return;
    }
    if ($(`#checkout-listing-${listing.sku}`).length > 0) {
        $.notify(_L("market_buy_listing_incart"), {color: "#fff", background: "#D44950"});
        return;
    }

    let listingHtml = `
    <div class="checkout-item" id="checkout-listing-${listing.sku}">
        <div>
            <div class="quantity-module">
                <input class="quantity-input" type="number" min="1" max="${listing.quantity}" value="1" style="margin-left: 1vw; text-align: center; width: 2vw; height: 1vw; color: white; background-color: var(--color3); border: none; padding: 0;"></input>
            </div>    
            <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + listing.name}.png);">
            </div>
        </div>
        <div>
            <div>${Market.GetItemLabel(listing.name)}</div>
            <div>
                <div class="price">${numberWithCommas(listing.price)}</div>
            </div>
        </div>
        <div>
            <i class="fas fa-times"></i>
        </div>
    </div>
    `
    if ($("#market-container .buy.container > .checkout-area > .checkout-list").hasClass("empty")) {
        $("#market-container .buy.container > .checkout-area > .checkout-list").html("").removeClass("empty");
        $("#market-container .buy.container > .checkout-area > .checkout-summary").removeClass("empty");
    }
    $("#market-container .buy.container > .checkout-area > .checkout-list").append(listingHtml);
    MarketBuy.Cart_UpdateListingQuantity(listing.sku);
    MarketBuy.Cart_UpdateTotalPrice();
    tippy(`#checkout-listing-${listing.sku} > div:nth-child(2)`, {
        allowHTML: true,
        theme: "market-theme",
        content: `<b>${_L("market_sku", listing.sku.replace("sku_", ""))}</b><br>` + StringifyItemMetadata(listing).string,
    });
}

MarketBuy.Cart_RemoveListing = function(sku) {
    // let listingId = Market.data.store_listings.findIndex(x => x.sku == sku);
    // let listing = Market.data.store_listings[listingId];
    $(`#checkout-listing-${sku}`).remove();
    MarketBuy.Cart_UpdateTotalPrice();
    MarketBuy.Cart_EmptyCheck();
}

MarketBuy.Cart_RefreshListings = function() {
    $("#market-container .buy.container > .checkout-area > .checkout-list > .checkout-item").each(function(i) {
        let sku = $(this).attr("id").split("-")[2];
        let listingId = Market.data.store_listings.findIndex(x => x.sku == sku);
        if (listingId == -1) {
            $(this).remove();
            return;
        }
        let listing = Market.data.store_listings[listingId];
        let quantity = $(`#checkout-listing-${sku} .quantity-input`).val();
        $(`#checkout-listing-${sku} .quantity-input`).attr("max", listing.quantity);
        if (listing.quantity < quantity) {
            $(`#checkout-listing-${sku} .quantity-input`).val(listing.quantity);
        }
        MarketBuy.Cart_UpdateListingQuantity(sku)
    });
    MarketBuy.Cart_UpdateTotalPrice();
    MarketBuy.Cart_EmptyCheck();
}

MarketBuy.Cart_UpdateListingQuantity = function(sku) {
    let listingId = Market.data.store_listings.findIndex(x => x.sku == sku);
    let listing = Market.data.store_listings[listingId];
    if ($(`#checkout-listing-${sku}`).length < 1) {
        $.notify(_L("market_buy_listing_invalid"), {color: "#fff", background: "#D44950"});
        return;
    }
    let quantity = $(`#checkout-listing-${sku} .quantity-input`).val();
    if (quantity < 1) {
        MarketBuy.Cart_RemoveListing(sku);
        return;
    }
    $(`#checkout-listing-${sku} .price`).html(`${numberWithCommas(Market.data.store_listings[listingId].price * quantity)}`);
    MarketBuy.Cart_UpdateTotalPrice();
}

MarketBuy.Cart_Submit = function() {
    let cart = [];
    let elements = $("#market-container .buy.container > .checkout-area > .checkout-list > .checkout-item");
    for (let i=0; i<elements.length; i++) {
        let sku = $(elements[i]).attr("id").split("-")[2];
        let listing = Market.data.store_listings.find(x => x.sku == sku);
        let quantity = Number($(`#checkout-listing-${sku} .quantity-input`).val());
        cart.push({
            sku: listing.sku,
            quantity: quantity,
        });
    }
    let paymentMethod = $("#market-container .buy.container > .checkout-area .payment-method").val();
    $.post("https://pickle_businesses/marketBuyAction", JSON.stringify({cart: cart, paymentMethod: paymentMethod, action: "purchase"}), function(data) {
        if (data) {
            $("#market-container .buy.container > .checkout-area > .checkout-list > .checkout-item").remove();
        }
    });
}

MarketBuy.DragItem = function(listingId, event, elmnt) {
    let e = event;
    if (MarketBuy.dragging != null) return;
    if (!Market.data.store_listings[listingId]) return;
    MarketBuy.dragging = listingId;
    let fixedElmnt = elmnt;
    elmnt = $(fixedElmnt).clone().appendTo("#app-market")[0];
    $(elmnt).addClass("drag");
    $(fixedElmnt).addClass("dragged");
    // get the mouse cursor position at startup:

    elmnt.style.display = 'none';
    elmnt.style.position = 'absolute';
    
    document.onmouseup = function(e) {
        document.onmouseup = null;
        document.onmousemove = null;
        if (MarketBuy.dragging == null) return;
        $(".market-buy-item.drag").remove();
        $("#market-container .buy.container .dragged").removeClass("dragged");
        setTimeout(() => {
            if (MarketBuy.hovering_checkout) {
                MarketBuy.Cart_AddListing(listingId);
            }
            else if (MarketBuy.hovering_listing != null && MarketBuy.hovering_listing != listingId) {
                $.post("https://pickle_businesses/marketBuyAction", JSON.stringify({from: Market.data.store_listings[listingId].sku, to: Market.data.store_listings[MarketBuy.hovering_listing].sku, action: "move_item"}));
            }
        }, 50);
        MarketBuy.dragging = null;
    };
    // call a function whenever the cursor moves:
    document.onmousemove = function(e) {
        e = e || window.event;
        e.preventDefault();
        elmnt.style.display = 'flex';
        elmnt.style.position = 'absolute';
        elmnt.style.top = (e.clientY - (elmnt.offsetHeight / 2)) + "px";
        elmnt.style.left =  (e.clientX - (elmnt.offsetWidth / 2)) + "px";
    };
}

MarketBuy.AddItemPrompt_SelectItem = function(itemId) {
    let item = Market.data.player_inventory[itemId];
    let stackedItems = Market.GetStackableItems(itemId);
    MarketBuy.additemprompt_selected_item = itemId;
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
    $("#market-container .buy.container > .prompt.add-item .quantity-input").attr("max", stackedItems.count).val(stackedItems.count);
    $("#market-container .buy.container > .prompt .quantity-text").html(_L("market_quantity_max", stackedItems.count) + ":");
    tippy('.prompt.add-item .selected-item .market-buy-item', {
        allowHTML: true,
        theme: "market-theme",
        content: StringifyItemMetadata(item).string,
    });
}

MarketBuy.AddItemPrompt_PopulateInventory = function() {
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
                MarketBuy.AddItemPrompt_SelectItem(i)
            })
        }, 250);
    }
    $("#market-container .buy.container > .prompt .inventory").html(serverItemsHtml);
}

MarketBuy.AddItemPrompt_Submit = function() {
    let itemId = MarketBuy.additemprompt_selected_item;
    if (itemId == null) {
        $.notify(_L("market_buy_listing_addfail"), {color: "#fff", background: "#D44950"});
        return;
    }
    let item = Market.data.player_inventory[itemId];
    let stackedItems = Market.GetStackableItems(itemId);
    let price = $("#market-container .buy.container > .prompt .price-input").val();
    let quantity = $("#market-container .buy.container > .prompt .quantity-input").val();
    if (price < 0 || quantity < 1) {
        $.notify(_L("market_buy_listing_addfail"), {color: "#fff", background: "#D44950"});
        return;
    }
    if (quantity > stackedItems.count) {
        $.notify(_L("market_buy_listing_addfail"), {color: "#fff", background: "#D44950"});
        return;
    }
    let data = {
        item: item,
        price: price,
        quantity: quantity,
    }
    $.post("https://pickle_businesses/marketBuyAction", JSON.stringify({item: item, price: Number(price), quantity: Number(quantity), action: "add_item"}));
    $("#market-container .buy.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketBuy.AddItemPrompt = function() {
    $("#market-container .buy.container > .prompt").remove()
    $("#market-container .buy.container").prepend(`
    <div class="prompt add-item tall" style="display:none;">
        <div>
            <div class="header">
                <div>${_L("market_buy_newlisting")}</div>
                <i class="fas fa-times"></i>
            </div>
            <div class="content">
                <div>${_L("market_buy_newlisting_chooseitem")}:</div>
                <div class="inventory">
                </div>
                <div class="selected-item">
                    <div style="display:flex;">
                        <div class="selected-item-container">
                        </div>
                        <div class="selected-item-options">
                            <div style="display: flex; align-items: center;">
                                <div style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_price")}:</div>
                                <input class="price-input" type="number" min="0" value="0" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                            </div>
                            <div style="display: flex; align-items: center; margin-top: 0.5vw">
                                <div class="quantity-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_quantity")}:</div>
                                <input class="quantity-input" type="number" min="1" value="1" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                            </div>
                            <div class="italic" style="margin-top: 0.5vw;">${_L("market_buy_newlisting_note1")}</div>
                            <div class="italic">${_L("market_buy_newlisting_note2")}</div>
                        </div>
                    </div>            
                    <div style="margin-top: 1vw; margin-bottom: 0.5vw; display:flex; align-items: center; justify-content: center;">
                        <div class="submit-add-item" style="background-color: var(--success1); padding: 0.5vw 4vw">${_L("market_buy_newlisting_submit")}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `)
    $("#market-container .buy.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .buy.container > .prompt .submit-add-item").on("click", function() {
        MarketBuy.AddItemPrompt_Submit()
    });
    $("#market-container .buy.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .buy.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .buy.container > .prompt").remove()
        }, 255);
    })
      
    MarketBuy.AddItemPrompt_PopulateInventory()
}

MarketBuy.EditItemPrompt = function(listingId) {
    let listing = Market.data.store_listings[listingId];
    if (listing == undefined || listing == null) return;
    let maxQuantity = listing.quantity; // TODO: Add amount in player inventory to maximum.
    let addableCount = Market.GetListingItemInfo(listing);
    maxQuantity += addableCount;

    $("#market-container .buy.container > .prompt").remove()
    $("#market-container .buy.container").prepend(`
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
                                <div style="background-image: url(${CONFIG_INVENTORY_IMG_DIR + "/" + listing.name}.png);">
                                    <div></div>
                                    <div>x${listing.quantity}</div>
                                    <div>${Market.GetItemLabel(listing.name)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="selected-item-options">
                            <div style="display: flex; align-items: center;">
                                <div style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_price")}:</div>
                                <input class="price-input" type="number" min="0" value="${listing.price || 0}" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
                            </div>
                            <div style="display: flex; align-items: center; margin-top: 0.5vw">
                                <div class="quantity-text" style="margin-right: 0.25vw; font-size:0.75vw;">${_L("market_quantity")}:</div>
                                <input class="quantity-input" type="number" min="0" max="${maxQuantity}" value="${listing.quantity}" style="margin-left: auto; width: 5vw; height: 1vw; color: white; background-color: var(--color2); border: none; padding: 0 0.25vw;"></input>
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
    $("#market-container .buy.container > .prompt").css("display", "flex").hide().fadeIn(250);
    $("#market-container .buy.container > .prompt .submit-add-item").on("click", function() {
        MarketBuy.EditItemPrompt_Submit(listingId);
    });
    $("#market-container .buy.container > .prompt > div > .header > i").on("click", function() {
        $("#market-container .buy.container > .prompt").fadeOut(250);
        setTimeout(() => {
            $("#market-container .buy.container > .prompt").remove()
        }, 255);
    })
}

MarketBuy.EditItemPrompt_Submit = function(listingId, deleteItem) {
    let listing = Market.data.store_listings[listingId];
    if (!listing) return;
    if (deleteItem) {
        $.post("https://pickle_businesses/marketBuyAction", JSON.stringify({sku: listing.sku, price: Number(0), quantity: Number(0), action: "edit_item"}));
        return;
    }
    let price = $("#market-container .buy.container > .prompt .price-input").val();
    let quantity = $("#market-container .buy.container > .prompt .quantity-input").val();
    if (price < 0 || quantity < 0) {
        $.notify(_L("market_buy_listing_editfail"), {color: "#fff", background: "#D44950"});
        return;
    }
    $.post("https://pickle_businesses/marketBuyAction", JSON.stringify({sku: listing.sku, price: Number(price), quantity: Number(quantity), action: "edit_item"}));
    $("#market-container .buy.container > .prompt").css("display", "flex").fadeOut(250);
}

MarketBuy.UpdateStoreListings = function(data) {
    Market.data.store_listings = data;
    if (Market.currentSubmenu != 0) return;
    $("#market-container .container > .content > .listings").html(MarketBuy.GetListingsHtml());
    MarketBuy.RefreshMetadataTooltip();
    MarketBuy.Cart_RefreshListings();
}

MarketBuy.GetListingIdFromIndex = function(index) {
    return (index - (Market.DoesHavePermission("items") ? 1 : 0));
}

$(document).ready(function() {
    /* Buy Sub-menu */

    $('#market-container').on('click', '.buy.container > .content > .listings > .market-add-item', function(event) {
        MarketBuy.AddItemPrompt()
    });

    $('#market-container').on('click', '.checkout-item .fa-times', function(event) {
        MarketBuy.Cart_RemoveListing($(this).parent().parent().attr("id").split("-")[2])
    });
    
    $('#market-container').on('click', '.checkout-area .purchase', function(event) {
        MarketBuy.Cart_Submit()
    });

    $('#market-container').on('propertychange input', '.checkout-item input', function (e) {
        MarketBuy.Cart_UpdateListingQuantity($(this).parent().parent().parent().attr("id").split("-")[2], $(this).val())
    });

    $('#market-container').on('mousedown', '.buy.container > .content > .listings > .market-buy-item', function(event) {
        MarketBuy.DragItem(MarketBuy.GetListingIdFromIndex($(this).index()), event, this)
    });

    $('#market-container').on('mousedown', '.buy.container > .content > .listings > .market-buy-item', function(event) {
        MarketBuy.DragItem(MarketBuy.GetListingIdFromIndex($(this).index()), event, this)
    });

    $('#market-container').on('mouseenter', '.buy.container > .content > .listings > .market-buy-item', function(event) {
        let itemId = MarketBuy.GetListingIdFromIndex($(this).index());
        if (MarketBuy.dragging) return;
        MarketBuy.hovering_listing = itemId;
    });
    
    $('#market-container').on('mouseleave', '.buy.container > .content > .listings > .market-buy-item', function(event) {
        let itemId = MarketBuy.GetListingIdFromIndex($(this).index());
        if (MarketBuy.dragging) return;
        if (itemId == MarketBuy.hovering_listing) {
            MarketBuy.hovering_listing = null;
        }
    });
    

    $('#market-container').on('mouseenter', '.buy.container > .checkout-area', function(event) {
        MarketBuy.hovering_checkout = true;
    });
    
    $('#market-container').on('mouseleave', '.buy.container > .checkout-area', function(event) {
        MarketBuy.hovering_checkout = false;
    });

    /* Buy Sub-menu (Add Item) */

});

window.addEventListener('message', function(ev) {
    if (ev.data.type == "updateStoreListings") {
        if (Market.businessId == ev.data.index) {
            MarketBuy.UpdateStoreListings(ev.data.data.store_listings)
        }
    }
});