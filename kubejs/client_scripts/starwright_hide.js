// Hide disabled items from EMI.
RecipeViewerEvents.removeEntries('item', event => {
  event.remove('createdieselgenerators:huge_diesel_engine')
  for (const size of ['1k', '4k', '16k', '64k', '256k', '1m', '4m', '16m', '64m', '256m'])
    event.remove(`appliedcreate:stress_storage_cell_${size}`)
})
