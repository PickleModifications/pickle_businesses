function OpenBillingChargeNameMenu(businessId, locationId, data) 
    local business = Businesses[businessId]
    local _, location = GetBusinessLocation(businessId, locationId)
    if not business or not location or not data then return end
    local currentCharge = data.currentCharge or {}
    local name = currentCharge.name
    local input = lib.inputDialog(_L("billing_charge_name_title"), {
        {type = 'input', label = _L("billing_charge_name"), required = true, default = name},
    })
    if input and input[1] then
        currentCharge.name = input[1]
        data.currentCharge = currentCharge
    end
    OpenBillingChargeMenu(businessId, locationId, data)
end

function OpenBillingChargeCountMenu(businessId, locationId, data)
    local business = Businesses[businessId]
    local _, location = GetBusinessLocation(businessId, locationId)
    if not business or not location or not data then return end
    local currentCharge = data.currentCharge or {}
    local count = currentCharge.count or 1
    local input = lib.inputDialog(_L("billing_charge_count_title"), {
        {type = 'input', label = _L("billing_charge_count"), required = true, default = count},
    })
    if input and input[1] and tonumber(input[1]) and tonumber(input[1]) > 0 then
        currentCharge.count = tonumber(input[1])
        data.currentCharge = currentCharge
    end
    OpenBillingChargeMenu(businessId, locationId, data)
end

function OpenBillingChargePriceMenu(businessId, locationId, data)
    local business = Businesses[businessId]
    local _, location = GetBusinessLocation(businessId, locationId)
    if not business or not location or not data then return end
    local currentCharge = data.currentCharge or {}
    local price = currentCharge.price
    local input = lib.inputDialog(_L("billing_charge_price_title"), {
        {type = 'input', label = _L("billing_charge_price"), required = true, default = price},
    })
    if input and input[1] and tonumber(input[1]) and tonumber(input[1]) > 0 then
        currentCharge.price = tonumber(input[1])
        data.currentCharge = currentCharge
    end
    OpenBillingChargeMenu(businessId, locationId, data)
end

function OpenBillingTargetMenu(businessId, locationId, data)
    local business = Businesses[businessId]
    local _, location = GetBusinessLocation(businessId, locationId)
    if not business or not location or not data then return end
    local targetId = data.target?.id or nil
    lib.callback("pickle_businesses:getNearbyPlayers", "", function(nearbyPlayers)
        local nearbyPlayerOptions = {}
        local idKeys = {}
        for i=1, #nearbyPlayers do
            nearbyPlayerOptions[#nearbyPlayerOptions + 1] = {label = nearbyPlayers[i].name, value = nearbyPlayers[i].id}
            idKeys[nearbyPlayers[i].id] = #nearbyPlayerOptions
        end
        local input = lib.inputDialog(_L("billing_charge_target_title"), {
            {type = 'select', label = _L("billing_charge_target"), options = nearbyPlayerOptions, required = true, default = targetId or nearbyPlayers[1].id},
        })
        if input and input[1] and tonumber(input[1]) and tonumber(input[1]) > 0 then
            data.target = {
                id = tonumber(input[1]),
                name = nearbyPlayers[idKeys[tonumber(input[1])]].name
            }
        end
        OpenBillingMenu(businessId, locationId, data)
    end)
end

function OpenBillingChargeMenu(businessId, locationId, data)
    local business = Businesses[businessId]
    local _, location = GetBusinessLocation(businessId, locationId)
    if not business or not location or not data then return end
    local currentCharge = data.currentCharge or {}
    local price = currentCharge.price
    local count = currentCharge.count or 1
    local name = currentCharge.name
    local options = {}
    options[#options + 1] = {
        title = name and _L("billing_charge_name_set", name) or _L("billing_charge_name_unset"),
        icon = "list-ul",
        onSelect = function()
            OpenBillingChargeNameMenu(businessId, locationId, data)
        end
    }
    options[#options + 1] = {
        title = count and _L("billing_charge_count_set", count) or _L("billing_charge_count_unset"),
        icon = "box",
        onSelect = function()
            OpenBillingChargeCountMenu(businessId, locationId, data)
        end
    }
    options[#options + 1] = {
        title = price and _L("billing_charge_price_set", NumberWithCommas(price)) or _L("billing_charge_price_unset"),
        icon = "file-invoice-dollar",
        onSelect = function()
            OpenBillingChargePriceMenu(businessId, locationId, data)
        end
    }
    if currentCharge.index then
        options[#options + 1] = {
            title = _L("billing_charge_delete"),
            icon = "trash",
            onSelect = function()
                if currentCharge.index then
                    table.remove(data.charges, currentCharge.index)
                end
                OpenBillingMenu(businessId, locationId, data)
            end
        }
    end
    options[#options + 1] = {
        title = _L("billing_charge_save"),
        icon = "save",
        onSelect = function()
            if name and price ~= nil and count ~= nil then 
                if currentCharge.index then
                    data.charges[currentCharge.index] = { name = name, price = price, count = count }
                else
                    data.charges[#data.charges + 1] = { name = name, price = price, count = count }
                end
            end
            OpenBillingMenu(businessId, locationId, data)
        end
    }
    lib.registerContext({
        id = 'pb_billing_charge',
        title = _L("billing_charge_title"),
        -- canClose = false,
        onExit = function()
            lib.hideContext()
            SetTimeout(100, function()
                OpenBillingMenu(businessId, locationId, data)
            end)
        end,
        options = options
    })
    lib.showContext('pb_billing_charge')
end

function OpenBillingMenu(businessId, locationId, data)
    local business = Businesses[businessId]
    local _, location = GetBusinessLocation(businessId, locationId)
    if not business or not location then return end
    data = data or {
        target = nil,
        charges = {
        }
    }
    local options = {}
    local total = 0

    options[#options + 1] = {
        title = (data.target and _L("billing_target_set", data.target.name) or _L("billing_target_unset")),
        icon = "user-tie",
        onSelect = function()
            OpenBillingTargetMenu(businessId, locationId, data)
        end
    }
    for i=1, #data.charges do 
        options[#options + 1] = {
            title = _L("billing_charge", data.charges[i].name, data.charges[i].count, NumberWithCommas(data.charges[i].price)),
            icon = "list-ul",
            onSelect = function()
                data.currentCharge = {
                    index = i,
                    name = data.charges[i].name,
                    count = data.charges[i].count,
                    price = data.charges[i].price
                }
                OpenBillingChargeMenu(businessId, locationId, data)
            end
        }
        total = total + (data.charges[i].price)
    end        
    options[#options + 1] = {
        title = _L("billing_charge_add"),
        icon = "plus",
        onSelect = function()
            data.currentCharge = {}
            OpenBillingChargeMenu(businessId, locationId, data)
        end
    }
    options[#options + 1] = {
        title = _L("billing_total", NumberWithCommas(total)),
        icon = "file-invoice-dollar",
    }
    if data.target and data.target.id then
        options[#options + 1] = {
            title = _L("billing_charge_send"),
            icon = "paper-plane",
            onSelect = function()
                TriggerServerEvent("pickle_businesses:sendBill", businessId, data.target.id, data.charges)
            end
        }
    end

    lib.registerContext({
        id = 'pb_billing',
        title = _L("business_interact_billing"),
        -- canClose = false,
        options = options
    })
    lib.showContext('pb_billing')
end

function OpenBillingCustomerMethodMenu(businessId, billId, data)
    local methodOptions = {
        { label = _L("market_cash"), value = "cash" },
        { label = _L("market_card"), value = "card" },
    }
    local input = lib.inputDialog(_L("billing_charge_method"), {
        {type = 'select', label = _L("billing_charge_method_select"), options = methodOptions, required = true, default = data.method},
    })
    if input and input[1] then
        data.method = input[1]
    end
    OpenBillingCustomerMenu(businessId, billId, data)
end

function OpenBillingCustomerMenu(businessId, billId, data)
    local business = Businesses[businessId]
    if not business then return end
    local data = data or {
        method = "cash",
        charges = {}    
    }
    local options = {}
    local total = 0

    options[#options + 1] = {
        title = _L("billing_name", business.label or "Untitled Business"),
        icon = "store",
    }

    for i=1, #data.charges do 
        options[#options + 1] = {
            title = _L("billing_charge", data.charges[i].name, data.charges[i].count, NumberWithCommas(data.charges[i].price)),
            icon = "list-ul",
        }
        total = total + (data.charges[i].price)
    end        
    options[#options + 1] = {
        title = _L("billing_total", NumberWithCommas(total)),
        icon = "file-invoice-dollar",
    }
    options[#options + 1] = {
        title = _L("billing_charge_method") .. ": " .. _L("market_" .. data.method),
        icon = "gear",
        onSelect = function()
            OpenBillingCustomerMethodMenu(businessId, billId, data)
        end
    }
    
    options[#options + 1] = {
        title = _L("billing_charge_pay"),
        icon = "paper-plane",
        onSelect = function()
            TriggerServerEvent("pickle_businesses:payBill", billId, data.method)
        end
    }

    lib.registerContext({
        id = 'pb_billing_customer',
        title = _L("business_billing_customer"),
        -- canClose = false,
        options = options
    })
    lib.showContext('pb_billing_customer')
end

RegisterNetEvent("pickle_businesses:sendBill", function(businessId, billId, charges)
    OpenBillingCustomerMenu(businessId, billId, {
        method = "cash",
        charges = charges    
    })
end)