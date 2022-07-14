import { useMemo, useState } from 'react'
import randomColor from 'randomcolor'
import Select from 'react-select'

import {
  Document,
  Page,
  View,
  StyleSheet,
  PDFViewer,
  Canvas
} from '@react-pdf/renderer'

const fontsOptions = [
  'Courier',
  'Courier-Bold',
  'Courier-Oblique',
  'Courier-BoldOblique',
  'Helvetica',
  'Helvetica-Bold',
  'Helvetica-Oblique',
  'Helvetica-BoldOblique',
  'Symbol',
  'Times-Roman',
  'Times-Bold',
  'Times-Italic',
  'Times-BoldItalic'
]

export default function AnalysisView({ pages = 0, json = [], fonts, dimensions }) {

  const [font, setFont] = useState(fontsOptions[0])

  const [showWord, setShowWord] = useState(false)
  const [showLine, setShowLine] = useState(true)
  const [showPage, setShowPage] = useState(false)

  const handleShowWordChange = () => {
    setShowWord(p => !p)
  }
  const handleShowLineChange = () => {
    setShowLine(p => !p)
  }
  const handleShowPageChange = () => {
    setShowPage(p => !p)
  }

  const [showPolygon, setShowPolygon] = useState(true)
  const [showBoundingBox, setShowBoundingBox] = useState(false)

  const handleShowPolygon = () => {
    setShowPolygon(p => !p)
  }
  const handleShowBoundingBox = () => {
    setShowBoundingBox(p => !p)
  }

  const [inverted, setInverted] = useState(false)

  const handleInverted = () => {
    setInverted(p => !p)
  }

  const pdfStyles = useMemo(() => StyleSheet.create({
    page: {
      backgroundColor: "white",
      color: "white",
    },
    section: {
      margin: 0,
      padding: 0,
    },
    viewer: {
      width: window.innerWidth * 0.9,
      height: window.innerHeight * 0.92,
    },
    canvas: dimensions.map((dimension, index) => ({
      backgroundColor: "transparent",
      width: dimension.maxW,
      height: dimension.maxH,
      key: index
    }))
  }), [dimensions])

  const renderPol = (painterObject, obj, page) => {
    if (!(obj.Page === page)) return

    const type = obj.BlockType

    if (!showWord && type === 'WORD') return
    if (!showLine && type === 'LINE') return
    if (!showPage && type === 'PAGE') return

    const { maxW, maxH } = dimensions[page - 1]

    if (showPolygon) {
      const polygon = obj.Geometry.Polygon
      const text = obj.Text
      if (text) {
        if (inverted) {
          painterObject
            .save()
            .lineWidth(0)
            .moveTo(polygon[0].X * maxW, polygon[0].Y * maxH)
            .lineTo(polygon[1].X * maxW, polygon[1].Y * maxH)
            .lineTo(polygon[2].X * maxW, polygon[2].Y * maxH)
            .lineTo(polygon[3].X * maxW, polygon[3].Y * maxH)
            .lineTo(polygon[0].X * maxW, polygon[0].Y * maxH)
            .font(font)
            .fontSize((polygon[3].Y - polygon[0].Y) * maxH)
            .text(text, polygon[0].X * maxW, polygon[0].Y * maxH)
            .stroke(randomColor())
        } else {
          painterObject
            .save()
            .lineWidth(0)
            .moveTo(polygon[0].X * maxW, polygon[0].Y * maxH)
            .lineTo(polygon[1].X * maxW, polygon[1].Y * maxH)
            .lineTo(polygon[2].X * maxW, polygon[2].Y * maxH)
            .lineTo(polygon[3].X * maxW, polygon[3].Y * maxH)
            .lineTo(polygon[0].X * maxW, polygon[0].Y * maxH)
            .font(font)
            .fontSize((polygon[0].Y - polygon[3].Y) * maxH)
            .text(text, polygon[3].X * maxW, polygon[3].Y * maxH)
            .stroke(randomColor())
        }
        } else {
        painterObject
          .save()
          .lineWidth(0)
          .moveTo(polygon[0].X * maxW, polygon[0].Y * maxH)
          .lineTo(polygon[1].X * maxW, polygon[1].Y * maxH)
          .lineTo(polygon[2].X * maxW, polygon[2].Y * maxH)
          .lineTo(polygon[3].X * maxW, polygon[3].Y * maxH)
          .lineTo(polygon[0].X * maxW, polygon[0].Y * maxH)
          .stroke(randomColor())
      }
    }
    if (showBoundingBox) {
      const boundingBox = obj.Geometry.BoundingBox
      const text = obj.Text
      if (text) {
        painterObject
          .save()
          .lineWidth(0)
          .moveTo(boundingBox.Left * maxW, boundingBox.Top * maxH)
          .lineTo((boundingBox.Left + boundingBox.Width) * maxW, boundingBox.Top * maxH)
          .lineTo((boundingBox.Left + boundingBox.Width) * maxW, (boundingBox.Top + boundingBox.Height) * maxH)
          .lineTo(boundingBox.Left * maxW, (boundingBox.Top + boundingBox.Height) * maxH)
          .lineTo(boundingBox.Left * maxW, boundingBox.Top * maxH)
          .font(font)
          .fontSize(boundingBox.Height * maxH)
          .text(text, boundingBox.Left * maxW, boundingBox.Top * maxH)
          .stroke(randomColor())
        } else {
        painterObject
          .save()
          .lineWidth(0)
          .moveTo(boundingBox.Left * maxW, boundingBox.Top * maxH)
          .lineTo((boundingBox.Left + boundingBox.Width) * maxW, boundingBox.Top * maxH)
          .lineTo((boundingBox.Left + boundingBox.Width) * maxW, (boundingBox.Top + boundingBox.Height) * maxH)
          .lineTo(boundingBox.Left * maxW, (boundingBox.Top + boundingBox.Height) * maxH)
          .lineTo(boundingBox.Left * maxW, boundingBox.Top * maxH)
          .stroke(randomColor())
      }
    }
  }

  const PageComponentList = []
  for (let p = 1; p <= pages; p++) {
    PageComponentList.push(
      <Page key={p} size={{ width: dimensions[p - 1].maxW, height: dimensions[p - 1].maxH }} style={pdfStyles.page}>
        <View style={pdfStyles.section}>
        <Canvas
          style={pdfStyles.canvas[p - 1]}
          paint={
            (painterObject) => {
              json.map(obj => {
                renderPol(painterObject, obj, p)
              })
            }
          }
        />
        </View>
      </Page>
    )
  }

  return (
    <div>
      <div style={{width: '48%'}}>
        <label>
          <input
            type="checkbox"
            checked={showWord}
            onChange={handleShowWordChange}
          />
          Word
        </label>
        <label>
          <input
            type="checkbox"
            checked={showLine}
            onChange={handleShowLineChange}
          />
          Line
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPage}
            onChange={handleShowPageChange}
          />
          Page
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={showPolygon}
            onChange={handleShowPolygon}
          />
          Polygon
        </label>
        <label>
          <input
            type="checkbox"
            checked={showBoundingBox}
            onChange={handleShowBoundingBox}
          />
          Bounding Box
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            disabled={(showBoundingBox && !showPolygon)}
            checked={!(showBoundingBox && !showPolygon) && inverted}
            onChange={handleInverted}
          />
          Invert
        </label>
        <br />
        <br />
        <Select
          placeholder="Select the font"
          defaultValue={fontsOptions[0]}
          name="font-select"
          options={fontsOptions.map(i => ({value: i, label: i}))}
          value={{value: font, label: font}}
          onChange={option => setFont(option.value)}
        />
        <br />
      </div>
      <br />
      <PDFViewer style={pdfStyles.viewer}>
        <Document>
          {PageComponentList}
        </Document>
      </PDFViewer>
    </div>
  )
}
