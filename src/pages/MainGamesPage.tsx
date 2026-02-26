import React from 'react'

export default function MainGamesPage() {
  const newReleases = [
    { title: 'Code Vein II', platforms: ['PS5', 'PC', 'XBSX'] },
    { title: 'Dragon Quest VII Reimagined', platforms: ['NS2', 'PS5', 'NS', 'XBSX', 'PC'] },
    { title: 'Nioh 3', platforms: ['PS4', 'XONE', 'PC', 'PS5', 'XBSX', 'NS2'] },
    { title: 'Genshin Impact', platforms: ['PS4', 'PC', 'PS5', 'AND', 'IOS', 'NS', 'XBSX'] },
  ]

  const popular = [
    'The Elder Scrolls V: Skyrim',
    'Fallout: New Vegas',
    'Fallout 4',
    'Genshin Impact',
    'Red Dead Redemption 2',
    'World of Warcraft',
    'Fallout 3',
    'Elden Ring',
    'Pokemon HeartGold/SoulSilver Version',
    'The Witcher 3: Wild Hunt',
  ]

  const byPlatform = [
    'Fallout: New Vegas',
    'Fallout 4',
    'The Elder Scrolls V: Skyrim',
    'World of Warcraft',
    'Genshin Impact',
    'Red Dead Redemption 2',
    'League of Legends',
    'The Elder Scrolls V: Skyrim',
    'The Witcher 3: Wild Hunt',
    'Pokemon HeartGold Version',
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-violet-900 mb-3">Popular New Releases</h2>
        <div className="border-t border-violet-300" />

        <div className="mt-4 space-y-2">
          {newReleases.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-violet-100/60 rounded shadow-sm">
              <div className="flex items-center gap-4 p-3">
                <div className="w-12 h-12 bg-violet-200 rounded-sm flex items-center justify-center">🎮</div>
                <div>
                  <div className="font-semibold text-violet-900">{r.title}</div>
                  <div className="text-xs text-violet-700 mt-1">
                    {r.platforms.map((p, idx) => (
                      <span key={idx} className="mr-2 underline decoration-dotted">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 text-sm">
                <a className="text-violet-800 underline" href="#">Message Board</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold text-violet-900 mb-2">Popular Games</h3>
          <div className="border-t border-violet-300" />
          <ol className="mt-3 space-y-1">
            {popular.map((p, idx) => (
              <li key={p} className="flex items-center bg-violet-100/60 p-3 rounded">
                <div className="w-8 text-center font-bold text-violet-800">{idx + 1}</div>
                <div className="w-12 h-12 bg-violet-200 mx-3 rounded-sm flex items-center justify-center">🖼️</div>
                <div>
                  <div className="font-semibold text-violet-900">{p}</div>
                  <div className="text-xs text-violet-700">{2010 + (idx % 13)}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-2 text-sm">
            <a className="text-violet-700 underline" href="#">See the Top 100 &gt;&gt;</a>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-violet-900 mb-2">Most Popular Games by Platform</h3>
          <div className="border-t border-violet-300" />
          <ol className="mt-3 space-y-1">
            {byPlatform.map((p, idx) => (
              <li key={p + idx} className="flex items-center bg-violet-100/60 p-3 rounded">
                <div className="w-8 text-center font-bold text-violet-800">{idx + 1}</div>
                <div className="w-12 h-12 bg-violet-200 mx-3 rounded-sm flex items-center justify-center">🖼️</div>
                <div>
                  <div className="font-semibold text-violet-900">{p}</div>
                  <div className="text-xs text-violet-700">PC</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-2 text-sm">
            <a className="text-violet-700 underline" href="#">See the Top 100 &gt;&gt;</a>
          </div>
        </div>
      </section>
    </div>
  )
}
