function GetCraftingTypes(zoneName, isMenuQuery)
    if not zoneName then return {} end
    local zoneId = GetBusinessZoneIndexByName(zoneName)
    local zone = Config.BusinessZones[zoneId]
    if not zone then return {} end
    local craftingTypes = {}
    if isMenuQuery then
        for i=1, #zone.craftingTypes do
            craftingTypes[#craftingTypes + 1] = zone.craftingTypes[i].label
        end
    else
        craftingTypes = zone.craftingTypes
    end
    return craftingTypes
end

function GetCraftingTypeByIndex(zoneName, index)
    if not zoneName then return end
    local zoneId = GetBusinessZoneIndexByName(zoneName)
    local zone = Config.BusinessZones[zoneId]
    if not zone then return end
    return zone.craftingTypes[index].name
end

function GetCraftingIndexByType(zoneName, craftingType)
    if not zoneName then return end
    local zoneId = GetBusinessZoneIndexByName(zoneName)
    local zone = Config.BusinessZones[zoneId]
    if not zone then return end
    for i=1, #zone.craftingTypes do 
        if zone.craftingTypes[i].name == craftingType then
            return i
        end
    end
end

function GetCraftingData(zoneName, craftingType)
    if not zoneName then return end
    local zoneId = GetBusinessZoneIndexByName(zoneName)
    local zone = Config.BusinessZones[zoneId]
    if not zone then return end
    for i=1, #zone.craftingTypes do 
        if zone.craftingTypes[i].name == craftingType then
            return zone.craftingTypes[i]
        end
    end
end