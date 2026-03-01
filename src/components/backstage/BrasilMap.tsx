'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export interface StateData {
  estado: string
  count: number
  regiao: string
}

// Coordenadas aproximadas das capitais de cada estado
const STATE_COORDS: Record<string, [number, number]> = {
  AC: [-9.97, -67.81], AL: [-9.67, -35.74], AM: [-3.12, -60.02],
  AP: [0.03,  -51.07], BA: [-12.97,-38.50], CE: [-3.72, -38.54],
  DF: [-15.77,-47.93], ES: [-20.31,-40.34], GO: [-16.68,-49.25],
  MA: [-2.53, -44.30], MG: [-19.92,-43.94], MS: [-20.45,-54.62],
  MT: [-15.60,-56.10], PA: [-1.45, -48.50], PB: [-7.12, -34.86],
  PE: [-8.05, -34.88], PI: [-5.09, -42.80], PR: [-25.43,-49.27],
  RJ: [-22.91,-43.17], RN: [-5.79, -35.21], RO: [-8.76, -63.90],
  RR: [2.82,  -60.67], RS: [-30.03,-51.22], SC: [-27.60,-48.55],
  SE: [-10.91,-37.07], SP: [-23.55,-46.63], TO: [-10.24,-48.35],
}

interface Props {
  data: StateData[]
  height?: number
}

export default function BrasilMap({ data, height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let aborted = false

    import('leaflet').then(L => {
      if (aborted || !containerRef.current || mapRef.current) return

      // Apaga _leaflet_id residual que o StrictMode deixa após cleanup
      const el = containerRef.current as unknown as { _leaflet_id?: number }
      if (el._leaflet_id) delete el._leaflet_id

      const map = L.map(containerRef.current, {
        center: [-14, -52],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      })
      mapRef.current = map

      // OSM tiles — igual ao Power BI
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 10,
      }).addTo(map)

      // Círculos por estado
      const maxCount = Math.max(...data.map(d => d.count), 1)
      data.forEach(d => {
        const coords = STATE_COORDS[d.estado?.toUpperCase()]
        if (!coords) return

        const radius = 5 + (d.count / maxCount) * 18

        L.circleMarker(coords, {
          radius,
          color: '#1A9E93',
          fillColor: '#2BBFB3',
          fillOpacity: 0.75,
          weight: 1.5,
        })
          .addTo(map)
          .bindTooltip(
            `<strong>${d.estado}</strong><br/>${d.count.toLocaleString('pt-BR')} tutores`,
            { direction: 'top', className: 'bpet-tooltip' }
          )
      })
    })

    return () => {
      aborted = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [data])

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          height,
          width: '100%',
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      />
      <style>{`
        .bpet-tooltip {
          background: #1A2E2E;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          padding: 4px 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,.25);
        }
        .bpet-tooltip::before { display: none; }
        .leaflet-attribution-flag { display: none !important; }
      `}</style>
    </div>
  )
}
