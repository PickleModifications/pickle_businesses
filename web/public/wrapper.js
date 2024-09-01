function OpenMenu() {
    window.postMessage({ 
        type: 'openMarket',
        currency: { name: "EUR", symbol: "€" },
        locale: {
            market_buy: "Product Listings",
            market_trade: "Trade Listings",
            market_manage: "Manage Business",
            market_buy_edit_title: "Editing %s (SKU: %s)",
            market_buy_edit_price: "Price",
            market_buy_edit_quantity: "Quantity",
            market_buy_edit_save: "Save Listing",
            market_buy_delete_title: "Deleting %s (SKU: %s)",
            market_buy_delete_desc: "Are you sure you want to delete this listing?",
            market_buy_delete_confirm: "Delete Listing",
            market_buy_add_title: "Add New Listing",
            market_buy_add_confirm: "Add Listing",
            market_buy_add_select: "Select the item you want to list:",
            market_buy_search: "Search for an item...",
            market_buy_item_note: "Note: You cannot stack items that have been damaged.",
            market_buy_item_note2: "If selling unique and/or damaged items, the quantity must be set to 1 to preserve the data.",
        },
        marketData: {
            inventory: [
                {name: "Meta Apple", quantity: 10, durability: 99.99, metadata: {}},  
                {name: "Banana", quantity: 20, metadata: {}},
                {name: "Orange", quantity: 30, metadata: {}},
                { name: "Item 11", quantity: 110, metadata: {} },
                { name: "Item 12", quantity: 120, metadata: {} },
                { name: "Item 13", quantity: 130, metadata: {} },
                { name: "Item 14", quantity: 140, metadata: {} },
                { name: "Item 15", quantity: 150, metadata: {} },
                { name: "Item 16", quantity: 160, metadata: {} },
                { name: "Item 17", quantity: 170, metadata: {} },
                { name: "Item 18", quantity: 180, metadata: {} },
                { name: "Item 19", quantity: 190, metadata: {} },
                { name: "Item 20", quantity: 200, metadata: {} },
                { name: "Item 21", quantity: 210, metadata: {} },
                { name: "Item 22", quantity: 220, metadata: {} },
                { name: "Item 23", quantity: 230, metadata: {} },
                { name: "Item 24", quantity: 240, metadata: {} },
                { name: "Item 25", quantity: 250, metadata: {} },
                { name: "Item 26", quantity: 260, metadata: {} },
                { name: "Item 27", quantity: 270, metadata: {} },
                { name: "Item 28", quantity: 280, metadata: {} },
                { name: "Item 29", quantity: 290, metadata: {} },
                { name: "Item 30", quantity: 300, metadata: {} }
            ],
            listings: [
                {sku: "500501", name: "BIG JUICY BANNANA AND ORANGE JUICE", price: 10000000, quantity: 100000, metadata: {}},
                {sku: "500502", name: "Item 2", price: 200, quantity: 20, metadata: {}},
                {sku: "500503", name: "Item 3", price: 300, quantity: 30, metadata: {}},
                {sku: "500504", name: "Item 4", price: 400, quantity: 40, metadata: {}},
                {sku: "500505", name: "Item 5", price: 500, quantity: 50, metadata: {}},
                {sku: "500506", name: "Item 6", price: 600, quantity: 60, metadata: {}},
                {sku: "500507", name: "Item 7", price: 700, quantity: 70, metadata: {}},
                {sku: "500508", name: "Item 8", price: 800, quantity: 80, metadata: {}},
                {sku: "500509", name: "Item 9", price: 900, quantity: 90, metadata: {}},
                {sku: "500510", name: "Item 10", price: 1000, quantity: 100, metadata: {}},
                {sku: "500501A", name: "Item 1", price: 100, quantity: 10, metadata: {}},
                {sku: "500502A", name: "Item 2", price: 200, quantity: 20, metadata: {}},
                {sku: "500503A", name: "Item 3", price: 300, quantity: 30, metadata: {}},
                {sku: "500504A", name: "Item 4", price: 400, quantity: 40, metadata: {}},
                {sku: "500505A", name: "Item 5", price: 500, quantity: 50, metadata: {}},
                {sku: "500506A", name: "Item 6", price: 600, quantity: 60, metadata: {}},
                {sku: "500507A", name: "Item 7", price: 700, quantity: 70, metadata: {}},
                {sku: "500508A", name: "Item 8", price: 800, quantity: 80, metadata: {}},
                {sku: "500509A", name: "Item 9", price: 900, quantity: 90, metadata: {}},
                {sku: "500510A", name: "Item 10", price: 1000, quantity: 100, metadata: {}},
                {sku: "500501B", name: "Item 1", price: 100, quantity: 10, metadata: {}},
                {sku: "500502B", name: "Item 2", price: 200, quantity: 20, metadata: {}},
                {sku: "500503B", name: "Item 3", price: 300, quantity: 30, metadata: {}},
                {sku: "500504B", name: "Item 4", price: 400, quantity: 40, metadata: {}},
                {sku: "500505B", name: "Item 5", price: 500, quantity: 50, metadata: {}},
                {sku: "500506B", name: "Item 6", price: 600, quantity: 60, metadata: {}},
                {sku: "500507B", name: "Item 7", price: 700, quantity: 70, metadata: {}},
                {sku: "500508B", name: "Item 8", price: 800, quantity: 80, metadata: {}},
                {sku: "500509B", name: "Item 9", price: 900, quantity: 90, metadata: {}},
                {sku: "500510B", name: "Item 10", price: 1000, quantity: 100, metadata: {}},
                {sku: "500501C", name: "Item 1", price: 100, quantity: 10, metadata: {}},
                {sku: "500502C", name: "Item 2", price: 200, quantity: 20, metadata: {}},
                {sku: "500503C", name: "Item 3", price: 300, quantity: 30, metadata: {}},
                {sku: "500504C", name: "Item 4", price: 400, quantity: 40, metadata: {}},
                {sku: "500505C", name: "Item 5", price: 500, quantity: 50, metadata: {}},
                {sku: "500506C", name: "Item 6", price: 600, quantity: 60, metadata: {}},
                {sku: "500507C", name: "Item 7", price: 700, quantity: 70, metadata: {}},
                {sku: "500508C", name: "Item 8", price: 800, quantity: 80, metadata: {}},
                {sku: "500509C", name: "Item 9", price: 900, quantity: 90, metadata: {}},
                {sku: "500510C", name: "Item 10", price: 1000, quantity: 100, metadata: {}},
            ]
        }
    }, '*');
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        OpenMenu();
    }, 100);
});

window.addEventListener('message', function(event) {
    if (event.data.type === 'refreshPage') {
        OpenMenu();
    }
});