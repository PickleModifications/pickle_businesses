import { AspectRatio, Box, Button, Group, NumberInput, ScrollArea, SimpleGrid, Text } from "@mantine/core";
import { useState } from "react";
import { GetPriceString, Translate } from "../../App";
import { IconEdit, IconShoppingCartPlus, IconTrash } from "@tabler/icons-react";
import { UpdateListings, HasPermission } from "../Market";
import classes from "./Buy.module.css";
import { Modal } from "../modal/Modal";
import { useDisclosure } from "@mantine/hooks";

export type Item = {
    sku?: string;
    name: string;
    price?: number;
    quantity?: number;
    metadata?: any;
    listingType?: string; // "inventory" | "server" | "market" | "market-view" | "trade" 
}

function BuyEditModal({listing, opened, close} : {listing: Item, opened: boolean, close: () => void}) {
    if (!listing.sku) return null;
    return (
        <Modal title={Translate("market_buy_edit_title", listing.name, listing.sku)} opened={opened} close={close}>
            <Group gap={10} style={{ width: "100%", flexWrap: "nowrap"}}>
                <ItemDisplay style={{width: 100}} listing={{
                    sku: listing.sku,
                    name: listing.name,
                    price: listing.price,
                    quantity: listing.quantity,
                    metadata: listing.metadata,
                    listingType: "market-view" 
                }}/>
                <Group gap={0} style={{flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
                    <Group grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput label={Translate("market_buy_edit_price") + ":"} size="xs" defaultValue={listing.price} onChange={(value) => { console.log(value); }} />
                    </Group>
                    <Group pb={10} grow gap={0} style={{ width: "100%", flexWrap: "nowrap", justifyContent: "space-between" }}>
                        <NumberInput label={Translate("market_buy_edit_quantity") + ":"} size="xs" defaultValue={listing.quantity} onChange={(value) => { console.log(value); }} />
                    </Group>
                </Group>
            </Group>
            <Text fz={"xs"}>Note: You cannot stack items that have been damaged.</Text>
            <Text fz={"xs"}>If selling unique and/or damaged items, the quantity must be set to 1 to preserve the data.</Text>
            <Button style={{width: "100%", marginTop: 10}} onClick={close}>{Translate("market_buy_edit_save")}</Button>
        </Modal>
    );
}

function ItemDisplayInfo({listing, openEdit} : {listing: Item, openEdit?: () => void}) {
    return (
        <Group h={"100%"} style={{
            flexDirection: "row", 
            alignContent:"space-between", 
            backgroundImage: 'url("/item_placeholder.png")',
            backgroundSize: "65%",
            backgroundPositionX: "center",
            backgroundPositionY: "25%",
            backgroundRepeat: "no-repeat",
            justifyContent: "",
        }}>
            <Group gap={0} pl={5} mt={2}>
                <Text style={{textAlign: "left"}} fz={"xs"}>{GetPriceString(listing.price)}</Text>
            </Group>
            <Group w={"100%"} gap={0} style={{justifyContent: "flex-end"}}> 
                <Group pl={5} pb={2} pr={5} grow w={"100%"} gap={0} style={{flexWrap:"nowrap", justifyContent: "space-between"}}>
                    { (listing.listingType == "market" && HasPermission("items")) ? <Group gap={0}>
                        <IconEdit onClick={openEdit} style={{cursor: "pointer"}} size={15} color={"white"} />
                        <IconTrash style={{cursor: "pointer"}} size={15} color={"white"} />
                    </Group> : null }
                    <Text fz={"xs"} style={{textAlign: "right"}}>x{listing.quantity}</Text>
                </Group>
                <Group grow w={"100%"} style={{backgroundColor: "rgba(0, 0, 0, 0.25)"}}> 
                    <Text pl={4} pr={4} fz={"xs"} style={{ textOverflow: "ellipsis", textWrap:"nowrap", overflow: "hidden", textAlign: "center"}}>{listing.name}</Text>
                </Group>
            </Group>
        </Group>
    );
}

function ItemDisplay({listing, style} : {listing: Item, style?: any}) {
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
    if (listing.listingType == "market") { 
        if (!HasPermission("items")) {
            return (
                <Box pos={"relative"} className={classes["purchase-listing"]}>
                    <Group gap={0} className={classes["cart"]} style={{zIndex: 1, position: "absolute", width: "100%", height: "100%", justifyContent: "center"}}>
                        <IconShoppingCartPlus size={30} color={"white"} />
                    </Group>
                    <AspectRatio className={classes["item"]} ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)"}}>
                        <ItemDisplayInfo listing={listing} />
                    </AspectRatio>
                </Box>
            );
        } else {
            return (
                <Box pos={"relative"}>
                    <BuyEditModal listing={listing} opened={editOpened} close={closeEdit}>
                    </BuyEditModal>
                    <AspectRatio ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)", ...style}}>
                        <ItemDisplayInfo openEdit={openEdit} listing={listing} />
                    </AspectRatio>
                </Box>
            );
        }
    }
    else if (listing.listingType == "market-view") {
        return (
            <Box pos={"relative"}>
                <AspectRatio ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)", ...style}}>
                    <ItemDisplayInfo listing={listing} />
                </AspectRatio>
            </Box>
        );
    }
}

function Listings({currentListings} : {currentListings?: Item[]}) {
    const [listings, setListings] = useState<Item[]>(currentListings || []);
    window.addEventListener('message', (event) => {
        if (event.data.type === 'updateListings') {
            setListings(event.data.listings);
        }
    })
    return (
        <ScrollArea w={"100%"} style={{flex: 1}}>
            <SimpleGrid cols={5} p={20}>
                {listings.map((listing, listingIndex) => (
                    <ItemDisplay key={listingIndex} listing={{
                        sku: listing.sku,
                        name: listing.name,
                        price: listing.price,
                        quantity: listing.quantity,
                        metadata: listing.metadata,
                        listingType: "market"
                    }}/>
                ))}
            </SimpleGrid >
        </ScrollArea>
    );
}

function Cart() {
    return (
        <Group style={{flexDirection: "column", alignItems: "flex-start", borderLeft: "2px rgba(255, 255, 255, 0.1) solid", borderBottomRightRadius: 5}} p={10} grow w={"30%"} bg={"dark.8"}>
            Cart 
        </Group>
    );
}

export function Buy({currentListings} : {currentListings?: Item[]}) {
    return (
        <Group gap={0} style={{alignItems: "unset", width: "100%", height: "calc(100% - 56px)", flexWrap: "nowrap"}}>
            <Listings currentListings={currentListings}/>
            <Cart/>
        </Group>
    );
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'updateListings') {
        UpdateListings(event.data.listings);
    }
})