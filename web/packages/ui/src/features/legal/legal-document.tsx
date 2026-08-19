/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type LegalItem = {
  label?: string
  text: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type LegalSection = {
  heading: string
  paragraphs?: string[]
  items?: LegalItem[]
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type LegalDoc = {
  title: string
  intro: string[]
  sections: LegalSection[]
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type LegalDocumentProps = {
  doc: LegalDoc
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function LegalDocument({ doc }: LegalDocumentProps) {
  return (
    <article className='space-y-8'>
      <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
        {doc.title}
      </h1>

      <div className='space-y-4'>
        {doc.intro.map((paragraph, index) => (
          <p
            key={index}
            className='text-muted-foreground text-sm leading-relaxed'
          >
            {paragraph}
          </p>
        ))}
      </div>

      {doc.sections.map((section, index) => (
        <section key={index} className='space-y-3'>
          <h2 className='text-lg font-semibold tracking-tight'>
            {section.heading}
          </h2>
          {section.paragraphs?.map((paragraph, pIndex) => (
            <p
              key={pIndex}
              className='text-muted-foreground text-sm leading-relaxed'
            >
              {paragraph}
            </p>
          ))}
          {section.items && (
            <ul className='list-disc space-y-2 ps-5'>
              {section.items.map((item, iIndex) => (
                <li
                  key={iIndex}
                  className='text-muted-foreground text-sm leading-relaxed'
                >
                  {item.label && (
                    <span className='text-foreground font-medium'>
                      {item.label}{' '}
                    </span>
                  )}
                  {item.text}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  )
}
