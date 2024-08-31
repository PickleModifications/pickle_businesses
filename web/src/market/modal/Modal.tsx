import { Group, Portal } from "@mantine/core";

export function Modal({children, opened, close} : {children: any, opened: boolean, close: () => void}) {
    return (
        <Portal target={"#market-modal-container"}>
            <Group w={"100%"} h={"100%"} style={{ display: (opened ? "flex" : "none"), backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
                {children}
            </Group>
        </Portal>
    );
}