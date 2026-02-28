import { assertEquals, assertThrows } from "@std/assert";
import {
	ChestFlags,
	CollectibleFlags,
	PermanentSceneFlags,
	RoomClearFlags,
	SwitchFlags,
	UnusedFlags,
	VisitedFloorsFlags,
	VisitedRoomsFlags,
} from "./permanentsceneflags.ts";

interface SubclassSpec {
	name: string;
	create: (flags?: Uint32Array) => {
		data: Uint32Array;
		getFlag(index: number): boolean;
		setFlag(index: number, value: boolean): void;
	};
}

const subclassSpecs: SubclassSpec[] = [
	{ name: "ChestFlags", create: (flags?: Uint32Array) => new ChestFlags(flags) },
	{
		name: "SwitchFlags",
		create: (flags?: Uint32Array) => new SwitchFlags(flags),
	},
	{
		name: "RoomClearFlags",
		create: (flags?: Uint32Array) => new RoomClearFlags(flags),
	},
	{
		name: "CollectibleFlags",
		create: (flags?: Uint32Array) => new CollectibleFlags(flags),
	},
	{ name: "UnusedFlags", create: (flags?: Uint32Array) => new UnusedFlags(flags) },
	{
		name: "VisitedRoomsFlags",
		create: (flags?: Uint32Array) => new VisitedRoomsFlags(flags),
	},
	{
		name: "VisitedFloorsFlags",
		create: (flags?: Uint32Array) => new VisitedFloorsFlags(flags),
	},
];

for (const spec of subclassSpecs) {
	Deno.test(`${spec.name}: default constructor initializes one 32-bit word to zero`, () => {
		const flags = spec.create();
		assertEquals(flags.data.length, 1);
		assertEquals(flags.data[0], 0);
	});

	Deno.test(`${spec.name}: constructor roundtrip preserves data`, () => {
		const input = new Uint32Array([0xA5A5_A5A5]);
		const flags = spec.create(input);
		assertEquals(flags.data, input);
	});

	Deno.test(`${spec.name}: constructor rejects arrays smaller than one word`, () => {
		assertThrows(() => spec.create(new Uint32Array(0)));
	});

	Deno.test(`${spec.name}: reads true when bit is set`, () => {
		const input = new Uint32Array([1 << 7]);
		const flags = spec.create(input);
		assertEquals(flags.getFlag(7), true);
	});

	Deno.test(`${spec.name}: reads false when bit is not set`, () => {
		const flags = spec.create();
		assertEquals(flags.getFlag(7), false);
	});

	Deno.test(`${spec.name}: setter toggles a bit on and off`, () => {
		const flags = spec.create();
		flags.setFlag(12, true);
		assertEquals(flags.getFlag(12), true);
		flags.setFlag(12, false);
		assertEquals(flags.getFlag(12), false);
	});

	Deno.test(`${spec.name}: supports highest valid bit index`, () => {
		const flags = spec.create();
		flags.setFlag(31, true);
		assertEquals(flags.getFlag(31), true);
	});

	Deno.test(`${spec.name}: getFlag throws for negative index`, () => {
		const flags = spec.create();
		assertThrows(() => flags.getFlag(-1));
	});

	Deno.test(`${spec.name}: getFlag throws for index greater than 31`, () => {
		const flags = spec.create();
		assertThrows(() => flags.getFlag(32));
	});

	Deno.test(`${spec.name}: setFlag throws for negative index`, () => {
		const flags = spec.create();
		assertThrows(() => flags.setFlag(-1, true));
	});

	Deno.test(`${spec.name}: setFlag throws for index greater than 31`, () => {
		const flags = spec.create();
		assertThrows(() => flags.setFlag(32, true));
	});

	Deno.test(`${spec.name}: getFlag throws for non-integer index`, () => {
		const flags = spec.create();
		assertThrows(() => flags.getFlag(1.5));
	});

	Deno.test(`${spec.name}: setFlag throws for non-integer index`, () => {
		const flags = spec.create();
		assertThrows(() => flags.setFlag(2.25, true));
	});

	Deno.test(`${spec.name}: data getter returns a copy`, () => {
		const flags = spec.create();
		flags.setFlag(0, true);

		const snapshot = flags.data;
		snapshot[0] = 0;

		assertEquals(flags.getFlag(0), true);
	});
}

Deno.test({
	name: "PermanentSceneFlags: data property roundtrip preserves data",
	fn() {
		const input = new Uint32Array([0xDEAD_BEEF]);
		const flags: PermanentSceneFlags = {
			chestFlags: new ChestFlags(input),
			switches: new SwitchFlags(input),
			roomClearFlags: new RoomClearFlags(input),
			collectibleFlags: new CollectibleFlags(input),
			unused: new UnusedFlags(input),
			visitedRooms: new VisitedRoomsFlags(input),
			visitedFloors: new VisitedFloorsFlags(input),
		};
		assertEquals(flags.chestFlags.data, input);
		assertEquals(flags.switches.data, input);
		assertEquals(flags.roomClearFlags.data, input);
		assertEquals(flags.collectibleFlags.data, input);
		assertEquals(flags.unused.data, input);
		assertEquals(flags.visitedRooms.data, input);
		assertEquals(flags.visitedFloors.data, input);
	},
});
