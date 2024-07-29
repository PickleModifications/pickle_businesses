function GetBusinessZoneIndexByName(zoneName)
    for i=1, #Config.BusinessZones do 
        if Config.BusinessZones[i].name == zoneName then
            return i, Config.BusinessZones[i]
        end
    end
end

function Customize_GetBusinessZoneNameByIndex(index)
    return Config.BusinessZones[index].name
end

function Customize_GetBusinessZones(isMenuQuery)
    local zones = {}
    if isMenuQuery then
        for i=1, #Config.BusinessZones do
            zones[#zones + 1] = Config.BusinessZones[i].label
        end
    else
        zones = Config.BusinessZones
    end
    return zones
end