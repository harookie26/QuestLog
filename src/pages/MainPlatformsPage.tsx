import React from 'react'

export default function MainPlatformsPage() {
  const active = [
    'PC','PlayStation 5','Nintendo Switch','Android','Xbox Series X','Nintendo Switch 2','Arcade Games','Board/Card','Evercade','Macintosh','Playdate','Meta Quest','iOS (iPhone/iPad)','Dedicated Console','Linux','Online/Browser','Roblox','Stadia'
  ]

  const generations: { title: string; items: string[] }[] = [
    {
      title: '2012 - 2019: Eight Generation',
      items: ['3DS','Amazon Fire TV','Oculus Go','Ouya','PlayStation 4','PlayStation Vita','Wii U','Windows Mobile','Xbox One']
    },
    {
      title: '2005 - 2015: Seventh Generation',
      items: ['BlackBerry','DS','Game Wave','Mobile','PlayStation 3','PSP','Wii','Xbox 360']
    },
    {
      title: '1998 - 2009: Sixth Generation',
      items: ['Dreamcast','DVD Player','Game Boy Advance','GameCube','N-Gage','PlayStation 2','Game Boy Color','Neo Geo Pocket']
    },
    {
      title: '1993 - 2001: Fifth Generation',
      items: ['3DO','Amiga CD32','Bandai Pippin','Jaguar','Nintendo 64','Saturn','PlayStation']
    },
    {
      title: '1987 - 1995: Fourth Generation',
      items: ['Acorn Archimedes','Amiga','Genesis','Lynx','Mega Duck','OS/2','Sega 32X']
    },
    {
      title: '1983 - 1990: Third Generation',
      items: ['NES','Master System','Sega SG-1000','Colecovision','Atari 7800','Commodore 64']
    },
    {
      title: '1976 - 1983: Second Generation',
      items: ['Atari 2600','Intellivision','Vectrex','Magnavox Odyssey 2','ColecoVision']
    },
    {
      title: '1972-1977: First Generation',
      items: ['Coleco Telstar Arcade','Commodore PET','Odyssey','Pinball']
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-violet-900 mb-4">Active Platforms</h2>
      <div className="bg-violet-100/60 border border-violet-300 p-4 rounded mb-6">
        <ul className="flex flex-wrap gap-3 text-sm text-violet-800">
          {active.map((a) => (
            <li key={a} className="w-auto list-none">
              <a href="#" className="px-2 py-1 hover:underline">{a}</a>
            </li>
          ))}
        </ul>
      </div>

      {generations.map((g) => (
        <section key={g.title} className="mb-6">
          <h3 className="text-lg font-extrabold text-violet-900 mb-2">{g.title}</h3>
          <div className="border-t border-violet-300" />
          <div className="bg-violet-100/60 border border-violet-300 p-4 mt-3 rounded">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-violet-800">
              {g.items.map((it) => (
                <li key={it}>
                  <a href="#" className="hover:underline">{it}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  )
}
