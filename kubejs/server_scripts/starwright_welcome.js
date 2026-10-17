// Starwright: hand every player the quest book once, on their first login to this world.
PlayerEvents.loggedIn(event => {
  const player = event.player
  const data = player.persistentData
  if (data.getBoolean('starwright_got_book')) return
  player.give('ftbquests:book')
  data.putBoolean('starwright_got_book', true)
  player.tell(Text.gold('Welcome to Starwright! ').append(Text.white('Open your Quest Book to begin. Build the engine. Chart the horizon. Leave the planet.')))
})
