// Starwright stability fixes (test build 0.2.4). See the plan's compatibility section for sources.

ServerEvents.tags('block', event => {
  // Steam 'n' Rails 0.3.0-beta.2: snow/moss casings on curved track break track-graph sync and kick everyone.
  event.add('railways:track_casing_blacklist', ['minecraft:snow', 'minecraft:moss_carpet'])
  // Diesel Generators 1.3.15: Bulk Fermenter NPEs / corrupts when re-plotted onto Sable airships. Keep it ground-only.
  event.add('simulated:non_movable', 'createdieselgenerators:bulk_fermenter')
  event.add('create:non_movable', 'createdieselgenerators:bulk_fermenter')
})

ServerEvents.tags('worldgen/biome', event => {
  // Northstar tags Mars Peaks as snowy/mountain, so overworld igloos and huts could spawn on Mars.
  event.remove('c:is_snowy', 'northstar:martian_peaks')
  event.remove('c:is_mountain', 'northstar:martian_peaks')
  event.remove('c:is_mountain/peak', 'northstar:martian_peaks')
})

ServerEvents.recipes(event => {
  // Diesel Generators: the Huge Diesel Engine renderer crashes clients (DG #396). Regular and large engines are fine.
  event.remove({ output: 'createdieselgenerators:huge_diesel_engine' })
})

BlockEvents.placed('createdieselgenerators:huge_diesel_engine', event => {
  event.cancel()
})
