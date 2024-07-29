local CraftingPlayers = {}

function CheckRequired(source, required)
    if not required or #required < 1 then return true end
    local success = true
    local missingItems = {}
    for i=1, #required do 
        local part = required[i]
        if (not part.type or part.type == "item") then
            local remaining = Inventory.GetItemCount(source, part.name) - (part.count)
            if remaining < 0 then 
                success = false
                missingItems[#missingItems + 1] = {index = i, name = part.name, count = remaining * -1}
            end
        elseif (part.type == "cash") then
            local remaining = GetMoney(source) - part.count
            if remaining < 0 then 
                success = false
                missingItems[#missingItems + 1] = {index = i, name = "cash", count = remaining * -1}
            end
        elseif (part.type == "weapon" and not Inventory.HasWeapon(source, part.name)) then
            success = false
            missingItems[#missingItems + 1] = {index = i, name = part.name, count = 1}
        end
    end
    return success, missingItems
end

function TakeRequired(source, required)
    if not required or #required < 1 then return true end
    for i=1, #required do 
        local part = required[i]
        if (not part.type or part.type == "item") then
            Inventory.RemoveItem(source, part.name, part.count)
        elseif (part.type == "cash") then
            RemoveMoney(source, part.count)
        elseif (part.type == "weapon" and not Inventory.HasWeapon(source, part.name)) then
            Inventory.RemoveWeapon(source, part.name, 1)
        end
    end
end

function GiveRewards(source, rewards)
    for i=1, #rewards do 
        local reward = rewards[i]
        if not reward.type or reward.type == "item" then
            Inventory.AddItem(source, reward.name, reward.count, reward.createItem and reward.createItem(craftingData) or nil)
        elseif reward.type == "cash" then
            AddMoney(source, reward.count)
        elseif reward.type == "weapon" then
            Inventory.AddWeapon(source, reward.name, reward.count, reward.createItem and reward.createItem(craftingData) or nil)
        elseif Config.XPEnabled and reward.type == "xp" then 
            AddPlayerXP(source, reward.name, reward.count)
        end
    end
end

function IsCraftingInProgress(businessId, locationId)
    for k,v in pairs(CraftingPlayers) do 
        if v.businessId == businessId and v.locationId == locationId then 
            return true
        end
    end
    return false
end

lib.callback.register("pickle_businesses:isCraftingActive", function(source, businessId, locationId)
    return IsCraftingInProgress(businessId, locationId)
end)

lib.callback.register("pickle_businesses:startCrafting", function(source, businessId, locationId, craftableId)
    local source = source
    local craftingPlayer = CraftingPlayers[source]
    if craftingPlayer then 
        return ShowNotification(source, _L("business_crafting_already"))
    end
    if IsCraftingInProgress(businessId, locationId) then 
        return ShowNotification(source, _L("business_crafting_occupied"))
    end
    local business = Businesses[businessId]
    local _, location = GetBusinessLocation(businessId, locationId)
    if not business or not location then return ShowNotification(source, _L("business_not_found")) end
    local employee = GetBusinessEmployee(source, businessId)
    if not employee then return false end
    local craftingData = GetCraftingData(business.zone, location.craftingType)
    if not craftingData then return ShowNotification(source, _L("business_crafting_not_found")) end
    local craftableItem = craftingData.craftableItems[craftableId]
    if not craftableItem then return ShowNotification(source, _L("business_crafting_item_not_found")) end
    local success, missingItems = CheckRequired(source, craftableItem.required)
    if not success then 
        for i=1, #missingItems do 
            local item = missingItems[i]
            ShowNotification(source, _L("business_crafting_missing_item", GetItemLabel(item.name), item.count))
        end
        return
    end
    TakeRequired(source, craftableItem.required)
    local startTime = os.time()
    CraftingPlayers[source] = {
        startTime = startTime,
        businessId = businessId,
        locationId = locationId,
        craftableId = craftableId
    }
    SetTimeout(1000 * Config.Crafting.timeoutTime, function()
        local craftingPlayer = CraftingPlayers[source]
        if not craftingPlayer then return end
        if startTime == craftingPlayer.startTime then 
            CraftingPlayers[source] = nil
        end
    end)
    return true
end)

RegisterNetEvent("pickle_businesses:finishCrafting", function()
    local source = source
    local craftingPlayer = CraftingPlayers[source]
    if not craftingPlayer then 
        return ShowNotification(source, _L("business_crafting_failed"))
    end
    local businessId = craftingPlayer.businessId
    local locationId = craftingPlayer.locationId
    local craftableId = craftingPlayer.craftableId
    local business = Businesses[businessId]
    local _, location = GetBusinessLocation(businessId, locationId)
    if not business or not location then return ShowNotification(source, _L("business_not_found")) end
    local employee = GetBusinessEmployee(source, businessId)
    if not employee then return false end
    local craftingData = GetCraftingData(business.zone, location.craftingType)
    if not craftingData then return ShowNotification(source, _L("business_crafting_not_found")) end
    local craftableItem = craftingData.craftableItems[craftableId]
    if not craftableItem then return ShowNotification(source, _L("business_crafting_item_not_found")) end
    GiveRewards(source, {
        {type = "item", name = craftableItem.name, count = craftableItem.count},
    })
    CraftingPlayers[source] = nil
end)