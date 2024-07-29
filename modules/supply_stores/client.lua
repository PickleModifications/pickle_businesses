function OpenSupplyStoreConfirmQuantity(index, businesses, businessId, supply)
    local business = Businesses[businessId]
    local store = Config.SupplyStores[index]
    if not supply then return end
    local quantity = supply.quantity or 1
    local input = lib.inputDialog(_L("supply_store_quantity_title"), {
        {type = 'input', label = _L("supply_store_quantity_set"), required = true, default = quantity},
    })
    if input and input[1] and tonumber(input[1]) and tonumber(input[1]) > 0 then
        supply.quantity = tonumber(input[1])
    end
    OpenSupplyStoreConfirm(index, businesses, businessId, supply)
end

function OpenSupplyStoreConfirmMethod(index, businesses, businessId, supply)
    local methodOptions = {
        { label = _L("market_cash"), value = "cash" },
        { label = _L("market_card"), value = "card" },
    }
    local input = lib.inputDialog(_L("billing_charge_method"), {
        {type = 'select', label = _L("billing_charge_method_select"), options = methodOptions, required = true, default = supply.method},
    })
    if input and input[1] then
        supply.method = input[1]
    end
    OpenSupplyStoreConfirm(index, businesses, businessId, supply)
end

function OpenSupplyStoreConfirm(index, businesses, businessId, supply)
    local business = Businesses[businessId]
    local store = Config.SupplyStores[index]
    local options = {}
    local zoneName = business.zone
    local zoneIndex, zone = GetBusinessZoneIndexByName(zoneName)
    if not zone then return end
    local supplyItem = zone.supplies[supply.index]
    options[#options + 1] = {
        title = _L("supply_store_price", NumberWithCommas(supplyItem.price * supply.quantity)),
        icon = "dollar-sign",
    }
    options[#options + 1] = {
        title = _L("supply_store_quantity", supply.quantity),
        icon = "gear",
        onSelect = function()
            lib.hideContext()
            SetTimeout(100, function()
                OpenSupplyStoreConfirmQuantity(index, businesses, businessId, supply)
            end)
        end
    }
    options[#options + 1] = {
        title = _L("supply_store_method_value", _L("market_" .. supply.method)),
        icon = "gear",
        onSelect = function()
            lib.hideContext()
            SetTimeout(100, function()
                OpenSupplyStoreConfirmMethod(index, businesses, businessId, supply)
            end)
        end
    }
    options[#options + 1] = {
        title = _L("supply_store_purchase"),
        icon = "paper-plane",
        onSelect = function()
            TriggerServerEvent("pickle_businesses:purchaseSupply", businessId, supply.index, supply.method, supply.quantity)
        end
    }
    lib.registerContext({
        id = 'pb_supply_store_confirm',
        title = _L("supply_store"),
        onExit = function()
            SetTimeout(100, function()
                OpenSupplyStore(index, businesses, businessId)
            end)
        end,
        options = options
    })
    lib.showContext('pb_supply_store_confirm')
end

function OpenSupplyStore(index, businesses, businessId)
    local business = Businesses[businessId]
    local store = Config.SupplyStores[index]
    local options = {}
    local zoneName = business.zone
    local zoneIndex, zone = GetBusinessZoneIndexByName(zoneName)
    if not zone then return end
    for i=1, #zone.supplies do
        local supply = zone.supplies[i]
        options[#options + 1] = {
            title = GetItemLabel(supply.name),
            description = NumberWithCommas(supply.price),
            onSelect = function()
                SetTimeout(100, function()
                    OpenSupplyStoreConfirm(index, businesses, businessId, {
                        index = i,
                        method = "cash",
                        quantity = 1
                    })
                end)
            end
        }
    end
    lib.registerContext({
        id = 'pb_supply_store',
        title = _L("supply_store"),
        onExit = function()
            if #businesses > 0 then
                SetTimeout(100, function()
                    OpenSupplyStoreSelect(index, businesses)
                end)
            end
        end,
        options = options
    })
    lib.showContext('pb_supply_store')
end

function OpenSupplyStoreSelect(index, businesses)
    if #businesses == 0 then return ShowNotification(_L("not_in_businesses")) end
    local options = {}
    for i=1, #businesses do
        local business = Businesses[businesses[i]]
        local zoneName = business.zone
        local zoneIndex, zone = GetBusinessZoneIndexByName(zoneName)
        options[#options + 1] = {
            title = business.label or "Untitled Business",
            description = zone and _L("customize_zone_value", zone.label) or "Unknown Zone",
            onSelect = function()
                SetTimeout(100, function()
                    OpenSupplyStore(index, businesses, businesses[i])
                end)
            end
        }
    end
    lib.registerContext({
        id = 'pb_supply_store_select',
        title = _L("supply_store_select"),
        options = options
    })
    lib.showContext('pb_supply_store_select')

end

CreateThread(function()
    for i=1, #Config.SupplyStores do
        local location = Config.SupplyStores[i]
        CreateInteraction({
            coords = vector3(location.coords.x, location.coords.y, location.coords.z),
            heading = location.heading or 0.0,
            label = location.label or _L("supply_store"),
            model = location.model,
        }, function()
            lib.callback("pickle_businesses:getPlayerBusinesses", "", function(businesses)
                if not businesses or #businesses == 0 then return ShowNotification(_L("not_in_businesses")) end
                OpenSupplyStoreSelect(i, businesses)
            end)
        end)
    end
end)