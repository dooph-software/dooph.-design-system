import { Sticker, StickerVariant, Avatar, AvatarSize, Table, TableHeaderCell, TableSortDirection } from "../../../../../../src";
export const a = <Sticker variant={StickerVariant.custom}>x</Sticker>;            // expect error: color required
export const b = <Sticker variant={StickerVariant.prominent} color="red">x</Sticker>; // expect error: color never
export const c = <Sticker variant={StickerVariant.custom} color="prominent-color">x</Sticker>; // ok
export const d = <Avatar size={AvatarSize.small} />; // ok
export const e = <Table><div /></Table>; // expect error: columns required
export const f = <TableHeaderCell sortDirection={TableSortDirection.none} onSort={() => {}}>x</TableHeaderCell>; // ok
