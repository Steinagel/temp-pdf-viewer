import { useState, useEffect } from 'react'
import styles from '../styles/Home.module.css'
import { Document, Page, pdfjs } from 'react-pdf'
import useDebounce from './hooks/useDebounce'

import _pdfjsWorker from '../pdf-worker'
// const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.js');

pdfjs.GlobalWorkerOptions.workerSrc = _pdfjsWorker

export default function PDFViewer({ onDocumentLoadSuccess, file, pages, setDimensions, setFonts }) {
  const [sizes, setSizes] = useState([])
  const [fonts, setPageFonts] = useState([])

  const debouncedSizes = useDebounce(sizes, 500)
  const debouncedFonts = useDebounce(fonts, 500)

  useEffect(() => {
    setDimensions(debouncedSizes)
    setFonts(debouncedFonts)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSizes, debouncedFonts])

  return (
    <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className={styles.pdf}>
      {Array.from({ length: pages }, (_, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          className={styles.page}
          onLoadSuccess={async (page) => {
            const { styles } = await page.getTextContent()
            Object.entries(styles).forEach(([, style]) => {
              setPageFonts(p => p.includes(style.fontFamily) ? p : [...p, style.fontFamily])
            })
            setSizes(p => [...p, {maxW: page.width, maxH: page.height }])
          }}
        />
      ))}
    </Document>
  )
}
