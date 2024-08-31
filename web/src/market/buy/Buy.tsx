import { AspectRatio, Box, Container, Grid, Group, Overlay, Portal, rem, ScrollArea, SimpleGrid, Text, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { GetPriceString } from "../../App";
import { IconEdit, IconShoppingCart, IconShoppingCartPlus, IconTrash } from "@tabler/icons-react";
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
    isPurchaseListing?: boolean;
}

function ItemDisplay({listing, style} : {listing: Item, style?: any}) {
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
    if (listing.isPurchaseListing && !HasPermission("items")) {
        return (
            <Box className={classes["purchase-listing"]}>
                <Group gap={0} className={classes["cart"]} style={{zIndex: 1, position: "absolute", width: "100%", height: "100%", justifyContent: "center"}}>
                    <IconShoppingCartPlus size={30} color={"white"} />
                </Group>
                <AspectRatio className={classes["item"]} ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)"}}>
                    <Group h={"100%"} style={{
                        flexDirection: "row", 
                        alignContent:"space-between", 
                        backgroundImage: 'url("/item_placeholder.png")',
                        backgroundSize: "65%",
                        backgroundPositionX: "center",
                        backgroundPositionY: "35%",
                        backgroundRepeat: "no-repeat",
                        justifyContent: "",
                        }}>
                        <Group gap={0} pl={5} mt={2}>
                            <Text style={{textAlign: "left"}} fz={"xs"}>{GetPriceString(listing.price)}</Text>
                        </Group>
                        <Group w={"100%"} gap={0} style={{justifyContent: "flex-end"}}> 
                            <Group pl={5} pb={2} pr={5} grow w={"100%"} gap={0} style={{flexWrap:"nowrap", justifyContent: "space-between"}}>
                                <Text fz={"xs"} style={{textAlign: "right"}}>x{listing.quantity}</Text>
                            </Group>
                            <Group grow w={"100%"} style={{backgroundColor: "rgba(0, 0, 0, 0.25)"}}> 
                                <Text fz={"xs"} style={{textAlign: "center"}}>{listing.name}</Text>
                            </Group>
                        </Group>
                    </Group>
                </AspectRatio>
            </Box>
        );
    }
    return (
        <Box>
            <Modal opened={editOpened} close={closeEdit}>
                <div>Your modal content</div>
            </Modal>
            <AspectRatio ratio={1} style={{position: "relative", backgroundColor: "rgba(0, 0, 0, 0.25)", ...style}}>
                <Group h={"100%"} style={{
                    flexDirection: "row", 
                    alignContent:"space-between", 
                    backgroundImage: 'url("/item_placeholder.png")',
                    backgroundSize: "65%",
                    backgroundPositionX: "center",
                    backgroundPositionY: "35%",
                    backgroundRepeat: "no-repeat",
                    justifyContent: "",
                    }}>
                    <Group gap={0} pl={5} mt={2}>
                        <Text style={{textAlign: "left"}} fz={"xs"}>{GetPriceString(listing.price)}</Text>
                    </Group>
                    <Group w={"100%"} gap={0} style={{justifyContent: "flex-end"}}> 
                        <Group pl={5} pb={2} pr={5} grow w={"100%"} gap={0} style={{flexWrap:"nowrap", justifyContent: "space-between"}}>
                            { HasPermission("items") ? <Group gap={0}>
                                <IconEdit onClick={openEdit} style={{cursor: "pointer"}} size={15} color={"white"} />
                                <IconTrash style={{cursor: "pointer"}} size={15} color={"white"} />
                            </Group> : null }
                            <Text fz={"xs"} style={{textAlign: "right"}}>x{listing.quantity}</Text>
                        </Group>
                        <Group grow w={"100%"} style={{backgroundColor: "rgba(0, 0, 0, 0.25)"}}> 
                            <Text fz={"xs"} style={{textAlign: "center"}}>{listing.name}</Text>
                        </Group>
                    </Group>
                </Group>
            </AspectRatio>
        </Box>
    );
}

function Listings({currentListings} : {currentListings?: Item[]}) {
    const theme = useMantineTheme();
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
                        isPurchaseListing: true
                    }}/>
                ))}
            </SimpleGrid >
        </ScrollArea>
    );
}

function Cart() {
    return (
        <Group style={{flexDirection: "column", alignItems: "flex-start"}} p={10} grow w={"30%"} bg={"dark.7"}>
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