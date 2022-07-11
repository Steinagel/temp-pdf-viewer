import { useMemo, useState } from 'react'
import randomColor from 'randomcolor'

import {
  Document,
  Page,
  View,
  StyleSheet,
  PDFViewer,
  Canvas
} from '@react-pdf/renderer'

import { data } from './api/data/index.js'

// const font = 'Times-Roman'
const font = 'Courier'

export default function BasicDocument() {
  const [selectedFile, setSelectedFile] = useState(data.fileList[0])
  const [selectedVersion, setSelectedVersion] = useState('new')

  const extractedData = data[selectedFile][selectedVersion]
  const maxW = data[selectedFile].res.w
  const maxH = data[selectedFile].res.h
  const pages = data[selectedFile].pages
  console.log(extractedData)

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
    canvas: {
      backgroundColor: "transparent",
      width: maxW,
      height: maxH,
    }
  }), [])

  const renderPol = (painterObject, obj, page) => {
    if (!(obj.Page === page)) return

    const type = obj.BlockType

    if (!showWord && type === 'WORD') return
    if (!showLine && type === 'LINE') return
    if (!showPage && type === 'PAGE') return

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
      <>
        <Page size={{ width: maxW, height: maxH }} style={pdfStyles.page}>
          <View style={pdfStyles.section}>
          <Canvas
            style={pdfStyles.canvas}
            paint={
              (painterObject) => {
                extractedData.map(obj => {
                  renderPol(painterObject, obj, p)
                })
              }
            }
          />
          </View>
        </Page>
      </>
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
      </div>
      <br />
      <div style={{width: '48%'}}>
        <label>
          <input
            type="radio"
            checked={selectedVersion === 'old'}
            value="old"
            onChange={e => setSelectedVersion('old')}
          />
          old
        </label>
        <label>
          <input
            type="radio"
            checked={selectedVersion === 'new'}
            value="new"
            onChange={e => setSelectedVersion('new')}
          />
          new
        </label>
      </div>
      <br />
      <PDFViewer style={pdfStyles.viewer}>
        <Document>
          {PageComponentList}
          {/* <Page size={{ width: maxW, height: maxH }} style={pdfStyles.page}>
            <View style={pdfStyles.section}>
            <Canvas
              style={pdfStyles.canvas}
              paint={
                (painterObject) => {
                  extractedData.map(obj => {
                    renderPol(painterObject, obj, 1)
                  })
                }
              }
            />
            </View>
          </Page>
          <Page size={{ width: maxW, height: maxH }} style={pdfStyles.page}>
            <View style={pdfStyles.section}>
            <Canvas
              style={pdfStyles.canvas}
              paint={
                (painterObject) => {
                  extractedData.map(obj => {
                    renderPol(painterObject, obj, 2)
                  })
                }
              }
            />
            </View>
          </Page> */}
          {/* <Page size={{ width: maxW, height: maxH }} style={pdfStyles.page}>
            <View style={pdfStyles.section}>
            <Canvas
              style={pdfStyles.canvas}
              paint={
                (painterObject) => {
                  data.map(obj => {
                    renderPol(painterObject, obj, 3)
                  })
                }
              }
            />
            </View>
          </Page> */}
          {/* <Page size={{ width: maxW, height: maxH }} style={pdfStyles.page}>
            <View style={pdfStyles.section}>
            <Canvas
              style={pdfStyles.canvas}
              paint={
                (painterObject) => {
                  data.map(obj => {
                    renderPol(painterObject, obj, 4)
                  })
                }
              }
            />
            </View>
          </Page> */}
        </Document>
      </PDFViewer>
    </div>
  )
}
