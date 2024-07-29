RegisterNetEvent("pickle_businesses:purchaseSupply", function(businessId, supplyId, method, quantity)
    local source = source
    local business = Businesses[businessId]
    if not business then return end
    if method ~= "cash" and method ~= "card" then return end
    if not quantity or quantity < 1 then return end
    local zoneName = business.zone
    local zoneIndex, zone = GetBusinessZoneIndexByName(zoneName)
    if not zone then return end
    local supply = zone.supplies[supplyId]
    if not supply then return end
    local total = supply.price * quantity
    local cash = GetPaymentMethodAmount(source, "cash")
    if cash < total then
        return ShowNotification(source, _L("supply_store_insufficient_funds", NumberWithCommas(total - cash)))
    end
    Inventory.AddItem(source, supply.name, quantity * supply.count)
    ChargePaymentMethod(source, method, total)
    ShowNotification(source, _L("supply_store_success", GetItemLabel(supply.name), quantity, NumberWithCommas(total)))
end)