import type { SalesPerformanceType } from '@/views/dashboards/marketing/data'

const download = (data: string, filename: string, type: string) => {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const exportJSON = (data: SalesPerformanceType[]) => {
  const json = JSON.stringify(data, null, 2)
  download(json, 'sales-performance.json', 'application/json')
}

export const exportCSV = (data: SalesPerformanceType[]) => {
  if (!data.length) return
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map((row) => Object.values(row).join(',')).join('\n')
  const csv = `${headers}\n${rows}`
  download(csv, 'sales-performance.csv', 'text/csv')
}

export const exportXML = (data: SalesPerformanceType[]) => {
  const xmlRows = data
    .map(
      (d) => `
  <record>
    ${Object.entries(d)
      .map(([k, v]) => `<${k}>${v}</${k}>`)
      .join('\n    ')}
  </record>`,
    )
    .join('\n')

  const xml = `<records>\n${xmlRows}\n</records>`
  download(xml, 'sales-performance.xml', 'application/xml')
}
