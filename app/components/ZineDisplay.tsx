'use client'

export type TZineSection = {
  type: string;
  content: any;
};


export function ZineDisplay({ sections }: { sections: TZineSection[] }) {
  const banner = sections.find((sec) => sec.type === 'banner');
  const subheading = sections.find((sec) => sec.type === 'subheading');
  const intro = sections.find((sec) => sec.type === 'intro');
  const mainArticle = sections.find((sec) => sec.type === 'mainArticle');
  const opinion = sections.find((sec) => sec.type === 'opinion');
  const funFacts = sections.find((sec) => sec.type === 'funFacts');
  const conclusion = sections.find((sec) => sec.type === 'conclusion');

  return (
    <div className="p-0 space-y-0">
      {/* banner */}
      {banner && (
        <div className="p-6 border-2 border-black bg-black text-white text-center">
          <h1 className="text-4xl font-bold uppercase">{banner.content}</h1>
        </div>
      )}

      {/* subheading */}
      {subheading && (
        <div className="p-6 border-2 border-black">
          <h2 className="text-xl italic mb-4">{subheading.content}</h2>
          {intro && (
            <>
              {intro.content.split('\n').map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </>
          )}
        </div>
      )}

      {/* intro */}

      {/* 2-col layout: main article (2/3), then stack opinion/funFacts/conclusion in (1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* left col = main article */}
        {mainArticle && (
          <div className="p-6 border-2 border-t-0 border-r-0 border-black md:col-span-2">
            <h3 className="uppercase font-bold mb-2">main article</h3>
            {mainArticle.content.split('\n').map((p: string, i: number) => (
              <p key={i} className="mb-4">{p}</p>
            ))}
          </div>
        )}

        {/* right col: stack opinion, funFacts, conclusion */}
        <div className="flex flex-col">
          {opinion && (
            <section className="p-6 border-2 border-t-0 border-black" style={{ backgroundColor: '#ff6ee8' }}>
              <h3 className="uppercase font-bold mb-2">opinion</h3>
              <p>{opinion.content}</p>
            </section>
          )}
          {funFacts && Array.isArray(funFacts.content) && (
            <section className="p-6 border-2 border-t-0 border-black bg-yellow-200">
              <h3 className="uppercase font-bold mb-2">fun facts</h3>
              <ul className="list-disc pl-8">
                {funFacts.content.map((fact: string, i: number) => (
                  <li key={i} className="mb-2">{fact}</li>
                ))}
              </ul>
            </section>
          )}
          {conclusion && (
            <section className="p-6 border-2 border-t-0 border-black" style={{ backgroundColor: '#a8ff9b' }}>
              <h3 className="uppercase font-bold mb-2">conclusion</h3>
              {conclusion.content.split('\n').map((p: string, i: number) => (
                <p key={i} className="mb-4">{p}</p>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
