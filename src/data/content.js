// All site copy lives here. Scripture is quoted from the King James Version (public domain).

// Each chapter is a full-screen "world" with its own background, its own 3D relic and a giant word.
// world: night | gold | crimson | air      stage: where the relic stands (left | right | off)
// relic: which 3D object to show; drop public/models/<relic>.glb to replace the built-in one.
export const chapters = [
  {
    id: 'birth', world: 'night', stage: 'right', side: 'left', relic: 'birth', numeral: 'I',
    label: 'I · The birth', title: ['The', 'Birth.'], cat: 'Bethlehem of Judaea',
    body: 'Born in a borrowed stable and laid in a manger, announced by angels to shepherds keeping watch by night. God came near, not in power but as a child.',
    moments: [['Annunciation', 'Nazareth'], ['Nativity', 'Bethlehem'], ['The Magi', 'A star in the east']],
    verse: { text: 'For unto you is born this day in the city of David a Saviour, which is Christ the Lord.', ref: 'Luke 2:11' },
    mega: 'Born', megaSize: '27vw',
  },
  {
    id: 'life', world: 'gold', stage: 'left', side: 'right', relic: 'life', numeral: 'II',
    label: 'II · The life', title: ['The', 'Life.'], cat: 'Galilee · Judaea · Jerusalem',
    body: 'He healed the sick, fed the multitudes, touched the untouchable and welcomed sinners to His table. He taught with authority, and the wind and the waves obeyed Him.',
    moments: [['Baptism', 'The Jordan'], ['Miracles', 'Cana to Bethany'], ['The Sermon', 'On the mount']],
    verse: { text: 'I am come that they might have life, and that they might have it more abundantly.', ref: 'John 10:10' },
    mega: 'Lived', megaSize: '25vw',
  },
  {
    id: 'death', world: 'crimson', stage: 'right', side: 'left', relic: 'death', numeral: 'III',
    label: 'III · The death', title: ['The', 'Cross.'], cat: 'Golgotha · The place of a skull',
    body: 'Betrayed, beaten and crucified between two thieves, He carried the sin of the world. The sky went dark, the veil of the temple was torn in two, and the Son of God gave up His spirit.',
    moments: [['Gethsemane', 'The garden'], ['Golgotha', 'The cross'], ['The tomb', 'Sealed with a stone']],
    verse: { text: 'It is finished: and he bowed his head, and gave up the ghost.', ref: 'John 19:30' },
    mega: 'Finished', megaSize: '17vw',
  },
  {
    id: 'resurrection', world: 'air', stage: 'left', side: 'right', relic: 'resurrection', numeral: 'IV',
    label: 'IV · The resurrection', title: ['He is', 'Risen.'], cat: 'The third day · An empty tomb',
    body: 'Very early on the first day of the week, the stone was rolled away. The linen clothes lay folded. Death could not hold Him, and everything changed.',
    moments: [['The stone', 'Rolled away'], ['The garden', 'Mary, Rabboni'], ['Emmaus', 'Hearts burning']],
    verse: { text: 'He is not here: for he is risen, as he said. Come, see the place where the Lord lay.', ref: 'Matthew 28:6' },
    mega: 'Risen', megaSize: '25vw', halo: true, clouds: true,
  },
]

export const begin = [
  { tag: 'Read', title: 'Start with John', body: 'The Gospel of John was written "that ye might believe". Twenty-one chapters, one sitting.', cta: 'Read John 1', href: 'https://www.biblegateway.com/passage/?search=John+1&version=KJV' },
  { tag: 'Pray', title: 'Talk to Him', body: 'No special words needed. Jesus said, "Him that cometh to me I will in no wise cast out."', cta: 'A simple prayer', prayer: true },
  { tag: 'Belong', title: 'Find a church', body: 'Faith grows in community. Find a Bible-believing church near you and go this Sunday.', cta: 'Churches near me', href: 'https://www.google.com/maps/search/church+near+me' },
]

export const prayer = 'Lord Jesus, I believe You were born for me, lived for me, died for me and rose again. Forgive my sin. I give You my life. Be my Saviour and my Lord. Amen.'

export const railItems = [
  ['top', 'Jesus'], ['birth', 'Birth'], ['life', 'Life'], ['death', 'Death'],
  ['resurrection', 'Resurrection'], ['way', 'The Way'], ['begin', 'Begin'],
]
