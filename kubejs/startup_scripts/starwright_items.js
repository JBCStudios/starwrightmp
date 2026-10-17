// Starwright: quest-granted licences. Each one is a reusable key: it sits in the recipe and comes back after crafting
// (containerItem = itself). Startup scripts must be identical on client and server.
StartupEvents.registry('item', event => {
  // Granted by the Trailblazers quest "Explorer's Licence" (stage sw_explorer). Needed to craft an Explorer's Compass.
  event.create('explorer_licence')
    .displayName(Text.of("Explorer's Licence"))
    .unstackable()
    .containerItem('kubejs:explorer_licence')

  // Granted by the Airwrights quest "First Airship" (stage sw_airwright). Replaces the elytra in Icarus wing recipes.
  event.create('wingwright_licence')
    .displayName(Text.of("Wingwright's Licence"))
    .unstackable()
    .containerItem('kubejs:wingwright_licence')

  // The Contractors' Guild currency: paid by every contract, spent on Contractor Ranks and at the Guild Exchange.
  event.create('contract_seal')
    .displayName(Text.of('Contract Seal'))
})
