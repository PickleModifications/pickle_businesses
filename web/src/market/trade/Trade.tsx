import { AspectRatio, Box, Button, Group, NumberInput, rem, ScrollArea, SimpleGrid, Text, TextInput } from "@mantine/core";
import { Item, Translate } from "../../App";
import { useContext, useState } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { CURRENCY_ITEMS, HasPermission, IsItemAllowed, MarketDataContext } from "../Market";
import { ItemDisplay } from "../buy/Buy";
import { Modal } from "../modal/Modal";
import { useDisclosure } from "@mantine/hooks";

export type TradeListing = {
    sku?: string,
    give: {
        items: Item[],
        currencies: Item[]
    },
    receive: {
        items: Item[],
        currencies: Item[]
    },
}

export type TradeListingState = {
    mode: string,
    addData?: {
        tradeSection: string
    },
}

function TradeListingSelect({tradeSection, selected} : {tradeSection: string, selected: (item: Item) => void}) {
    const [count, setCount] = useState<number>(1);
    const [item, setItem] = useState<Item | null>(null);
    const context = useContext(MarketDataContext);
    if (!context) return (<></>);
    const { marketData } = context;
    let children = (<></>);
    if (!item) {
        children = (
            <Group gap={10} style={{flexDirection: "column", alignItems: "flex-start"}}>
                <Text fz={"sm"} fw={600}>{Translate("market_trade_select_"+tradeSection)}</Text>
                <ScrollArea h={400} w={600} bg={"dark.8"}>
                    <SimpleGrid cols={5} p={20}>
                        {CURRENCY_ITEMS.filter((item) => (IsItemAllowed({...item, isCurrency: true}))).map((item, itemId) => (
                            <ItemDisplay onClick={() => setItem({name: item.name, count: 1})} style={{cursor: "pointer"}} key={itemId} listing={{
                                name: item.name,
                                isCurrency: true,
                                listingType: "market-view"
                            }}/>
                        ))}
                        {marketData.items.filter((item) => (IsItemAllowed(item))).map((item, itemId) => (
                            <ItemDisplay onClick={() => setItem({name: item.name, count: 1})} style={{cursor: "pointer"}} key={itemId} listing={{
                                name: item.name,
                                listingType: "market-view"
                            }}/>
                        ))}
                    </SimpleGrid >
                </ScrollArea>
            </Group>
        );
    }
    else {
        children = (
            <Group gap={0} w={"100%"} align="flex-start" style={{flexDirection: "column"}}>
                <Group gap={10} style={{ width: "100%", flexWrap: "nowrap"}}>
                    <ItemDisplay onClick={() => setItem(null)} style={{width: 100, cursor: "pointer"}} listing={{
                        name: item.name,
                        listingType: "market-view"
                    }}/>
                    <Group gap={0} style={{flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
                        <Group pb={10} grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                            <NumberInput clampBehavior="strict" min={1} allowDecimal={false} label={Translate("market_buy_edit_count") + ":"} size="xs" value={count} onChange={(value) => { setCount(Number(value)); }} />
                        </Group>
                    </Group>
                </Group>
                <Button style={{width: "100%", marginTop: 10}} onClick={() => selected({name: item.name, count: count})}>{Translate("market_trade_add_"+tradeSection)}</Button>
            </Group>
        )
    }
    return children;
}

function TradeAddListing() {
    const [opened, { open, close }] = useDisclosure(true);
    const [listing, setListing] = useState<TradeListing>({give: {items: [], currencies: []}, receive: {items: [], currencies: []}});
    const [listingState, setListingState] = useState<TradeListingState>({mode: "view-trade"});
    let children = (<></>);
    if (listingState.mode === "view-trade") {
        children = (
            <TradeListingDisplay listing={listing} addListing={(tradeSection) => {
                setListingState({mode: "add-requirement", addData: {tradeSection: tradeSection}});
            }}/>
        );
    }
    else if (listingState.mode === "add-requirement") {
        children = (
            <TradeListingSelect tradeSection={listingState.addData?.tradeSection || ""} selected={(item) => {
                if (listingState.addData === undefined) {
                    setListingState({mode: "view-trade"});
                    return;
                };
                if (listingState.addData.tradeSection === "give" || listingState.addData.tradeSection === "receive") {
                    let existingIndex = -1;
                    for (let i=0; i<listing[listingState.addData.tradeSection].items.length; i++) {
                        if (listing[listingState.addData.tradeSection].items[i].name === item.name) {
                            existingIndex = i;
                            break
                        }
                    }
                    if (existingIndex >= 0 && listing[listingState.addData.tradeSection].items[existingIndex]) {
                        listing[listingState.addData.tradeSection].items[existingIndex].count = (listing[listingState.addData.tradeSection].items[existingIndex].count || 1) + (item.count || 0);
                    }
                    else {
                        listing[listingState.addData.tradeSection].items.push(item);
                    }
                }
                else {
                    setListingState({mode: "view-trade"});
                    return;
                }
                setListing(listing);
                setListingState({mode: "view-trade"});
            }} />
        );
    }
    return (
        <>
            <Group>
                <Button onClick={open} leftSection={<IconPlus style={{ width: rem(16), height: rem(16) }}  />} fullWidth size="xs" color="blue" style={{width: "100%", borderRadius: "5px"}}>
                    {Translate("market_trade_add")}
                </Button>
            </Group>
            <Modal title={Translate("market_trade_add")} opened={opened} close={close}>
                <Group p={10} gap={10} style={{flexDirection: "column", alignItems: "center"}} bg={"dark.7"}>
                    {children}
                </Group>
            </Modal>
        </>
    );
}

function TradeListingDisplay({listing, addListing} : {listing: TradeListing, addListing?: (tradeSection: string) => void}) {
    return (
        <>
            <Text fz={"sm"} fw={600}>{Translate("market_trade_give")}</Text>
            {/* <Text fz={"md"} fw={600}>{Translate("market_trade_sku", listing?.sku || "N/A")}</Text> */}
            <ScrollArea w={"100%"} pt={10} pb={10} style={{flex: 1}} bg={"dark.8"}>
                <Group pl={10} pr={10} gap={4} wrap="nowrap">
                    {addListing && (
                        <Box w={75} pos="relative">
                            <AspectRatio onClick={() => addListing("give")} ratio={1} style={{cursor: "pointer", position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)"}}>
                                <Group justify="center">
                                    <IconPlus size={35} color={"white"} />
                                </Group>
                            </AspectRatio>
                        </Box>
                    )}
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
                {addListing && (
                        <Box w={75} pos="relative">
                            <AspectRatio onClick={() => addListing("receive")} ratio={1} style={{cursor: "pointer", position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)"}}>
                                <Group justify="center">
                                    <IconPlus size={35} color={"white"} />
                                </Group>
                            </AspectRatio>
                        </Box>
                    )}
                    {
                        listing.receive.items.map((item, itemIndex) => (
                            <ItemDisplay imageSize="50%" style={{width: 75}} listing={{...item, listingType: "trade"}} key={itemIndex}/>
                        ))
                    }
                </Group>
            </ScrollArea>
        </>
    );
}

function TradeListing({listing} : {listing: TradeListing}) {
    return (
        <Group p={10} gap={10} style={{flexDirection: "column", alignItems: "center"}} bg={"dark.7"}>
            <TradeListingDisplay listing={listing}/>
            {!HasPermission("items") ? (
                <Group w={"100%"} gap={0} wrap="nowrap">
                    <Button fullWidth size="xs" color="blue" style={{width: "100%", borderRadius: "5px 0px 0px 5px"}}>{Translate("market_trade_accept")}</Button>   
                    <NumberInput  size="xs" defaultValue={1} min={1} max={100} radius={"0px 5px 5px 0"} style={{width: 75}}/>
                </Group>
            ) : (
                <Group w={"100%"} gap={10} wrap="nowrap">
                    <Button fullWidth size="xs" color="blue" style={{width: "100%", borderRadius: "5px"}}>{Translate("market_trade_manage")}</Button>
                    <Button fullWidth size="xs" color="red" style={{width: "100%", borderRadius: "5px"}}>{Translate("market_trade_delete")}</Button>
                </Group>
            )}
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

export function Trade() {
    const context = useContext(MarketDataContext);
    if (!context) { return (<></>); }
    const { marketData } = context;
    const [listings, setListings] = useState<TradeListing[]>(marketData.trades || []);
    return (
        <Group gap={0} style={{alignItems: "unset", width: "100%", height: "calc(100% - 56px)", flexWrap: "nowrap"}}>
            <TradeListings listings={listings}/>
        </Group>
    );
}