// Starwright progression hooks that the quest book relies on.
// Stages are granted by FTB Quests stage rewards (FTB XMod Compat -> KubeJS player stages), one claim per player.

// ---------------------------------------------------------------- recipes
ServerEvents.recipes(event => {
  // Dimensional Drive (Create: Northstar Aeronautics Bridge 1.0.0): its own recipe needs northstar:computer_chip,
  // which does not exist in Northstar 0.6.6, so the drive was uncraftable. Rebuilt as a Mars-tier recipe.
  event.remove({ output: 'cnbridge:dimensional_drive' })
  event.shaped('cnbridge:dimensional_drive', ['SPS', 'PCP', 'SPS'], {
    S: 'northstar:martian_steel_ingot',
    P: 'northstar:hardened_precision_mechanism',
    C: 'northstar:targeting_computer',
  }).id('starwright:dimensional_drive')

  // Explorer's Compass: mid-game, needs the Explorer's Licence (returned after crafting).
  event.remove({ id: 'explorerscompass:explorers_compass' })
  event.shaped('explorerscompass:explorerscompass', [' W ', 'SCS', ' L '], {
    W: 'minecraft:cobweb',
    S: 'minecraft:cracked_stone_bricks',
    C: 'minecraft:compass',
    L: 'kubejs:explorer_licence',
  }).id('starwright:explorers_compass')

  // Icarus wings: the base recipes use #icarus:wings_base (= elytra, End tier). At the Airwrights stage the
  // Wingwright's Licence takes the elytra's place instead (and comes back after crafting). Dye recipes are untouched.
  event.replaceInput({ mod: 'icarus' }, '#icarus:wings_base', 'kubejs:wingwright_licence')

  // Immersive Aircraft: engines need a Create Precision Mechanism, hulls and propellers need Create iron sheets,
  // so the biplane arrives in the Brass Age (Airwrights: "Take to the Skies").
  event.replaceInput({ output: 'immersive_aircraft:engine' }, 'minecraft:piston', 'create:precision_mechanism')
  event.replaceInput({ output: 'immersive_aircraft:hull' }, 'minecraft:iron_ingot', 'create:iron_sheet')
  event.replaceInput({ output: 'immersive_aircraft:propeller' }, 'minecraft:iron_ingot', 'create:iron_sheet')

  // Mekanism Steel Casing: the osmium core becomes a Create Precision Mechanism (Electro-Chemistry: "The Perfect Foundation").
  event.replaceInput({ id: 'mekanism:steel_casing' }, '#c:ingots/osmium', 'create:precision_mechanism')

  // AE2 Inscriber: Precision Mechanism instead of the piston, steel instead of iron (The Network: "The Inscriber").
  event.replaceInput({ id: 'ae2:network/blocks/inscribers' }, 'minecraft:piston', 'create:precision_mechanism')
  event.replaceInput({ id: 'ae2:network/blocks/inscribers' }, '#c:ingots/iron', '#c:ingots/steel')

  // Mekanism Jetpack: the bottom tin becomes an Aeronautics propeller, so hydrogen flight follows your first ship
  // (Airwrights: "Hydrogen Flight"). Kept as Mekanism's own mek_data recipe so tank contents carry over.
  event.remove({ id: 'mekanism:jetpack' })
  event.custom({
    type: 'mekanism:mek_data',
    category: 'misc',
    key: {
      C: { tag: 'c:circuits/basic' }, I: { tag: 'c:ingots/tin' }, S: { tag: 'c:ingots/steel' },
      T: { item: 'mekanism:basic_chemical_tank' }, P: { item: 'aeronautics:andesite_propeller' },
    },
    pattern: ['SCS', 'ITI', ' P '],
    result: { count: 1, id: 'mekanism:jetpack' },
  }).id('starwright:jetpack')

  // Waystones are built through Create (Create: Waystones Recipes); drop the plain crafting-table route.
  event.remove({ output: 'waystones:waystone', type: 'minecraft:crafting_shaped' })

  // Applied Create: Stress Storage Cells are switched off (banking Create stress inside ME skips the power ladder).
  // With no cells, the ME Gearbox has no stored stress to export either (The Network: "Applied Create joins the works").
  for (const size of ['1k', '4k', '16k', '64k', '256k', '1m', '4m', '16m', '64m', '256m'])
    event.remove({ output: `appliedcreate:stress_storage_cell_${size}` })
})

// FTB Ultimine never fires on a wrench or hammer swing: a wrench with Ultimine deletes whole blocks without drops
// (Steel & Sparks: "HAMMAH!").
ServerEvents.tags('item', event => {
  event.add('ftbultimine:excluded_tools', ['create:wrench', 'mekanism:configurator', 'immersiveengineering:hammer'])
})

// ---------------------------------------------------------------- Server rules
// Separate Sable Render Distance: no player-driven chunk force-loading (server performance; claims still protect ships).
ServerEvents.loaded(event => {
  event.server.runCommandSilent('gamerule ssrdForceloadLimit 0')
})

// ---------------------------------------------------------------- World Tiers (Apotheosis)
// Each boss rung grants a stage; the stage unlocks the matching Apotheosis World Tier advancement for that player,
// after which the tier can be chosen in Apotheosis' World Tier screen.
const SW_TIERS = { sw_frontier: 'frontier', sw_ascent: 'ascent', sw_summit: 'summit', sw_pinnacle: 'pinnacle' }

PlayerEvents.stageAdded(event => {
  const tier = SW_TIERS[event.stage]
  if (tier) {
    event.player.server.runCommandSilent(`advancement grant ${event.player.username} only apotheosis:progression/${tier}`)
    event.player.tell(Text.gold('World Tier unlocked: ').append(Text.white(tier.charAt(0).toUpperCase() + tier.substring(1))))
  }
  if (event.stage === 'sw_summit') event.player.tell(Text.lightPurple('The End portal frames will now accept your Eyes of Ender.'))
  if (event.stage === 'sw_interplanetary') event.player.tell(Text.aqua('Mekanism teleporters can now reach the planets.'))
})

// ---------------------------------------------------------------- The End stays sealed until Summit
BlockEvents.rightClicked('minecraft:end_portal_frame', event => {
  if (event.item.id !== 'minecraft:ender_eye') return
  if (event.player.stages.has('sw_summit')) return
  event.player.setStatusMessage(Text.red('The frame rejects the eye. Reach the Summit World Tier first (Bosses & Tiers).'))
  event.cancel()
})

// ---------------------------------------------------------------- Planets: rockets first, teleporters after Mars
NativeEvents.onEvent(Java.loadClass('mekanism.api.event.MekanismTeleportEvent$GlobalTeleport'), event => {
  if (!event.isTransDimensional()) return
  const entity = event.getEntity()
  const from = String(entity.level().dimension().location())
  const to = String(event.getTargetDimension().location())
  if (!from.startsWith('northstar:') && !to.startsWith('northstar:')) return
  if (entity.isPlayer() && entity.stages.has('sw_interplanetary')) return
  event.setCanceled(true)
  if (entity.isPlayer()) entity.setStatusMessage(Text.red('Interplanetary teleport is locked until the Red Planet quest "Interplanetary Network".'))
})
