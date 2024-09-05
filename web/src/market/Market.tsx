import { Text, Menu, Group, Center, Burger, Container } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import classes from "./Market.module.css";
import { createContext, useContext, useState } from "react";

import { Buy } from "./buy/Buy";    
import { Trade, TradeListing } from "./trade/Trade";
import { Manage } from "./manage/Manage";
import { Translate, Item } from "../App";
import { useNuiEvent } from "../nui/useNui";

export const CURRENCY_ITEMS = [
  {
    label_locale: "market_cash",
    name: "cash",
    image: `assets/images/cash.png`,
  },
  {
    label_locale: "market_card",
    name: "card",
    image: `assets/images/card.png`,
  },
  {
    label_locale: "market_dirtycash",
    name: "dirtycash",
    image: `assets/images/dirtycash.png`,
  },
]

type Link = {
    active?: boolean;
    link: string;
    label: string;
    links?: Link[];
}

export type MarketData = {
  listings?: Item[],
  trades?: TradeListing[],
  inventory?: Item[],
  items: Item[],
  allowedItems?: string[],
  allowedCurrencies?: string[],
  cart?: Item[]
}

interface MarketDataContextType {
  marketData: MarketData;
}

export const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export function GetMaxCount(item: Item) {
  const context = useContext(MarketDataContext);
  if (!context) { 
    return null;
  }
  const { marketData } = context;
  if (!marketData || !marketData.inventory || marketData.inventory.length == 0) {
      return null;
  }
  let inventory = marketData.inventory;
  let count = 0;
  let items = [];
  let name = item.name;
  if ((item.durability || 100) < 100) {
    return {count: item.count, itemIndexes: [-1]};
  }
  for (let i=0; i<inventory.length; i++) {
    if (inventory[i].name == name && (inventory[i].durability || 100) >= 100) {
      count += inventory[i].count || 1;
      items.push(i);
    }
  }
  return {count: count, itemIndexes: items};
}

export function IsItemAllowed(item: Item) {
  const context = useContext(MarketDataContext);
  if (!context) { 
    return false;
  }
  const { marketData } = context;
  if (item.isCurrency) {
    if (!marketData || !marketData.allowedCurrencies || marketData.allowedCurrencies.length == 0) {
      return true;
    }
    return marketData.allowedCurrencies.includes(item.name);
  }
  else {
    if (!marketData || !marketData.allowedItems || marketData.allowedItems.length == 0) {
      return true;
    }
    return marketData.allowedItems.includes(item.name);
  }
}

export function GetItemLabel(item: Item) {
  let invalidLabel = "NBL: " + item.name;
  const context = useContext(MarketDataContext);
  if (!context) { 
    return invalidLabel;
  }
  const { marketData } = context;
  if (item.isCurrency) {
    for (let i=0; i<CURRENCY_ITEMS.length; i++) {
      if (CURRENCY_ITEMS[i].name == item.name) {
        return Translate(CURRENCY_ITEMS[i].label_locale);
      }
    }
    return invalidLabel;
  }
  if (!marketData || !marketData.items || marketData.items.length == 0) {
    return invalidLabel;
  }
  for (let i=0; i<marketData.items.length; i++) {
    if (marketData.items[i].name == item.name) {
      return marketData.items[i].label;
    }
  }
  return invalidLabel;
}

function HeaderMenu({title, setPage, links} : {setPage: (pageId: string) => void, title: string, links: Link[]}) {
  const [opened, { toggle }] = useDisclosure(false);

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>{item.label}</Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
          <Menu.Target>
            <a
              href={link.link}
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size="0.9rem" stroke={1.5} />
              </Center>
            </a>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <a
        key={link.label}
        href={link.link}
        className={link.active ? classes["link-selected"] : classes.link}
        onClick={(event) => {
            event.preventDefault()
            setPage(link.link)
        }}
      >
        {link.label}
      </a>
    );
  });

  return (
    <header className={classes.header}>
      <Container size="md">
        <div className={classes.inner}>
            <Text fw={600} fz={"md"}>{title}</Text>
            <Group gap={5} visibleFrom="sm">
                {items}
            </Group>
            <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
        </div>
      </Container>
    </header>
  );
}

export function HasPermission(permission: string) {
  if (permission == "items") {
    return true;
  }
  return false;
}

export function Market() {
  const [page, setPage] = useState("trade");
  const [marketData, setMarketData] = useState<MarketData>({listings: [], trades: [], inventory: [], items: []});
  const [opened, setOpened] = useState(false);
  useNuiEvent("openMarket", (data: any) => {
    setMarketData(data.marketData);
    setOpened(true);
  });
  useNuiEvent("updateListings", (data: any) => {
    marketData.listings = data.listings;
  });
  return (opened ? (
    <Group style={{position: "relative", flexDirection: "column", flexWrap: "nowrap", borderRadius: 5}} gap={0} w={900} h={550} bg={"dark.8"}>
      <HeaderMenu title={"Pickle's Shopping Center"} setPage={setPage} links={[
        { active: (page == "buy"), link: 'buy', label: Translate("market_buy") },
        { active: (page == "trade"), link: 'trade', label: Translate("market_trade") },
        { active: (page == "manage"), link: 'manage', label: Translate("market_manage") },
      ]}/>
      <MarketDataContext.Provider value={{marketData: marketData}}>
        {page == "buy" && <Buy/>}
        {page == "trade" && <Trade/>}
        {page == "manage" && <Manage/>}
      </MarketDataContext.Provider>
      <div id="market-modal-container" className={classes["modal-container"]}></div>
    </Group>
  ) : null);
}