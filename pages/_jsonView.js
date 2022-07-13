import { useState, useEffect } from 'react'
import ReactJsonPretty from 'react-json-pretty'
import InputRange from 'react-input-range'
import useDebounce from './_useDebounce'
import 'react-input-range/lib/css/index.css'

export default function JsonView({ json: jsonRes }) {
  const [len, setLen] = useState(1)
  const [range, setRange] = useState({
    min: 0,
    max: len
  })

  useEffect(() => {
    if (!jsonRes) return

    if (len !== jsonRes.length) {
      setRange({
        min: 0,
        max: jsonRes.length
      })
      setLen(jsonRes.length)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonRes])

  const data = useDebounce(jsonRes && jsonRes.length ? jsonRes.slice(range.min, range.max) : [], 500)

  return (
    <div style={{width: '80vw'}}>
        <br />
        <br />
        {jsonRes
          ? <div>
            {
              jsonRes.length === undefined
                ? 'Not an array'
                : <>
                  <InputRange
                    minValue={0}
                    maxValue={len}
                    onChange={({min, max}) => {
                      setRange({
                        min: min < 0 ? 0 : min,
                        max: max > jsonRes.length ? jsonRes.length : max
                      })
                    }}
                    step={5}
                    value={range}
                  />
                  <br />
                  <ReactJsonPretty data={data}/>
                </>
            }
          </div> : '...'}
    </div>
  )
}
