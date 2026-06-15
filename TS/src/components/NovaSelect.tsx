import Select, { type StylesConfig } from 'react-select'

export interface Opcion {
  value: string
  label: string
}

type Props = {
  options: Opcion[]
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  isMulti?: boolean
  minWidth?: number
}

// Estilos alineados al look SmartAdmin (form-control: radio 8px, borde gris, foco azul de marca).
const estilos = (minWidth: number): StylesConfig<Opcion, true> => ({
  control: (base, state) => ({
    ...base,
    minWidth,
    minHeight: 31,
    fontSize: 13,
    borderRadius: 8,
    borderColor: state.isFocused ? '#2563eb' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 0.15rem rgba(37,99,235,.20)' : 'none',
    '&:hover': { borderColor: '#cbd5e1' },
  }),
  valueContainer: (base) => ({ ...base, padding: '1px 8px' }),
  placeholder: (base) => ({ ...base, color: '#94a3b8' }),
  indicatorsContainer: (base) => ({ ...base, '& > div': { padding: 4 } }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: '#e2e8f0' }),
  menu: (base) => ({ ...base, fontSize: 13, zIndex: 40, borderRadius: 8, overflow: 'hidden' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : '#fff',
    color: state.isSelected ? '#fff' : '#334155',
    cursor: 'pointer',
  }),
  multiValue: (base) => ({ ...base, backgroundColor: '#e0e7ff', borderRadius: 5 }),
  multiValueLabel: (base) => ({ ...base, color: '#3730a3', fontWeight: 600 }),
  multiValueRemove: (base) => ({ ...base, color: '#3730a3', ':hover': { backgroundColor: '#c7d2fe', color: '#1e1b4b' } }),
})

const NovaSelect = ({ options, value, onChange, placeholder, isMulti = true, minWidth = 150 }: Props) => {
  const seleccion = options.filter((o) => value.includes(o.value))
  return (
    <Select
      isMulti={isMulti as true}
      isSearchable
      options={options}
      value={seleccion}
      onChange={(vals) => onChange((vals as Opcion[]).map((v) => v.value))}
      placeholder={placeholder}
      noOptionsMessage={() => 'Sin opciones'}
      styles={estilos(minWidth)}
      classNamePrefix="nova-select"
    />
  )
}

export default NovaSelect
