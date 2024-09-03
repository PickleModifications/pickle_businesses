import { Button, Group, NumberInput, rem, ScrollArea, SimpleGrid, Text, TextInput } from "@mantine/core";
import { Item, Translate } from "../../App";
import { useState } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { HasPermission } from "../Market";
import { ItemDisplay } from "../buy/Buy";

export type ServerCurrency = {
    name: string,
    count: number
}

export type TradeListing = {
    sku?: string,
    give: {
        items: Item[],
        currencies: ServerCurrency[]
    },
    receive: {
        items: Item[],
        currencies: ServerCurrency[]
    },
}

function TradeAddListing() {
    return (
        <Group>
            <Button leftSection={<IconPlus style={{ width: rem(16), height: rem(16) }}  />} fullWidth size="xs" color="blue" style={{width: "100%", borderRadius: "5px"}}>
                {Translate("market_trade_add")}
            </Button>
        </Group>
    );
}

function TradeListing({listing} : {listing: TradeListing}) {
    return (
        <Group p={10} gap={10} style={{flexDirection: "column", alignItems: "center"}} bg={"dark.7"}>
            <Text fz={"sm"} fw={600}>{Translate("market_trade_give")}</Text>
            {/* <Text fz={"md"} fw={600}>{Translate("market_trade_sku", listing?.sku || "N/A")}</Text> */}
            <ScrollArea w={"100%"} pt={10} pb={10} style={{flex: 1}} bg={"dark.8"}>
                <Group pl={10} pr={10} gap={4} wrap="nowrap">
                    {
                        listing.give.items.map((item, itemIndex) => (
                            <ItemDisplay imageSize="50%" style={{width: 75}} listing={{...item, listingType: "trade"}} key={itemIndex}/>
                        ))
                    }
                </Group>
            </ScrollArea>
            <Text fz={"sm"} fw={600}>{Translate("market_trade_receive")}</Text>
            <ScrollArea w={"100%"} pt={10} pb={10} style={{flex: 1}} bg={"dark.8"}>
                <Group pl={10} pr={10} gap={4} wrap="nowrap">
                    {
                        listing.give.items.map((item, itemIndex) => (
                            <ItemDisplay imageSize="50%" style={{width: 75}} listing={{...item, listingType: "trade"}} key={itemIndex}/>
                        ))
                    }
                </Group>
            </ScrollArea>
            <Group w={"100%"} gap={0} wrap="nowrap">
                <Button fullWidth size="xs" color="blue" style={{width: "100%", borderRadius: "5px 0px 0px 5px"}}>{Translate("market_trade_accept")}</Button>   
                <NumberInput  size="xs" defaultValue={1} min={1} max={100} radius={"0px 5px 5px 0"} style={{width: 75}}/>
            </Group>
        </Group>
    );
}

function TradeListings({listings} : {listings: TradeListing[]}) {
    const [filter, setFilter] = useState<string>("");
    let filteredListings = listings.filter((listing) => {
        let match = false;
        listing.give.items.forEach((item) => {
            if (item.name.toLowerCase().includes(filter.toLowerCase())) {
                match = true;
            }
        });
        listing.give.currencies.forEach((currency) => {
            if (currency.name.toLowerCase().includes(filter.toLowerCase())) {
                match = true;
            }
        });
        listing.receive.items.forEach((item) => {
            if (item.name.toLowerCase().includes(filter.toLowerCase())) {
                match = true;
            }
        });
        listing.receive.currencies.forEach((currency) => {
            if (currency.name.toLowerCase().includes(filter.toLowerCase())) {
                match = true;
            }
        });
        return match;
    });

    return (
        <Group w={"100%"} gap={0} style={{flexDirection: "column"}}>
            <Group pl={20} pr={20} pt={10} pb={10} w={"100%"} style={{justifyContent: "space-between"}}>
                <Group>
                    <Text fz={"md"} fw={600}>{Translate("market_trade")}</Text>
                    <Text fz="xs" fw={400}>{Translate("market_search_results", filteredListings.length + "")}</Text>
                    {HasPermission("items") && <TradeAddListing/>}

                </Group>
                <TextInput onChange={(event) => setFilter(event.currentTarget.value)} size="xs" placeholder={Translate("market_trade_search")} leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />} />
            </Group>
            <ScrollArea w={"100%"} style={{flex: 1}}>
                <SimpleGrid cols={2} pl={20} pr={20} pb={20}>
                    {filteredListings.map((listing, listingIndex) => (
                        <TradeListing listing={listing} key={listingIndex}/>
                    ))}
                </SimpleGrid >
            </ScrollArea>
        </Group>
    );
}

export function Trade({currentListings} : {currentListings?: TradeListing[]}) {
    const [listings, setListings] = useState<TradeListing[]>(currentListings || []);
    return (
        <Group gap={0} style={{alignItems: "unset", width: "100%", height: "calc(100% - 56px)", flexWrap: "nowrap"}}>
            <TradeListings listings={listings}/>
        </Group>
    );
}